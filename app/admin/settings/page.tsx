'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, ArrowLeft, Save, DollarSign, Clock, Shield, Bell } from 'lucide-react'
import Link from 'next/link'

interface SystemConfig {
  tradingFeePercent: number
  depositLimit: number
  withdrawalLimit: number
  kycRiskThreshold: number
  tradingHours: {
    start: string
    end: string
  }
}

export default function SystemSettingsPage() {
  const router = useRouter()
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchConfig()
  }, [router])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (response.ok) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

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
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">Configure platform parameters and limits</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trading Fees */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trading Fees</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brokerage Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.tradingFeePercent}
                onChange={(e) => setConfig({ ...config, tradingFeePercent: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 0.1% (minimum MYR 8)</p>
            </div>
          </div>
        </div>

        {/* Deposit & Withdrawal Limits */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Deposit (MYR)
              </label>
              <input
                type="number"
                value={config.depositLimit}
                onChange={(e) => setConfig({ ...config, depositLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Withdrawal (MYR)
              </label>
              <input
                type="number"
                value={config.withdrawalLimit}
                onChange={(e) => setConfig({ ...config, withdrawalLimit: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Trading Hours */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trading Hours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Open
              </label>
              <input
                type="time"
                value={config.tradingHours.start}
                onChange={(e) => setConfig({
                  ...config,
                  tradingHours: { ...config.tradingHours, start: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Close
              </label>
              <input
                type="time"
                value={config.tradingHours.end}
                onChange={(e) => setConfig({
                  ...config,
                  tradingHours: { ...config.tradingHours, end: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Risk Management</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              KYC Risk Threshold (%)
            </label>
            <input
              type="number"
              value={config.kycRiskThreshold}
              onChange={(e) => setConfig({ ...config, kycRiskThreshold: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Users above this threshold will be flagged for review</p>
          </div>
        </div>

        {/* Notification Templates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Templates</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template (KYC Approved)
              </label>
              <textarea
                rows={3}
                defaultValue="Your KYC verification has been approved. You can now start trading."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template (Trade Confirmation)
              </label>
              <textarea
                rows={3}
                defaultValue="Your trade order has been executed successfully."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

