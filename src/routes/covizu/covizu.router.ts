import { ErrorRequestHandler, Router } from 'express';
import compression from 'compression';
import { DataVersion, StoredDataTypes } from './custom/types';
import { getDataVersion } from './custom/fetchHandlers';
import { getData } from './custom/fetchData';
import { MIN_RESULTS, normalize, prefix, utcDate } from './server/utils';
import getAppConfig from '../../config/global';

// based on server.js from covizu team

const router: Router = Router();
const config = getAppConfig();

router.use(compression());

// The following three get requests are to retrieve edge,
// bead and variant information for individual clusters
router.get('/edgeList/:cindex', async (req, res) => {
  const beaddata = await getData('beaddata');
  res.send(beaddata[req.params.cindex].edgelist);
});

router.get('/points/:cindex', async (req, res) => {
  const beaddata = await getData('beaddata');
  res.send(beaddata[req.params.cindex].points);
});

router.get('/variants/:cindex', async (req, res) => {
  const beaddata = await getData('beaddata');
  res.send(beaddata[req.params.cindex].variants);
});

// Returns the lineage name for the provided cluster index
router.get('/lineage/:cindex', async (req, res) => {
  const clusters = await getData('clusters');
  res.send(clusters[req.params.cindex].lineage);
});

// Returns the cluster index for the provided accession
router.get('/cid/:accession', async (req, res) => {
  const accn_to_cid = await getData('accn_to_cid');
  res.send(accn_to_cid[req.params.accession]);
});

// Returns information required to generate the tooltip when a user hovers over a cluster
router.get('/tips', async (req, res) => {
  const tips = await getData('tips');
  res.send(tips);
});

router.get('/df', async (req, res) => {
  // TODO: cache timetree somehow
  const response = await getData('df');
  res.send(response);
});

router.get('/lineagetocid', async (req, res) => {
  const lineage_to_cid = await getData('lineage_to_cid');
  res.send(lineage_to_cid);
});

// Returns all beads that match the query, within the start and end dates provided
router.get('/searchHits/:query/:start/:end', async (req, res) => {
  // Flatten the json data to an array with bead data only
  const beaddata = await getData('beaddata');
  let flat_data = beaddata.map((bead: any) => bead.points).flat();
  let start_date = utcDate(req.params.start);
  let end_date = utcDate(req.params.end);

  //Find all the beads that are a hit. Convert text_query to lower case
  // and checks to see if there is a match
  let search_hits = flat_data.filter(function (bead: any) {
    const temp =
      (bead.accessions.some((accession: any) =>
        accession.toLowerCase().includes(req.params.query.toLowerCase()),
      ) ||
        bead.labels.some((label: any) =>
          label.toLowerCase().includes(req.params.query.toLowerCase()),
        )) &&
      bead.x >= start_date &&
      bead.x <= end_date;
    return temp;
  });

  res.send(search_hits);
});

// Requests sent to provide search suggestions based on the user query
router.get('/getHits/:query', async (req, res) => {
  function as_label(search_data: any) {
    const [, accn] = search_data;
    return accn;
  }

  const term = req.params.query;
  const searchSuggestions = await getData('searchSuggestions');

  if (!/\d/.test(term)) {
    if (prefix.test(term)) {
      res.send(searchSuggestions.slice(0, MIN_RESULTS).map(as_label));
    } else {
      res.send([]);
    }
  } else {
    const result = searchSuggestions.filter((array: any) => array[0].indexOf(normalize(term)) > -1);
    res.send(result.slice(0, MIN_RESULTS).map(as_label));
  }
});

// CUSTOM - get version info
router.get('/status', async (req, res) => {
  const dataVersion = (await getDataVersion()) as DataVersion;
  res.status(200).send({
    covizuVersion: config.covizu.version,
    dataVersion,
  });
});

// CUSTOM - get unprocessed data
router.get('/data/:query', async (req, res) => {
  const file = req.params.query.split('.')[0] as StoredDataTypes;
  const data = await getData(file);
  res.send(data);
});

// CUSTOM - error handling
router.use(((err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: err });
  } else {
    next(err);
  }
}) as ErrorRequestHandler);

export default router;
