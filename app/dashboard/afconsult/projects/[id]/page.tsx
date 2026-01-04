'use client';

import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getProject, updateProject, deleteProject } from '@/lib/project';
import { getClients, type ClientFull } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import type { Project } from '@/types/project';

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        clientId: '',
        description: '',
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, clientsData] = await Promise.all([
                getProject(id),
                getClients('afconsult'),
            ]);

            if (projectData) {
                setProject(projectData);
                setFormData({
                    name: projectData.name,
                    clientId: projectData.clientId,
                    description: projectData.description,
                });
            }
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading project:', error);
            showToast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
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

            await updateProject(id, {
                name: formData.name.trim(),
                clientId: formData.clientId,
                clientName: selectedClient?.name || '',
                description: formData.description.trim(),
            });

            showToast.success('Project updated successfully');
        } catch (error) {
            console.error('Error updating project:', error);
            showToast.error('Failed to update project');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteProject(id);
            showToast.success('Project archived successfully');
            router.push('/dashboard/afconsult/projects');
        } catch (error) {
            console.error('Error archiving project:', error);
            showToast.error('Failed to archive project');
        }
        setShowDeleteDialog(false);
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500 font-sans">Loading project...</div>;
    }

    if (!project) {
        return (
            <div className="space-y-6">
                <Link href="/dashboard/afconsult/projects">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <div className="text-center py-12 text-gray-500 font-sans">
                    Project not found.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/afconsult/projects">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Project Details</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Archive Project"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                            style={{ borderRadius: '0.25rem' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Client *</label>
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
                    </div>

                    <div>
                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none resize-none font-sans"
                            style={{ borderRadius: '0.25rem' }}
                        />
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Archive Project?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to archive {formData.name}? This will remove it from the active projects list.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 bg-red-600 text-white font-normal hover:bg-red-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
