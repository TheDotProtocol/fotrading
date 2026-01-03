'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, Info } from 'lucide-react'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  instrument: {
    symbol: string
    name: string
    price: number
    type: 'STOCK' | 'FUTURE' | 'FOREX' | 'ETF' | 'BOND'
    contractSize?: number
    lotSize?: number
  }
  onTrade: (data: {
    orderType: 'BUY' | 'SELL'
    qty: number
    price: number
    orderTypeDetail: 'MARKET' | 'LIMIT'
    limitPrice?: number
  }) => void
}

export function TradeModal({ isOpen, onClose, instrument, onTrade }: TradeModalProps) {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [qty, setQty] = useState('')
  const [limitPrice, setLimitPrice] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!qty || parseFloat(qty) <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    if (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      alert('Please enter a valid limit price')
      return
    }

    onTrade({
      orderType: tradeType,
      qty: parseFloat(qty),
      price: instrument.price,
      orderTypeDetail: orderType,
      limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
    })
  }

  const calculateTotal = () => {
    if (!qty || parseFloat(qty) <= 0) return { amount: 0, fees: { brokerage: 0, clearing: 0, stamp: 0, total: 0 }, grandTotal: 0 }
    
    let amount = 0
    const quantity = parseFloat(qty)

    if (instrument.type === 'FUTURE') {
      // Futures: qty * price * contract size
      const contractSize = instrument.contractSize || 100
      amount = quantity * instrument.price * contractSize
      // Futures typically have lower fees, margin-based
      const margin = amount * 0.1 // 10% margin
      return {
        amount: margin,
        fees: { brokerage: margin * 0.001, clearing: margin * 0.0003, stamp: 0, total: margin * 0.0013 },
        grandTotal: margin * 1.0013,
        margin,
        contractValue: amount,
      }
    } else if (instrument.type === 'FOREX') {
      // Forex: qty (lots) * lot size * price
      const lotSize = instrument.lotSize || 100000
      amount = quantity * lotSize * instrument.price
      // Forex: spread-based, typically no separate fees
      const spread = amount * 0.0001 // 1 pip spread
      return {
        amount: amount + spread,
        fees: { brokerage: 0, clearing: 0, stamp: 0, total: spread },
        grandTotal: amount + spread,
        spread: spread,
      }
    } else if (instrument.type === 'BOND') {
      // Bonds: qty * price (as percentage of face value)
      amount = quantity * (instrument.price / 100) * 1000 // Assuming MYR 1000 face value
      return {
        amount,
        fees: { brokerage: amount * 0.001, clearing: amount * 0.0003, stamp: 0, total: amount * 0.0013 },
        grandTotal: amount * 1.0013,
      }
    } else {
      // Stocks and ETFs
      amount = quantity * instrument.price
      const brokerage = Math.max(amount * 0.001, 8)
      const clearing = Math.max(amount * 0.0003, 2)
      const stamp = Math.min(Math.ceil(amount / 1000), 200)
      return {
        amount,
        fees: { brokerage, clearing, stamp, total: brokerage + clearing + stamp },
        grandTotal: amount + brokerage + clearing + stamp,
      }
    }
  }

  const calculation = calculateTotal()

  const getInstrumentInfo = () => {
    switch (instrument.type) {
      case 'FUTURE':
        return {
          title: 'Futures Trading',
          description: 'Trade contracts for future delivery. Use leverage to control larger positions with less capital.',
          qtyLabel: 'Contracts',
          qtyPlaceholder: 'Enter number of contracts',
          note: `Each contract = ${instrument.contractSize || 100} units. Margin required: ~10% of contract value.`,
        }
      case 'FOREX':
        return {
          title: 'Forex Trading',
          description: 'Trade currency pairs. Buy or sell based on exchange rate movements.',
          qtyLabel: 'Lots',
          qtyPlaceholder: 'Enter number of lots (1 lot = 100,000 units)',
          note: '1 Standard Lot = 100,000 units. Mini Lot = 10,000, Micro Lot = 1,000.',
        }
      case 'ETF':
        return {
          title: 'ETF Trading',
          description: 'Trade Exchange Traded Funds. Similar to stocks but diversified across multiple assets.',
          qtyLabel: 'Shares',
          qtyPlaceholder: 'Enter number of shares',
          note: 'ETFs trade like stocks with similar fees and trading hours.',
        }
      case 'BOND':
        return {
          title: 'Bond Trading',
          description: 'Buy government or corporate bonds. Earn interest and get principal back at maturity.',
          qtyLabel: 'Units',
          qtyPlaceholder: 'Enter number of bond units',
          note: 'Face value typically MYR 100 per unit. Price shown as percentage of face value.',
        }
      default:
        return {
          title: 'Stock Trading',
          description: 'Buy or sell shares of companies listed on Bursa Malaysia.',
          qtyLabel: 'Shares',
          qtyPlaceholder: 'Enter number of shares',
          note: 'Standard stock trading with brokerage, clearing, and stamp duty fees.',
        }
    }
  }

  const info = getInstrumentInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {info.title} - {instrument.symbol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{instrument.name}</p>
          <p className="text-lg font-semibold text-gray-800">
            Current Price: {instrument.type === 'BOND' 
              ? `${instrument.price.toFixed(2)}%` 
              : instrument.type === 'FOREX'
              ? instrument.price.toFixed(4)
              : `MYR ${instrument.price.toFixed(2)}`}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">{info.description}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Trade Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trade Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  tradeType === 'BUY'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                {instrument.type === 'FUTURE' || instrument.type === 'FOREX' ? 'LONG' : 'BUY'}
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  tradeType === 'SELL'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                {instrument.type === 'FUTURE' || instrument.type === 'FOREX' ? 'SHORT' : 'SELL'}
              </button>
            </div>
            {instrument.type === 'FUTURE' && (
              <p className="text-xs text-gray-500 mt-2">
                LONG = Buy (profit if price goes up) | SHORT = Sell (profit if price goes down)
              </p>
            )}
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as 'MARKET' | 'LIMIT')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
            >
              <option value="MARKET">Market Order (Immediate)</option>
              <option value="LIMIT">Limit Order (At Specific Price)</option>
            </select>
          </div>

          {/* Limit Price */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
                placeholder="Enter limit price"
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {info.qtyLabel}
            </label>
            <input
              type="number"
              step={instrument.type === 'FOREX' ? '0.01' : '1'}
              min="0.01"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900"
              placeholder={info.qtyPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">{info.note}</p>
          </div>

          {/* Calculation */}
          {qty && parseFloat(qty) > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {instrument.type === 'FUTURE' && 'contractValue' in calculation && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contract Value:</span>
                    <span className="font-medium">MYR {(calculation as any).contractValue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margin Required (10%):</span>
                    <span className="font-medium">MYR {(calculation as any).margin?.toLocaleString() || '0'}</span>
                  </div>
                </>
              )}
              {instrument.type === 'FOREX' && 'spread' in calculation && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spread:</span>
                  <span className="font-medium">MYR {(calculation as any).spread?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {instrument.type === 'BOND' 
                    ? `MYR ${calculation.amount.toFixed(2)}`
                    : instrument.type === 'FOREX'
                    ? `MYR ${calculation.amount.toLocaleString()}`
                    : `MYR ${calculation.amount.toFixed(2)}`}
                </span>
              </div>
              {calculation.fees.total > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Brokerage Fee:</span>
                    <span className="font-medium">MYR {calculation.fees.brokerage.toFixed(2)}</span>
                  </div>
                  {calculation.fees.clearing > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Clearing Fee:</span>
                      <span className="font-medium">MYR {calculation.fees.clearing.toFixed(2)}</span>
                    </div>
                  )}
                  {calculation.fees.stamp > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stamp Duty:</span>
                      <span className="font-medium">MYR {calculation.fees.stamp.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-lg">
                  {instrument.type === 'FOREX'
                    ? `MYR ${calculation.grandTotal.toLocaleString()}`
                    : `MYR ${calculation.grandTotal.toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!qty || (orderType === 'LIMIT' && !limitPrice)}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              tradeType === 'BUY'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Confirm {tradeType === 'BUY' ? (instrument.type === 'FUTURE' || instrument.type === 'FOREX' ? 'LONG' : 'BUY') : (instrument.type === 'FUTURE' || instrument.type === 'FOREX' ? 'SHORT' : 'SELL')}
          </button>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Demo Mode:</strong> All trades are simulated. No real money or positions are created.
            {instrument.type === 'FUTURE' && ' Futures trading involves high risk due to leverage.'}
            {instrument.type === 'FOREX' && ' Forex trading involves high risk due to leverage and market volatility.'}
          </p>
        </div>
      </div>
    </div>
  )
}

