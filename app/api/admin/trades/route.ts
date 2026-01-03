import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    const orders = Array.from(db.orders.values()).flat();
    const users = Array.from(db.users.values());

    // Enrich orders with user names
    let trades = orders.map(order => {
      const user = users.find(u => u.id === order.userId);
      return {
        id: order.id,
        userId: order.userId,
        userName: user?.name || 'Unknown',
        orderType: order.orderType,
        ticker: order.ticker,
        qty: order.qty,
        price: order.price,
        totalAmount: order.qty * order.price,
        status: order.status,
        createdAt: order.createdAt,
      };
    });

    // Apply filters
    if (filter === 'suspicious') {
      trades = trades.filter(t => t.qty > 1000 || t.totalAmount > 50000);
    } else if (filter === 'large') {
      trades = trades.filter(t => t.totalAmount > 10000);
    } else if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      trades = trades.filter(t => new Date(t.createdAt) >= today);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      trades = trades.filter(t =>
        t.ticker.toLowerCase().includes(searchLower) ||
        t.userName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by most recent
    trades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ trades: trades.slice(0, 100) }); // Limit to 100 most recent
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

