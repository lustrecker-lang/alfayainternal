'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
}

export default function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: DateRangePickerProps) {
    const formatDateForInput = (date: Date | null) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onStartDateChange(value ? new Date(value) : null);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onEndDateChange(value ? new Date(value) : null);
    };

    return (
        <div className="flex items-center gap-3">
            <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={handleStartChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            <span className="text-gray-400">—</span>

            <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={handleEndChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {(startDate || endDate) && (
                <button
                    onClick={() => {
                        onStartDateChange(null);
                        onEndDateChange(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Clear
                </button>
            )}
        </div>
    );
}
