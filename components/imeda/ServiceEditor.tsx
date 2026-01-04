'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Upload, ImageIcon, Trash2, Plus } from 'lucide-react';
import type { ImedaService, ServiceType, ServiceTimeUnit, Campus } from '@/types/finance';
import { addService, updateService, uploadServiceImage } from '@/lib/services';
import { getCampuses } from '@/lib/campuses';
import { showToast } from '@/lib/toast';

interface ServiceEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    service?: ImedaService | null;
}

export default function ServiceEditor({
    isOpen,
    onClose,
    onSave,
    service
}: ServiceEditorProps) {
    const [loading, setLoading] = useState(false);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Default Service' as ServiceType,
        timeUnit: 'Per Seminar' as ServiceTimeUnit,
        imageUrl: '',
        campusCosts: {} as Record<string, number>,
    });

    useEffect(() => {
        if (isOpen) {
            loadCampuses();
            if (service) {
                setFormData({
                    name: service.name,
                    description: service.description,
                    type: service.type,
                    timeUnit: service.timeUnit,
                    imageUrl: service.imageUrl || '',
                    campusCosts: service.campusCosts || {},
                });
                setImagePreview(service.imageUrl || null);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    type: 'Default Service',
                    timeUnit: 'Per Seminar',
                    imageUrl: '',
                    campusCosts: {},
                });
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [service, isOpen]);

    const loadCampuses = async () => {
        try {
            const data = await getCampuses();
            setCampuses(data);
        } catch (error) {
            console.error('Error loading campuses:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCostChange = (campusId: string, cost: string) => {
        const numCost = parseFloat(cost);
        setFormData(prev => ({
            ...prev,
            campusCosts: {
                ...prev.campusCosts,
                [campusId]: isNaN(numCost) ? 0 : numCost
            }
        }));
    };

    const removeCampusCost = (campusId: string) => {
        setFormData(prev => {
            const newCosts = { ...prev.campusCosts };
            delete newCosts[campusId];
            return { ...prev, campusCosts: newCosts };
        });
    };

    const addCampusCost = () => {
        const availableCampus = campuses.find(c => !formData.campusCosts[c.id]);
        if (availableCampus) {
            handleCostChange(availableCampus.id, '0');
        } else {
            showToast.error('All campuses already have costs assigned');
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast.error('Service name is required');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = formData.imageUrl;

            // Try to upload image if one was selected
            if (imageFile) {
                try {
                    finalImageUrl = await uploadServiceImage(imageFile);
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError);
                    showToast.error('Image upload failed. Service will be saved without image.');
                    finalImageUrl = ''; // Clear the URL so fallback shows
                }
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
            };

            if (service) {
                await updateService(service.id, payload);
                showToast.success('Service updated successfully');
            } else {
                await addService(payload);
                showToast.success('Service added successfully');
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving service:', error);
            showToast.error('Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
                onClick={onClose}
            />

            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-zinc-800 w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 relative pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
                    style={{ borderRadius: '0.5rem' }}
                >
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {service ? 'Edit Service' : 'Add New Service'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                    Service Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-32 h-32 bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-imeda"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400">
                                                <ImageIcon className="w-8 h-8 mb-2" />
                                                <span className="text-[10px] font-medium uppercase tracking-widest">Upload</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 text-xs text-gray-500 space-y-1 font-sans">
                                        <p>Upload an icon or image representing this service.</p>
                                        <p>Supported: JPG, PNG, WEBP. Max 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Service Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder="e.g. Venue Rental"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm min-h-[80px]"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder="Briefly describe the service..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Service Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceType })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm appearance-none"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <option value="Default Service">Default Service</option>
                                        <option value="Optional Service">Optional Service</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Time Unit
                                    </label>
                                    <select
                                        value={formData.timeUnit}
                                        onChange={(e) => setFormData({ ...formData, timeUnit: e.target.value as ServiceTimeUnit })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm appearance-none"
                                        style={{ borderRadius: '0.25rem' }}
                                    >
                                        <option value="Per Seminar">Per Seminar</option>
                                        <option value="Per Workday">Per Workday</option>
                                        <option value="Per Night">Per Night</option>
                                        <option value="Per Workweek">Per Workweek</option>
                                        <option value="Per Day">Per Day</option>
                                    </select>
                                </div>
                            </div>

                            {/* Service Costs per Campus (AED) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-sans">
                                        Costs per Campus <span className="text-imeda">(AED)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addCampusCost}
                                        className="text-[10px] font-bold uppercase tracking-wider text-imeda hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Campus Cost
                                    </button>
                                </div>

                                {Object.keys(formData.campusCosts).length === 0 ? (
                                    <div className="p-8 border border-dashed border-gray-200 dark:border-gray-700 text-center rounded-lg">
                                        <p className="text-xs text-gray-400">No campus costs assigned yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(formData.campusCosts).map(([campusId, cost]) => (
                                            <div key={campusId} className="flex items-center gap-3">
                                                <select
                                                    value={campusId}
                                                    onChange={(e) => {
                                                        const newId = e.target.value;
                                                        if (newId === campusId) return;
                                                        setFormData(prev => {
                                                            const newCosts = { ...prev.campusCosts };
                                                            const oldCost = newCosts[campusId];
                                                            delete newCosts[campusId];
                                                            newCosts[newId] = oldCost;
                                                            return { ...prev, campusCosts: newCosts };
                                                        });
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm appearance-none"
                                                    style={{ borderRadius: '0.25rem' }}
                                                >
                                                    {campuses.map(c => (
                                                        <option
                                                            key={c.id}
                                                            value={c.id}
                                                            disabled={Object.keys(formData.campusCosts).includes(c.id) && c.id !== campusId}
                                                        >
                                                            {c.name} ({c.country})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="relative w-32">
                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                                                        <span className="text-[10px] font-bold">Dh</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={cost}
                                                        onChange={(e) => handleCostChange(campusId, e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm text-right"
                                                        style={{ borderRadius: '0.25rem' }}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCampusCost(campusId)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-zinc-700 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-sans text-sm disabled:opacity-50"
                            style={{ borderRadius: '0.25rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            form="service-form"
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-imeda text-white font-medium shadow-md shadow-imeda/20 hover:opacity-90 transition-all font-sans text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ borderRadius: '0.25rem' }}
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {service ? 'Update Service' : 'Add Service'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
