'use client';

import { Search, Filter, Download } from 'lucide-react';

const LOGS = [
    { id: 1, date: '2026-01-02', consultant: 'Consultant A', client: 'Global Industries', hours: 4.5, description: 'Q1 Strategy Session' },
    { id: 2, date: '2026-01-02', consultant: 'Consultant B', client: 'Tech Solutions', hours: 2.0, description: 'Code Review & Audit' },
    { id: 3, date: '2026-01-01', consultant: 'Consultant A', client: 'Green Energy Ltd', hours: 6.0, description: 'Market Analysis Phase 1' },
];

export default function TimeLogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracking</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-afconsult outline-none transition-all"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight font-sans">Recent Activity</h2>
                    <button className="text-xs font-bold text-afconsult hover:underline flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Export Monthly Ledger
                    </button>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Date</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Consultant</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Client</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans text-right">Hours</th>
                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {LOGS.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-sans">{log.date}</td>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{log.consultant}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.client}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">{log.hours.toFixed(1)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 italic line-clamp-1">{log.description}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50/50 dark:bg-zinc-900/50 font-bold border-t border-gray-200 dark:border-gray-700">
                            <td colSpan={3} className="px-6 py-4 text-right text-gray-500">Total Recorded</td>
                            <td className="px-6 py-4 text-right text-afconsult font-serif text-lg">12.5h</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
