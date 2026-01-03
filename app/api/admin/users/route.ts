import { NextRequest, NextResponse } from 'next/server';
import db, { seedAdminDemoUsers } from '@/lib/db';
import { getUserRiskFlags } from '@/lib/adminDb';

export async function GET(request: NextRequest) {
  try {
    // Always seed demo users - Vercel serverless resets on each invocation
    // The seedDemoUsers function checks for duplicates by email
    const { seedDemoUsers } = require('@/lib/adminMockData');
    seedDemoUsers();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kycStatus = searchParams.get('kycStatus');
    const riskLevel = searchParams.get('riskLevel');
    const accountStatus = searchParams.get('accountStatus');

    const users = Array.from(db.users.values());
    const portfolios = Array.from(db.portfolios.values());
    const orders = Array.from(db.orders.values()).flat();

    // Enrich users with additional data
    const enrichedUsers = users.map(user => {
      const portfolio = portfolios.find(p => p.userId === user.id);
      const userOrders = orders.filter(o => o.userId === user.id);
      const riskFlags = getUserRiskFlags(user.id);
      const highestRisk = riskFlags.length > 0 
        ? riskFlags.reduce((max, flag) => 
            flag.level === 'HIGH' ? flag : 
            flag.level === 'MEDIUM' && max.level !== 'HIGH' ? flag : max,
          riskFlags[0])
        : null;

      const totalVolume = userOrders.reduce((sum, o) => sum + (o.qty * o.price), 0);

      return {
        id: user.id,
        name: user.name || 'N/A',
        email: user.email,
        phone: 'N/A', // Mock
        kycStatus: user.kycStatus,
        riskFlag: highestRisk?.level || 'NONE',
        accountStatus: 'ACTIVE', // Mock - could be enhanced
        totalBalance: portfolio?.cashBalance || 0,
        totalTradeVolume: totalVolume,
        registrationDate: user.createdAt,
        riskFlags: riskFlags,
      };
    });

    // Apply filters
    let filtered = enrichedUsers;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(searchLower) ||
        u.name.toLowerCase().includes(searchLower) ||
        u.phone.toLowerCase().includes(searchLower)
      );
    }

    if (kycStatus) {
      filtered = filtered.filter(u => u.kycStatus === kycStatus);
    }

    if (riskLevel && riskLevel !== 'NONE') {
      filtered = filtered.filter(u => u.riskFlag === riskLevel);
    }

    if (accountStatus) {
      filtered = filtered.filter(u => u.accountStatus === accountStatus);
    }

    return NextResponse.json({ users: filtered });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

