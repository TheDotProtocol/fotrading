import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/adminDb';
import db, { seedAdminDemoUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Seed demo users if needed
    seedAdminDemoUsers();
    const metrics = getDashboardMetrics();

    // Generate realistic chart data (last 30 days) based on actual orders
    const orders = Array.from(db.orders.values()).flat();
    const users = Array.from(db.users.values());
    const chartData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get actual orders for this date
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      const dayVolume = dayOrders.reduce((sum, o) => sum + (o.qty * o.price), 0);
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.brokerageFee + o.clearingFee + o.stampDuty, 0);
      
      // Get new users for this date
      const dayUsers = users.filter(u => {
        const userDate = new Date(u.createdAt).toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;
      
      chartData.push({
        date: dateStr,
        volume: dayVolume || Math.random() * 500000 + 200000, // Fallback to mock if no data
        users: dayUsers || Math.floor(Math.random() * 3),
        revenue: dayRevenue || Math.random() * 20000 + 5000,
      });
    }

    return NextResponse.json({
      metrics,
      chartData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

