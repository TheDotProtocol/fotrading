import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ensureMarketEngineStarted } from '@/lib/marketEngineInit';
import { generateInsights, getUserInsights } from '@/market-engine';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  ensureMarketEngineStarted();
  
  // Generate fresh insights
  const insights = generateInsights(user.id);
  
  // Convert to old format for compatibility
  const formattedInsights = insights.map(insight => ({
    id: insight.id,
    type: insight.type,
    title: insight.title,
    message: insight.message,
    priority: insight.priority,
    createdAt: new Date(insight.createdAt).toISOString(),
  }));

  return NextResponse.json({ insights: formattedInsights });
}

