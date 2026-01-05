'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Weekday } from '@/types/quote';
import type { ClientFull } from '@/lib/finance';

interface GlobalSettingsProps {
    arrivalDate: Date | null;
    departureDate: Date | null;
    participantCount: number;
    activeWorkdays: Set<Weekday>;
    onArrivalDateChange: (date: Date | null) => void;
    onDepartureDateChange: (date: Date | null) => void;
    onParticipantCountChange: (count: number) => void;
    onWorkdaysChange: (days: Set<Weekday>) => void;
    isOpen: boolean;
    onToggle: () => void;
    // New props
    quoteName: string;
    onQuoteNameChange: (name: string) => void;
    clientId: string;
    onClientChange: (id: string) => void;
    clients: ClientFull[];
}

const WEEKDAYS: { day: Weekday; letter: string }[] = [
    { day: 'Monday', letter: 'M' },
    { day: 'Tuesday', letter: 'T' },
    { day: 'Wednesday', letter: 'W' },
    { day: 'Thursday', letter: 'T' },
    { day: 'Friday', letter: 'F' },
    { day: 'Saturday', letter: 'S' },
    { day: 'Sunday', letter: 'S' },
];

export default function GlobalSettings({
    arrivalDate,
    departureDate,
    participantCount,
    activeWorkdays,
    onArrivalDateChange,
    onDepartureDateChange,
    onParticipantCountChange,
    onWorkdaysChange,
    isOpen,
    onToggle,
    quoteName,
    onQuoteNameChange,
    clientId,
    onClientChange,
    clients,
}: GlobalSettingsProps) {
    const handleWorkdayToggle = (day: Weekday) => {
        const newSet = new Set(activeWorkdays);
        if (newSet.has(day)) {
            newSet.delete(day);
        } else {
            newSet.add(day);
        }
        onWorkdaysChange(newSet);
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const parseDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        return new Date(dateString);
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800" style={{ borderRadius: '0.5rem' }}>
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                style={{ borderRadius: '0.5rem' }}
            >
                <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Client Dropdown */}
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Client
                        </label>
                        <select
                            value={clientId}
                            onChange={(e) => onClientChange(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                            style={{ borderRadius: '0.25rem' }}
                        >
                            <option value="">Select client...</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quote Name (Optional) */}
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Quote Name <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={quoteName}
                            onChange={(e) => onQuoteNameChange(e.target.value)}
                            placeholder="e.g., Spring Seminar 2026"
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Arrival
                            </label>
                            <input
                                type="date"
                                value={formatDate(arrivalDate)}
                                onChange={(e) => onArrivalDateChange(parseDate(e.target.value))}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Departure
                            </label>
                            <input
                                type="date"
                                value={formatDate(departureDate)}
                                onChange={(e) => onDepartureDateChange(parseDate(e.target.value))}
                                min={formatDate(arrivalDate)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Participants
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={participantCount}
                            onChange={(e) => onParticipantCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>

                    {/* Active Workdays - Single Letters */}
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Active Workdays
                        </label>
                        <div className="flex gap-1">
                            {WEEKDAYS.map(({ day, letter }, index) => {
                                const isActive = activeWorkdays.has(day);
                                return (
                                    <button
                                        key={`${day}-${index}`}
                                        onClick={() => handleWorkdayToggle(day)}
                                        className={`w-8 h-8 text-xs font-medium transition-all ${isActive
                                            ? 'bg-imeda text-white'
                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600'
                                            }`}
                                        style={{ borderRadius: '0.25rem' }}
                                        title={day}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
