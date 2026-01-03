'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, FileDown, Search } from 'lucide-react';
import Link from 'next/link';
import TransactionDialog from '@/components/finance/TransactionDialog';
import TransactionDetailDialog from '@/components/finance/TransactionDetailDialog';
import { getTransactions, formatCurrency } from '@/lib/finance';
import type { Transaction } from '@/types/finance';

export default function FinancePage() {
    const [view, setView] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [searchQuery, setSearchQuery] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const data = await getTransactions(undefined, undefined, 'imeda');
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, []);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Unit Finance</h1>

                {/* Transaction Dialog */}
                <TransactionDialog
                    defaultUnit="imeda"
                    brandColor="imeda"
                    onSuccess={loadTransactions}
                    triggerButton={
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
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
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${view === 'INCOME'
                        ? 'bg-white dark:bg-zinc-700 text-imeda shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Income Received
                </button>
                <button
                    onClick={() => setView('EXPENSE')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${view === 'EXPENSE'
                        ? 'bg-white dark:bg-zinc-700 text-imeda shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Expenses Incurred
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-imeda to-blue-600 text-white rounded-lg p-6 shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium font-sans mb-1">Total {view === 'INCOME' ? 'Income' : 'Expenses'}</p>
                            <h2 className="text-3xl font-bold font-mono">{formatCurrency(totalAmount)}</h2>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                            {view === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 font-sans">
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
                        <span className="text-imeda font-medium">Recent activity</span>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-imeda focus:border-transparent outline-none font-sans"
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
                    loadTransactions();
                }}
                onUpdate={loadTransactions}
            />
        </div>
    );
}
