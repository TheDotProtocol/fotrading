import { Stock, User, Portfolio, Holding, Transaction, Order, AIInsight } from '@/types';

export const mockStocks: Stock[] = [
  { ticker: 'MAYBANK', name: 'Malayan Banking Berhad', price: 9.12, change: 0.22, changePercent: 2.47, volume: 12500000, sector: 'Banking', marketCap: 108000000000 },
  { ticker: 'CIMB', name: 'CIMB Group Holdings Berhad', price: 6.25, change: -0.05, changePercent: -0.79, volume: 8500000, sector: 'Banking', marketCap: 62000000000 },
  { ticker: 'PETRONAS', name: 'Petronas Gas Berhad', price: 7.80, change: 0.12, changePercent: 1.56, volume: 3200000, sector: 'Energy', marketCap: 15500000000 },
  { ticker: 'TENAGA', name: 'Tenaga Nasional Berhad', price: 11.45, change: 0.15, changePercent: 1.33, volume: 5200000, sector: 'Utilities', marketCap: 65000000000 },
  { ticker: 'PUBLIC', name: 'Public Bank Berhad', price: 4.28, change: -0.08, changePercent: -1.83, volume: 6800000, sector: 'Banking', marketCap: 83000000000 },
  { ticker: 'GENTING', name: 'Genting Berhad', price: 4.95, change: 0.25, changePercent: 5.32, volume: 12000000, sector: 'Gaming', marketCap: 19000000000 },
  { ticker: 'SIME', name: 'Sime Darby Berhad', price: 2.65, change: 0.03, changePercent: 1.15, volume: 4500000, sector: 'Conglomerate', marketCap: 18000000000 },
  { ticker: 'IOI', name: 'IOI Corporation Berhad', price: 3.88, change: -0.12, changePercent: -3.00, volume: 2800000, sector: 'Plantation', marketCap: 25000000000 },
  { ticker: 'KLK', name: 'Kuala Lumpur Kepong Berhad', price: 22.50, change: 0.40, changePercent: 1.81, volume: 1500000, sector: 'Plantation', marketCap: 24000000000 },
  { ticker: 'MAXIS', name: 'Maxis Berhad', price: 3.55, change: 0.05, changePercent: 1.43, volume: 5200000, sector: 'Telecommunications', marketCap: 27000000000 },
];

export const generateMockUser = (email: string, name?: string): User => ({
  id: `user_${Date.now()}`,
  email,
  name,
  kycStatus: 'PENDING',
  createdAt: new Date().toISOString(),
});

export const generateMockPortfolio = (userId: string, holdings: Holding[]): Portfolio => {
  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgPrice * h.qty), 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  
  // Generate equity history (last 30 days)
  const equityHistory = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    equityHistory.push({
      date: date.toISOString().split('T')[0],
      value: currentValue * (1 + variance),
    });
  }

  return {
    userId,
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    cashBalance: 5000, // Mock starting cash
    holdings,
    equityHistory,
  };
};

export const calculateFees = (amount: number, qty: number): { brokerage: number; clearing: number; stamp: number; total: number } => {
  // Malaysian brokerage fee: typically 0.1% - 0.42% (min RM8)
  const brokerage = Math.max(amount * 0.001, 8);
  
  // Clearing fee: 0.03% (min RM2)
  const clearing = Math.max(amount * 0.0003, 2);
  
  // Stamp duty: RM1 per RM1000 (capped at RM200)
  const stamp = Math.min(Math.ceil(amount / 1000), 200);
  
  const total = brokerage + clearing + stamp;
  
  return { brokerage, clearing, stamp, total };
};

export const generateAIInsights = (portfolio: Portfolio | null, stocks: Stock[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = new Date().toISOString();

  if (!portfolio) {
    insights.push({
      id: 'insight_1',
      type: 'EDUCATION',
      title: 'Welcome to Trading!',
      message: 'Start by funding your account and exploring Malaysian stocks. Remember to diversify your portfolio.',
      priority: 'LOW',
      createdAt: now,
    });
    return insights;
  }

  // Check for concentration risk
  if (portfolio.holdings.length > 0) {
    const largestHolding = portfolio.holdings.reduce((max, h) => 
      h.totalValue > max.totalValue ? h : max
    );
    const concentrationPercent = (largestHolding.totalValue / portfolio.currentValue) * 100;
    
    if (concentrationPercent > 50) {
      insights.push({
        id: 'insight_2',
        type: 'RISK_WARNING',
        title: 'Portfolio Concentration Risk',
        message: `Your portfolio is heavily concentrated in ${largestHolding.ticker} (${concentrationPercent.toFixed(1)}%). Consider diversifying across different sectors to reduce risk.`,
        priority: 'HIGH',
        createdAt: now,
      });
    }
  }

  // Check for sector concentration
  const sectorAllocation: Record<string, number> = {};
  portfolio.holdings.forEach(h => {
    sectorAllocation[h.sector] = (sectorAllocation[h.sector] || 0) + h.totalValue;
  });
  
  const bankingExposure = (sectorAllocation['Banking'] || 0) / portfolio.currentValue;
  if (bankingExposure > 0.4) {
    insights.push({
      id: 'insight_3',
      type: 'RISK_WARNING',
      title: 'High Banking Sector Exposure',
      message: 'You have significant exposure to the banking sector. Consider diversifying into other sectors like technology, consumer goods, or utilities.',
      priority: 'MEDIUM',
      createdAt: now,
    });
  }

  // Market volatility check
  const downStocks = stocks.filter(s => s.changePercent < -2).length;
  if (downStocks > 3) {
    insights.push({
      id: 'insight_4',
      type: 'MARKET_UPDATE',
      title: 'Market Volatility Detected',
      message: 'Several stocks are experiencing significant declines today. This is normal market behavior. Stay calm and stick to your investment strategy.',
      priority: 'MEDIUM',
      createdAt: now,
    });
  }

  // Portfolio performance
  if (portfolio.totalPnlPercent < -10) {
    insights.push({
      id: 'insight_5',
      type: 'PORTFOLIO_ANALYSIS',
      title: 'Portfolio Underperformance',
      message: 'Your portfolio is down more than 10%. Review your holdings and consider if your investment thesis still holds. Remember: investing is a long-term game.',
      priority: 'HIGH',
      createdAt: now,
    });
  } else if (portfolio.totalPnlPercent > 10) {
    insights.push({
      id: 'insight_6',
      type: 'PORTFOLIO_ANALYSIS',
      title: 'Strong Portfolio Performance',
      message: 'Great job! Your portfolio is performing well. Consider taking some profits or rebalancing to lock in gains.',
      priority: 'LOW',
      createdAt: now,
    });
  }

  // Education insights
  if (insights.length === 0) {
    insights.push({
      id: 'insight_7',
      type: 'EDUCATION',
      title: 'Investment Tip',
      message: 'Regular monitoring of your portfolio is important, but avoid making emotional decisions based on short-term market movements.',
      priority: 'LOW',
      createdAt: now,
    });
  }

  return insights;
};

