import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureMarketEngineStarted } from '@/lib/marketEngineInit';
import { getOrCreateWallet, recalculatePortfolio, getPortfolioBreakdown } from '@/market-engine';
import { getAssetBySymbol } from '@/market-engine';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureMarketEngineStarted();
  
  // Get or create wallet
  let wallet = getOrCreateWallet(user.id);
  
  // Initialize with sample holdings if empty
  if (wallet.holdings.length === 0 && wallet.balances.MYR === 10000) {
    // Add sample equity holdings
    const maybankAsset = getAssetBySymbol('MAYBANK');
    const cimbAsset = getAssetBySymbol('CIMB');
    
    if (maybankAsset && cimbAsset) {
      // Simulate buying some stocks
      const { executeMarketOrder } = await import('@/market-engine/tradeEngine');
      const { updateWalletAfterTrade } = await import('@/market-engine/wallet');
      
      try {
        const order1 = executeMarketOrder(user.id, maybankAsset.assetId, 'BUY', 100);
        updateWalletAfterTrade(user.id, order1);
        
        const order2 = executeMarketOrder(user.id, cimbAsset.assetId, 'BUY', 200);
        updateWalletAfterTrade(user.id, order2);
        
        // Refresh wallet
        wallet = getOrCreateWallet(user.id);
      } catch (error) {
        console.error('Error initializing sample holdings:', error);
      }
    }
  }
  
  // Recalculate portfolio
  recalculatePortfolio(user.id);
  wallet = getOrCreateWallet(user.id);
  const breakdown = getPortfolioBreakdown(user.id);
  
  // Generate equity history (last 30 days)
  const equityHistory = [];
  const today = new Date();
  const baseValue = wallet.totalEquity;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    equityHistory.push({
      date: date.toISOString().split('T')[0],
      value: baseValue * (1 + variance),
    });
  }
  
  // Convert holdings to portfolio format
  const holdings = wallet.holdings.map(holding => ({
    ticker: holding.symbol,
    qty: holding.quantity,
    avgPrice: holding.avgPrice,
    currentPrice: holding.currentPrice,
    totalValue: holding.totalValue,
    pnl: holding.pnl,
    pnlPercent: holding.pnlPercent,
    sector: holding.sector || '',
    assetType: holding.assetType,
    currency: holding.currency,
  }));
  
  // Convert wallet to portfolio format for compatibility
  const portfolio = {
    userId: wallet.userId,
    totalInvested: wallet.totalInvested,
    currentValue: breakdown ? breakdown.equities + breakdown.crypto : wallet.totalEquity,
    totalPnl: wallet.totalPnl,
    totalPnlPercent: wallet.totalPnlPercent,
    cashBalance: wallet.balances.MYR,
    usdtBalance: wallet.balances.USDT,
    holdings,
    equityHistory,
    breakdown: breakdown || {
      totalEquity: wallet.totalEquity,
      cash: wallet.balances.MYR,
      equities: 0,
      crypto: 0,
      equityPercent: 0,
      cryptoPercent: 0,
      cashPercent: 100,
    },
  };

  return NextResponse.json({ portfolio });
}

