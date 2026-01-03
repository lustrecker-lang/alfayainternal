'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewConsultantPage() {
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        expertise: '',
        email: '',
        phone: '',
    });

    const handleSave = () => {
        alert('Save functionality - would create new consultant and redirect');
    };

    return (
        <div className="space-y-6">
            {/* Header with Back and Save */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/staff">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-3xl text-gray-900 dark:text-white">Add Consultant</h1>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Core Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Professional Info</h3>

                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
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
                                    placeholder="e.g. 250"
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
                                    placeholder="e.g. Strategy & Operations"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>

                        {/* Column 2: Contact Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Contact Details</h3>

                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="consultant@afconsult.com"
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
                                    placeholder="+971 50 123 4567"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
