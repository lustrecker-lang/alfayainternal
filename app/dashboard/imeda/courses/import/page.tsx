'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';
import Link from 'next/link';
import { addCourse } from '@/lib/courses';
import type { Course, CourseModule } from '@/types/course';
import { showToast } from '@/lib/toast';

interface RawCourse {
    "Formation ID": string;
    "Domaine de Formation": string;
    "Formation": string;
    "Objective": string;
    "Prerequisites": string;
    "Audience": string;
    "Methods": string;
    "Resources": string;
    "Evaluation": string;
    [key: string]: string; // For dynamic modules like "Module 1", "Module 2", etc.
}

export default function CourseImportPage() {
    const [stats, setStats] = useState({ total: 0, processed: 0, success: 0, errors: 0 });
    const [importing, setImporting] = useState(false);
    const [rawCourses, setRawCourses] = useState<RawCourse[]>([]);
    const [parsedCourses, setParsedCourses] = useState<Omit<Course, 'id'>[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [step, setStep] = useState<1 | 2>(1); // 1: Load/Preview, 2: Importing

    useEffect(() => {
        loadJsonFile();
    }, []);

    const loadJsonFile = async () => {
        try {
            const response = await fetch('/cleanedformations.json');
            const data: RawCourse[] = await response.json();
            setRawCourses(data);

            // Parse immediately to validate and prepare
            const parsed = data.map(raw => parseRawCourse(raw));
            setParsedCourses(parsed);
            setStats(prev => ({ ...prev, total: parsed.length }));

            addLog(`Loaded ${data.length} courses from cleanedformations.json`);
        } catch (error) {
            console.error('Error loading JSON:', error);
            addLog('Error loading JSON file. unexpected error.');
        }
    };

    const parseRawCourse = (raw: RawCourse): Omit<Course, 'id'> => {
        // Extract modules
        const modules: CourseModule[] = [];

        // Find all keys starting with "Module "
        Object.keys(raw).forEach(key => {
            if (key.startsWith('Module ')) {
                const moduleValue = raw[key];
                if (!moduleValue) return;

                // Extract order from key, e.g., "Module 1" -> 1, "Module 6__1" -> 6.1
                // Assuming simple structure for now based on user data
                // "Module 6__1" seems to be a submodule or ordered. 
                // Let's rely on simple parsing.

                // Remove "Module " prefix
                let orderStr = key.replace('Module ', '');
                // specific fix for "6__1" format if needed, though we can store as is or simple float
                orderStr = orderStr.replace('__', '.');

                const order = parseFloat(orderStr) || modules.length + 1;

                modules.push({
                    title: moduleValue,
                    order: order
                });
            }
        });

        // Sort modules by order
        modules.sort((a, b) => a.order - b.order);

        return {
            formationId: raw["Formation ID"] || '',
            domain: raw["Domaine de Formation"] || '',
            title: raw["Formation"] || '',
            objective: raw["Objective"] || '',
            prerequisites: raw["Prerequisites"] || '',
            audience: raw["Audience"] || '',
            methods: raw["Methods"] || '',
            resources: raw["Resources"] || '',
            evaluation: raw["Evaluation"] || '',
            modules: modules,
            unitId: 'imeda',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    };

    const addLog = (message: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
    };

    const startImport = async () => {
        setImporting(true);
        setStep(2);
        setStats({ total: parsedCourses.length, processed: 0, success: 0, errors: 0 });

        // Chunk sizes for processing (simulated batching via promises)
        const batchSize = 10;

        for (let i = 0; i < parsedCourses.length; i += batchSize) {
            const batch = parsedCourses.slice(i, i + batchSize);

            await Promise.all(batch.map(async (course) => {
                try {
                    await addCourse(course);
                    setStats(prev => ({ ...prev, success: prev.success + 1, processed: prev.processed + 1 }));
                } catch (error) {
                    console.error('Import error for ' + course.formationId, error);
                    setStats(prev => ({ ...prev, errors: prev.errors + 1, processed: prev.processed + 1 }));
                    addLog(`Error importing ${course.formationId}: ${(error as any).message}`);
                }
            }));

            // Small delay to prevent rate limiting if necessary, though Firestore scales well
            // await new Promise(resolve => setTimeout(resolve, 100));
        }

        setImporting(false);
        addLog('Import completed.');
        showToast.success('Import process completed!');
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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Import Courses</h1>
                </div>
                {step === 1 && rawCourses.length > 0 && (
                    <button
                        onClick={startImport}
                        disabled={importing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Upload className="w-4 h-4" />
                        Start Batch Import
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Status Card */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-imeda" />
                            Import Status
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400">Total Found</span>
                                <span className="text-gray-900 dark:text-white font-mono font-medium">{stats.total}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-blue-600">Processed</span>
                                <span className="text-blue-600 font-mono font-medium">{stats.processed}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-green-600">Successful</span>
                                <span className="text-green-600 font-mono font-medium">{stats.success}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-red-500">Errors</span>
                                <span className="text-red-500 font-mono font-medium">{stats.errors}</span>
                            </div>
                        </div>

                        {importing && (
                            <div className="mt-6">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-imeda h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(stats.processed / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-center mt-2 text-gray-500">
                                    {Math.round((stats.processed / stats.total) * 100)}% Complete
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-96 overflow-y-auto font-mono text-xs" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Activity Log</h3>
                        <div className="space-y-1.5">
                            {logs.map((log, i) => (
                                <div key={i} className="text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-1 last:border-0">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview / Data Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Data Preview {parsedCourses.length > 0 && `(${parsedCourses.length} items)`}
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[800px] overflow-y-auto">
                            {parsedCourses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Loading data...
                                </div>
                            ) : (
                                parsedCourses.slice(0, 100).map((course, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded text-gray-600 dark:text-gray-300">
                                                    {course.formationId}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {course.title}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{course.modules.length} modules</span>
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1 mb-2">
                                            {course.objective}
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {course.modules.slice(0, 3).map((m, i) => (
                                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 truncate max-w-[150px]">
                                                    {m.title}
                                                </span>
                                            ))}
                                            {course.modules.length > 3 && (
                                                <span className="text-[10px] px-1.5 py-0.5 text-gray-400">
                                                    +{course.modules.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {parsedCourses.length > 100 && (
                                <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 dark:bg-zinc-900/50">
                                    ... and {parsedCourses.length - 100} more items.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
