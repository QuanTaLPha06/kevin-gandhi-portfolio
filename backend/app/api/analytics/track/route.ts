import { NextRequest, NextResponse } from 'next/server';
import { trackVisitor } from '@/services/visitorService';
import { success, error as errorRes } from '@/lib/response';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      path,
      method,
      referrer,
      country,
      city,
      region
    } = body;

    // Extract IP and UA from actual request headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || '';

    // Create a mock request object for the trackVisitor function
    const mockRequest = {
      headers: {
        get: (key: string) => {
          switch (key.toLowerCase()) {
            case 'x-forwarded-for':
            case 'x-real-ip':
              return ip;
            case 'user-agent':
              return userAgent;
            case 'referer':
              return referrer;
            case 'x-vercel-ip-country':
              return country || request.headers.get('x-vercel-ip-country');
            case 'x-vercel-ip-city':
              return city || request.headers.get('x-vercel-ip-city');
            case 'x-vercel-ip-region':
              return region || request.headers.get('x-vercel-ip-region');
            default:
              return null;
          }
        }
      }
    } as any;

    // Track the visitor with enhanced data
    await trackVisitor(mockRequest, path, method);

    return NextResponse.json({ success: true, message: 'Visitor tracked successfully' }, { headers: corsHeaders });
  } catch (err) {
    console.error('Error tracking visitor:', err);
    return NextResponse.json({ success: false, error: 'Failed to track visitor' }, { status: 500, headers: corsHeaders });
  }
}