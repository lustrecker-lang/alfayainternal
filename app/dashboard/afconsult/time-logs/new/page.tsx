'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NewTimeLogPage() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        consultant: '',
        client: '',
        hours: '',
        description: '',
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/afconsult/time-logs">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Hours</h1>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Hours *</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                placeholder="e.g., 4.5"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Consultant *</label>
                        <select
                            value={formData.consultant}
                            onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="">Select consultant...</option>
                            <option value="a">Consultant A</option>
                            <option value="b">Consultant B</option>
                            <option value="c">Consultant C</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Client *</label>
                        <select
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                        >
                            <option value="">Select client...</option>
                            <option value="global">Global Industries</option>
                            <option value="tech">Tech Solutions</option>
                            <option value="green">Green Energy Ltd</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            placeholder="What work was performed during this time?"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Link href="/dashboard/afconsult/time-logs" className="flex-1">
                            <button type="button" className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button type="submit" className="flex-1 py-3 bg-afconsult text-white rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            Log Hours
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
