'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

const PROJECTS = [
    { id: 1, name: 'Project Alpha', client: 'Global Industries', status: 'In Progress', lead: 'Consultant A' },
    { id: 2, name: 'Project Beta', client: 'Tech Solutions', status: 'In Progress', lead: 'Consultant B' },
    { id: 3, name: 'Market Analysis', client: 'Green Energy Ltd', status: 'Planning', lead: 'Consultant C' },
];

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl text-gray-900 dark:text-white">Active Engagements</h1>
                <Link href="/dashboard/afconsult/projects/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans" style={{ borderRadius: '0.25rem' }}>
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Project Name</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Client</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Status</th>
                            <th className="px-6 py-4 text-xs font-normal uppercase tracking-wider text-gray-500 dark:text-gray-400 font-sans">Lead</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {PROJECTS.map((project) => (
                            <tr
                                key={project.id}
                                className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <Link href={`/dashboard/afconsult/projects/${project.id}`} className="text-sm font-normal text-gray-900 dark:text-white hover:text-afconsult font-sans">
                                        {project.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{project.client}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-normal uppercase tracking-wider bg-afconsult/10 text-afconsult font-sans" style={{ borderRadius: '0.25rem' }}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-normal text-gray-600 dark:text-gray-400 font-sans">{project.lead}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
