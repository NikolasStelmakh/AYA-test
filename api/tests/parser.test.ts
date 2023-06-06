import fs from 'fs';
import { describe, expect, it } from '@jest/globals';
import { parseDumpData } from '../src/lib/dump-parser';

describe('Parser', () => {
   it('should parse the dump data correctly', () => {
      const data = fs.readFileSync('input.txt', 'utf8');
      const parsedData = parseDumpData(data);

      expect(parsedData.exchangeOffices).toHaveLength(2);
      expect(parsedData.countries).toHaveLength(2);

      const exchangeOffice = parsedData.exchangeOffices[0];
      expect(exchangeOffice.id).toBe(1);
      expect(exchangeOffice.name).toBe('Exchanger 1');
      expect(exchangeOffice.country).toBe('UKR');

      const country = parsedData.countries[0];
      expect(country.code).toBe('UKR');
      expect(country.name).toBe('Ukraine');
   });
});
