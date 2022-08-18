// @ts-nocheck

// based on server.js from covizu

import { Router } from 'express';
import { getDataVersion } from './custom';
import {
  getAccnToCid,
  getBeadData,
  getDf,
  getLineageToCid,
  getTips,
} from './covizu-server';

const router: Router = Router();

getDataVersion();

router.get('/', (req, res) => {
  res.status(200).send({
    message: 'Covizu!',
  });
});

// The following three get requests are to retrieve edge, bead and variant information for individual clusters
router.get('/edgeList/:cindex', async (req, res) => {
  const beaddata = await getBeadData();
  res.send(beaddata[req.params.cindex].edgelist);
});

router.get('/points/:cindex', async (req, res) => {
  const beaddata = await getBeadData();
  res.send(beaddata[req.params.cindex].points);
});

router.get('/variants/:cindex', async (req, res) => {
  const beaddata = await getBeadData();
  res.send(beaddata[req.params.cindex].variants);
});

// Returns the lineage name for the provided cluster index
router.get('/lineage/:cindex', async (req, res) => {
  const clusters = await getClusters();
  res.send(clusters[req.params.cindex].lineage);
});

// Returns the cluster index for the provided accession
router.get('/cid/:accession', async (req, res) => {
  const accn_to_cid = await getAccnToCid();
  res.send(accn_to_cid[req.params.accession]);
});

// Returns information required to generate the tooltip when a user hovers over a cluster
router.get('/tips', async (req, res) => {
  const tips = await getTips();
  res.send(tips);
});

router.get('/df', async (req, res) => {
  // TODO: cache timetree somehow
  const response = await getDf();
  res.send(response);
});

router.get('/lineagetocid', async (req, res) => {
  const lineage_to_cid = await getLineageToCid();
  res.send(lineage_to_cid);
});

// TODO do these later
// Returns all beads that match the query, within the start and end dates provided
router.get('/searchHits/:query/:start/:end', (req, res) => {
  // Flatten the json data to an array with bead data only
  let flat_data = beaddata.map((bead) => bead.points).flat();
  let start_date = utcDate(req.params.start);
  let end_date = utcDate(req.params.end);

  //Find all the beads that are a hit. Convert text_query to lower case and checks to see if there is a match
  let search_hits = flat_data.filter(function (bead) {
    temp =
      (bead.accessions.some((accession) =>
        accession.toLowerCase().includes(req.params.query.toLowerCase()),
      ) ||
        bead.labels.some((label) =>
          label.toLowerCase().includes(req.params.query.toLowerCase()),
        )) &&
      bead.x >= start_date &&
      bead.x <= end_date;
    return temp;
  });

  res.send(search_hits);
});

// Requests sent to provide search suggestions based on the user query
router.get('/getHits/:query', (req, res) => {
  function as_label(search_data) {
    const [, accn] = search_data;
    return accn;
  }

  const term = req.params.query;

  if (!/\d/.test(term)) {
    if (prefix.test(term)) {
      res.send(data.slice(0, MIN_RESULTS).map(as_label));
    } else {
      res.send([]);
    }
  } else {
    const result = data.filter(
      (array) => array[0].indexOf(normalize(term)) > -1,
    );
    res.send(result.slice(0, MIN_RESULTS).map(as_label));
  }
});

export default router;
