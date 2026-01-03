'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Edit3, Save, FileDown, AlertTriangle } from 'lucide-react';
import { updateTransaction, deleteTransaction } from '@/lib/finance';
import { buildMetadata } from '@/types/finance';
import type { Transaction, TransactionFormData } from '@/types/finance';
import { GLOBAL_CATEGORIES, VAT_RATES, calculateVATFromGross } from '@/config/finance';

// Form state with string date for HTML input
interface EditFormData {
    date: string;
    vendor: string;
    totalAmount: number;
    vatRate: number;
    category: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
}

interface TransactionDetailDialogProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    brandColor?: string;
}

export default function TransactionDetailDialog({
    transaction,
    isOpen,
    onClose,
    onUpdate,
    brandColor = 'afconsult',
}: TransactionDetailDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editable form state
    const [formData, setFormData] = useState<EditFormData>({
        date: '',
        vendor: '',
        totalAmount: 0,
        vatRate: 5,
        category: '',
        description: '',
        type: 'EXPENSE',
    });

    // Initialize form data when transaction changes
    useEffect(() => {
        if (transaction) {
            const dateStr = transaction.date instanceof Date
                ? transaction.date.toISOString().split('T')[0]
                : new Date(transaction.date).toISOString().split('T')[0];

            setFormData({
                date: dateStr,
                vendor: transaction.vendor || '',
                totalAmount: transaction.totalAmount || 0,
                vatRate: transaction.vatRate || 5,
                category: transaction.category || '',
                description: transaction.description || '',
                type: transaction.type,
            });
            setIsEditing(false);
            setError(null);
        }
    }, [transaction]);

    if (!isOpen || !transaction) return null;

    const categories = formData.type === 'INCOME'
        ? GLOBAL_CATEGORIES.INCOME
        : GLOBAL_CATEGORIES.EXPENSE;

    const handleSave = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            // Calculate VAT breakdown if amount changed
            const vatBreakdown = calculateVATFromGross(
                formData.totalAmount,
                formData.vatRate,
                true
            );

            const updates: Partial<Transaction> = {
                date: new Date(formData.date),
                vendor: formData.vendor,
                category: formData.category,
                description: formData.description,
                vatRate: formData.vatRate,
                amount: vatBreakdown.netAmount,
                vatAmount: vatBreakdown.vatAmount,
                totalAmount: vatBreakdown.totalAmount,
                amountInAED: vatBreakdown.totalAmount,
            };

            // Build metadata from existing + any updates
            const metadata = transaction.metadata || undefined;

            await updateTransaction(transaction.id, updates, metadata);
            setIsEditing(false);
            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setError(null);
        setIsSubmitting(true);

        try {
            await deleteTransaction(transaction.id);
            onClose();
            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white dark:bg-zinc-900 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
                style={{ borderRadius: '0.5rem' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${transaction.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <h2 className="text-lg text-gray-900 dark:text-white font-sans">
                            {isEditing ? 'Edit Transaction' : 'Transaction Details'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 text-sm font-sans" style={{ borderRadius: '0.25rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Read-only or Edit mode */}
                    {isEditing ? (
                        <div className="space-y-4">
                            {/* Date */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Date</label>
                                <input
                                    type="date"
                                    value={formData.date as string}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Vendor</label>
                                <input
                                    type="text"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            {/* Total Amount */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Total Amount (AED)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.totalAmount}
                                    onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            {/* VAT Rate */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">VAT Rate</label>
                                <select
                                    value={formData.vatRate}
                                    onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    {VAT_RATES.map((rate) => (
                                        <option key={rate.value} value={rate.value}>{rate.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm resize-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Vendor & Date */}
                            <div>
                                <p className="text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Vendor</p>
                                <p className="text-lg text-gray-900 dark:text-white font-sans">{transaction.vendor}</p>
                                <p className="text-sm text-gray-500 font-sans">{formatDate(transaction.date)}</p>
                            </div>

                            {/* Amount */}
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 space-y-2" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-500">Net Amount</span>
                                    <span className="text-gray-900 dark:text-white">AED {transaction.amount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-500">VAT ({transaction.vatRate}%)</span>
                                    <span className="text-gray-900 dark:text-white">AED {transaction.vatAmount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-sans font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <span className="text-gray-700 dark:text-gray-300">Total</span>
                                    <span className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                        AED {transaction.totalAmount?.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <p className="text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Category</p>
                                <p className="text-sm text-gray-900 dark:text-white font-sans">{transaction.category}</p>
                            </div>

                            {/* Description */}
                            {transaction.description && (
                                <div>
                                    <p className="text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Description</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-sans">{transaction.description}</p>
                                </div>
                            )}

                            {/* Proof */}
                            {transaction.proofUrl && (
                                <div>
                                    <p className="text-xs font-normal uppercase tracking-wider text-gray-500 mb-1 font-sans">Proof / Receipt</p>
                                    <a
                                        href={transaction.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 text-sm text-${brandColor} hover:underline font-sans`}
                                    >
                                        <FileDown className="w-4 h-4" />
                                        View Document
                                    </a>
                                </div>
                            )}

                            {/* Metadata badges */}
                            {transaction.metadata && (
                                <div className="flex flex-wrap gap-2">
                                    {'client_id' in transaction.metadata && (
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 font-sans" style={{ borderRadius: '0.25rem' }}>
                                            Client Linked
                                        </span>
                                    )}
                                    {'is_billable' in transaction.metadata && transaction.metadata.is_billable && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 font-sans" style={{ borderRadius: '0.25rem' }}>
                                            Billable
                                        </span>
                                    )}
                                    {'is_operational' in transaction.metadata && (
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 font-sans" style={{ borderRadius: '0.25rem' }}>
                                            Operational
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4" style={{ borderRadius: '0.25rem' }}>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300 font-sans">Delete this transaction?</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-sans">This action cannot be undone.</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={handleDelete}
                                            disabled={isSubmitting}
                                            className="px-3 py-1 bg-red-600 text-white text-xs font-sans hover:bg-red-700 disabled:opacity-50"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-sans hover:bg-gray-50 dark:hover:bg-gray-800"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-sans hover:bg-gray-50 dark:hover:bg-gray-800"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className={`px-4 py-2 bg-${brandColor} text-white text-sm font-sans hover:opacity-90 disabled:opacity-50 flex items-center gap-2`}
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-sans flex items-center gap-2"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`px-4 py-2 bg-${brandColor} text-white text-sm font-sans hover:opacity-90 flex items-center gap-2`}
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
