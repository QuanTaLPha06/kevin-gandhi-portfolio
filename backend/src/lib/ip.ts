import { NextRequest } from 'next/server';

export function getClientIP(request: NextRequest): string {
  // Priority order based on reliability and Vercel documentation
  // 1. x-forwarded-for (most common, but can be spoofed)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client), ignore proxies
    const ip = forwardedFor.split(',')[0].trim();
    if (isValidIP(ip)) return ip;
  }

  // 2. x-real-ip (more reliable than forwarded-for)
  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  // 3. cf-connecting-ip (Cloudflare)
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP && isValidIP(cfConnectingIP)) {
    return cfConnectingIP;
  }

  // 4. x-vercel-forwarded-for (Vercel specific)
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwarded && isValidIP(vercelForwarded)) {
    return vercelForwarded;
  }

  // 5. x-forwarded-proto + remote-addr (fallback)
  const remoteAddress = request.headers.get('remote-addr');
  if (remoteAddress && isValidIP(remoteAddress)) {
    return remoteAddress;
  }

  return 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || '';
}

export function getReferrer(request: NextRequest): string {
  return request.headers.get('referer') || '';
}

export function getCountry(request: NextRequest): string | null {
  // Vercel provides geo headers
  return request.headers.get('x-vercel-ip-country') ||
         request.headers.get('cf-ipcountry') ||
         null;
}

export function getCity(request: NextRequest): string | null {
  // Vercel provides city info
  return request.headers.get('x-vercel-ip-city') || null;
}

// GDPR-compliant IP anonymization (masks last octet)
export function anonymizeIP(ip: string): string {
  if (!ip || ip === 'unknown') return ip;

  // IPv4: mask last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  // IPv6: mask last 16 bits (simplified)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts.slice(0, -2).join(':')}:0000:0000`;
    }
  }

  return ip;
}

// Validate IP address format
function isValidIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return false;

  // Basic IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Basic IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Regex.test(ip);
}

// Check if IP is from a known bot or crawler
export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;

  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /slackbot/i,
    /discordbot/i,
    /whatsapp/i,
    /telegrambot/i,
    /applebot/i,
    /sogou/i,
    /exabot/i,
    /mj12bot/i,
    /dotbot/i,
    /ahrefsbot/i,
    /semrushbot/i,
    /rogerbot/i,
    /archive\.org/i,
    /ia_archiver/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
    /axios/i,
    /postman/i,
    /insomnia/i,
    /newman/i,
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}

// Check if IP is from internal/private network
export function isInternalIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return false;

  // Private IPv4 ranges
  const privateRanges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
  ];

  return privateRanges.some(range => range.test(ip));
}