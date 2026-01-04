'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, ExternalLink, Edit2, Trash2, GraduationCap, User } from 'lucide-react';
import { getCampuses, deleteCampus } from '@/lib/campuses';
import { getConsultants } from '@/lib/staff';
import type { Campus } from '@/types/finance';
import type { Consultant } from '@/types/staff';
import CampusEditor from '@/components/imeda/CampusEditor';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/lib/toast';
import { StandardImage } from '@/components/ui/StandardImage';

export default function CampusesPage() {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

    // Delete State
    const [campusToDelete, setCampusToDelete] = useState<Campus | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [campusesData, staffData] = await Promise.all([
                getCampuses(),
                getConsultants('imeda')
            ]);
            setCampuses(campusesData);
            setStaff(staffData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load campuses or staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredCampuses = campuses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (!campusToDelete) return;
        setIsDeleting(true);
        try {
            await deleteCampus(campusToDelete.id);
            showToast.success('Campus deleted successfully');
            loadData();
            setCampusToDelete(null);
        } catch (error) {
            console.error('Error deleting campus:', error);
            showToast.error('Failed to delete campus');
        } finally {
            setIsDeleting(false);
        }
    };

    const getDirector = (id?: string) => {
        if (!id) return null;
        return staff.find(s => s.id === id);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <div>
                    <h1 className="text-2xl font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-imeda" />
                        Campuses
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage seminar locations and campus information.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelectedCampus(null);
                        setIsEditorOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans w-full md:w-auto"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Plus className="w-4 h-4" />
                    Add Campus
                </button>
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
                    placeholder="Search by name or country..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm shadow-sm"
                    style={{ borderRadius: '0.5rem' }}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                </div>
            ) : filteredCampuses.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No campuses found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first seminar campus'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampuses.map((campus) => {
                        const director = getDirector(campus.directorId);
                        return (
                            <div
                                key={campus.id}
                                className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 hover:border-imeda dark:hover:border-imeda transition-all group overflow-hidden flex flex-col"
                                style={{ borderRadius: '0.5rem' }}
                            >
                                {/* Image Placeholder or Actual Image */}
                                <div className="h-40 relative group">
                                    <StandardImage
                                        src={campus.imageUrl}
                                        alt={campus.name}
                                        containerClassName="w-full h-full"
                                        fallbackIcon={
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 bg-gray-100 dark:bg-zinc-900">
                                                <GraduationCap className="w-12 h-12" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest mt-2">No Image</span>
                                            </div>
                                        }
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <div className="flex items-center gap-2 px-2 py-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-imeda text-[9px] font-bold uppercase tracking-widest shadow-sm" style={{ borderRadius: '0.125rem' }}>
                                            {campus.country}
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => {
                                                setSelectedCampus(campus);
                                                setIsEditorOpen(true);
                                            }}
                                            className="p-1.5 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-imeda shadow-lg transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setCampusToDelete(campus)}
                                            className="p-1.5 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-red-500 shadow-lg transition-all"
                                            style={{ borderRadius: '0.375rem' }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 line-clamp-1">
                                        {campus.name}
                                    </h3>

                                    <div className="space-y-4 flex-1">
                                        {/* Director Info */}
                                        {campus.directorId && (
                                            <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-zinc-900/50" style={{ borderRadius: '0.25rem' }}>
                                                <StandardImage
                                                    src={director?.avatarUrl}
                                                    alt={director?.name || 'Director'}
                                                    containerClassName="w-8 h-8 rounded-full border border-gray-100 dark:border-zinc-700"
                                                    fallbackIcon={<User className="w-4 h-4 text-imeda opacity-50" />}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter leading-none mb-0.5">Director</p>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate tracking-tight">{director?.name || 'Unknown Director'}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                            <p className="line-clamp-2 leading-snug">
                                                {campus.address}
                                            </p>
                                        </div>

                                        {campus.googleMapsLink && (
                                            <a
                                                href={campus.googleMapsLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-imeda hover:underline font-semibold mt-auto"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Google Maps Location
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <CampusEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setSelectedCampus(null);
                }}
                onSave={loadData}
                campus={selectedCampus}
            />

            <ConfirmDialog
                isOpen={!!campusToDelete}
                onClose={() => setCampusToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Campus"
                message={`Are you sure you want to delete ${campusToDelete?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
