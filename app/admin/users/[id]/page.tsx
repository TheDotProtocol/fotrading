'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Shield, DollarSign, TrendingUp, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Lock, Unlock, Ban, Settings, Download } from 'lucide-react'
import Link from 'next/link'

interface UserDetail {
  id: string
  name: string
  email: string
  phone: string
  kycStatus: string
  riskFlag: string
  accountStatus: string
  totalBalance: number
  totalTradeVolume: number
  registrationDate: string
  portfolio?: any
  trades?: any[]
  transactions?: any[]
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'trades' | 'wallet' | 'controls'>('profile')

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchUserDetails()
  }, [userId, router])

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    // Implement actions like freeze, ban, etc.
    alert(`${action} action would be executed here`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <Link href="/admin/users" className="text-primary-600 mt-4 inline-block">← Back to Users</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'kyc' as const, label: 'KYC Review', icon: FileText },
    { id: 'trades' as const, label: 'Trading History', icon: TrendingUp },
    { id: 'wallet' as const, label: 'Wallet History', icon: DollarSign },
    { id: 'controls' as const, label: 'Account Controls', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.accountStatus === 'ACTIVE' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              )}
              {user.riskFlag === 'HIGH' && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  High Risk
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Account Balance</p>
            <p className="text-2xl font-bold text-gray-900">MYR {user.totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Total Trade Volume</p>
            <p className="text-2xl font-bold text-gray-900">MYR {(user.totalTradeVolume / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">KYC Status</p>
            <div className="flex items-center gap-2 mt-1">
              {user.kycStatus === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {user.kycStatus === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
              {user.kycStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
              <span className="font-semibold text-gray-900">{user.kycStatus}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500 mb-1">Risk Level</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              user.riskFlag === 'HIGH' ? 'bg-red-100 text-red-800' :
              user.riskFlag === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.riskFlag}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Full Name</label>
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium text-gray-900">{user.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Registration Date</label>
                        <p className="font-medium text-gray-900">
                          {new Date(user.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">User ID</label>
                        <p className="font-medium text-gray-900 font-mono text-sm">{user.id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Account Status</label>
                        <p className="font-medium text-gray-900">{user.accountStatus}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Risk Category</label>
                        <p className="font-medium text-gray-900">Retail</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">KYC Verification</h3>
                  <div className="flex gap-2">
                    {user.kycStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction('approve_kyc')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction('reject_kyc')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction('request_resubmit')}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium"
                        >
                          Request Resubmit
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm text-gray-600">
                    KYC documents preview would appear here. In a real system, this would show uploaded NRIC, selfie, and other verification documents.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Trading History</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {user.trades && user.trades.length > 0 ? (
                        user.trades.map((trade: any) => (
                          <tr key={trade.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(trade.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.orderType === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {trade.orderType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{trade.ticker}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{trade.qty}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">MYR {trade.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              MYR {(trade.qty * trade.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            No trades found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {user.transactions && user.transactions.length > 0 ? (
                        user.transactions.map((txn: any) => (
                          <tr key={txn.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                txn.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {txn.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              MYR {txn.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{txn.method || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                txn.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Account Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAction('freeze')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                  >
                    <Lock className="w-5 h-5 text-yellow-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Freeze Account</p>
                      <p className="text-sm text-gray-500">Temporarily restrict account access</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction('unfreeze')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <Unlock className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Unfreeze Account</p>
                      <p className="text-sm text-gray-500">Restore account access</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction('ban')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Ban className="w-5 h-5 text-red-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Ban Account</p>
                      <p className="text-sm text-gray-500">Permanently disable account</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleAction('reset_password')}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Reset Password</p>
                      <p className="text-sm text-gray-500">Send password reset link</p>
                    </div>
                  </button>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> All account control actions are logged in the audit trail.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

