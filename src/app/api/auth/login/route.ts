import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateOAuthState } from '@/lib/auth';

export async function GET() {
  // Generate OAuth state for CSRF protection
  const state = generateOAuthState();

  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  // Build OAuth authorization URL
  const authUrl = new URL(process.env.SECONDME_OAUTH_URL!);
  authUrl.searchParams.set('client_id', process.env.SECONDME_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', process.env.SECONDME_REDIRECT_URI!);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', 'user.info user.info.shades chat');

  return NextResponse.redirect(authUrl.toString());
}
