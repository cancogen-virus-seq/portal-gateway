import axios from 'axios';
import urlJoin from 'url-join';
import getAppConfig from '../../../config/global';
import sendSlackNotification from './sendSlackNotification';
import { ClusterItem } from './types';

// covizu customizations for virusseq

const config = getAppConfig();

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
const clustersFilenameTest = /^(\d+\.){2}\d+\/(clusters\.)\d{4}(-\d{2}){2}(\.json)$/;
const dateTest = /\d{4}(-\d{2}){2}/;

export const getDataVersion = async () => {
  // fetch a list of files to find out the most recent date,
  // but you only need to fetch one type of file.
  // assume that timetree, dbstats, and clusters files
  // all have the same date in the filename.
  // *** returns max 1000 files ***
  try {
    const { data: fileList } = (await axiosCovizu.get(fileListUrl)) || { data: [] };
    const clusterNames = fileList
      .map((file: ClusterItem) => file.name)
      .filter((clusterName: string) => clustersFilenameTest.test(clusterName))
      .sort();
    const latestDate = clusterNames?.[clusterNames?.length - 1]?.match(dateTest)?.[0] || '';
    return latestDate;
  } catch (e) {
    console.error('Covizu error (getDataVersion):', e);
    await sendSlackNotification({
      message: `Covizu error (getDataVersion): ${e as string}`,
    });
    throw new Error(e as string);
  }
};

export const fetchCovizu = async (path: string) => {
  const url = urlJoin(dataUrlBase, path);
  try {
    const res = await axiosCovizu({
      url,
    });
    return res.data;
  } catch (e) {
    console.error('Covizu error (fetchCovizu):', e);
    await sendSlackNotification({
      message: `Covizu error (fetchCovizu): ${e as string}`,
      version: path.split('/')[0]?.split('.')[1], // get date from path
    });
    throw new Error(e as string);
  }
};
