'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, DollarSign, TrendingUp, FileText, Settings, LogOut, BarChart3, AlertTriangle, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface DashboardMetrics {
  totalUsers: number
  verifiedUsers: number
  totalDeposits: number
  totalWithdrawals: number
  todayVolume: number
  todayTrades: number
  flaggedAccounts: number
  totalRevenue: number
  totalTrades: number
}

interface ChartData {
  date: string
  volume: number
  users: number
  revenue: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    // Check admin authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    setAdminName(sessionStorage.getItem('adminName') || 'Admin')
    setAuthenticated(true)
    setLoading(false)

    // Fetch dashboard data
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setChartData(data.chartData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    sessionStorage.removeItem('adminId')
    sessionStorage.removeItem('adminRole')
    sessionStorage.removeItem('adminName')
    sessionStorage.removeItem('adminLoginTime')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  const stats = metrics ? [
    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-500', change: '+12%' },
    { label: 'Verified Users', value: metrics.verifiedUsers.toLocaleString(), icon: Shield, color: 'bg-green-500', change: '+8%' },
    { label: 'Today&apos;s Volume', value: `MYR ${(metrics.todayVolume / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'bg-yellow-500', change: '+5.2%' },
    { label: 'Today&apos;s Trades', value: metrics.todayTrades.toLocaleString(), icon: BarChart3, color: 'bg-purple-500', change: '+3.1%' },
    { label: 'Total Revenue', value: `MYR ${(metrics.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: 'bg-indigo-500', change: '+15%' },
    { label: 'Flagged Accounts', value: metrics.flaggedAccounts.toString(), icon: AlertTriangle, color: 'bg-red-500', change: metrics.flaggedAccounts > 0 ? '⚠️' : '✓' },
  ] : []

  const quickActions = [
    { label: 'User Management', icon: Users, href: '/admin/users', description: 'View and manage users' },
    { label: 'Trade Monitoring', icon: TrendingUp, href: '/admin/trades', description: 'Monitor trading activity' },
    { label: 'KYC Review', icon: FileText, href: '/admin/kyc', description: 'Review KYC submissions' },
    { label: 'Support Tickets', icon: Settings, href: '/admin/support', description: 'Handle support requests' },
    { label: 'Revenue Dashboard', icon: DollarSign, href: '/admin/revenue', description: 'View revenue analytics' },
    { label: 'System Settings', icon: Settings, href: '/admin/settings', description: 'Configure system' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {adminName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Overview</h2>
          <p className="text-gray-600">Real-time metrics and system status</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 
                    stat.change.startsWith('⚠️') ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* System Alerts */}
        {metrics && metrics.flaggedAccounts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">System Alert</h3>
                <p className="text-sm text-yellow-800">
                  {metrics.flaggedAccounts} account(s) flagged for review. <Link href="/admin/users?riskLevel=HIGH" className="underline font-medium">Review now →</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{action.label}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trading Volume Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Trading Volume (Last 30 Days)</h3>
              <span className="text-sm text-gray-500">MYR</span>
            </div>
            <div className="h-80 flex items-end justify-between gap-2">
              {chartData.map((data, index) => {
                const maxVolume = Math.max(...chartData.map(d => d.volume))
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all hover:from-primary-700 hover:to-primary-500 cursor-pointer"
                      style={{ height: `${(data.volume / maxVolume) * 100}%`, minHeight: '4px' }}
                      title={`${data.date}: MYR ${(data.volume / 1000).toFixed(0)}K`}
                    ></div>
                    {index % 5 === 0 && (
                      <span className="text-xs text-gray-500 mt-2">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Volume</span>
                <span className="font-semibold text-gray-900">
                  MYR {(chartData.reduce((sum, d) => sum + d.volume, 0) / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 30 Days)</h3>
              <span className="text-sm text-gray-500">MYR</span>
            </div>
            <div className="h-80 flex items-end justify-between gap-2">
              {chartData.map((data, index) => {
                const maxRevenue = Math.max(...chartData.map(d => d.revenue))
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:from-green-700 hover:to-green-500 cursor-pointer"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                      title={`${data.date}: MYR ${(data.revenue / 1000).toFixed(0)}K`}
                    ></div>
                    {index % 5 === 0 && (
                      <span className="text-xs text-gray-500 mt-2">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Revenue</span>
                <span className="font-semibold text-gray-900">
                  MYR {(chartData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* New Users Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Users (Last 30 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((data, index) => {
              const maxUsers = Math.max(...chartData.map(d => d.users))
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                    style={{ height: `${(data.users / maxUsers) * 100}%`, minHeight: '4px' }}
                    title={`${data.date}: ${data.users} new users`}
                  ></div>
                  {index % 5 === 0 && (
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-12 text-gray-500">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">Activity logs will appear here</p>
          </div>
        </div>
      </main>
    </div>
  )
}
