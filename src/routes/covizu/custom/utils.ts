export const checkIfNewData = (current: string, stored: string) => {
  const versionCurrent = new Date(current);
  const versionStored = new Date(stored);
  return versionCurrent > versionStored;
};

export const getDataPaths = (dataVersion: string) => ({
  clustersPath: ['clusters', dataVersion, 'json'].join('.'),
  dbstatsPath: ['dbstats', dataVersion, 'json'].join('.'),
  timetreePath: ['timetree', dataVersion, 'nwk'].join('.'),
});
