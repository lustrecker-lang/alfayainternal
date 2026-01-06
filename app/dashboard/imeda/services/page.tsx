'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Layers, Clock, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { getServices, deleteService, reorderServices } from '@/lib/services';
import type { ImedaService } from '@/types/finance';
import { StandardImage } from '@/components/ui/StandardImage';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ServiceEditor from '@/components/imeda/ServiceEditor';

export default function ServicesPage() {
    const [services, setServices] = useState<ImedaService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ImedaService | null>(null);

    // Delete State
    const [serviceToDelete, setServiceToDelete] = useState<ImedaService | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error('Error loading services:', error);
            showToast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        setIsDeleting(true);
        try {
            await deleteService(serviceToDelete.id);
            showToast.success('Service deleted successfully');
            loadData();
            setServiceToDelete(null);
        } catch (error) {
            console.error('Error deleting service:', error);
            showToast.error('Failed to delete service');
        } finally {
            setIsDeleting(false);
        }
    };

    const moveService = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= services.length) return;

        // Swap in local state first for instant feedback
        const newServices = [...services];
        [newServices[index], newServices[newIndex]] = [newServices[newIndex], newServices[index]];
        setServices(newServices);

        // Save to Firestore
        try {
            await reorderServices(newServices.map(s => s.id));
        } catch (error) {
            console.error('Error reordering:', error);
            showToast.error('Failed to save order');
            loadData(); // Reload on error
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl text-gray-900 dark:text-white">
                    Services
                </h1>
                <button
                    onClick={() => {
                        setSelectedService(null);
                        setIsEditorOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans w-full md:w-auto"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Plus className="w-4 h-4" />
                    Add Service
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
                    placeholder="Search services by name or type..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm shadow-sm"
                    style={{ borderRadius: '0.5rem' }}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No services found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first seminar service'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50">
                                <th className="w-10 py-3 px-2"></th>
                                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Image</th>
                                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Service Name</th>
                                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Time Unit</th>
                                <th className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Campuses</th>
                                <th className="text-right py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(searchTerm ? filteredServices : services).map((service, index) => (
                                <tr
                                    key={service.id}
                                    className={`border-b border-gray-50 dark:border-zinc-700/50 hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors ${index === services.length - 1 ? 'border-b-0' : ''}`}
                                >
                                    {/* Reorder Controls */}
                                    <td className="py-3 px-2">
                                        {!searchTerm && (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <button
                                                    onClick={() => moveService(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-0.5 text-gray-300 hover:text-imeda disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move up"
                                                >
                                                    <ChevronUp className="w-4 h-4" />
                                                </button>
                                                <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                                                <button
                                                    onClick={() => moveService(index, 'down')}
                                                    disabled={index === services.length - 1}
                                                    className="p-0.5 text-gray-300 hover:text-imeda disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move down"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 dark:bg-zinc-900">
                                            <StandardImage
                                                src={service.imageUrl}
                                                alt={service.name}
                                                containerClassName="w-full h-full"
                                                fallbackIcon={<Layers className="w-4 h-4 text-gray-300" />}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{service.description}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${service.type === 'Default Service'
                                            ? 'bg-imeda/10 text-imeda'
                                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'
                                            }`}>
                                            {service.type === 'Default Service' ? 'Default' : 'Optional'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {service.timeUnit}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {Object.keys(service.campusCosts || {}).length} campuses
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedService(service);
                                                    setIsEditorOpen(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-imeda transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setServiceToDelete(service)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <ServiceEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setSelectedService(null);
                }}
                onSave={loadData}
                service={selectedService}
            />

            <ConfirmDialog
                isOpen={!!serviceToDelete}
                onClose={() => setServiceToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Service"
                message={`Are you sure you want to delete ${serviceToDelete?.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
