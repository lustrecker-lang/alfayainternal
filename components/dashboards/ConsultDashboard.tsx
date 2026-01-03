'use client';

import { Users, Briefcase, TrendingUp, DollarSign } from 'lucide-react';

export default function ConsultDashboard() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl text-gray-900 dark:text-white">Overview</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <div className="flex items-center gap-4 mb-3 text-afconsult">
                        <Users className="w-5 h-5" />
                        <h3 className="text-xs font-normal uppercase tracking-widest font-sans">Active Clients</h3>
                    </div>
                    <p className="text-3xl font-normal text-gray-900 dark:text-white">12</p>
                    <p className="text-xs text-green-600 font-sans mt-2">+2 this month</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <div className="flex items-center gap-4 mb-3 text-afconsult">
                        <Briefcase className="w-5 h-5" />
                        <h3 className="text-xs font-normal uppercase tracking-widest font-sans">Projects</h3>
                    </div>
                    <p className="text-3xl font-normal text-gray-900 dark:text-white">8</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans mt-2">6 Active, 2 Pending</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <div className="flex items-center gap-4 mb-3 text-afconsult">
                        <TrendingUp className="w-5 h-5" />
                        <h3 className="text-xs font-normal uppercase tracking-widest font-sans">Utilization</h3>
                    </div>
                    <p className="text-3xl font-normal text-gray-900 dark:text-white">85%</p>
                    <p className="text-xs text-green-600 font-sans mt-2">Optimal range</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <div className="flex items-center gap-4 mb-3 text-afconsult">
                        <DollarSign className="w-5 h-5" />
                        <h3 className="text-xs font-normal uppercase tracking-widest font-sans">Revenue</h3>
                    </div>
                    <p className="text-3xl font-normal text-gray-900 dark:text-white">AED 450k</p>
                    <p className="text-xs text-gray-400 font-sans mt-2">Current Quarter</p>
                </div>
            </div>

            {/* Secondary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-xl font-normal text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { text: 'New contract signed: Global Industries', date: '2 hours ago', type: 'contract' },
                            { text: 'Time log approved: Project Sirius', date: '5 hours ago', type: 'log' },
                            { text: 'Invoice generated: INV-2026-004', date: 'Yesterday', type: 'invoice' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-start pb-4 border-b border-gray-50 dark:border-zinc-800 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-normal text-gray-800 dark:text-gray-200 font-sans">{item.text}</p>
                                    <p className="text-xs text-gray-400 font-sans mt-1">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                    <h2 className="text-xl font-normal text-gray-900 dark:text-white mb-6">Project Status Overview</h2>
                    <div className="space-y-4">
                        {[
                            { name: 'Strategy Q1', progress: 75, status: 'In Progress' },
                            { name: 'Supply Chain Audit', progress: 30, status: 'In Progress' },
                            { name: 'Market Entry - KSA', progress: 95, status: 'Review' },
                        ].map((project, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-sans">
                                    <span className="text-gray-700 dark:text-gray-300">{project.name}</span>
                                    <span className="text-gray-500">{project.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden" style={{ borderRadius: '1rem' }}>
                                    <div
                                        className="h-full bg-afconsult transition-all duration-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
