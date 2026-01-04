'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Link as LinkIcon, Upload, ImageIcon, User } from 'lucide-react';
import CountrySelect from '@/components/ui/CountrySelect';
import type { Campus } from '@/types/finance';
import type { Consultant } from '@/types/staff';
import { addCampus, updateCampus } from '@/lib/campuses';
import { getConsultants } from '@/lib/staff';
import { showToast } from '@/lib/toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface CampusEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    campus?: Campus | null;
}

export default function CampusEditor({
    isOpen,
    onClose,
    onSave,
    campus
}: CampusEditorProps) {
    const [loading, setLoading] = useState(false);
    const [staff, setStaff] = useState<Consultant[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        country: '',
        address: '',
        googleMapsLink: '',
        directorId: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadStaff();
            if (campus) {
                setFormData({
                    name: campus.name,
                    country: campus.country,
                    address: campus.address,
                    googleMapsLink: campus.googleMapsLink || '',
                    directorId: campus.directorId || '',
                    imageUrl: campus.imageUrl || '',
                });
                setImagePreview(campus.imageUrl || null);
            } else {
                setFormData({
                    name: '',
                    country: '',
                    address: '',
                    googleMapsLink: '',
                    directorId: '',
                    imageUrl: '',
                });
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [campus, isOpen]);

    const loadStaff = async () => {
        try {
            const data = await getConsultants('imeda');
            setStaff(data);
        } catch (error) {
            console.error('Error loading IMEDA staff:', error);
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

    const uploadImage = async (file: File): Promise<string> => {
        const timestamp = Date.now();
        const filename = `campus_${timestamp}_${file.name}`;
        const storageRef = ref(storage, `campuses/${filename}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showToast.error('Campus name is required');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = formData.imageUrl;
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            const payload = {
                ...formData,
                imageUrl: finalImageUrl,
            };

            if (campus) {
                await updateCampus(campus.id, payload);
                showToast.success('Campus updated successfully');
            } else {
                await addCampus(payload);
                showToast.success('Campus added successfully');
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving campus:', error);
            showToast.error('Failed to save campus');
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
                    className="bg-white dark:bg-zinc-800 w-full max-w-xl shadow-2xl border border-gray-200 dark:border-gray-700 relative pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
                    style={{ borderRadius: '0.5rem' }}
                >
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {campus ? 'Edit Campus' : 'Add New Campus'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <form id="campus-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                    Campus Picture
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-32 h-32 bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-imeda"
                                        style={{ borderRadius: '0.5rem' }}
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
                                        <p>Click to upload a high-quality picture of the campus facilities or entrance.</p>
                                        <p>Supported formats: JPG, PNG, WEBP. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Campus Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder="e.g. London Central Campus"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Country
                                    </label>
                                    <CountrySelect
                                        value={formData.country}
                                        onChange={(val) => setFormData({ ...formData, country: val })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                        Campus Director
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={formData.directorId}
                                            onChange={(e) => setFormData({ ...formData, directorId: e.target.value })}
                                            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm appearance-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="">Select a Director</option>
                                            {staff.map(person => (
                                                <option key={person.id} value={person.id}>{person.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                    Office Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm min-h-[80px]"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Full office address and room numbers"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">
                                    Google Maps Link (Optional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <LinkIcon className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.googleMapsLink}
                                        onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder="https://goo.gl/maps/..."
                                    />
                                </div>
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
                            form="campus-form"
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
                                    {campus ? 'Update Campus' : 'Add Campus'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
