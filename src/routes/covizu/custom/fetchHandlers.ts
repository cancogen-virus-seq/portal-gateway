// covizu customizations for virusseq

import axios from 'axios';
import urlJoin from 'url-join';
import getAppConfig from '../../../config/global';
import { ClusterItem } from './types';

const config = getAppConfig();

// TODO - error handling - wrap this in a try/catch
// have catch return next(error)
const axiosCovizu = axios.create({
  headers: {
    'Cache-Control': 'no-cache',
    Expires: '0',
    Pragma: 'no-cache',
  },
  method: 'GET',
});

// setup - find out the latest version of the data

const dataUrlBase = urlJoin(config.covizu.dataUrl, config.covizu.version);
const fileListUrl = `${config.covizu.fileListUrl}?format=json&prefix=${config.covizu.version}/clusters.20`;
const clustersFilenameTest =
  /^(\d+\.){2}\d+\/(clusters\.)\d{4}(-\d{2}){2}(\.json)$/;
const dateTest = /\d{4}(-\d{2}){2}/;

export const getDataVersion = async () => {
  // assume that timetree, dbstats, and clusters files
  // all have the same date in the filename.
  // only fetch one file to get the date.
  // returns max 1000 files.
  const { data: fileList } = await axiosCovizu.get(fileListUrl);
  const clusterNames = fileList
    .map((file: ClusterItem) => file.name)
    .filter((clusterName: string) => clustersFilenameTest.test(clusterName))
    .sort();
  const latestDate =
    clusterNames[clusterNames.length - 1].match(dateTest)[0] || '';

  return latestDate;
};

export const fetchCovizu = async (path: string) => {
  const url = urlJoin(dataUrlBase, path);
  console.log({ url });
  try {
    const res = await axiosCovizu({
      url,
    });
    return res.data;
  } catch (e) {
    console.log('🔥', dataUrlBase);
    console.error('covizu error:', e);
  }
};
