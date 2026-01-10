'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Stock } from '@/types'
import { Search, TrendingUp, TrendingDown, BarChart3, Coins, DollarSign, TrendingUp as FutureIcon, Globe, Bitcoin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TradingViewMarketOverview } from '@/components/TradingViewWidget'
import { marketIndices, futures, currencies, etfs, bonds } from '@/lib/marketData'
import { TradeModal } from '@/components/TradeModal'
import { SimulationBanner } from '@/components/SimulationBanner'

type MarketTab = 'overview' | 'indices' | 'stocks' | 'futures' | 'forex' | 'etfs' | 'bonds' | 'crypto'

export default function MarketPage() {
  const router = useRouter()
  const { stocks, setStocks, user } = useStore()
  const [activeTab, setActiveTab] = useState<MarketTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'ticker' | 'price' | 'change'>('ticker')
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean
    instrument: any
  }>({ isOpen: false, instrument: null })

  const [cryptocurrencies, setCryptocurrencies] = useState<any[]>([])

  useEffect(() => {
    const fetchMarketData = async () => {
      const res = await fetch('/api/market')
      const data = await res.json()
      setStocks(data.stocks || [])
      setCryptocurrencies(data.cryptocurrencies || [])
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 3000) // Refresh every 3s (faster for simulation)

    return () => clearInterval(interval)
  }, [setStocks])

  const handleTrade = async (data: {
    orderType: 'BUY' | 'SELL'
    qty: number
    price: number
    orderTypeDetail: 'MARKET' | 'LIMIT'
    limitPrice?: number
  }) => {
    if (!user) {
      router.push('/register')
      return
    }

    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderType: data.orderType,
        ticker: tradeModal.instrument.symbol,
        qty: data.qty,
        price: data.price,
        orderTypeDetail: data.orderTypeDetail,
        limitPrice: data.limitPrice,
        instrumentType: tradeModal.instrument.type,
        contractSize: tradeModal.instrument.contractSize,
        lotSize: tradeModal.instrument.lotSize,
      }),
    })

    if (response.ok) {
      const { order } = await response.json()
      alert(`Order ${order.status === 'FILLED' ? 'filled' : 'placed'} successfully!`)
      setTradeModal({ isOpen: false, instrument: null })
      router.push('/portfolio')
    } else {
      const { error } = await response.json()
      alert(error || 'Failed to place order')
    }
  }

  const filteredStocks = stocks
    .filter(stock =>
      stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'ticker') return a.ticker.localeCompare(b.ticker)
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'change') return b.changePercent - a.changePercent
      return 0
    })

  const tabs = [
    { id: 'overview' as MarketTab, label: 'Market Overview', icon: BarChart3 },
    { id: 'indices' as MarketTab, label: 'Major Indices', icon: TrendingUp },
    { id: 'stocks' as MarketTab, label: 'Stocks', icon: Coins },
    { id: 'futures' as MarketTab, label: 'Futures & Commodities', icon: FutureIcon },
    { id: 'forex' as MarketTab, label: 'Forex & Currencies', icon: DollarSign },
    { id: 'etfs' as MarketTab, label: 'ETFs', icon: Globe },
    { id: 'bonds' as MarketTab, label: 'Bonds', icon: TrendingDown },
    { id: 'crypto' as MarketTab, label: 'Cryptocurrency', icon: Bitcoin },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Malaysia Markets</h1>
        
        {/* Simulation Mode Banner */}
        <SimulationBanner />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '500px' }}>
              <h2 className="text-xl font-semibold mb-4">Live Market Overview</h2>
              <TradingViewMarketOverview />
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500 mb-1">KLCI Index</p>
                <p className="text-2xl font-bold text-gray-800">{marketIndices[0].value.toFixed(2)}</p>
                <p className={`text-sm ${marketIndices[0].changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketIndices[0].changePercent >= 0 ? '+' : ''}{marketIndices[0].changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500 mb-1">Gold Futures</p>
                <p className="text-2xl font-bold text-gray-800">MYR {futures[0].price.toFixed(2)}</p>
                <p className={`text-sm ${futures[0].changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {futures[0].changePercent >= 0 ? '+' : ''}{futures[0].changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500 mb-1">USD/MYR</p>
                <p className="text-2xl font-bold text-gray-800">{currencies[0].rate.toFixed(4)}</p>
                <p className={`text-sm ${currencies[0].changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currencies[0].changePercent >= 0 ? '+' : ''}{currencies[0].changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500 mb-1">Total Stocks</p>
                <p className="text-2xl font-bold text-gray-800">{stocks.length}</p>
                <p className="text-sm text-gray-500">Active listings</p>
              </div>
            </div>
          </div>
        )}

        {/* Major Indices Tab */}
        {activeTab === 'indices' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Major Indices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Index</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marketIndices.map((index) => (
                    <tr key={index.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{index.symbol}</div>
                        <div className="text-sm text-gray-500">{index.name}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {index.value.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        index.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            {/* Simulation Banner */}
            <SimulationBanner />
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ticker">Sort by Ticker</option>
                  <option value="price">Sort by Price</option>
                  <option value="change">Sort by Change %</option>
                </select>
              </div>
            </div>

            {/* Stock List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (MYR)</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStocks.map((stock) => (
                      <tr key={stock.ticker} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{stock.ticker}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stock.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {stock.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${
                            stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{stock.sector}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-500">
                            {(stock.volume / 1000000).toFixed(2)}M
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/stock/${stock.ticker}`}
                              className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                            >
                              View →
                            </Link>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setTradeModal({
                                isOpen: true,
                                instrument: {
                                  symbol: stock.ticker,
                                  name: stock.name,
                                  price: stock.price,
                                  type: 'STOCK',
                                },
                              })}
                              className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                            >
                              Trade
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Futures & Commodities Tab */}
        {activeTab === 'futures' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Futures & Commodities</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {futures.map((future) => (
                    <tr key={future.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{future.symbol}</td>
                      <td className="px-6 py-4 text-gray-900">{future.name}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {future.price.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        future.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {future.change >= 0 ? '+' : ''}{future.change.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        future.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {future.changePercent >= 0 ? '+' : ''}{future.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{future.contract}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTradeModal({
                            isOpen: true,
                            instrument: {
                              symbol: future.symbol,
                              name: future.name,
                              price: future.price,
                              type: 'FUTURE',
                              contractSize: 100,
                            },
                          })}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Forex & Currencies Tab */}
        {activeTab === 'forex' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Forex & Currencies</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pair</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currencies.map((currency) => (
                    <tr key={currency.pair} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{currency.pair}</td>
                      <td className="px-6 py-4 text-gray-900">{currency.name}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {currency.rate.toFixed(4)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        currency.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(4)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        currency.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTradeModal({
                            isOpen: true,
                            instrument: {
                              symbol: currency.pair,
                              name: currency.name,
                              price: currency.rate,
                              type: 'FOREX',
                              lotSize: 100000,
                            },
                          })}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ETFs Tab */}
        {activeTab === 'etfs' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Exchange Traded Funds (ETFs)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (MYR)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {etfs.map((etf) => (
                    <tr key={etf.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{etf.symbol}</td>
                      <td className="px-6 py-4 text-gray-900">{etf.name}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {etf.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        etf.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {etf.change >= 0 ? '+' : ''}{etf.change.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        etf.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {etf.volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTradeModal({
                            isOpen: true,
                            instrument: {
                              symbol: etf.symbol,
                              name: etf.name,
                              price: etf.price,
                              type: 'ETF',
                            },
                          })}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cryptocurrency Tab */}
        {activeTab === 'crypto' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Cryptocurrency Markets</h2>
              <p className="text-sm text-gray-500 mt-1">Trade cryptocurrencies 24/7 with low fees</p>
            </div>
            <div className="p-4">
              <SimulationBanner />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (USDT)</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">24h Volume</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cryptocurrencies.length > 0 ? cryptocurrencies.map((crypto) => (
                    <tr key={crypto.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{crypto.symbol}</td>
                      <td className="px-6 py-4 text-gray-900">{crypto.name}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        crypto.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        crypto.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        ${(crypto.volume / 1000000).toFixed(0)}M
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTradeModal({
                            isOpen: true,
                            instrument: {
                              symbol: crypto.symbol,
                              name: crypto.name,
                              price: crypto.price,
                              type: 'CRYPTO',
                            },
                          })}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Loading cryptocurrency data...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bonds Tab */}
        {activeTab === 'bonds' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Malaysian Government Bonds</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Coupon %</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Yield %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bonds.map((bond) => (
                    <tr key={bond.symbol} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{bond.symbol}</td>
                      <td className="px-6 py-4 text-gray-900">{bond.name}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {bond.coupon > 0 ? `${bond.coupon.toFixed(2)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {bond.yield.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{bond.maturity}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {bond.price.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setTradeModal({
                            isOpen: true,
                            instrument: {
                              symbol: bond.symbol,
                              name: bond.name,
                              price: bond.price,
                              type: 'BOND',
                            },
                          })}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade Modal */}
        {tradeModal.isOpen && tradeModal.instrument && (
          <TradeModal
            isOpen={tradeModal.isOpen}
            onClose={() => setTradeModal({ isOpen: false, instrument: null })}
            instrument={tradeModal.instrument}
            onTrade={handleTrade}
          />
        )}
      </div>
    </div>
  )
}
