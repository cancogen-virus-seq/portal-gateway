import postgres from 'postgres';

import getAppConfig from '@/config/global';

const {
	db: { singularity },
} = getAppConfig();

const singularitySQL = postgres({
	database: singularity.name,
	debug: singularity.debug,
	host: singularity.host,
	idle_timeout: singularity.idleTimeoutMS / 1000,
	max: singularity.maxPoolSize,
	pass: singularity.pass,
	port: singularity.port,
	transform: postgres.camel,
	user: singularity.user,
});

export default singularitySQL;
