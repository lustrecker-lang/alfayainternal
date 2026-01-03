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
            const data = await getTransactions(undefined, undefined, 'afconsult');
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
                    defaultUnit="afconsult"
                    brandColor="afconsult"
                    onSuccess={loadTransactions}
                    triggerButton={
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
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
                        ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Income Received
                </button>
                <button
                    onClick={() => setView('EXPENSE')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${view === 'EXPENSE'
                        ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Expenses Incurred
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <p className="text-xs font-normal text-gray-500 uppercase tracking-widest mb-1 font-sans">
                        Total {view === 'INCOME' ? 'Income' : 'Expenses'}
                    </p>
                    <p className={`text-2xl font-normal ${view === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalAmount)}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <p className="text-xs font-normal text-gray-500 uppercase tracking-widest mb-1 font-sans">Past 30 Days</p>
                    <p className={`text-2xl font-normal ${view === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(recentAmount)}
                    </p>
                </div>
            </div>

            {/* List view */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                {/* Search Bar */}
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by vendor, category..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none font-sans"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                        <div className="px-6 py-8 text-center text-gray-500 font-sans text-sm">
                            Loading transactions...
                        </div>
                    ) : filteredTransactions.length > 0 ? (
                        filteredTransactions.map((t) => (
                            <div
                                key={t.id}
                                onClick={() => setSelectedTransaction(t)}
                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {t.type === 'INCOME' ? (
                                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ArrowDownLeft className="w-5 h-5 text-red-600" />
                                    )}
                                    <div>
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">
                                            {t.vendor || 'Unknown Vendor'}
                                        </p>
                                        <p className="text-xs text-gray-500 font-sans">
                                            {t.category} • {t.date instanceof Date ? t.date.toLocaleDateString() : new Date(t.date).toLocaleDateString()}
                                            {t.metadata && 'client_id' in t.metadata && ' • Client Linked'}
                                            {t.metadata && 'is_billable' in t.metadata && t.metadata.is_billable && ' • Billable'}
                                            {t.metadata && 'is_operational' in t.metadata && ' • Operational'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <p className={`text-sm font-normal font-sans ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(t.amountInAED || t.amount, 'AED')}
                                    </p>
                                    {t.proofUrl && (
                                        <a
                                            href={t.proofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-normal text-afconsult uppercase hover:underline font-sans"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FileDown className="w-3 h-3" />
                                            Proof
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500 font-sans text-sm">
                            {searchQuery ? `No results found for "${searchQuery}"` : `No ${view.toLowerCase()} transactions yet`}
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Detail Dialog */}
            <TransactionDetailDialog
                transaction={selectedTransaction}
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                onUpdate={loadTransactions}
                brandColor="afconsult"
            />
        </div>
    );
}
