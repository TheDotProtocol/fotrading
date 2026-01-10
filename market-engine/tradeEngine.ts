// Unified Trade Execution Engine

import { TradeOrder, Asset, OrderSide, OrderType, OrderStatus } from './types';
import { getCurrentPrice, updateAssetPrice } from './priceSimulator';
import { getAssetById } from './assetRegistry';
import { updateOrderBookAfterTrade } from './orderBook';

// In-memory trade storage
const trades: Map<string, TradeOrder> = new Map();
const userTrades: Map<string, string[]> = new Map(); // userId -> orderIds[]

// Calculate fees based on asset type
export function calculateFees(asset: Asset, quantity: number, price: number): {
  brokerage?: number;
  clearing?: number;
  stamp?: number;
  trading?: number;
  total: number;
} {
  const amount = quantity * price;
  
  if (asset.assetType === 'CRYPTO') {
    // Crypto: 0.1% trading fee
    const tradingFee = amount * 0.001;
    return {
      trading: tradingFee,
      total: tradingFee,
    };
  } else {
    // Equities: brokerage + clearing + stamp
    const brokerage = Math.max(amount * 0.001, 8); // Min MYR 8
    const clearing = Math.max(amount * 0.0003, 2); // Min MYR 2
    const stamp = Math.min(Math.ceil(amount / 1000), 200); // Max MYR 200
    return {
      brokerage,
      clearing,
      stamp,
      total: brokerage + clearing + stamp,
    };
  }
}

// Execute market order
export function executeMarketOrder(
  userId: string,
  assetId: string,
  side: OrderSide,
  quantity: number
): TradeOrder {
  const asset = getCurrentPrice(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }
  
  // Get execution price (current market price)
  const executionPrice = asset.lastPrice;
  
  // Calculate fees
  const fees = calculateFees(asset, quantity, executionPrice);
  
  // Calculate total amount
  const totalAmount = (quantity * executionPrice) + fees.total;
  
  // Create order
  const order: TradeOrder = {
    orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    assetId,
    assetType: asset.assetType,
    symbol: asset.symbol,
    side,
    orderType: 'MARKET',
    quantity,
    price: executionPrice,
    status: 'FILLED',
    filledPrice: executionPrice,
    filledQuantity: quantity,
    fees,
    totalAmount,
    createdAt: Date.now(),
    filledAt: Date.now(),
  };
  
  // Store trade
  trades.set(order.orderId, order);
  
  // Track user trades
  const userOrderIds = userTrades.get(userId) || [];
  userOrderIds.push(order.orderId);
  userTrades.set(userId, userOrderIds);
  
  // Update order book (simulate market impact)
  updateOrderBookAfterTrade(assetId, side === 'LONG' ? 'BUY' : 'SELL', quantity, executionPrice);
  
  // Slight price impact (simulate market movement)
  const impact = side === 'LONG' || side === 'BUY' 
    ? executionPrice * 0.0001 // Slight upward pressure
    : executionPrice * -0.0001; // Slight downward pressure
  const assetWithImpact = getCurrentPrice(assetId);
  if (assetWithImpact) {
    assetWithImpact.lastPrice = Math.max(assetWithImpact.lastPrice + impact, assetWithImpact.lastPrice * 0.99);
  }
  
  return order;
}

// Place limit order
export function placeLimitOrder(
  userId: string,
  assetId: string,
  side: OrderSide,
  quantity: number,
  limitPrice: number
): TradeOrder {
  const asset = getCurrentPrice(assetId);
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }
  
  // Calculate fees (estimate based on limit price)
  const fees = calculateFees(asset, quantity, limitPrice);
  const totalAmount = (quantity * limitPrice) + fees.total;
  
  // Create pending order
  const order: TradeOrder = {
    orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    assetId,
    assetType: asset.assetType,
    symbol: asset.symbol,
    side,
    orderType: 'LIMIT',
    quantity,
    limitPrice,
    status: 'PENDING',
    fees,
    totalAmount,
    createdAt: Date.now(),
  };
  
  // Store order
  trades.set(order.orderId, order);
  
  // Track user trades
  const userOrderIds = userTrades.get(userId) || [];
  userOrderIds.push(order.orderId);
  userTrades.set(userId, userOrderIds);
  
  return order;
}

// Check and fill pending limit orders
export function checkLimitOrders() {
  const pendingOrders = Array.from(trades.values()).filter(
    order => order.status === 'PENDING' && order.orderType === 'LIMIT'
  );
  
  pendingOrders.forEach(order => {
    const asset = getCurrentPrice(order.assetId);
    if (!asset) return;
    
    const currentPrice = asset.lastPrice;
    let shouldFill = false;
    
    if (order.side === 'BUY' || order.side === 'LONG') {
      // Buy limit: fill if price drops to or below limit
      shouldFill = currentPrice <= (order.limitPrice || 0);
    } else {
      // Sell limit: fill if price rises to or above limit
      shouldFill = currentPrice >= (order.limitPrice || 0);
    }
    
    if (shouldFill) {
      // Fill the order
      order.status = 'FILLED';
      order.filledPrice = currentPrice;
      order.filledQuantity = order.quantity;
      order.filledAt = Date.now();
      
      // Update fees based on actual fill price
      const assetData = getAssetById(order.assetId);
      if (assetData) {
        order.fees = calculateFees(assetData, order.quantity, currentPrice);
        order.totalAmount = (order.quantity * currentPrice) + order.fees.total;
      }
      
      // Update order book
      updateOrderBookAfterTrade(
        order.assetId,
        order.side === 'LONG' ? 'BUY' : 'SELL',
        order.quantity,
        currentPrice
      );
    }
  });
}

// Get user orders
export function getUserOrders(userId: string): TradeOrder[] {
  const orderIds = userTrades.get(userId) || [];
  return orderIds.map(id => trades.get(id)).filter(Boolean) as TradeOrder[];
}

// Get all trades (for admin)
export function getAllTrades(): TradeOrder[] {
  return Array.from(trades.values());
}

// Get trades by asset type
export function getTradesByAssetType(assetType: 'EQUITY' | 'CRYPTO'): TradeOrder[] {
  return getAllTrades().filter(trade => trade.assetType === assetType);
}

// Cancel order
export function cancelOrder(orderId: string, userId: string): boolean {
  const order = trades.get(orderId);
  if (!order || order.userId !== userId) {
    return false;
  }
  
  if (order.status === 'PENDING') {
    order.status = 'CANCELLED';
    order.cancelledAt = Date.now();
    return true;
  }
  
  return false;
}

// Start limit order checker
let limitOrderInterval: NodeJS.Timeout | null = null;

export function startLimitOrderChecker() {
  if (limitOrderInterval) return;
  
  limitOrderInterval = setInterval(() => {
    checkLimitOrders();
  }, 2000); // Check every 2 seconds
}

export function stopLimitOrderChecker() {
  if (limitOrderInterval) {
    clearInterval(limitOrderInterval);
    limitOrderInterval = null;
  }
}

