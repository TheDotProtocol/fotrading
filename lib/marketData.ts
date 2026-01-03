import { MarketIndex, Future, Currency, ETF, Bond } from '@/types/market';

export const marketIndices: MarketIndex[] = [
  { symbol: 'KLCI', name: 'FTSE Bursa Malaysia KLCI Index', value: 1523.45, change: 12.34, changePercent: 0.82 },
  { symbol: 'ACE', name: 'FTSE Bursa Malaysia ACE Index', value: 5234.12, change: -23.45, changePercent: -0.45 },
  { symbol: 'TOP100', name: 'FTSE Bursa Malaysia Top 100 Index', value: 10234.56, change: 45.67, changePercent: 0.45 },
  { symbol: 'MID70', name: 'FTSE Bursa Malaysia MID 70 Index', value: 12345.67, change: 23.45, changePercent: 0.19 },
  { symbol: 'SMALLCAP', name: 'FTSE Bursa Malaysia Small Cap Index', value: 8765.43, change: -12.34, changePercent: -0.14 },
  { symbol: 'FINANCE', name: 'Bursa Malaysia Finance Index', value: 15234.56, change: 123.45, changePercent: 0.82 },
];

export const futures: Future[] = [
  { symbol: 'FGLD1!', name: 'Gold Futures', price: 285.50, change: 2.30, changePercent: 0.81, contract: 'MYR/gram' },
  { symbol: 'FTIN1!', name: 'USD Tin Futures', price: 28500, change: -150, changePercent: -0.52, contract: 'USD/tonne' },
  { symbol: 'FCPO1!', name: 'Crude Palm Oil Futures', price: 3850, change: 45, changePercent: 1.18, contract: 'MYR/tonne' },
  { symbol: 'FEPO1!', name: 'East Malaysia Crude Palm Oil Futures', price: 3820, change: 40, changePercent: 1.06, contract: 'MYR/tonne' },
  { symbol: 'FUPO1!', name: 'USD Crude Palm Oil Futures', price: 920, change: 12, changePercent: 1.32, contract: 'USD/tonne' },
  { symbol: 'FPOL1!', name: 'USD RBD Palm Olein Futures', price: 950, change: 15, changePercent: 1.60, contract: 'USD/tonne' },
  { symbol: 'FPKO1!', name: 'Crude Palm Kernel Oil Futures', price: 4200, change: 50, changePercent: 1.20, contract: 'MYR/tonne' },
];

export const currencies: Currency[] = [
  { pair: 'USDMYR', name: 'USD to MYR', rate: 4.72, change: 0.02, changePercent: 0.43 },
  { pair: 'EURMYR', name: 'EUR to MYR', rate: 5.12, change: -0.01, changePercent: -0.19 },
  { pair: 'JPYMYR', name: 'JPY to MYR', rate: 0.032, change: 0.0001, changePercent: 0.31 },
  { pair: 'GBPMYR', name: 'GBP to MYR', rate: 5.98, change: 0.03, changePercent: 0.50 },
  { pair: 'CHFMYR', name: 'CHF to MYR', rate: 5.45, change: -0.02, changePercent: -0.37 },
  { pair: 'CNYMYR', name: 'CNY to MYR', rate: 0.66, change: 0.01, changePercent: 1.54 },
];

export const etfs: ETF[] = [
  { symbol: 'GOLDETF', name: 'TradePlus Shariah Gold Tracker', price: 1.85, change: 0.02, changePercent: 1.09, volume: 125000 },
  { symbol: 'CHINAETF-MYR', name: 'TradePlus S&P New China Tracker', price: 2.45, change: -0.05, changePercent: -2.00, volume: 89000 },
  { symbol: 'EQ8SID', name: 'EQ8 MSCI SEA ISLAMIC DIVIDEND ETF', price: 1.12, change: 0.01, changePercent: 0.90, volume: 45000 },
  { symbol: 'F4GBM-EA', name: 'FTSE4Good Bursa Malaysia ETF', price: 1.55, change: 0.03, changePercent: 1.97, volume: 67000 },
  { symbol: 'CHINA100-MYR', name: 'Vp-Dj Shariah China A-Shares 100 ETF', price: 2.12, change: 0.04, changePercent: 1.92, volume: 34000 },
  { symbol: 'EQ8US50', name: 'EQ8 DOW JONES US TITANS 50 ETF', price: 3.45, change: -0.02, changePercent: -0.58, volume: 56000 },
  { symbol: 'EQ8MY25', name: 'EQ8 DOW JONES ISLAMIC MARKET MALAYSIA TITANS 25 ETF', price: 1.78, change: 0.02, changePercent: 1.14, volume: 78000 },
  { symbol: 'ABFMY1', name: 'ABF Malaysia Bond Index Fund', price: 1.23, change: 0.01, changePercent: 0.82, volume: 120000 },
  { symbol: 'PAM-C50', name: 'Principal FTSE China 50 ETF', price: 2.34, change: -0.03, changePercent: -1.27, volume: 45000 },
  { symbol: 'EQ8WAQF', name: 'EQ8 FTSE MALAYSIA ENHANCED DIVIDEND WAQF ETF', price: 1.45, change: 0.02, changePercent: 1.40, volume: 23000 },
];

export const bonds: Bond[] = [
  { symbol: 'MY01Y', name: 'Malaysia 1 Year Government Bonds', coupon: 0, yield: 3.25, maturity: 'Jan 3, 2027', price: 100.00 },
  { symbol: 'MY03Y', name: 'Malaysia 3 Year Government Bonds', coupon: 3.52, yield: 3.48, maturity: 'Apr 21, 2028', price: 100.12 },
  { symbol: 'MY05Y', name: 'Malaysia 5 Year Government Bonds', coupon: 3.34, yield: 3.42, maturity: 'May 16, 2030', price: 99.85 },
  { symbol: 'MY10Y', name: 'Malaysia 10 Year Government Bonds', coupon: 3.48, yield: 3.52, maturity: 'Jul 3, 2035', price: 99.45 },
  { symbol: 'MY20Y', name: 'Malaysia 20 Year Government Bonds', coupon: 4.18, yield: 4.22, maturity: 'May 17, 2044', price: 98.90 },
  { symbol: 'MY30Y', name: 'Malaysia 30 Year Government Bonds', coupon: 4.46, yield: 4.50, maturity: 'Apr 1, 2053', price: 98.25 },
];

