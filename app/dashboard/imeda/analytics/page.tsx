'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { getTransactions } from '@/lib/finance';
import { getSeminars } from '@/lib/seminars';
import type { Transaction } from '@/types/finance';
import type { Seminar } from '@/types/seminar';
import {
    filterByTimePeriod,
    generateTimeAggregatedSeries,
    separateSeminarAndOperationalExpenses,
    calculateProfitabilityBySeminar,
    type TimePeriod,
    type TimeGranularity,
    type TimeSeriesDataPoint,
    type CategoryBreakdown,
    type SeminarProfitability,
} from '@/lib/analytics';
import { startOfDay } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/finance';

// IMEDA Brand Colors with dark mode variants for better contrast
const IMEDA_COLORS = {
    light: {
        olive: '#687A51',      // Olive Green
        wine: '#4D1E2D',       // Wine Red
        gold: '#EAAE4E',       // Gold
        orange: '#AC8E68',     // Orange
    },
    dark: {
        olive: '#8FA871',      // Lighter Olive Green for dark mode
        wine: '#A85568',       // Lighter Wine Red for dark mode (much better contrast)
        gold: '#F5C77A',       // Lighter Gold
        orange: '#C9A883',     // Lighter Orange
    }
};

export default function ImedaAnalyticsPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const colors = isDark ? IMEDA_COLORS.dark : IMEDA_COLORS.light;

    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('all'); // Default to All Time
    const [granularity, setGranularity] = useState<TimeGranularity>('monthly');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [seminars, setSeminars] = useState<Seminar[]>([]);

    // Computed data
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
    const [seminarExpenses, setSeminarExpenses] = useState<CategoryBreakdown[]>([]);
    const [operationalExpenses, setOperationalExpenses] = useState<CategoryBreakdown[]>([]);
    const [profitabilityData, setProfitabilityData] = useState<SeminarProfitability[]>([]);

    // Business started Jan 2025
    const BUSINESS_START_DATE = startOfDay(new Date(2025, 0, 1));

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            processData();
        }
    }, [transactions, timePeriod, granularity, seminars]);

    const loadData = async () => {
        try {
            const [txData, seminarData] = await Promise.all([
                getTransactions(BUSINESS_START_DATE, undefined, 'imeda'),
                getSeminars('imeda'),
            ]);
            setTransactions(txData);
            setSeminars(seminarData);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = () => {
        const filtered = filterByTimePeriod(transactions, timePeriod);

        // Determine date range based on time period
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        if (timePeriod === 'all') {
            startDate = BUSINESS_START_DATE;
        } else if (timePeriod === 'ytd') {
            startDate = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
        } else {
            // MTD
            startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of current month
        }

        const timeSeries = generateTimeAggregatedSeries(filtered, granularity, startDate, endDate);
        setTimeSeriesData(timeSeries);

        const { seminarExpenses: semExp, operationalExpenses: opExp } =
            separateSeminarAndOperationalExpenses(filtered);
        setSeminarExpenses(semExp);
        setOperationalExpenses(opExp);

        const profitability = calculateProfitabilityBySeminar(filtered, seminars);
        setProfitabilityData(profitability);
    };

    const currentData = timeSeriesData[timeSeriesData.length - 1] || { revenue: 0, expenses: 0, profit: 0 };

    // Calculate max profit for bar scaling
    const maxProfit = Math.max(...profitabilityData.map(s => Math.abs(s.profit)), 1);

    // Calculate total participants from seminars
    const totalParticipants = seminars.reduce((sum, s) => sum + (s.participants?.length || 0), 0);

    // Calculate KPIs
    const profitMargin = currentData.revenue > 0
        ? (currentData.profit / currentData.revenue) * 100
        : 0;

    const revenuePerParticipant = totalParticipants > 0
        ? currentData.revenue / totalParticipants
        : 0;

    // Separate seminar-linked expenses from operational
    const totalSeminarExpenses = seminarExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOperationalExpenses = operationalExpenses.reduce((sum, e) => sum + e.amount, 0);

    const seminarCostPerParticipant = totalParticipants > 0
        ? totalSeminarExpenses / totalParticipants
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">IMEDA Financial Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Performance metrics and insights for IMEDA
                    </p>
                </div>

                {/* Time Period Selector */}
                <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                    {(['all', 'ytd', 'mtd'] as TimePeriod[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${timePeriod === period
                                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {period === 'all' ? 'All Time' : period === 'ytd' ? 'Year to Date' : 'Month to Date'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards - Row 1: Core Financials */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold" style={{ color: colors.olive }}>{formatCurrency(currentData.revenue)}</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Expenses</h3>
                    <p className="text-3xl font-bold" style={{ color: colors.wine }}>{formatCurrency(currentData.expenses)}</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Net Profit</h3>
                    <p className="text-3xl font-bold" style={{ color: currentData.profit >= 0 ? colors.olive : colors.wine }}>
                        {formatCurrency(currentData.profit)}
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Profit Margin</h3>
                    <p className="text-3xl font-bold" style={{ color: profitMargin >= 0 ? colors.olive : colors.wine }}>
                        {profitMargin.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* KPI Cards - Row 2: Per Participant Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Revenue per Participant</h3>
                    <p className="text-2xl font-bold" style={{ color: colors.olive }}>{formatCurrency(revenuePerParticipant)}</p>
                    <p className="text-xs text-gray-500 mt-1">{totalParticipants} participants total</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Seminar Cost per Participant</h3>
                    <p className="text-2xl font-bold" style={{ color: colors.wine }}>{formatCurrency(seminarCostPerParticipant)}</p>
                    <p className="text-xs text-gray-500 mt-1">Direct seminar expenses only</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Cost per Participant</h3>
                    <p className="text-2xl font-bold" style={{ color: colors.wine }}>
                        {formatCurrency(totalParticipants > 0 ? currentData.expenses / totalParticipants : 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Including operational overhead</p>
                </div>
            </div>

            {/* Cumulative Trends Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cumulative Financial Trends</h2>
                    <div className="flex bg-gray-100 dark:bg-zinc-700 rounded-lg p-1">
                        {(['daily', 'weekly', 'monthly'] as TimeGranularity[]).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${granularity === g
                                    ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                            labelStyle={{ color: '#111827', fontWeight: 600 }}
                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke={colors.olive} strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="expenses" stroke={colors.wine} strokeWidth={2} name="Expenses" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Profitability by Seminar - Table with Visual Bars */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profitability by Seminar</h2>
                {profitabilityData.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No seminar-linked transactions found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Seminar</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Revenue</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Expenses</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Profit</th>
                                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Margin</th>
                                    <th className="py-3 px-2 text-sm font-semibold text-gray-600 dark:text-gray-400 w-48"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {profitabilityData.map((seminar, idx) => {
                                    const margin = seminar.revenue > 0 ? (seminar.profit / seminar.revenue) * 100 : 0;
                                    return (
                                        <tr key={seminar.seminarId} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-zinc-900/30' : ''}>
                                            <td className="py-3 px-2 text-sm text-gray-900 dark:text-white font-medium">{seminar.seminarName}</td>
                                            <td className="py-3 px-2 text-sm text-right" style={{ color: colors.olive }}>{formatCurrency(seminar.revenue)}</td>
                                            <td className="py-3 px-2 text-sm text-right" style={{ color: colors.wine }}>{formatCurrency(seminar.expenses)}</td>
                                            <td className="py-3 px-2 text-sm text-right font-semibold" style={{ color: seminar.profit >= 0 ? colors.olive : colors.wine }}>
                                                {formatCurrency(seminar.profit)}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-right font-semibold" style={{ color: margin >= 0 ? colors.olive : colors.wine }}>
                                                {margin.toFixed(1)}%
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="relative h-4 bg-gray-100 dark:bg-zinc-700 rounded overflow-hidden">
                                                    {/* Center line */}
                                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
                                                    {/* Profit bar */}
                                                    <div
                                                        className={`absolute top-0 bottom-0 ${seminar.profit >= 0 ? 'left-1/2' : 'right-1/2'}`}
                                                        style={{
                                                            width: `${Math.min((Math.abs(seminar.profit) / maxProfit) * 50, 50)}%`,
                                                            backgroundColor: seminar.profit >= 0 ? colors.olive : colors.wine,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Expenses by Category - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seminar Expenses */}
                {seminarExpenses.length > 0 && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seminar Expenses by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={seminarExpenses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                <YAxis type="category" dataKey="category" stroke="#9CA3AF" style={{ fontSize: '11px' }} width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                                />
                                <Bar dataKey="amount" fill={colors.gold} name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Operational Expenses */}
                {operationalExpenses.length > 0 && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Expenses by Category</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={operationalExpenses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                                <YAxis type="category" dataKey="category" stroke="#9CA3AF" style={{ fontSize: '11px' }} width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                                />
                                <Bar dataKey="amount" fill={colors.orange} name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
