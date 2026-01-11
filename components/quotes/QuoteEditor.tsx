'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GlobalSettings from './GlobalSettings';
import StaffingSection from './StaffingSection';
import SimpleServicesSection from './SimpleServicesSection';
import ShareQuoteModal from './ShareQuoteModal';
import { calculateQuoteSummary } from '@/lib/quoteCalculations';
import { saveQuote } from '@/lib/quotes';
import { getClients, type ClientFull } from '@/lib/finance';
import { getServices } from '@/lib/services';
import { getCampuses } from '@/lib/campuses';
import { showToast } from '@/lib/toast';
import type { Quote, QuoteService, QuoteState, Weekday, Teacher, Coordinator } from '@/types/quote';
import type { Campus, ImedaService } from '@/types/finance';

interface QuoteEditorProps {
    quote?: Quote | null;
    onClose?: () => void;
}

export default function QuoteEditor({ quote, onClose }: QuoteEditorProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [quoteId, setQuoteId] = useState<string | undefined>(quote?.id);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [allServices, setAllServices] = useState<ImedaService[]>([]);

    // Collapsible section states
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [staffingOpen, setStaffingOpen] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);

    // Share modal state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [previewCurrency, setPreviewCurrency] = useState<'AED' | 'USD' | 'EUR'>('AED');

    // Helper to convert activeWorkdays from Firestore (could be array or object)
    const parseActiveWorkdays = (workdays: unknown): Set<Weekday> => {
        if (!workdays) {
            return new Set<Weekday>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        }
        if (workdays instanceof Set) {
            return workdays;
        }
        if (Array.isArray(workdays)) {
            return new Set<Weekday>(workdays);
        }
        // Handle object like {0: "Monday", 1: "Tuesday", ...}
        if (typeof workdays === 'object') {
            return new Set<Weekday>(Object.values(workdays) as Weekday[]);
        }
        return new Set<Weekday>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    };

    // Helper to ensure array conversion from potential Firestore object
    const toArray = <T,>(data: T[] | Record<string, T> | undefined): T[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') return Object.values(data);
        return [];
    };

    // Quote state
    const [state, setState] = useState<QuoteState>({
        arrivalDate: quote?.arrivalDate || null,
        departureDate: quote?.departureDate || null,
        participantCount: quote?.participantCount || 2,
        activeWorkdays: parseActiveWorkdays(quote?.activeWorkdays),
        standardTeachingHours: quote?.standardTeachingHours || 6,
        teachers: toArray(quote?.teachers),
        coordinators: toArray(quote?.coordinators),
        services: toArray(quote?.services),
        manualSellingPricePerParticipant: quote?.manualSellingPricePerParticipant || 0,
        quoteName: quote?.quoteName || '',
        campusId: quote?.campusId,
        clientId: quote?.clientId || '',
        notes: quote?.notes,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [clientsData, campusesData, servicesData] = await Promise.all([
                getClients('imeda'),
                getCampuses(),
                getServices()
            ]);
            setClients(clientsData);
            setCampuses(campusesData);
            setAllServices(servicesData);

            // Initialize services if empty (New Quote)
            if (state.services.length === 0 && servicesData.length > 0) {
                // Determine initial campus ID (or first available) to set initial costs
                const initialCampusId = state.campusId || campusesData[0]?.id;

                const quoteServices: QuoteService[] = servicesData.map(s => {
                    // Calculate cost based on initial campus or fallback
                    let cost = 0;
                    if (initialCampusId && s.campusCosts?.[initialCampusId]) {
                        cost = s.campusCosts[initialCampusId];
                    } else {
                        cost = Object.values(s.campusCosts || {})[0] || 0;
                    }

                    return {
                        serviceId: s.id,
                        name: s.name,
                        description: s.description,
                        timeBasis: mapTimeUnit(s.timeUnit),
                        costPrice: cost,
                        enabled: s.type === 'Default Service',
                        isDefault: s.type === 'Default Service',
                        imageUrl: s.imageUrl,
                    };
                });

                setState(prev => ({ ...prev, services: quoteServices }));
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const mapTimeUnit = (timeUnit: string): QuoteService['timeBasis'] => {
        switch (timeUnit) {
            case 'Per Seminar': return 'OneOff';
            case 'Per Day': return 'PerDay';
            case 'Per Night': return 'PerNight';
            case 'Per Workday': return 'PerWorkday';
            default: return 'OneOff';
        }
    };

    const handleCampusChange = (newCampusId: string) => {
        const selectedCampus = campuses.find(c => c.id === newCampusId);

        // Update service prices based on new campus
        const updatedServices = state.services.map(service => {
            const definition = allServices.find(s => s.id === service.serviceId);
            if (!definition) return service;

            // Determine new cost
            let newCost = definition.campusCosts?.[newCampusId];
            if (newCost === undefined) {
                newCost = definition.campusCosts?.['default'];
            }
            if (newCost === undefined) {
                // Fallback to first available if specific campus cost missing
                newCost = Object.values(definition.campusCosts || {})[0] || 0;
            }

            return {
                ...service,
                costPrice: newCost
            };
        });

        setState(prev => ({
            ...prev,
            campusId: newCampusId,
            services: updatedServices
        }));

        if (newCampusId && selectedCampus) {
            showToast.success(`Service prices updated for ${selectedCampus.name}`);
        } else {
            setState(prev => ({ ...prev, campusId: newCampusId }));
        }
    };



    const summary = calculateQuoteSummary(state);

    const formatCurrency = (amount: number): string => {
        let value = amount;
        let currency = 'AED';

        if (previewCurrency === 'USD') {
            value = amount / 3.67;
            currency = 'USD';
        } else if (previewCurrency === 'EUR') {
            value = amount / 4.0;
            currency = 'EUR';
        }

        return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const handleSave = async () => {
        if (!state.arrivalDate || !state.departureDate) {
            showToast.error('Please select arrival and departure dates');
            return;
        }

        if (state.participantCount < 1) {
            showToast.error('Participant count must be at least 1');
            return;
        }

        try {
            setSaving(true);

            const quoteData = {
                unitId: 'imeda',
                quoteName: state.quoteName || 'Untitled Quote',
                arrivalDate: state.arrivalDate,
                departureDate: state.departureDate,
                participantCount: state.participantCount,
                activeWorkdays: Array.from(state.activeWorkdays),
                standardTeachingHours: state.standardTeachingHours,
                teachers: state.teachers,
                coordinators: state.coordinators,
                services: state.services,
                manualSellingPricePerParticipant: state.manualSellingPricePerParticipant,
                summary,
                campusId: state.campusId,
                clientId: state.clientId,
                notes: state.notes,
                status: (quote?.status || 'draft') as 'draft' | 'sent' | 'accepted' | 'rejected',
            };

            const savedId = await saveQuote(quoteData, quoteId);

            // Update quoteId so subsequent saves update the same quote
            if (!quoteId) {
                setQuoteId(savedId);
            }

            showToast.success(quoteId ? 'Quote updated' : 'Quote created');

            if (onClose) {
                onClose();
            }
            // Stay on page after saving - no redirect
        } catch (error) {
            console.error('Error saving quote:', error);
            showToast.error('Failed to save quote');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        if (onClose) {
            onClose();
        } else {
            router.push('/dashboard/imeda/quotes');
        }
    };

    const handleAddTeacher = (teacher: Teacher) => {
        setState({ ...state, teachers: [...state.teachers, teacher] });
    };

    const handleRemoveTeacher = (id: string) => {
        setState({ ...state, teachers: state.teachers.filter(t => t.id !== id) });
    };

    const handleUpdateTeacher = (id: string, updates: Partial<Teacher>) => {
        setState({
            ...state,
            teachers: state.teachers.map(t => (t.id === id ? { ...t, ...updates } : t)),
        });
    };

    const handleAddCoordinator = (coordinator: Coordinator) => {
        setState({ ...state, coordinators: [...state.coordinators, coordinator] });
    };

    const handleRemoveCoordinator = (id: string) => {
        setState({ ...state, coordinators: state.coordinators.filter(c => c.id !== id) });
    };

    const handleUpdateCoordinator = (id: string, updates: Partial<Coordinator>) => {
        setState({
            ...state,
            coordinators: state.coordinators.map(c => (c.id === id ? { ...c, ...updates } : c)),
        });
    };

    const isProfit = summary.netProfit >= 0;
    const isPriceSet = summary.manualSellingPricePerParticipant > 0;
    const selectedClient = clients.find(c => c.id === state.clientId);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header - Back | Title | Save */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handleBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                    {quote ? state.quoteName || 'Edit Quote' : 'New Quote'}
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShareModalOpen(true)}
                        disabled={!quoteId}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                        style={{ borderRadius: '0.25rem' }}
                        title={!quoteId ? 'Save quote first to share' : 'Share quote'}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-imeda text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Layout - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Input Sections */}
                <div className="lg:col-span-1 space-y-3">
                    <GlobalSettings
                        arrivalDate={state.arrivalDate}
                        departureDate={state.departureDate}
                        participantCount={state.participantCount}
                        activeWorkdays={state.activeWorkdays}
                        onArrivalDateChange={(date) => setState({ ...state, arrivalDate: date })}
                        onDepartureDateChange={(date) => setState({ ...state, departureDate: date })}
                        onParticipantCountChange={(count) => setState({ ...state, participantCount: count })}
                        onWorkdaysChange={(days) => setState({ ...state, activeWorkdays: days })}
                        isOpen={settingsOpen}
                        onToggle={() => setSettingsOpen(!settingsOpen)}
                        quoteName={state.quoteName || ''}
                        onQuoteNameChange={(name) => setState({ ...state, quoteName: name })}
                        clientId={state.clientId || ''}
                        onClientChange={(id) => setState({ ...state, clientId: id })}

                        clients={clients}
                        campusId={state.campusId}
                        onCampusChange={handleCampusChange}
                        campuses={campuses}
                    />

                    <StaffingSection
                        standardTeachingHours={state.standardTeachingHours}
                        teachers={state.teachers}
                        coordinators={state.coordinators}
                        onTeachingHoursChange={(hours) => setState({ ...state, standardTeachingHours: hours })}
                        onAddTeacher={handleAddTeacher}
                        onRemoveTeacher={handleRemoveTeacher}
                        onUpdateTeacher={handleUpdateTeacher}
                        onAddCoordinator={handleAddCoordinator}
                        onRemoveCoordinator={handleRemoveCoordinator}
                        onUpdateCoordinator={handleUpdateCoordinator}
                        activeWorkdaysCount={summary.workdays}
                        isOpen={staffingOpen}
                        onToggle={() => setStaffingOpen(!staffingOpen)}
                    />

                    <SimpleServicesSection
                        services={state.services}
                        onServicesChange={(services) => setState({ ...state, services })}
                        isOpen={servicesOpen}
                        onToggle={() => setServicesOpen(!servicesOpen)}
                        participantCount={state.participantCount}
                    />
                </div>

                {/* Right: Cost Breakdown + Pricing */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Pricing Bar - Compact */}
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-4" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">Total Cost</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalInternalCost)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-400">Per Head</div>
                                <div className="text-lg font-bold text-imeda">{formatCurrency(summary.costPerParticipant)}</div>
                            </div>
                            <div className="flex-1 min-w-[180px]">
                                <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Selling Price / Participant</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={state.manualSellingPricePerParticipant || ''}
                                    onChange={(e) => setState({ ...state, manualSellingPricePerParticipant: parseFloat(e.target.value) || 0 })}
                                    placeholder="Enter price..."
                                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm font-medium"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            {isPriceSet && (
                                <>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-400">Profit</div>
                                        <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(summary.netProfit)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-400">Margin</div>
                                        <div className={`text-lg font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                            {summary.profitMarginPercentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Cost Breakdown - Single Card */}
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-5" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cost Breakdown</h3>
                            <div className="flex bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-md p-0.5">
                                {['AED', 'USD', 'EUR'].map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => setPreviewCurrency(curr as any)}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-all ${previewCurrency === curr
                                            ? 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white font-bold shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {summary.serviceBreakdown.length === 0 && summary.staffBreakdown.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">Add services and staff</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Services */}
                                {summary.serviceBreakdown.length > 0 && (
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Services</div>
                                        <div className="space-y-1">
                                            {summary.serviceBreakdown.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                                    <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(item.cost)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Staffing */}
                                {summary.staffBreakdown.length > 0 && (
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Staffing</div>
                                        <div className="space-y-1">
                                            {summary.staffBreakdown.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                                    <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(item.cost)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Subtotal */}
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                    <span className="text-sm text-gray-500">Subtotal</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(summary.baseCost)}</span>
                                </div>

                                {/* Other Costs (after subtotal) */}
                                {summary.otherCostsBreakdown.length > 0 && (
                                    <div className="space-y-1">
                                        {summary.otherCostsBreakdown.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-500">{item.name}</span>
                                                <span className="text-gray-700 dark:text-gray-300">{formatCurrency(item.cost)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Total */}
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalInternalCost)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareQuoteModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                quoteId={quoteId || ''}
            />
        </div>
    );
}
