import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const knexInstance = knex({
   client: 'pg',
   connection: {
      user: process.env.POSTGRES_USER as string,
      host: process.env.POSTGRES_HOST as string,
      database: process.env.POSTGRES_DATABASE as string,
      password: process.env.POSTGRES_PASSWORD as string,
      port: parseInt(process.env.POSTGRES_PORT as string),
   },
   searchPath: ['knex', 'public'],
});

export default knexInstance;
