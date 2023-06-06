import { join } from 'path';
import dotenv from 'dotenv';
import pgm from 'node-pg-migrate';
import logger from './lib/logger';

dotenv.config();

const migrateDatabase = () => {
   pgm({
      direction: 'up',
      migrationsTable: 'migrations',
      singleTransaction: true,
      checkOrder: false,
      databaseUrl: {
         user: process.env.POSTGRES_USER as string,
         host: process.env.POSTGRES_HOST as string,
         database: process.env.POSTGRES_DATABASE as string,
         password: process.env.POSTGRES_PASSWORD as string,
         port: parseInt(process.env.POSTGRES_PORT as string),
      },
      dir: join(__dirname, 'migrations'),
   })
      .then(() => {
         logger.info('Database migration completed successfully');
      })
      .catch((error) => {
         logger.error('Error migrating database:', error);
      });
};

migrateDatabase();
