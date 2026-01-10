// Unified Market Engine - Main Entry Point

// Initialize and start all market engine components
import { startPriceSimulation, stopPriceSimulation } from './priceSimulator';
import { startLimitOrderChecker, stopLimitOrderChecker } from './tradeEngine';
import { startPortfolioUpdater, stopPortfolioUpdater } from './wallet';
import { startInsightGenerator, stopInsightGenerator } from './aiInsights';

// Start all market engine services
export function startMarketEngine() {
  console.log('🚀 Starting Unified Market Engine...');
  
  startPriceSimulation();
  startLimitOrderChecker();
  startPortfolioUpdater();
  startInsightGenerator();
  
  console.log('✅ Market Engine Started');
}

// Stop all market engine services
export function stopMarketEngine() {
  console.log('🛑 Stopping Market Engine...');
  
  stopPriceSimulation();
  stopLimitOrderChecker();
  stopPortfolioUpdater();
  stopInsightGenerator();
  
  console.log('✅ Market Engine Stopped');
}

// Export all modules
export * from './types';
export * from './assetRegistry';
export * from './priceSimulator';
export * from './orderBook';
export * from './tradeEngine';
export * from './wallet';
export * from './aiInsights';

