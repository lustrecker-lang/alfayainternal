'use client';

import { useState, useEffect } from 'react';
import { Plus, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { getClients, type ClientFull } from '@/lib/finance';

export default function ImedaClientsPage() {
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await getClients('imeda');
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Client Directory</h1>
                <Link href="/dashboard/imeda/clients/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Type</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">VAT Number</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Location</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Primary Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">Loading clients...</td>
                            </tr>
                        ) : clients.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">
                                    No clients yet. Click "Add Client" to create one.
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr
                                    key={client.id}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                    onClick={() => window.location.href = `/dashboard/imeda/clients/${client.id}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {(client as { clientType?: string }).clientType === 'personal' ? (
                                                <User className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="text-xs text-gray-500 font-sans capitalize">
                                                {(client as { clientType?: string }).clientType || 'company'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/imeda/clients/${client.id}`} className="text-sm font-normal text-gray-900 dark:text-white hover:text-imeda font-sans">
                                            {client.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        {(client as { vatNumber?: string }).vatNumber || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        {client.address?.city ? `${client.address.city}, ${client.address.country || ''}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                        {client.contact || '-'}
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
