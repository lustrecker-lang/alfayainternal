'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

const CLIENTS = [
    { id: 1, name: 'Global Industries', industry: 'Manufacturing', location: 'Dubai, UAE', contact: 'John Smith', email: 'john@global.com' },
    { id: 2, name: 'Tech Solutions', industry: 'Software', location: 'Berlin, Germany', contact: 'Sarah Miller', email: 'sarah@tech.de' },
    { id: 3, name: 'Green Energy Ltd', industry: 'Renewables', location: 'London, UK', contact: 'Mike Green', email: 'mike@green.co.uk' },
];

export default function ClientsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Client Directory</h1>
                <Link href="/dashboard/afconsult/clients/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Industry</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Location</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Primary Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {CLIENTS.map((client) => (
                            <tr
                                key={client.id}
                                className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                onClick={() => window.location.href = `/dashboard/afconsult/clients/${client.id}`}
                            >
                                <td className="px-6 py-4">
                                    <Link href={`/dashboard/afconsult/clients/${client.id}`} className="text-sm font-normal text-gray-900 dark:text-white hover:text-afconsult font-sans">
                                        {client.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{client.industry}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{client.location}</td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{client.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
