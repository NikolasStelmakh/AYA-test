import { updateTypes } from 'knex-types';
import db from './knex';
import logger from '../logger';

updateTypes(db, { output: './database-types.ts' })
   .then(() => {
      logger.info('Database types updated successfully!');
   })
   .catch((err) => {
      logger.error('Error updating database types:', err);
      process.exit(1);
   });
