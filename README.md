# Malaysian Stock Trading App - MVP Demo

A full-flow prototype trading application for Malaysian users trading Bursa Malaysia stocks. This is a **DEMO platform only** - no real trades are executed, no real money is involved, and no real personal information is stored.

## 🎯 Features

### Core User Journey
1. **Landing Page** - App introduction and registration CTA
2. **Registration/Onboarding** - Email signup with fake OTP verification
3. **e-KYC (Mock)** - Simulated identity verification flow
4. **Account Funding** - Mock wallet with deposit/withdrawal simulation
5. **Market Screen** - Bursa Malaysia stock listings with real-time price updates
6. **Stock Detail** - Individual stock pages with charts and trading interface
7. **Trading Engine** - Mock order execution (Market & Limit orders)
8. **Portfolio Dashboard** - Holdings, P/L tracking, and visualizations
9. **AI Insights** - Rule-based educational insights and risk warnings
10. **Settings & Compliance** - User settings and legal disclaimers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Demo Credentials

### Pre-seeded Demo Account
- **Email:** `demo@fotrading.demo`
- **Password:** Any password (demo mode accepts any credentials)

### New Account
You can register with any email address. The system will automatically create an account in demo mode.

## 🎮 Demo Flow

### Complete User Journey

1. **Visit Landing Page** (`/`)
   - View app features and disclaimers
   - Click "Open Account"

2. **Register** (`/register`)
   - Enter email and password
   - Verify with any 6-digit OTP (e.g., `123456`)
   - Complete profile

3. **Complete KYC** (`/kyc`)
   - Upload NRIC (simulated - just click)
   - Take selfie (simulated - just click)
   - Submit for verification (auto-approved in demo)

4. **Fund Account** (`/funding`)
   - Deposit funds (simulated - completes in 2 seconds)
   - View transaction history

5. **Browse Market** (`/market`)
   - **TradingView Market Overview** widget with live data
   - View Bursa Malaysia stocks
   - Prices auto-refresh every 15 seconds
   - Search and filter stocks

6. **View Stock Details** (`/stock/[ticker]`)
   - **TradingView Advanced Charts** with live market data
   - Real-time price updates from Bursa Malaysia
   - Technical indicators (RSI, MACD, Volume)
   - Multiple timeframes and drawing tools
   - Place buy/sell orders
   - View fee breakdown
   - Futures & Options trading information

7. **View Portfolio** (`/portfolio`)
   - See holdings and P/L
   - View equity charts
   - Check sector allocation

8. **AI Insights** (`/insights`)
   - Get portfolio analysis
   - Risk warnings
   - Educational content

9. **Settings** (`/settings`)
   - View profile and KYC status
   - Access legal documents
   - Contact support

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Charts:** TradingView (live data) + Recharts (portfolio analytics)
- **Icons:** Lucide React

### Project Structure
```
Exchange/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── kyc/           # KYC endpoints
│   │   ├── market/        # Market data
│   │   ├── trade/         # Trading endpoints
│   │   ├── portfolio/     # Portfolio data
│   │   ├── funding/       # Funding transactions
│   │   └── insights/       # AI insights
│   ├── register/          # Registration page
│   ├── login/             # Login page
│   ├── kyc/               # KYC flow
│   ├── market/            # Market listings
│   ├── stock/[ticker]/    # Stock detail pages
│   ├── portfolio/         # Portfolio dashboard
│   ├── funding/           # Account funding
│   ├── insights/          # AI insights
│   └── settings/          # Settings page
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── AuthGuard.tsx
├── lib/                   # Utilities and stores
│   ├── store.ts           # Zustand store
│   ├── db.ts              # In-memory database
│   ├── auth.ts            # Auth utilities
│   └── mockData.ts        # Mock data generators
├── types/                 # TypeScript types
│   └── index.ts
└── README.md
```

### Data Storage
- **Current:** In-memory storage (resets on server restart)
- **Future-Ready:** Architecture supports plugging in:
  - Real database (PostgreSQL, MongoDB)
  - Real KYC provider APIs
  - Real trading partner APIs
  - Real market data feeds

## 🔒 Security & Legal

### Important Disclaimers
- ⚠️ **This is a DEMO platform only**
- ⚠️ **No real trades are executed**
- ⚠️ **No real money is involved**
- ⚠️ **No real personal information is stored**
- ⚠️ **All data is simulated for demonstration purposes**

### Mock Data Only
- KYC documents are not stored
- User passwords are not validated (demo mode)
- Transactions are simulated
- Market data is generated with random variance

## 📊 Mock Data

### Pre-seeded Stocks
The app includes 10 Bursa Malaysia stocks:
- MAYBANK, CIMB, PETRONAS, TENAGA, PUBLIC
- GENTING, SIME, IOI, KLK, MAXIS

Prices auto-update every 15 seconds with ±5% variance.

### Demo Portfolio
The demo account (`demo@fotrading.demo`) comes with:
- Pre-approved KYC status
- Sample holdings (MAYBANK, CIMB)
- Starting cash balance

## 🎨 Design

- **Colors:** Blue/White with Gold accents
- **Tone:** Malaysian-friendly, non-technical
- **UI:** Clean, modern, trustworthy
- **Responsive:** Works on desktop, tablet, and mobile

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### KYC
- `GET /api/kyc` - Get KYC status
- `POST /api/kyc` - Update KYC status

### Market
- `GET /api/market` - Get stock listings

### Trading
- `GET /api/trade` - Get order history
- `POST /api/trade` - Place order

### Portfolio
- `GET /api/portfolio` - Get portfolio data

### Funding
- `GET /api/funding` - Get transactions
- `POST /api/funding` - Create transaction

### Insights
- `GET /api/insights` - Get AI insights

## 📊 TradingView Integration

The app integrates **TradingView** for professional charting and live market data:

### Features
- **Live Market Data:** Real-time prices from Bursa Malaysia
- **Advanced Charts:** Full TradingView charting library with:
  - Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M)
  - Technical indicators (RSI, MACD, Bollinger Bands, Volume, etc.)
  - Drawing tools (trend lines, Fibonacci retracements, shapes)
  - Multiple chart types (Candlestick, Line, Bar, Area)
  - Historical data analysis
- **Market Overview:** Live overview widget showing all Bursa Malaysia stocks
- **Symbol Format:** Uses `BURSA:TICKER` format (e.g., `BURSA:MAYBANK`)

### Implementation
- **Stock Detail Pages:** Full TradingView advanced chart widget
- **Market Page:** TradingView market overview widget
- **No API Key Required:** Uses TradingView's free widget service

### Trading Analysis
Users can use TradingView charts to:
- Analyze price trends and patterns
- Identify entry/exit points for trades
- Study technical indicators
- Plan futures and options strategies
- Make informed buy/sell decisions

## 🚧 Future Enhancements

The architecture is designed to easily integrate:
- Real KYC provider (e.g., Jumio, Onfido)
- Real custodian services
- Real trading partner APIs
- Compliance monitoring systems
- FX conversion for international stocks
- TradingView Charting Library (full version with API access)
- Advanced AI/ML models for insights

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

This is a demo/prototype project. For production use, ensure:
1. Real authentication and security
2. Real database integration
3. Real KYC compliance
4. Real trading partner integration
5. Proper error handling and logging
6. Comprehensive testing

## 📄 License

This is a demo project for demonstration purposes only.

---

**Built with ❤️ for Malaysian investors**

