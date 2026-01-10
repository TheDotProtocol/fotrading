// Unified Price Simulation Engine

import { Asset, PriceData } from './types';
import { getAllAssets, isMarketOpen } from './assetRegistry';

// In-memory price history storage
const priceHistory: Map<string, PriceData[]> = new Map();
const currentPrices: Map<string, Asset> = new Map();

// Initialize prices
export function initializePrices() {
  const assets = getAllAssets();
  assets.forEach(asset => {
    currentPrices.set(asset.assetId, { ...asset });
    priceHistory.set(asset.assetId, []);
  });
}

// Get current price
export function getCurrentPrice(assetId: string): Asset | undefined {
  return currentPrices.get(assetId);
}

// Get all current prices
export function getAllCurrentPrices(): Asset[] {
  return Array.from(currentPrices.values());
}

// Simulate price movement
function simulatePriceChange(asset: Asset): number {
  const { volatilityFactor, lastPrice } = asset;
  
  // Generate random change based on volatility
  // Use normal distribution approximation
  const random = (Math.random() + Math.random() + Math.random() + Math.random()) / 4 - 0.5;
  const changePercent = random * volatilityFactor * 2;
  
  // Add slight trend bias (random walk with drift)
  const trendBias = (Math.random() - 0.5) * 0.1 * volatilityFactor;
  
  // Occasional spikes (5% chance)
  const spike = Math.random() < 0.05 ? (Math.random() - 0.5) * volatilityFactor * 3 : 0;
  
  const totalChangePercent = changePercent + trendBias + spike;
  const newPrice = lastPrice * (1 + totalChangePercent);
  
  // Prevent negative prices
  return Math.max(newPrice, lastPrice * 0.01);
}

// Update price for a single asset
export function updateAssetPrice(assetId: string): Asset | null {
  const asset = currentPrices.get(assetId);
  if (!asset) return null;
  
  // Check if market is open
  if (!isMarketOpen(asset)) {
    return asset; // Return unchanged if market closed
  }
  
  const oldPrice = asset.lastPrice;
  const newPrice = simulatePriceChange(asset);
  
  // Calculate change
  const change = newPrice - oldPrice;
  const changePercent = (change / oldPrice) * 100;
  
  // Update volume (simulate trading activity)
  const baseVolume = asset.volume;
  const volumeMultiplier = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x
  const newVolume = Math.floor(baseVolume * volumeMultiplier);
  
  // Update asset
  const updatedAsset: Asset = {
    ...asset,
    lastPrice: newPrice,
    dailyChange: asset.dailyChange + change,
    dailyChangePercent: ((asset.lastPrice + asset.dailyChange + change - (asset.lastPrice - asset.dailyChange)) / (asset.lastPrice - asset.dailyChange)) * 100,
    volume: newVolume,
  };
  
  // Store price history (OHLC)
  const history = priceHistory.get(assetId) || [];
  const now = Date.now();
  
  // Update or create current period's OHLC
  const currentPeriod = history[history.length - 1];
  if (currentPeriod && now - currentPeriod.timestamp < 60000) { // Same minute
    currentPeriod.high = Math.max(currentPeriod.high, newPrice);
    currentPeriod.low = Math.min(currentPeriod.low, newPrice);
    currentPeriod.close = newPrice;
    currentPeriod.volume += newVolume;
  } else {
    // New period
    history.push({
      assetId,
      timestamp: now,
      open: oldPrice,
      high: newPrice,
      low: oldPrice,
      close: newPrice,
      volume: newVolume,
    });
    
    // Keep only last 1000 periods
    if (history.length > 1000) {
      history.shift();
    }
  }
  
  currentPrices.set(assetId, updatedAsset);
  priceHistory.set(assetId, history);
  
  return updatedAsset;
}

// Update all prices
export function updateAllPrices(): Asset[] {
  const assets = getAllAssets();
  const updated: Asset[] = [];
  
  assets.forEach(asset => {
    const updatedAsset = updateAssetPrice(asset.assetId);
    if (updatedAsset) {
      updated.push(updatedAsset);
    }
  });
  
  return updated;
}

// Get price history
export function getPriceHistory(assetId: string, limit: number = 100): PriceData[] {
  const history = priceHistory.get(assetId) || [];
  return history.slice(-limit);
}

// Get OHLC data for charting
export function getOHLCData(assetId: string, timeframe: '1m' | '5m' | '15m' | '1h' | '1d' = '1m'): PriceData[] {
  const history = getPriceHistory(assetId, 1000);
  if (history.length === 0) return [];
  
  const timeframeMs: Record<string, number> = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '1d': 86400000,
  };
  
  const interval = timeframeMs[timeframe];
  const aggregated: PriceData[] = [];
  let currentBucket: PriceData | null = null;
  
  history.forEach(price => {
    const bucketTime = Math.floor(price.timestamp / interval) * interval;
    
    if (!currentBucket || currentBucket.timestamp !== bucketTime) {
      if (currentBucket) aggregated.push(currentBucket);
      currentBucket = {
        assetId,
        timestamp: bucketTime,
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
        volume: price.volume,
      };
    } else {
      currentBucket.high = Math.max(currentBucket.high, price.high);
      currentBucket.low = Math.min(currentBucket.low, price.low);
      currentBucket.close = price.close;
      currentBucket.volume += price.volume;
    }
  });
  
  if (currentBucket) aggregated.push(currentBucket);
  
  return aggregated;
}

// Start price simulation
let priceUpdateInterval: NodeJS.Timeout | null = null;

export function startPriceSimulation() {
  if (priceUpdateInterval) return; // Already running
  
  initializePrices();
  
  // Update equities every 3-5 seconds
  setInterval(() => {
    const equities = getAllAssets().filter(a => a.assetType === 'EQUITY');
    equities.forEach(asset => updateAssetPrice(asset.assetId));
  }, 3000 + Math.random() * 2000);
  
  // Update crypto every 1-3 seconds (more frequent)
  setInterval(() => {
    const cryptos = getAllAssets().filter(a => a.assetType === 'CRYPTO');
    cryptos.forEach(asset => updateAssetPrice(asset.assetId));
  }, 1000 + Math.random() * 2000);
}

export function stopPriceSimulation() {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
    priceUpdateInterval = null;
  }
}

