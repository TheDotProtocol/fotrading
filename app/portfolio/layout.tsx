import { AuthGuard } from '@/components/AuthGuard'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}

