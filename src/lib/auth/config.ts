import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isDashboard) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id       = user.id as string;
        token.username = (user as any).username;
        token.nombre   = (user as any).nombre;
        token.roles    = (user as any).roles;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id       = token.id as string;
      session.user.username = token.username as string;
      session.user.nombre   = token.nombre as string;
      session.user.roles    = token.roles as string[];
      return session;
    },
  },
  providers: [],
};
