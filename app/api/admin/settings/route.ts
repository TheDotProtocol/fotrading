import { NextRequest, NextResponse } from 'next/server';
import { getSystemConfig, updateSystemConfig, addAuditLog } from '@/lib/adminDb';

export async function GET(request: NextRequest) {
  try {
    const config = getSystemConfig();
    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const adminId = request.cookies.get('adminSession')?.value || 'admin_1';
    
    const updated = updateSystemConfig(config);
    
    // Log audit
    addAuditLog({
      adminId,
      action: 'UPDATE_SYSTEM_CONFIG',
      targetType: 'SYSTEM',
      targetId: 'system',
      notes: 'System configuration updated',
    });

    return NextResponse.json({ config: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

