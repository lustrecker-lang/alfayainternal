'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Filter, ArrowUpRight, Building2, Plus } from 'lucide-react';
import DateRangePicker from '@/components/finance/DateRangePicker';
import TransactionDialog from '@/components/finance/TransactionDialog';
import { getTransactions, calculateSummary, exportLedgerToCSV, formatCurrency } from '@/lib/finance';
import { BUSINESS_UNITS } from '@/config/units';
import type { FinancialSummary } from '@/types/finance';
import Link from 'next/link';
import Image from 'next/image';

interface HQDashboardProps {
    initialUnitId?: string;
    lockUnitId?: boolean;
    appId?: string;
    title?: string;
    subtitle?: string;
}

export default function HQDashboard({
    initialUnitId = 'all',
    lockUnitId = false,
    appId,
    title = 'Al Faya Ventures',
    subtitle = 'Consolidated Financial Overview'
}: HQDashboardProps) {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false); // separate loading for summary updates
    const [isExporting, setIsExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId);

    // Load transactions and calculate summary
    const loadSummary = async () => {
        setIsLoading(true);
        try {
            const transactions = await getTransactions(
                startDate || undefined,
                endDate || undefined,
                selectedUnitId !== 'all' ? selectedUnitId : undefined,
                appId
            );
            const calculatedSummary = calculateSummary(transactions);
            setSummary(calculatedSummary);
        } catch (error) {
            console.error('Error loading summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load on mount and when filters change
    useEffect(() => {
        loadSummary();
    }, [startDate, endDate, selectedUnitId, appId]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportLedgerToCSV(
                startDate || undefined,
                endDate || undefined,
                selectedUnitId !== 'all' ? selectedUnitId : undefined,
                appId // No export support for appId yet in lib/finance, but we added it to signature? No we haven't updated signature of exportLedger yet.
            );
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export ledger. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-900">
                <div className="absolute inset-0 bg-[url('/covers/dashboard_cover.jpg')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-[url('/covers/dashboard_cover.jpg')] bg-cover bg-center opacity-20" />

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Finance Headquarters</p>
                            <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
                            <p className="text-slate-300">{subtitle}</p>
                        </div>

                        {/* Quick Stats in Hero */}
                        {!isLoading && summary && (
                            <div className="flex gap-6">
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Net Position</p>
                                    <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatCurrency(summary.netProfit, 'AED')}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters Card */}
                <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 p-6 mb-8" style={{ borderRadius: '0.25rem' }}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Date Range Picker */}
                        <div className="flex-1">
                            <DateRangePicker
                                startDate={startDate}
                                endDate={endDate}
                                onStartDateChange={setStartDate}
                                onEndDateChange={setEndDate}
                            />
                        </div>

                        {/* Unit Filter - Only show if not locked */}
                        {!lockUnitId && (
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedUnitId}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    <option value="all">All Business Units</option>
                                    {BUSINESS_UNITS.map((unit) => (
                                        <option key={unit.slug} value={unit.slug}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Add Transaction Button (Visible if filtered by unit) */}
                        {selectedUnitId !== 'all' && (
                            <TransactionDialog
                                triggerButton={
                                    <button
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-gray-900 hover:opacity-90 transition-all font-sans text-sm font-medium"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Transaction
                                    </button>
                                }
                                defaultUnit={selectedUnitId}
                                defaultAppSlug={appId}
                                onSuccess={loadSummary}
                                brandColor={selectedUnitId === 'aftech' ? 'aftech' : 'blue-600'}
                            />
                        )}

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            disabled={isExporting || isLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm font-medium"
                            style={{ borderRadius: '0.25rem' }}
                        >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
                            <span className="text-gray-500 font-sans">Loading financial data...</span>
                        </div>
                    </div>
                ) : summary ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Total Income */}
                            <div className="bg-white dark:bg-zinc-800 p-6" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30" style={{ borderRadius: '0.25rem' }}>
                                        <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                        +{summary.transactionCount} txns
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-sans">Total Income</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white font-sans">
                                    {formatCurrency(summary.totalIncome, 'AED')}
                                </p>
                            </div>

                            {/* Total Expenses */}
                            <div className="bg-white dark:bg-zinc-800 p-6" style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30" style={{ borderRadius: '0.25rem' }}>
                                        <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-sans">Total Expenses</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white font-sans">
                                    {formatCurrency(summary.totalExpenses, 'AED')}
                                </p>
                            </div>

                            {/* Net Profit */}
                            <div className={`bg-white dark:bg-zinc-800 p-6`} style={{ borderRadius: '0.25rem' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${summary.netProfit >= 0
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                        : 'bg-rose-100 dark:bg-rose-900/30'
                                        }`} style={{ borderRadius: '0.25rem' }}>
                                        <DollarSign className={`w-6 h-6 ${summary.netProfit >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-600 dark:text-rose-400'
                                            }`} />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${summary.netProfit >= 0
                                        ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                                        : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20'
                                        }`}>
                                        {summary.netProfit >= 0 ? 'Profitable' : 'Loss'}
                                    </span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-sans">Net Profit</h3>
                                <p className={`text-3xl font-bold font-sans ${summary.netProfit >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {formatCurrency(summary.netProfit, 'AED')}
                                </p>
                            </div>
                        </div>

                        {/* Business Units Breakdown */}
                        <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden mb-8" style={{ borderRadius: '0.25rem' }}>
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-700 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-sans">Business Unit Performance</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Financial breakdown by portfolio company</p>
                                </div>
                            </div>

                            <div className="p-6">
                                {Object.keys(summary.byUnit).length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 font-sans mb-2">No transactions recorded yet</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 font-sans">Start adding transactions from business unit dashboards</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(summary.byUnit).map(([unitId, data]) => {
                                            const unit = BUSINESS_UNITS.find(u => u.slug === unitId);
                                            const unitProfit = data.income - data.expenses;
                                            const profitPercent = data.income > 0 ? ((unitProfit / data.income) * 100).toFixed(0) : 0;

                                            return (
                                                <Link
                                                    key={unitId}
                                                    href={`/dashboard/${unitId}/finance`}
                                                    className="group block"
                                                >
                                                    <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-700 p-5 hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-md transition-all" style={{ borderRadius: '0.25rem' }}>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                {unit?.logo && (
                                                                    <div className="relative w-8 h-8">
                                                                        <Image
                                                                            src={unit.logo}
                                                                            alt={unit.name}
                                                                            fill
                                                                            className="object-contain dark:invert"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <h3 className="font-semibold text-gray-900 dark:text-white font-sans">
                                                                    {unit?.name || unitId}
                                                                </h3>
                                                            </div>
                                                            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-sans">Income</span>
                                                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 font-sans">
                                                                    {formatCurrency(data.income, 'AED')}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-sans">Expenses</span>
                                                                <span className="text-sm font-medium text-rose-600 dark:text-rose-400 font-sans">
                                                                    {formatCurrency(data.expenses, 'AED')}
                                                                </span>
                                                            </div>
                                                            <div className="pt-3 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-sans">Net</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-sm font-bold font-sans ${unitProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                                        }`}>
                                                                        {unitProfit >= 0 ? '+' : ''}{formatCurrency(unitProfit, 'AED')}
                                                                    </span>
                                                                    {data.income > 0 && (
                                                                        <span className={`text-xs px-1.5 py-0.5 rounded ${unitProfit >= 0
                                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                                            }`}>
                                                                            {profitPercent}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
                        <p className="text-amber-800 dark:text-amber-300 font-sans">Unable to load financial data. Please check your Firebase configuration.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
