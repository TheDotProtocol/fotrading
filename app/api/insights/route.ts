import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPortfolio } from '@/lib/db';
import { generateAIInsights, mockStocks } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const portfolio = getPortfolio(user.id);
  const insights = generateAIInsights(portfolio, mockStocks);

  return NextResponse.json({ insights });
}

