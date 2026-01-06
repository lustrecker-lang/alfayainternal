'use client';

import { useDraggable } from '@dnd-kit/core';
import { FileText, Receipt } from 'lucide-react';
import type { Deal } from '@/types/deal';

interface DealCardProps {
    deal: Deal;
    onClick: () => void;
}

export default function DealCard({ deal, onClick }: DealCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: deal.id,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-move hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''
                }`}
        >
            {/* Deal Name */}
            <div className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                {deal.name}
            </div>

            {/* Client */}
            {deal.clientName && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {deal.clientName}
                </div>
            )}

            {/* Amount */}
            {deal.amount !== undefined && deal.amount > 0 && (
                <div className="text-sm font-bold text-imeda mb-2">
                    {formatCurrency(deal.amount)}
                </div>
            )}

            {/* Indicators */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
                {deal.quoteIds && deal.quoteIds.length > 0 && (
                    <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Quote</span>
                    </div>
                )}
                {deal.invoiceIds.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Receipt className="w-3 h-3" />
                        <span>{deal.invoiceIds.length}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
