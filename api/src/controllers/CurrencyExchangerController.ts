// @ts-nocheck

import { Knex, Raw } from 'knex';
import knex from '../lib/knex/knex';

interface CurrencyExchanger {
   id: number;
   name: string;
   country: string;
}

interface CurrencyProfit {
   exchangerId: number;
   exchangerName: string;
   country: string;
   profit: number;
}

export default class CurrencyExchangerController {
   private knex: Knex;

   constructor(knex: Knex) {
      this.knex = knex;
   }

   async getTopCurrencyExchangers(): Promise<CurrencyProfit[]> {
      const subquery = this.knex
         .select(
            'rates.from_currency',
            'rates.to_currency',
            'exchanges.ask',
            'exchanges.date',
            'exchanges.exchange_office_id',
            'rates.reserve',
         )
         .from('exchanges')
         .join('exchange_offices', 'exchanges.exchange_office_id', '=', 'exchange_offices.id')
         .join('rates', (join) => {
            join
               .on('exchanges.from_currency', '=', 'rates.from_currency')
               .andOn('exchanges.to_currency', '=', 'rates.to_currency')
               .andOn('exchanges.date', '>=', 'rates.date')
               .andOn('exchanges.date', '<=', knex.raw("rates.date + INTERVAL '1 month'"));
         })
         .whereNotNull('rates.in_rate')
         .whereNotNull('rates.out_rate')
         .whereNotNull('rates.reserve');

      const query = this.knex
         .select(
            'exchanger_id AS exchangerId',
            'exchanger_name AS exchangerName',
            'country',
            this.knex.raw<Raw>('SUM(profit) AS profit'),
         )
         .from(function () {
            this.select(
               'exchange_offices.id AS exchanger_id',
               'exchange_offices.name AS exchanger_name',
               'exchange_offices.country',
               knex.raw<Raw>(
                  '(SUM(rates.out_rate) - SUM(rates.in_rate) * SUM(rates.reserve)) AS profit',
               ),
            )
               .from(subquery.clone().as('subquery'))
               .join('exchange_offices', 'subquery.exchange_office_id', '=', 'exchange_offices.id')
               .join('rates', (join) => {
                  join
                     .on('subquery.from_currency', '=', 'rates.from_currency')
                     .andOn('subquery.to_currency', '=', 'rates.to_currency')
                     .andOn('subquery.date', '=', 'rates.date');
               })
               .groupBy('exchange_offices.id', 'rates.reserve')
               .as('profits');
         })
         .groupBy('exchanger_id', 'exchanger_name', 'country')
         .orderBy('profit', 'desc')
         .limit(3);

      const results = await query;

      return results.map((row) => ({
         exchangerId: row.exchangerId,
         exchangerName: row.exchangerName,
         country: row.country,
         profit: row.profit,
      }));
   }
}
