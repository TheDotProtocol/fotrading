import { NextRequest, NextResponse } from 'next/server';
import { getSupportTickets, createSupportTicket } from '@/lib/adminDb';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';

    let tickets = getSupportTickets();
    const users = Array.from(db.users.values());

    // If no tickets exist, create some mock ones
    if (tickets.length === 0) {
      const mockUsers = Array.from(db.users.values()).slice(0, 5);
      mockUsers.forEach((user, index) => {
        createSupportTicket({
          userId: user.id,
          category: ['LOGIN', 'DEPOSIT', 'WITHDRAW', 'KYC', 'TRADE_DISPUTE'][index % 5] as any,
          subject: `Support Request ${index + 1}`,
          messages: [
            {
              id: `msg_${index}_1`,
              from: 'USER',
              message: `I need help with ${['LOGIN', 'DEPOSIT', 'WITHDRAW', 'KYC', 'TRADE_DISPUTE'][index % 5]}.`,
              timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        });
      });
      tickets = getSupportTickets();
    }

    // Filter by status
    if (status !== 'all') {
      tickets = tickets.filter(t => t.status.toUpperCase() === status.toUpperCase());
    }

    // Enrich with user names
    const enrichedTickets = tickets.map(ticket => {
      const user = users.find(u => u.id === ticket.userId);
      return {
        ...ticket,
        userName: user?.name || 'Unknown User',
      };
    });

    return NextResponse.json({ tickets: enrichedTickets });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticket = createSupportTicket(body);
    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

