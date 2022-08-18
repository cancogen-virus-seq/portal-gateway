import { getDataVersion } from './custom';

type DbStats = {
  lastupdate: string;
  noseqs: number;
  lineages: any;
};

let storedDataVersion: string | undefined = undefined;
let timetree: string | undefined = undefined;
let dbstats: DbStats | undefined = undefined;
let clusters: [] | undefined = undefined;

updateData(); // fetch data on startup

export async function fetchDataVersion(): Promise<string> {
  if (storedDataVersion === undefined) {
    // fetch
    storedDataVersion = 'storedDataVersion stub';
  }
  return storedDataVersion;
}

async function updateData() {
  // no data stored -> fetch files
  // if data -> check S3 data -> if it's newer, fetch -> update stored variables
  // if data & no new data -> do nothing
  // call process data functions
}

export async function getTimetree(): Promise<string> {
  if (timetree === undefined) {
    // fetch
    await updateData();
  }
  return timetree as string;
}

export async function getDbStats(): Promise<DbStats> {
  const dbStatsStub = {
    lastupdate: '',
    noseqs: 0,
    lineages: {},
  };
  if (dbstats === undefined) {
    // fetch
    await updateData();
  }
  return dbstats as DbStats;
}

export async function getClusters(): Promise<any> {
  if (clusters === undefined) {
    // fetch
    await updateData();
  }
  return clusters as [];
}
