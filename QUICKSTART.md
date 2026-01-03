# Quick Start Guide

## Installation & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

## Demo Account

**Email:** `demo@fotrading.demo`  
**Password:** Any password (demo mode)

## Quick Test Flow

1. **Register** → Use any email, password, and OTP `123456`
2. **KYC** → Click through upload steps (simulated)
3. **Funding** → Deposit MYR 5000 (completes instantly)
4. **Market** → Browse stocks, click on MAYBANK
5. **Trade** → Buy 100 shares of MAYBANK
6. **Portfolio** → View your holdings and P/L
7. **Insights** → See AI-generated portfolio analysis

## Key Features to Test

✅ Registration with fake OTP  
✅ Mock KYC flow  
✅ Instant funding (demo mode)  
✅ Real-time market data (auto-refreshes every 15s)  
✅ Trading with fee calculation  
✅ Portfolio tracking with charts  
✅ AI insights based on portfolio  

## Notes

- All data is in-memory (resets on server restart)
- No real trades or money involved
- Market prices update with random variance
- Transactions complete immediately in demo mode

