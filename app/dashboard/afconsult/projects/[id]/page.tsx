'use client';

import { ArrowLeft, Save, Trash2, Clock, Calendar, User, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        name: 'Digital Transformation Strategy',
        client: 'Global Industries',
        lead: 'Consultant A',
        status: 'In Progress',
        startDate: '2026-01-02',
        endDate: '2026-06-30',
        description: 'Comprehensive digital transformation roadmap for the manufacturing division, including legacy system audit and cloud migration strategy.',
        budget: '250,000.00',
        currency: 'AED',
    });

    const handleSave = () => {
        alert('Save functionality - would update project data');
    };

    const confirmDelete = () => {
        alert('Delete functionality - would archive project and redirect');
        setShowDeleteDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/projects">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                    Project Details
                </h1>

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
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Always Editable Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <form className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Client</label>
                                        <select
                                            value={formData.client}
                                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="Global Industries">Global Industries</option>
                                            <option value="Tech Solutions">Tech Solutions</option>
                                            <option value="Green Energy Ltd">Green Energy Ltd</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Project Lead</label>
                                        <select
                                            value={formData.lead}
                                            onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="Consultant A">Consultant A</option>
                                            <option value="Consultant B">Consultant B</option>
                                            <option value="Consultant C">Consultant C</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="Planning">Planning</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="On Hold">On Hold</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Budget ({formData.currency})</label>
                                        <input
                                            type="text"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Timing & Schedule</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Estimated End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Project Description</h3>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none resize-none font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </form>
                    </div>

                    {/* Milestones / Recent Updates */}
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans">Key Milestones</h3>
                            <button className="text-xs font-normal text-afconsult hover:underline font-sans uppercase">Add Milestone</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Initial Research & Audit', date: 'Feb 15, 2026', completed: true },
                                { name: 'Cloud Migration Strategy', date: 'Mar 20, 2026', completed: false },
                                { name: 'Legacy System Integration', date: 'Apr 10, 2026', completed: false },
                            ].map((milestone, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50" style={{ borderRadius: '0.25rem' }}>
                                    <div className="flex items-center gap-3">
                                        {milestone.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-gray-400" />
                                        )}
                                        <div>
                                            <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{milestone.name}</p>
                                            <p className="text-[10px] text-gray-500 font-sans uppercase tracking-wider">Due: {milestone.date}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-normal text-gray-400 hover:text-afconsult transition-colors font-sans uppercase">Edit</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary & Team */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Project Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Project Lead</p>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{formData.lead}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Client Partner</p>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">{formData.client}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Timeline</p>
                                    <p className="text-sm font-normal text-gray-900 dark:text-white font-sans">Jan - Jun 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Recent Documents</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <FileText className="w-4 h-4 text-gray-400 group-hover:text-afconsult transition-colors" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-sans group-hover:text-afconsult transition-colors">Phase 1 Proposal.pdf</span>
                            </div>
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <FileText className="w-4 h-4 text-gray-400 group-hover:text-afconsult transition-colors" />
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-sans group-hover:text-afconsult transition-colors">Integration Spec v2.docx</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Archive Project?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to archive this project? This will move it to the historical archive.
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
