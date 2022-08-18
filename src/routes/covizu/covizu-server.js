const compression = require('compression');
const { utcDate } = require('./server/utils');
const {
  parse_clusters,
  map_clusters_to_tips,
  index_accessions,
  index_lineage,
} = require('./server/parseCluster');
const { readTree } = require('./server/phylo');
// const { dataUrls, fetchCovizu } = requre('./custom');
const { getClusters, getTimetree } = require('./dataFetcher');

// app.use(compression());

// const clusters = await fetchCovizu(dataUrls.clusters);
// const tree = await fetchCovizu(dataUrls.timetree);

// const df = readTree(tree);
// const beaddata = parse_clusters(clusters);
// const tips = await map_clusters_to_tips(df, clusters);
// const accn_to_cid = index_accessions(clusters);
// const lineage_to_cid = index_lineage(clusters);

// // This is a hack to match anything that could be an acc number prefix
// const prefix =
//   /^(E|I|EP|IS|EPI_I|EPI_IS|EPI_ISL_?|EPI_?|ISL_?|[A-Z]\.[1-9]+)$/i;
// const MIN_RESULTS = 10;
// const normalize = (str) => str.replace(/[^a-z0-9]/gi, '').toLowerCase();
// const data = Object.keys(accn_to_cid)
//   .sort()
//   .concat(Object.keys(lineage_to_cid).sort())
//   .map((accn) => [normalize(accn), accn]);

// cache processed data
// check if data version increased not check undefined

async function getDf() {
  const tree = await getTimetree();
  return readTree(tree);
}

async function getBeadData() {
  const clusters = await getClusters();
  const beaddata = parse_clusters(clusters);

  return beaddata;
}

async function getTips() {
  const clusters = await getClusters();
  const df = await getDf();
  const tips = await map_clusters_to_tips(df, clusters);

  return tips;
}

async function getAccnToCid() {
  const clusters = await getClusters();
  const accn_to_cid = index_accessions(clusters);

  return accn_to_cid;
}

async function getLineageToCid() {
  const clusters = await getClusters();
  const lineage_to_cid = index_lineage(clusters);

  return lineage_to_cid;
}

module.exports = {
  getAccnToCid,
  getBeadData,
  getDf,
  getLineageToCid,
  getTips,
};
