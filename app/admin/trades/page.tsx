'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, AlertTriangle, Filter, Search, ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

interface Trade {
  id: string
  userId: string
  userName: string
  orderType: string
  ticker: string
  qty: number
  price: number
  totalAmount: number
  status: string
  createdAt: string
}

export default function TradeMonitoringPage() {
  const router = useRouter()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchTrades()
  }, [router, filter])

  const fetchTrades = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('filter', filter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/trades?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTrades(data.trades)
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trades...</p>
        </div>
      </div>
    )
  }

  const suspiciousTrades = trades.filter(t => 
    t.qty > 1000 || t.totalAmount > 50000
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trade Monitoring</h1>
                <p className="text-sm text-gray-500">Live trading activity and suspicious pattern detection</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Suspicious Activity Alert */}
        {suspiciousTrades.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Suspicious Activity Detected</h3>
                <p className="text-sm text-yellow-800">
                  {suspiciousTrades.length} trade(s) flagged for review (high volume or unusual patterns)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ticker, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchTrades()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Trades</option>
              <option value="suspicious">Suspicious</option>
              <option value="large">Large Volume</option>
              <option value="today">Today</option>
            </select>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trades.map((trade) => {
                  const isSuspicious = trade.qty > 1000 || trade.totalAmount > 50000
                  return (
                    <tr key={trade.id} className={`hover:bg-gray-50 ${isSuspicious ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(trade.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${trade.userId}`}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          {trade.userName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.orderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{trade.ticker}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{trade.qty}</td>
                      <td className="px-6 py-4 text-right text-gray-900">MYR {trade.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        MYR {trade.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSuspicious && (
                          <button className="text-yellow-600 hover:text-yellow-800">
                            <AlertTriangle className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

