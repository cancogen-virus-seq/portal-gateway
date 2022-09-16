import getAppConfig from '@/config/global';
import logger from '@/logger';

import { fetchCovizu, getDataVersion } from './fetchHandlers';
import { Clusters, DataVersion, Dbstats, StoredData, StoredDataTypes, Timetree } from './types';
import {
  parse_clusters,
  index_accessions,
  index_lineage,
  map_clusters_to_tips,
} from '../server/parseCluster';
import { readTree } from '../server/phylo';
import { checkIfNewData, getDataPaths } from './utils';
import { normalize } from '../server/utils';
import sendSlackNotification from './sendSlackNotification';

const { podName } = getAppConfig();

// cache version & data
export const storedData: StoredData = {
  accn_to_cid: undefined,
  beaddata: undefined,
  clusters: undefined,
  dataVersion: undefined,
  dbstats: undefined,
  df: undefined,
  lineage_to_cid: undefined,
  searchSuggestions: undefined,
  timetree: undefined,
  tips: undefined,
};

export enum UpdateDataArg {
  API_REQUEST = 'API_REQUEST',
  MISSING_DATA = 'MISSING_DATA',
  SERVER_START = 'SERVER_START',
}

const updateMessage: { [K in UpdateDataArg]: string } = {
  API_REQUEST: '/update request',
  MISSING_DATA: 'missing data',
  SERVER_START: 'server started',
};

export async function updateData(arg: UpdateDataArg) {
  logger.debug('Running Covizu updateData...');
  const currentDataVersion = (await getDataVersion()) as DataVersion;
  const shouldUpdateData =
    storedData.dataVersion === undefined ||
    checkIfNewData(currentDataVersion, storedData.dataVersion);

  if (shouldUpdateData) {
    logger.debug('Pod will update Covizu data.');

    try {
      storedData.dataVersion = currentDataVersion;
      const { clustersPath, dbstatsPath, timetreePath } = getDataPaths(storedData.dataVersion);

      // get remotely hosted data
      storedData.dbstats = (await fetchCovizu(dbstatsPath)) as Dbstats;
      storedData.clusters = (await fetchCovizu(clustersPath)) as Clusters;
      storedData.timetree = (await fetchCovizu(timetreePath)) as Timetree;

      // process data
      logger.info('Processing new Covizu data...');
      storedData.accn_to_cid = await index_accessions(storedData.clusters);
      storedData.beaddata = await parse_clusters(storedData.clusters);
      storedData.df = await readTree(storedData.timetree);
      storedData.lineage_to_cid = await index_lineage(storedData.clusters);
      storedData.searchSuggestions = Object.keys(storedData.accn_to_cid)
        .sort()
        .concat(Object.keys(storedData.lineage_to_cid).sort())
        .map((accn) => [normalize(accn), accn]);
      storedData.tips = await map_clusters_to_tips(storedData.df, storedData.clusters);

      logger.info('Finished processing Covizu data.');
    } catch (err) {
      logger.error(`Error processing the Covizu data: ${err}`);
    }
  }

  await sendSlackNotification({
    message: `Covizu data ${shouldUpdateData ? `updated successfully` : 'already up-to-date'}${
      podName ? ` (pod: ${podName})` : ''
    }: ${updateMessage[arg]}`,
    dataVersion: storedData.dataVersion,
  });
}

export async function getData(dataType: StoredDataTypes) {
  if (storedData[dataType] === undefined) {
    await updateData(UpdateDataArg.MISSING_DATA);
  }

  return storedData[dataType] as StoredData[typeof dataType];
}
