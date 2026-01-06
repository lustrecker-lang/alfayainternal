'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Save, ArrowLeft, Upload, Trash2, Building2, Users, BookOpen,
    Calendar, FileText, Plus, Check, X, ExternalLink
} from 'lucide-react';
import { getSeminarById, updateSeminar, uploadSeminarDocument, deleteSeminarDocument } from '@/lib/seminars';
import { getCampuses } from '@/lib/campuses';
import { getClients, type ClientFull } from '@/lib/finance';
import { getConsultants } from '@/lib/staff';
import { getCourses } from '@/lib/courses';
import { showToast } from '@/lib/toast';
import type { Seminar, SeminarDocument } from '@/types/seminar';
import type { Campus, CampusOffice } from '@/types/finance';
import type { Consultant } from '@/types/staff';
import type { Course } from '@/types/course';
import { format } from 'date-fns';

type Tab = 'main' | 'participants' | 'academic';

export default function SeminarDetailPage() {
    const params = useParams();
    const router = useRouter();
    const seminarId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('main');

    // Data
    const [seminar, setSeminar] = useState<Seminar | null>(null);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        campusId: '',
        officeIds: [] as string[],
        clientId: '',
        participantIds: [] as string[],
        assignedStaffIds: [] as string[],
        courseIds: [] as string[],
        startDate: '',
        endDate: '',
        documents: [] as SeminarDocument[],
    });

    // Document upload
    const [uploading, setUploading] = useState(false);

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

            setFormData({
                name: seminarData.name,
                campusId: seminarData.campusId,
                officeIds: seminarData.officeIds || [],
                clientId: seminarData.clientId,
                participantIds: seminarData.participantIds || [],
                assignedStaffIds: seminarData.assignedStaffIds || [],
                courseIds: seminarData.courseIds || [],
                startDate: format(seminarData.startDate, 'yyyy-MM-dd'),
                endDate: format(seminarData.endDate, 'yyyy-MM-dd'),
                documents: seminarData.documents || [],
            });
        } catch (error) {
            console.error('Error loading seminar:', error);
            showToast.error('Failed to load seminar');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showToast.error('Seminar name is required');
            return;
        }

        setSaving(true);
        try {
            await updateSeminar(seminarId, {
                ...formData,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
            });
            showToast.success('Seminar saved successfully');
        } catch (error) {
            console.error('Error saving seminar:', error);
            showToast.error('Failed to save seminar');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedDocs: SeminarDocument[] = [];
            for (const file of Array.from(files)) {
                const doc = await uploadSeminarDocument(file, seminarId);
                uploadedDocs.push(doc);
            }

            const newDocs = [...formData.documents, ...uploadedDocs];
            setFormData({ ...formData, documents: newDocs });

            // Save immediately
            await updateSeminar(seminarId, { documents: newDocs });
            showToast.success(`${uploadedDocs.length} document(s) uploaded`);
        } catch (error) {
            console.error('Error uploading documents:', error);
            showToast.error('Failed to upload documents');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        const docToDelete = formData.documents.find(d => d.id === docId);
        if (!docToDelete) return;

        try {
            await deleteSeminarDocument(docToDelete.url);
            const newDocs = formData.documents.filter(d => d.id !== docId);
            setFormData({ ...formData, documents: newDocs });
            await updateSeminar(seminarId, { documents: newDocs });
            showToast.success('Document deleted');
        } catch (error) {
            console.error('Error deleting document:', error);
            showToast.error('Failed to delete document');
        }
    };

    const selectedCampus = campuses.find(c => c.id === formData.campusId);
    const availableOffices: CampusOffice[] = selectedCampus?.offices || [];
    const selectedClient = clients.find(c => c.id === formData.clientId);
    const clientContacts = selectedClient?.contacts || [];

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

    const toggleCourse = (courseId: string) => {
        const updated = formData.courseIds.includes(courseId)
            ? formData.courseIds.filter(id => id !== courseId)
            : [...formData.courseIds, courseId];
        setFormData({ ...formData, courseIds: updated });
    };

    const toggleParticipant = (index: number) => {
        const indexStr = String(index);
        const updated = formData.participantIds.includes(indexStr)
            ? formData.participantIds.filter(id => id !== indexStr)
            : [...formData.participantIds, indexStr];
        setFormData({ ...formData, participantIds: updated });
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
        { id: 'main' as Tab, label: 'Main Information', icon: Building2 },
        { id: 'participants' as Tab, label: 'Participants', icon: Users },
        { id: 'academic' as Tab, label: 'Academic', icon: BookOpen },
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
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{formData.name || 'Untitled Seminar'}</h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-zinc-800 w-fit" style={{ borderRadius: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-zinc-700 text-imeda shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6" style={{ borderRadius: '0.5rem' }}>
                {/* Main Information Tab */}
                {activeTab === 'main' && (
                    <div className="space-y-6">
                        {/* Seminar Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Seminar Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                placeholder="e.g. Advanced Leadership Training 2024"
                            />
                        </div>

                        {/* Campus & Offices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Campus
                                </label>
                                <select
                                    value={formData.campusId}
                                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value, officeIds: [] })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                >
                                    <option value="">Select Campus</option>
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
                                    <p className="text-sm text-gray-400 py-2">No offices available for this campus</p>
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

                        {/* Client */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Client
                            </label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value, participantIds: [] })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
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

                        {/* Courses */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Courses
                            </label>
                            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded">
                                {courses.map(course => (
                                    <button
                                        key={course.id}
                                        type="button"
                                        onClick={() => toggleCourse(course.id)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${formData.courseIds.includes(course.id)
                                                ? 'bg-imeda text-white'
                                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-600'
                                            }`}
                                    >
                                        {course.formationId} - {course.title}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{formData.courseIds.length} course(s) selected</p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    Start Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                    End Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participants Tab */}
                {activeTab === 'participants' && (
                    <div className="space-y-4">
                        {!formData.clientId ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Select a client first to enroll participants</p>
                            </div>
                        ) : clientContacts.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No contacts found for this client</p>
                                <p className="text-xs text-gray-400 mt-1">Add contacts to the client to enroll them</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-500">
                                        {formData.participantIds.length} of {clientContacts.length} participants enrolled
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, participantIds: clientContacts.map((_, i) => String(i)) })}
                                            className="text-xs text-imeda hover:underline"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, participantIds: [] })}
                                            className="text-xs text-gray-500 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {clientContacts.map((contact, index) => {
                                        const isEnrolled = formData.participantIds.includes(String(index));
                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isEnrolled ? 'bg-imeda/5' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'
                                                    }`}
                                                onClick={() => toggleParticipant(index)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEnrolled ? 'bg-imeda text-white' : 'bg-gray-100 dark:bg-zinc-700 text-gray-400'
                                                        }`}>
                                                        {isEnrolled ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {contact.title ? `${contact.title} ` : ''}{contact.name || 'Unnamed Contact'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {contact.occupation || 'No title'} • {contact.email1 || 'No email'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 text-xs font-medium rounded ${isEnrolled
                                                        ? 'bg-imeda/10 text-imeda'
                                                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'
                                                    }`}>
                                                    {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Academic Tab */}
                {activeTab === 'academic' && (
                    <div className="space-y-6">
                        {/* Upload Section */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Upload Documents
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                                />
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center hover:border-imeda transition-colors">
                                    {uploading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda mb-2"></div>
                                            <p className="text-sm text-gray-500">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Drag and drop files here, or click to browse
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PDF, Word, PowerPoint, Excel, and more
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Documents List */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Uploaded Documents ({formData.documents.length})
                            </label>
                            {formData.documents.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No documents uploaded yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    {formData.documents.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-imeda/10 rounded flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-imeda" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {doc.fileType.toUpperCase()} • Uploaded {format(doc.uploadedAt, 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-imeda transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
