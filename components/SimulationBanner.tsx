'use client'

import { AlertTriangle } from 'lucide-react'

export function SimulationBanner() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            ⚠️ Simulation Mode
          </h3>
          <p className="text-sm text-yellow-700">
            All stock and crypto prices are simulated for demonstration purposes only.
            No real trading or live market data is used.
          </p>
        </div>
      </div>
    </div>
  )
}

