'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewClientPage() {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        contact: '',
        email: '',
        phone: '',
        street_line1: '',
        street_line2: '',
        city: '',
        zip_code: '',
        country: '',
    });

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Save */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/afconsult/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Add Client</h1>
                <button type="submit" form="client-form" className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            {/* Form - Full Width Two Column */}
            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <form id="client-form" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Company Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans">Company Details</h3>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Company Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., Global Industries"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Industry *</label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., Manufacturing"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address *</label>
                            <input
                                type="text"
                                value={formData.street_line1}
                                onChange={(e) => setFormData({ ...formData, street_line1: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Street address line 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Apartment, Suite, etc.</label>
                            <input
                                type="text"
                                value={formData.street_line2}
                                onChange={(e) => setFormData({ ...formData, street_line2: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Street address line 2 (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">City *</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Dubai"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">ZIP Code *</label>
                                <input
                                    type="text"
                                    value={formData.zip_code}
                                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="00000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Country *</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="United Arab Emirates"
                            />
                        </div>
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans">Primary Contact</h3>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Full Name *</label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., John Smith"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="john@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="+971 4 000 0000"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
