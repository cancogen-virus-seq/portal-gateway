// based on server.js from covizu

import { Router } from 'express';

const router: Router = Router();

router.get('/', (req, res) => {
  res.status(200).send({
    message: 'Covizu!',
  });
});

export default router;
