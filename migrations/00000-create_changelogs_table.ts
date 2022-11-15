import { Sql } from 'postgres';

export const up = async (client: Sql) => {
	await client`
		create type archive_status as enum ('BUILDING', 'CANCELLED', 'COMPLETE', 'FAILED');
	`;

	await client`
		create type archive_type as enum ('ALL', 'SET_QUERY');
	`;

	await client`
		create table if not exists changelogs (
			id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
			status archive_status NOT NULL,
			hash_info character varying NOT NULL CHECK (hash_info::text <> ''::text),
			hash character varying NOT NULL CHECK (hash::text <> ''::text) UNIQUE,
			type archive_type NOT NULL,
			num_of_samples bigint NOT NULL,
			num_of_downloads integer NOT NULL DEFAULT 0,
			object_id uuid,
			release_time_from bigint NOT NULL DEFAULT date_part('epoch'::text, now()),
			release_time_until bigint NOT NULL DEFAULT date_part('epoch'::text, now()),
			total_submitted integer NOT NULL DEFAULT 0,
			total_supressed integer NOT NULL DEFAULT 0,
			total_updated integer NOT NULL DEFAULT 0
		);
	`;
};

export const down = async (client: Sql) => {
	await client`
		drop table if exists changelogs;
	`;

	await client`
		drop type if exists archive_status;
	`;

	await client`
		drop type if exists archive_type;
	`;
};
