import { cookies } from 'next/headers';
import { getUserIdFromSession, getUserById } from './db';
import { User } from '@/types';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) {
    return null;
  }

  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return null;
  }

  return getUserById(userId) || null;
}

