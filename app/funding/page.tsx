'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Transaction, Portfolio } from '@/types'
import { ArrowLeft, ArrowDown, ArrowUp, Wallet, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function FundingPage() {
  const router = useRouter()
  const { user, portfolio, setPortfolio, transactions, addTransaction } = useStore()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT')
  const [method, setMethod] = useState<'FPX' | 'BANK_TRANSFER'>('FPX')

  useEffect(() => {
    if (!user) {
      router.push('/register')
      return
    }

    const fetchData = async () => {
      const [portfolioRes, transactionsRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/funding'),
      ])

      if (portfolioRes.ok) {
        const { portfolio: p } = await portfolioRes.json()
        setPortfolio(p)
      }

      if (transactionsRes.ok) {
        const { transactions: t } = await transactionsRes.json()
        t.forEach((txn: Transaction) => addTransaction(txn))
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5s to check transaction status
    return () => clearInterval(interval)
  }, [user, router, setPortfolio, addTransaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    const response = await fetch('/api/funding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        amount: parseFloat(amount),
        method,
      }),
    })

    if (response.ok) {
      const { transaction } = await response.json()
      addTransaction(transaction)
      setAmount('')
      alert(`Transaction ${type === 'DEPOSIT' ? 'initiated' : 'requested'} successfully!`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Funding</h1>

        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <Wallet className="w-12 h-12 text-primary-600" />
            <div>
              <p className="text-sm text-gray-500">Available Balance</p>
              <p className="text-3xl font-bold text-gray-800">
                MYR {portfolio?.cashBalance.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {type === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType('DEPOSIT')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    type === 'DEPOSIT'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowDown className="w-5 h-5" />
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setType('WITHDRAWAL')}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    type === 'WITHDRAWAL'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                  Withdraw
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (MYR)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'FPX' | 'BANK_TRANSFER')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="FPX">FPX (Online Banking)</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Transactions are simulated and completed automatically after 2 seconds.
                No real money is involved.
              </p>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                type === 'DEPOSIT'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {type === 'DEPOSIT' ? 'Initiate Deposit' : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Transaction History</h2>
          </div>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          txn.type === 'DEPOSIT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        {txn.type === 'DEPOSIT' ? '+' : '-'}MYR {txn.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {txn.method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(txn.status)}
                          <span className="text-sm font-medium">{txn.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

