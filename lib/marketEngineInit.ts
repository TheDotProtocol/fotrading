// Initialize Market Engine on server startup

import { startMarketEngine } from '@/market-engine';

let engineStarted = false;

export function ensureMarketEngineStarted() {
  if (engineStarted) return;
  
  // Only start in server environment
  if (typeof window === 'undefined') {
    startMarketEngine();
    engineStarted = true;
  }
}

// Auto-start on module load (server-side only)
if (typeof window === 'undefined') {
  ensureMarketEngineStarted();
}

