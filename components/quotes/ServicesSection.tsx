'use client';

import React, { useEffect, useState } from 'react';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';
import { getServices } from '@/lib/services';
import type { ImedaService } from '@/types/finance';
import type { QuoteService } from '@/types/quote';
import { StandardImage } from '@/components/ui/StandardImage';

interface ServicesSectionProps {
    services: QuoteService[];
    calendarDays: number;
    nights: number;
    workdays: number;
    participants: number;
    onServicesChange: (services: QuoteService[]) => void;
}

export default function ServicesSection({
    services,
    calendarDays,
    nights,
    workdays,
    participants,
    onServicesChange,
}: ServicesSectionProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const imedaServices = await getServices();

            // Initialize quote services from existing services if empty
            if (services.length === 0 && imedaServices.length > 0) {
                const quoteServices: QuoteService[] = imedaServices.map(s => ({
                    serviceId: s.id,
                    name: s.name,
                    description: s.description,
                    timeBasis: mapTimeUnit(s.timeUnit),
                    costPrice: Object.values(s.campusCosts || {})[0] || 0, // Use first campus cost as default
                    enabled: s.type === 'Default Service',
                    imageUrl: s.imageUrl,
                }));
                onServicesChange(quoteServices);
            }
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const mapTimeUnit = (timeUnit: string): QuoteService['timeBasis'] => {
        switch (timeUnit) {
            case 'Per Seminar':
                return 'OneOff';
            case 'Per Day':
                return 'PerDay';
            case 'Per Night':
                return 'PerNight';
            case 'Per Workday':
                return 'PerWorkday';
            default:
                return 'OneOff';
        }
    };

    const calculateMultiplier = (timeBasis: QuoteService['timeBasis']): number => {
        switch (timeBasis) {
            case 'OneOff':
                return 1;
            case 'PerDay':
                return calendarDays;
            case 'PerNight':
                return nights;
            case 'PerWorkday':
                return workdays;
        }
    };

    const calculateSubtotal = (service: QuoteService): number => {
        if (!service.enabled) return 0;
        return service.costPrice * calculateMultiplier(service.timeBasis) * participants;
    };

    const toggleService = (serviceId: string) => {
        onServicesChange(
            services.map(s =>
                s.serviceId === serviceId ? { ...s, enabled: !s.enabled } : s
            )
        );
    };

    const updateService = (serviceId: string, updates: Partial<QuoteService>) => {
        onServicesChange(
            services.map(s =>
                s.serviceId === serviceId ? { ...s, ...updates } : s
            )
        );
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6" style={{ borderRadius: '0.5rem' }}>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 space-y-6" style={{ borderRadius: '0.5rem' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-imeda" />
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Services (Variable Costs)</h2>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Per participant pricing
                </div>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700" style={{ borderRadius: '0.25rem' }}>
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No services available</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {services.map((service) => {
                        const costSubtotal = calculateSubtotal(service);

                        return (
                            <div
                                key={service.serviceId}
                                className={`p-4 border transition-all ${service.enabled
                                    ? 'border-imeda/50 bg-imeda/5 dark:bg-imeda/10'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900'
                                    }`}
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Image & Toggle */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={service.enabled}
                                            onChange={() => toggleService(service.serviceId)}
                                            className="w-5 h-5 text-imeda bg-gray-100 dark:bg-zinc-900 border-gray-300 dark:border-gray-700 focus:ring-imeda focus:ring-2"
                                        />
                                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                            <StandardImage
                                                src={service.imageUrl}
                                                alt={service.name}
                                                containerClassName="w-full h-full"
                                                fallbackIcon={<Layers className="w-5 h-5 text-gray-300" />}
                                            />
                                        </div>
                                    </div>

                                    {/* Service Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{service.description}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 rounded">
                                                {service.timeBasis.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                        </div>

                                        {/* Pricing Inputs */}
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                                                    Cost Price (AED)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={service.costPrice}
                                                    onChange={(e) => updateService(service.serviceId, { costPrice: parseFloat(e.target.value) || 0 })}
                                                    disabled={!service.enabled}
                                                    className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm disabled:opacity-50"
                                                    style={{ borderRadius: '0.25rem' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Subtotals */}
                                        {service.enabled && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    Total Cost: <span className="font-medium text-gray-900 dark:text-white">AED {costSubtotal.toFixed(2)}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
