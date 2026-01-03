export interface User {
  id: string;
  email: string;
  name?: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';
  riskCategory?: 'Retail' | 'Professional';
  createdAt: string;
}

export interface KYCData {
  userId: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT';
  riskCategory?: 'Retail' | 'Professional';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  currency: 'MYR';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  method?: 'FPX' | 'BANK_TRANSFER';
  createdAt: string;
  completedAt?: string;
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
  marketCap?: number;
}

export interface Order {
  id: string;
  userId: string;
  orderType: 'BUY' | 'SELL';
  ticker: string;
  qty: number;
  price: number;
  orderPrice: number; // For limit orders
  orderTypeDetail: 'MARKET' | 'LIMIT';
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'PARTIAL';
  brokerageFee: number;
  clearingFee: number;
  stampDuty: number;
  totalAmount: number;
  createdAt: string;
  filledAt?: string;
  instrumentType?: 'STOCK' | 'FUTURE' | 'FOREX' | 'ETF' | 'BOND';
  contractSize?: number; // For futures
  lotSize?: number; // For forex
  margin?: number; // For futures/forex
}

export interface Holding {
  ticker: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  sector: string;
}

export interface Portfolio {
  userId: string;
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  cashBalance: number;
  holdings: Holding[];
  equityHistory: { date: string; value: number }[];
}

export interface AIInsight {
  id: string;
  type: 'EDUCATION' | 'RISK_WARNING' | 'MARKET_UPDATE' | 'PORTFOLIO_ANALYSIS';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

