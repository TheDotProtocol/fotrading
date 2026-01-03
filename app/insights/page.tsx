'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { AIInsight } from '@/types'
import { Brain, AlertTriangle, TrendingUp, BookOpen, Info } from 'lucide-react'

export default function InsightsPage() {
  const router = useRouter()
  const { user, insights, setInsights } = useStore()

  useEffect(() => {
    if (!user) {
      router.push('/register')
      return
    }

    const fetchInsights = async () => {
      const res = await fetch('/api/insights')
      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights)
      }
    }

    fetchInsights()
    const interval = setInterval(fetchInsights, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [user, router, setInsights])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'RISK_WARNING':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'MARKET_UPDATE':
        return <TrendingUp className="w-6 h-6 text-blue-500" />
      case 'PORTFOLIO_ANALYSIS':
        return <Brain className="w-6 h-6 text-purple-500" />
      case 'EDUCATION':
        return <BookOpen className="w-6 h-6 text-green-500" />
      default:
        return <Info className="w-6 h-6 text-gray-500" />
    }
  }

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-200 bg-red-50'
      case 'MEDIUM':
        return 'border-yellow-200 bg-yellow-50'
      case 'LOW':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-800">AI Insights</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>AI Educational Insights Only</strong>
                <br />
                These insights are generated using rule-based analysis and are for educational purposes only.
                They do not constitute financial advice. Always consult with a licensed financial advisor
                before making investment decisions.
              </p>
            </div>
          </div>
        </div>

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : insight.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{insight.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(insight.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No insights available at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">
              Insights will appear as you build your portfolio and trade.
            </p>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How AI Insights Work</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Portfolio concentration risk analysis</li>
            <li>• Sector allocation recommendations</li>
            <li>• Market volatility alerts</li>
            <li>• Performance analysis and suggestions</li>
            <li>• Educational content about investing</li>
          </ul>
          <p className="text-xs text-blue-700 mt-4">
            <strong>Note:</strong> This is a prototype system using rule-based logic.
            A production system would use advanced AI/ML models for more sophisticated analysis.
          </p>
        </div>
      </div>
    </div>
  )
}

