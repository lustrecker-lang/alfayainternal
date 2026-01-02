'use client';

import { Plus, Search, Filter } from 'lucide-react';

const PROJECTS = [
    { id: 1, name: 'Project Alpha', client: 'Global Industries', status: 'In Progress', lead: 'Consultant A' },
    { id: 2, name: 'Project Beta', client: 'Tech Solutions', status: 'In Progress', lead: 'Consultant B' },
    { id: 3, name: 'Market Analysis', client: 'Green Energy Ltd', status: 'Planning', lead: 'Consultant C' },
];

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Active Engagements</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-afconsult outline-none transition-all"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROJECTS.map((project) => (
                    <div key={project.id} className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
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
                ))}
            </div>
        </div>
    );
}
