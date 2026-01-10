'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { User } from '@/types'
import { User as UserIcon, Shield, FileText, Mail, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [kycStatus, setKycStatus] = useState<string>('PENDING')

  useEffect(() => {
    if (!user) {
      router.push('/register')
      return
    }

    setKycStatus(user.kycStatus)

    const fetchKYC = async () => {
      const res = await fetch('/api/kyc')
      if (res.ok) {
        const data = await res.json()
        if (data.kycData) {
          setKycStatus(data.kycData.kycStatus)
        }
      }
    }

    fetchKYC()
  }, [user, router])

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <UserIcon className="w-8 h-8 text-primary-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Risk Category</label>
              <input
                type="text"
                value={user?.riskCategory || 'Not Set'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-8 h-8 text-primary-600" />
            <h2 className="text-xl font-semibold">KYC Status</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getKYCStatusIcon(kycStatus)}
              <div>
                <p className="font-medium text-gray-800">Identity Verification</p>
                <p className="text-sm text-gray-500">Status: {kycStatus}</p>
              </div>
            </div>
            {kycStatus !== 'APPROVED' && (
              <a
                href="/kyc"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
              >
                Complete KYC
              </a>
            )}
          </div>
        </div>

        {/* Legal & Compliance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <FileText className="w-8 h-8 text-primary-600" />
            <h2 className="text-xl font-semibold">Legal & Compliance</h2>
          </div>
          <div className="space-y-4">
            <a
              href="/terms"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Terms of Service</h3>
              <p className="text-sm text-gray-500">Read our terms and conditions</p>
            </a>
            <a
              href="/privacy"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Privacy Policy</h3>
              <p className="text-sm text-gray-500">How we handle your data</p>
            </a>
            <a
              href="/disclaimer"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-1">Risk Disclaimer</h3>
              <p className="text-sm text-gray-500">Important information about trading risks</p>
            </a>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Mail className="w-8 h-8 text-primary-600" />
            <h2 className="text-xl font-semibold">Support</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">Contact Support</p>
              <p className="text-sm text-gray-500 mb-2">
                Email: support@xentro.demo
              </p>
              <p className="text-sm text-gray-500">
                Phone: +60 3-XXXX XXXX (Demo Only)
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">Help Center</p>
              <a href="/help" className="text-sm text-primary-600 hover:underline">
                Visit Help Center →
              </a>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Demo Platform Notice</h3>
          <p className="text-sm text-yellow-800">
            This is a demonstration platform only. No real trades are executed, no real money is involved,
            and no real personal information is stored. All data is simulated for testing and demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  )
}

