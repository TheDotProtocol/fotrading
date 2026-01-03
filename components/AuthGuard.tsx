'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const { user: currentUser } = await res.json()
          if (currentUser) {
            setUser(currentUser)
          } else {
            router.push('/register')
          }
        } else {
          router.push('/register')
        }
      } catch (error) {
        router.push('/register')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, []) // Only run once on mount

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}

