export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface Future {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  contract: string;
}

export interface Currency {
  pair: string;
  name: string;
  rate: number;
  change: number;
  changePercent: number;
}

export interface ETF {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface Bond {
  symbol: string;
  name: string;
  coupon: number;
  yield: number;
  maturity: string;
  price: number;
}

export interface Cryptocurrency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

