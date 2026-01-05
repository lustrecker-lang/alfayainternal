'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTeachers, deleteTeacher } from '@/lib/teachers';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { ImedaTeacher } from '@/types/teacher';

export default function TeachersPage() {
    const router = useRouter();
    const [teachers, setTeachers] = useState<ImedaTeacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherToDelete, setTeacherToDelete] = useState<ImedaTeacher | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const data = await getTeachers();
            setTeachers(data);
        } catch (error) {
            console.error('Error loading teachers:', error);
            showToast.error('Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!teacherToDelete) return;
        try {
            setIsDeleting(true);
            await deleteTeacher(teacherToDelete.id);
            showToast.success('Teacher deleted successfully');
            loadTeachers();
            setTeacherToDelete(null);
        } catch (error) {
            console.error('Error deleting teacher:', error);
            showToast.error('Failed to delete teacher');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.domains.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-imeda" />
                        Teachers
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage IMEDA teaching staff and their details
                    </p>
                </div>
                <Link href="/dashboard/imeda/teachers/new">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium w-full md:w-auto"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Teacher
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, domain, or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                    style={{ borderRadius: '0.25rem' }}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No teachers found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900">
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Name</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Domains</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Phone</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr
                                    key={teacher.id}
                                    onClick={() => router.push(`/dashboard/imeda/teachers/${teacher.id}`)}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{teacher.fullName}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.domains.slice(0, 3).map((domain, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex px-2 py-0.5 bg-imeda/10 text-imeda text-xs rounded"
                                                >
                                                    {domain}
                                                </span>
                                            ))}
                                            {teacher.domains.length > 3 && (
                                                <span className="text-xs text-gray-400">+{teacher.domains.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{teacher.contact.email}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{teacher.contact.phone || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTeacherToDelete(teacher);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!teacherToDelete}
                onClose={() => setTeacherToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Teacher"
                message={`Are you sure you want to delete "${teacherToDelete?.fullName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
