'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Save, ArrowLeft, Upload, Trash2, Building2, Users, BookOpen,
    Calendar, FileText, Plus, Check, X, ExternalLink, User, ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { getSeminarById, updateSeminarGeneralInfo, updateSeminarParticipants, updateSeminarAcademia, updateSeminarSchedule, uploadSeminarDocument, deleteSeminarDocument, addGeneratedDocument, updateSeminarGeneratedDocuments, addGeneratedDocuments } from '@/lib/seminars';
import { getCampuses } from '@/lib/campuses';
import { getClients, type ClientFull } from '@/lib/finance';
import { getConsultants } from '@/lib/staff';
import { getCourses } from '@/lib/courses';
import { getServices } from '@/lib/services';
import { getDocumentTemplates } from '@/lib/settings';
import { showToast } from '@/lib/toast';
import type { Seminar, SeminarDocument, SeminarParticipant, ScheduleEvent, GeneratedDocument } from '@/types/seminar';
import type { Campus, CampusOffice } from '@/types/finance';
import type { Consultant } from '@/types/staff';
import type { Course } from '@/types/course';
import type { ImedaService } from '@/types/finance';
import type { DocumentTemplate } from '@/types/settings';
import { format } from 'date-fns';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Tab = 'general' | 'participants' | 'calendar' | 'academia' | 'documents';

export default function SeminarDetailPage() {
    const params = useParams();
    const router = useRouter();
    const seminarId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('general');

    // Data
    const [seminar, setSeminar] = useState<Seminar | null>(null);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        loadData();
    }, [seminarId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [seminarData, campusesData, clientsData, staffData, coursesData] = await Promise.all([
                getSeminarById(seminarId),
                getCampuses(),
                getClients('imeda'),
                getConsultants('imeda'),
                getCourses('imeda'),
            ]);

            if (!seminarData) {
                showToast.error('Seminar not found');
                router.push('/dashboard/imeda/seminars');
                return;
            }

            setSeminar(seminarData);
            setCampuses(campusesData);
            setClients(clientsData);
            setStaff(staffData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading seminar:', error);
            showToast.error('Failed to load seminar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
            </div>
        );
    }

    if (!seminar) return null;

    const tabs = [
        { id: 'general' as Tab, label: 'General Info', icon: FileText },
        { id: 'participants' as Tab, label: 'Participants', icon: Users },
        { id: 'calendar' as Tab, label: 'Calendar', icon: Calendar },
        { id: 'academia' as Tab, label: 'Academia', icon: BookOpen },
        { id: 'documents' as Tab, label: 'Documents', icon: FileText },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/imeda/seminars')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{seminar.seminarId}</p>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{seminar.name}</h1>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive
                                        ? 'border-imeda text-imeda'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-200">
                {activeTab === 'general' && <GeneralTab seminar={seminar} campuses={campuses} staff={staff} onUpdate={loadData} />}
                {activeTab === 'participants' && <ParticipantsTab seminar={seminar} clients={clients} onUpdate={loadData} />}
                {activeTab === 'calendar' && <CalendarTab seminar={seminar} />}
                {activeTab === 'academia' && <AcademiaTab seminar={seminar} courses={courses} onUpdate={loadData} />}
                {activeTab === 'documents' && <DocumentsTab seminar={seminar} clients={clients} onUpdate={loadData} />}
            </div>
        </div>
    );
}

