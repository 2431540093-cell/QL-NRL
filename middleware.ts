import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = {
    '/student': ['STUDENT'],
    '/manager': ['EVENT_MANAGER'],
    '/admin': ['ADMIN', 'SUPER_ADMIN'],
    '/superadmin': ['SUPER_ADMIN'],
  };

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const token = request.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (!roles.includes(decoded.role)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};