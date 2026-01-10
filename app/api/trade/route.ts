import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureMarketEngineStarted } from '@/lib/marketEngineInit';
import { getUserOrders, executeMarketOrder, placeLimitOrder } from '@/market-engine';
import { getAssetBySymbol } from '@/market-engine';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureMarketEngineStarted();
  const orders = getUserOrders(user.id);
  
  // Convert TradeOrder to Order format for compatibility
  const formattedOrders = orders.map(order => ({
    id: order.orderId,
    userId: order.userId,
    orderType: order.side === 'LONG' || order.side === 'BUY' ? 'BUY' : 'SELL',
    ticker: order.symbol,
    qty: order.quantity,
    price: order.filledPrice || order.price || order.limitPrice || 0,
    orderPrice: order.limitPrice || order.filledPrice || order.price || 0,
    orderTypeDetail: order.orderType,
    status: order.status,
    brokerageFee: order.fees.brokerage || 0,
    clearingFee: order.fees.clearing || 0,
    stampDuty: order.fees.stamp || 0,
    totalAmount: order.totalAmount,
    createdAt: new Date(order.createdAt).toISOString(),
    filledAt: order.filledAt ? new Date(order.filledAt).toISOString() : undefined,
    instrumentType: order.assetType === 'CRYPTO' ? 'CRYPTO' : 'STOCK',
  }));
  
  return NextResponse.json({ orders: formattedOrders });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureMarketEngineStarted();
  
  const body = await request.json();
  const { orderType, ticker, qty, price, orderTypeDetail, instrumentType, limitPrice } = body;

  if (!orderType || !ticker || !qty) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Find asset by symbol
  const asset = getAssetBySymbol(ticker);
  if (!asset) {
    return NextResponse.json(
      { error: `Asset ${ticker} not found` },
      { status: 400 }
    );
  }

  // Check wallet balance
  const { getWallet } = await import('@/market-engine/wallet');
  const wallet = getWallet(user.id);
  if (!wallet) {
    return NextResponse.json(
      { error: 'Wallet not found' },
      { status: 400 }
    );
  }

  // Determine order side
  const side: 'BUY' | 'SELL' | 'LONG' | 'SHORT' = 
    (instrumentType === 'CRYPTO' || instrumentType === 'FUTURE' || instrumentType === 'FOREX')
      ? (orderType === 'BUY' ? 'LONG' : 'SHORT')
      : (orderType === 'BUY' ? 'BUY' : 'SELL');

  // Check balance for buy orders
  if (side === 'BUY' || side === 'LONG') {
    const currentPrice = asset.lastPrice;
    const estimatedCost = qty * currentPrice;
    const currency = asset.currency;
    
    if (currency === 'MYR' && wallet.balances.MYR < estimatedCost * 1.1) { // 10% buffer for fees
      return NextResponse.json(
        { error: 'Insufficient MYR balance' },
        { status: 400 }
      );
    }
    if (currency === 'USDT' && wallet.balances.USDT < estimatedCost * 1.1) {
      return NextResponse.json(
        { error: 'Insufficient USDT balance' },
        { status: 400 }
      );
    }
  }

  // Execute or place order
  let tradeOrder;
  try {
    if (orderTypeDetail === 'LIMIT' && limitPrice) {
      tradeOrder = placeLimitOrder(user.id, asset.assetId, side, qty, limitPrice);
    } else {
      tradeOrder = executeMarketOrder(user.id, asset.assetId, side, qty);
      
      // Update wallet after trade
      const { updateWalletAfterTrade } = await import('@/market-engine/wallet');
      updateWalletAfterTrade(user.id, tradeOrder);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute order' },
      { status: 400 }
    );
  }

  // Convert to Order format for compatibility
  const order = {
    id: tradeOrder.orderId,
    userId: tradeOrder.userId,
    orderType: side === 'LONG' || side === 'BUY' ? 'BUY' : 'SELL',
    ticker: tradeOrder.symbol,
    qty: tradeOrder.quantity,
    price: tradeOrder.filledPrice || tradeOrder.price || tradeOrder.limitPrice || 0,
    orderPrice: tradeOrder.limitPrice || tradeOrder.filledPrice || tradeOrder.price || 0,
    orderTypeDetail: tradeOrder.orderType,
    status: tradeOrder.status,
    brokerageFee: tradeOrder.fees.brokerage || 0,
    clearingFee: tradeOrder.fees.clearing || 0,
    stampDuty: tradeOrder.fees.stamp || 0,
    totalAmount: tradeOrder.totalAmount,
    createdAt: new Date(tradeOrder.createdAt).toISOString(),
    filledAt: tradeOrder.filledAt ? new Date(tradeOrder.filledAt).toISOString() : undefined,
    instrumentType: tradeOrder.assetType === 'CRYPTO' ? 'CRYPTO' : 'STOCK',
  };

  return NextResponse.json({ order });
}

