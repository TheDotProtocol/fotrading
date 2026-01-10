// Unified Market Engine Types

export type AssetType = 'EQUITY' | 'CRYPTO';
export type Currency = 'MYR' | 'USD' | 'USDT';
export type MarketStatus = 'OPEN' | 'CLOSED' | 'ALWAYS_OPEN';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderSide = 'BUY' | 'SELL' | 'LONG' | 'SHORT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'PARTIAL';

export interface Asset {
  assetId: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  currency: Currency;
  lastPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  volume: number;
  volatilityFactor: number; // 0.01 = 1% volatility, 0.05 = 5% volatility
  marketStatus: MarketStatus;
  marketCap?: number;
  sector?: string; // For equities
  contractSize?: number; // For futures
  lotSize?: number; // For forex
}

export interface PriceData {
  assetId: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  volume: number;
}

export interface OrderBook {
  assetId: string;
  bids: OrderBookLevel[]; // Buy orders (descending price)
  asks: OrderBookLevel[]; // Sell orders (ascending price)
  lastUpdate: number;
}

export interface TradeOrder {
  orderId: string;
  userId: string;
  assetId: string;
  assetType: AssetType;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price?: number; // For limit orders
  limitPrice?: number;
  status: OrderStatus;
  filledPrice?: number;
  filledQuantity?: number;
  fees: {
    brokerage?: number;
    clearing?: number;
    stamp?: number;
    trading?: number; // For crypto
    total: number;
  };
  totalAmount: number;
  createdAt: number;
  filledAt?: number;
  cancelledAt?: number;
}

export interface Holding {
  assetId: string;
  symbol: string;
  assetType: AssetType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  currency: Currency;
  sector?: string;
}

export interface Wallet {
  userId: string;
  balances: {
    MYR: number;
    USDT: number;
  };
  holdings: Holding[];
  totalEquity: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  lastUpdate: number;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'DIVERSIFICATION' | 'RISK_WARNING' | 'REBALANCE' | 'OPPORTUNITY' | 'EDUCATION';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assetType?: AssetType;
  relatedAssets?: string[];
  createdAt: number;
}

