import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('user_id');

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  // Clear session cookie
  cookieStore.delete('user_id');

  // Redirect to home page
  return NextResponse.redirect(new URL('/', request.url));
}
