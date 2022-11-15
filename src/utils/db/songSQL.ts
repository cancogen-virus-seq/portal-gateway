import postgres from 'postgres';

import getAppConfig, { getAppSecrets } from '@/config/global';

const {
	db: { song },
} = getAppConfig();

const songSQL = postgres({
	database: song.name,
	host: song.host,
	idle_timeout: song.idleTimeoutMS / 1000,
	max: song.maxPoolSize,
	pass: song.pass,
	port: song.port,
	transform: postgres.camel,
	user: song.user,
});

export default songSQL;
