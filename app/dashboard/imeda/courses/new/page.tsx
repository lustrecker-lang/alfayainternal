'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addCourse } from '@/lib/courses';
import { showToast } from '@/lib/toast';
import type { Course, CourseModule } from '@/types/course';

export default function NewImedaCoursePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        formationId: '',
        domain: '',
        title: '',
        objective: '',
        prerequisites: '',
        audience: '',
        methods: '',
        resources: '',
        evaluation: '',
    });

    // Modules State
    const [modules, setModules] = useState<CourseModule[]>([
        { title: '', order: 1 }
    ]);

    const handleModuleChange = (index: number, value: string) => {
        const newModules = [...modules];
        newModules[index].title = value;
        setModules(newModules);
    };

    const addModule = () => {
        setModules([
            ...modules,
            { title: '', order: modules.length + 1 }
        ]);
    };

    const removeModule = (index: number) => {
        if (modules.length > 1) {
            const newModules = modules.filter((_, i) => i !== index)
                .map((m, i) => ({ ...m, order: i + 1 })); // Reorder
            setModules(newModules);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.formationId.trim()) {
            showToast.error('Please fill in required fields (ID, Title)');
            return;
        }

        setSaving(true);
        try {
            // Filter empty modules
            const validModules = modules.filter(m => m.title.trim());

            await addCourse({
                ...formData,
                modules: validModules,
                unitId: 'imeda'
            });

            showToast.success('Course created successfully');
            router.push('/dashboard/imeda/courses');
        } catch (error) {
            console.error('Error creating course:', error);
            showToast.error('Failed to create course');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50 dark:bg-black z-10 py-4 border-b border-gray-200 dark:border-gray-800 -mx-8 px-8 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/imeda/courses">
                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">New Course</h1>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Creating...' : 'Create Course'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">

                {/* 1. Basic Information */}
                <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-imeda mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formation ID *</label>
                            <input
                                type="text"
                                value={formData.formationId}
                                onChange={(e) => setFormData({ ...formData, formationId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none font-mono text-sm"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., AHS-001"
                                required
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Full title of the course"
                                required
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Training Domain</label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., Action humanitaire et sociale"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Course Details */}
                <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-imeda mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Course Details</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Obectives</label>
                            <textarea
                                rows={3}
                                value={formData.objective}
                                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm leading-relaxed"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Main objectives of the course..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                                <textarea
                                    rows={3}
                                    value={formData.audience}
                                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Who is this course for?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prerequisites</label>
                                <textarea
                                    rows={3}
                                    value={formData.prerequisites}
                                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Required experience or knowledge..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teaching Methods</label>
                            <textarea
                                rows={2}
                                value={formData.methods}
                                onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="e.g., Case studies, workshops, lectures..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resources Provided</label>
                                <textarea
                                    rows={2}
                                    value={formData.resources}
                                    onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Software, manuals, access..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Evaluation Method</label>
                                <textarea
                                    rows={2}
                                    value={formData.evaluation}
                                    onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-imeda outline-none text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Tests, projects, exams..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Modules */}
                <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-imeda">Course Modules</h3>
                        <button
                            type="button"
                            onClick={addModule}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded text-xs font-medium transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Module
                        </button>
                    </div>

                    <div className="space-y-3">
                        {modules.map((module, index) => (
                            <div key={index} className="flex gap-4 items-start group">
                                <div className="mt-3 text-gray-300 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">
                                        {module.order % 1 !== 0 ? `Module ${Math.floor(module.order)} (Case Study/Extra)` : `Module ${module.order}`}
                                    </label>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => handleModuleChange(index, e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-imeda focus:bg-white dark:focus:bg-black outline-none transition-all"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder={`Title for Module ${index + 1}`}
                                    />
                                </div>
                                {modules.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeModule(index)}
                                        className="mt-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    );
}
