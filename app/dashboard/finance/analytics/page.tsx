'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/finance';
import { getSeminars } from '@/lib/seminars';
import type { Transaction } from '@/types/finance';
import type { Seminar } from '@/types/seminar';
import {
    filterByTimePeriod,
    generateCumulativeTimeSeries,
    separateSeminarAndOperationalExpenses,
    calculateProfitabilityBySeminar,
    type TimePeriod,
    type TimeSeriesDataPoint,
    type CategoryBreakdown,
    type SeminarProfitability,
} from '@/lib/analytics';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/finance';

export default function FinancialAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('ytd');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [seminars, setSeminars] = useState<Seminar[]>([]);

    // Computed data
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
    const [seminarExpenses, setSeminarExpenses] = useState<CategoryBreakdown[]>([]);
    const [operationalExpenses, setOperationalExpenses] = useState<CategoryBreakdown[]>([]);
    const [profitabilityData, setProfitabilityData] = useState<SeminarProfitability[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            processData();
        }
    }, [transactions, timePeriod, seminars]);

    const loadData = async () => {
        try {
            const [txData, seminarData] = await Promise.all([
                getTransactions(),
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

        // Generate time series for cumulative charts
        const timeSeries = generateCumulativeTimeSeries(filtered);
        setTimeSeriesData(timeSeries);

        // Separate seminar vs operational expenses
        const { seminarExpenses: semExp, operationalExpenses: opExp } =
            separateSeminarAndOperationalExpenses(filtered);
        setSeminarExpenses(semExp);
        setOperationalExpenses(opExp);

        // Calculate profitability by seminar
        const profitability = calculateProfitabilityBySeminar(filtered, seminars);
        setProfitabilityData(profitability);
    };

    const currentData = timeSeriesData[timeSeriesData.length - 1] || { revenue: 0, expenses: 0, profit: 0 };

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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Comprehensive financial insights and performance metrics
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Revenue</h3>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(currentData.revenue)}</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Expenses</h3>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(currentData.expenses)}</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Net Profit</h3>
                        <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className={`text-3xl font-bold ${currentData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(currentData.profit)}
                    </p>
                </div>
            </div>

            {/* Cumulative Trends Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Cumulative Financial Trends
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#F3F4F6' }}
                            formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                        <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Profitability by Batch */}
            {profitabilityData.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Profitability by Seminar Batch
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={profitabilityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                                dataKey="seminarName"
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                            <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Expenses by Category - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seminar Expenses */}
                {seminarExpenses.length > 0 && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Seminar Expenses by Category
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={seminarExpenses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis
                                    type="number"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '11px' }}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                                />
                                <Bar dataKey="amount" fill="#8B5CF6" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Operational Expenses */}
                {operationalExpenses.length > 0 && (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Company Expenses by Category
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={operationalExpenses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis
                                    type="number"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '11px' }}
                                    width={120}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : 'N/A'}
                                />
                                <Bar dataKey="amount" fill="#F59E0B" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
