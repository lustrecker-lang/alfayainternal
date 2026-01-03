'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, ChevronDown, FileDown, Search } from 'lucide-react';
import Link from 'next/link';

export default function FinancePage() {
    const [view, setView] = useState<'INVOICES' | 'EXPENSES'>('INVOICES');
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const invoices = [
        { id: 1, number: 'INV-2026-001', client: 'Global Industries', date: 'Jan 02, 2026', amount: 5000 },
        { id: 2, number: 'INV-2026-002', client: 'Tech Solutions', date: 'Jan 01, 2026', amount: 7500 },
        { id: 3, number: 'INV-2026-003', client: 'Green Energy Ltd', date: 'Dec 28, 2025', amount: 3200 },
    ];

    const filteredInvoices = invoices.filter(inv =>
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.date.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Summary Cards */}
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
                {/* Search Bar */}
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by invoice number, client name..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none font-sans"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((inv) => (
                            <Link key={inv.id} href={`/dashboard/afconsult/finance/${inv.id}`}>
                                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        {view === 'INVOICES' ? (
                                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                                        )}
                                        <div>
                                            <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{inv.number}</p>
                                            <p className="text-xs text-gray-500 font-sans">{inv.client} • {inv.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">AED {inv.amount.toLocaleString()}.00</p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                alert('PDF generation - would open PDF page');
                                            }}
                                            className="flex items-center gap-1 text-[10px] font-normal text-afconsult uppercase hover:underline font-sans"
                                        >
                                            <FileDown className="w-3 h-3" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500 font-sans text-sm">
                            No results found for &quot;{searchQuery}&quot;
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
