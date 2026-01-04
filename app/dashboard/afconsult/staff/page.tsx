'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getConsultants } from '@/lib/staff'; // You'll need to create this
import type { Consultant } from '@/types/staff'; // You'll need to create this
import { formatCurrency } from '@/lib/finance';

export default function StaffPage() {
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getConsultants('afconsult');
            setConsultants(data);
        } catch (error) {
            console.error('Failed to load staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConsultants = consultants.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.expertise.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Consulting Staff</h1>
                <Link href="/dashboard/afconsult/staff/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        Add Consultant
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search consultants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-afconsult focus:border-transparent outline-none font-sans"
                />
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Role / Expertise</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Rate/Hour</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Joined</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-sans">
                                    Loading staff directory...
                                </td>
                            </tr>
                        ) : filteredConsultants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-sans">
                                    No consultants found. Add one to get started.
                                </td>
                            </tr>
                        ) : (
                            filteredConsultants.map((consultant) => (
                                <tr
                                    key={consultant.id}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                    onClick={() => window.location.href = `/dashboard/afconsult/staff/${consultant.id}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white font-sans">{consultant.name}</div>
                                        {consultant.email && (
                                            <div className="text-xs text-gray-500">{consultant.email}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        {consultant.expertise}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-900 dark:text-white font-mono">
                                        {formatCurrency(consultant.rate)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-500 font-sans">
                                        {new Date(consultant.joinedDate).toLocaleDateString('en-GB', {
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${consultant.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {consultant.status === 'active' ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
