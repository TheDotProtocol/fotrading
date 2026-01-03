import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const orders = Array.from(db.orders.values()).flat();
    const users = Array.from(db.users.values());

    // Calculate total revenue breakdown
    const totalRevenue = orders.reduce((sum, o) => 
      sum + o.brokerageFee + o.clearingFee + o.stampDuty, 0
    );
    const brokerageFees = orders.reduce((sum, o) => sum + o.brokerageFee, 0);
    const clearingFees = orders.reduce((sum, o) => sum + o.clearingFee, 0);
    const stampDuty = orders.reduce((sum, o) => sum + o.stampDuty, 0);

    // Generate monthly data (last 12 months)
    const monthlyData = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const monthRevenue = monthOrders.reduce((sum, o) => 
        sum + o.brokerageFee + o.clearingFee + o.stampDuty, 0
      );

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        trades: monthOrders.length,
      });
    }

    // Calculate top earners (users who generated most fees)
    const userFees = new Map<string, number>();
    orders.forEach(order => {
      const fees = order.brokerageFee + order.clearingFee + order.stampDuty;
      const current = userFees.get(order.userId) || 0;
      userFees.set(order.userId, current + fees);
    });

    const topEarners = Array.from(userFees.entries())
      .map(([userId, fees]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          name: user?.name || 'Unknown',
          fees,
        };
      })
      .sort((a, b) => b.fees - a.fees)
      .slice(0, 10);

    return NextResponse.json({
      totalRevenue,
      brokerageFees,
      clearingFees,
      stampDuty,
      monthlyData,
      topEarners,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

