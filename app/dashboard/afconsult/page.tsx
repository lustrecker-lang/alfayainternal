'use client';

import { useState, useEffect } from 'react';
import { Users, Briefcase, UserCheck, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getProjects } from '@/lib/project';
import { getClients, getTransactions, calculateSummary, formatCurrency } from '@/lib/finance';
import { getConsultants } from '@/lib/staff';
import type { Project } from '@/types/project';

export default function AfconsultPage() {
    const [stats, setStats] = useState({
        clients: 0,
        projects: 0,
        staff: 0,
        profitability: 0
    });
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [clientsData, projectsData, staffData, transactionsData] = await Promise.all([
                getClients('afconsult'),
                getProjects('afconsult'),
                getConsultants('afconsult'),
                getTransactions(undefined, undefined, 'afconsult')
            ]);

            const financialSummary = calculateSummary(transactionsData);

            setStats({
                clients: clientsData.length,
                projects: projectsData.length,
                staff: staffData.length,
                profitability: financialSummary.netProfit
            });

            setRecentProjects(projectsData.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, colorClass, isCurrency = false }: any) => (
        <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
            <div className={`flex items-center gap-4 mb-3 ${colorClass}`}>
                <Icon className="w-5 h-5" />
                <h3 className="text-xs font-normal uppercase tracking-widest font-sans">{title}</h3>
            </div>
            <p className="text-3xl font-normal text-gray-900 dark:text-white">
                {loading ? '-' : isCurrency ? formatCurrency(Number(value)) : value}
            </p>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl text-gray-900 dark:text-white">Overview</h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Clients"
                    value={stats.clients}
                    icon={Users}
                    colorClass="text-afconsult"
                />
                <MetricCard
                    title="Active Projects"
                    value={stats.projects}
                    icon={Briefcase}
                    colorClass="text-afconsult"
                />
                <MetricCard
                    title="Consultants"
                    value={stats.staff}
                    icon={UserCheck}
                    colorClass="text-afconsult"
                />
                <MetricCard
                    title="Profitability"
                    value={stats.profitability}
                    icon={TrendingUp}
                    colorClass={stats.profitability >= 0 ? "text-green-600" : "text-red-500"}
                    isCurrency={true}
                />
            </div>

            {/* Recent Projects */}
            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.25rem' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-normal text-gray-900 dark:text-white">Recent Projects</h2>
                    <Link href="/dashboard/afconsult/projects" className="text-sm text-afconsult hover:underline flex items-center gap-1 font-sans">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500 font-sans">Loading projects...</div>
                ) : recentProjects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-sans">
                        No active projects found.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentProjects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/afconsult/projects/${project.id}`}
                                className="block"
                            >
                                <div className="flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-zinc-700">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white font-sans">{project.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sans">{project.clientName}</p>
                                    </div>
                                    <div className="text-xs text-gray-400 font-sans">
                                        {project.createdAt?.toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
