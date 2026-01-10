// Unified Wallet & Portfolio Engine

import { Wallet, Holding, TradeOrder, Asset } from './types';
import { getCurrentPrice } from './priceSimulator';
import { getAssetById } from './assetRegistry';
import { getUserOrders } from './tradeEngine';

// In-memory wallet storage
const wallets: Map<string, Wallet> = new Map();

// Initialize wallet for user
export function initializeWallet(userId: string, initialBalance: number = 10000): Wallet {
  const wallet: Wallet = {
    userId,
    balances: {
      MYR: initialBalance,
      USDT: 0,
    },
    holdings: [],
    totalEquity: initialBalance,
    totalInvested: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    lastUpdate: Date.now(),
  };
  
  wallets.set(userId, wallet);
  return wallet;
}

// Get wallet
export function getWallet(userId: string): Wallet | undefined {
  return wallets.get(userId);
}

// Get or create wallet
export function getOrCreateWallet(userId: string): Wallet {
  const existing = getWallet(userId);
  if (existing) return existing;
  return initializeWallet(userId);
}

// Update wallet after trade
export function updateWalletAfterTrade(userId: string, order: TradeOrder) {
  const wallet = getOrCreateWallet(userId);
  const asset = getAssetById(order.assetId);
  if (!asset) return;
  
  const isBuy = order.side === 'BUY' || order.side === 'LONG';
  const isSell = order.side === 'SELL' || order.side === 'SHORT';
  
  if (!order.filledPrice || !order.filledQuantity) return;
  
  const fillPrice = order.filledPrice;
  const fillQty = order.filledQuantity;
  const totalCost = fillPrice * fillQty + order.fees.total;
  
  if (isBuy) {
    // Deduct balance
    if (asset.currency === 'MYR') {
      wallet.balances.MYR -= totalCost;
    } else if (asset.currency === 'USDT') {
      wallet.balances.USDT -= totalCost;
    }
    
    // Add or update holding
    const existingHolding = wallet.holdings.find(h => h.assetId === order.assetId);
    if (existingHolding) {
      // Update existing holding
      const totalQty = existingHolding.quantity + fillQty;
      const totalCostBasis = (existingHolding.avgPrice * existingHolding.quantity) + (fillPrice * fillQty);
      existingHolding.quantity = totalQty;
      existingHolding.avgPrice = totalCostBasis / totalQty;
    } else {
      // Create new holding
      wallet.holdings.push({
        assetId: order.assetId,
        symbol: order.symbol,
        assetType: order.assetType,
        quantity: fillQty,
        avgPrice: fillPrice,
        currentPrice: fillPrice,
        totalValue: fillPrice * fillQty,
        pnl: 0,
        pnlPercent: 0,
        currency: asset.currency,
        sector: asset.sector,
      });
    }
  } else if (isSell) {
    // Find holding
    const holding = wallet.holdings.find(h => h.assetId === order.assetId);
    if (!holding || holding.quantity < fillQty) {
      throw new Error('Insufficient holdings');
    }
    
    // Add balance
    const proceeds = fillPrice * fillQty - order.fees.total;
    if (asset.currency === 'MYR') {
      wallet.balances.MYR += proceeds;
    } else if (asset.currency === 'USDT') {
      wallet.balances.USDT += proceeds;
    }
    
    // Update holding
    holding.quantity -= fillQty;
    if (holding.quantity === 0) {
      // Remove holding if fully sold
      wallet.holdings = wallet.holdings.filter(h => h.assetId !== order.assetId);
    }
  }
  
  // Recalculate portfolio
  recalculatePortfolio(userId);
}

