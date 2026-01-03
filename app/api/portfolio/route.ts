import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPortfolio, updatePortfolio } from '@/lib/db';
import { mockStocks } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let portfolio = getPortfolio(user.id);

  // Create default portfolio with sample data if doesn't exist
  if (!portfolio) {
    const sampleHoldings = [
      {
        ticker: 'MAYBANK',
        qty: 100,
        avgPrice: 9.00,
        currentPrice: mockStocks.find(s => s.ticker === 'MAYBANK')?.price || 9.12,
        totalValue: 0,
        pnl: 0,
        pnlPercent: 0,
        sector: 'Banking',
      },
      {
        ticker: 'CIMB',
        qty: 200,
        avgPrice: 6.20,
        currentPrice: mockStocks.find(s => s.ticker === 'CIMB')?.price || 6.25,
        totalValue: 0,
        pnl: 0,
        pnlPercent: 0,
        sector: 'Banking',
      },
    ];

    // Calculate values
    sampleHoldings.forEach(h => {
      h.totalValue = h.qty * h.currentPrice;
      const costBasis = h.avgPrice * h.qty;
      h.pnl = h.totalValue - costBasis;
      h.pnlPercent = costBasis > 0 ? (h.pnl / costBasis) * 100 : 0;
    });

    const totalInvested = sampleHoldings.reduce((sum, h) => sum + (h.avgPrice * h.qty), 0);
    const currentValue = sampleHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Generate equity history
    const equityHistory = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const variance = (Math.random() - 0.5) * 0.1;
      equityHistory.push({
        date: date.toISOString().split('T')[0],
        value: currentValue * (1 + variance),
      });
    }

    portfolio = {
      userId: user.id,
      totalInvested,
      currentValue,
      totalPnl,
      totalPnlPercent,
      cashBalance: 5000,
      holdings: sampleHoldings,
      equityHistory,
    };
    updatePortfolio(portfolio);
  }

  // Update current prices from market data
  portfolio.holdings = portfolio.holdings.map(holding => {
    const stock = mockStocks.find(s => s.ticker === holding.ticker);
    const currentPrice = stock?.price || holding.currentPrice;
    const totalValue = holding.qty * currentPrice;
    const costBasis = holding.avgPrice * holding.qty;
    const pnl = totalValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      ...holding,
      currentPrice,
      totalValue,
      pnl,
      pnlPercent,
    };
  });

  // Recalculate totals
  portfolio.currentValue = portfolio.holdings.reduce((sum, h) => sum + h.totalValue, 0);
  portfolio.totalInvested = portfolio.holdings.reduce((sum, h) => sum + (h.avgPrice * h.qty), 0);
  portfolio.totalPnl = portfolio.currentValue - portfolio.totalInvested;
  portfolio.totalPnlPercent = portfolio.totalInvested > 0 
    ? (portfolio.totalPnl / portfolio.totalInvested) * 100 
    : 0;

  updatePortfolio(portfolio);

  return NextResponse.json({ portfolio });
}

