'use client';

import { useState, useEffect } from 'react';
import { getTransactions, getClients, calculateSummary, formatCurrency } from '@/lib/finance';
import type { ClientFull } from '@/lib/finance';
import type { Transaction } from '@/types/finance';
import { TrendingUp, DollarSign, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface ClientProfitability {
    clientId: string;
    clientName: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
}

interface MonthlyData {
    month: string;
    income: number;
    expenses: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface ConsultantData {
    name: string;
    value: number;
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [clientProfitability, setClientProfitability] = useState<ClientProfitability[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
    const [earningsByConsultant, setEarningsByConsultant] = useState<ConsultantData[]>([]);
    const [timeRange, setTimeRange] = useState<'ALL' | 'YTD' | '12M'>('12M');

    useEffect(() => {
        loadData();
    }, [timeRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Determine date range
            let startDate: Date | undefined;
            const now = new Date();

            if (timeRange === 'YTD') {
                startDate = new Date(now.getFullYear(), 0, 1);
            } else if (timeRange === '12M') {
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            }

            // Fetch data
            const [transactions, clients] = await Promise.all([
                getTransactions(startDate, undefined, 'afconsult'),
                getClients('afconsult')
            ]);

            // 1. Process Client Profitability
            const profitabilityMap = new Map<string, ClientProfitability>();

            // Initialize with all clients
            clients.forEach(client => {
                profitabilityMap.set(client.id, {
                    clientId: client.id,
                    clientName: client.name,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    margin: 0
                });
            });

            // Aggregate transactions by client
            transactions.forEach(t => {
                // Try to find client ID in metadata, or fallback to name matching (legacy)
                const meta = t.metadata as any || {};
                let clientId = meta.client_id;

                // If not found, try to fuzzy match by name (optional, but good for data integrity)
                if (!clientId && meta.client_name) {
                    const found = clients.find(c => c.name === meta.client_name);
                    if (found) clientId = found.id;
                }

                if (clientId && profitabilityMap.has(clientId)) {
                    const stats = profitabilityMap.get(clientId)!;
                    const amount = t.amountInAED || 0;

                    if (t.type === 'INCOME') {
                        stats.revenue += amount;
                    } else {
                        stats.expenses += amount;
                    }
                    profitabilityMap.set(clientId, stats);
                }
            });

            // Calculate final metrics
            const profitabilityList: ClientProfitability[] = Array.from(profitabilityMap.values()).map(p => ({
                ...p,
                profit: p.revenue - p.expenses,
                margin: p.revenue > 0 ? ((p.revenue - p.expenses) / p.revenue) * 100 : 0
            })).sort((a, b) => b.profit - a.profit); // Sort by highest profit

            setClientProfitability(profitabilityList.filter(p => p.revenue > 0 || p.expenses > 0));


            // 2. Process Monthly Trends
            const monthMap = new Map<string, MonthlyData>();

            // Generate last 12 months keys to ensure continuity
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
                monthMap.set(key, { month: key, income: 0, expenses: 0 });
            }

            transactions.forEach(t => {
                const date = t.date instanceof Date ? t.date : new Date(t.date);
                const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });

                if (monthMap.has(key)) {
                    const data = monthMap.get(key)!;
                    const amount = t.amountInAED || 0;
                    if (t.type === 'INCOME') {
                        data.income += amount;
                    } else {
                        data.expenses += amount;
                    }
                }
            });

            setMonthlyData(Array.from(monthMap.values()));

            // 3. Process Expenses by Category
            const categoryMap = new Map<string, number>();
            transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
                const cat = t.category || 'Uncategorized';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + (t.amountInAED || 0));
            });
            setExpensesByCategory(
                Array.from(categoryMap.entries())
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
            );

            // 4. Process Earnings by Consultant
            const consultantMap = new Map<string, number>();
            transactions.filter(t => t.type === 'INCOME').forEach(t => {
                const meta = t.metadata as any || {};
                // Check metadata for consultant name, or fall back to 'Unassigned'
                const consultant = meta.consultant_name || meta.staff_name || 'Unassigned';
                consultantMap.set(consultant, (consultantMap.get(consultant) || 0) + (t.amountInAED || 0));
            });
            setEarningsByConsultant(
                Array.from(consultantMap.entries())
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
            );

        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate max value for chart scaling
    const maxChartValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)), 1000);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Analytics</h1>

                {/* Time Range Selector */}
                <div className="flex bg-white dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    {(['12M', 'YTD', 'ALL'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === range
                                ? 'bg-afconsult text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {range === '12M' ? 'Last 12 Months' : range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Financial Trends Chart */}
            {/* Grid Layout for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Financial Trends (Monthly) */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Financial Trends</h2>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading trends...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 p-3 rounded shadow-lg text-xs">
                                                        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-[#1e3a8a]"></div>
                                                                <span className="text-gray-500">Income:</span>
                                                                <span className="font-mono font-medium">{formatCurrency(payload[0].value as number)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                                <span className="text-gray-500">Expenses:</span>
                                                                <span className="font-mono font-medium">{formatCurrency(payload[1].value as number)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="income" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="expenses" fill="#F87171" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. Client Profitability Chart */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm lg:col-span-2" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profitability by Client</h2>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={clientProfitability.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="clientName" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} interval={0}
                                        tick={(props) => {
                                            const { x, y, payload } = props;
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <text x={0} y={0} dy={16} textAnchor="middle" fill="#6B7280" fontSize={10} transform="rotate(-15)">
                                                        {payload.value.length > 15 ? `${payload.value.substring(0, 12)}...` : payload.value}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} dx={-10} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 p-3 rounded shadow-lg text-xs">
                                                        <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
                                                        <div className="text-green-600 font-medium">Profit: {formatCurrency(data.profit)}</div>
                                                        <div className="text-gray-500 mt-1">Margin: {data.margin.toFixed(1)}%</div>
                                                        <div className="text-gray-400 text-[10px] mt-1">Rev: {formatCurrency(data.revenue)} | Exp: {formatCurrency(data.expenses)}</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 3. Expenses per Category */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Expenses by Category</h2>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={expensesByCategory.slice(0, 8)} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 p-2 rounded shadow text-xs">
                                                        <span className="font-medium text-gray-900 dark:text-white">{data.name}:</span>
                                                        <span className="ml-2 font-mono text-red-500">{formatCurrency(data.value)}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#F87171" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 4. Earnings per Consultant */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Earnings by Consultant</h2>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={earningsByConsultant} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 p-2 rounded shadow text-xs">
                                                        <span className="font-medium text-gray-900 dark:text-white">{data.name}:</span>
                                                        <span className="ml-2 font-mono text-afconsult">{formatCurrency(data.value)}</span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

            </div>

            {/* Client Profitability Table */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.25rem' }}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Client Profitability</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Client Name</th>
                                <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-right">Revenue</th>
                                <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-right">Expenses</th>
                                <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-right">Net Profit</th>
                                <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-right">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">Loading data...</td>
                                </tr>
                            ) : clientProfitability.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans">
                                        No financial data found for current period.
                                    </td>
                                </tr>
                            ) : (
                                clientProfitability.map((client) => (
                                    <tr key={client.clientId} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/afconsult/clients/${client.clientId}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-afconsult font-sans">
                                                {client.clientName}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-normal text-gray-900 dark:text-white font-mono text-right">
                                            {formatCurrency(client.revenue)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-normal text-red-500 font-mono text-right">
                                            {formatCurrency(client.expenses)}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-medium font-mono text-right ${client.profit >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(client.profit)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${client.margin >= 20 ? 'bg-green-100 text-green-800' :
                                                client.margin > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {client.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
