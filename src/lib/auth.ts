import NextAuth, { NextAuthOptions, Session, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

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
  expiresIn?: number;
  accessTokenExpires?: number;
  error?: string;
}

interface ExtendedSession extends Session {
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
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`https://cto-backend-production-28e3.up.railway.app/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return {
              id: data.user.id,
              email: data.user.email,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresIn: data.expires_in,
            };
          }
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      if (account && user) {
        const extendedUser = user as ExtendedUser;
        return {
          ...token,
          accessToken: extendedUser.accessToken,
          refreshToken: extendedUser.refreshToken,
          expiresIn: extendedUser.expiresIn,
          accessTokenExpires: Date.now() + extendedUser.expiresIn * 1000,
        };
      }

      if (token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedSession: ExtendedSession = {
        ...session,
        user: {
          ...session.user,
          id: token.sub || '',
          email: session.user?.email || '',
        },
        accessToken: token.accessToken as string | undefined,
        error: token.error as string | undefined,
      };
      return extendedSession;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
};

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    const response = await fetch(`https://cto-backend-production-28e3.up.railway.app/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    if (response.ok) {
      const refreshedTokens = await response.json();
      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      };
    }

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export default NextAuth(authOptions);
