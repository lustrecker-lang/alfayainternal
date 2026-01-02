'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
import DateRangePicker from '@/components/finance/DateRangePicker';
import { getTransactions, calculateSummary, exportLedgerToCSV, formatCurrency } from '@/lib/finance';
import { BUSINESS_UNITS } from '@/config/units';
import type { FinancialSummary } from '@/types/finance';

export default function HQDashboard() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<string>('all');

    // Load transactions and calculate summary
    const loadSummary = async () => {
        setIsLoading(true);
        try {
            const transactions = await getTransactions(
                startDate || undefined,
                endDate || undefined,
                selectedUnitId !== 'all' ? selectedUnitId : undefined
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
    }, [startDate, endDate, selectedUnitId]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportLedgerToCSV(
                startDate || undefined,
                endDate || undefined,
                selectedUnitId !== 'all' ? selectedUnitId : undefined
            );
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export ledger. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Al Faya Ventures HQ</h1>
                <p className="text-gray-600 mt-2">Consolidated Financial Overview</p>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
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

                    {/* Unit Filter */}
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Units</option>
                            {BUSINESS_UNITS.map((unit) => (
                                <option key={unit.slug} value={unit.slug}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting || isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Download CSV'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Loading financial data...</div>
                </div>
            ) : summary ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Income */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Income</h3>
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-700">
                                {formatCurrency(summary.totalIncome, 'AED')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{summary.transactionCount} transactions</p>
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase">Total Expenses</h3>
                                <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-3xl font-bold text-red-700">
                                {formatCurrency(summary.totalExpenses, 'AED')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">From all units</p>
                        </div>

                        {/* Net Profit */}
                        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${summary.netProfit >= 0 ? 'border-blue-500' : 'border-orange-500'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-600 uppercase">Net Profit</h3>
                                <DollarSign className={`w-5 h-5 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'
                                    }`} />
                            </div>
                            <p className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'
                                }`}>
                                {formatCurrency(summary.netProfit, 'AED')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {summary.netProfit >= 0 ? 'Profitable' : 'Loss'}
                            </p>
                        </div>
                    </div>

                    {/* Breakdown by Unit */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Breakdown by Business Unit</h2>
                        </div>
                        <div className="p-6">
                            {Object.keys(summary.byUnit).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No transactions recorded yet. Start adding transactions from business unit dashboards.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(summary.byUnit).map(([unitId, data]) => {
                                        const unit = BUSINESS_UNITS.find(u => u.slug === unitId);
                                        const unitProfit = data.income - data.expenses;

                                        return (
                                            <div key={unitId} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 uppercase">
                                                        {unit?.name || unitId}
                                                    </h3>
                                                    <span className={`text-sm font-medium ${unitProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {unitProfit >= 0 ? '+' : ''}{formatCurrency(unitProfit, 'AED')}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Income:</span>
                                                        <span className="ml-2 font-semibold text-green-700">
                                                            {formatCurrency(data.income, 'AED')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Expenses:</span>
                                                        <span className="ml-2 font-semibold text-red-700">
                                                            {formatCurrency(data.expenses, 'AED')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800">Unable to load financial data. Please check your Firebase configuration.</p>
                </div>
            )}
        </div>
    );
}
