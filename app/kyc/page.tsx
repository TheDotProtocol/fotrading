'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { CheckCircle, XCircle, Upload, Camera, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type KYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMIT'

export default function KYCPage() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [step, setStep] = useState(1)
  const [kycStatus, setKycStatus] = useState<KYCStatus>('PENDING')
  const [uploaded, setUploaded] = useState({
    nric: false,
    selfie: false,
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/register')
      return
    }

    // Load KYC status
    fetch('/api/kyc')
      .then(res => res.json())
      .then(data => {
        if (data.kycData) {
          setKycStatus(data.kycData.kycStatus)
          if (data.kycData.kycStatus === 'APPROVED') {
            setStep(4)
          } else if (data.kycData.kycStatus === 'REJECTED') {
            setStep(5)
          }
        }
      })
  }, [user, router])

  const handleUpload = (type: 'nric' | 'selfie') => {
    // Simulate upload
    setTimeout(() => {
      setUploaded({ ...uploaded, [type]: true })
    }, 1000)
  }

  const handleComplete = async () => {
    const response = await fetch('/api/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'complete' }),
    })

    if (response.ok) {
      const { kycData } = await response.json()
      
      // Show success message first
      setShowSuccessMessage(true)
      
      // After 3 seconds, update status and proceed
      setTimeout(() => {
        setKycStatus('APPROVED')
        if (user) {
          setUser({ ...user, kycStatus: 'APPROVED', riskCategory: 'Retail' })
        }
        setStep(4)
        setShowSuccessMessage(false)
      }, 3000)
    }
  }

  if (kycStatus === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Approved!</h1>
            <p className="text-gray-600 mb-6">
              Your identity verification has been completed successfully.
            </p>
            <Link
              href="/funding"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue to Funding
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Rejected</h1>
            <p className="text-gray-600 mb-6">
              Your identity verification was not approved. Please resubmit your documents.
            </p>
            <button
              onClick={() => {
                setKycStatus('PENDING')
                setStep(1)
                setUploaded({ nric: false, selfie: false })
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Resubmit Documents
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Identity Verification (e-KYC)</h1>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                <p className="text-xs text-center mt-2">
                  {s === 1 ? 'Upload NRIC' : s === 2 ? 'Selfie' : 'Review'}
                </p>
              </div>
            ))}
          </div>

          {/* Step 1: Upload NRIC */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload NRIC (Front & Back)</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
                <span className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> No real documents are stored. Click upload to simulate.
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div
                  onClick={() => handleUpload('nric')}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    uploaded.nric
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-2 ${uploaded.nric ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium">
                    {uploaded.nric ? 'NRIC Uploaded ✓' : 'Click to Upload NRIC Front'}
                  </p>
                </div>
                <div
                  onClick={() => handleUpload('nric')}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    uploaded.nric
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-2 ${uploaded.nric ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium">
                    {uploaded.nric ? 'NRIC Uploaded ✓' : 'Click to Upload NRIC Back'}
                  </p>
                </div>
              </div>
              {uploaded.nric && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Selfie
                </button>
              )}
            </div>
          )}

          {/* Step 2: Selfie */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Take a Selfie</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
                <span className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> No real photos are captured or stored.
                </span>
              </div>
              <div
                onClick={() => handleUpload('selfie')}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  uploaded.selfie
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-primary-500'
                }`}
              >
                <Camera className={`w-16 h-16 mx-auto mb-4 ${uploaded.selfie ? 'text-green-500' : 'text-gray-400'}`} />
                <p className="text-lg font-medium mb-2">
                  {uploaded.selfie ? 'Selfie Captured ✓' : 'Click to Capture Selfie'}
                </p>
                <p className="text-sm text-gray-500">
                  Make sure your face is clearly visible
                </p>
              </div>
              {uploaded.selfie && (
                <button
                  onClick={() => setStep(3)}
                  className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue to Review
                </button>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium">NRIC Documents</p>
                    <p className="text-sm text-gray-500">Uploaded ✓</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium">Selfie</p>
                    <p className="text-sm text-gray-500">Captured ✓</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Auto-Scan Simulation:</strong> In a real system, your documents would be automatically
                  scanned and verified. For this demo, we'll simulate an instant approval.
                </p>
              </div>
              {!showSuccessMessage ? (
                <button
                  onClick={handleComplete}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit for Verification
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">Submission Successful!</h3>
                  <p className="text-green-800 mb-1">
                    Your KYC verification has been submitted successfully.
                  </p>
                  <p className="text-green-800 font-medium">
                    Your verification result will be mailed to your email within 24 hours.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Important:</strong> This is a DEMO platform. No real identity documents are stored.
            All KYC data is simulated for demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}

