// Order Book Simulation

import { Asset, OrderBook, OrderBookLevel } from './types';
import { getCurrentPrice } from './priceSimulator';

const orderBooks: Map<string, OrderBook> = new Map();

// Generate order book for an asset
export function generateOrderBook(assetId: string): OrderBook {
  const asset = getCurrentPrice(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }
  
  const currentPrice = asset.lastPrice;
  const spread = asset.assetType === 'CRYPTO' 
    ? currentPrice * 0.0001 // 0.01% spread for crypto
    : currentPrice * 0.001; // 0.1% spread for equities
  
  // Generate 5 bid levels (buy orders - descending price)
  const bids: OrderBookLevel[] = [];
  for (let i = 0; i < 5; i++) {
    const priceOffset = spread * (5 - i) * (0.5 + Math.random() * 0.5);
    const price = currentPrice - priceOffset;
    const volume = Math.random() * asset.volume * 0.01; // Random volume
    bids.push({
      price: Math.max(price, currentPrice * 0.9), // Don't go too low
      volume: Math.floor(volume),
    });
  }
  
  // Sort bids descending
  bids.sort((a, b) => b.price - a.price);
  
  // Generate 5 ask levels (sell orders - ascending price)
  const asks: OrderBookLevel[] = [];
  for (let i = 0; i < 5; i++) {
    const priceOffset = spread * (i + 1) * (0.5 + Math.random() * 0.5);
    const price = currentPrice + priceOffset;
    const volume = Math.random() * asset.volume * 0.01;
    asks.push({
      price: Math.min(price, currentPrice * 1.1), // Don't go too high
      volume: Math.floor(volume),
    });
  }
  
  // Sort asks ascending
  asks.sort((a, b) => a.price - b.price);
  
  const orderBook: OrderBook = {
    assetId,
    bids,
    asks,
    lastUpdate: Date.now(),
  };
  
  orderBooks.set(assetId, orderBook);
  return orderBook;
}

// Get order book
export function getOrderBook(assetId: string): OrderBook {
  const existing = orderBooks.get(assetId);
  if (existing && Date.now() - existing.lastUpdate < 5000) {
    return existing; // Return cached if recent
  }
  return generateOrderBook(assetId);
}

// Update order book after trade (simulate market impact)
export function updateOrderBookAfterTrade(assetId: string, side: 'BUY' | 'SELL', quantity: number, price: number) {
  const orderBook = getOrderBook(assetId);
  
  if (side === 'BUY') {
    // Remove filled ask levels
    let remainingQty = quantity;
    orderBook.asks = orderBook.asks.filter(ask => {
      if (remainingQty > 0 && ask.price <= price) {
        remainingQty -= ask.volume;
        return false; // Remove this level
      }
      return true;
    });
    
    // Add new bid level
    orderBook.bids.push({
      price: price * 0.999, // Slightly below trade price
      volume: quantity * 0.1,
    });
    orderBook.bids.sort((a, b) => b.price - a.price);
    orderBook.bids = orderBook.bids.slice(0, 5); // Keep top 5
  } else {
    // Remove filled bid levels
    let remainingQty = quantity;
    orderBook.bids = orderBook.bids.filter(bid => {
      if (remainingQty > 0 && bid.price >= price) {
        remainingQty -= bid.volume;
        return false;
      }
      return true;
    });
    
    // Add new ask level
    orderBook.asks.push({
      price: price * 1.001, // Slightly above trade price
      volume: quantity * 0.1,
    });
    orderBook.asks.sort((a, b) => a.price - b.price);
    orderBook.asks = orderBook.asks.slice(0, 5); // Keep top 5
  }
  
  orderBook.lastUpdate = Date.now();
  orderBooks.set(assetId, orderBook);
}

// Refresh all order books
export function refreshAllOrderBooks() {
  const allAssets = Array.from(orderBooks.keys());
  allAssets.forEach(assetId => {
    generateOrderBook(assetId);
  });
}

