'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

const STAFF = [
    { id: 1, name: 'Consultant A', rate: 250, expertise: 'Strategy & Operations' },
    { id: 2, name: 'Consultant B', rate: 300, expertise: 'Digital Transformation' },
    { id: 3, name: 'Consultant C', rate: 280, expertise: 'Financial Advisory' },
];

export default function StaffPage() {
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

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Rate/Hour</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Expertise</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {STAFF.map((consultant) => (
                            <tr
                                key={consultant.id}
                                className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                onClick={() => window.location.href = `/dashboard/afconsult/staff/${consultant.id}`}
                            >
                                <td className="px-6 py-4 font-normal text-gray-900 dark:text-white font-sans">{consultant.name}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">AED {consultant.rate}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{consultant.expertise}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-normal font-sans ${consultant.availability === 'Available'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`} style={{ borderRadius: '0.25rem' }}>
                                        {consultant.availability}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
