/*
 * Copyright (c) 2022 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Uuid } from '@elastic/elasticsearch/api/types';

import logger from '@/logger';
import apiSQL from '@/utils/db/apiSQL';
import singularitySQL from '@/utils/db/singularitySQL';
import songSQL from '@/utils/db/songSQL';
import { fieldnamesCamelToSnake, fieldnamesSnakeToCamel } from '@/utils/fieldnameTransforms';

import { PaginationParamsInterface, ReleaseArchiveInterface, ReleaseDataInterface } from './types';

const sqlNoop = apiSQL``;

const analysisQueries = (start: string, end: string): Record<string, any> => ({
	submitted: songSQL`
		select count(*)
			from analysis
			where state = 'PUBLISHED'
			-- created after the previous release
			and created_at > (to_timestamp (${start}) + '4 hours')
			-- and updated up to the desired release
			and updated_at < (to_timestamp (${end}) + '4 hours')
	`,
	supressed: songSQL`
		select count(*)
			from analysis
			where state= 'SUPPRESSED'
			-- created after the previous release
			and created_at < (to_timestamp (${start}) + '4 hours')
			-- and updated at some point after creation
			and updated_at > (to_timestamp (${start}) + '4 hours')
			-- yet updated again up to the desired release
			and updated_at < (to_timestamp (${end}) + '4 hours')
	`,
	updated: songSQL`
		select count(*)
			from analysis
			where state = 'PUBLISHED'
			-- created before the previous release
			and created_at < (to_timestamp (${start}) + '4 hours')
			-- and updated at some point after creation
			and updated_at > (to_timestamp (${start}) + '4 hours')
			-- yet updated again up to the desired release
			and updated_at < (to_timestamp (${end}) + '4 hours')
	`,
});

export const getAnalysesByTimeRange =
	(startTimestamp: string, endTimeStamp: string) => async (status: string) => {
		try {
			const results = await analysisQueries(startTimestamp, endTimeStamp)?.[status];
			return Number(results?.[0]?.count);
		} catch (err) {
			logger.debug(`Could not retrieve analyses ${status} by release timestamp range`, err);
			return 0;
		}
	};

const getCachedCountData = async ({
	params: {
		createdAfter,
		createdBefore,
		limit,
		offset,
		sortDirection = 'desc',
		sortFieldName = 'releaseTimeUntil',
	} = {},
	releaseId,
}: {
	params?: PaginationParamsInterface;
	releaseId?: Uuid;
} = {}) => {
	try {
		const isDesc = sortDirection?.toLowerCase() === 'desc';
		const cachedCounts = await apiSQL<ReleaseDataInterface[]>`
			select *
			from changelogs
			where status = 'COMPLETE'
			${releaseId ? apiSQL`and id = ${releaseId}` : sqlNoop}
			${createdAfter ? apiSQL`and release_time_until >= ${createdAfter}` : sqlNoop}
			${createdBefore ? apiSQL`and release_time_until <= ${createdBefore}` : sqlNoop}
			order by ${apiSQL(sortFieldName)} ${isDesc ? apiSQL`desc` : apiSQL`asc`}
			${limit ? apiSQL`limit ${limit}` : sqlNoop}
			${offset ? apiSQL`offset ${offset}` : sqlNoop}
		`;

		return cachedCounts;
	} catch (err) {
		logger.debug('Catch in getCachedCountData');
		logger.debug(err);
		logger.error('Could not retrieve cached releases data');
		return [];
	}
};

const persistCountData = async (data: ReleaseDataInterface) => {
	const newCount = fieldnamesCamelToSnake<ReleaseDataInterface>(data);

	return await apiSQL`
		insert into changelogs ${apiSQL(newCount)}
		returning *
	`;
};

export const getReleaseArchivesData = async ({
	params: { createdAfter = 0, createdBefore = 0, limit = 0, offset = 0 } = {},
	releaseId,
}: {
	params?: PaginationParamsInterface;
	releaseId?: Uuid;
} = {}): Promise<{ releases: ReleaseArchiveInterface[]; totalReleases: number }> => {
	// this functionality may be useful later on
	if (releaseId) {
		try {
			const [latestArchive] = await singularitySQL`
				select *
				from archive
				where id = ${releaseId}
			`;
			const [previousArchive] = await singularitySQL`
				select *
				from archive
				where type = 'ALL'
				and created_at < ${latestArchive.created_at}
				and status = 'COMPLETE'
				order by created_at desc
				limit 1
			`;

			return {
				releases: ([latestArchive, previousArchive] as ReleaseArchiveInterface[]).map(
					fieldnamesSnakeToCamel,
				),
				totalReleases: 1,
			};
		} catch (err) {
			logger.debug('Could not retrieve releases data by releaseId', err);
			// throw new Error('Something went wrong retrieving archives by releaseID');
		}
	}

	try {
		const totalReleases = await singularitySQL`
			select count(*)
			from archive
			where type = 'ALL'
			and status = 'COMPLETE'
			${createdAfter ? singularitySQL`and created_at >= ${createdAfter}` : sqlNoop}
			${createdBefore ? singularitySQL`and created_at <= ${createdBefore}` : sqlNoop}
		`;

		const releases = (
			await singularitySQL<ReleaseArchiveInterface[]>`
				select *
				from archive
				where type = 'ALL'
				and status = 'COMPLETE'
				${createdAfter ? singularitySQL`and created_at >= ${createdAfter}` : sqlNoop}
				${createdBefore ? singularitySQL`and created_at <= ${createdBefore}` : sqlNoop}
				order by created_at desc
				${limit ? apiSQL`limit ${limit + 1}` : sqlNoop}
				${offset ? apiSQL`offset ${offset}` : sqlNoop}
			`
		)?.map(fieldnamesSnakeToCamel);

		// else, return all archives
		return {
			releases,
			totalReleases: Number(totalReleases?.[0]?.count),
		};
	} catch (err) {
		logger.debug('Catch in getReleaseArchivesData');
		logger.debug(err);
		logger.error('Could not retrieve releases data');
		return { releases: [], totalReleases: 0 };
	}
};

export const getReleaseCounts = async (
	params: PaginationParamsInterface = {},
	releaseId?: Uuid,
) => {
	// first we grab the cached values, so we won't be recalculating older releases
	// warning: that would break things! changes in Song are only accounted in their latest change date
	const cachedCounts = await getCachedCountData({ params, releaseId });
	const cachedCountsIds = cachedCounts.map(({ id }) => id);

	// now we will gather an array of the release data, from latest to oldest, and the count for them
	const { releases, totalReleases } = await getReleaseArchivesData({ params, releaseId });

	// and this will be an array with the counts for each of them
	await Promise.all(
		releases
			// then filter releases based on cached counts (if cached, take out)
			.filter(({ id }) => !cachedCountsIds.includes(id))
			.map(
				async (
					{ createdAt: endTimestamp, numOfDownloads, numOfSamples, ...release },
				): Promise<ReleaseDataInterface | null> => {
					try {

						// get the index of current release
						const index = releases.findIndex(release => release.id == release.id);
						// skip the last release as it doesn't have a release to be compared with
						if(index  + 1 < releases.length){
							// we do this because we're comparing timestamps of release A vs release B
							// on the first round, we want the release that we didn't include in this array
							const startTimestamp = releases[index + 1].createdAt;
	
							const getAnalysisByStatus = getAnalysesByTimeRange(startTimestamp, endTimestamp);
	
							// calculate the change totals
							const totalSubmitted = await getAnalysisByStatus('submitted');
							const totalSupressed = await getAnalysisByStatus('supressed');
							const totalUpdated = await getAnalysisByStatus('updated');
	
							// and finally provide them
							const releaseWithChangesCounted = {
								...release,
								numOfDownloads: Number(numOfDownloads),
								numOfSamples: Number(numOfSamples),
								releaseTimeFrom: startTimestamp,
								releaseTimeUntil: endTimestamp,
								totalSubmitted,
								totalSupressed,
								totalUpdated,
							};
	
							await persistCountData(releaseWithChangesCounted);
	
							return releaseWithChangesCounted;
						}
						return null;
					} catch (err) {
						logger.debug('Catch in getReleaseCounts');
						logger.debug(err);
						logger.error('Could not persist counts data');
						return null;
					}
				},
			),
	);

	// after calculating all the values, and persisting them into our cache
	// we provide them as the response for consumption
	const countsByRelease = await getCachedCountData({ params, releaseId });

	return { countsByRelease, totalReleases };
};
