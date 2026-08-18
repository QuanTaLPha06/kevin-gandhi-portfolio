"use client";

import { useEffect, useState } from 'react';

interface VisitorLog {
  _id: string;
  ip: string;
  userAgent?: string;
  path: string;
  method: string;
  timestamp: string;
  referrer?: string;
  country?: string;
  city?: string;
}

interface AnalyticsData {
  totalVisitors: number;
  uniqueIPs: number;
  visitorsLast24h: number;
  visitorsLast7d: number;
  visitorsLast30d: number;
  topPages: Array<{ _id: string; count: number }>;
  topIPs: Array<{ _id: string; count: number }>;
  recentLogs: VisitorLog[];
  totalLogs: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIP, setFilterIP] = useState('');
  const [filterPath, setFilterPath] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<VisitorLog | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'details'>('overview');

  const logsPerPage = 50;

  useEffect(() => {
    fetchAnalytics();
    fetchLogs();
  }, [currentPage, searchTerm, filterIP, filterPath]);

  async function fetchAnalytics() {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }

  async function fetchLogs() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: logsPerPage.toString(),
        search: searchTerm,
        ip: filterIP,
        path: filterPath,
      });

      const res = await fetch(`/api/analytics/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setLogs(result.data.logs);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
    setLoading(false);
  }

  async function exportLogs() {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const res = await fetch('/api/analytics/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitor-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    return 'Other';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto" style={{ cursor: 'auto' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics Dashboard</h1>
        <button
          onClick={exportLogs}
          className="btn btn-primary text-sm px-3 py-2"
          disabled={loading}
        >
          {loading ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg" style={{ backgroundColor: "var(--page-bg)" }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'logs', label: 'Visitor Logs' },
          { id: 'details', label: 'Details' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={activeTab === tab.id ? { backgroundColor: "var(--accent)" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="muted text-sm">Total Visitors</p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data?.totalVisitors?.toLocaleString() || 0}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="muted text-sm">Unique IPs</p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data?.uniqueIPs?.toLocaleString() || 0}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--link-blue)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="muted text-sm">Last 24 Hours</p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data?.visitorsLast24h?.toLocaleString() || 0}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--accent-strong)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="muted text-sm">Last 7 Days</p>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{data?.visitorsLast7d?.toLocaleString() || 0}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--btn-danger)" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages and IPs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card p-4 sm:p-6">
              <h3 className="h2 mb-4" style={{ color: "var(--text-primary)" }}>Top Pages</h3>
              <div className="space-y-3">
                {data?.topPages?.slice(0, 10).map((page, index) => (
                  <div key={page._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="muted text-sm w-6">#{index + 1}</span>
                      <span style={{ color: "var(--text-primary)" }} className="text-sm truncate flex-1">{page._id}</span>
                    </div>
                    <span className="muted text-sm font-mono">{page.count}</span>
                  </div>
                )) || <p className="muted">No data available</p>}
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h3 className="h2 mb-4" style={{ color: "var(--text-primary)" }}>Top IPs</h3>
              <div className="space-y-3">
                {data?.topIPs?.slice(0, 10).map((ip, index) => (
                  <div key={ip._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="muted text-sm w-6">#{index + 1}</span>
                      <span style={{ color: "var(--text-primary)" }} className="text-sm font-mono flex-1">{ip._id}</span>
                    </div>
                    <span className="muted text-sm">{ip.count}</span>
                  </div>
                )) || <p className="muted">No data available</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="card p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full p-2 border rounded text-sm"
                  style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Filter by IP</label>
                <input
                  type="text"
                  value={filterIP}
                  onChange={(e) => setFilterIP(e.target.value)}
                  placeholder="e.g., 192.168.1.1"
                  className="w-full p-2 border rounded text-sm"
                  style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Filter by Path</label>
                <input
                  type="text"
                  value={filterPath}
                  onChange={(e) => setFilterPath(e.target.value)}
                  placeholder="e.g., /projects"
                  className="w-full p-2 border rounded text-sm"
                  style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border)" }}
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="card overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4">
              {loading ? (
                <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>Loading logs...</p>
              ) : logs.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>No logs found</p>
              ) : (
                logs.map((log) => (
                  <div key={log._id} className="border rounded-lg p-4" style={{ borderColor: "var(--border)" }}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Time:</span>
                        <span className="text-sm" style={{ color: "var(--text-primary)" }}>{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>IP:</span>
                        <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>{log.ip}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Path:</span>
                        <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{log.path}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Method:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                          log.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {log.method}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Device:</span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{getDeviceInfo(log.userAgent || '')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Browser:</span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{getBrowserInfo(log.userAgent || '')}</span>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-sm hover:underline w-full text-left"
                          style={{ color: "var(--link-blue)" }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "var(--card-bg)" }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Path</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Device</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Browser</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                        Loading logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                        No logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-opacity-50" style={{ backgroundColor: "var(--card-bg)" }}>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                          {log.ip}
                        </td>
                        <td className="px-4 py-3 text-sm truncate max-w-xs" style={{ color: "var(--text-primary)" }}>
                          {log.path}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                            log.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                          {getDeviceInfo(log.userAgent || '')}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                          {getBrowserInfo(log.userAgent || '')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-sm hover:underline"
                            style={{ color: "var(--link-blue)" }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="text-sm px-3 py-2" style={{ color: "var(--text-primary)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && selectedLog && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="h2" style={{ color: "var(--text-primary)" }}>Visitor Details</h3>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-sm hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>IP Address</label>
                <p className="font-mono" style={{ color: "var(--text-primary)" }}>{selectedLog.ip}</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Timestamp</label>
                <p style={{ color: "var(--text-primary)" }}>{formatDate(selectedLog.timestamp)}</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Path</label>
                <p style={{ color: "var(--text-primary)" }}>{selectedLog.path}</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Method</label>
                <p style={{ color: "var(--text-primary)" }}>{selectedLog.method}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Device Type</label>
                <p style={{ color: "var(--text-primary)" }}>{getDeviceInfo(selectedLog.userAgent || '')}</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Browser</label>
                <p style={{ color: "var(--text-primary)" }}>{getBrowserInfo(selectedLog.userAgent || '')}</p>
              </div>
              {selectedLog.referrer && (
                <div>
                  <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>Referrer</label>
                  <p className="break-all" style={{ color: "var(--text-primary)" }}>{selectedLog.referrer}</p>
                </div>
              )}
              <div>
                <label className="block text-sm mb-1" style={{ color: "var(--text-primary)" }}>User Agent</label>
                <p className="text-sm break-all font-mono p-2 rounded border" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                  {selectedLog.userAgent || 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && !selectedLog && (
        <div className="card p-8 text-center">
          <p style={{ color: "var(--text-secondary)" }}>Select a log entry from the Visitor Logs tab to view details</p>
        </div>
      )}
    </div>
  );
}