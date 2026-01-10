import { NextResponse } from 'next/server';
import { ensureMarketEngineStarted } from '@/lib/marketEngineInit';
import { getAllCurrentPrices, getEquityAssets, getCryptoAssets } from '@/market-engine';

export async function GET() {
  ensureMarketEngineStarted();
  
  // Get all current prices from market engine
  const allAssets = getAllCurrentPrices();
  const equities = getEquityAssets();
  const cryptos = getCryptoAssets();
  
  // Format stocks for compatibility
  const stocks = equities.map(asset => ({
    ticker: asset.symbol,
    name: asset.name,
    price: asset.lastPrice,
    change: asset.dailyChange,
    changePercent: asset.dailyChangePercent,
    volume: asset.volume,
    sector: asset.sector || '',
  }));
  
  // Format cryptos
  const cryptocurrencies = cryptos.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    price: asset.lastPrice,
    change: asset.dailyChange,
    changePercent: asset.dailyChangePercent,
    volume: asset.volume,
    marketCap: asset.marketCap,
  }));

  return NextResponse.json({ 
    stocks,
    cryptocurrencies,
    allAssets: allAssets.map(asset => ({
      assetId: asset.assetId,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      currency: asset.currency,
      lastPrice: asset.lastPrice,
      dailyChange: asset.dailyChange,
      dailyChangePercent: asset.dailyChangePercent,
      volume: asset.volume,
      marketStatus: asset.marketStatus,
    })),
  });
}

