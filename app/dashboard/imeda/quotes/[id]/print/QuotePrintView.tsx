'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getQuote } from '@/lib/quotes';
import { getClients, type ClientFull } from '@/lib/finance';
import { getCompanyProfile } from '@/lib/settings';
import type { Quote } from '@/types/quote';
import type { CompanyProfile } from '@/types/settings';
import { useBrandTheme } from '@/hooks/useBrandTheme';
import { getServices } from '@/lib/services';
import { getCampuses } from '@/lib/campuses';
import type { ImedaService, Campus } from '@/types/finance';
import Image from 'next/image';

// Translations
const translations = {
    en: {
        quotation: 'QUOTATION',
        includedServices: 'Included Services',
        noServicesSelected: 'No services selected',
        clientDetails: 'Client Details',
        company: 'Company',
        contact: 'Contact',
        seminarDetails: 'Seminar Details',
        domain: 'Domain',
        courseId: 'Course ID',
        course: 'Course',
        programDetails: 'Program Details',
        campus: 'Campus',
        arrival: 'Arrival',
        departure: 'Departure',
        duration: 'Duration',
        days: 'days',
        participants: 'Participants',
        teachingHours: 'Teaching Hours',
        total: 'total',
        pax: 'pax',
        pricePerPerson: 'Price per person',
        thankYou: 'Thank you for considering IMEDA',
        license: 'License',
        euroConversionWarning: 'For payments in Euro, our bank charges an extra 3% conversion fee on top of the final price.',
        conversionFee: 'Bank Conversion Fee (3%)',
        totalWithFee: 'Total incl. Fee',
        alsoAvailableIn: 'Also available in:',
    },
    fr: {
        quotation: 'DEVIS',
        includedServices: 'Services Inclus',
        noServicesSelected: 'Aucun service sélectionné',
        clientDetails: 'Coordonnées Client',
        company: 'Société',
        contact: 'Contact',
        seminarDetails: 'Détails du Séminaire',
        domain: 'Domaine',
        courseId: 'ID Formation',
        course: 'Formation',
        programDetails: 'Détails du Programme',
        campus: 'Campus',
        arrival: 'Arrivée',
        departure: 'Départ',
        duration: 'Durée',
        days: 'jours',
        participants: 'Participants',
        teachingHours: 'Heures de Formation',
        total: 'total',
        pax: 'pers.',
        pricePerPerson: 'Prix par personne',
        thankYou: 'Merci de considérer IMEDA',
        license: 'Licence',
        euroConversionWarning: 'Pour les paiements en Euro, notre banque applique des frais de conversion de 3% en sus du prix final.',
        conversionFee: 'Frais de conversion bancaire (3%)',
        totalWithFee: 'Total frais inclus',
        alsoAvailableIn: 'Également disponible en :',
    }
};

