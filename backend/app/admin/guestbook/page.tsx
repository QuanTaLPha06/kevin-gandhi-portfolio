"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type GuestBookEntry = {
    _id: string;
    message: string;
    userName: string;
    userEmail: string;
    userImage?: string;
    provider: string;
    active: boolean;
    createdAt: string;
};

export default function AdminGuestBookPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<GuestBookEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const me = await fetch('/api/auth/me', { credentials: 'include' });
                if (!me.ok) throw new Error();
                fetchEntries();
            } catch {
                router.push('/admin/login');
            }
        })();
    }, [router]);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/guestbook', { credentials: 'include' });
            const json = await res.json();
            if (json.success) {
                setEntries(json.data.items || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        // Optimistic
        setEntries(prev => prev.map(e => e._id === id ? { ...e, active: newStatus } : e));

        try {
            const res = await fetch(`/api/guestbook/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ active: newStatus }),
            });
            const data = await res.json();
            if (!data.success) {
                // Revert
                setEntries(prev => prev.map(e => e._id === id ? { ...e, active: currentStatus } : e));
                alert('Failed to update status');
            }
        } catch (e) {
            setEntries(prev => prev.map(e => e._id === id ? { ...e, active: currentStatus } : e));
            alert('Error updating status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this specific entry?')) return;

        // Optimistic
        const prev = [...entries];
        setEntries(curr => curr.filter(e => e._id !== id));

        try {
            const res = await fetch(`/api/guestbook/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!data.success) {
                setEntries(prev);
                alert('Failed to delete');
            }
        } catch (e) {
            setEntries(prev);
            alert('Error deleting');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Guestbook</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and approve guestbook entries</p>
                </div>
                <button onClick={fetchEntries} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">Refresh</button>
            </div>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {loading && entries.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Loading entries...</div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No guestbook entries found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 font-medium">User</th>
                                    <th className="text-left px-6 py-4 font-medium w-1/3">Message</th>
                                    <th className="text-left px-6 py-4 font-medium">Provider</th>
                                    <th className="text-left px-6 py-4 font-medium">Date</th>
                                    <th className="text-left px-6 py-4 font-medium">Status</th>
                                    <th className="text-left px-6 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(entry => (
                                    <tr key={entry._id} className={`border-b hover:bg-gray-50 ${!entry.active ? 'bg-yellow-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {entry.userImage ? (
                                                    <img src={entry.userImage} alt="" className="w-8 h-8 rounded-full" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold">{entry.userName[0]}</div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{entry.userName}</div>
                                                    <div className="text-xs text-gray-500">{entry.userEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="line-clamp-2 max-w-md">{entry.message}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 capitalize">{entry.provider}</td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {entry.active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleActive(entry._id, entry.active)}
                                                    className={`text-xs px-3 py-1 rounded font-medium transition ${entry.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                >
                                                    {entry.active ? 'Reject' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry._id)}
                                                    className="text-xs px-3 py-1 rounded font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
