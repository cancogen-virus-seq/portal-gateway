// *** covizu virusseq version ***
// This version number is used to fetch data that is the correct shape for the current code version.
// Only increment the version number if the data shape changes.
export const COVIZU_VERSION = '1.0.0';

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
