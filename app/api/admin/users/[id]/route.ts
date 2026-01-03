import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserRiskFlags } from '@/lib/adminDb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const user = db.users.get(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const portfolio = db.portfolios.get(userId);
    const orders = db.orders.get(userId) || [];
    const transactions = db.transactions.get(userId) || [];
    const riskFlags = getUserRiskFlags(userId);
    const highestRisk = riskFlags.length > 0 
      ? riskFlags.reduce((max, flag) => 
          flag.level === 'HIGH' ? flag : 
          flag.level === 'MEDIUM' && max.level !== 'HIGH' ? flag : max,
        riskFlags[0])
      : null;

    const totalVolume = orders.reduce((sum, o) => sum + (o.qty * o.price), 0);

    const userDetail = {
      id: user.id,
      name: user.name || 'N/A',
      email: user.email,
      phone: 'N/A', // Mock
      kycStatus: user.kycStatus,
      riskFlag: highestRisk?.level || 'NONE',
      accountStatus: 'ACTIVE', // Mock
      totalBalance: portfolio?.cashBalance || 0,
      totalTradeVolume: totalVolume,
      registrationDate: user.createdAt,
      riskFlags: riskFlags,
      portfolio: portfolio,
      trades: orders.slice(0, 50).reverse(), // Latest 50 trades
      transactions: transactions.slice(0, 50).reverse(), // Latest 50 transactions
    };

    return NextResponse.json({ user: userDetail });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

