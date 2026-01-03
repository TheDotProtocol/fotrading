import { AuthGuard } from '@/components/AuthGuard'

export default function FundingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthGuard>{children}</AuthGuard>
}

