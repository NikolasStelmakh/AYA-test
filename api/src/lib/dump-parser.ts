import * as fs from 'fs';
import * as readline from 'readline';
import { Knex } from 'knex';
import knexInstance from './knex/knex';
import logger from './logger';
export interface Exchange {
   from: string;
   to: string;
   ask: number;
   date: string;
}

export interface Rate {
   from: string;
   to: string;
   in: number;
   out: number;
   reserve: number;
   date: string;
}

export interface ExchangeOffice {
   id: number;
   name: string;
   country: string;
   exchanges: Exchange[];
   rates: Rate[];
}

export interface Country {
   code: string;
   name: string;
}

interface ParsedData {
   exchangeOffices: ExchangeOffice[];
   countries: Country[];
}

const CHARS_COUNT_TO_START_DIVIDING_DATA = 20000;

export const parseDumpData = (data: string): ParsedData => {
   try {
      const exchangeOffices: ExchangeOffice[] = [];
      const countries: Country[] = [];

      let currentExchangeOffice: ExchangeOffice | null = null;
      let currentRate: Rate | null = null;

      const lines = data.split('\n');

      for (const line of lines) {
         try {
            const exchangeOfficeMatch = line.match(/^ {2}exchange-office$/);
            if (exchangeOfficeMatch) {
               currentExchangeOffice = { id: 0, name: '', country: '', exchanges: [], rates: [] };
               exchangeOffices.push(currentExchangeOffice);
            }

            const idMatch = line.match(/^ {4}id = (\d+)$/);
            if (idMatch && currentExchangeOffice) {
               currentExchangeOffice.id = parseInt(idMatch[1]);
            }

            const nameMatch = line.match(/^ {4}name = (.+)$/);
            if (nameMatch && currentExchangeOffice) {
               currentExchangeOffice.name = nameMatch[1];
            }

            const countryMatch = line.match(/^ {4}country = (.+)$/);
            if (countryMatch && currentExchangeOffice) {
               currentExchangeOffice.country = countryMatch[1];
            }

            const exchangeMatch = line.match(/^ {6}exchange$/);
            if (exchangeMatch && currentExchangeOffice) {
               currentExchangeOffice.exchanges.push({ from: '', to: '', ask: 0, date: '' });
            }

            const exchangeFromMatch = line.match(/^ {8}from = (.+)$/);
            if (
               exchangeFromMatch &&
               currentExchangeOffice &&
               currentExchangeOffice.exchanges.length > 0
            ) {
               currentExchangeOffice.exchanges[currentExchangeOffice.exchanges.length - 1].from =
                  exchangeFromMatch[1];
            }

            const exchangeToMatch = line.match(/^ {8}to = (.+)$/);
            if (
               exchangeToMatch &&
               currentExchangeOffice &&
               currentExchangeOffice.exchanges.length > 0
            ) {
               currentExchangeOffice.exchanges[currentExchangeOffice.exchanges.length - 1].to =
                  exchangeToMatch[1];
            }

            const exchangeAskMatch = line.match(/^ {8}ask = (\d+(?:\.\d+)?)$/);
            if (
               exchangeAskMatch &&
               currentExchangeOffice &&
               currentExchangeOffice.exchanges.length > 0
            ) {
               currentExchangeOffice.exchanges[currentExchangeOffice.exchanges.length - 1].ask =
                  parseFloat(exchangeAskMatch[1]);
            }

            const exchangeDateMatch = line.match(/^ {8}date = (.+)$/);
            if (
               exchangeDateMatch &&
               currentExchangeOffice &&
               currentExchangeOffice.exchanges.length > 0
            ) {
               currentExchangeOffice.exchanges[currentExchangeOffice.exchanges.length - 1].date =
                  exchangeDateMatch[1];
            }

            const rateMatch = line.match(/^ {6}rate$/);
            if (rateMatch && currentExchangeOffice) {
               currentRate = { from: '', to: '', in: 0, out: 0, reserve: 0, date: '' };
               currentExchangeOffice.rates.push(currentRate);
            }

            const rateFromMatch = line.match(/^ {8}from = (.+)$/);
            if (rateFromMatch && currentRate) {
               currentRate.from = rateFromMatch[1];
            }

            const rateToMatch = line.match(/^ {8}to = (.+)$/);
            if (rateToMatch && currentRate) {
               currentRate.to = rateToMatch[1];
            }

            const rateInMatch = line.match(/^ {8}in = (\d+(?:\.\d+)?)$/);
            if (rateInMatch && currentRate) {
               currentRate.in = parseFloat(rateInMatch[1]);
            }

            const rateOutMatch = line.match(/^ {8}out = (\d+(?:\.\d+)?)$/);
            if (rateOutMatch && currentRate) {
               currentRate.out = parseFloat(rateOutMatch[1]);
            }

            const rateReserveMatch = line.match(/^ {8}reserve = (\d+(?:\.\d+)?)$/);
            if (rateReserveMatch && currentRate) {
               currentRate.reserve = parseFloat(rateReserveMatch[1]);
            }

            const rateDateMatch = line.match(/^ {8}date = (.+)$/);
            if (rateDateMatch && currentRate) {
               currentRate.date = rateDateMatch[1];
            }

            const countryCodeMatch = line.match(/^ {4}code = (.+)$/);
            if (countryCodeMatch) {
               const country: Country = { code: countryCodeMatch[1], name: '' };
               countries.push(country);
               currentExchangeOffice = null; // Reset current exchange office after parsing a country
            }

            const countryNameMatch = line.match(/^ {4}name = (.+)$/);
            if (countryNameMatch && countries.length > 0) {
               countries[countries.length - 1].name = countryNameMatch[1];
            }
         } catch (error) {
            logger.error('Parsing error:', error);
         }
      }

      return { exchangeOffices, countries };
   } catch (error) {
      logger.error('Error parsing dump data');
      throw error;
   }
};

