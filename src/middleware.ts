import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const agentToken = request.cookies.get('agentToken')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/api/agents/login', '/agent-login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Patient-facing booking page linked from the public landing page. It must be
  // reachable without a session (logged-in admins keep access too).
  if (pathname === '/bookings/new') {
    return NextResponse.next();
  }

  const adminRoutes = [
    '/dashboard',
    '/patients',
    '/doctors',
    '/agents',
    '/packages',
    '/appointments',
    '/tests',
    '/reports',
    '/doctor-booking',
    '/tasks',
    '/payments',
    '/audit',
    '/bookings',
    '/agents/ratings',
  ];
  const isAdminRoute = adminRoutes.includes(pathname) || pathname.startsWith('/dashboard/');

  const agentRoutes = ['/agent-dashboard'];
  const isAgentRoute = agentRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));

  const adminOnlyRoutes = ['/permissions'];
  const isAdminOnlyRoute = adminOnlyRoutes.includes(pathname) || pathname.startsWith('/permissions/');

  if (pathname.startsWith('/api/')) {
    if (
      pathname === '/api/auth/login' ||
      pathname === '/api/auth/verify-otp' ||
      pathname === '/api/agents/login'
    ) {
      return NextResponse.next();
    }

    // No-auth public endpoints used by the landing page / public agents page:
    //   /api/public-agents            -> public agent directory
    //   /api/public/...               -> public booking requests
    if (pathname === '/api/public-agents' || pathname.startsWith('/api/public/')) {
      return NextResponse.next();
    }

    if (!token && !agentToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (isAgentRoute) {
    if (!agentToken) {
      return NextResponse.redirect(new URL('/agent-login', request.url));
    }
    return NextResponse.next();
  }

  if (isAdminOnlyRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!token && !agentToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute && pathname !== '/agent-login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/patients/:path*',
    '/doctors/:path*',
    '/agents/:path*',
    '/appointments/:path*',
    '/tests/:path*',
    '/reports/:path*',
    '/permissions/:path*',
    '/doctor-booking/:path*',
    '/agent-dashboard/:path*',
    '/tasks/:path*',
    '/payments/:path*',
    '/audit/:path*',
    '/bookings/:path*',
    '/agents/ratings/:path*',
    '/login',
    '/agent-login',
  ],
};
