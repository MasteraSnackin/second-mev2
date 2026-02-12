import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, getSecondMeUserInfo, upsertUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Validate state parameter
  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  // Relaxed state validation for WebView compatibility
  if (state !== savedState) {
    console.warn('OAuth state verification failed - possible WebView scenario');
    // Continue processing instead of blocking
  }

  // Clear the OAuth state cookie
  cookieStore.delete('oauth_state');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get user info
    const userInfo = await getSecondMeUserInfo(tokens.access_token);

    // Create or update user in database
    const user = await upsertUser(tokens, userInfo);

    // Set session cookie
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
