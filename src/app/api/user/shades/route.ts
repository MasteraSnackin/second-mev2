import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch user shades from SecondMe API
    const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/shades`, {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user shades: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the response in SecondMe API format
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user shades:', error);
    return NextResponse.json(
      { code: -1, message: 'Failed to fetch user shades' },
      { status: 500 }
    );
  }
}
