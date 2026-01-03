'use client';

import { ArrowLeft, Save, Trash2, MapPin, Phone, Mail, FileText, Upload, Globe, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        name: 'Global Industries',
        industry: 'Manufacturing',
        website: 'www.globalindustries.com',
        email: 'contact@global.com',
        phone: '+971 4 000 0000',
        contactPerson: 'John Smith',
        street_line1: '123 Business Bay',
        street_line2: 'Suite 405',
        city: 'Dubai',
        zip_code: '00000',
        country: 'UAE',
    });

    const handleSave = () => {
        alert('Save functionality - would update client data');
    };

    const confirmDelete = () => {
        alert('Delete functionality - would archive client and redirect');
        setShowDeleteDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/clients">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                    Client Details
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Delete Client"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Always Editable Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <form className="space-y-8">
                            {/* Company Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Company Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Company Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Industry</label>
                                        <input
                                            type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Website</label>
                                        <input
                                            type="text"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Primary Contact Person</label>
                                        <input
                                            type="text"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Address Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address Line 1</label>
                                        <input
                                            type="text"
                                            value={formData.street_line1}
                                            onChange={(e) => setFormData({ ...formData, street_line1: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address Line 2</label>
                                        <input
                                            type="text"
                                            value={formData.street_line2}
                                            onChange={(e) => setFormData({ ...formData, street_line2: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">ZIP / Postal Code</label>
                                        <input
                                            type="text"
                                            value={formData.zip_code}
                                            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Country</label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Contracts & Documents */}
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans">Contracts & Documents</h3>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-afconsult text-afconsult hover:bg-afconsult hover:text-white transition-all text-xs font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                                <Upload className="w-3.5 h-3.5" />
                                Upload Document
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between group" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">Master Services Agreement (MSA)</p>
                                        <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">DEC 12, 2025 • 1.2 MB</p>
                                    </div>
                                </div>
                                <button className="text-xs font-normal text-afconsult hover:underline font-sans uppercase">View</button>
                            </div>
                            <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between group" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">Service Order #4122</p>
                                        <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">JAN 02, 2026 • 450 KB</p>
                                    </div>
                                </div>
                                <button className="text-xs font-normal text-afconsult hover:underline font-sans uppercase">View</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Quick Actions & Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Industry</p>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{formData.industry}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Website</p>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white font-sans truncate">{formData.website}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Quick Communication</h3>
                        <div className="space-y-3">
                            <button className="w-full py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-sans text-sm" style={{ borderRadius: '0.25rem' }}>
                                <Mail className="w-4 h-4" />
                                Send Email
                            </button>
                            <button className="w-full py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 font-sans text-sm" style={{ borderRadius: '0.25rem' }}>
                                <Phone className="w-4 h-4" />
                                Call Client
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Archive Client?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to archive this client? This will move them to the inactive directory.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 bg-red-600 text-white font-normal hover:bg-red-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
