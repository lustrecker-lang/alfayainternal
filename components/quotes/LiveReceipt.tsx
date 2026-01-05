'use client';

import React from 'react';
import type { QuoteSummary } from '@/types/quote';

interface LiveReceiptProps {
    summary: QuoteSummary;
}

export default function LiveReceipt({ summary }: LiveReceiptProps) {
    const formatCurrency = (amount: number): string => {
        return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 space-y-6 h-full overflow-y-auto" style={{ borderRadius: '0.5rem' }}>
            {/* Header - No icon */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Cost Breakdown</h2>
            </div>

            {/* Services Breakdown */}
            {summary.serviceBreakdown.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Services
                    </h3>
                    <div className="space-y-2">
                        {summary.serviceBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.cost)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal (Services)</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(summary.serviceCosts)}</span>
                    </div>
                </div>
            )}

            {/* Staff Breakdown */}
            {summary.staffBreakdown.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        Staffing
                    </h3>
                    <div className="space-y-2">
                        {summary.staffBreakdown.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.cost)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal (Staff)</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalStaffCosts)}</span>
                    </div>
                </div>
            )}

            {/* Total Internal Cost */}
            <div className="pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">Total Internal Cost</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalInternalCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Cost Per Participant</span>
                    <span className="text-base font-bold text-imeda">{formatCurrency(summary.costPerParticipant)}</span>
                </div>
            </div>

            {/* Empty State */}
            {summary.serviceBreakdown.length === 0 && summary.staffBreakdown.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add services and staff to see cost breakdown
                    </p>
                </div>
            )}
        </div>
    );
}
