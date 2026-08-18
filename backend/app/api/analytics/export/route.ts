import { NextRequest } from 'next/server';
import { exportVisitorLogs } from '@/services/visitorService';
import { error as errorRes } from '@/lib/response';

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

    const csvData = await exportVisitorLogs();
    return new Response(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="visitor-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting visitor logs:', error);
    return errorRes('Internal server error', 500);
  }
}