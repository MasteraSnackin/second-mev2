import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all chat sessions for current user
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      code: 0,
      data: { sessions },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// Get specific session with messages
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId } = await request.json();

    const session = await prisma.chatSession.findFirst({
      where: {
        sessionId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { code: -1, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: { session },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
