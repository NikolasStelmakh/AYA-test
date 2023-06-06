/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
   // Create exchange_offices table
   pgm.createTable('exchange_offices', {
      id: 'id',
      name: { type: 'varchar(255)' },
      country: { type: 'varchar(255)' },
   });

   // Create exchanges table
   pgm.createTable('exchanges', {
      id: 'id',
      exchange_office_id: {
         type: 'integer',
         references: 'exchange_offices',
         notNull: true,
      },
      from_currency: { type: 'varchar(255)' },
      to_currency: { type: 'varchar(255)' },
      // @ts-ignore
      ask: { type: 'numeric', precision: 10, scale: 2 },
      date: { type: 'timestamp' },
   });

   // Create rates table
   pgm.createTable('rates', {
      id: 'id',
      exchange_office_id: {
         type: 'integer',
         references: 'exchange_offices',
         notNull: true,
      },
      from_currency: { type: 'varchar(255)' },
      to_currency: { type: 'varchar(255)' },
      // @ts-ignore
      in_rate: { type: 'numeric', precision: 10, scale: 2 },
      // @ts-ignore
      out_rate: { type: 'numeric', precision: 10, scale: 2 },
      // @ts-ignore
      reserve: { type: 'numeric', precision: 10, scale: 2 },
      date: { type: 'timestamp' },
   });

   // Create countries table
   pgm.createTable('countries', {
      code: { type: 'varchar(255)', primaryKey: true },
      name: { type: 'varchar(255)' },
   });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
   pgm.dropTable('exchanges');
   pgm.dropTable('rates');
   pgm.dropTable('exchange_offices');
   pgm.dropTable('countries');
}
