import { User, Order, Transaction, Portfolio } from '@/types';
import db from './db';

// Mock database for admin portal
interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'SUPER_ADMIN' | 'COMPLIANCE' | 'SUPPORT';
  name: string;
  lastLogin?: string;
}

interface RiskFlag {
  id: string;
  userId: string;
  level: 'NONE' | 'MEDIUM' | 'HIGH';
  reason: string;
  notes: string;
  flaggedBy: string;
  flaggedAt: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  category: 'LOGIN' | 'DEPOSIT' | 'WITHDRAW' | 'TRADE_DISPUTE' | 'KYC' | 'OTHER';
  subject: string;
  messages: Array<{
    id: string;
    from: 'USER' | 'ADMIN';
    message: string;
    timestamp: string;
  }>;
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
}

interface TradingGroup {
  id: string;
  name: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  adminTrader: string;
  feeStructure: {
    performanceFee: number;
    managementFee: number;
    minDeposit: number;
    lockInPeriod: number;
  };
  status: 'ACTIVE' | 'PAUSED';
  poolBalance: number;
  members: Array<{
    userId: string;
    contribution: number;
    sharePercent: number;
    realizedPnl: number;
  }>;
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'USER' | 'TRADE' | 'KYC' | 'ACCOUNT' | 'SYSTEM';
  targetId: string;
  notes: string;
  timestamp: string;
}

interface SystemConfig {
  tradingFeePercent: number;
  depositLimit: number;
  withdrawalLimit: number;
  kycRiskThreshold: number;
  tradingHours: {
    start: string;
    end: string;
  };
}

// In-memory storage
const adminUsers: Map<string, AdminUser> = new Map();
const riskFlags: Map<string, RiskFlag[]> = new Map();
const supportTickets: Map<string, SupportTicket> = new Map();
const tradingGroups: Map<string, TradingGroup> = new Map();
const auditLogs: AuditLog[] = [];
const systemConfig: SystemConfig = {
  tradingFeePercent: 0.1,
  depositLimit: 100000,
  withdrawalLimit: 50000,
  kycRiskThreshold: 75,
  tradingHours: {
    start: '09:00',
    end: '17:00',
  },
};

// Seed admin users
const seedAdminUsers = () => {
  adminUsers.set('admin', {
    id: 'admin_1',
    username: 'admin',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    name: 'Super Admin',
  });
  adminUsers.set('compliance', {
    id: 'admin_2',
    username: 'compliance',
    password: 'compliance123',
    role: 'COMPLIANCE',
    name: 'Compliance Officer',
  });
  adminUsers.set('support', {
    id: 'admin_3',
    username: 'support',
    password: 'support123',
    role: 'SUPPORT',
    name: 'Support Agent',
  });
};

seedAdminUsers();

// Helper functions
export const getAdminUser = (username: string): AdminUser | undefined => {
  return adminUsers.get(username);
};

export const verifyAdminPassword = (username: string, password: string): boolean => {
  const admin = adminUsers.get(username);
  return admin?.password === password;
};

export const getUserRiskFlags = (userId: string): RiskFlag[] => {
  return riskFlags.get(userId) || [];
};

export const addRiskFlag = (userId: string, flag: Omit<RiskFlag, 'id' | 'flaggedAt'>): RiskFlag => {
  const newFlag: RiskFlag = {
    ...flag,
    id: `flag_${Date.now()}`,
    flaggedAt: new Date().toISOString(),
  };
  const flags = riskFlags.get(userId) || [];
  flags.push(newFlag);
  riskFlags.set(userId, flags);
  return newFlag;
};

export const getSupportTickets = (): SupportTicket[] => {
  return Array.from(supportTickets.values());
};

export const getSupportTicket = (id: string): SupportTicket | undefined => {
  return supportTickets.get(id);
};

export const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): SupportTicket => {
  const newTicket: SupportTicket = {
    ...ticket,
    id: `ticket_${Date.now()}`,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };
  supportTickets.set(newTicket.id, newTicket);
  return newTicket;
};

export const getTradingGroups = (): TradingGroup[] => {
  return Array.from(tradingGroups.values());
};

export const createTradingGroup = (group: Omit<TradingGroup, 'id' | 'createdAt' | 'poolBalance' | 'members'>): TradingGroup => {
  const newGroup: TradingGroup = {
    ...group,
    id: `group_${Date.now()}`,
    poolBalance: 0,
    members: [],
    createdAt: new Date().toISOString(),
  };
  tradingGroups.set(newGroup.id, newGroup);
  return newGroup;
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog => {
  const newLog: AuditLog = {
    ...log,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditLogs.push(newLog);
  return newLog;
};

export const getAuditLogs = (limit = 100): AuditLog[] => {
  return auditLogs.slice(-limit).reverse();
};

export const getSystemConfig = (): SystemConfig => {
  return systemConfig;
};

export const updateSystemConfig = (updates: Partial<SystemConfig>): SystemConfig => {
  Object.assign(systemConfig, updates);
  return systemConfig;
};

// Calculate dashboard metrics
export const getDashboardMetrics = () => {
  const users = Array.from(db.users.values());
  const orders = Array.from(db.orders.values()).flat();
  const portfolios = Array.from(db.portfolios.values());
  const transactions = Array.from(db.transactions.values()).flat();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const todayVolume = todayOrders.reduce((sum, o) => sum + (o.qty * o.price), 0);
  const totalDeposits = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.brokerageFee + o.clearingFee + o.stampDuty, 0);
  const flaggedCount = Array.from(riskFlags.values()).flat().filter(f => f.level === 'HIGH').length;

  return {
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.kycStatus === 'APPROVED').length,
    totalDeposits,
    totalWithdrawals,
    todayVolume,
    todayTrades: todayOrders.length,
    flaggedAccounts: flaggedCount,
    totalRevenue,
    totalTrades: orders.length,
  };
};

export type { AdminUser, RiskFlag, SupportTicket, TradingGroup, AuditLog, SystemConfig };

