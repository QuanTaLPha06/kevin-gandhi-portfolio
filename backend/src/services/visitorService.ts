import Visitor from '@/models/Visitor';
import dbConnect from '@/lib/db';
import {
  getClientIP,
  getUserAgent,
  getReferrer,
  getCountry,
  getCity,
  anonymizeIP,
  isBot,
  isInternalIP
} from '@/lib/ip';
import { NextRequest } from 'next/server';

export async function trackVisitor(request: NextRequest, path: string, method: string = 'GET') {
  try {
    await dbConnect();

    const ip = getClientIP(request);
    const userAgent = getUserAgent(request);
    const referrer = getReferrer(request);
    const country = getCountry(request);
    const city = getCity(request);

    // Get region from headers (Vercel specific)
    const region = request.headers.get('x-vercel-ip-region') || undefined;

    // Skip tracking for common bots and internal requests
    if (isBot(userAgent) || isInternalIP(ip)) {
      console.log('Skipping bot/internal request:', { ip, userAgent });
      return;
    }

    // For GDPR compliance, anonymize IP before storing
    const anonymizedIP = anonymizeIP(ip);

    // Create visitor record
    const visitor = new Visitor({
      ip: anonymizedIP, // Store anonymized IP for privacy
      originalIP: ip, // Keep original for security purposes (if needed)
      userAgent,
      path,
      method,
      referrer,
      country,
      city,
      region,
    });

    await visitor.save();
    console.log('Visitor tracked:', { ip: anonymizedIP, path, country });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

export async function getVisitorStats() {
  try {
    await dbConnect();

    const totalVisitors = await Visitor.countDocuments();
    const uniqueIPs = await Visitor.distinct('ip').then(ips => ips.length);

    // Get visitors in last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visitorsLast24h = await Visitor.countDocuments({ timestamp: { $gte: last24h } });

    // Get visitors in last 7 days
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const visitorsLast7d = await Visitor.countDocuments({ timestamp: { $gte: last7d } });

    // Get visitors in last 30 days
    const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const visitorsLast30d = await Visitor.countDocuments({ timestamp: { $gte: last30d } });

    // Get top pages
    const topPages = await Visitor.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top IPs
    const topIPs = await Visitor.aggregate([
      { $group: { _id: '$ip', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent logs for overview
    const recentLogs = await Visitor.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('ip path method timestamp userAgent referrer')
      .lean();

    return {
      totalVisitors,
      uniqueIPs,
      visitorsLast24h,
      visitorsLast7d,
      visitorsLast30d,
      topPages,
      topIPs,
      recentLogs: recentLogs.map(log => ({
        ...log,
        _id: log._id.toString(),
        timestamp: log.timestamp.toISOString()
      })),
      totalLogs: totalVisitors
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return null;
  }
}

interface LogFilters {
  page: number;
  limit: number;
  search: string;
  ip: string;
  path: string;
}

export async function getVisitorLogs(filters: LogFilters) {
  try {
    await dbConnect();

    const { page, limit, search, ip, path } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (ip) {
      query.ip = { $regex: ip, $options: 'i' };
    }

    if (path) {
      query.path = { $regex: path, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { ip: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
        { userAgent: { $regex: search, $options: 'i' } },
        { referrer: { $regex: search, $options: 'i' } },
        { method: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Visitor.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get logs with pagination
    const logs = await Visitor.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('ip path method timestamp userAgent referrer country city')
      .lean();

    return {
      logs: logs.map(log => ({
        ...log,
        _id: log._id.toString(),
        timestamp: log.timestamp.toISOString()
      })),
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  } catch (error) {
    console.error('Error getting visitor logs:', error);
    return {
      logs: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      hasNext: false,
      hasPrev: false
    };
  }
}

export async function exportVisitorLogs() {
  try {
    await dbConnect();

    const logs = await Visitor.find()
      .sort({ timestamp: -1 })
      .select('ip path method timestamp userAgent referrer country city')
      .lean();

    // CSV headers
    const headers = ['Timestamp', 'IP Address', 'Path', 'Method', 'User Agent', 'Referrer', 'Country', 'City'];

    // CSV rows
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.ip,
      log.path,
      log.method,
      log.userAgent || '',
      log.referrer || '',
      log.country || '',
      log.city || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting visitor logs:', error);
    throw error;
  }
}