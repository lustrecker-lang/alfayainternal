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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Engagements</h1>
                <Link href="/dashboard/afconsult/projects/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROJECTS.map((project) => (
                    <Link key={project.id} href={`/dashboard/afconsult/projects/${project.id}`}>
                        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-afconsult/10 text-afconsult rounded">
                                    {project.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{project.client}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center font-bold">
                                    {project.lead[project.lead.length - 1]}
                                </div>
                                <span>{project.lead}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
