import { AuthGuard } from '@/components/AuthGuard'

export default function StockLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}

