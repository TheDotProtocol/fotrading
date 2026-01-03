import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('session');
  
  return response;
}

