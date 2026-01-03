'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Stock, Order } from '@/types'
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import Link from 'next/link'
import { TradingViewWidget } from '@/components/TradingViewWidget'

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = params.ticker as string
  const { stocks, user } = useStore()
  const [stock, setStock] = useState<Stock | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [qty, setQty] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [chartView, setChartView] = useState<'advanced' | 'simple'>('advanced')

  useEffect(() => {
    const found = stocks.find(s => s.ticker === ticker)
    if (found) {
      setStock(found)
    } else if (stocks.length > 0) {
      // Fetch if not in store
      fetch('/api/market')
        .then(res => res.json())
        .then(data => {
          const found = data.stocks.find((s: Stock) => s.ticker === ticker)
          if (found) setStock(found)
        })
    }
  }, [ticker, stocks])

  const handleTrade = async () => {
    if (!stock || !user || !qty) return

    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderType: tradeType,
        ticker: stock.ticker,
        qty: parseInt(qty),
        price: stock.price,
        orderTypeDetail: orderType,
        limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      }),
    })

    if (response.ok) {
      const { order } = await response.json()
      alert(`Order ${order.status === 'FILLED' ? 'filled' : 'placed'} successfully!`)
      setShowTradeModal(false)
      setQty('')
      router.push('/portfolio')
    } else {
      const { error } = await response.json()
      alert(error || 'Failed to place order')
    }
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/market"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Market
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{stock.ticker}</h1>
              <p className="text-xl text-gray-600">{stock.name}</p>
              <p className="text-sm text-gray-500 mt-1">{stock.sector}</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                MYR {stock.price.toFixed(2)}
              </div>
              <div className={`text-xl font-semibold flex items-center justify-end gap-2 ${
                stock.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="mb-4">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setChartView('advanced')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  chartView === 'advanced'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Advanced Chart (TradingView)
              </button>
              <button
                onClick={() => setChartView('simple')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  chartView === 'simple'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quick View
              </button>
            </div>
          </div>

          {/* TradingView Advanced Chart */}
          {chartView === 'advanced' && (
            <div className="bg-white rounded-lg border border-gray-200 mb-6" style={{ height: '600px' }}>
              <TradingViewWidget
                symbol={stock.ticker}
                height={600}
                interval="D"
                theme="light"
                enable_publishing={false}
                hide_top_toolbar={false}
                hide_legend={false}
                save_image={true}
              />
            </div>
          )}

          {/* Simple Chart View */}
          {chartView === 'simple' && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Switch to Advanced Chart for full TradingView features including:
                </p>
                <ul className="text-left inline-block text-sm text-gray-600 space-y-2">
                  <li>• Real-time price data</li>
                  <li>• Technical indicators (RSI, MACD, Volume)</li>
                  <li>• Multiple timeframes (1m, 5m, 1h, 1D, 1W)</li>
                  <li>• Drawing tools and annotations</li>
                  <li>• Historical data analysis</li>
                </ul>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-lg font-semibold">{(stock.volume / 1000000).toFixed(2)}M</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold">
                {stock.marketCap ? `MYR ${(stock.marketCap / 1000000000).toFixed(1)}B` : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Sector</p>
              <p className="text-lg font-semibold">{stock.sector}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Exchange</p>
              <p className="text-lg font-semibold">Bursa Malaysia</p>
            </div>
          </div>

          {/* TradingView Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📊 TradingView Chart Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Real-Time Data:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Live price updates from Bursa Malaysia</li>
                  <li>Real-time volume and market depth</li>
                  <li>Intraday and historical data</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Analysis Tools:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Technical indicators (RSI, MACD, Bollinger Bands)</li>
                  <li>Drawing tools (trend lines, Fibonacci)</li>
                  <li>Multiple chart types (Candlestick, Line, Bar)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trade Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setTradeType('BUY')
                setShowTradeModal(true)
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowUpCircle className="w-5 h-5" />
              Buy
            </button>
            <button
              onClick={() => {
                setTradeType('SELL')
                setShowTradeModal(true)
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowDownCircle className="w-5 h-5" />
              Sell
            </button>
          </div>

          {/* Futures & Options Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Futures & Options Trading</h3>
                <p className="text-sm text-purple-800 mb-2">
                  Use the TradingView chart above to analyze price movements and identify entry/exit points for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-purple-800">
                  <li><strong>Spot Trading:</strong> Buy/sell stocks at current market price</li>
                  <li><strong>Futures:</strong> Trade contracts based on future price expectations</li>
                  <li><strong>Options:</strong> Buy/sell options contracts (Call/Put)</li>
                </ul>
                <p className="text-xs text-purple-700 mt-2">
                  <strong>Note:</strong> Futures and Options trading require additional account permissions and higher risk tolerance.
                  This is a demo platform - all trades are simulated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Risk Disclaimer:</strong> Trading involves risk. Past performance is not indicative of future results.
            This is a DEMO platform - no real trades are executed.
          </p>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {tradeType === 'BUY' ? 'Buy' : 'Sell'} {stock.ticker}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'MARKET' | 'LIMIT')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MARKET">Market Order</option>
                  <option value="LIMIT">Limit Order</option>
                </select>
              </div>

              {orderType === 'LIMIT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limit Price (MYR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              {qty && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Price per share:</span>
                    <span className="font-medium">MYR {stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      MYR {(parseInt(qty) * stock.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Brokerage Fee:</span>
                    <span className="font-medium">
                      MYR {Math.max((parseInt(qty) * stock.price) * 0.001, 8).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Clearing Fee:</span>
                    <span className="font-medium">
                      MYR {Math.max((parseInt(qty) * stock.price) * 0.0003, 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">
                      MYR {(
                        parseInt(qty) * stock.price +
                        Math.max((parseInt(qty) * stock.price) * 0.001, 8) +
                        Math.max((parseInt(qty) * stock.price) * 0.0003, 2) +
                        Math.min(Math.ceil((parseInt(qty) * stock.price) / 1000), 200)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowTradeModal(false)
                  setQty('')
                  setLimitPrice('')
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={!qty || (orderType === 'LIMIT' && !limitPrice)}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  tradeType === 'BUY'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Confirm {tradeType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

