// data

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
  accn_to_cid?: any;
  beaddata?: any;
  clusters?: Clusters;
  dataVersion?: DataVersion;
  dbstats?: Dbstats;
  df?: any;
  lineage_to_cid?: any;
  searchSuggestions?: any;
  timetree?: Timetree;
  tips?: any;
};

export type StoredDataTypes = keyof StoredData;
