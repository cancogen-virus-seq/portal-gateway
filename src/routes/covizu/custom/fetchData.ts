import { fetchCovizu, getDataVersion } from './fetchHandlers';
import {
  Dbstats,
  DataVersion,
  Timetree,
  Clusters,
  StoredData,
  DataTypes,
} from './types';
import { checkIfNewData, getDataPaths } from './utils';

// cache version & data
export const storedData: StoredData = {
  dataVersion: undefined,
  timetree: undefined,
  dbstats: undefined,
  clusters: undefined,
};

// fetch data on startup
updateData();

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

    storedData.dbstats = (await fetchCovizu(dbstatsPath)) as Dbstats;
    storedData.clusters = (await fetchCovizu(clustersPath)) as Clusters;
    storedData.timetree = (await fetchCovizu(timetreePath)) as Timetree;
  }
}

export async function getCovizuData(dataType: DataTypes) {
  if (storedData[dataType] === undefined) {
    await updateData();
  }
  return storedData[dataType] as StoredData[typeof dataType];
}
