'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import TransactionDialog from '@/components/finance/TransactionDialog';
import TransactionDetailDialog from '@/components/finance/TransactionDetailDialog';
import { getTransactions, formatCurrency } from '@/lib/finance';
import type { Transaction } from '@/types/finance';

interface UnitFinanceViewProps {
    unitId: string;
    appSlug?: string;
    brandColor?: string;
    title?: string;
}

export default function UnitFinanceView({
    unitId,
    appSlug,
    brandColor = 'blue-600',
    title = 'Unit Finance'
}: UnitFinanceViewProps) {
    const [view, setView] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            // Pass appSlug as the 4th argument (appId) to getTransactions
            const data = await getTransactions(undefined, undefined, unitId, appSlug);
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [unitId, appSlug]);

    // Filter by type and search
    const filteredTransactions = transactions.filter(t => {
        const matchesType = t.type === view;
        const matchesSearch = searchQuery === '' ||
            t.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    // Calculate totals
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amountInAED || 0), 0);
    const recentAmount = filteredTransactions
        .filter(t => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return t.date >= thirtyDaysAgo;
        })
        .reduce((sum, t) => sum + (t.amountInAED || 0), 0);

    // Dynamic styles based on brandColor
    // Note: We use inline styles or specific generic classes because dynamic Tailwind classes (bg-${color}) often fail if not purgable.
    // However, since we used them before, we'll try to map them or use consistent colors.
    // Ideally we pass the exact class users want or use a map.
    // For simplicity, I'll use the brandColor prop for text/bg where appropriate if it matches standard tailwind colors, 
    // or fallback to 'blue' if not handled. But TransactionDialog handles it.
    // Here we use generic colors for the UI (blue/green/red) usually, except for the primary button.

    // For the summary card background, IMEDA page used "bg-gradient-to-br from-imeda to-blue-600".
    // I can't easily replicate dynamic gradients without safelisting. 
    // I will use a conditional for 'imeda' and 'aftech' or generic.

    const getGradientClass = () => {
        if (unitId === 'imeda') return 'from-[#005eb8] to-blue-600'; // Approximate IMEDA blue
        if (unitId === 'aftech') return 'from-neutral-600 to-neutral-800'; // AFTech Grey
        return 'from-blue-600 to-blue-800';
    };

    // Button color class
    const getButtonClass = () => {
        if (unitId === 'imeda') return 'bg-[#005eb8]'; // custom-imeda
        if (unitId === 'aftech') return 'bg-[#737373]';
        return `bg-${brandColor}`;
    };

    const gradientClass = `bg-gradient-to-br ${getGradientClass()}`;
    const buttonClass = getButtonClass();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white font-sans">{title}</h1>

                {/* Transaction Dialog */}
                <TransactionDialog
                    defaultUnit={unitId}
                    defaultAppSlug={appSlug}
                    brandColor={brandColor}
                    onSuccess={loadTransactions}
                    triggerButton={
                        <button
                            className={`flex items-center gap-2 px-4 py-2 text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans ${buttonClass}`}
                            style={{ borderRadius: '0.25rem' }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    }
                />
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 w-full sm:w-auto max-w-md" style={{ borderRadius: '0.5rem' }}>
                <button
                    onClick={() => setView('INCOME')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all flex items-center justify-center gap-2 ${view === 'INCOME'
                        ? `bg-white dark:bg-zinc-700 shadow-sm ${unitId === 'aftech' ? 'text-neutral-700 dark:text-neutral-300' : 'text-blue-600'}`
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Income Received
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === 'INCOME' ? 'bg-gray-100 dark:bg-zinc-600' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                        {transactions.filter(t => t.type === 'INCOME').length}
                    </span>
                </button>
                <button
                    onClick={() => setView('EXPENSE')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all flex items-center justify-center gap-2 ${view === 'EXPENSE'
                        ? `bg-white dark:bg-zinc-700 shadow-sm ${unitId === 'aftech' ? 'text-neutral-700 dark:text-neutral-300' : 'text-blue-600'}`
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Expenses Incurred
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${view === 'EXPENSE' ? 'bg-gray-100 dark:bg-zinc-600' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                        {transactions.filter(t => t.type === 'EXPENSE').length}
                    </span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${gradientClass} text-white rounded-lg p-6 shadow-lg`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/80 text-sm font-medium font-sans mb-1">Total {view === 'INCOME' ? 'Income' : 'Expenses'}</p>
                            <h2 className="text-3xl font-bold font-mono">{formatCurrency(totalAmount)}</h2>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                            {view === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-white/80 font-sans">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs">All Time</span>
                        <span>Across all categories</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium font-sans mb-1">Last 30 Days</p>
                            <h2 className="text-3xl font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(recentAmount)}</h2>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-zinc-700 rounded-lg text-gray-400">
                            <Search className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-sans">
                        <span className="font-medium">Recent activity</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-sans"
                />
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">Vendor / Source</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">VAT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-sans">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-sans">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedTransaction(t)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">
                                            {new Date(t.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white font-sans">{t.vendor}</div>
                                            {t.description && (
                                                <div className="text-xs text-gray-400 max-w-[200px] truncate">{t.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {t.type === 'INCOME' ? '+' : ''} {formatCurrency(t.amountInAED)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-sans">
                                            {t.vatRate > 0 ? (
                                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                    {t.vatRate}%
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Detail Dialog */}
            <TransactionDetailDialog
                transaction={selectedTransaction}
                isOpen={!!selectedTransaction}
                onClose={() => {
                    setSelectedTransaction(null);
                    loadTransactions(); // Reload in case details changed via dialog actions
                }}
                onUpdate={loadTransactions}
            />
        </div>
    );
}
