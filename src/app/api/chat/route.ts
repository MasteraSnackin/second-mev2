import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { sessionId },
      });
    }

    if (!session) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          sessionId: newSessionId,
          title: message.substring(0, 50),
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    });

    // Call SecondMe chat API with streaming
    const chatResponse = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/v2/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        sessionId: session.sessionId,
        stream: true,
      }),
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API failed: ${chatResponse.statusText}`);
    }

    // Create a TransformStream to collect the full response
    let fullResponse = '';
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        fullResponse += text;
        controller.enqueue(chunk);
      },
      async flush() {
        // Save assistant message after stream completes
        try {
          await prisma.chatMessage.create({
            data: {
              sessionId: session!.id,
              role: 'assistant',
              content: fullResponse,
            },
          });

          // Update session with last message
          await prisma.chatSession.update({
            where: { id: session!.id },
            data: {
              lastMessage: fullResponse.substring(0, 100),
            },
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      },
    });

    // Pipe the response through our transform stream
    const stream = chatResponse.body!.pipeThrough(transformStream);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': session.sessionId,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
