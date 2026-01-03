import { AuthGuard } from '@/components/AuthGuard'

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}

