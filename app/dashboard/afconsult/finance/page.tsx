'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function FinancePage() {
    const [view, setView] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Unit Finance</h1>

                {/* Dropdown Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Transaction
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50" style={{ borderRadius: '0.25rem' }}>
                                <Link href="/dashboard/afconsult/finance/new?type=invoice" onClick={() => setShowDropdown(false)}>
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors flex items-center gap-2">
                                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                                        Log Invoice
                                    </div>
                                </Link>
                                <Link href="/dashboard/afconsult/finance/new?type=expense" onClick={() => setShowDropdown(false)}>
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors flex items-center gap-2">
                                        <ArrowDownLeft className="w-4 h-4 text-red-600" />
                                        Log Expense
                                    </div>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 w-full sm:w-auto max-w-md" style={{ borderRadius: '0.5rem' }}>
                <button
                    onClick={() => setView('INVOICES')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${view === 'INVOICES'
                            ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Invoices Issued
                </button>
                <button
                    onClick={() => setView('EXPENSES')}
                    className={`flex-1 py-2 text-sm font-normal font-sans transition-all ${view === 'EXPENSES'
                            ? 'bg-white dark:bg-zinc-700 text-afconsult shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    style={{ borderRadius: '0.25rem' }}
                >
                    Expenses Incurred
                </button>
            </div>

            {/* Summary Cards - Only 2 cards now */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <p className="text-xs font-normal text-gray-500 uppercase tracking-widest mb-1 font-sans">Total {view === 'INVOICES' ? 'Invoiced' : 'Expensed'}</p>
                    <p className="text-2xl font-normal text-gray-900 dark:text-white">AED 45,200.00</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <p className="text-xs font-normal text-gray-500 uppercase tracking-widest mb-1 font-sans">Past 30 Days</p>
                    <p className="text-2xl font-normal text-green-600">+AED 12,000.00</p>
                </div>
            </div>

            {/* List view */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-sm font-normal text-gray-600 dark:text-gray-400 uppercase tracking-tight font-sans">Recent {view === 'INVOICES' ? 'Invoices' : 'Expenses'}</h2>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[1, 2, 3].map((i) => (
                        <Link key={i} href={`/dashboard/afconsult/finance/${i}`}>
                            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    {/* Arrow icons without circular background */}
                                    {view === 'INVOICES' ? (
                                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ArrowDownLeft className="w-5 h-5 text-red-600" />
                                    )}
                                    <div>
                                        <p className="font-normal text-gray-900 dark:text-white font-sans">
                                            {view === 'INVOICES' ? `Invoice #2026-00${i}` : `Expense Reimb. #${i}`}
                                        </p>
                                        <p className="text-xs text-gray-500 font-sans">Global Industries • Jan 02, 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-normal text-gray-900 dark:text-white font-sans">AED 5,000.00</p>
                                    <button className="text-[10px] font-normal text-afconsult uppercase hover:underline font-sans">View Details</button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
