'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Portfolio, Holding } from '@/types'
import { TrendingUp, TrendingDown, Download, Wallet, Bot, AlertCircle, TrendingUp as SellIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Link from 'next/link'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function PortfolioPage() {
  const router = useRouter()
  const { user, portfolio, setPortfolio } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/register')
      return
    }

    const fetchPortfolio = async () => {
      const res = await fetch('/api/portfolio')
      if (res.ok) {
        const data = await res.json()
        setPortfolio(data.portfolio)
      }
      setLoading(false)
    }

    fetchPortfolio()
    const interval = setInterval(fetchPortfolio, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [user, router, setPortfolio])

  // Show sample portfolio if loading or no portfolio
  const displayPortfolio = portfolio || {
    userId: user?.id || '',
    totalInvested: 2162,
    currentValue: 2162,
    totalPnl: 0,
    totalPnlPercent: 0,
    cashBalance: 5000,
    holdings: [
      {
        ticker: 'MAYBANK',
        qty: 100,
        avgPrice: 9.00,
        currentPrice: 9.12,
        totalValue: 912,
        pnl: 12,
        pnlPercent: 1.33,
        sector: 'Banking',
      },
      {
        ticker: 'CIMB',
        qty: 200,
        avgPrice: 6.20,
        currentPrice: 6.25,
        totalValue: 1250,
        pnl: 10,
        pnlPercent: 0.81,
        sector: 'Banking',
      },
    ],
    equityHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 2100 + Math.random() * 100,
    })),
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  const sectorAllocation = displayPortfolio.holdings.reduce((acc: Record<string, number>, holding: Holding) => {
    acc[holding.sector] = (acc[holding.sector] || 0) + holding.totalValue
    return acc
  }, {})

  const pieData = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }))

  // Generate Mr FO AI recommendations
  const generateMrFOInsights = () => {
    const insights: Array<{ type: 'diversify' | 'sell' | 'hold'; message: string; ticker?: string }> = []
    
    // Check for diversification needs
    const bankingExposure = (sectorAllocation['Banking'] || 0) / displayPortfolio.currentValue
    if (bankingExposure > 0.5 && displayPortfolio.holdings.length > 0) {
      insights.push({
        type: 'diversify',
        message: `Okay, based on your portfolio, you can diversify to Technology, Consumer Goods, or Utilities sectors. This will help build wealth and reduce risk. Right now you're too heavy on Banking (${(bankingExposure * 100).toFixed(0)}%).`,
      })
    }

    // Check for sell signals
    displayPortfolio.holdings.forEach((holding) => {
      if (holding.pnlPercent > 15) {
        insights.push({
          type: 'sell',
          ticker: holding.ticker,
          message: `Oi! ${holding.ticker} is going high (up ${holding.pnlPercent.toFixed(1)}%)! You can sell now to lock in profits! 🚀`,
        })
      } else if (holding.pnlPercent > 10) {
        insights.push({
          type: 'sell',
          ticker: holding.ticker,
          message: `Hey, ${holding.ticker} is up ${holding.pnlPercent.toFixed(1)}% - this one is going high, so you can sell if you want to take profits!`,
        })
      }
    })

    // If no specific insights, provide general advice
    if (insights.length === 0) {
      insights.push({
        type: 'hold',
        message: 'Your portfolio looks balanced. Keep monitoring and consider adding more sectors for better diversification.',
      })
    }

    return insights
  }

  const mrFOInsights = generateMrFOInsights()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Portfolio</h1>

        {/* Mr FO AI Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-gray-800">Mr FO</h2>
                <span className="text-sm text-gray-500">Your AI Trading Assistant</span>
              </div>
              <div className="space-y-3">
                {mrFOInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      insight.type === 'sell'
                        ? 'bg-red-50 border border-red-200'
                        : insight.type === 'diversify'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {insight.type === 'sell' ? (
                        <SellIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : insight.type === 'diversify' ? (
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          insight.type === 'sell'
                            ? 'text-red-900'
                            : insight.type === 'diversify'
                            ? 'text-blue-900'
                            : 'text-gray-900'
                        }`}>
                          {insight.message}
                        </p>
                        {insight.ticker && (
                          <Link
                            href={`/stock/${insight.ticker}`}
                            className="text-sm text-primary-600 hover:text-primary-800 mt-2 inline-block"
                          >
                            View {insight.ticker} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                * Not financial advice - AI educational insights only
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Invested</p>
            <p className="text-2xl font-bold text-gray-800">
              MYR {displayPortfolio.totalInvested.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Current Value</p>
            <p className="text-2xl font-bold text-gray-800">
              MYR {displayPortfolio.currentValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total P/L</p>
            <p className={`text-2xl font-bold flex items-center gap-2 ${
              displayPortfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {displayPortfolio.totalPnl >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              MYR {displayPortfolio.totalPnl >= 0 ? '+' : ''}{displayPortfolio.totalPnl.toFixed(2)}
            </p>
            <p className={`text-sm ${displayPortfolio.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {displayPortfolio.totalPnlPercent >= 0 ? '+' : ''}{displayPortfolio.totalPnlPercent.toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary-600" />
              MYR {displayPortfolio.cashBalance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Equity Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Equity</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayPortfolio.equityHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector Allocation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sector Allocation</h2>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No holdings yet</p>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Holdings</h2>
            <button className="flex items-center gap-2 text-primary-600 hover:text-primary-800">
              <Download className="w-4 h-4" />
              Download Statement
            </button>
          </div>
          {displayPortfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticker
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      P/L
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      P/L %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayPortfolio.holdings.map((holding) => (
                    <tr key={holding.ticker} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/stock/${holding.ticker}`}
                          className="text-primary-600 hover:text-primary-800 font-semibold"
                        >
                          {holding.ticker}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {holding.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        MYR {holding.avgPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        MYR {holding.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        MYR {holding.totalValue.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                        holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.pnl >= 0 ? '+' : ''}MYR {holding.pnl.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                        holding.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/stock/${holding.ticker}`}
                          className="text-primary-600 hover:text-primary-800 text-sm"
                        >
                          Trade →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No holdings yet</p>
              <Link
                href="/market"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Market
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

