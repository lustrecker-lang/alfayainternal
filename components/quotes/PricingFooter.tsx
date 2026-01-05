'use client';

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { QuoteSummary } from '@/types/quote';

interface PricingFooterProps {
    summary: QuoteSummary;
    onSellingPriceChange: (pricePerParticipant: number) => void;
}

export default function PricingFooter({ summary, onSellingPriceChange }: PricingFooterProps) {
    const formatCurrency = (amount: number): string => {
        return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const isProfit = summary.netProfit >= 0;
    const isPriceSet = summary.manualSellingPricePerParticipant > 0;
    const isPriceUnderCost = isPriceSet && summary.manualSellingPricePerParticipant < summary.costPerParticipant;

    return (
        <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t-2 border-imeda shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    {/* Total Cost */}
                    <div className="text-center md:text-left">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                            Total Cost
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(summary.totalInternalCost)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatCurrency(summary.costPerParticipant)} per participant
                        </div>
                    </div>

                    {/* Selling Price Input */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                            <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                            Selling Price Per Participant
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={summary.manualSellingPricePerParticipant || ''}
                                onChange={(e) => onSellingPriceChange(parseFloat(e.target.value) || 0)}
                                placeholder="Enter your selling price..."
                                className={`w-full px-4 py-3 text-lg font-bold bg-white dark:bg-zinc-900 border-2 focus:outline-none focus:ring-2 transition-all ${isPriceUnderCost
                                        ? 'border-red-500 focus:ring-red-500 text-red-600 dark:text-red-400'
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-imeda text-gray-900 dark:text-white'
                                    }`}
                                style={{ borderRadius: '0.5rem' }}
                            />
                            {isPriceUnderCost && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                            )}
                        </div>
                        {isPriceUnderCost && (
                            <div className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Warning: Selling price is below cost!
                            </div>
                        )}
                    </div>

                    {/* Profit Display */}
                    <div className={`text-center p-4 border-2 ${!isPriceSet
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900'
                            : isProfit
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        }`} style={{ borderRadius: '0.5rem' }}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                            {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            Net Profit
                        </div>
                        <div className={`text-2xl font-bold ${!isPriceSet
                                ? 'text-gray-400'
                                : isProfit
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                            {isPriceSet ? formatCurrency(summary.netProfit) : '—'}
                        </div>
                        <div className={`text-sm font-bold mt-1 ${!isPriceSet
                                ? 'text-gray-400'
                                : isProfit
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                            {isPriceSet ? `${summary.profitMarginPercentage.toFixed(1)}% margin` : 'Set price to calculate'}
                        </div>
                    </div>
                </div>

                {/* Revenue Summary */}
                {isPriceSet && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Total Revenue:</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400">Revenue Per Participant:</span>
                            <span className="font-bold text-imeda">{formatCurrency(summary.manualSellingPricePerParticipant)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
