'use client';

import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function NewTransactionPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'invoice';

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        client: '',
        amount: '',
        currency: 'AED',
        description: '',
        invoiceNumber: '',
    });

    const [proofFile, setProofFile] = useState<File | null>(null);

    return (
        <div className="space-y-6">
            {/* Header with Back and Save */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/finance">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {type === 'invoice' ? 'Log Invoice' : 'Log Expense'}
                    </h1>
                </div>
                <button type="submit" form="transaction-form" className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
                <form id="transaction-form" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">
                                {type === 'invoice' ? 'Invoice Number' : 'Reference Number'}
                            </label>
                            <input
                                type="text"
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                placeholder={type === 'invoice' ? 'e.g., INV-2026-001' : 'e.g., EXP-2026-001'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Client *</label>
                        <select
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="">Select client...</option>
                            <option value="global">Global Industries</option>
                            <option value="tech">Tech Solutions</option>
                            <option value="green">Green Energy Ltd</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Currency</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            >
                                <option value="AED">AED (UAE Dirham)</option>
                                <option value="EUR">EUR (Euro)</option>
                                <option value="USD">USD (US Dollar)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            placeholder={type === 'invoice' ? 'Service description, deliverables...' : 'Expense details...'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">
                            Supporting Document
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="flex-1 flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {proofFile ? proofFile.name : 'Choose file...'}
                                </span>
                                <input
                                    type="file"
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    accept="image/*,.pdf"
                                    className="hidden"
                                />
                            </label>
                            {proofFile && (
                                <button
                                    type="button"
                                    onClick={() => setProofFile(null)}
                                    className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
