'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { getConsultants } from '@/lib/staff';
import type { Consultant } from '@/types/staff';
import { StandardImage } from '@/components/ui/StandardImage';

export default function ImedaStaffPage() {
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getConsultants('imeda');
            setStaff(data);
        } catch (error) {
            console.error('Failed to load IMEDA staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.expertise?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-imeda" />
                        IMEDA Staff
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage campus directors, seminar coordinators, and instructors.
                    </p>
                </div>
                <Link href="/dashboard/imeda/staff/new">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans w-full md:w-auto"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Staff Member
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search staff by name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm shadow-sm"
                    style={{ borderRadius: '0.25rem' }}
                />
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Staff Member</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Role / Responsibility</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Contact</th>
                            <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-sans">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-imeda"></div>
                                        Fetching staff directory...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredStaff.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-sans">
                                    No staff members found.
                                </td>
                            </tr>
                        ) : (
                            filteredStaff.map((person) => (
                                <tr
                                    key={person.id}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                    onClick={() => window.location.href = `/dashboard/imeda/staff/${person.id}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <StandardImage
                                                src={person.avatarUrl}
                                                alt={person.name}
                                                containerClassName="w-10 h-10 rounded-full border border-gray-100 dark:border-zinc-700"
                                                fallbackIcon={<Users className="w-5 h-5 text-imeda opacity-50" />}
                                            />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white font-sans">{person.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">#{person.employeeId || '---'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        {person.expertise || 'General Staff'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        <div>{person.email || 'No email'}</div>
                                        <div className="text-xs opacity-70">{person.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${person.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {person.status}
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
