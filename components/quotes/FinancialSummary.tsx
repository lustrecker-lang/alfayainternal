'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { QuoteSummary } from '@/types/quote';

interface FinancialSummaryProps {
    summary: QuoteSummary;
}

export default function FinancialSummary({ summary }: FinancialSummaryProps) {
    const formatCurrency = (amount: number): string => {
        return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const isPositiveMargin = summary.netProfit >= 0;

    return (
        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t-2 border-imeda shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Time Summary */}
                    <div className="text-center p-3 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Duration
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {summary.calendarDays} days · {summary.nights} nights
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {summary.workdays} workdays
                        </div>
                    </div>

                    {/* Stream A: Service Costs */}
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20" style={{ borderRadius: '0.25rem' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                            Service Costs
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(summary.serviceCosts)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Variable (Stream A)
                        </div>
                    </div>

                    {/* Stream B: Staff Costs */}
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20" style={{ borderRadius: '0.25rem' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                            Staff Costs
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(summary.totalStaffCosts)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Fixed (Stream B)
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20" style={{ borderRadius: '0.25rem' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">
                            Total Revenue
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Client Quote
                        </div>
                    </div>

                    {/* Net Margin */}
                    <div
                        className={`text-center p-3 ${isPositiveMargin
                            ? 'bg-imeda/10 border-2 border-imeda'
                            : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                            }`}
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Net Margin
                        </div>
                        <div className={`text-lg font-bold ${isPositiveMargin ? 'text-imeda' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(summary.netProfit)}
                        </div>
                        <div className={`text-xs font-medium mt-1 flex items-center justify-center gap-1 ${isPositiveMargin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isPositiveMargin ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {summary.profitMarginPercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Breakdown Details (Expandable in Future) */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                        <span className="text-gray-500 dark:text-gray-400">Service Revenue:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                        <span className="text-gray-500 dark:text-gray-400">Total Internal Cost:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(summary.totalInternalCost)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                        <span className="text-gray-500 dark:text-gray-400">Teacher + Coordinator:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(summary.teacherCosts + summary.coordinatorCosts)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
