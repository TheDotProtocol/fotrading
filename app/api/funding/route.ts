import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTransactions, addTransaction, getPortfolio, updatePortfolio } from '@/lib/db';
import { Transaction } from '@/types';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = getTransactions(user.id);
  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, method } = body;

  if (!type || !amount || amount <= 0) {
    return NextResponse.json(
      { error: 'Invalid transaction details' },
      { status: 400 }
    );
  }

  // In demo mode, complete transactions immediately
  const transaction: Transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    type: type as 'DEPOSIT' | 'WITHDRAWAL',
    amount,
    currency: 'MYR',
    status: 'COMPLETED', // Completed immediately in demo mode
    method: method || (type === 'DEPOSIT' ? 'FPX' : 'BANK_TRANSFER'),
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  addTransaction(transaction);

  // Update portfolio cash balance
  const portfolio = getPortfolio(user.id);
  if (portfolio) {
    if (type === 'DEPOSIT') {
      portfolio.cashBalance += amount;
    } else {
      portfolio.cashBalance = Math.max(0, portfolio.cashBalance - amount);
    }
    updatePortfolio(portfolio);
  }

  return NextResponse.json({ transaction });
}

