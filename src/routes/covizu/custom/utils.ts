// *** covizu virusseq version ***
// Increase the version number only for breaking changes,
// that affect the shape of the data provided by the Covizu team.
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
