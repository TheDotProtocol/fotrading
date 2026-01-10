import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Xentro</h3>
            <p className="text-sm">
              A modern platform for Malaysian investors trading stocks, futures, forex, ETFs, bonds, and cryptocurrencies.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-white">
                  Risk Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:support@xentro.demo" className="hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Important</h4>
            <p className="text-sm text-yellow-400">
              ⚠️ This is a DEMO platform only. No real trades are executed.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Xentro Demo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

