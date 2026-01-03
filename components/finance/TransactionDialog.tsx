'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { saveTransaction } from '@/lib/finance';
import { buildMetadata } from '@/types/finance';
import type { TransactionFormData } from '@/types/finance';
import { SUPPORTED_CURRENCIES, VAT_RATES, calculateVATFromGross, calculateExchangeRate } from '@/config/finance';
import VendorCombobox from '@/components/finance/VendorCombobox';
import ClientCombobox from '@/components/finance/ClientCombobox';
import CategorySelect from '@/components/finance/CategorySelect';
import { X, Upload, DollarSign, FileText, ChevronDown } from 'lucide-react';

// Mock data sources - will be replaced with Firestore fetches later
const AFCONSULT_CLIENTS = [
    { id: 'cli_1', name: 'Global Industries' },
    { id: 'cli_2', name: 'Tech Solutions' },
    { id: 'cli_3', name: 'Green Energy Ltd' },
];

const AFCONSULT_PROJECTS = [
    { id: 'prj_1', name: 'Project Alpha', clientId: 'cli_1' },
    { id: 'prj_2', name: 'Project Beta', clientId: 'cli_2' },
    { id: 'prj_3', name: 'Market Analysis', clientId: 'cli_3' },
];

const AFTECH_APPS = [
    { slug: 'circles', name: 'Circles' },
    { slug: 'whosfree', name: 'WhosFree' },
];

interface TransactionDialogProps {
    defaultUnit?: string;
    defaultSubProject?: string;
    triggerButton: React.ReactNode;
    brandColor?: string;
    onSuccess?: () => void;
}

