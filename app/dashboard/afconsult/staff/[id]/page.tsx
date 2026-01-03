'use client';

import { ArrowLeft, Save, Trash2, Mail, Phone, Briefcase, DollarSign, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

export default function ConsultantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Mock consultant data - in real app, fetch based on id
    const [formData, setFormData] = useState({
        name: 'Consultant A',
        rate: '250',
        expertise: 'Strategy & Operations',
        email: 'consultant.a@afconsult.com',
        phone: '+971 50 123 4567',
        bio: 'Senior consultant with 10+ years of experience in regional strategy and operational efficiency projects.',
        joinedDate: '2024-03-15',
    });

    const handleSave = () => {
        alert('Save functionality - would update consultant data');
    };

    const confirmDelete = () => {
        alert('Archive functionality - would remove consultant from active directory');
        setShowDeleteDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/staff">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                    Consultant Details
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Archive Consultant"
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
                            {/* Professional Info Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Professional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Rate per Hour (AED)</label>
                                        <input
                                            type="number"
                                            value={formData.rate}
                                            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Expertise / Specialization</label>
                                        <input
                                            type="text"
                                            value={formData.expertise}
                                            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio / Experience Section */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Consultant Bio</h3>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none resize-none font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                />
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
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">Employment Contract</p>
                                        <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">MAR 15, 2024 • 850 KB</p>
                                    </div>
                                </div>
                                <button className="text-xs font-normal text-afconsult hover:underline font-sans uppercase">View</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

            {/* Delete Confirmation Dialog */ }
    {
        showDeleteDialog && (
            <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Archive Consultant?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                            Are you sure you want to archive this consultant? This will remove them from the active list of staff members.
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
        )
    }
        </div >
    );
}
