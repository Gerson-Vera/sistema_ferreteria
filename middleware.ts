import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname  = nextUrl.pathname;
  const isLoggedIn = !!session?.user;

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  if (pathname === '/login' && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
