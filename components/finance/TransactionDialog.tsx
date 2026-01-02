'use client';

import { useState, FormEvent } from 'react';
import { X, Upload, DollarSign } from 'lucide-react';
import { saveTransaction } from '@/lib/finance';
import { TRANSACTION_CATEGORIES } from '@/types/finance';
import type { TransactionFormData } from '@/types/finance';

interface TransactionDialogProps {
    defaultUnitId?: string;
    defaultSubProject?: string;
    triggerButton: React.ReactNode;
    brandColor?: string;
}

export default function TransactionDialog({
    defaultUnitId,
    defaultSubProject,
    triggerButton,
    brandColor = 'imeda',
}: TransactionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<TransactionFormData>({
        unitId: defaultUnitId || '',
        subProject: defaultSubProject,
        amount: 0,
        currency: 'AED',
        type: 'EXPENSE',
        category: '',
    });

    const [proofFile, setProofFile] = useState<File | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!formData.unitId) {
                throw new Error('Business unit is required');
            }
            if (formData.amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            if (!formData.category) {
                throw new Error('Category is required');
            }
            if (formData.currency !== 'AED' && !formData.exchangeRate) {
                throw new Error('Exchange rate is required for non-AED currencies');
            }

            const data: TransactionFormData = {
                ...formData,
                proofFile: proofFile || undefined,
            };

            await saveTransaction(data);

            setFormData({
                unitId: defaultUnitId || '',
                subProject: defaultSubProject,
                amount: 0,
                currency: 'AED',
                type: 'EXPENSE',
                category: '',
            });
            setProofFile(null);
            setIsOpen(false);
            alert('Transaction saved successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const categories = formData.type === 'INCOME'
        ? TRANSACTION_CATEGORIES.INCOME
        : TRANSACTION_CATEGORIES.EXPENSE;

    return (
        <>
            <div onClick={() => setIsOpen(true)}>{triggerButton}</div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <DollarSign className={`w-5 h-5 text-${brandColor}`} />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Transaction</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Business Unit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Business Unit
                                </label>
                                <input
                                    type="text"
                                    value={formData.unitId.toUpperCase()}
                                    disabled={!!defaultUnitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                />
                            </div>

                            {/* Sub-Project */}
                            {formData.subProject && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        App/Project
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subProject}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 cursor-not-allowed capitalize"
                                    />
                                </div>
                            )}

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="INCOME"
                                            checked={formData.type === 'INCOME'}
                                            onChange={() => setFormData({ ...formData, type: 'INCOME', category: '' })}
                                            className={`w-4 h-4 text-${brandColor} mr-2`}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Income</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="EXPENSE"
                                            checked={formData.type === 'EXPENSE'}
                                            onChange={() => setFormData({ ...formData, type: 'EXPENSE', category: '' })}
                                            className={`w-4 h-4 text-${brandColor} mr-2`}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Expense</span>
                                    </label>
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select category...</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount || ''}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Currency
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as any, exchangeRate: undefined })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                >
                                    <option value="AED">AED (UAE Dirham)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                </select>
                            </div>

                            {/* Exchange Rate */}
                            {formData.currency !== 'AED' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Exchange Rate to AED *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="0"
                                        value={formData.exchangeRate || ''}
                                        onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g., 3.67 for USD"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        1 {formData.currency} = ? AED
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            {/* Proof Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Proof Document (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {proofFile ? proofFile.name : 'Choose file...'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
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

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2 bg-${brandColor} text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
