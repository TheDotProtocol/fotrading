import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getKYCData, updateKYCData } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const kycData = getKYCData(user.id);
  return NextResponse.json({ kycData: kycData || { userId: user.id, kycStatus: 'PENDING' } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { step, status } = body;

  // In demo mode, simulate KYC approval after all steps
  if (step === 'complete') {
    const kycData = updateKYCData(user.id, {
      kycStatus: 'APPROVED',
      riskCategory: 'Retail',
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({ kycData });
  }

  // Update KYC status based on step
  const kycData = updateKYCData(user.id, {
    kycStatus: status || 'PENDING',
  });

  return NextResponse.json({ kycData });
}

