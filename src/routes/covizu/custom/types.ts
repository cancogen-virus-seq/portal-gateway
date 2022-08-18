export type ClusterItem = {
  bytes: number;
  content_type: string;
  hash: string;
  last_modified: string;
  name: string;
};

export type DataVersion = string;
export type Timetree = string;
export type Dbstats = {
  lastupdate: string;
  noseqs: number;
  lineages: any;
};
export type Clusters = ClusterItem[];

export type StoredData = {
  clusters?: Clusters;
  dataVersion?: DataVersion;
  dbstats?: Dbstats;
  timetree?: Timetree;
};

export type DataTypes = keyof StoredData;
