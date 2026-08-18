import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';
import { trackVisitor } from './src/services/visitorService';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Track visitor for all requests (except static files)
  if (!url.pathname.startsWith('/_next/') &&
      !url.pathname.startsWith('/favicon.ico') &&
      !url.pathname.startsWith('/public/')) {
    // Track visitor asynchronously (don't await to avoid blocking response)
    trackVisitor(request, url.pathname, request.method);
  }

  // Only protect admin routes
  if (!url.pathname.startsWith('/admin')) return NextResponse.next();

  // Allow the login page to be accessed
  if (url.pathname === '/admin' || url.pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  const payload = verifyToken(token);
  if (!payload) {
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
