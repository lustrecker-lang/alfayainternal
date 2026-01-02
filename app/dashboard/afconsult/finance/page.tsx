'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';

export default function FinancePage() {
    const [view, setView] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Finance</h1>
                <Link href="/dashboard/afconsult/finance/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </button>
                </Link>
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-full sm:w-auto max-w-md">
                <button
                    onClick={() => setView('INVOICES')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === 'INVOICES'
                            ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Invoices Issued
                </button>
                <button
                    onClick={() => setView('EXPENSES')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${view === 'EXPENSES'
                            ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Expenses Incurred
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Total {view === 'INVOICES' ? 'Invoiced' : 'Expensed'}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-serif italic">AED 45,200.00</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Past 30 Days</p>
                    <p className="text-2xl font-bold text-green-600 font-serif">+AED 12,000.00</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Pending Approval</p>
                    <p className="text-2xl font-bold text-afconsult font-serif italic">AED 3,400.00</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 font-sans">Status</p>
                    <p className="text-2xl font-bold text-blue-600 font-serif">On Track</p>
                </div>
            </div>

            {/* List view */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight font-sans">Recent {view === 'INVOICES' ? 'Invoices' : 'Expenses'}</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${view === 'INVOICES' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {view === 'INVOICES' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {view === 'INVOICES' ? `Invoice #2026-00${i}` : `Expense Reimb. #${i}`}
                                    </p>
                                    <p className="text-xs text-gray-500">Global Industries • Jan 02, 2026</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white font-serif italic">AED 5,000.00</p>
                                <button className="text-[10px] font-bold text-afconsult uppercase hover:underline">Download PDF</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
