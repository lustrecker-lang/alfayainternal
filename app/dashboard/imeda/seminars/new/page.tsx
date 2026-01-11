'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building2, Calendar } from 'lucide-react';
import { createSeminar } from '@/lib/seminars';
import { getCampuses } from '@/lib/campuses';
import { getClients, type ClientFull } from '@/lib/finance';
import { getConsultants } from '@/lib/staff';
import { getCourses } from '@/lib/courses';
import { showToast } from '@/lib/toast';
import type { Campus, CampusOffice } from '@/types/finance';
import type { Consultant } from '@/types/staff';
import type { Course } from '@/types/course';

export default function NewSeminarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        campusId: '',
        officeIds: [] as string[],
        assignedStaffIds: [] as string[],
        courseIds: [] as string[],
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [campusesData, clientsData, staffData, coursesData] = await Promise.all([
                getCampuses(),
                getClients('imeda'),
                getConsultants('imeda'),
                getCourses('imeda'),
            ]);
            setCampuses(campusesData);
            setClients(clientsData);
            setStaff(staffData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showToast.error('Seminar name is required');
            return;
        }
        if (!formData.campusId) {
            showToast.error('Please select a campus');
            return;
        }
        // Client and participants can be added after creation in the edit page
        if (!formData.startDate || !formData.endDate) {
            showToast.error('Please set start and end dates');
            return;
        }

        setSaving(true);
        try {
            const selectedCampus = campuses.find(c => c.id === formData.campusId);
            const campusName = selectedCampus?.name || 'UNK';

            const newSeminarId = await createSeminar(
                {
                    name: formData.name,
                    campusId: formData.campusId,
                    officeIds: formData.officeIds,
                    participants: [],  // Start with empty participants, add them in edit page
                    assignedStaffIds: formData.assignedStaffIds,
                    courseIds: formData.courseIds,
                    startDate: new Date(formData.startDate),
                    endDate: new Date(formData.endDate),
                    documents: [],
                    unitId: 'imeda',
                },
                campusName
            );

            showToast.success('Seminar created successfully');
            router.push(`/dashboard/imeda/seminars/${newSeminarId}`);
        } catch (error) {
            console.error('Error creating seminar:', error);
            showToast.error('Failed to create seminar');
        } finally {
            setSaving(false);
        }
    };

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

    const toggleCourse = (courseId: string) => {
        const updated = formData.courseIds.includes(courseId)
            ? formData.courseIds.filter(id => id !== courseId)
            : [...formData.courseIds, courseId];
        setFormData({ ...formData, courseIds: updated });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
            </div>
        );
    }

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
                        <p className="text-xs text-gray-500 dark:text-gray-400">New Seminar</p>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Seminar</h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Creating...' : 'Create Seminar'}
                </button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-6" style={{ borderRadius: '0.5rem' }}>
                <div className="space-y-6">
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
                            placeholder="e.g. Advanced Leadership Training 2024"
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
                                <p className="text-sm text-gray-400 py-2">
                                    {formData.campusId ? 'No offices available for this campus' : 'Select a campus first'}
                                </p>
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

                    {/* Note about participants */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            💡 <strong>Tip:</strong> After creating the seminar, you can add participants from multiple companies in the Participants tab.
                        </p>
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
                                Start Date *
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
                                End Date *
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

                    <p className="text-xs text-gray-400">
                        * Required fields. Add participants, courses, and documents after creation.
                    </p>
                </div>
            </div>
        </div>
    );
}
