'use client';

import { useState } from 'react';
import { Search, MapPin, Phone, Mail, FileText, X, Upload } from 'lucide-react';
import Image from 'next/image';

const CLIENTS = [
    { id: 1, name: 'Global Industries', industry: 'Manufacturing', location: 'Dubai, UAE', contact: 'John Smith', email: 'john@global.com' },
    { id: 2, name: 'Tech Solutions', industry: 'Software', location: 'Berlin, Germany', contact: 'Sarah Miller', email: 'sarah@tech.de' },
    { id: 3, name: 'Green Energy Ltd', industry: 'Renewables', location: 'London, UK', contact: 'Mike Green', email: 'mike@green.co.uk' },
];

export default function ClientsPage() {
    const [selectedClient, setSelectedClient] = useState<typeof CLIENTS[0] | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Directory</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-afconsult outline-none transition-all"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Industry</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Location</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Primary Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {CLIENTS.map((client) => (
                            <tr
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{client.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{client.industry}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{client.location}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{client.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Client Detail Side-Sheet */}
            {selectedClient && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setSelectedClient(null)} />
                    <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-[70] transition-transform duration-300 animate-slide-in-right overflow-y-auto">
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedClient.name}</h2>
                                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-afconsult font-sans">Company Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span>{selectedClient.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span>+971 4 000 0000</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span>{selectedClient.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-afconsult font-sans">Contracts & Documents</h3>
                                    <button className="flex items-center gap-1 text-xs font-semibold text-afconsult hover:underline">
                                        <Upload className="w-3 h-3" />
                                        Upload New
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-lg flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Master Services Agreement (MSA)</p>
                                                <p className="text-[10px] text-gray-500">Uploaded on Dec 12, 2025 • 1.2 MB</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-gray-400 group-hover:text-afconsult transition-colors underline">View</button>
                                    </div>
                                    <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-lg flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Service Order #4122</p>
                                                <p className="text-[10px] text-gray-500">Uploaded on Jan 02, 2026 • 450 KB</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold text-gray-400 group-hover:text-afconsult transition-colors underline">View</button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
                                <button className="w-full py-3 bg-afconsult text-white rounded-lg font-bold hover:opacity-90 transition-opacity">
                                    Edit Client Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
