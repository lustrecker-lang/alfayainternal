'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Calendar, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSeminars, deleteSeminar } from '@/lib/seminars';
import { getCampuses } from '@/lib/campuses';
import { getClients } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Seminar } from '@/types/seminar';
import type { Campus } from '@/types/finance';
import type { ClientFull } from '@/lib/finance';
import { format } from 'date-fns';

export default function SeminarsPage() {
    const router = useRouter();
    const [seminars, setSeminars] = useState<Seminar[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [seminarToDelete, setSeminarToDelete] = useState<Seminar | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [seminarsData, campusesData, clientsData] = await Promise.all([
                getSeminars('imeda'),
                getCampuses(),
                getClients('imeda'),
            ]);
            setSeminars(seminarsData);
            setCampuses(campusesData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load seminars');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!seminarToDelete) return;
        try {
            setIsDeleting(true);
            await deleteSeminar(seminarToDelete.id);
            showToast.success('Seminar deleted successfully');
            loadData();
            setSeminarToDelete(null);
        } catch (error) {
            console.error('Error deleting seminar:', error);
            showToast.error('Failed to delete seminar');
        } finally {
            setIsDeleting(false);
        }
    };

    const getCampusName = (campusId: string) => {
        return campuses.find(c => c.id === campusId)?.name || '-';
    };

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || '-';
    };

    const filteredSeminars = seminars.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.seminarId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCampusName(s.campusId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(s.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl text-gray-900 dark:text-white">Seminars</h1>
                <Link href="/dashboard/imeda/seminars/new">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium w-full md:w-auto"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Plus className="w-4 h-4" />
                        New Seminar
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, ID, campus, or client..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                    style={{ borderRadius: '0.25rem' }}
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                    </div>
                ) : filteredSeminars.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No seminars found</p>
                        <Link href="/dashboard/imeda/seminars/new">
                            <button className="mt-4 text-imeda hover:underline text-sm">
                                Create your first seminar
                            </button>
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900">
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Seminar ID</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Name</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Campus</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Client</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Dates</th>
                                <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Participants</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSeminars.map((seminar) => (
                                <tr
                                    key={seminar.id}
                                    onClick={() => router.push(`/dashboard/imeda/seminars/${seminar.id}`)}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                            {seminar.seminarId}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{seminar.name}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{getCampusName(seminar.campusId)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{getClientName(seminar.clientId)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {format(seminar.startDate, 'MMM d')} – {format(seminar.endDate, 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="w-3 h-3" />
                                            {seminar.participantIds.length}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSeminarToDelete(seminar);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!seminarToDelete}
                onClose={() => setSeminarToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Seminar"
                message={`Are you sure you want to delete "${seminarToDelete?.name}"? This will also delete all associated documents. This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
