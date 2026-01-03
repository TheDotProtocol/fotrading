// Simple in-memory database for demo purposes
// In production, this would be replaced with a real database

import { User, KYCData, Transaction, Order, Portfolio, Holding } from '@/types';
import { generateMockUser, generateMockPortfolio, mockStocks } from './mockData';

interface Database {
  users: Map<string, User>;
  sessions: Map<string, string>; // sessionId -> userId
  kycData: Map<string, KYCData>;
  transactions: Map<string, Transaction[]>;
  orders: Map<string, Order[]>;
  portfolios: Map<string, Portfolio>;
}

const db: Database = {
  users: new Map(),
  sessions: new Map(),
  kycData: new Map(),
  transactions: new Map(),
  orders: new Map(),
  portfolios: new Map(),
};

// Seed demo user
const demoUser = generateMockUser('demo@fotrading.demo', 'Demo User');
demoUser.kycStatus = 'APPROVED';
demoUser.riskCategory = 'Retail';
db.users.set(demoUser.id, demoUser);

// Seed demo portfolio
const demoHoldings: Holding[] = [
  {
    ticker: 'MAYBANK',
    qty: 100,
    avgPrice: 9.00,
    currentPrice: 9.12,
    totalValue: 912,
    pnl: 12,
    pnlPercent: 1.33,
    sector: 'Banking',
  },
  {
    ticker: 'CIMB',
    qty: 200,
    avgPrice: 6.20,
    currentPrice: 6.25,
    totalValue: 1250,
    pnl: 10,
    pnlPercent: 0.81,
    sector: 'Banking',
  },
];

const demoPortfolio = generateMockPortfolio(demoUser.id, demoHoldings);
db.portfolios.set(demoUser.id, demoPortfolio);

export const getUserByEmail = (email: string): User | undefined => {
  return Array.from(db.users.values()).find(u => u.email === email);
};

export const getUserById = (id: string): User | undefined => {
  return db.users.get(id);
};

export const createUser = (email: string, password: string, name: string): User => {
  const user = generateMockUser(email, name);
  db.users.set(user.id, user);
  return user;
};

export const createSession = (userId: string): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  db.sessions.set(sessionId, userId);
  return sessionId;
};

export const getUserIdFromSession = (sessionId: string): string | undefined => {
  return db.sessions.get(sessionId);
};

export const deleteSession = (sessionId: string): void => {
  db.sessions.delete(sessionId);
};

export const getKYCData = (userId: string): KYCData | undefined => {
  return db.kycData.get(userId);
};

export const updateKYCData = (userId: string, kycData: Partial<KYCData>): KYCData => {
  const existing = db.kycData.get(userId) || {
    userId,
    kycStatus: 'PENDING' as const,
  };
  const updated = { ...existing, ...kycData };
  db.kycData.set(userId, updated);
  
  // Update user KYC status
  const user = db.users.get(userId);
  if (user) {
    user.kycStatus = updated.kycStatus;
    user.riskCategory = updated.riskCategory;
    db.users.set(userId, user);
  }
  
  return updated;
};

export const getTransactions = (userId: string): Transaction[] => {
  return db.transactions.get(userId) || [];
};

export const addTransaction = (transaction: Transaction): void => {
  const existing = db.transactions.get(transaction.userId) || [];
  db.transactions.set(transaction.userId, [transaction, ...existing]);
};

export const getOrders = (userId: string): Order[] => {
  return db.orders.get(userId) || [];
};

export const addOrder = (order: Order): void => {
  const existing = db.orders.get(order.userId) || [];
  db.orders.set(order.userId, [order, ...existing]);
  
  // Update portfolio if order is filled
  if (order.status === 'FILLED') {
    const portfolio = db.portfolios.get(order.userId);
    if (portfolio) {
      // Update holdings and cash balance
      if (order.orderType === 'BUY') {
        portfolio.cashBalance -= order.totalAmount;
        // Update or add holding
        const existingHolding = portfolio.holdings.find(h => h.ticker === order.ticker);
        if (existingHolding) {
          const totalQty = existingHolding.qty + order.qty;
          const totalCost = (existingHolding.avgPrice * existingHolding.qty) + (order.price * order.qty);
          existingHolding.qty = totalQty;
          existingHolding.avgPrice = totalCost / totalQty;
          existingHolding.currentPrice = order.price;
          existingHolding.totalValue = totalQty * order.price;
          existingHolding.pnl = existingHolding.totalValue - totalCost;
          existingHolding.pnlPercent = (existingHolding.pnl / totalCost) * 100;
        } else {
          const stock = mockStocks.find(s => s.ticker === order.ticker);
          portfolio.holdings.push({
            ticker: order.ticker,
            qty: order.qty,
            avgPrice: order.price,
            currentPrice: order.price,
            totalValue: order.qty * order.price,
            pnl: 0,
            pnlPercent: 0,
            sector: stock?.sector || 'Unknown',
          });
        }
      } else {
        // SELL
        portfolio.cashBalance += order.totalAmount;
        const holding = portfolio.holdings.find(h => h.ticker === order.ticker);
        if (holding) {
          holding.qty -= order.qty;
          if (holding.qty <= 0) {
            portfolio.holdings = portfolio.holdings.filter(h => h.ticker !== order.ticker);
          } else {
            holding.totalValue = holding.qty * order.price;
            holding.currentPrice = order.price;
            const costBasis = holding.avgPrice * holding.qty;
            holding.pnl = holding.totalValue - costBasis;
            holding.pnlPercent = (holding.pnl / costBasis) * 100;
          }
        }
      }
      
      // Recalculate portfolio totals
      portfolio.totalInvested = portfolio.holdings.reduce((sum, h) => sum + (h.avgPrice * h.qty), 0);
      portfolio.currentValue = portfolio.holdings.reduce((sum, h) => sum + h.totalValue, 0);
      portfolio.totalPnl = portfolio.currentValue - portfolio.totalInvested;
      portfolio.totalPnlPercent = portfolio.totalInvested > 0 
        ? (portfolio.totalPnl / portfolio.totalInvested) * 100 
        : 0;
      
      db.portfolios.set(order.userId, portfolio);
    }
  }
};

export const getPortfolio = (userId: string): Portfolio | undefined => {
  return db.portfolios.get(userId);
};

export const updatePortfolio = (portfolio: Portfolio): void => {
  db.portfolios.set(portfolio.userId, portfolio);
};

export default db;