// Recalculate portfolio values
export function recalculatePortfolio(userId: string) {
  const wallet = getWallet(userId);
  if (!wallet) return;
  
  let totalInvested = 0;
  let totalCurrentValue = 0;
  
  // Update holdings with current prices
  wallet.holdings.forEach(holding => {
    const currentAsset = getCurrentPrice(holding.assetId);
    if (currentAsset) {
      holding.currentPrice = currentAsset.lastPrice;
      holding.totalValue = holding.quantity * currentAsset.lastPrice;
      holding.pnl = holding.totalValue - (holding.avgPrice * holding.quantity);
      holding.pnlPercent = holding.avgPrice > 0 
        ? (holding.pnl / (holding.avgPrice * holding.quantity)) * 100 
        : 0;
      
      totalInvested += holding.avgPrice * holding.quantity;
      totalCurrentValue += holding.totalValue;
    }
  });
  
  // Calculate totals
  wallet.totalInvested = totalInvested;
  
  // Convert USDT to MYR for total equity (simplified: 1 USDT = 4.72 MYR)
  const usdtToMyr = 4.72;
  const myrBalance = wallet.balances.MYR;
  const usdtBalance = wallet.balances.USDT * usdtToMyr;
  const equityValue = totalCurrentValue;
  
  // Separate equity and crypto values
  const equityHoldings = wallet.holdings.filter(h => h.assetType === 'EQUITY');
  const cryptoHoldings = wallet.holdings.filter(h => h.assetType === 'CRYPTO');
  
  let equityValueMYR = 0;
  let cryptoValueMYR = 0;
  
  equityHoldings.forEach(h => {
    if (h.currency === 'MYR') {
      equityValueMYR += h.totalValue;
    }
  });
  
  cryptoHoldings.forEach(h => {
    if (h.currency === 'USDT') {
      cryptoValueMYR += h.totalValue * usdtToMyr;
    }
  });
  
  wallet.totalEquity = myrBalance + usdtBalance + equityValueMYR + cryptoValueMYR;
  wallet.totalPnl = wallet.totalEquity - (myrBalance + usdtBalance + totalInvested);
  wallet.totalPnlPercent = totalInvested > 0 
    ? (wallet.totalPnl / totalInvested) * 100 
    : 0;
  
  wallet.lastUpdate = Date.now();
}

// Get portfolio breakdown
export function getPortfolioBreakdown(userId: string) {
  const wallet = getWallet(userId);
  if (!wallet) return null;
  
  const equityHoldings = wallet.holdings.filter(h => h.assetType === 'EQUITY');
  const cryptoHoldings = wallet.holdings.filter(h => h.assetType === 'CRYPTO');
  
  const equityValue = equityHoldings.reduce((sum, h) => {
    if (h.currency === 'MYR') return sum + h.totalValue;
    return sum + h.totalValue * 4.72; // Convert USDT to MYR
  }, 0);
  
  const cryptoValue = cryptoHoldings.reduce((sum, h) => {
    if (h.currency === 'USDT') return sum + h.totalValue * 4.72; // Convert to MYR
    return sum + h.totalValue;
  }, 0);
  
  const cashValue = wallet.balances.MYR + (wallet.balances.USDT * 4.72);
  
  return {
    totalEquity: wallet.totalEquity,
    cash: cashValue,
    equities: equityValue,
    crypto: cryptoValue,
    equityPercent: wallet.totalEquity > 0 ? (equityValue / wallet.totalEquity) * 100 : 0,
    cryptoPercent: wallet.totalEquity > 0 ? (cryptoValue / wallet.totalEquity) * 100 : 0,
    cashPercent: wallet.totalEquity > 0 ? (cashValue / wallet.totalEquity) * 100 : 0,
  };
}

// Add funds to wallet
export function addFunds(userId: string, amount: number, currency: 'MYR' | 'USDT' = 'MYR') {
  const wallet = getOrCreateWallet(userId);
  wallet.balances[currency] += amount;
  recalculatePortfolio(userId);
}

// Withdraw funds from wallet
export function withdrawFunds(userId: string, amount: number, currency: 'MYR' | 'USDT' = 'MYR'): boolean {
  const wallet = getWallet(userId);
  if (!wallet || wallet.balances[currency] < amount) {
    return false;
  }
  
  wallet.balances[currency] -= amount;
  recalculatePortfolio(userId);
  return true;
}

// Start portfolio updater
let portfolioUpdateInterval: NodeJS.Timeout | null = null;

export function startPortfolioUpdater() {
  if (portfolioUpdateInterval) return;
  
  portfolioUpdateInterval = setInterval(() => {
    // Recalculate all portfolios
    wallets.forEach((wallet, userId) => {
      recalculatePortfolio(userId);
    });
  }, 5000); // Update every 5 seconds
}

export function stopPortfolioUpdater() {
  if (portfolioUpdateInterval) {
    clearInterval(portfolioUpdateInterval);
    portfolioUpdateInterval = null;
  }
}

