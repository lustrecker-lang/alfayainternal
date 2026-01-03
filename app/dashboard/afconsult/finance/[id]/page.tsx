'use client';

import { ArrowLeft, Save, Trash2, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

// Mock clients for AFCONSULT billable dropdown
const AFCONSULT_CLIENTS = [
    { id: 1, name: 'Global Industries' },
    { id: 2, name: 'Tech Solutions' },
    { id: 3, name: 'Green Energy Ltd' },
];

// Expense categories
const EXPENSE_CATEGORIES = [
    'Travel & Transport',
    'Accommodation',
    'Meals & Entertainment',
    'Office Supplies',
    'Software & Subscriptions',
    'Professional Services',
    'Marketing & Advertising',
    'Utilities',
    'Other',
];

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Mock expense data - in real app, fetch based on id
    const [formData, setFormData] = useState({
        date: '2026-01-02',
        vendor: 'Emirates Airlines',
        amount: '1250.00',
        currency: 'AED',
        vat: '5',
        category: 'Travel & Transport',
        billableToClient: true,
        clientId: '1',
        notes: 'Flight to Abu Dhabi for client meeting.',
    });

    const [proofFile, setProofFile] = useState<{ name: string; size: number } | null>({
        name: 'receipt_emirates_jan2026.pdf',
        size: 245000,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile({
                name: e.target.files[0].name,
                size: e.target.files[0].size,
            });
        }
    };

    const removeFile = () => {
        setProofFile(null);
    };

    const calculateTotal = () => {
        const amount = parseFloat(formData.amount) || 0;
        const vatRate = parseFloat(formData.vat) || 0;
        const vatAmount = amount * (vatRate / 100);
        return {
            subtotal: amount,
            vat: vatAmount,
            total: amount + vatAmount,
        };
    };

    const handleSave = () => {
        const expenseData = {
            ...formData,
            unitId: 'afconsult',
            proofFileName: proofFile?.name,
            totals: calculateTotal(),
        };
        console.log('Expense data to save:', expenseData);
        alert('Save functionality - would update expense data');
    };

    const confirmDelete = () => {
        alert('Delete functionality - would remove expense and redirect');
        setShowDeleteDialog(false);
    };

    const totals = calculateTotal();

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/finance">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                    Expense Details
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Delete Expense"
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
                {/* Main Content - Expense Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <form className="space-y-8">
                            {/* Core Expense Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Expense Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Vendor / Supplier</label>
                                        <input
                                            type="text"
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                            placeholder="e.g. Emirates Airlines"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Amount (excl. VAT)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="AED">AED</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">VAT Rate (%)</label>
                                        <select
                                            value={formData.vat}
                                            onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="0">0% (Exempt)</option>
                                            <option value="5">5% (Standard)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="">Select category...</option>
                                            {EXPENSE_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* AFCONSULT-Specific: Billable to Client */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Billing</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="billableToClient"
                                            checked={formData.billableToClient}
                                            onChange={(e) => setFormData({ ...formData, billableToClient: e.target.checked, clientId: '' })}
                                            className="w-4 h-4 text-afconsult border-gray-300 rounded focus:ring-afconsult"
                                        />
                                        <label htmlFor="billableToClient" className="text-sm font-normal text-gray-700 dark:text-gray-300 font-sans">
                                            Billable to Client
                                        </label>
                                    </div>

                                    {formData.billableToClient && (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Select Client</label>
                                            <select
                                                value={formData.clientId}
                                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                                style={{ borderRadius: '0.25rem' }}
                                            >
                                                <option value="">Select client...</option>
                                                {AFCONSULT_CLIENTS.map((client) => (
                                                    <option key={client.id} value={client.id}>{client.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Notes</h3>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Optional notes about this expense..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none resize-none font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Proof Upload */}
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans">Proof / Receipt</h3>
                        </div>

                        {proofFile ? (
                            <div className="p-4 border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{proofFile.name}</p>
                                        <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">
                                            {(proofFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="text-xs font-normal text-afconsult hover:underline font-sans uppercase">View</button>
                                    <button
                                        onClick={removeFile}
                                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="block cursor-pointer">
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-afconsult transition-colors" style={{ borderRadius: '0.5rem' }}>
                                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 font-sans">Click to upload receipt or proof</p>
                                    <p className="text-xs text-gray-400 font-sans mt-1">PDF, JPG, PNG up to 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Sidebar - Summary */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-sans">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 dark:text-white">{formData.currency} {totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-sans">
                                <span className="text-gray-500">VAT ({formData.vat}%)</span>
                                <span className="text-gray-900 dark:text-white">{formData.currency} {totals.vat.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between text-sm font-sans">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Total</span>
                                <span className="text-afconsult font-medium">{formData.currency} {totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-sans">
                                <span className="text-gray-500">Category</span>
                                <span className="text-gray-900 dark:text-white">{formData.category || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm font-sans">
                                <span className="text-gray-500">Billable</span>
                                <span className="text-gray-900 dark:text-white">{formData.billableToClient ? 'Yes' : 'No'}</span>
                            </div>
                            {formData.billableToClient && formData.clientId && (
                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-500">Client</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {AFCONSULT_CLIENTS.find(c => c.id.toString() === formData.clientId)?.name || '—'}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-sans">
                                <span className="text-gray-500">Proof</span>
                                <span className="text-gray-900 dark:text-white">{proofFile ? 'Attached' : 'None'}</span>
                            </div>
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
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Delete Expense?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to delete this expense? This action cannot be undone.
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
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
