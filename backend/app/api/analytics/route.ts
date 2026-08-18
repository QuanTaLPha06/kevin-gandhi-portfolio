import { NextRequest } from 'next/server';
import { getVisitorStats, getVisitorLogs, exportVisitorLogs } from '@/services/visitorService';
import { success, error as errorRes } from '@/lib/response';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin access
    const { verifyToken } = await import('@/lib/auth');
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorRes('Unauthorized', 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return errorRes('Unauthorized', 401);
    }

    const url = new URL(request.url);
    const endpoint = url.pathname.split('/').pop();

    if (endpoint === 'logs') {
      // Handle logs endpoint with pagination and filters
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      const ip = url.searchParams.get('ip') || '';
      const path = url.searchParams.get('path') || '';

      const result = await getVisitorLogs({ page, limit, search, ip, path });
      return success('Visitor logs retrieved successfully', result);
    }

    if (endpoint === 'export') {
      // Handle export endpoint
      const csvData = await exportVisitorLogs();
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="visitor-logs.csv"'
        }
      });
    }

    // Default analytics overview
    const stats = await getVisitorStats();

    if (!stats) {
      return errorRes('Failed to fetch analytics data', 500);
    }

    return success('Analytics data retrieved successfully', stats);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errorRes('Internal server error', 500);
  }
}