require('dotenv').config();

if (process.env.API_POSTGRES_DB) {
	process.env.PGCONNECT_TIMEOUT = process.env.API_POSTGRES_TIMEOUTMS ?? '30000';
	process.env.PGDATABASE = process.env.API_POSTGRES_DB ?? 'virusseq_db';
	process.env.PGHOST = process.env.API_POSTGRES_HOST ?? 'localhost';
	process.env.PGIDLE_TIMEOUT = process.env.API_POSTGRES_IDLETIMEOUTMS ?? 'null';
	process.env.PGPASSWORD = process.env.API_POSTGRES_PASSWORD ?? 'postgrespw';
	process.env.PGPORT = process.env.API_POSTGRES_PORT ?? '55000';
	process.env.PGUSERNAME = process.env.API_POSTGRES_USERNAME ?? 'postgres';
}

// TODO: create docker_compose file for local dev environmant (i.e. set up mock postgres db, etc.)
