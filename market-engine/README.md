# Unified Market Engine

## Overview

The Unified Market Engine is a single simulation system that powers both Malaysian stocks (Bursa Malaysia) and cryptocurrencies within the same trading app. This is a **SIMULATION ONLY** - no real exchanges, no real APIs, no live data.

## Architecture

### Core Components

1. **Asset Registry** (`assetRegistry.ts`)
   - Defines all tradable assets (equities + crypto)
   - Manages asset metadata (symbol, name, type, currency, volatility)
   - Handles market hours logic

2. **Price Simulator** (`priceSimulator.ts`)
   - Simulates price movements for all assets
   - Different update frequencies:
     - Equities: Every 3-5 seconds
     - Crypto: Every 1-3 seconds (more frequent)
   - Different volatility:
     - Equities: 1-2% volatility (calm)
     - Crypto: 3-5% volatility (spicy 🌶️)
   - Maintains OHLC history

3. **Order Book** (`orderBook.ts`)
   - Generates mock order books (5 bid levels, 5 ask levels)
   - Updates after trades (simulates market impact)
   - Refreshes automatically

4. **Trade Engine** (`tradeEngine.ts`)
   - Executes market orders (immediate fill)
   - Places limit orders (pending until price crosses)
   - Calculates fees based on asset type
   - Updates order books after trades

5. **Wallet** (`wallet.ts`)
   - Unified wallet with MYR and USDT balances
   - Tracks holdings (stocks + crypto)
   - Calculates portfolio values
   - Converts between currencies (USDT ↔ MYR)

6. **AI Insights** (`aiInsights.ts`)
   - Generates portfolio insights
   - Diversification warnings
   - Risk alerts
   - Rebalancing suggestions
   - Performance-based recommendations

## Asset Types

### Equities (Bursa Malaysia)
- **Market Hours:** 9:00 AM - 5:00 PM MYT, Mon-Fri
- **Currency:** MYR
- **Volatility:** 1-2% (calm)
- **Update Frequency:** 3-5 seconds
- **Fees:** Brokerage (0.1%, min MYR 8) + Clearing (0.03%, min MYR 2) + Stamp Duty

**Assets:**
- MAYBANK, TENAGA, CIMB, PBBANK, PCHEM, TOPGLOV, GENTING, AAGB, IHH, TM

### Cryptocurrencies
- **Market Hours:** 24/7 (ALWAYS_OPEN)
- **Currency:** USDT
- **Volatility:** 3-5% (spicy 🌶️)
- **Update Frequency:** 1-3 seconds
- **Fees:** Trading fee (0.1%)

**Assets:**
- BTCUSDT, ETHUSDT, BNBUSDT, SOLUSDT, XRPUSDT, ADAUSDT, DOGEUSDT, DOTUSDT, MATICUSDT, LINKUSDT

## Usage

### Starting the Engine

```typescript
import { startMarketEngine } from '@/market-engine';

// Start all services
startMarketEngine();
```

This starts:
- Price simulation
- Limit order checker
- Portfolio updater
- AI insight generator

### Getting Market Data

```typescript
import { getAllCurrentPrices, getEquityAssets, getCryptoAssets } from '@/market-engine';

// Get all assets
const allAssets = getAllCurrentPrices();

// Get equities only
const equities = getEquityAssets();

// Get crypto only
const cryptos = getCryptoAssets();
```

### Placing Orders

```typescript
import { executeMarketOrder, placeLimitOrder } from '@/market-engine';

// Market order (immediate execution)
const order = executeMarketOrder(userId, assetId, 'BUY', quantity);

// Limit order (pending)
const limitOrder = placeLimitOrder(userId, assetId, 'BUY', quantity, limitPrice);
```

### Getting Portfolio

```typescript
import { getWallet, getPortfolioBreakdown } from '@/market-engine';

const wallet = getWallet(userId);
const breakdown = getPortfolioBreakdown(userId);
```

## API Integration

The market engine is integrated with Next.js API routes:

- `/api/market` - Returns all market data (stocks + crypto)
- `/api/trade` - Executes trades using the engine
- `/api/portfolio` - Returns unified portfolio (stocks + crypto)
- `/api/insights` - Returns AI-generated insights

## Simulation Mode

All market-related pages display a **Simulation Mode Banner**:

```
⚠️ Simulation Mode
All stock and crypto prices are simulated for demonstration purposes only.
No real trading or live market data is used.
```

This banner is:
- Visible on all market pages
- Not dismissable
- Mandatory for compliance

## Data Storage

Currently uses **in-memory storage**:
- Assets, prices, trades, wallets stored in memory
- Resets on server restart
- Suitable for demo/prototype

**Future:** Can be migrated to database (PostgreSQL, MongoDB) without changing the engine logic.

## Features

✅ Unified portfolio (stocks + crypto)
✅ Real-time price simulation
✅ Order book simulation
✅ Fee calculation (different for equities vs crypto)
✅ Portfolio breakdown (equity %, crypto %, cash %)
✅ AI insights across both asset classes
✅ Market hours handling (equities vs 24/7 crypto)
✅ Currency conversion (USDT ↔ MYR)

## Notes

- This is a **SIMULATION ONLY** system
- No real market data
- No real order execution
- Suitable for demos and prototypes
- Can be extended to real systems by replacing simulation with real APIs

