'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

const LOGS = [
    { id: 1, date: '2026-01-02', consultant: 'Consultant A', client: 'Global Industries', hours: 4.5, description: 'Q1 Strategy Session' },
    { id: 2, date: '2026-01-02', consultant: 'Consultant B', client: 'Tech Solutions', hours: 2.0, description: 'Code Review & Audit' },
    { id: 3, date: '2026-01-01', consultant: 'Consultant A', client: 'Green Energy Ltd', hours: 6.0, description: 'Market Analysis Phase 1' },
];

export default function TimeLogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Time Tracking</h1>
                <Link href="/dashboard/afconsult/time-logs/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        Log Hours
                    </button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <div className="px-6 py-4 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-sm font-normal text-gray-600 dark:text-gray-400 uppercase tracking-tight font-sans">Recent Activity</h2>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-3 text-[10px] font-normal uppercase tracking-wider text-gray-400 font-sans">Date</th>
                            <th className="px-6 py-3 text-[10px] font-normal uppercase tracking-wider text-gray-400 font-sans">Consultant</th>
                            <th className="px-6 py-3 text-[10px] font-normal uppercase tracking-wider text-gray-400 font-sans">Client</th>
                            <th className="px-6 py-3 text-[10px] font-normal uppercase tracking-wider text-gray-400 font-sans text-right">Hours</th>
                            <th className="px-6 py-3 text-[10px] font-normal uppercase tracking-wider text-gray-400 font-sans">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {LOGS.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{log.date}</td>
                                <td className="px-6 py-4 font-normal text-gray-900 dark:text-white font-sans">{log.consultant}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{log.client}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-900 dark:text-white text-right font-sans">{log.hours.toFixed(1)}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 italic line-clamp-1 font-sans">{log.description}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50/50 dark:bg-zinc-900/50 font-normal border-t border-gray-200 dark:border-gray-700">
                            <td colSpan={3} className="px-6 py-4 text-right text-gray-500 font-sans">Total Recorded</td>
                            <td className="px-6 py-4 text-right text-afconsult font-sans text-lg">12.5h</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
