'use client';

import React from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import type { QuoteService } from '@/types/quote';

interface SimpleServicesSectionProps {
    services: QuoteService[];
    onServicesChange: (services: QuoteService[]) => void;
    isOpen: boolean;
    onToggle: () => void;
    participantCount: number;
}

export default function SimpleServicesSection({
    services,
    onServicesChange,
    isOpen,
    onToggle,
    participantCount,
}: SimpleServicesSectionProps) {

    const toggleService = (serviceId: string) => {
        onServicesChange(
            services.map(s => {
                if (s.serviceId === serviceId) {
                    const newEnabled = !s.enabled;
                    return {
                        ...s,
                        enabled: newEnabled,
                        // Set default participant override to full count when enabling optional service
                        participantOverride: !s.isDefault && newEnabled ? participantCount : undefined,
                    };
                }
                return s;
            })
        );
    };

    const updateParticipantOverride = (serviceId: string, count: number) => {
        onServicesChange(
            services.map(s =>
                s.serviceId === serviceId ? { ...s, participantOverride: count } : s
            )
        );
    };

    // Helper to ensure array (Firestore might store as object)
    const toArray = (data: QuoteService[] | Record<string, QuoteService> | undefined): QuoteService[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') return Object.values(data);
        return [];
    };

    const servicesArray = toArray(services);

    // Separate default and optional services
    const defaultServices = servicesArray.filter(s => s.isDefault);
    const optionalServices = servicesArray.filter(s => !s.isDefault);

    return (
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800" style={{ borderRadius: '0.5rem' }}>
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                style={{ borderRadius: '0.5rem' }}
            >
                <span className="text-sm font-medium text-gray-900 dark:text-white">Services</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-4 pb-4">
                    {services.length === 0 ? (
                        <div className="text-xs text-gray-400 py-2">No services available</div>
                    ) : (
                        <div className="space-y-1">
                            {/* Default Services */}
                            {defaultServices.length > 0 && (
                                <>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Default</div>
                                    {defaultServices.map((service) => (
                                        <button
                                            key={service.serviceId}
                                            onClick={() => toggleService(service.serviceId)}
                                            className={`w-full flex items-center justify-between p-2 text-left transition-all ${service.enabled
                                                ? 'bg-imeda/10 text-gray-900 dark:text-white'
                                                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                                }`}
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <span className="text-sm">{service.name}</span>
                                            <div className={`w-8 h-4 rounded-full transition-colors ${service.enabled ? 'bg-imeda' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform mt-0.5 ${service.enabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Optional Services */}
                            {optionalServices.length > 0 && (
                                <>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1 mt-3">Optional</div>
                                    {optionalServices.map((service) => {
                                        const overrideCount = service.participantOverride ?? participantCount;
                                        const isOverMax = overrideCount > participantCount;

                                        return (
                                            <div key={service.serviceId}>
                                                <button
                                                    onClick={() => toggleService(service.serviceId)}
                                                    className={`w-full flex items-center justify-between p-2 text-left transition-all ${service.enabled
                                                        ? 'bg-imeda/10 text-gray-900 dark:text-white'
                                                        : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                                        }`}
                                                    style={{ borderRadius: service.enabled ? '0.25rem 0.25rem 0 0' : '0.25rem' }}
                                                >
                                                    <span className="text-sm">{service.name}</span>
                                                    <div className={`w-8 h-4 rounded-full transition-colors ${service.enabled ? 'bg-imeda' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform mt-0.5 ${service.enabled ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
                                                    </div>
                                                </button>

                                                {/* Participant count input for enabled optional services */}
                                                {service.enabled && (
                                                    <div
                                                        className={`flex items-center gap-2 px-2 py-2 bg-gray-50 dark:bg-zinc-900 border-x border-b ${isOverMax ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                        style={{ borderRadius: '0 0 0.25rem 0.25rem' }}
                                                    >
                                                        <span className="text-xs text-gray-500">Participants:</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={participantCount}
                                                            value={overrideCount}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                updateParticipantOverride(service.serviceId, parseInt(e.target.value) || 1);
                                                            }}
                                                            className={`w-16 px-2 py-1 text-xs text-center border focus:outline-none focus:ring-1 ${isOverMax
                                                                ? 'border-red-400 bg-red-50 dark:bg-red-900/20 focus:ring-red-400'
                                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 focus:ring-imeda'
                                                                }`}
                                                            style={{ borderRadius: '0.25rem' }}
                                                        />
                                                        <span className="text-xs text-gray-400">/ {participantCount}</span>
                                                        {isOverMax && (
                                                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
