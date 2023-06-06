// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Countries = "countries",
  ExchangeOffices = "exchange_offices",
  Exchanges = "exchanges",
  Migrations = "migrations",
  Rates = "rates",
}

export type Tables = {
  "countries": Countries,
  "exchange_offices": ExchangeOffices,
  "exchanges": Exchanges,
  "migrations": Migrations,
  "rates": Rates,
};

export type Countries = {
  code: string;
  name: string | null;
};

export type ExchangeOffices = {
  id: number;
  name: string | null;
  country: string | null;
};

export type Exchanges = {
  id: number;
  exchange_office_id: number;
  from_currency: string | null;
  to_currency: string | null;
  ask: string | null;
  date: Date | null;
};

export type Migrations = {
  id: number;
  name: string;
  run_on: Date;
};

export type Rates = {
  id: number;
  exchange_office_id: number;
  from_currency: string | null;
  to_currency: string | null;
  in_rate: string | null;
  out_rate: string | null;
  reserve: string | null;
  date: Date | null;
};

