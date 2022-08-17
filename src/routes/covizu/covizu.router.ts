// @ts-nocheck

// based on server.js from covizu

import { Router } from 'express';
import { getDataVersion } from './custom';

const router: Router = Router();

getDataVersion();

router.get('/', (req, res) => {
  res.status(200).send({
    message: 'Covizu!',
  });
});

export default router;
