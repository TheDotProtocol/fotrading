import { NextResponse } from 'next/server';
import { mockStocks } from '@/lib/mockData';

export async function GET() {
  // Simulate price fluctuations
  const stocks = mockStocks.map(stock => {
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const newPrice = stock.price * (1 + variance);
    const change = newPrice - stock.price;
    const changePercent = (change / stock.price) * 100;

    return {
      ...stock,
      price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(stock.volume * (0.8 + Math.random() * 0.4)), // ±20% volume variance
    };
  });

  return NextResponse.json({ stocks });
}

