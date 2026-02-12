import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCompatibilityScore, callActAPI } from '@/lib/act';

/**
 * Act API - Structured action judgment
 * Supports compatibility scoring and custom action controls
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, ...params } = body;

    if (type === 'compatibility') {
      // Compatibility scoring
      const { user1Shades, user2Shades, user1Bio, user2Bio } = params;

      if (!user1Shades || !user2Shades) {
        return NextResponse.json(
          { code: -1, message: 'Missing required parameters: user1Shades, user2Shades' },
          { status: 400 }
        );
      }

      const result = await getCompatibilityScore(
        user.accessToken,
        user1Shades,
        user2Shades,
        user1Bio,
        user2Bio
      );

      return NextResponse.json({
        code: 0,
        data: result,
      });
    } else if (type === 'custom') {
      // Custom action control
      const { prompt, actionControl } = params;

      if (!prompt || !actionControl) {
        return NextResponse.json(
          { code: -1, message: 'Missing required parameters: prompt, actionControl' },
          { status: 400 }
        );
      }

      const result = await callActAPI(user.accessToken, prompt, actionControl);

      return NextResponse.json({
        code: 0,
        data: result,
      });
    } else {
      return NextResponse.json(
        { code: -1, message: 'Invalid type. Must be "compatibility" or "custom"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Act API error:', error);
    return NextResponse.json(
      { code: -1, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
