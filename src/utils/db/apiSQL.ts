import postgres from 'postgres';

import getAppConfig from '@/config/global';

const {
	db: { api },
} = getAppConfig();

const apiSQL = postgres({
	database: api.name,
	debug: api.debug,
	host: api.host,
	idle_timeout: api.idleTimeoutMS / 1000,
	max: api.maxPoolSize,
	pass: api.pass,
	port: api.port,
	transform: postgres.camel,
	user: api.user,
});

export default apiSQL;
