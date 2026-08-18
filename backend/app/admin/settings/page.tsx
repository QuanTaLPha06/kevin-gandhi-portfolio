"use client";

import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalVisitors: number;
  uniqueIPs: number;
  visitorsLast24h: number;
  topPages: Array<{ _id: string; count: number }>;
}

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (mounted) setEmail(data.email || '');
      }
    })();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const res = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
    setAnalyticsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (password && password !== confirm) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password: password || undefined }),
    });

    if (res.ok) {
      setMessage('Settings updated');
      setPassword('');
      setConfirm('');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Update failed');
    }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>

      {/* Analytics Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Website Analytics</h3>
        {analyticsLoading ? (
          <div className="text-neutral-300">Loading analytics...</div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-800 p-4 rounded border border-neutral-700">
              <div className="text-2xl font-bold text-white">{analytics.totalVisitors.toLocaleString()}</div>
              <div className="text-sm text-neutral-300">Total Visitors</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded border border-neutral-700">
              <div className="text-2xl font-bold text-white">{analytics.uniqueIPs.toLocaleString()}</div>
              <div className="text-sm text-neutral-300">Unique IPs</div>
            </div>
            <div className="bg-neutral-800 p-4 rounded border border-neutral-700">
              <div className="text-2xl font-bold text-white">{analytics.visitorsLast24h.toLocaleString()}</div>
              <div className="text-sm text-neutral-300">Visitors (Last 24h)</div>
            </div>
          </div>
        ) : (
          <div className="text-neutral-300 mb-4">Failed to load analytics data</div>
        )}

        {analytics?.topPages && analytics.topPages.length > 0 && (
          <div className="bg-neutral-800 p-4 rounded border border-neutral-700">
            <h4 className="text-white font-semibold mb-2">Top Pages</h4>
            <div className="space-y-2">
              {analytics.topPages.map((page, index) => (
                <div key={page._id} className="flex justify-between text-sm">
                  <span className="text-neutral-300">{page._id}</span>
                  <span className="text-white font-mono">{page.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="max-w-md">
        {message && <div className="mb-4 text-sm text-yellow-300">{message}</div>}
        <label className="block mb-2 text-sm text-neutral-300">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 bg-neutral-800 border border-neutral-700 rounded text-white"
          required
        />

        <label className="block mb-2 text-sm text-neutral-300">New Password (optional)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 bg-neutral-800 border border-neutral-700 rounded text-white"
        />

        <label className="block mb-2 text-sm text-neutral-300">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-2 mb-4 bg-neutral-800 border border-neutral-700 rounded text-white"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
