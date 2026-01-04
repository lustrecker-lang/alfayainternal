'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/project';
import { getClients } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import type { ClientBasic } from '@/types/finance';

export default function NewProjectPage() {
    const router = useRouter();
    const [clients, setClients] = useState<ClientBasic[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        clientId: '',
        description: '',
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await getClients('afconsult');
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast.error('Project name is required');
            return;
        }

        if (!formData.clientId) {
            showToast.error('Please select a client');
            return;
        }

        try {
            setSaving(true);
            const selectedClient = clients.find(c => c.id === formData.clientId);

            await createProject({
                name: formData.name.trim(),
                clientId: formData.clientId,
                clientName: selectedClient?.name || '',
                description: formData.description.trim(),
                unitId: 'afconsult',
            });

            showToast.success('Project created successfully');
            router.push('/dashboard/afconsult/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            showToast.error('Failed to create project');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/afconsult/projects">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">New Project</h1>
                <button
                    type="submit"
                    form="project-form"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <form id="project-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            style={{ borderRadius: '0.25rem' }}
                            placeholder="e.g., Digital Transformation Initiative"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Client *</label>
                        {loading ? (
                            <div className="text-sm text-gray-500 font-sans">Loading clients...</div>
                        ) : (
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                required
                            >
                                <option value="">Select a client...</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none resize-none font-sans"
                            style={{ borderRadius: '0.25rem' }}
                            placeholder="Project scope, objectives, deliverables..."
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
