// Unified Asset Registry - Bursa Malaysia Equities + Cryptocurrencies

import { Asset } from './types';

export const EQUITY_ASSETS: Asset[] = [
  {
    assetId: 'MYX:MAYBANK',
    symbol: 'MAYBANK',
    name: 'Malayan Banking Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 9.12,
    dailyChange: 0.12,
    dailyChangePercent: 1.33,
    volume: 12500000,
    volatilityFactor: 0.015, // 1.5% volatility (calm)
    marketStatus: 'OPEN',
    sector: 'Banking',
  },
  {
    assetId: 'MYX:TENAGA',
    symbol: 'TENAGA',
    name: 'Tenaga Nasional Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 11.45,
    dailyChange: -0.15,
    dailyChangePercent: -1.29,
    volume: 8500000,
    volatilityFactor: 0.012,
    marketStatus: 'OPEN',
    sector: 'Utilities',
  },
  {
    assetId: 'MYX:CIMB',
    symbol: 'CIMB',
    name: 'CIMB Group Holdings Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 6.25,
    dailyChange: 0.05,
    dailyChangePercent: 0.81,
    volume: 15200000,
    volatilityFactor: 0.018,
    marketStatus: 'OPEN',
    sector: 'Banking',
  },
  {
    assetId: 'MYX:PBBANK',
    symbol: 'PBBANK',
    name: 'Public Bank Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 4.68,
    dailyChange: 0.08,
    dailyChangePercent: 1.74,
    volume: 9800000,
    volatilityFactor: 0.014,
    marketStatus: 'OPEN',
    sector: 'Banking',
  },
  {
    assetId: 'MYX:PCHEM',
    symbol: 'PCHEM',
    name: 'Petronas Chemicals Group Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 7.25,
    dailyChange: 0.20,
    dailyChangePercent: 2.84,
    volume: 11200000,
    volatilityFactor: 0.020,
    marketStatus: 'OPEN',
    sector: 'Chemicals',
  },
  {
    assetId: 'MYX:TOPGLOV',
    symbol: 'TOPGLOV',
    name: 'Top Glove Corporation Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 0.85,
    dailyChange: -0.02,
    dailyChangePercent: -2.30,
    volume: 25000000,
    volatilityFactor: 0.025,
    marketStatus: 'OPEN',
    sector: 'Healthcare',
  },
  {
    assetId: 'MYX:GENTING',
    symbol: 'GENTING',
    name: 'Genting Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 4.95,
    dailyChange: 0.10,
    dailyChangePercent: 2.06,
    volume: 7500000,
    volatilityFactor: 0.022,
    marketStatus: 'OPEN',
    sector: 'Gaming',
  },
  {
    assetId: 'MYX:AAGB',
    symbol: 'AAGB',
    name: 'Axiata Group Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 2.78,
    dailyChange: -0.05,
    dailyChangePercent: -1.77,
    volume: 6800000,
    volatilityFactor: 0.016,
    marketStatus: 'OPEN',
    sector: 'Telecommunications',
  },
  {
    assetId: 'MYX:IHH',
    symbol: 'IHH',
    name: 'IHH Healthcare Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 6.45,
    dailyChange: 0.15,
    dailyChangePercent: 2.38,
    volume: 4200000,
    volatilityFactor: 0.019,
    marketStatus: 'OPEN',
    sector: 'Healthcare',
  },
  {
    assetId: 'MYX:TM',
    symbol: 'TM',
    name: 'Telekom Malaysia Berhad',
    assetType: 'EQUITY',
    currency: 'MYR',
    lastPrice: 5.85,
    dailyChange: 0.08,
    dailyChangePercent: 1.39,
    volume: 5500000,
    volatilityFactor: 0.013,
    marketStatus: 'OPEN',
    sector: 'Telecommunications',
  },
];

