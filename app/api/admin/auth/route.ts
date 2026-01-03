import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, verifyAdminPassword, addAuditLog } from '@/lib/adminDb';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(username, password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const admin = getAdminUser(username);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Log admin login
    addAuditLog({
      adminId: admin.id,
      action: 'ADMIN_LOGIN',
      targetType: 'SYSTEM',
      targetId: 'system',
      notes: `Admin ${admin.name} logged in`,
    });

    const response = NextResponse.json({ 
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        name: admin.name,
      }
    });

    // Set admin session cookie
    response.cookies.set('adminSession', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('adminSession')?.value;
  
  if (!sessionId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // In a real app, verify session from database
  // For demo, just check if session exists
  return NextResponse.json({ authenticated: true });
}

