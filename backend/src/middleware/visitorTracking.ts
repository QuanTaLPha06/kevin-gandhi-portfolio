import { NextRequest, NextResponse } from 'next/server';
import { trackVisitor } from '@/services/visitorService';

export async function visitorTrackingMiddleware(request: NextRequest) {
  // Track visitor asynchronously (don't await to avoid blocking response)
  trackVisitor(request, request.nextUrl.pathname, request.method);

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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};