import { Router } from 'express';

import { COVIZU_ENDPOINT, SWAGGER_ENDPOINT } from '@/constants/endpoint';

import covizuRouter from './covizu/covizu.router';

const routes = (): Router => {
  const router = Router();

  router.use(COVIZU_ENDPOINT, covizuRouter);

  return router;
};

export default routes;

export { default as healthRouter } from './health/health.router';
export { default as covizuRouter } from './covizu/covizu.router';
export { default as swaggerRouter } from './swagger/swagger.router';
