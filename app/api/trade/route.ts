import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addOrder, getOrders, getPortfolio } from '@/lib/db';
import { calculateFees } from '@/lib/mockData';
import { Order } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = getOrders(user.id);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { orderType, ticker, qty, price, orderTypeDetail, instrumentType, contractSize, lotSize } = body;

  if (!orderType || !ticker || !qty || !price) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Calculate amount and fees based on instrument type
  let amount = 0;
  let fees = { brokerage: 0, clearing: 0, stamp: 0, total: 0 };
  let margin = 0;

  if (instrumentType === 'FUTURE') {
    // Futures: qty * price * contract size, but only margin is required
    const contractSizeValue = contractSize || 100;
    amount = qty * price * contractSizeValue;
    margin = amount * 0.1; // 10% margin
    fees.brokerage = margin * 0.001;
    fees.clearing = margin * 0.0003;
    fees.total = fees.brokerage + fees.clearing;
  } else if (instrumentType === 'FOREX') {
    // Forex: qty (lots) * lot size * price
    const lotSizeValue = lotSize || 100000;
    amount = qty * lotSizeValue * price;
    const spread = amount * 0.0001; // 1 pip spread
    fees.total = spread;
  } else if (instrumentType === 'BOND') {
    // Bonds: qty * price (as percentage) * face value (assume MYR 1000)
    amount = qty * (price / 100) * 1000;
    fees = calculateFees(amount, qty);
  } else {
    // Stocks and ETFs
    amount = qty * price;
    fees = calculateFees(amount, qty);
  }

  const totalAmount = (instrumentType === 'FUTURE' ? margin : amount) + fees.total;

  // Get portfolio to check cash balance for BUY orders
  const portfolio = getPortfolio(user.id);
  if (orderType === 'BUY' && portfolio) {
    if (portfolio.cashBalance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }
  }

  // Create order (in demo, market orders are filled immediately)
  const order: Order = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    orderType,
    ticker,
    qty,
    price,
    orderPrice: orderTypeDetail === 'LIMIT' ? body.limitPrice : price,
    orderTypeDetail: orderTypeDetail || 'MARKET',
    status: orderTypeDetail === 'LIMIT' ? 'PENDING' : 'FILLED',
    brokerageFee: fees.brokerage,
    clearingFee: fees.clearing,
    stampDuty: fees.stamp,
    totalAmount,
    createdAt: new Date().toISOString(),
    filledAt: orderTypeDetail === 'MARKET' ? new Date().toISOString() : undefined,
    instrumentType: instrumentType || 'STOCK',
    contractSize: contractSize,
    lotSize: lotSize,
    margin: instrumentType === 'FUTURE' ? margin : undefined,
  };

  addOrder(order);

  return NextResponse.json({ order });
}

