'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getSeminarById } from '@/lib/seminars';
import { getCompanyProfile } from '@/lib/settings';
import { getCampuses } from '@/lib/campuses';
import { getClients, type ClientFull } from '@/lib/finance';
import { getCourses } from '@/lib/courses';
import type { Seminar, GeneratedDocument, SeminarParticipant } from '@/types/seminar';
import type { CompanyProfile } from '@/types/settings';
import type { Campus } from '@/types/finance';
import type { Course } from '@/types/course';
import { useBrandTheme } from '@/hooks/useBrandTheme';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// ==========================================
// TYPES
// ==========================================
type RenderItem = {
    document: GeneratedDocument;
    participant: SeminarParticipant;
    client: ClientFull | null;
    contact: any;
    layout: any;
    text: string; // The body text (for letter)
    subject: string;
    subtitle: string;
    embassyName: string;
    seminar: Seminar; // Added seminar reference for schedule access
    campus: Campus | null; // Added campus reference
    companyProfile: CompanyProfile | null;
    courses: Course[]; // Added courses for syllabus
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DocumentPrintView() {
    const params = useParams();
    const searchParams = useSearchParams();
    const seminarId = params.id as string;
    const docId = searchParams.get('docId');
    const docIdsRaw = searchParams.get('docIds');

    const [loading, setLoading] = useState(true);
    const [renderQueue, setRenderQueue] = useState<RenderItem[]>([]);

    // Base Data
    const [seminar, setSeminar] = useState<Seminar | null>(null);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const [seminarCourses, setSeminarCourses] = useState<Course[]>([]);
    const [campus, setCampus] = useState<Campus | null>(null);

    const { brand } = useBrandTheme('imeda');

    useEffect(() => {
        if (seminarId && (docId || docIdsRaw)) {
            loadData();
        }
    }, [seminarId, docId, docIdsRaw]);

    useEffect(() => {
        if (seminar && renderQueue.length > 0) {
            const type = renderQueue[0].document.type;
            const typeName = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            document.title = `${typeName} - ${seminar.name}`;
        }
    }, [seminar, renderQueue]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [seminarData, companyData, clientsData, allCourses, campusesData] = await Promise.all([
                getSeminarById(seminarId),
                getCompanyProfile(),
                getClients('imeda'),
                getCourses('imeda'),
                getCampuses(),
            ]);

            if (seminarData) {
                setSeminar(seminarData);
                setCompanyProfile(companyData);

                // Find Campus
                let c: Campus | null = null;
                if (seminarData.campusId) {
                    c = campusesData.find(cp => cp.id === seminarData.campusId) || null;
                    setCampus(c);
                }

                // Filter courses
                let sc: Course[] = [];
                if (seminarData.courseIds && seminarData.courseIds.length > 0) {
                    sc = allCourses.filter(c => seminarData.courseIds.includes(c.id));
                    setSeminarCourses(sc);
                }

                // Determine IDs to load
                let targetIds: string[] = [];
                if (docIdsRaw) {
                    targetIds = docIdsRaw.split(',');
                } else if (docId) {
                    targetIds = [docId];
                }

                // Build Render Queue
                const queue: RenderItem[] = [];
                const defaultLayout = {
                    showLogo: true,
                    showHeaderAddress: true,
                    showDate: true,
                    dateAlignment: 'right' as const,
                    showSubject: true,
                    showFooter: true,
                    showSignature: true,
                    showStamp: false,
                    signatureText: 'Authorized Signatory'
                };

                for (const targetId of targetIds) {
                    const doc = seminarData.generatedDocuments?.find(d => d.id === targetId);
                    if (!doc) continue;

                    const p = seminarData.participants.find(p => p.id === doc.participantId);
                    if (!p) continue;

                    const client = clientsData.find(c => c.id === p.clientId) || null;
                    const contact = client?.contacts?.[p.contactIndex] || { name: 'Unknown' };

                    // Prepare Variables
                    const contactName = contact.name || 'Unknown Participant';
                    const passportNumber = (contact as any)?.passportNumber || '_________________';
                    const embassyName = doc.metadata?.embassy || 'To Whom It May Concern';

                    const dateFormat = 'd MMMM yyyy';
                    const startDate = format(seminarData.startDate, dateFormat, { locale: fr });
                    const endDate = format(seminarData.endDate, dateFormat, { locale: fr });

                    const replaceTemplateVariables = (input: string, boldMode: boolean = false) => {
                        if (!input) return '';
                        const passportClause = passportNumber !== '_________________' ? ` (Passport No: ${passportNumber})` : '';
                        const durationDays = differenceInDays(new Date(seminarData.endDate), new Date(seminarData.startDate)) + 1;
                        const durationText = `${durationDays} jours`;
                        const courseName = sc.map(c => c.title).join(', ');
                        const courseCode = sc.map(c => c.formationId).join(', ');
                        const courseDesc = sc[0]?.objective || '';

                        // Bold wrapper helper: Only wraps in ** if boldMode is true
                        const b = (v: string) => boldMode ? `**${v}**` : v;

                        return input
                            // Replace bolded versions first (to avoid double bolding)
                            .replace(/\*\*{{participant\.name}}\*\*/g, b(contactName))
                            .replace(/\*\*{{seminar\.startDate}}\*\*/g, b(startDate))
                            .replace(/\*\*{{seminar\.endDate}}\*\*/g, b(endDate))
                            .replace(/\*\*{{campus\.city}}\*\*/g, b(c?.city || ''))

                            // Replace unbolded versions (force bold)
                            .replace(/{{participant\.name}}/g, b(contactName))
                            .replace(/{{seminar\.startDate}}/g, b(startDate))
                            .replace(/{{seminar\.endDate}}/g, b(endDate))
                            .replace(/{{campus\.city}}/g, b(c?.city || ''))

                            // Normal replacements
                            .replace(/{{participant\.passport}}/g, passportNumber)
                            .replace(/{{participant\.occupation}}/g, (contact as any)?.occupation || '')
                            .replace(/{{client\.name}}/g, client?.name || '')
                            .replace(/{{passport_clause}}/g, passportClause)
                            .replace(/{{seminar\.name}}/g, seminarData.name)
                            .replace(/{{seminar\.duration}}/g, durationText)
                            .replace(/{{course\.name}}/g, courseName)
                            .replace(/{{course\.code}}/g, courseCode)
                            .replace(/{{course\.description}}/g, courseDesc)
                            .replace(/{{embassy\.name}}/g, embassyName)
                            .replace(/{{company\.email}}/g, companyData?.contact_email || 'contact@imeda.ae')
                            .replace(/{{company\.legalName}}/g, companyData?.legal_name || '')
                            .replace(/{{company\.license}}/g, companyData?.trade_license_number || '')
                            .replace(/{{company\.trn}}/g, companyData?.trn_number || '')
                            .replace(/{{company\.fullAddress}}/g, `${companyData?.address.street}, ${companyData?.address.city}, ${companyData?.address.country}`)
                            .replace(/{{campus\.name}}/g, c?.name || '')
                            .replace(/{{campus\.country}}/g, c?.country || '');
                    };

                    // text preparation
                    // Revisit fallback to better support welcome pack later if needed, but for now reuse invitation fallback as default text
                    let rawBody = doc.metadata?.templateSnapshot?.body;
                    if (!rawBody) {
                        // Default fallback (e.g. for invitations)
                        rawBody = `Dear Sir/Madam,\n\nWe are pleased to confirm that **{{participant.name}}**...`;
                    }
                    const text = replaceTemplateVariables(rawBody, true);
                    const subject = replaceTemplateVariables(doc.metadata?.templateSnapshot?.subject || (doc.type === 'welcome_pack' ? 'WELCOME PACK' : 'INVITATION LETTER'), false);
                    const subtitle = replaceTemplateVariables(doc.metadata?.templateSnapshot?.subtitle || '', false);

                    const layout = { ...defaultLayout, ...doc.metadata?.templateSnapshot?.layout };

                    queue.push({
                        document: doc,
                        participant: p,
                        client,
                        contact,
                        layout,
                        text,
                        subject,
                        subtitle,
                        embassyName,
                        seminar: seminarData,
                        campus: c,
                        companyProfile: companyData,
                        courses: sc
                    });
                }
                setRenderQueue(queue);

            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading documents...</div>;
    if (renderQueue.length === 0) return <div className="p-12 text-center text-red-500">No documents found</div>;

    return (
        <div className="bg-gray-100 min-h-screen py-8 print:p-0 print:m-0 print:bg-white print:overflow-visible">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    html, body {
                        background: white !important;
                        height: 100vh;
                        width: 100vw;
                        overflow: visible;
                    }
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content {
                        position: absolute; left: 0; top: 0; width: 100%;
                        margin: 0 !important; padding: 0 !important;
                    }
                    .page-break { page-break-after: always; }
                }
            `}} />

            <div className="print-content space-y-8 print:space-y-0 text-black">
                {renderQueue.map((item, index) => {
                    const isLastDoc = index === renderQueue.length - 1;

                    if (item.document.type === 'welcome_pack') {
                        return (
                            <div key={item.document.id}>
                                {/* Page 1: Welcome Letter */}
                                <StandardPageLayout item={item} brand={brand} />
                                <div className="page-break"></div>

                                {/* Page 2: Transport Card */}
                                <TransportCardPage item={item} brand={brand} />
                                <div className="page-break"></div>

                                {/* Page 3: Schedule */}
                                <SchedulePage item={item} brand={brand} />
                                <div className="page-break"></div>

                                {/* Page 4: Practical Info */}
                                <PracticalInfoPage item={item} brand={brand} />
                                <div className="page-break"></div>

                                {/* Pages 5+: Course Syllabus (one per course) */}
                                {item.courses.map((course, courseIndex) => (
                                    <div key={course.id}>
                                        <CourseSyllabusPage course={course} item={item} brand={brand} />
                                        {courseIndex < item.courses.length - 1 && <div className="page-break"></div>}
                                    </div>
                                ))}

                                {/* Break after full pack if not last */}
                                {!isLastDoc && <div className="page-break"></div>}
                            </div>
                        );
                    } else {
                        // Default Standard Document
                        return (
                            <StandardPageLayout
                                key={item.document.id}
                                item={item}
                                brand={brand}
                                className={!isLastDoc ? "page-break" : ""}
                            />
                        );
                    }
                })}
            </div>
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: Standard Letter Page
// ==========================================
function StandardPageLayout({ item, brand, className = "" }: { item: RenderItem, brand: any, className?: string }) {
    return (
        <div className={`max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[290mm] p-[15mm] print:p-[15mm] relative flex flex-col print:w-full print:max-w-none print:rounded-none ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                {item.layout.showLogo && (
                    brand?.logo_url ? (
                        <div className="relative w-48 h-20">
                            <Image src={brand.logo_url} alt="Logo" fill className="object-contain object-left" />
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold">IMEDA</h1>
                    )
                )}

                {item.layout.showHeaderAddress && (
                    <div className="text-right text-[10px] text-gray-500 leading-relaxed ml-auto">
                        <p>{brand?.display_name} - by {item.companyProfile?.legal_name}</p>
                        <p>{item.companyProfile?.address.street}</p>
                        <p>{item.companyProfile?.address.city}, {item.companyProfile?.address.country}</p>
                        <p>{item.companyProfile?.contact_phone}</p>
                        <p>{item.companyProfile?.contact_email}</p>
                    </div>
                )}
            </div>

            {/* Date */}
            {item.layout.showDate && (
                <div className={`mb-6 ${item.layout.dateAlignment === 'left' ? 'text-left' : 'text-right'}`}>
                    <p className="text-sm">Dubai, {format(new Date(), 'd MMMM yyyy', { locale: fr })}</p>
                </div>
            )}

            {/* Subject / Title */}
            {item.layout.showSubject && (
                <div className="mb-6">
                    <h1 className="font-serif text-3xl text-imeda mb-2 text-left">{item.subject}</h1>
                    {item.subtitle && (
                        <h2 className="font-serif text-xl text-gray-700 text-left">{item.subtitle}</h2>
                    )}
                </div>
            )}

            {/* Body */}
            <div className="text-[11px] leading-relaxed text-justify space-y-4 flex-1 whitespace-pre-wrap font-sans">
                {item.text.split(/(\*\*.*?\*\*)/).map((part: string, i: number) =>
                    part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={i}>{part.slice(2, -2)}</strong>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </div>

            {/* Signature */}
            {item.layout.showSignature && (
                <div className="mt-8 mb-8">
                    <div className="h-40 relative flex items-end">
                        <div className="relative z-10">
                            <p className="font-bold">IMEDA Administration</p>
                            <p className="text-xs text-gray-500">{item.layout.signatureText || 'Authorized Signatory'}</p>
                        </div>
                        {brand?.signature_url && (
                            <div className="absolute -bottom-8 left-[-20px] w-[400px] h-[200px] z-20 mix-blend-multiply pointer-events-none">
                                <Image src={brand.signature_url} alt="Signature" fill className="object-contain object-left-bottom" />
                            </div>
                        )}
                        {item.layout.showStamp && brand?.stamp_url && (
                            <div className="absolute bottom-[-40px] right-0 w-64 h-64 opacity-80 mix-blend-multiply z-0">
                                <Image src={brand.stamp_url} alt="Stamp" fill className="object-contain" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            {item.layout.showFooter && (
                <div className="border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400 mt-auto">
                    {item.layout.customFooter ? (
                        <p className="whitespace-pre-wrap">{item.layout.customFooter}</p>
                    ) : (
                        <>
                            <p>{item.companyProfile?.legal_name} • License: {item.companyProfile?.trade_license_number}</p>
                            <p>www.imeda.fr</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: Transport Card Page
// ==========================================
function TransportCardPage({ item, brand }: { item: RenderItem, brand: any }) {
    return (
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[290mm] p-[15mm] print:p-[15mm] relative flex flex-col items-center justify-center print:w-full print:max-w-none print:rounded-none">

            {/* Minimal Header */}
            <div className="absolute top-[15mm] left-[15mm] right-[15mm] flex justify-between items-center opacity-50">
                {brand?.logo_url && (
                    <div className="relative w-32 h-12">
                        <Image src={brand.logo_url} alt="Logo" fill className="object-contain object-left" />
                    </div>
                )}
                <p className="text-xs text-gray-400">Pack de Bienvenue • Page 2</p>
            </div>

            <div className="text-center space-y-8">
                <h1 className="text-2xl font-bold text-imeda uppercase tracking-widest">Carte de Transport</h1>
                <p className="text-lg text-gray-600">Veuillez trouver ci-jointe votre carte de transport public.</p>

                {/* Card Placeholder Box */}
                <div className="w-[85.6mm] h-[54mm] border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center bg-gray-50 print:bg-white">
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider text-center">
                        Coller la carte ici<br /> (Carte NOL)
                    </p>
                </div>

                <div className="mt-8 p-6 border border-gray-100 rounded bg-gray-50 print:bg-white print:border-gray-200 inline-block text-left w-full max-w-md">
                    <p className="text-sm font-bold text-gray-900 mb-1">Attribuée à :</p>
                    <p className="text-xl text-imeda mb-4">{item.contact?.name || 'Participant'}</p>

                    <p className="text-xs text-gray-500 mb-1">Séminaire :</p>
                    <p className="text-sm text-gray-700">{item.seminar.name}</p>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: Schedule Page
// ==========================================
function SchedulePage({ item, brand }: { item: RenderItem, brand: any }) {
    const events = item.seminar.schedule || [];

    // Group events by day
    const eventsByDay = events.reduce((acc, event) => {
        const dayKey = format(new Date(event.startTime), 'yyyy-MM-dd');
        if (!acc[dayKey]) {
            acc[dayKey] = [];
        }
        acc[dayKey].push(event);
        return acc;
    }, {} as Record<string, typeof events>);

    // Sort days
    const sortedDays = Object.keys(eventsByDay).sort();

    return (
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[290mm] p-[15mm] print:p-[15mm] relative flex flex-col print:w-full print:max-w-none print:rounded-none">

            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-imeda">
                <h1 className="text-xl font-bold text-imeda">Programme Hebdomadaire</h1>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500">Participant : {item.contact?.name}</p>
                    <p className="text-[10px] text-gray-400">{format(new Date(item.seminar.startDate), 'MMM d')} - {format(new Date(item.seminar.endDate), 'MMM d, yyyy')}</p>
                </div>
            </div>

            {/* Calendar View */}
            <div className="flex-1 space-y-2">
                {sortedDays.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-12">Aucun événement programmé.</p>
                ) : (
                    sortedDays.map(dayKey => {
                        const dayEvents = eventsByDay[dayKey].sort((a, b) =>
                            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                        );
                        const dayDate = new Date(dayKey);

                        return (
                            <div key={dayKey} className="border border-gray-200 rounded overflow-hidden">
                                {/* Day Header - Compact */}
                                <div className="bg-imeda text-white px-3 py-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-center">
                                            <span className="text-lg font-bold">{format(dayDate, 'd')}</span>
                                            <span className="text-[9px] uppercase ml-1">{format(dayDate, 'MMM')}</span>
                                        </div>
                                        <div className="border-l border-white/30 pl-2">
                                            <div className="text-xs font-semibold">{format(dayDate, 'EEEE')}</div>
                                        </div>
                                    </div>
                                    <div className="text-[9px] opacity-90">{dayEvents.length} événement{dayEvents.length !== 1 ? 's' : ''}</div>
                                </div>

                                {/* Day Events - Compact */}
                                <div className="divide-y divide-gray-100">
                                    {dayEvents.map(event => (
                                        <div key={event.id} className="px-2 py-1.5 flex gap-2 text-xs">
                                            {/* Time */}
                                            <div className="flex-shrink-0 w-16 text-right">
                                                <div className="font-bold text-imeda text-xs">
                                                    {format(new Date(event.startTime), 'HH:mm')}
                                                </div>
                                                <div className="text-[9px] text-gray-400">
                                                    {format(new Date(event.endTime), 'HH:mm')}
                                                </div>
                                            </div>

                                            {/* Event Details */}
                                            <div className="flex-1 border-l border-imeda/20 pl-2">
                                                <h3 className="font-semibold text-gray-900 text-xs leading-tight">
                                                    {event.title === 'Course' ? 'Formation' : event.title}
                                                </h3>
                                                {event.notes && (
                                                    <p className="text-[10px] text-gray-600 leading-snug mt-0.5">{event.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-auto border-t border-gray-100 text-center text-[9px] text-gray-400">
                <p>Le programme est susceptible de modifications. Veuillez vérifier auprès de l'administration.</p>
            </div>
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: Practical Info Page
// ==========================================
function PracticalInfoPage({ item, brand }: { item: RenderItem, brand: any }) {
    return (
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[290mm] p-[15mm] print:p-[15mm] relative flex flex-col print:w-full print:max-w-none print:rounded-none">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-serif text-imeda mb-2">Informations Pratiques</h1>
                <div className="h-1 w-20 bg-gray-200"></div>
            </div>

            <div className="space-y-12">

                {/* Location */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-imeda text-white flex items-center justify-center text-xs">1</span>
                        Lieu de Formation
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 print:border-gray-200 print:bg-white">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Address */}
                            <div>
                                <h3 className="font-medium text-gray-900">{item.campus?.name || 'IMEDA Campus'}</h3>
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                    {item.campus?.address ? (
                                        <p className="whitespace-pre-wrap">{item.campus.address}</p>
                                    ) : (
                                        <p>{item.companyProfile?.address.street}, {item.companyProfile?.address.city}</p>
                                    )}
                                    <p className="text-imeda font-medium mt-2">{item.campus?.city}, {item.campus?.country}</p>
                                </div>
                            </div>

                            {/* Map Image - Square */}
                            {item.campus?.offices?.[0]?.mapImageUrl && (
                                <div className="flex items-start justify-end">
                                    <img
                                        src={item.campus.offices[0].mapImageUrl}
                                        alt="Location Map"
                                        className="w-48 h-48 object-cover rounded border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Contacts */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-imeda text-white flex items-center justify-center text-xs">2</span>
                        Contacts Clés
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 border border-gray-200 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Administration</p>
                            <p className="font-medium">{item.companyProfile?.contact_email}</p>
                            <p className="text-sm text-gray-600">{item.companyProfile?.contact_phone}</p>
                        </div>
                        {/* Example Additional Contact */}
                        <div className="p-4 border border-gray-200 rounded">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Urgence / Support</p>
                            <p className="font-medium">Équipe de Support</p>
                            <p className="text-sm text-gray-600">+33 6 51 65 31 44</p>
                        </div>
                    </div>
                </section>

                {/* General Info */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-imeda text-white flex items-center justify-center text-xs">3</span>
                        Notes Importantes
                    </h2>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                        <li>Veuillez arriver 15 minutes avant l'heure de début quotidienne.</li>
                        <li>Le code vestimentaire est Business Casual.</li>
                        <li>Le matériel de cours sera fourni le premier jour.</li>
                        <li>Pour toute urgence médicale, veuillez composer le 998.</li>
                    </ul>
                </section>

            </div>

            {/* Footer */}
            <div className="mt-auto border-t border-gray-200 pt-6">
                <p className="text-center text-sm font-medium text-gray-900">Nous vous souhaitons un séminaire productif et agréable !</p>
            </div>
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: Course Syllabus Page
// ==========================================
function CourseSyllabusPage({ course, item, brand }: { course: Course, item: RenderItem, brand: any }) {
    return (
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none min-h-[290mm] p-[15mm] print:p-[15mm] relative flex flex-col print:w-full print:max-w-none print:rounded-none">

            {/* Header */}
            <div className="mb-8 pb-4 border-b-2 border-imeda">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-serif text-imeda">Programme de Formation</h1>
                    {brand?.logo_url && (
                        <div className="relative w-24 h-12 opacity-60">
                            <Image src={brand.logo_url} alt="Logo" fill className="object-contain object-right" />
                        </div>
                    )}
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-xs uppercase tracking-wider text-gray-500">ID Formation :</span>
                    <span className="text-lg font-bold text-gray-900">{course.formationId}</span>
                </div>
            </div>

            {/* Course Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h2>
                <p className="text-sm text-gray-500 uppercase tracking-wide">{course.domain}</p>
            </div>

            <div className="space-y-6 flex-1">

                {/* Objective */}
                {course.objective && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Objectif
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.objective}</p>
                    </section>
                )}

                {/* Target Audience */}
                {course.audience && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Public Cible
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.audience}</p>
                    </section>
                )}

                {/* Prerequisites */}
                {course.prerequisites && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Prérequis
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.prerequisites}</p>
                    </section>
                )}

                {/* Modules */}
                {course.modules && course.modules.length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Modules de Formation
                        </h3>
                        <div className="space-y-2">
                            {course.modules
                                .sort((a, b) => a.order - b.order)
                                .map((module, index) => (
                                    <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded border-l-2 border-imeda/30">
                                        <span className="font-bold text-imeda text-sm min-w-[40px]">M{module.order}</span>
                                        <span className="text-sm text-gray-800">{module.title}</span>
                                    </div>
                                ))}
                        </div>
                    </section>
                )}

                {/* Methods */}
                {course.methods && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Méthodes Pédagogiques
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.methods}</p>
                    </section>
                )}

                {/* Resources */}
                {course.resources && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Ressources
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.resources}</p>
                    </section>
                )}

                {/* Evaluation */}
                {course.evaluation && (
                    <section>
                        <h3 className="text-sm font-bold text-imeda uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span className="w-1 h-4 bg-imeda"></span>
                            Évaluation
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{course.evaluation}</p>
                    </section>
                )}

            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
                <p>Le programme de formation est susceptible de modifications. Veuillez vérifier auprès de l'administration pour la dernière version.</p>
            </div>
        </div>
    );
}