// ===== TAB 1: GENERAL INFO =====
function GeneralTab({ seminar, campuses, staff, onUpdate }: {
    seminar: Seminar;
    campuses: Campus[];
    staff: Consultant[];
    onUpdate: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: seminar.name,
        campusId: seminar.campusId,
        officeIds: seminar.officeIds,
        assignedStaffIds: seminar.assignedStaffIds,
        startDate: format(seminar.startDate, 'yyyy-MM-dd'),
        endDate: format(seminar.endDate, 'yyyy-MM-dd'),
    });

    const selectedCampus = campuses.find(c => c.id === formData.campusId);
    const availableOffices: CampusOffice[] = selectedCampus?.offices || [];

    const toggleOffice = (officeId: string) => {
        const updated = formData.officeIds.includes(officeId)
            ? formData.officeIds.filter(id => id !== officeId)
            : [...formData.officeIds, officeId];
        setFormData({ ...formData, officeIds: updated });
    };

    const toggleStaff = (staffId: string) => {
        const updated = formData.assignedStaffIds.includes(staffId)
            ? formData.assignedStaffIds.filter(id => id !== staffId)
            : [...formData.assignedStaffIds, staffId];
        setFormData({ ...formData, assignedStaffIds: updated });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showToast.error('Seminar name is required');
            return;
        }

        setSaving(true);
        try {
            await updateSeminarGeneralInfo(seminar.id, {
                name: formData.name,
                campusId: formData.campusId,
                officeIds: formData.officeIds,
                assignedStaffIds: formData.assignedStaffIds,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
            });
            showToast.success('General info updated');
            onUpdate();
        } catch (error) {
            console.error('Error saving:', error);
            showToast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg space-y-6">
            {/* Seminar Name */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Seminar Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                />
            </div>

            {/* Campus & Offices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Campus *
                    </label>
                    <select
                        value={formData.campusId}
                        onChange={(e) => setFormData({ ...formData, campusId: e.target.value, officeIds: [] })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                    >
                        {campuses.map(campus => (
                            <option key={campus.id} value={campus.id}>{campus.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Assigned Offices
                    </label>
                    {availableOffices.length === 0 ? (
                        <p className="text-sm text-gray-400 py-2">No offices for this campus</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableOffices.map(office => (
                                <button
                                    key={office.id}
                                    type="button"
                                    onClick={() => toggleOffice(office.id)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${formData.officeIds.includes(office.id)
                                        ? 'bg-imeda text-white'
                                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                        }`}
                                >
                                    {office.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assigned Staff */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Assigned Staff
                </label>
                <div className="flex flex-wrap gap-2">
                    {staff.map(person => (
                        <button
                            key={person.id}
                            type="button"
                            onClick={() => toggleStaff(person.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${formData.assignedStaffIds.includes(person.id)
                                ? 'bg-imeda text-white'
                                : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {person.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        End Date *
                    </label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium rounded disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

// ===== TAB 2: PARTICIPANTS =====
function ParticipantsTab({ seminar, clients, onUpdate }: {
    seminar: Seminar;
    clients: ClientFull[];
    onUpdate: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [participants, setParticipants] = useState<SeminarParticipant[]>(seminar.participants || []);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedContactIndex, setSelectedContactIndex] = useState<number | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<SeminarParticipant | null>(null);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const allContacts = selectedClient?.contacts || [];

    // Filter out contacts already added as participants, preserve original index
    const availableContacts = allContacts
        .map((contact, originalIndex) => ({ contact, originalIndex }))
        .filter(({ originalIndex }) =>
            !participants.some(p => p.clientId === selectedClientId && p.contactIndex === originalIndex)
        );

    const addParticipant = () => {
        if (!selectedClientId || selectedContactIndex === null) {
            showToast.error('Please select a company and contact');
            return;
        }

        // Generate seminar-specific ID (e.g., LON-2024-001-01)
        const lastIndex = participants.length > 0
            ? Math.max(...participants.map(p => {
                if (!p.participantId) return 0;
                const parts = p.participantId.split('-');
                return parseInt(parts[parts.length - 1] || '0');
            }))
            : 0;

        const nextNumber = lastIndex + 1;
        const participantId = `${seminar.seminarId}-${String(nextNumber).padStart(2, '0')}`;

        const newParticipant: SeminarParticipant = {
            id: crypto.randomUUID(),
            participantId,
            clientId: selectedClientId,
            contactIndex: selectedContactIndex,
        };

        setParticipants([...participants, newParticipant]);
        // Keep selectedClientId for faster entry of multiple participants from same company
        setSelectedContactIndex(null);
    };

    const removeParticipant = (id: string) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const openParticipantDetail = (participant: SeminarParticipant) => {
        setSelectedParticipant(participant);
        setDetailDialogOpen(true);
    };

    const handleParticipantUpdate = (updated: SeminarParticipant) => {
        setParticipants(participants.map(p => p.id === updated.id ? updated : p));
        setDetailDialogOpen(false);
        setSelectedParticipant(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSeminarParticipants(seminar.id, participants);
            showToast.success('Participants updated');
            onUpdate();
        } catch (error) {
            console.error('Error saving:', error);
            showToast.error('Failed to save participants');
        } finally {
            setSaving(false);
        }
    };

    const getParticipantDetails = (participant: SeminarParticipant) => {
        const client = clients.find(c => c.id === participant.clientId);
        const contact = client?.contacts?.[participant.contactIndex];
        return { client, contact };
    };

    const uniqueCompanies = new Set(participants.map(p => p.clientId)).size;

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Manage Participants</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {participants.length} participant(s) from {uniqueCompanies} compan{uniqueCompanies === 1 ? 'y' : 'ies'}
                    </p>
                </div>
            </div>

            {/* Add Participant Form */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Add Participant</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Company</label>
                        <select
                            value={selectedClientId}
                            onChange={(e) => {
                                setSelectedClientId(e.target.value);
                                setSelectedContactIndex(null);
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                        >
                            <option value="">Select Company</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Contact</label>
                        <select
                            value={selectedContactIndex ?? ''}
                            onChange={(e) => setSelectedContactIndex(e.target.value ? Number(e.target.value) : null)}
                            disabled={!selectedClientId}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda disabled:opacity-50"
                        >
                            <option value="">Select Contact</option>
                            {availableContacts.map(({ contact, originalIndex }) => (
                                <option key={originalIndex} value={originalIndex}>
                                    {contact.name || 'Unnamed'} {contact.occupation ? `(${contact.occupation})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={addParticipant}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white hover:opacity-90 transition-opacity rounded text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Participants List */}
            <div className="space-y-3">
                {participants.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">No participants added yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {participants.map(participant => {
                            const { client, contact } = getParticipantDetails(participant);
                            return (
                                <div
                                    key={participant.id}
                                    onClick={() => openParticipantDetail(participant)}
                                    className="p-3 bg-white dark:bg-zinc-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <span className="text-[10px] font-mono text-gray-400 w-24 tabular-nums">
                                            {participant.participantId}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {contact?.name || 'Unknown Contact'}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                / {client?.name || 'Unknown Company'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeParticipant(participant.id); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Remove participant"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium rounded disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Participants'}
                </button>
            </div>

            {/* Participant Detail Dialog */}
            {detailDialogOpen && selectedParticipant && (
                <ParticipantDetailDialog
                    participant={selectedParticipant}
                    client={clients.find(c => c.id === selectedParticipant.clientId) || null}
                    onSave={handleParticipantUpdate}
                    onClose={() => { setDetailDialogOpen(false); setSelectedParticipant(null); }}
                />
            )}
        </div>
    );
}
// ===== PARTICIPANT DETAIL DIALOG =====
function ParticipantDetailDialog({ participant, client, onSave, onClose }: {
    participant: SeminarParticipant;
    client: ClientFull | null;
    onSave: (updated: SeminarParticipant) => void;
    onClose: () => void;
}) {
    const contact = client?.contacts?.[participant.contactIndex];

    // Form state
    const [attentes, setAttentes] = useState(participant.attentes || '');
    const [objectifPrincipal, setObjectifPrincipal] = useState(participant.objectifPrincipal || '');
    const [sujetsSpecifiques, setSujetsSpecifiques] = useState(participant.sujetsSpecifiques || '');
    const [niveauConnaissance, setNiveauConnaissance] = useState(participant.niveauConnaissance || '');
    const [flightDetails, setFlightDetails] = useState(participant.flightDetails || '');
    const [autresBesoins, setAutresBesoins] = useState(participant.autresBesoins || '');

    const handleSave = () => {
        onSave({
            ...participant,
            attentes: attentes || undefined,
            objectifPrincipal: objectifPrincipal || undefined,
            sujetsSpecifiques: sujetsSpecifiques || undefined,
            niveauConnaissance: niveauConnaissance || undefined,
            flightDetails: flightDetails || undefined,
            autresBesoins: autresBesoins || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {contact?.name || 'Participant Details'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {participant.participantId} • {client?.name || 'Unknown Company'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Formation Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Formation
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Attentes
                                </label>
                                <textarea
                                    value={attentes}
                                    onChange={(e) => setAttentes(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                    placeholder="Ce que le participant attend de la formation..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Objectif Principal
                                </label>
                                <input
                                    type="text"
                                    value={objectifPrincipal}
                                    onChange={(e) => setObjectifPrincipal(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                    placeholder="Objectif principal du participant..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Sujets Spécifiques
                                </label>
                                <textarea
                                    value={sujetsSpecifiques}
                                    onChange={(e) => setSujetsSpecifiques(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                    placeholder="Sujets d'intérêt particulier..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Niveau de Connaissance
                                </label>
                                <select
                                    value={niveauConnaissance}
                                    onChange={(e) => setNiveauConnaissance(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="debutant">Débutant</option>
                                    <option value="intermediaire">Intermédiaire</option>
                                    <option value="avance">Avancé</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Logistique Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Logistique
                        </h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Flight Details
                            </label>
                            <textarea
                                value={flightDetails}
                                onChange={(e) => setFlightDetails(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                                placeholder="Détails du vol (arrivée, départ)..."
                            />
                        </div>
                    </div>

                    {/* Autres Besoins Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                            Autres Besoins
                        </h4>
                        <textarea
                            value={autresBesoins}
                            onChange={(e) => setAutresBesoins(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                            placeholder="Besoins supplémentaires..."
                        />
                    </div>

                    {/* Contact Section (Read-Only) */}
                    {contact && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Contact
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {contact.email1 || '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp</label>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {contact.phone1 || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Alimentaire Section (Read-Only from Client Contact) */}
                    {contact && (contact.restrictionsAlimentaires || contact.preferencesAlimentaires) && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                                Alimentaire
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Restrictions</label>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {contact.restrictionsAlimentaires || '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Préférences</label>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {contact.preferencesAlimentaires || '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-imeda text-white hover:opacity-90 rounded text-sm font-medium"
                    >
                        Stage
                    </button>
                </div>
            </div>
        </div>
    );
}

// ===== TAB 3: CALENDAR =====
function CalendarTab({ seminar }: { seminar: Seminar }) {
    const [schedule, setSchedule] = useState<ScheduleEvent[]>(seminar.schedule || []);
    const [saving, setSaving] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [services, setServices] = useState<ImedaService[]>([]);
    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [clickedDate, setClickedDate] = useState<Date | null>(null);
    const [clickedHour, setClickedHour] = useState<number | null>(null);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    useEffect(() => {
        loadCalendarData();
    }, []);

    const loadCalendarData = async () => {
        const [coursesData, servicesData] = await Promise.all([
            getCourses('imeda'),
            getServices()
        ]);
        setCourses(coursesData);
        setServices(servicesData);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSeminarSchedule(seminar.id, schedule);
            showToast.success('Schedule saved');
        } catch (error) {
            console.error('Error saving schedule:', error);
            showToast.error('Failed to save schedule');
        } finally {
            setSaving(false);
        }
    };

    const handleCellClick = (date: Date, hour: number) => {
        setClickedDate(date);
        setClickedHour(hour);
        setSelectedEvent(null);
        setEventDialogOpen(true);
    };

    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setClickedDate(null);
        setClickedHour(null);
        setEventDialogOpen(true);
    };

    const handleSaveEvent = (event: ScheduleEvent) => {
        if (selectedEvent) {
            // Update existing
            setSchedule(schedule.map(e => e.id === event.id ? event : e));
        } else {
            // Create new
            setSchedule([...schedule, event]);
        }
        setEventDialogOpen(false);
    };

    const handleDeleteEvent = (eventId: string) => {
        setSchedule(schedule.filter(e => e.id !== eventId));
        setEventDialogOpen(false);
    };

    const handleRemoveAllEvents = () => {
        setQuickActionsOpen(false);
        setConfirmDialogOpen(true);
    };

    const confirmRemoveAllEvents = () => {
        setSchedule([]);
        setConfirmDialogOpen(false);
        showToast.success('All events removed');
    };

    const handleFillDefaultEvents = () => {
        // Find Déjeuners service (not Petit Déjeuners)
        const dejeunerService = services.find(s =>
            s.name.toLowerCase().startsWith('déjeuner') ||
            s.name.toLowerCase() === 'déjeuners'
        );

        if (!dejeunerService) {
            showToast.error('Déjeuners service not found');
            return;
        }

        const newEvents: ScheduleEvent[] = [];
        const currentDate = new Date(seminar.startDate);

        // Loop through all days in seminar
        while (currentDate <= seminar.endDate) {
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

            // Skip Sundays (0)
            if (dayOfWeek !== 0) {
                const dateStr = currentDate.toISOString().split('T')[0];

                // Morning Course: 9 AM - 12 PM
                newEvents.push({
                    id: crypto.randomUUID(),
                    type: 'course',
                    title: 'Formation',
                    startTime: new Date(`${dateStr}T09:00:00`),
                    endTime: new Date(`${dateStr}T12:00:00`),
                });

                // Déjeuner: 12 PM - 1 PM
                newEvents.push({
                    id: crypto.randomUUID(),
                    type: 'service',
                    serviceId: dejeunerService.id,
                    title: dejeunerService.name,
                    startTime: new Date(`${dateStr}T12:00:00`),
                    endTime: new Date(`${dateStr}T13:00:00`),
                });

                // Afternoon Course: 1 PM - 3 PM
                newEvents.push({
                    id: crypto.randomUUID(),
                    type: 'course',
                    title: 'Formation',
                    startTime: new Date(`${dateStr}T13:00:00`),
                    endTime: new Date(`${dateStr}T15:00:00`),
                });
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setSchedule(newEvents);
        setQuickActionsOpen(false);
        showToast.success(`${newEvents.length} default events created`);
    };

    // Calculate weeks
    const totalDays = Math.ceil((seminar.endDate.getTime() - seminar.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalDays / 14); // 2-week periods
    const weeksToShow = Math.min(2, Math.ceil(totalDays / 7));

    // Get the date range for current view
    const viewStartDate = new Date(seminar.startDate);
    viewStartDate.setDate(viewStartDate.getDate() + (currentWeekIndex * 14));
    const viewEndDate = new Date(viewStartDate);
    viewEndDate.setDate(viewEndDate.getDate() + 13);

    // Clamp to seminar end date
    if (viewEndDate > seminar.endDate) {
        viewEndDate.setTime(seminar.endDate.getTime());
    }

    // Generate days for current view
    const daysInView: Date[] = [];
    const currentDate = new Date(viewStartDate);
    while (currentDate <= viewEndDate) {
        daysInView.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate total course hours
    const totalCourseHours = schedule
        .filter(e => e.type === 'course')
        .reduce((total, event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return total + hours;
        }, 0);

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {format(viewStartDate, 'MMM d')} - {format(viewEndDate, 'MMM d, yyyy')}
                            <span className="ml-3 text-blue-600 dark:text-blue-400 font-medium">
                                {totalCourseHours}h course
                            </span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {totalWeeks > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                                    disabled={currentWeekIndex === 0}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
                                    Week {currentWeekIndex + 1} of {totalWeeks}
                                </span>
                                <button
                                    onClick={() => setCurrentWeekIndex(Math.min(totalWeeks - 1, currentWeekIndex + 1))}
                                    disabled={currentWeekIndex >= totalWeeks - 1}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                                title="Quick Actions"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {/* Dropdown */}
                            {quickActionsOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setQuickActionsOpen(false)}
                                    />

                                    {/* Menu */}
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                                        <button
                                            onClick={handleRemoveAllEvents}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 rounded-t-lg"
                                        >
                                            Remove All Events
                                        </button>
                                        <button
                                            onClick={handleFillDefaultEvents}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-b-lg border-t border-gray-200 dark:border-gray-700"
                                        >
                                            Fill Default Events
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 disabled:opacity-50 rounded text-sm font-medium"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <WeeklyGrid
                    days={daysInView}
                    events={schedule}
                    onCellClick={handleCellClick}
                    onEventClick={handleEventClick}
                />
            </div>

            {/* Event Dialog */}
            {eventDialogOpen && (
                <EventDialog
                    event={selectedEvent}
                    defaultDate={clickedDate}
                    defaultHour={clickedHour}
                    courses={courses}
                    services={services}
                    onSave={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    onClose={() => setEventDialogOpen(false)}
                />
            )}

            {/* Confirm Remove All Events */}
            <ConfirmDialog
                isOpen={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={confirmRemoveAllEvents}
                title="Remove All Events"
                message="Are you sure you want to remove all events from the schedule? This action cannot be undone."
                confirmLabel="Remove All"
                variant="danger"
            />
        </div>
    );
}

// Weekly Grid Component
function WeeklyGrid({ days, events, onCellClick, onEventClick }: {
    days: Date[];
    events: ScheduleEvent[];
    onCellClick: (date: Date, hour: number) => void;
    onEventClick: (event: ScheduleEvent) => void;
}) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM - 8 PM (13 hours: 8,9,10,11,12,13,14,15,16,17,18,19,20)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getEventsForCell = (day: Date, hour: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.startTime);
            const eventHour = eventDate.getHours();
            const isSameDay = eventDate.toDateString() === day.toDateString();
            const eventStartHour = eventDate.getHours();
            const eventEndHour = new Date(event.endTime).getHours();

            return isSameDay && hour >= eventStartHour && hour < eventEndHour;
        });
    };

    const getEventColor = (type: ScheduleEvent['type']) => {
        switch (type) {
            case 'course': return 'bg-blue-500';
            case 'service': return 'bg-green-500';
            case 'custom': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventHeight = (event: ScheduleEvent) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return durationHours * 48; // 48px per hour
    };

    const getEventTopOffset = (event: ScheduleEvent) => {
        const start = new Date(event.startTime);
        const minutes = start.getMinutes();
        return (minutes / 60) * 48; // 48px per hour, so minutes/60 * 48 for offset
    };

    return (
        <div className="min-w-max">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 sticky top-0 z-10">
                <div className="p-3 text-xs font-medium text-gray-500"></div>
                {days.slice(0, 7).map((day, i) => (
                    <div key={i} className="p-3 text-center border-l border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {dayNames[day.getDay()]}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                            {day.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            {hours.map(hour => (
                <div key={hour} className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 dark:border-gray-700">
                    {/* Time Label */}
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-right pr-3">
                        {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : `${hour} AM`}
                    </div>

                    {/* Day Cells */}
                    {days.slice(0, 7).map((day, dayIndex) => {
                        const cellEvents = getEventsForCell(day, hour);
                        const isFirstHourOfEvent = cellEvents.some(e => new Date(e.startTime).getHours() === hour);

                        return (
                            <div
                                key={dayIndex}
                                onClick={() => onCellClick(day, hour)}
                                className="relative border-l border-gray-200 dark:border-gray-700 h-12 hover:bg-gray-50 dark:hover:bg-zinc-700/30 cursor-pointer transition-colors"
                            >
                                {/* Render events that start in this cell */}
                                {isFirstHourOfEvent && cellEvents.filter(e => new Date(e.startTime).getHours() === hour).map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                        className={`absolute inset-x-1 z-10 ${getEventColor(event.type)} text-white rounded px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                                        style={{
                                            height: `${getEventHeight(event)}px`,
                                            top: `${getEventTopOffset(event)}px`
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Second week if exists */}
            {days.length > 7 && (
                <>
                    {/* Second week header */}
                    <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 sticky top-0 z-10 mt-4">
                        <div className="p-3 text-xs font-medium text-gray-500"></div>
                        {days.slice(7, 14).map((day, i) => (
                            <div key={i} className="p-3 text-center border-l border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {dayNames[day.getDay()]}
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second week rows */}
                    {hours.map(hour => (
                        <div key={`week2-${hour}`} className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-right pr-3">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : `${hour} AM`}
                            </div>

                            {days.slice(7, 14).map((day, dayIndex) => {
                                const cellEvents = getEventsForCell(day, hour);
                                const isFirstHourOfEvent = cellEvents.some(e => new Date(e.startTime).getHours() === hour);

                                return (
                                    <div
                                        key={dayIndex}
                                        onClick={() => onCellClick(day, hour)}
                                        className="relative border-l border-gray-200 dark:border-gray-700 h-12 hover:bg-gray-50 dark:hover:bg-zinc-700/30 cursor-pointer transition-colors"
                                    >
                                        {isFirstHourOfEvent && cellEvents.filter(e => new Date(e.startTime).getHours() === hour).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                                className={`absolute inset-x-1 z-10 ${getEventColor(event.type)} text-white rounded px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity overflow-hidden`}
                                                style={{
                                                    height: `${getEventHeight(event)}px`,
                                                    top: `${getEventTopOffset(event)}px`
                                                }}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

// Event Dialog Component
function EventDialog({ event, defaultDate, defaultHour, courses, services, onSave, onDelete, onClose }: {
    event: ScheduleEvent | null;
    defaultDate: Date | null;
    defaultHour: number | null;
    courses: Course[];
    services: ImedaService[];
    onSave: (event: ScheduleEvent) => void;
    onDelete: (eventId: string) => void;
    onClose: () => void;
}) {
    const [type, setType] = useState<ScheduleEvent['type']>(event?.type || 'course');
    const [courseId, setCourseId] = useState(event?.courseId || '');
    const [serviceId, setServiceId] = useState(event?.serviceId || '');
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(() => {
        if (event) return format(new Date(event.startTime), 'yyyy-MM-dd');
        if (defaultDate) return format(defaultDate, 'yyyy-MM-dd');
        return format(new Date(), 'yyyy-MM-dd');
    });
    const [startTime, setStartTime] = useState(() => {
        if (event) {
            const d = new Date(event.startTime);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        if (defaultHour !== null) return `${String(defaultHour).padStart(2, '0')}:00`;
        return '09:00';
    });
    const [endTime, setEndTime] = useState(() => {
        if (event) {
            const d = new Date(event.endTime);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        if (defaultHour !== null) return `${String(defaultHour + 1).padStart(2, '0')}:00`;
        return '10:00';
    });

    // Auto-fill title based on type
    useEffect(() => {
        if (type === 'course') {
            setTitle('Formation');
        } else if (type === 'service' && serviceId) {
            const service = services.find(s => s.id === serviceId);
            if (service) setTitle(service.name);
        }
    }, [type, serviceId, services]);

    const handleSubmit = () => {
        // Course type doesn't require selection, always valid
        // Service type requires service selection
        if (type === 'service' && !serviceId) {
            showToast.error('Please select a service');
            return;
        }

        if (type === 'custom' && !title.trim()) {
            showToast.error('Title is required');
            return;
        }

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (endDateTime <= startDateTime) {
            showToast.error('End time must be after start time');
            return;
        }

        const newEvent: ScheduleEvent = {
            id: event?.id || crypto.randomUUID(),
            type,
            courseId: undefined,  // Not storing course reference
            serviceId: type === 'service' ? serviceId : undefined,
            title: type === 'course' ? 'Formation' : title,
            startTime: startDateTime,
            endTime: endDateTime,
        };

        onSave(newEvent);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event ? 'Edit Event' : 'New Event'}
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Type *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['course', 'service', 'custom'] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-3 py-2 text-sm font-medium rounded capitalize ${type === t
                                        ? 'bg-imeda text-white'
                                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Service Selector */}
                    {type === 'service' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Service *
                            </label>
                            <select
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                            >
                                <option value="">Select Service</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Title - Only for Custom type */}
                    {type === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter custom title"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                            />
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                step="1800"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Time *
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                step="1800"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    {event ? (
                        <button
                            onClick={() => onDelete(event.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm font-medium"
                        >
                            Delete
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-imeda text-white hover:opacity-90 rounded text-sm font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== TAB 4: ACADEMIA =====
function AcademiaTab({ seminar, courses, onUpdate }: {
    seminar: Seminar;
    courses: Course[];
    onUpdate: () => void;
}) {
    const [saving, setSaving] = useState(false);
    const [courseIds, setCourseIds] = useState<string[]>(seminar.courseIds);
    const [documents, setDocuments] = useState<SeminarDocument[]>(seminar.documents);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(seminar.courseIds));
    const [uploadingCourseId, setUploadingCourseId] = useState<string | null>(null);

    const toggleCourse = (courseId: string) => {
        const updated = courseIds.includes(courseId)
            ? courseIds.filter(id => id !== courseId)
            : [...courseIds, courseId];
        setCourseIds(updated);

        // Auto-expand newly added courses
        if (!courseIds.includes(courseId)) {
            setExpandedCourses(prev => new Set([...prev, courseId]));
        }
    };

    const toggleExpanded = (courseId: string) => {
        setExpandedCourses(prev => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSeminarAcademia(seminar.id, { courseIds, documents });
            showToast.success('Courses updated');
            onUpdate();
        } catch (error) {
            console.error('Error saving:', error);
            showToast.error('Failed to save courses');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, courseId: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingCourseId(courseId);
        try {
            const uploadedDocs: SeminarDocument[] = [];
            for (const file of Array.from(files)) {
                const doc = await uploadSeminarDocument(file, seminar.id, courseId);
                uploadedDocs.push(doc);
            }

            const newDocs = [...documents, ...uploadedDocs];
            setDocuments(newDocs);
            await updateSeminarAcademia(seminar.id, { documents: newDocs });
            showToast.success(`${uploadedDocs.length} document(s) uploaded`);
            onUpdate();
        } catch (error) {
            console.error('Error uploading documents:', error);
            showToast.error('Failed to upload documents');
        } finally {
            setUploadingCourseId(null);
            e.target.value = '';
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        const docToDelete = documents.find(d => d.id === docId);
        if (!docToDelete) return;

        try {
            await deleteSeminarDocument(docToDelete.url);
            const newDocs = documents.filter(d => d.id !== docId);
            setDocuments(newDocs);
            await updateSeminarAcademia(seminar.id, { documents: newDocs });
            showToast.success('Document deleted');
            onUpdate();
        } catch (error) {
            console.error('Error deleting document:', error);
            showToast.error('Failed to delete document');
        }
    };

    const getDocumentsForCourse = (courseId: string) => {
        return documents.filter(d => d.courseId === courseId);
    };

    const selectedCourses = courses.filter(c => courseIds.includes(c.id));

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg space-y-6">
            {/* Course Selection */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Select Courses
                </label>
                <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded">
                    {courses.map(course => (
                        <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCourse(course.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${courseIds.includes(course.id)
                                ? 'bg-imeda text-white'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            {course.formationId} - {course.title}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{courseIds.length} course(s) selected</p>
            </div>

            {/* Course Materials - Per Course */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Course Materials
                </h3>

                {selectedCourses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Select courses above to add materials</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedCourses.map(course => {
                            const courseDocs = getDocumentsForCourse(course.id);
                            const isExpanded = expandedCourses.has(course.id);
                            const isUploading = uploadingCourseId === course.id;

                            return (
                                <div
                                    key={course.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                >
                                    {/* Course Header */}
                                    <button
                                        onClick={() => toggleExpanded(course.id)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-imeda/10 rounded flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-imeda" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {course.formationId} - {course.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {courseDocs.length} document(s)
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Course Content (Expandable) */}
                                    {isExpanded && (
                                        <div className="p-4 space-y-4 bg-white dark:bg-zinc-800">
                                            {/* Upload Section */}
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={(e) => handleFileUpload(e, course.id)}
                                                    disabled={isUploading}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                                                />
                                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center hover:border-imeda transition-colors">
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-imeda mb-2"></div>
                                                            <p className="text-xs text-gray-500">Uploading...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                Click to upload materials for this course
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Documents List */}
                                            {courseDocs.length > 0 && (
                                                <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                    {courseDocs.map(doc => (
                                                        <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-imeda/10 rounded flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-imeda" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {doc.fileType.toUpperCase()} • {format(doc.uploadedAt, 'MMM d, yyyy')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <a
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 text-gray-400 hover:text-imeda transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium rounded disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Courses'}
                </button>
            </div>
        </div>
    );
}

// ===== DOCUMENTS TAB =====
function DocumentsTab({ seminar, clients, onUpdate }: { seminar: Seminar; clients: ClientFull[]; onUpdate: () => void }) {
    const [generating, setGenerating] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Generator State
    const [selectedParticipantId, setSelectedParticipantId] = useState('');
    const [docType, setDocType] = useState<'invitation_letter' | 'welcome_pack' | 'certificate'>('invitation_letter');
    const [metadata, setMetadata] = useState({ embassy: '', notes: '' });

    // Template State
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    const generatedDocs = seminar.generatedDocuments || [];

    // Load templates when dialog opens
    useEffect(() => {
        if (dialogOpen) {
            getDocumentTemplates().then(setTemplates);
        }
    }, [dialogOpen]);

    const availableTemplates = templates.filter(t =>
        t.isActive &&
        t.type === docType &&
        (!t.campusIds || t.campusIds.length === 0 || t.campusIds.includes(seminar.campusId))
    );

    // Reset template selection when doc type changes
    useEffect(() => {
        setSelectedTemplateId('');
    }, [docType]);

    // Auto-select first template if available and none selected
    useEffect(() => {
        if (availableTemplates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(availableTemplates[0].id);
        }
    }, [availableTemplates, selectedTemplateId]);

    const handleGenerate = async () => {
        if (!selectedParticipantId) {
            showToast.error('Please select a participant');
            return;
        }

        const template = availableTemplates.find(t => t.id === selectedTemplateId);
        if (!template) {
            showToast.error('Please select a template');
            return;
        }

        setGenerating(true);
        try {
            const templateSnapshot = {
                subject: template.subject,
                subtitle: template.subtitle,
                body: template.body,
                layout: template.layout
            };

            const docsToCreate: GeneratedDocument[] = [];

            if (selectedParticipantId === 'all') {
                // Batch create for all participants
                seminar.participants.forEach(p => {
                    docsToCreate.push({
                        id: crypto.randomUUID(),
                        type: docType,
                        participantId: p.id,
                        createdAt: new Date(),
                        metadata: {
                            ...metadata,
                            templateId: template.id,
                            templateSnapshot
                        }
                    });
                });
            } else {
                // Single create
                docsToCreate.push({
                    id: crypto.randomUUID(),
                    type: docType,
                    participantId: selectedParticipantId,
                    createdAt: new Date(),
                    metadata: {
                        ...metadata,
                        templateId: template.id,
                        templateSnapshot
                    }
                });
            }

            if (docsToCreate.length === 0) return;

            await addGeneratedDocuments(seminar.id, docsToCreate);

            // Open Print View
            const docIds = docsToCreate.map(d => d.id).join(',');
            // If strictly single, keep old format just in case, or just use docIds which new print view will handle?
            // User requested robust solution. I'll use docIds param.
            // But to be safe for old behavior, if 1 doc, I can use docId, if >1 I use docIds.
            // Actually I'll upgrade print view to support both or verify logic.
            // Since I'm updating print view next, I'll prefer `docIds` for batch.
            // For backward compatibility (bookmarking?), I should keep supporting `docId`.

            const queryParam = docsToCreate.length === 1 ? `docId=${docsToCreate[0].id}` : `docIds=${docIds}`;
            const url = `/dashboard/imeda/seminars/${seminar.id}/documents/print?${queryParam}`;

            window.open(url, '_blank');

            showToast.success(`${docsToCreate.length} document(s) generated`);
            setDialogOpen(false);
            onUpdate();
        } catch (error) {
            console.error('Error generating document:', error);
            showToast.error('Failed to generate document');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteGenerated = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document record?')) return;

        try {
            const newDocs = generatedDocs.filter(d => d.id !== docId);
            await updateSeminarGeneratedDocuments(seminar.id, newDocs);
            showToast.success('Document deleted');
            onUpdate();
        } catch (error) {
            console.error('Error deleting generated document:', error);
            showToast.error('Failed to delete document');
        }
    };

    const getParticipantDetails = (pId: string) => {
        const p = seminar.participants.find(part => part.id === pId);
        if (!p) return null;
        const client = clients.find(c => c.id === p.clientId);
        const contact = client?.contacts?.[p.contactIndex];
        return { p, client, contact };
    };

    return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Generated Documents</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Create official documents using dynamic templates.
                    </p>
                </div>
                <button
                    onClick={() => { setDialogOpen(true); setSelectedTemplateId(''); }}
                    className="flex items-center gap-2 px-3 py-2 bg-imeda text-white hover:opacity-90 rounded text-xs font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Generate New
                </button>
            </div>

            {/* List */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {generatedDocs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-zinc-900">
                        <p className="text-sm text-gray-400">No documents generated yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {generatedDocs.map((doc) => (
                            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {doc.type === 'invitation_letter' ? 'Invitation Letter' : doc.type}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(() => {
                                                const details = getParticipantDetails(doc.participantId);
                                                return details?.contact?.name
                                                    ? `${details.contact.name} (${doc.type === 'invitation_letter' ? 'Letter' : 'Doc'})`
                                                    : (details?.p?.participantId || 'Unknown');
                                            })()} • {format(doc.createdAt, 'MMM d, yyyy HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => window.open(`/dashboard/imeda/seminars/${seminar.id}/documents/print?docId=${doc.id}`, '_blank')}
                                    className="p-2 text-gray-400 hover:text-imeda transition-colors"
                                    title="Reprint / View"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteGenerated(doc.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete Record"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Generator Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Document</h3>
                            <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Type */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Document Type</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
                                >
                                    <option value="invitation_letter">Invitation Letter</option>
                                    <option value="welcome_pack">Welcome Pack (Multi-page)</option>
                                    <option value="certificate" disabled>Certificate (Coming Soon)</option>
                                </select>
                            </div>

                            {/* Template Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Select Template</label>
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm disabled:bg-gray-100"
                                    disabled={availableTemplates.length === 0}
                                >
                                    {availableTemplates.length === 0 ? (
                                        <option value="">No templates available</option>
                                    ) : (
                                        availableTemplates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))
                                    )}
                                </select>
                                {availableTemplates.length === 0 && (
                                    <p className="text-[10px] text-red-500 mt-1">
                                        No active template found for this document type and campus. Please create one in Settings.
                                    </p>
                                )}
                            </div>

                            {/* Participant */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Select Participant</label>
                                <select
                                    value={selectedParticipantId}
                                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
                                >
                                    <option value="">Select...</option>
                                    <option value="all" className="font-bold text-imeda">All Participants ({seminar.participants.length})</option>
                                    {seminar.participants.map(p => {
                                        const details = getParticipantDetails(p.id);
                                        const label = details?.contact?.name
                                            ? `${details.contact.name} (${p.participantId})`
                                            : p.participantId;

                                        return (
                                            <option key={p.id} value={p.id}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Embassy field removed as per request */}
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-4 py-2 border text-sm rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || availableTemplates.length === 0}
                                className="px-4 py-2 bg-imeda text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
                            >
                                {generating ? 'Generating...' : 'Generate & Print'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
