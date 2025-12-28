/**
 * CTO Vineyard v2 - NextAuth Configuration
 */

import type { NextAuthOptions, Session, DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from './api';

// Extended types
interface ExtendedUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

export interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
  } & DefaultSession['user'];
  accessToken?: string;
  error?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const data = await api.login(credentials.email, credentials.password);
          
          return {
            id: data.user.id,
            email: data.user.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      // Initial sign in
      if (account && user) {
        const extendedUser = user as ExtendedUser;
        return {
          ...token,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          accessTokenExpires: Date.now() + extendedUser.expiresIn * 1000,
        };
      }

      // Return previous token if not expired
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token expired, try to refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub || '',
          email: session.user?.email || '',
        },
        accessToken: token.accessToken as string | undefined,
        error: token.error as string | undefined,
      };
    },
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
};

/**
 * Refresh the access token
 */
async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const refreshedTokens = await api.refreshToken(token.refreshToken as string);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