export const CRYPTO_ASSETS: Asset[] = [
  {
    assetId: 'BINANCE:BTCUSDT',
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 43250.50,
    dailyChange: 1250.30,
    dailyChangePercent: 2.98,
    volume: 28500000000,
    volatilityFactor: 0.035, // 3.5% volatility (spicy 🌶️)
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 850000000000,
  },
  {
    assetId: 'BINANCE:ETHUSDT',
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 2650.75,
    dailyChange: -45.20,
    dailyChangePercent: -1.68,
    volume: 15200000000,
    volatilityFactor: 0.040,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 318000000000,
  },
  {
    assetId: 'BINANCE:BNBUSDT',
    symbol: 'BNBUSDT',
    name: 'Binance Coin',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 315.20,
    dailyChange: 8.50,
    dailyChangePercent: 2.77,
    volume: 1200000000,
    volatilityFactor: 0.045,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 48000000000,
  },
  {
    assetId: 'BINANCE:SOLUSDT',
    symbol: 'SOLUSDT',
    name: 'Solana',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 98.45,
    dailyChange: 3.20,
    dailyChangePercent: 3.36,
    volume: 2100000000,
    volatilityFactor: 0.050,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 45000000000,
  },
  {
    assetId: 'BINANCE:XRPUSDT',
    symbol: 'XRPUSDT',
    name: 'Ripple',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 0.62,
    dailyChange: -0.01,
    dailyChangePercent: -1.59,
    volume: 1200000000,
    volatilityFactor: 0.038,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 34000000000,
  },
  {
    assetId: 'BINANCE:ADAUSDT',
    symbol: 'ADAUSDT',
    name: 'Cardano',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 0.52,
    dailyChange: 0.02,
    dailyChangePercent: 4.00,
    volume: 450000000,
    volatilityFactor: 0.042,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 18500000000,
  },
  {
    assetId: 'BINANCE:DOGEUSDT',
    symbol: 'DOGEUSDT',
    name: 'Dogecoin',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 0.085,
    dailyChange: 0.003,
    dailyChangePercent: 3.66,
    volume: 850000000,
    volatilityFactor: 0.055,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 12000000000,
  },
  {
    assetId: 'BINANCE:DOTUSDT',
    symbol: 'DOTUSDT',
    name: 'Polkadot',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 7.25,
    dailyChange: 0.15,
    dailyChangePercent: 2.11,
    volume: 320000000,
    volatilityFactor: 0.043,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 9500000000,
  },
  {
    assetId: 'BINANCE:MATICUSDT',
    symbol: 'MATICUSDT',
    name: 'Polygon',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 0.88,
    dailyChange: 0.02,
    dailyChangePercent: 2.33,
    volume: 450000000,
    volatilityFactor: 0.048,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 8500000000,
  },
  {
    assetId: 'BINANCE:LINKUSDT',
    symbol: 'LINKUSDT',
    name: 'Chainlink',
    assetType: 'CRYPTO',
    currency: 'USDT',
    lastPrice: 14.50,
    dailyChange: -0.30,
    dailyChangePercent: -2.03,
    volume: 280000000,
    volatilityFactor: 0.041,
    marketStatus: 'ALWAYS_OPEN',
    marketCap: 8500000000,
  },
];

// Get all assets
export function getAllAssets(): Asset[] {
  return [...EQUITY_ASSETS, ...CRYPTO_ASSETS];
}

// Get asset by ID
export function getAssetById(assetId: string): Asset | undefined {
  return getAllAssets().find(asset => asset.assetId === assetId);
}

// Get asset by symbol
export function getAssetBySymbol(symbol: string): Asset | undefined {
  return getAllAssets().find(asset => asset.symbol === symbol);
}

// Get equities only
export function getEquityAssets(): Asset[] {
  return EQUITY_ASSETS;
}

// Get crypto only
export function getCryptoAssets(): Asset[] {
  return CRYPTO_ASSETS;
}

// Check if market is open for an asset
export function isMarketOpen(asset: Asset): boolean {
  if (asset.marketStatus === 'ALWAYS_OPEN') return true;
  if (asset.marketStatus === 'CLOSED') return false;
  
  // For OPEN status, check market hours (9:00 AM - 5:00 PM MYT, Mon-Fri)
  const now = new Date();
  const mytTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
  const hour = mytTime.getHours();
  const day = mytTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

