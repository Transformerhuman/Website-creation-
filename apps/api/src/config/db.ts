import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URL || {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ubuntu',
    database: process.env.DB_NAME || 'agropulse'
  },
  pool: { min: 2, max: 10 }
});

export default db;
