import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { updateKYCData, getKYCData } from '@/lib/db';
import { addAuditLog } from '@/lib/adminDb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const users = Array.from(db.users.values());
    
    let filteredUsers = users;
    if (status !== 'all') {
      filteredUsers = users.filter(u => 
        u.kycStatus.toUpperCase() === status.toUpperCase()
      );
    }

    const kycUsers = filteredUsers.map(user => {
      const kycData = getKYCData(user.id);
      return {
        id: user.id,
        name: user.name || 'N/A',
        email: user.email,
        kycStatus: user.kycStatus,
        submittedAt: kycData?.submittedAt,
        rejectionReason: kycData?.rejectionReason,
        rejectedAt: kycData?.rejectedAt,
        reviewedBy: kycData?.reviewedBy,
      };
    });

    return NextResponse.json({ users: kycUsers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch KYC users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, rejectionReason } = await request.json();
    const adminId = request.cookies.get('adminSession')?.value || 'admin_1';
    
    // Get admin name
    let adminName = 'Admin';
    try {
      const { getAdminUser } = require('@/lib/adminDb');
      const admin = getAdminUser('admin'); // Default to admin user
      adminName = admin?.name || 'Admin';
    } catch (e) {
      // Fallback
    }

    const user = db.users.get(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let newStatus: 'APPROVED' | 'REJECTED' | 'PENDING' | 'RESUBMIT' = 'PENDING';
    if (action === 'approve') {
      newStatus = 'APPROVED';
    } else if (action === 'reject') {
      newStatus = 'REJECTED';
    } else if (action === 'resubmit') {
      newStatus = 'RESUBMIT';
    }

    updateKYCData(userId, {
      kycStatus: newStatus,
      approvedAt: action === 'approve' ? new Date().toISOString() : undefined,
      rejectedAt: action === 'reject' ? new Date().toISOString() : undefined,
      rejectionReason: action === 'reject' ? (rejectionReason || 'KYC verification failed') : undefined,
      reviewedBy: adminName,
    });

    user.kycStatus = newStatus;

    // Log audit
    addAuditLog({
      adminId,
      action: `KYC_${action.toUpperCase()}`,
      targetType: 'KYC',
      targetId: userId,
      notes: `KYC ${action} for user ${user.email}`,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}

