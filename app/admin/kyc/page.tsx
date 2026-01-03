'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle, XCircle, Clock, ArrowLeft, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface KYCUser {
  id: string
  name: string
  email: string
  kycStatus: string
  submittedAt?: string
  rejectionReason?: string
  rejectedAt?: string
  reviewedBy?: string
}

export default function KYCReviewPage() {
  const router = useRouter()
  const [users, setUsers] = useState<KYCUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
      return
    }

    fetchKYCUsers()
  }, [router, filter])

  const fetchKYCUsers = async () => {
    try {
      const response = await fetch(`/api/admin/kyc?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch KYC users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKycAction = async (userId: string, action: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, rejectionReason: reason }),
      })
      if (response.ok) {
        fetchKYCUsers()
        alert(`KYC ${action} successful`)
      }
    } catch (error) {
      alert('Failed to update KYC status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KYC reviews...</p>
        </div>
      </div>
    )
  }

  const pendingCount = users.filter(u => u.kycStatus === 'PENDING').length

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
                <h1 className="text-2xl font-bold text-gray-900">KYC Review</h1>
                <p className="text-sm text-gray-500">Review and approve identity verification submissions</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium">
                {pendingCount} Pending Review
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    filter === status
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({users.filter(u => u.kycStatus.toUpperCase() === status.toUpperCase()).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KYC List */}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.submittedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(user.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.kycStatus === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {user.kycStatus === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
                    {user.kycStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                    <span className="font-medium text-gray-900">{user.kycStatus}</span>
                  </div>
                  {user.kycStatus === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleKycAction(user.id, 'approve')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleKycAction(user.id, 'reject')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      >
                        Reject
                      </button>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                      >
                        Review Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No KYC submissions found</p>
          </div>
        )}
      </main>
    </div>
  )
}

