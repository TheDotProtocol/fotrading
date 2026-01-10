// AI Insights Generator (Simulation Only)

import { AIInsight, Wallet, AssetType } from './types';
import { getPortfolioBreakdown } from './wallet';
import { getWallet } from './wallet';
import { getAllCurrentPrices } from './priceSimulator';

// In-memory insights storage
const insights: Map<string, AIInsight[]> = new Map();

// Generate insights for user
export function generateInsights(userId: string): AIInsight[] {
  const wallet = getWallet(userId);
  if (!wallet) return [];
  
  const breakdown = getPortfolioBreakdown(userId);
  if (!breakdown) return [];
  
  const generated: AIInsight[] = [];
  const now = Date.now();
  
  // Insight 1: Diversification check
  if (breakdown.cryptoPercent > 70) {
    generated.push({
      id: `insight_${userId}_${now}_1`,
      userId,
      type: 'DIVERSIFICATION',
      title: 'High Crypto Concentration',
      message: `Your portfolio is heavily weighted toward cryptocurrency (${breakdown.cryptoPercent.toFixed(1)}%). While crypto can offer high returns, it also comes with extreme volatility. Consider rebalancing by adding more stable equity positions to reduce overall portfolio risk.`,
      priority: 'HIGH',
      assetType: 'CRYPTO',
      relatedAssets: wallet.holdings.filter(h => h.assetType === 'CRYPTO').map(h => h.assetId),
      createdAt: now,
    });
  }
  
  if (breakdown.equityPercent > 80) {
    generated.push({
      id: `insight_${userId}_${now}_2`,
      userId,
      type: 'DIVERSIFICATION',
      title: 'Consider Crypto Diversification',
      message: `Your portfolio is heavily weighted toward equities (${breakdown.equityPercent.toFixed(1)}%). While stocks provide stability, adding a small allocation to cryptocurrencies (5-10%) could provide diversification benefits and exposure to a growing asset class.`,
      priority: 'MEDIUM',
      assetType: 'EQUITY',
      relatedAssets: wallet.holdings.filter(h => h.assetType === 'EQUITY').map(h => h.assetId),
      createdAt: now,
    });
  }
  
  // Insight 2: Risk warnings
  const highVolatilityHoldings = wallet.holdings.filter(h => {
    const asset = getAllCurrentPrices().find(a => a.assetId === h.assetId);
    return asset && asset.volatilityFactor > 0.04 && h.assetType === 'CRYPTO';
  });
  
  if (highVolatilityHoldings.length > 0 && breakdown.cryptoPercent > 30) {
    generated.push({
      id: `insight_${userId}_${now}_3`,
      userId,
      type: 'RISK_WARNING',
      title: 'High Volatility Alert',
      message: `You hold ${highVolatilityHoldings.length} high-volatility cryptocurrency position${highVolatilityHoldings.length > 1 ? 's' : ''}. Crypto markets can experience sudden 20-30% swings. Ensure you're comfortable with this level of risk and consider setting stop-loss orders to protect your capital.`,
      priority: 'HIGH',
      assetType: 'CRYPTO',
      relatedAssets: highVolatilityHoldings.map(h => h.assetId),
      createdAt: now,
    });
  }
  
  // Insight 3: Rebalancing opportunities
  if (breakdown.equityPercent > 0 && breakdown.cryptoPercent > 0) {
    const targetRatio = 0.6; // 60% equity, 40% crypto (example)
    const currentRatio = breakdown.equityPercent / (breakdown.equityPercent + breakdown.cryptoPercent);
    
    if (Math.abs(currentRatio - targetRatio) > 0.2) {
      generated.push({
        id: `insight_${userId}_${now}_4`,
        userId,
        type: 'REBALANCE',
        title: 'Portfolio Rebalancing Opportunity',
        message: `Your current allocation is ${breakdown.equityPercent.toFixed(1)}% equities and ${breakdown.cryptoPercent.toFixed(1)}% crypto. Consider rebalancing to maintain your target allocation and reduce risk. Rebalancing helps lock in gains and maintain your desired risk profile.`,
        priority: 'MEDIUM',
        createdAt: now,
      });
    }
  }
  
  // Insight 4: Performance-based insights
  wallet.holdings.forEach(holding => {
    if (holding.pnlPercent > 20 && holding.assetType === 'CRYPTO') {
      generated.push({
        id: `insight_${userId}_${now}_5_${holding.assetId}`,
        userId,
        type: 'OPPORTUNITY',
        title: `Consider Taking Profits on ${holding.symbol}`,
        message: `${holding.symbol} is up ${holding.pnlPercent.toFixed(1)}%. Crypto markets are volatile - consider taking partial profits to lock in gains while maintaining some exposure for potential further upside.`,
        priority: 'MEDIUM',
        assetType: 'CRYPTO',
        relatedAssets: [holding.assetId],
        createdAt: now,
      });
    }
    
    if (holding.pnlPercent < -15 && holding.assetType === 'CRYPTO') {
      generated.push({
        id: `insight_${userId}_${now}_6_${holding.assetId}`,
        userId,
        type: 'RISK_WARNING',
        title: `${holding.symbol} Down ${Math.abs(holding.pnlPercent).toFixed(1)}%`,
        message: `${holding.symbol} has declined ${Math.abs(holding.pnlPercent).toFixed(1)}%. Consider reviewing your position and risk tolerance. You may want to set a stop-loss to limit further downside, or if you believe in the long-term value, this could be an opportunity to average down.`,
        priority: 'MEDIUM',
        assetType: 'CRYPTO',
        relatedAssets: [holding.assetId],
        createdAt: now,
      });
    }
  });
  
  // Insight 5: Sector concentration (for equities)
  const equityHoldings = wallet.holdings.filter(h => h.assetType === 'EQUITY');
  const sectorCount: Record<string, number> = {};
  equityHoldings.forEach(h => {
    if (h.sector) {
      sectorCount[h.sector] = (sectorCount[h.sector] || 0) + h.totalValue;
    }
  });
  
  const totalEquityValue = equityHoldings.reduce((sum, h) => sum + h.totalValue, 0);
  const maxSectorPercent = Math.max(...Object.values(sectorCount).map(v => (v / totalEquityValue) * 100));
  
  if (maxSectorPercent > 50 && totalEquityValue > 0) {
    const topSector = Object.entries(sectorCount).find(([_, v]) => (v / totalEquityValue) * 100 === maxSectorPercent)?.[0];
    generated.push({
      id: `insight_${userId}_${now}_7`,
      userId,
      type: 'DIVERSIFICATION',
      title: 'Sector Concentration Risk',
      message: `Your equity portfolio is ${maxSectorPercent.toFixed(1)}% concentrated in the ${topSector} sector. Consider diversifying across multiple sectors (Banking, Technology, Healthcare, Utilities) to reduce sector-specific risk.`,
      priority: 'MEDIUM',
      assetType: 'EQUITY',
      createdAt: now,
    });
  }
  
  // Insight 6: Educational
  if (wallet.holdings.length === 0) {
    generated.push({
      id: `insight_${userId}_${now}_8`,
      userId,
      type: 'EDUCATION',
      title: 'Start Building Your Portfolio',
      message: 'You haven\'t made any trades yet. Consider starting with a diversified mix of equities and cryptocurrencies. Equities offer stability and dividends, while crypto provides growth potential. A balanced approach can help manage risk while capturing opportunities.',
      priority: 'LOW',
      createdAt: now,
    });
  }
  
  // Store insights
  insights.set(userId, generated);
  
  return generated;
}

// Get user insights
export function getUserInsights(userId: string): AIInsight[] {
  return insights.get(userId) || [];
}

// Clear old insights (keep only last 24 hours)
export function clearOldInsights() {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  insights.forEach((userInsights, userId) => {
    const recent = userInsights.filter(insight => insight.createdAt > oneDayAgo);
    if (recent.length === 0) {
      insights.delete(userId);
    } else {
      insights.set(userId, recent);
    }
  });
}

// Start insight generator
let insightInterval: NodeJS.Timeout | null = null;

export function startInsightGenerator() {
  if (insightInterval) return;
  
  // Generate insights every 5 minutes
  insightInterval = setInterval(() => {
    // Generate for all users with wallets
    insights.forEach((_, userId) => {
      generateInsights(userId);
    });
    
    // Clear old insights
    clearOldInsights();
  }, 5 * 60 * 1000);
}

export function stopInsightGenerator() {
  if (insightInterval) {
    clearInterval(insightInterval);
    insightInterval = null;
  }
}

