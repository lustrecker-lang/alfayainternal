'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, Edit2, Trash2, ArrowLeft, Save, X, FileText,
    Check, AlertCircle, Info
} from 'lucide-react';
import { getDocumentTemplates, saveDocumentTemplate, deleteDocumentTemplate } from '@/lib/settings';
import { getCampuses } from '@/lib/campuses';
import { showToast } from '@/lib/toast';
import type { DocumentTemplate } from '@/types/settings';
import type { Campus } from '@/types/finance';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function DocumentTemplatesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<DocumentTemplate>>({});
    const [saving, setSaving] = useState(false);

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [templatesData, campusesData] = await Promise.all([
                getDocumentTemplates(),
                getCampuses()
            ]);
            setTemplates(templatesData);
            setCampuses(campusesData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTemplate({
            name: '',
            type: 'invitation_letter',
            campusIds: [], // Empty means All
            subject: 'INVITATION LETTER',
            subtitle: '',
            body: `Dear Sir/Madam,

We are pleased to confirm that **{{participant.name}}** (Passport No: {{participant.passport}}) has been registered to attending the seminar **"{{seminar.name}}"**.

Dates: {{seminar.startDate}} to {{seminar.endDate}}
Location: Dubai, UAE

Sincerely,
IMEDA Administration`,
            layout: {
                showLogo: true,
                showHeaderAddress: true,
                showDate: true,
                dateAlignment: 'right',
                showSubject: true,
                showFooter: true,
                showSignature: true,
                showStamp: false,
                signatureText: 'Authorized Signatory'
            },
            isActive: true
        });
        setIsEditorOpen(true);
    };

    const handleEdit = (template: DocumentTemplate) => {
        setEditingTemplate({
            ...template,
            layout: template.layout || {
                showLogo: true,
                showHeaderAddress: true,
                showDate: true,
                dateAlignment: 'right',
                // showRecipient removed
                showSubject: true,
                showFooter: true,
                showSignature: true,
                showStamp: false,
                signatureText: 'Authorized Signatory'
            }
        });
        setIsEditorOpen(true);
    };

    const handleSave = async () => {
        if (!editingTemplate.name || !editingTemplate.subject || !editingTemplate.body) {
            showToast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            await saveDocumentTemplate(editingTemplate as any);
            showToast.success('Template saved');
            setIsEditorOpen(false);
            loadData();
        } catch (error) {
            showToast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDocumentTemplate(deleteId);
            showToast.success('Template deleted');
            setTemplates(templates.filter(t => t.id !== deleteId));
        } catch (error) {
            showToast.error('Failed to delete template');
        } finally {
            setDeleteId(null);
        }
    };

    // Helper to toggle campus in array
    const toggleCampus = (campusId: string) => {
        const current = editingTemplate.campusIds || [];
        if (current.includes(campusId)) {
            setEditingTemplate({ ...editingTemplate, campusIds: current.filter(id => id !== campusId) });
        } else {
            setEditingTemplate({ ...editingTemplate, campusIds: [...current, campusId] });
        }
    };

    const toggleAllCampuses = () => {
        // If currently specific (has ids), clear it to make it All.
        // If currently All (empty), selecting "All" again does nothing implicitly, but maybe we want to unselect all?
        // Let's treat empty array as ALL.
        setEditingTemplate({ ...editingTemplate, campusIds: [] });
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.includes(searchQuery.toLowerCase())
    );

    const VARIABLES = [
        { label: 'Participant Name', code: '{{participant.name}}' },
        { label: 'Passport Number', code: '{{participant.passport}}' },
        { label: 'Occupation', code: '{{participant.occupation}}' },
        { label: 'Client / Company', code: '{{client.name}}' },
        { label: 'Seminar Name', code: '{{seminar.name}}' },
        { label: 'Start Date', code: '{{seminar.startDate}}' },
        { label: 'End Date', code: '{{seminar.endDate}}' },
        { label: 'Duration', code: '{{seminar.duration}}' },
        { label: 'Course Name', code: '{{course.name}}' },
        { label: 'Course Code', code: '{{course.code}}' },
        { label: 'Course Description', code: '{{course.description}}' },
        { label: 'Embassy Name', code: '{{embassy.name}}' },
        { label: 'IMEDA Legal Name', code: '{{company.legalName}}' },
        { label: 'IMEDA License', code: '{{company.license}}' },
        { label: 'IMEDA Address', code: '{{company.fullAddress}}' },
        { label: 'Campus Name', code: '{{campus.name}}' },
        { label: 'Campus City', code: '{{campus.city}}' },
        { label: 'Campus Country', code: '{{campus.country}}' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading templates...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/settings')} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Templates</h1>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white rounded hover:opacity-90 w-full md:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTemplates.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No templates found. Create one to get started.</div>
                    ) : (
                        filteredTemplates.map(template => (
                            <div key={template.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span className="uppercase tracking-wide px-1.5 py-0.5 bg-gray-100 rounded">{template.type.replace('_', ' ')}</span>
                                            <span>•</span>
                                            <span>
                                                {(!template.campusIds || template.campusIds.length === 0)
                                                    ? 'All Campuses'
                                                    : `${template.campusIds.length} Campus(es)`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(template)} className="p-2 text-gray-400 hover:text-blue-500">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteId(template.id)} className="p-2 text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Dialog */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-lg dark:text-white">
                                {editingTemplate.id ? 'Edit Template' : 'New Template'}
                            </h2>
                            <button onClick={() => setIsEditorOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Form */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Template Name</label>
                                        <input
                                            value={editingTemplate.name}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-900 dark:border-gray-700"
                                            placeholder="e.g. Standard Invitation"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                        <select
                                            value={editingTemplate.type}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value as any })}
                                            className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-900 dark:border-gray-700"
                                        >
                                            <option value="invitation_letter">Invitation Letter</option>
                                            <option value="welcome_pack">Welcome Pack</option>
                                            <option value="certificate">Certificate</option>
                                            <option value="visa_support">Visa Support</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subject Line</label>
                                    <input
                                        value={editingTemplate.subject}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                        className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-900 dark:border-gray-700"
                                        placeholder="SUBJECT: INVITATION LETTER"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (Optional)</label>
                                    <input
                                        value={editingTemplate.subtitle || ''}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, subtitle: e.target.value })}
                                        className="w-full px-3 py-2 border rounded text-sm dark:bg-zinc-900 dark:border-gray-700"
                                        placeholder="e.g. Séminaire exécutif en présentiel..."
                                    />
                                </div>



                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Body Template (Markdown supported)</label>
                                    <textarea
                                        value={editingTemplate.body}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                        className="w-full px-3 py-2 border rounded text-sm font-mono h-64 resize-none dark:bg-zinc-900 dark:border-gray-700"
                                        placeholder="Enter content..."
                                    />
                                </div>

                                {/* Layout Settings */}
                                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Layout Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showLogo ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showLogo: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Logo
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showHeaderAddress ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showHeaderAddress: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Header Address
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showDate ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showDate: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Date
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showSubject ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showSubject: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Subject Line
                                            </label>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showFooter ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showFooter: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Footer
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showSignature ?? true}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showSignature: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Signature Block
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editingTemplate.layout?.showStamp ?? false}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, showStamp: e.target.checked }
                                                    })}
                                                    className="rounded border-gray-300 text-imeda focus:ring-imeda"
                                                />
                                                Show Brand Stamp
                                            </label>
                                        </div>
                                    </div>

                                    {/* Advanced Layout Inputs */}
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        {editingTemplate.layout?.showFooter && (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Custom Footer Text (Optional)</label>
                                                <input
                                                    value={editingTemplate.layout.customFooter || ''}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, customFooter: e.target.value }
                                                    })}
                                                    placeholder="Overrides default footer..."
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-zinc-900 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                        {editingTemplate.layout?.showSignature && (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Signature Label</label>
                                                <input
                                                    value={editingTemplate.layout.signatureText || ''}
                                                    onChange={e => setEditingTemplate({
                                                        ...editingTemplate,
                                                        layout: { ...editingTemplate.layout!, signatureText: e.target.value }
                                                    })}
                                                    placeholder="e.g. Authorized Signatory"
                                                    className="w-full px-2 py-1 text-sm border rounded dark:bg-zinc-900 dark:border-gray-700"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Campus Selector */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2">Applied Campuses</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={toggleAllCampuses}
                                            className={`px-3 py-1.5 text-xs font-medium rounded border ${(!editingTemplate.campusIds || editingTemplate.campusIds.length === 0)
                                                ? 'bg-imeda text-white border-imeda'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            All Campuses
                                        </button>
                                        {campuses.map(campus => (
                                            <button
                                                key={campus.id}
                                                type="button"
                                                onClick={() => toggleCampus(campus.id)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded border ${editingTemplate.campusIds?.includes(campus.id)
                                                    ? 'bg-imeda text-white border-imeda'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {campus.name}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {(editingTemplate.campusIds?.length || 0) > 0
                                            ? "This template will ONLY appear for seminars in selected campuses."
                                            : "This template will appear for ALL seminars."}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Cheatsheet */}
                            <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 h-fit">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    Available Variables
                                </h4>
                                <div className="space-y-2">
                                    {VARIABLES.map(v => (
                                        <div key={v.code} className="flex flex-col">
                                            <span className="text-xs text-gray-500">{v.label}</span>
                                            <code className="text-xs bg-white border px-1 py-0.5 rounded w-fit select-all cursor-copy">
                                                {v.code}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded leading-relaxed">
                                    Copy and paste these codes into your body text. They will be replaced automatically when generating the document.
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-sm border rounded">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-imeda text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteId}
                title="Delete Template"
                message="Are you sure you want to delete this template? This cannot be undone."
                onConfirm={handleDelete}
                onClose={() => setDeleteId(null)}
            />
        </div>
    );
}