export async function storeParsedData(knex: Knex, parsedData: ParsedData): Promise<void> {
   const { exchangeOffices, countries } = parsedData;

   try {
      await knex.transaction(async (trx) => {
         for (const exchangeOffice of exchangeOffices) {
            await trx('exchange_offices')
               .insert({
                  id: exchangeOffice.id,
                  name: exchangeOffice.name,
                  country: exchangeOffice.country,
               })
               .onConflict()
               .ignore();

            for (const exchange of exchangeOffice.exchanges) {
               await trx('exchanges').insert({
                  exchange_office_id: exchangeOffice.id,
                  ask: exchange.ask,
                  date: exchange.date,
                  from_currency: exchange.from,
                  to_currency: exchange.to,
               });
            }

            for (const rate of exchangeOffice.rates) {
               await trx('rates').insert({
                  exchange_office_id: exchangeOffice.id,
                  date: rate.date,
                  from_currency: rate.from,
                  to_currency: rate.to,
                  in_rate: rate.in,
                  out_rate: rate.out,
                  reserve: rate.reserve,
               });
            }
         }

         await trx('countries').insert(countries).onConflict().ignore();
      });

      logger.info('Data stored successfully!');
   } catch (error) {
      logger.error('Error storing data');
      throw error;
   }
}

const fileStream = fs.createReadStream('input.txt', 'utf-8');
const rl = readline.createInterface({ input: fileStream });

let fileContent = '';

rl.on('line', async (line): Promise<void> => {
   try {
      if (
         fileContent.length > CHARS_COUNT_TO_START_DIVIDING_DATA &&
         line.match(/^ {2}exchange-office|country/)
      ) {
         const parsedData = parseDumpData(fileContent);
         fileContent = line + '\n';
         await storeParsedData(knexInstance, parsedData);
      } else {
         fileContent += line + '\n';
      }
   } catch (error) {
      logger.error('Error parsing or storing data on line event');
      rl.close(); // Close the stream reading
      process.exit(1);
   }
});

rl.on('close', async (): Promise<void> => {
   try {
      const parsedData = parseDumpData(fileContent);
      await storeParsedData(knexInstance, parsedData);
      logger.info('Finished');
      process.exit(0);
   } catch (error) {
      logger.error('Error parsing or storing data on close event:', error);
      process.exit(1);
   } finally {
      rl.close(); // Close the stream reading
   }
});
