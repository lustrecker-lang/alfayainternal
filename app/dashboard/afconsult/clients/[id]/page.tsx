'use client';

import { ArrowLeft, MapPin, Phone, Mail, FileText, Upload } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
    // Mock client data - in real app, fetch based on params.id
    const client = {
        id: params.id,
        name: 'Global Industries',
        industry: 'Manufacturing',
        location: 'Dubai, UAE',
        contact: 'John Smith',
        email: 'john@global.com',
        phone: '+971 4 000 0000',
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/afconsult/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-afconsult font-sans mb-4">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-sans">Location</p>
                                    <p className="font-medium">{client.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-sans">Phone</p>
                                    <p className="font-medium">{client.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-sans">Email</p>
                                    <p className="font-medium">{client.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <div className="w-5 h-5" />
                                <div>
                                    <p className="text-xs text-gray-500 font-sans">Industry</p>
                                    <p className="font-medium">{client.industry}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contracts & Documents */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
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
                </div>

                {/* Actions */}
                <div>
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                        <button className="w-full py-3 bg-afconsult text-white rounded-lg font-bold hover:opacity-90 transition-opacity">
                            Edit Client
                        </button>
                        <button className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                            View Projects
                        </button>
                        <button className="w-full py-3 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Archive Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
