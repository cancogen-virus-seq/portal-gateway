import { fetchCovizu, getDataVersion } from './fetchHandlers';
import {
  Clusters,
  DataVersion,
  Dbstats,
  StoredData,
  StoredDataTypes,
  Timetree,
} from './types';
import {
  parse_clusters,
  index_accessions,
  index_lineage,
  map_clusters_to_tips,
} from '../server/parseCluster';
import { readTree } from '../server/phylo';
import { checkIfNewData, getDataPaths } from './utils';
import { normalize } from '../server/utils';

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

// fetch data on startup
updateData(); // TODO rerun this at intervals

async function updateData() {
  const currentDataVersion = (await getDataVersion()) as DataVersion;
  const shouldUpdateData =
    storedData.dataVersion === undefined ||
    checkIfNewData(currentDataVersion, storedData.dataVersion);

  if (shouldUpdateData) {
    storedData.dataVersion = currentDataVersion;
    const { clustersPath, dbstatsPath, timetreePath } = getDataPaths(
      storedData.dataVersion,
    );

    // get remotely hosted data
    storedData.dbstats = (await fetchCovizu(dbstatsPath)) as Dbstats;
    storedData.clusters = (await fetchCovizu(clustersPath)) as Clusters;
    storedData.timetree = (await fetchCovizu(timetreePath)) as Timetree;

    // process data
    storedData.accn_to_cid = await index_accessions(storedData.clusters);
    storedData.beaddata = await parse_clusters(storedData.clusters);
    storedData.df = await readTree(storedData.timetree);
    storedData.lineage_to_cid = await index_lineage(storedData.clusters);
    storedData.searchSuggestions = Object.keys(storedData.accn_to_cid)
      .sort()
      .concat(Object.keys(storedData.lineage_to_cid).sort())
      .map((accn) => [normalize(accn), accn]);
    storedData.tips = await map_clusters_to_tips(
      storedData.df,
      storedData.clusters,
    );
  }
}

export async function getData(dataType: StoredDataTypes) {
  if (storedData[dataType] === undefined) {
    await updateData();
  }
  return storedData[dataType] as StoredData[typeof dataType];
}
