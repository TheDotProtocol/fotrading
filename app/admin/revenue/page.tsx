'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, TrendingUp, BarChart3, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface RevenueData {
  totalRevenue: number
  brokerageFees: number
  clearingFees: number
  stampDuty: number
  monthlyData: Array<{
    month: string
    revenue: number
    trades: number
  }>
  topEarners: Array<{
    userId: string
    name: string
    fees: number
  }>
}

export default function RevenueDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchRevenueData()
  }, [router])

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/admin/revenue')
      if (response.ok) {
        const revenueData = await response.json()
        setData(revenueData)
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const maxRevenue = Math.max(...data.monthlyData.map(d => d.revenue))

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
                <h1 className="text-2xl font-bold text-gray-900">Revenue & Fees Dashboard</h1>
                <p className="text-sm text-gray-500">Platform earnings and fee analytics</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">MYR {(data.totalRevenue / 1000).toFixed(1)}K</p>
            <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Brokerage Fees</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">MYR {(data.brokerageFees / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-500 mt-1">{(data.brokerageFees / data.totalRevenue * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Clearing Fees</p>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">MYR {(data.clearingFees / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-500 mt-1">{(data.clearingFees / data.totalRevenue * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Stamp Duty</p>
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">MYR {(data.stampDuty / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-500 mt-1">{(data.stampDuty / data.totalRevenue * 100).toFixed(1)}% of total</p>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h3>
          <div className="h-80 flex items-end justify-between gap-2">
            {data.monthlyData.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                  style={{ height: `${(month.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  title={`${month.month}: MYR ${(month.revenue / 1000).toFixed(1)}K`}
                ></div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900">MYR {(month.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 mt-1">{month.month}</p>
                  <p className="text-xs text-gray-400">{month.trades} trades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Earners */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Fee Contributors</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fees</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topEarners.map((earner, index) => (
                  <tr key={earner.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{earner.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      MYR {earner.fees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {((earner.fees / data.totalRevenue) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

