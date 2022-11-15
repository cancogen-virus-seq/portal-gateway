# VirusSeq API

Development of the Data Access Control API

## Documentation

This file is meant as a quick introduction, WIP

- [Getting Started](#getting-started)
  - [Development Setup](#--development-setup)

---

### Getting Started

This app has been tested using NodeJS v^18, yet should work with earlier versions.

#### - Data sources

This service depends on a Postgres instance of its own, as well as those owned by Singularity and Song. Make sure to provide the right environment variables for it to reach those correctly.

#### - Development Setup

Setting up the project, and prepare things to make changes

```bash
# 1. clone the repository
  git clone git@github.com:cancogen-virus-seq/api.git

# 2. install the dependencies
  npm ci
```

Now you should be able to start the server from the project's root folder:

```bash
# run the server (on port 8080)
  npm run dev
  # or better yet
  npm run dev:nodemon
  # which also restarts if linked packages are updated (e.g. Arranger)

# NOTE: if using NodeJS v17+, you may have to do one of the following:
  NODE_OPTIONS=--openssl-legacy-provider npm run dev
  # or do this, before running the server
  export NODE_OPTIONS=--openssl-legacy-provider
```

The development server will start on port `4000` by default.

#### - Endpoint Documentation

There is API documentation provided by Swagger, available at [/swagger](http://localhost:4000/swagger).

#### - Database migrations

Leveraging [Ley](https://www.npmjs.com/package/ley), this API is able to apply migrations every time it is deployed to one of our k8s environments. The changes are implemented in the sequential files contained in the `migrations` directory, and you may create new ones by running the following command:

```zsh
npm run migrate new <short_migration_description>.ts
```

Each of these files should contain an _`up`_ function that effects the changes, and a _`down`_ function that rolls them back entirely.

```ts
// Example migration file
import { Sql } from 'postgres';

export const up = async (client: Sql) => {
	await client`create table example (...)`;
};

export const down = async (client: Sql) => {
	await client`drop table example`;
};
```