export default function TransactionDialog({
    defaultUnit,
    defaultSubProject,
    triggerButton,
    brandColor = 'imeda',
    onSuccess,
}: TransactionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state - now uses "Total Amount" (gross) as the primary input
    const [formData, setFormData] = useState<TransactionFormData>({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        amount: 0, // This is now the TOTAL (gross) amount from bank
        currency: 'AED',
        vatRate: 5,
        type: 'EXPENSE',
        category: '',
        description: '',
        unitId: defaultUnit || '',
        // Polymorphic fields
        clientId: '',
        projectId: '',
        invoiceReference: '',
        isBillable: false,
        isOperational: false,
        seminarId: '',
        appSlug: defaultSubProject || '',
    });

    // Bank statement workflow: whether VAT is included in total
    const [vatIncluded, setVatIncluded] = useState(true);

    // VAT Logic: Standard (5%), Exempt (0%), or Custom (Manual)
    const [vatMethod, setVatMethod] = useState<'standard' | 'exempt' | 'custom'>('standard');
    const [customVatAmount, setCustomVatAmount] = useState<number>(0);

    // Foreign currency: user enters foreign amount + AED deducted
    const [foreignAmount, setForeignAmount] = useState(0);

    const [proofFile, setProofFile] = useState<File | null>(null);

    // Smart Defaults: Switch VAT method based on currency
    useEffect(() => {
        if (formData.currency === 'AED') {
            setVatMethod('standard');
            setFormData(prev => ({ ...prev, vatRate: 5 }));
        } else {
            setVatMethod('exempt');
            setFormData(prev => ({ ...prev, vatRate: 0 }));
        }
    }, [formData.currency]);



    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            vendor: '',
            amount: 0,
            currency: 'AED',
            vatRate: 5,
            type: 'EXPENSE',
            category: '',
            description: '',
            unitId: defaultUnit || '',
            clientId: '',
            projectId: '',
            invoiceReference: '',
            isBillable: false,
            isOperational: false,
            seminarId: '',
            appSlug: defaultSubProject || '',
        });
        setVatIncluded(true);
        setVatMethod('standard');
        setCustomVatAmount(0);
        setForeignAmount(0);
        setProofFile(null);
        setError(null);
    };

    // Calculate VAT breakdown based on selected method
    const vatBreakdown = useMemo(() => {
        if (vatMethod === 'exempt') {
            return {
                netAmount: formData.amount,
                vatAmount: 0,
                totalAmount: formData.amount
            };
        }

        if (vatMethod === 'custom') {
            return {
                netAmount: Math.max(0, formData.amount - customVatAmount),
                vatAmount: customVatAmount,
                totalAmount: formData.amount
            };
        }

        // Standard: Backwards calculation from Gross (Total) Amount
        return calculateVATFromGross(formData.amount, 5, true);
    }, [formData.amount, vatMethod, customVatAmount]);

    // Calculate implied exchange rate for foreign currencies
    const impliedExchangeRate = useMemo(() => {
        if (formData.currency === 'AED' || foreignAmount <= 0 || formData.amount <= 0) {
            return 0;
        }
        return calculateExchangeRate(foreignAmount, formData.amount);
    }, [foreignAmount, formData.amount, formData.currency]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Validation
            if (!formData.unitId) throw new Error('Business unit is required');
            if (formData.amount <= 0) throw new Error('Total amount is required');
            if (!formData.category) throw new Error('Category is required');
            if (!formData.vendor) throw new Error('Vendor is required');
            if (formData.currency !== 'AED' && foreignAmount <= 0) {
                throw new Error('Foreign amount is required');
            }

            // AFCONSULT-specific validation
            if (formData.unitId === 'afconsult') {
                // For INCOME, client is selected via ClientCombobox which sets formData.vendor
                if (formData.type === 'INCOME' && !formData.vendor) {
                    throw new Error('Client is required for income');
                }
                if (formData.type === 'EXPENSE' && !formData.isOperational && !formData.clientId) {
                    throw new Error('Client is required for direct expenses');
                }
            }

            // Validation for Custom VAT
            if (vatMethod === 'custom' && customVatAmount >= formData.amount) {
                throw new Error('VAT amount cannot be equal to or exceed total amount');
            }

            // Build metadata
            const metadata = buildMetadata(formData);

            // Prepare transaction data with correct calculations
            // We pass the calculated values as the 3rd argument (BankStatementContext)
            await saveTransaction(
                {
                    ...formData,
                    // Ensure VAT rate is correct based on method
                    vatRate: vatMethod === 'exempt' ? 0 : (vatMethod === 'standard' ? 5 : 0),
                    // Handle currency conversion for display/reporting logic inside saveTransaction
                    exchangeRate: formData.currency === 'AED' ? 1 : impliedExchangeRate,
                    proofFile: proofFile || undefined,
                },
                metadata,
                {
                    vatIncluded,
                    netAmount: vatBreakdown.netAmount,
                    vatAmount: vatBreakdown.vatAmount,
                    totalAmount: vatBreakdown.totalAmount,
                    foreignAmount: formData.currency !== 'AED' ? foreignAmount : undefined,
                }
            );

            resetForm();
            setIsOpen(false);
            onSuccess?.();
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

    // Filter projects by selected client
    const filteredProjects = AFCONSULT_PROJECTS.filter(
        p => !formData.clientId || p.clientId === formData.clientId
    );

    return (
        <>
            <div onClick={() => setIsOpen(true)}>{triggerButton}</div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-900 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <DollarSign className={`w-5 h-5 text-${brandColor}`} />
                                <h2 className="text-xl text-gray-900 dark:text-white font-sans">
                                    {formData.type === 'INCOME' ? 'Log Income' : 'Log Expense'}
                                </h2>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); resetForm(); }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 text-sm font-sans" style={{ borderRadius: '0.25rem' }}>
                                    {error}
                                </div>
                            )}

                            {/* Type Toggle */}
                            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800" style={{ borderRadius: '0.25rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'INCOME', category: '', isOperational: false })}
                                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${formData.type === 'INCOME'
                                        ? 'bg-white dark:bg-zinc-700 text-green-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: '' })}
                                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${formData.type === 'EXPENSE'
                                        ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Expense
                                </button>
                            </div>

                            {/* ============================================ */}
                            {/* SECTION A: Bank Statement Fields             */}
                            {/* ============================================ */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-gray-500 font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">
                                    Bank Statement Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Date *</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                            style={{ borderRadius: '0.25rem' }}
                                            required
                                        />
                                    </div>

                                    {/* Vendor/Client Selection - depends on transaction type */}
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">
                                            {formData.type === 'INCOME' ? 'Received From / Client *' : 'Paid To / Vendor *'}
                                        </label>
                                        {formData.type === 'INCOME' ? (
                                            <ClientCombobox
                                                value={formData.vendor}
                                                onChange={(value) => setFormData({ ...formData, vendor: value })}
                                                unitId={formData.unitId}
                                                placeholder="e.g., Client Company Name"
                                            />
                                        ) : (
                                            <VendorCombobox
                                                value={formData.vendor}
                                                onChange={(value) => setFormData({ ...formData, vendor: value })}
                                                placeholder="e.g., Emirates Airlines"
                                            />
                                        )}
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Currency *</label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => {
                                                const newCurrency = e.target.value as any;
                                                setFormData({ ...formData, currency: newCurrency });
                                                if (newCurrency === 'AED') {
                                                    setForeignAmount(0);
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            {SUPPORTED_CURRENCIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Category *</label>
                                        <CategorySelect
                                            value={formData.category}
                                            onChange={(value) => setFormData({ ...formData, category: value })}
                                            type={formData.type}
                                        />
                                    </div>

                                    {/* Foreign Amount (if non-AED) */}
                                    {formData.currency !== 'AED' && (
                                        <div>
                                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">
                                                Foreign Amount ({formData.currency}) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={foreignAmount || ''}
                                                onChange={(e) => setForeignAmount(parseFloat(e.target.value) || 0)}
                                                placeholder={`e.g., 100 ${formData.currency}`}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                                style={{ borderRadius: '0.25rem' }}
                                                required
                                            />
                                        </div>
                                    )}

                                    {/* Total Amount (from Bank) - Always AED */}
                                    <div className={formData.currency !== 'AED' ? '' : 'col-span-2'}>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">
                                            {formData.type === 'INCOME'
                                                ? (formData.currency !== 'AED' ? 'AED Received (into Bank) *' : 'Total Received (into Bank) *')
                                                : (formData.currency !== 'AED' ? 'AED Deducted (from Bank) *' : 'Total Deducted (from Bank) *')
                                            }
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            placeholder="e.g., 425.00"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                            style={{ borderRadius: '0.25rem' }}
                                            required
                                        />
                                    </div>

                                    {/* VAT Calculation Method */}
                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 font-sans">VAT Treatment</label>
                                        <select
                                            value={vatMethod}
                                            onChange={(e) => {
                                                const method = e.target.value as 'standard' | 'exempt' | 'custom';
                                                setVatMethod(method);
                                                if (method === 'standard') setFormData(prev => ({ ...prev, vatRate: 5 }));
                                                if (method === 'exempt') setFormData(prev => ({ ...prev, vatRate: 0 }));
                                                if (method === 'custom') setFormData(prev => ({ ...prev, vatRate: 0 }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="standard">5% (UAE Standard)</option>
                                            <option value="exempt">0% / Exempt / Foreign</option>
                                            <option value="custom">Custom Amount (Manual)</option>
                                        </select>

                                        {/* Warning for Foreign + 5% (Expense only) */}
                                        {formData.type === 'EXPENSE' && formData.currency !== 'AED' && vatMethod === 'standard' && (
                                            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                <span>⚠️ Warning: You usually cannot claim UAE VAT on foreign expenses.</span>
                                            </div>
                                        )}

                                        {/* Custom VAT Input */}
                                        {vatMethod === 'custom' && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Enter VAT Amount manually from receipt</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-400 text-sm">{SUPPORTED_CURRENCIES.find(c => c === formData.currency) || formData.currency}</span>
                                                    <input
                                                        type="number"
                                                        value={customVatAmount || ''}
                                                        onChange={(e) => setCustomVatAmount(parseFloat(e.target.value) || 0)}
                                                        className="w-full pl-12 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                                        style={{ borderRadius: '0.25rem' }}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        placeholder={formData.type === 'INCOME'
                                            ? 'e.g., Payment for Project Alpha Milestone 1'
                                            : 'e.g., Client lunch meeting'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none resize-none font-sans"
                                        style={{ borderRadius: '0.25rem' }}
                                    />
                                </div>

                                {/* Proof Upload */}
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Proof / Receipt</label>
                                    {proofFile ? (
                                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800" style={{ borderRadius: '0.25rem' }}>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 font-sans">{proofFile.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setProofFile(null)}
                                                className="text-xs text-red-600 hover:underline font-sans"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-gray-400 transition-colors" style={{ borderRadius: '0.25rem' }}>
                                            <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-sans">Click to upload...</span>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf"
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* ============================================ */}
                            {/* SECTION B: Context-Specific (Polymorphic)    */}
                            {/* ============================================ */}
                            {renderSectionB(formData, setFormData, filteredProjects)}

                            {/* Summary Box (Read-only breakdown) */}
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 space-y-2" style={{ borderRadius: '0.25rem' }}>
                                <h4 className="text-xs font-normal uppercase tracking-wider text-gray-500 font-sans mb-3">Calculated Breakdown</h4>

                                {/* Show exchange rate if foreign currency */}
                                {formData.currency !== 'AED' && impliedExchangeRate > 0 && (
                                    <div className="flex justify-between text-sm font-sans">
                                        <span className="text-gray-500">Exchange Rate</span>
                                        <span className="text-gray-900 dark:text-white">1 {formData.currency} = {impliedExchangeRate.toFixed(4)} AED</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-500">Net Amount</span>
                                    <span className="text-gray-900 dark:text-white">AED {vatBreakdown.netAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-500">VAT ({formData.vatRate}%)</span>
                                    <span className="text-gray-900 dark:text-white">AED {vatBreakdown.vatAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-sans font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <span className="text-gray-700 dark:text-gray-300">Total (Bank)</span>
                                    <span className={formData.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                        AED {vatBreakdown.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsOpen(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 px-4 py-2 bg-${brandColor} text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-sans`}
                                    style={{ borderRadius: '0.25rem' }}
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

// ============================================
// SECTION B RENDERER (Polymorphic by Unit)
// ============================================
function renderSectionB(
    formData: TransactionFormData,
    setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>,
    filteredProjects: typeof AFCONSULT_PROJECTS
) {
    const { unitId, type } = formData;

    // No Section B for units without specific context
    if (!unitId) return null;

    // ========== AFCONSULT ==========
    if (unitId === 'afconsult') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-normal uppercase tracking-wider text-gray-500 font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">
                    {type === 'INCOME' ? 'Income Linkage' : 'Expense Linkage'}
                </h3>

                {/* Operational Toggle (Expense only) */}
                {type === 'EXPENSE' && (
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isOperational"
                            checked={formData.isOperational}
                            onChange={(e) => setFormData({
                                ...formData,
                                isOperational: e.target.checked,
                                clientId: e.target.checked ? '' : formData.clientId,
                                projectId: e.target.checked ? '' : formData.projectId,
                            })}
                            className="w-4 h-4 text-afconsult border-gray-300 rounded focus:ring-afconsult"
                        />
                        <label htmlFor="isOperational" className="text-sm font-normal text-gray-700 dark:text-gray-300 font-sans">
                            General / Overhead Expense (not linked to a client)
                        </label>
                    </div>
                )}

                {/* Client & Project (Expense only - if not operational) */}
                {type === 'EXPENSE' && !formData.isOperational && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Client */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">
                                Client
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value, projectId: '' })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <option value="">Select client...</option>
                                {AFCONSULT_CLIENTS.map((client) => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Billable Checkbox */}
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="isBillable"
                                checked={formData.isBillable}
                                onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                                className="w-4 h-4 text-afconsult border-gray-300 rounded focus:ring-afconsult"
                            />
                            <label htmlFor="isBillable" className="text-sm font-normal text-gray-700 dark:text-gray-300 font-sans">
                                Billable to Client
                            </label>
                        </div>
                    </div>
                )}

                {/* Invoice Reference (Income only) */}
                {type === 'INCOME' && (
                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Linked Invoice #</label>
                        <input
                            type="text"
                            value={formData.invoiceReference}
                            onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                            placeholder="e.g. INV-2026-001"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                            style={{ borderRadius: '0.25rem' }}
                        />
                        <p className="text-xs text-gray-400 mt-1 font-sans">Enter the invoice number this payment settles.</p>
                    </div>
                )}
            </div>
        );
    }

    // ========== IMEDA ==========
    if (unitId === 'imeda') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-normal uppercase tracking-wider text-gray-500 font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">
                    Context
                </h3>
                <div className="p-4 border border-dashed border-gray-200 dark:border-gray-700 text-center" style={{ borderRadius: '0.25rem' }}>
                    <p className="text-sm text-gray-500 font-sans">Seminar linkage coming soon</p>
                </div>
            </div>
        );
    }

    // ========== AFTECH ==========
    if (unitId === 'aftech') {
        return (
            <div className="space-y-4">
                <h3 className="text-sm font-normal uppercase tracking-wider text-gray-500 font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">
                    App Context
                </h3>
                <div>
                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">App *</label>
                    <select
                        value={formData.appSlug}
                        onChange={(e) => setFormData({ ...formData, appSlug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-500 outline-none font-sans"
                        style={{ borderRadius: '0.25rem' }}
                        required
                    >
                        <option value="">Select app...</option>
                        {AFTECH_APPS.map((app) => (
                            <option key={app.slug} value={app.slug}>{app.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    return null;
}
