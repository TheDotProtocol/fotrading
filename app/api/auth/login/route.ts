import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // In demo mode, accept any credentials
    let user = getUserByEmail(email);
    
    // If user doesn't exist, create them (demo mode)
    if (!user) {
      user = createUser(email, password, email.split('@')[0]);
    }

    const sessionId = createSession(user.id);

    const response = NextResponse.json({ user });
    
    // Set session cookie
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

