import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface SecondMeTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SecondMeUser {
  user_id: string;
  nickname?: string;
  avatar?: string;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SecondMeTokens> {
  const response = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.SECONDME_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Token exchange failed: ${data.message || 'Unknown error'}`);
  }

  return data.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SecondMeTokens> {
  const response = await fetch(process.env.SECONDME_REFRESH_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Token refresh failed: ${data.message || 'Unknown error'}`);
  }

  return data.data;
}

/**
 * Get user info from SecondMe API
 */
export async function getSecondMeUserInfo(accessToken: string): Promise<SecondMeUser> {
  const response = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`Failed to get user info: ${data.message || 'Unknown error'}`);
  }

  return {
    user_id: data.data.user_id,
    nickname: data.data.nickname,
    avatar: data.data.avatar,
  };
}

/**
 * Get or create user in database
 */
export async function upsertUser(tokens: SecondMeTokens, userInfo: SecondMeUser) {
  const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  const user = await prisma.user.upsert({
    where: { secondmeUserId: userInfo.user_id },
    create: {
      secondmeUserId: userInfo.user_id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
      nickname: userInfo.nickname,
      avatar: userInfo.avatar,
    },
  });

  return user;
}

/**
 * Get current user from session cookie
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Check if token is expired
  if (user.tokenExpiresAt < new Date()) {
    try {
      // Refresh token
      const newTokens = await refreshAccessToken(user.refreshToken);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        },
      });
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  return user;
}

/**
 * Generate OAuth state parameter
 */
export function generateOAuthState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
