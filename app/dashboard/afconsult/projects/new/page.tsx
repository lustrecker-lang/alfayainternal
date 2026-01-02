'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewProjectPage() {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        lead: '',
        status: 'Planning',
        description: '',
    });

    return (
        <div className="space-y-6">
            {/* Header with Back and Save */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/projects">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Project</h1>
                </div>
                <button type="submit" form="project-form" className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
                <form id="project-form" className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            placeholder="e.g., Digital Transformation Initiative"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Client *</label>
                        <select
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="">Select a client...</option>
                            <option value="global">Global Industries</option>
                            <option value="tech">Tech Solutions</option>
                            <option value="green">Green Energy Ltd</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Lead *</label>
                        <select
                            value={formData.lead}
                            onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="">Select lead consultant...</option>
                            <option value="a">Consultant A</option>
                            <option value="b">Consultant B</option>
                            <option value="c">Consultant C</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            placeholder="Project scope, objectives, deliverables..."
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
