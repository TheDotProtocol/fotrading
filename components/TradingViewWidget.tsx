'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  width?: string | number
  height?: string | number
  interval?: string
  theme?: 'light' | 'dark'
  style?: '1' | '2' | '3' | '4'
  locale?: string
  toolbar_bg?: string
  enable_publishing?: boolean
  hide_top_toolbar?: boolean
  hide_legend?: boolean
  save_image?: boolean
  container_id?: string
}

export function TradingViewWidget({
  symbol,
  width = '100%',
  height = 500,
  interval = 'D',
  theme = 'light',
  style = '1',
  locale = 'en',
  toolbar_bg = '#f1f3f6',
  enable_publishing = false,
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  container_id,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Convert Bursa Malaysia ticker to TradingView format
    // Format: MYX:TICKER (e.g., MYX:CIMB, MYX:MAYBANK)
    // TradingView widget API uses colon format (MYX:), URL uses dash (MYX-)
    let tvSymbol = symbol
    if (symbol.startsWith('MYX:')) {
      tvSymbol = symbol
    } else if (symbol.startsWith('MYX-')) {
      // Convert MYX- (URL format) to MYX: (API format)
      tvSymbol = symbol.replace('MYX-', 'MYX:')
    } else if (symbol.startsWith('BURSA:')) {
      // Convert old BURSA: format to MYX: format
      tvSymbol = symbol.replace('BURSA:', 'MYX:')
    } else {
      // Add MYX: prefix if not present
      tvSymbol = `MYX:${symbol}`
    }
    const containerId = container_id || `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`

    // Clear container
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: 'Asia/Kuala_Lumpur',
      theme: theme,
      style: style,
      locale: locale,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      hide_side_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: typeof window !== 'undefined' ? window.location.hostname : 'localhost', // Keep charts in-app
      studies: [
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'Volume@tv-basicstudies',
      ],
      // Prevent redirects - keep everything in-app
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default',
      ],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
      ],
      overrides: {
        'paneProperties.background': '#ffffff',
        'paneProperties.backgroundType': 'solid',
      },
    })

    containerRef.current.appendChild(script)

    // Hide loading indicator once chart loads
    const hideLoading = () => {
      const loadingEl = document.getElementById(`loading-${symbol}`)
      if (loadingEl) {
        loadingEl.style.display = 'none'
      }
    }

    // Wait a bit for chart to render, then hide loading
    const loadingTimeout = setTimeout(hideLoading, 2000)

    return () => {
      clearTimeout(loadingTimeout)
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, width, height, interval, theme, style, locale, toolbar_bg, enable_publishing, hide_top_toolbar, hide_legend, save_image, container_id])

  return (
    <div className="relative w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <div
        className="tradingview-widget-container__widget"
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      />
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50" id={`loading-${symbol}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading chart...</p>
        </div>
      </div>
    </div>
  )
}

// Mini chart widget for market listings
export function TradingViewMiniChart({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Convert to MYX: format for TradingView widget API
    let tvSymbol = symbol
    if (symbol.startsWith('MYX:')) {
      tvSymbol = symbol
    } else if (symbol.startsWith('MYX-')) {
      tvSymbol = symbol.replace('MYX-', 'MYX:')
    } else if (symbol.startsWith('BURSA:')) {
      tvSymbol = symbol.replace('BURSA:', 'MYX:')
    } else {
      tvSymbol = `MYX:${symbol}`
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: tvSymbol,
      width: '100%',
      height: '100%',
      locale: 'en',
      dateRange: '12M',
      colorTheme: 'light',
      isTransparent: false,
      autosize: true,
      largeChartUrl: '',
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [symbol])

  return (
    <div
      className="tradingview-widget-container__widget"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  )
}

// Market overview widget
export function TradingViewMarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      width: '100%',
      height: '100%',
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(25, 118, 210, 1)',
      plotLineColorFalling: 'rgba(25, 118, 210, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0)',
      scaleFontColor: 'rgba(120, 123, 134, 1)',
      belowLineFillColorGrowing: 'rgba(33, 150, 243, 0.12)',
      belowLineFillColorFalling: 'rgba(33, 150, 243, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(33, 150, 243, 0)',
      belowLineFillColorFallingBottom: 'rgba(33, 150, 243, 0)',
      symbolActiveColor: 'rgba(33, 150, 243, 0.12)',
      tabs: [
        {
          title: 'Bursa Malaysia',
          symbols: [
            { s: 'MYX:MAYBANK', d: 'MAYBANK' },
            { s: 'MYX:CIMB', d: 'CIMB' },
            { s: 'MYX:PETRONAS', d: 'PETRONAS' },
            { s: 'MYX:TENAGA', d: 'TENAGA' },
            { s: 'MYX:PUBLIC', d: 'PUBLIC' },
            { s: 'MYX:GENTING', d: 'GENTING' },
            { s: 'MYX:SIME', d: 'SIME' },
            { s: 'MYX:IOI', d: 'IOI' },
            { s: 'MYX:KLK', d: 'KLK' },
            { s: 'MYX:MAXIS', d: 'MAXIS' },
          ],
          originalTitle: 'Bursa Malaysia',
        },
      ],
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div
      className="tradingview-widget-container__widget"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  )
}

// Declare TradingView types
declare global {
  interface Window {
    TradingView: any
  }
}

