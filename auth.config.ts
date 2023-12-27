import { User } from '@auth/core/types';
import type { NextAuthConfig } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { Session } from 'next-auth/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string | undefined;
      name: string;
      email: string;
      image: string;
    } & Omit<User, 'id'>;
  }
}

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
    async session({ session, token }: { session: Session; token: any }) {
      session.user.id = token.sub; // Add the user ID to the session
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
