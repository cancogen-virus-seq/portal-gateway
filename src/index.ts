require('dotenv').config({
	debug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
});

// import Arranger from '@overture-stack/arranger-server';
// import { Router } from 'express';

import getAppConfig from '@/config/global';
// import { BASE_ENDPOINT, HEALTH_ENDPOINT } from './constants/endpoint';
// import { getEsClient } from './esClient';

import app from '@/server';

import startupRoutines from './utils/startupRoutines';

const { port } = getAppConfig();

console.log('Starting VirusSeq API...');

// Arranger({ pingPath: HEALTH_ENDPOINT }).then((arrangerRouter: Router) => {
//   app.use(BASE_ENDPOINT, arrangerRouter);

//   app.listen(port, () => {
//     const message = 'VirusSeq API started on port: ' + port;
//     const line = '-'.repeat(message.length);

//     console.info(`\n${line}`);
//     console.info(message);
//     console.info(`${line}\n`);
//   });
// });

// // init elasticsearch
// getEsClient();

app.listen(port, () => {
	const message = 'VirusSeq API started on port: ' + port;
	const line = '-'.repeat(message.length);

	console.info(`\n${line}`);
	console.info(message);
	console.info(`${line}\n`);

	startupRoutines();
});
