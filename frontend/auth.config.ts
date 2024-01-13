import { User } from '@auth/core/types';
import type { NextAuthConfig } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { Session } from 'next-auth/types';
import { Roles } from './types';
import * as jose from 'jose';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string | undefined;
      name: string;
      email: string;
      image: string;
      role: string;
      externalToken: string;
    } & Omit<User, 'id'>;
  }
}
// Function to create JWT
const createJwt = async (session: Session, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const jwt = await new jose.SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(encoder.encode(secret));

  return jwt;
};

const scopes = ['identify', 'guilds'];

const specificServerId = (process.env.ALLOWED_SERVERS || '').split(',');
export default {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: { params: { scope: scopes.join(' ') } },
    }),
  ],

  callbacks: {
    async signIn({ account }: { account: any }) {
      if (account.provider === 'discord') {
        try {
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          });
          const json = await res.json();

          const isMemberOfSpecificServer = json.some((guild: { id: string }) =>
            specificServerId.includes(guild.id)
          );
          return isMemberOfSpecificServer;
        } catch (error) {
          // Handle error (e.g., log it)
          return false;
        }
      }
      return true;
    },
    async jwt(params) {
      if (params?.account?.providerAccountId) {
        params.token.providerAccountId = params.account?.providerAccountId;
      }
      return params.token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      const adminsUser = (process.env.ADMINS_USERS || '').split(',');

      session.user.id = token.sub; // Add the user ID to the session
      session.user.role = adminsUser.includes(token.providerAccountId)
        ? Roles.admin
        : Roles.user;
      const jwtExternalToken = await createJwt(
        session,
        process.env.JWT_SECRET || ''
      );
      session.user.externalToken = jwtExternalToken;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const unprotectedPaths = ['/login'];

      const isProtected = !unprotectedPaths.some(path =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL('api/auth/signin', nextUrl.origin);
        redirectUrl.searchParams.append('callbackUrl', nextUrl.href);
        return Response.redirect(redirectUrl);
      }

      return true;
    },
  },

  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
