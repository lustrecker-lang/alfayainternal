'use client';

import { useState, useEffect } from 'react';
import { Plus, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { getClients, type ClientFull } from '@/lib/finance';

export default function ImedaClientsPage() {
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredClients(clients);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = clients.filter(client => {
            const nameMatch = client.name.toLowerCase().includes(query);
            const countryMatch = client.address?.country?.toLowerCase().includes(query);
            const contactMatch = client.contacts?.some(c => c.name?.toLowerCase().includes(query));
            const primaryContactMatch = client.contact?.toLowerCase().includes(query);

            return nameMatch || countryMatch || contactMatch || primaryContactMatch;
        });
        setFilteredClients(filtered);
    }, [searchQuery, clients]);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await getClients('imeda');
            setClients(data);
            setFilteredClients(data);
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

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by name, country, or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none text-sm font-sans"
                    style={{ borderRadius: '0.25rem' }}
                />
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Type</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Country</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Contacts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading clients...</td>
                            </tr>
                        ) : filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">
                                    {searchQuery ? 'No clients match your search.' : 'No clients yet. Click "Add Client" to create one.'}
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map((client) => {
                                // Safe access for client properties
                                const clientType = (client as { clientType?: string }).clientType || 'company';
                                const contactsCount = (client as { contacts?: any[] }).contacts?.length || 0;
                                const country = client.address?.country || '-';

                                return (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                        onClick={() => window.location.href = `/dashboard/imeda/clients/${client.id}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {clientType === 'personal' ? (
                                                    <User className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <Building2 className="w-4 h-4 text-imeda" />
                                                )}
                                                <span className={`text-xs font-sans capitalize ${clientType === 'personal' ? 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-zinc-700 px-2 py-0.5 rounded' : 'text-imeda bg-imeda/10 px-2 py-0.5 rounded'}`}>
                                                    {clientType}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/imeda/clients/${client.id}`} className="text-sm font-normal text-gray-900 dark:text-white hover:text-imeda font-sans">
                                                {client.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                            {country}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">
                                            {contactsCount}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
