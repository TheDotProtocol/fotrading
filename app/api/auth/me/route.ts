import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromSession, getUserById } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = getUserById(userId);
  return NextResponse.json({ user });
}

