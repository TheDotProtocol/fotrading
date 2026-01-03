import Link from 'next/link'
import { ArrowRight, Shield, TrendingUp, Smartphone, Zap, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Trade Bursa Malaysia Stocks
            <br />
            <span className="text-gold-400">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            A modern, user-friendly platform for Malaysian investors. 
            <br />
            Demo version for testing and demonstration purposes only.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              Open Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/market"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white/30 transition-colors"
            >
              View Market
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-primary-50">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2">Mobile-First</h3>
              <p className="text-gray-600">
                Trade on the go with our responsive design. Works seamlessly on all devices.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary-50">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2">Fast Execution</h3>
              <p className="text-gray-600">
                Lightning-fast order execution with transparent fee structure.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-primary-50">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
              <p className="text-gray-600">
                Live market data and portfolio tracking with AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Shield className="w-16 h-16 text-primary-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Security & Compliance</h2>
              <p className="text-gray-600 mb-4">
                Your security is our priority. We follow industry best practices for data protection
                and comply with Malaysian financial regulations.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Secure authentication
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Encrypted data transmission
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Regulatory compliance
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <TrendingUp className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Malaysian-First</h3>
                <p className="text-gray-600">
                  Built specifically for Malaysian investors trading on Bursa Malaysia.
                  We understand local market dynamics and investor needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-12 px-4 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ⚠️ Important Disclaimer
            </h3>
            <p className="text-yellow-800 text-sm">
              <strong>This is a DEMO platform only.</strong> No real trades are executed. 
              No real money is involved. This platform is for testing and demonstration purposes only. 
              Trading involves risk. Past performance is not indicative of future results. 
              Please consult with a licensed financial advisor before making any investment decisions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

