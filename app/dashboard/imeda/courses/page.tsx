'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { getCourses } from '@/lib/courses';
import type { Course } from '@/types/course';

export default function ImedaCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredCourses(courses);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = courses.filter(course => {
            const titleMatch = course.title.toLowerCase().includes(query);
            const idMatch = course.formationId.toLowerCase().includes(query);
            const domainMatch = course.domain.toLowerCase().includes(query);
            return titleMatch || idMatch || domainMatch;
        });
        setFilteredCourses(filtered);
    }, [searchQuery, courses]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await getCourses('imeda');
            setCourses(data);
            setFilteredCourses(data);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Course Management</h1>
                <Link href="/dashboard/imeda/courses/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        Add Course
                    </button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by title, ID, or domain..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none text-sm font-sans"
                    style={{ borderRadius: '0.25rem' }}
                />
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">ID</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Title</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Domain</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans text-center">Modules</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">Loading courses...</td>
                            </tr>
                        ) : filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">
                                    {searchQuery ? 'No courses match your search.' : 'No courses yet. Click "Add Course" to create one.'}
                                </td>
                            </tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr
                                    key={course.id}
                                    className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                    onClick={() => window.location.href = `/dashboard/imeda/courses/${course.id}`}
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-zinc-700 dark:text-gray-300 px-2 py-1 rounded font-mono">
                                            {course.formationId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-imeda/10 rounded-lg">
                                                <BookOpen className="w-4 h-4 text-imeda" />
                                            </div>
                                            <Link href={`/dashboard/imeda/courses/${course.id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-imeda font-sans line-clamp-2 max-w-md">
                                                {course.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-sans">
                                        {course.domain}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                            <Layers className="w-3.5 h-3.5" />
                                            {course.modules?.length || 0}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
