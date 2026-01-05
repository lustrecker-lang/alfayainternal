'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { getTeachers } from '@/lib/teachers';
import { getConsultants } from '@/lib/staff';
import type { Teacher, Coordinator } from '@/types/quote';
import type { ImedaTeacher } from '@/types/teacher';
import type { Consultant } from '@/types/staff';

interface StaffingSectionProps {
    standardTeachingHours: number;
    teachers: Teacher[];
    coordinators: Coordinator[];
    onTeachingHoursChange: (hours: number) => void;
    onAddTeacher: (teacher: Teacher) => void;
    onRemoveTeacher: (id: string) => void;
    onUpdateTeacher: (id: string, updates: Partial<Teacher>) => void;
    onAddCoordinator: (coordinator: Coordinator) => void;
    onRemoveCoordinator: (id: string) => void;
    onUpdateCoordinator: (id: string, updates: Partial<Coordinator>) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function StaffingSection({
    standardTeachingHours,
    teachers: teachersRaw,
    coordinators: coordinatorsRaw,
    onTeachingHoursChange,
    onAddTeacher,
    onRemoveTeacher,
    onUpdateTeacher,
    onAddCoordinator,
    onRemoveCoordinator,
    onUpdateCoordinator,
    isOpen,
    onToggle,
}: StaffingSectionProps) {
    const [availableTeachers, setAvailableTeachers] = useState<ImedaTeacher[]>([]);
    const [availableStaff, setAvailableStaff] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);

    // Ensure props are arrays (Firestore/Runtime defense)
    const teachers = Array.isArray(teachersRaw) ? teachersRaw : (Object.values(teachersRaw || {}) as Teacher[]);
    const coordinators = Array.isArray(coordinatorsRaw) ? coordinatorsRaw : (Object.values(coordinatorsRaw || {}) as Coordinator[]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [teachersData, staffData] = await Promise.all([
                getTeachers(),
                getConsultants('imeda')
            ]);
            setAvailableTeachers(teachersData);
            setAvailableStaff(staffData);
        } catch (error) {
            console.error('Error loading staffing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = (teacherId: string) => {
        const selectedTeacher = availableTeachers.find(t => t.id === teacherId);
        if (!selectedTeacher) return;

        // Check if already added
        if (teachers.some(t => t.teacherId === teacherId)) {
            return;
        }

        onAddTeacher({
            id: `teacher_${Date.now()}`,
            teacherId: selectedTeacher.id,
            name: selectedTeacher.fullName,
            hourlyRate: 0, // Manual rate for teachers
        });
    };

    const handleAddCoordinator = (staffId: string) => {
        const selectedStaff = availableStaff.find(s => s.id === staffId);
        if (!selectedStaff) return;

        // Check if already added
        if (coordinators.some(c => c.staffId === staffId)) {
            return;
        }

        onAddCoordinator({
            id: `coordinator_${Date.now()}`,
            staffId: selectedStaff.id,
            name: selectedStaff.name,
            dailyRate: selectedStaff.rate || 0, // Use stored rate if available
            enabled: true,
        });
    };

    // Get staff not yet added
    const availableForTeaching = availableTeachers.filter(
        t => !teachers.some(qt => qt.teacherId === t.id)
    );
    const availableForCoordinating = availableStaff.filter(
        s => !coordinators.some(qc => qc.staffId === s.id)
    );

    return (
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800" style={{ borderRadius: '0.5rem' }}>
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                style={{ borderRadius: '0.5rem' }}
            >
                <span className="text-sm font-medium text-gray-900 dark:text-white">Staffing</span>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Teaching Hours */}
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500 dark:text-gray-400">
                            Teaching Hours/Day:
                        </label>
                        <input
                            type="number"
                            min="0.5"
                            max="24"
                            step="0.5"
                            value={standardTeachingHours}
                            onChange={(e) => onTeachingHoursChange(Math.max(0.5, parseFloat(e.target.value) || 6))}
                            className="w-16 px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm text-center"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>

                    {/* Teachers */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Teachers (Hourly)</span>
                        </div>

                        {/* Added teachers */}
                        {teachers.length > 0 && (
                            <div className="space-y-2 mb-2">
                                {teachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        className="p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                                                {teacher.name}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={teacher.hourlyRate}
                                                onChange={(e) => onUpdateTeacher(teacher.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                                                placeholder="Rate"
                                                className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                            <span className="text-xs text-gray-400 flex-shrink-0">/hr</span>
                                            <button
                                                onClick={() => onRemoveTeacher(teacher.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add teacher dropdown */}
                        {loading ? (
                            <div className="text-xs text-gray-400 py-2">Loading teachers...</div>
                        ) : availableForTeaching.length === 0 && teachers.length === 0 ? (
                            <div className="text-xs text-gray-400 py-2">No teachers available. Add teachers first.</div>
                        ) : availableForTeaching.length > 0 ? (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) handleAddTeacher(e.target.value);
                                    e.target.value = '';
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Add teacher...</option>
                                {availableForTeaching.map((t) => (
                                    <option key={t.id} value={t.id}>{t.fullName}</option>
                                ))}
                            </select>
                        ) : null}
                    </div>

                    {/* Coordinators */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Coordinators (Daily)</span>
                        </div>

                        {/* Added coordinators */}
                        {coordinators.length > 0 && (
                            <div className="space-y-2 mb-2">
                                {coordinators.map((coordinator) => (
                                    <div
                                        key={coordinator.id}
                                        className="p-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
                                                {coordinator.name}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={coordinator.dailyRate}
                                                onChange={(e) => onUpdateCoordinator(coordinator.id, { dailyRate: parseFloat(e.target.value) || 0 })}
                                                placeholder="Rate"
                                                className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                            <span className="text-xs text-gray-400 flex-shrink-0">/day</span>
                                            <button
                                                onClick={() => onRemoveCoordinator(coordinator.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add coordinator dropdown */}
                        {loading ? (
                            <div className="text-xs text-gray-400 py-2">Loading...</div>
                        ) : availableForCoordinating.length === 0 && coordinators.length === 0 ? (
                            <div className="text-xs text-gray-400 py-2">No staff available. Add staff in Settings first.</div>
                        ) : availableForCoordinating.length > 0 ? (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) handleAddCoordinator(e.target.value);
                                    e.target.value = '';
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                                defaultValue=""
                            >
                                <option value="" disabled>+ Add coordinator...</option>
                                {availableForCoordinating.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