export default function QuotePrintView() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [allServices, setAllServices] = useState<ImedaService[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Read URL params
    const lang = (searchParams.get('lang') || 'fr') as 'en' | 'fr';
    const t = translations[lang];
    const courseName = searchParams.get('course') || '';
    const courseDomain = searchParams.get('domain') || '';
    const courseId = searchParams.get('courseId') || '';
    const currency = searchParams.get('currency') || 'AED';
    const conversionRate = parseFloat(searchParams.get('rate') || '1');
    const clientContact = searchParams.get('contact') || '';

    // Theme Hook
    const { brand, loading: brandLoading } = useBrandTheme('imeda');
    const brandColor = brand?.brand_color_primary || '#000000';

    useEffect(() => {
        if (params.id) {
            loadData(params.id as string);
        }
    }, [params.id]);

    // Set document title for PDF filename (must be before early returns)
    useEffect(() => {
        const selectedClient = clients.find(c => c.id === quote?.clientId);
        const clientNameForTitle = selectedClient?.name || '';
        const parts = [];
        if (courseName) parts.push(courseName);
        if (clientNameForTitle) parts.push(clientNameForTitle);
        if (parts.length > 0) {
            document.title = parts.join(' - ');
        } else {
            document.title = 'Quote';
        }
    }, [courseName, clients, quote?.clientId]);

    const loadData = async (id: string) => {
        setLoading(true);
        try {
            const [quoteData, servicesData, campusesData, clientsData, companyData] = await Promise.all([
                getQuote(id),
                getServices(),
                getCampuses(),
                getClients('imeda'),
                getCompanyProfile()
            ]);
            setQuote(quoteData);
            setAllServices(servicesData);
            setCampuses(campusesData);
            setClients(clientsData);
            setCompanyProfile(companyData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500">Loading quote...</div>;
    if (!quote) return <div className="text-center py-12 text-red-500">Quote not found.</div>;

    const logoSrc = brand?.logo_squared_url || brand?.logo_url;

    // Get client name
    const selectedClient = clients.find(c => c.id === quote.clientId);
    const clientName = selectedClient?.name || 'Not specified';

    // Get campus name
    const selectedCampus = campuses.find(c => c.id === quote.campusId);
    const campusName = selectedCampus?.name || 'Not specified';

    // Calculate durations
    const arrivalDate = quote.arrivalDate ? new Date(quote.arrivalDate) : null;
    const departureDate = quote.departureDate ? new Date(quote.departureDate) : null;

    let calendarDays = 0;

    if (arrivalDate && departureDate) {
        const diffTime = departureDate.getTime() - arrivalDate.getTime();
        calendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculate total workdays and teaching hours
    const activeWorkdaysSet = quote.activeWorkdays;
    let workdaysPerWeek = 5;
    if (activeWorkdaysSet) {
        if (Array.isArray(activeWorkdaysSet)) {
            workdaysPerWeek = activeWorkdaysSet.length;
        } else if (typeof activeWorkdaysSet === 'object') {
            workdaysPerWeek = Object.keys(activeWorkdaysSet).length;
        }
    }

    const totalWorkdays = Math.round((calendarDays / 7) * workdaysPerWeek);
    const totalTeachingHours = totalWorkdays * (quote.standardTeachingHours || 0);

    const formatDateShort = (d: Date | string | null) => {
        if (!d) return '';
        const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
        return new Date(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amountAED: number): string => {
        const converted = amountAED * conversionRate;
        return `${currency} ${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    // Helper to ensure array conversion from potential Firestore object
    const toArray = <T,>(data: T[] | Record<string, T> | undefined): T[] => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') return Object.values(data);
        return [];
    };

    // Filter enabled services and sort by order from allServices
    const quoteServices = toArray(quote.services).filter(s => s.enabled);
    const enabledServices = quoteServices.sort((a, b) => {
        const orderA = allServices.find(s => s.id === a.serviceId)?.order ?? 999;
        const orderB = allServices.find(s => s.id === b.serviceId)?.order ?? 999;
        return orderA - orderB;
    });

    // Calculate total revenue
    const totalRevenue = quote.participantCount * quote.manualSellingPricePerParticipant;

    return (
        <div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    #quote-a4-page, #quote-a4-page * { visibility: visible; }
                    #quote-a4-page {
                        position: absolute;
                        left: 0; top: 0;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 20px 24px !important;
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        overflow: hidden;
                    }
                    @page { size: A4; margin: 0; }
                }
            `}} />

            {/* A4 Preview */}
            <div id="quote-a4-page" className="max-w-[210mm] mx-auto bg-white h-[297mm] shadow-lg px-6 py-5 text-gray-900 flex flex-col">
                {/* Header - Compact */}
                <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: `2px solid ${brandColor}` }}>
                    <div className="flex items-center gap-2">
                        {logoSrc ? (
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                    src={logoSrc}
                                    alt={brand?.display_name || 'Logo'}
                                    fill
                                    className="object-contain object-left rounded"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-gray-400 font-bold rounded text-[10px]">
                                LOGO
                            </div>
                        )}
                        <div>
                            <p className="text-gray-900 text-2xl font-serif">{brand?.display_name || 'IMEDA'}</p>
                            <p className="text-gray-500 text-[10px]">Dubai, Paris, Monaco, Guangzhou, Brussels</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-light font-serif" style={{ color: brandColor }}>{t.quotation}</h2>
                        <p className="text-gray-500 text-[10px] mt-0.5">
                            {quote.quoteName && <span className="font-semibold">{quote.quoteName} • </span>}
                            {formatDateShort(new Date())}
                        </p>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div className="flex gap-6 flex-1">
                    {/* LEFT: Services List */}
                    <div className="w-[55%]">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                            {t.includedServices}
                        </h3>

                        {enabledServices.length === 0 ? (
                            <p className="text-gray-400 text-[10px] italic">{t.noServicesSelected}</p>
                        ) : (
                            <div className="space-y-4">
                                {enabledServices.map((service) => (
                                    <div key={service.serviceId} className="flex items-start gap-2">
                                        {service.imageUrl ? (
                                            <div className="relative w-8 h-8 flex-shrink-0 mt-0.5">
                                                <Image
                                                    src={service.imageUrl}
                                                    alt={service.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center mt-0.5">
                                                <span className="text-gray-400 text-[8px]">•</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-[10px] font-sans">{service.name}</h4>
                                            <p className="text-[10px] text-gray-500 leading-snug">{service.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Cards */}
                    <div className="w-[45%] flex-shrink-0 space-y-2">
                        {/* Seminar Details Card */}
                        {(courseName || courseDomain || courseId) && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <h3 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">{t.seminarDetails}</h3>
                                <div className="space-y-1 text-[11px]">
                                    {courseDomain && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t.domain}</span>
                                            <span className="font-medium text-gray-800">{courseDomain}</span>
                                        </div>
                                    )}
                                    {courseId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t.courseId}</span>
                                            <span className="font-medium text-gray-800 font-mono text-[10px]">{courseId}</span>
                                        </div>
                                    )}
                                    {courseName && (
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-500 flex-shrink-0">{t.course}</span>
                                            <span className="font-medium text-gray-800 text-[10px] leading-snug text-right">{courseName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Details Card */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <h3 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">{t.clientDetails}</h3>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.company}</span>
                                    <span className="font-medium text-gray-800">{clientName}</span>
                                </div>
                                {clientContact && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{t.contact}</span>
                                        <span className="font-medium text-gray-800">{clientContact}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Program Details Card */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <h3 className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">{t.programDetails}</h3>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.campus}</span>
                                    <span className="font-medium text-gray-800">{campusName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.arrival}</span>
                                    <span className="font-medium text-gray-800">{formatDateShort(arrivalDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.departure}</span>
                                    <span className="font-medium text-gray-800">{formatDateShort(departureDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.duration}</span>
                                    <span className="font-medium text-gray-800">{calendarDays} {t.days}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.participants}</span>
                                    <span className="font-medium text-gray-800">{quote.participantCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.teachingHours}</span>
                                    <span className="font-medium text-gray-800">{totalTeachingHours}h {t.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-gray-500">Total ({quote.participantCount} {t.pax})</span>
                                    <span className="font-medium text-gray-800">{formatCurrency(totalRevenue)}</span>
                                </div>

                                {/* EUR Conversion Fee Breakdown */}
                                {currency === 'EUR' && (
                                    <>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500">{t.conversionFee}</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(totalRevenue * 0.03)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-semibold">
                                            <span className="text-gray-700">{t.totalWithFee}</span>
                                            <span className="text-gray-900">{formatCurrency(totalRevenue * 1.03)}</span>
                                        </div>
                                    </>
                                )}

                                <div className="pt-2 border-t-2" style={{ borderColor: brandColor }}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700 text-xs font-medium">{t.pricePerPerson}</span>
                                        <span className="text-xl font-bold" style={{ color: brandColor }}>
                                            {currency === 'EUR'
                                                ? formatCurrency(quote.manualSellingPricePerParticipant * 1.03)
                                                : formatCurrency(quote.manualSellingPricePerParticipant)
                                            }
                                        </span>
                                    </div>
                                    {/* Alternative currencies */}
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-[9px] text-gray-400 mb-1">{t.alsoAvailableIn}</p>
                                        <div className="flex flex-col gap-0.5">
                                            {currency !== 'AED' && (
                                                <span className="text-[10px] text-gray-400">
                                                    AED {quote.manualSellingPricePerParticipant.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                            {currency !== 'USD' && (
                                                <span className="text-[10px] text-gray-400">
                                                    USD {(quote.manualSellingPricePerParticipant * 0.27).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                            {currency !== 'EUR' && (
                                                <span className="text-[10px] text-gray-400">
                                                    EUR {(quote.manualSellingPricePerParticipant * 0.230).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with Legal Info */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end text-[9px] text-gray-400">
                    <div className="flex flex-col items-start gap-1">
                        {brand?.logo_url && (
                            <div className="relative h-6 w-24 mb-1">
                                <Image
                                    src={brand.logo_url}
                                    alt={brand?.display_name || 'Logo'}
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        )}
                        {brand?.official_website && (
                            <div className="text-gray-500 font-medium">
                                {brand.official_website}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-0.5 text-right">
                        <p className="font-medium text-gray-600 mb-0.5 text-[10px]">
                            {companyProfile?.legal_name || 'IMEDA'}
                        </p>
                        <p className="space-x-2">
                            {companyProfile?.trade_license_number && (
                                <span>{t.license}: {companyProfile.trade_license_number}</span>
                            )}
                            {companyProfile?.trn_number && (
                                <span>• TRN: {companyProfile.trn_number}</span>
                            )}
                        </p>
                        <p className="space-x-2">
                            {companyProfile?.contact_email && (
                                <span style={{ color: brandColor }}>{companyProfile.contact_email}</span>
                            )}
                            {companyProfile?.contact_phone && (
                                <span>• {companyProfile.contact_phone}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
