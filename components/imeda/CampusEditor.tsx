'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Link as LinkIcon, Upload, ImageIcon, User, Plus, Trash2, Building2, Phone, Mail, Video, FileText } from 'lucide-react';
import CountrySelect from '@/components/ui/CountrySelect';
import type { Campus, CampusOffice, OfficeMedia } from '@/types/finance';
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
    const [offices, setOffices] = useState<CampusOffice[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        country: '',
        city: '',
        address: '',
        googleMapsLink: '',
        directorId: '',
        imageUrl: '',
    });

    const createEmptyOffice = (): CampusOffice => ({
        id: crypto.randomUUID(),
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        googleMapsLink: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadStaff();
            if (campus) {
                setFormData({
                    name: campus.name,
                    country: campus.country,
                    city: campus.city || '',
                    address: campus.address,
                    googleMapsLink: campus.googleMapsLink || '',
                    directorId: campus.directorId || '',
                    imageUrl: campus.imageUrl || '',
                });
                setImagePreview(campus.imageUrl || null);
                setOffices(campus.offices || []);
            } else {
                setFormData({
                    name: '',
                    country: '',
                    city: '',
                    address: '',
                    googleMapsLink: '',
                    directorId: '',
                    imageUrl: '',
                });
                setImagePreview(null);
                setOffices([]);
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

    const uploadOfficeMedia = async (file: File, officeId: string): Promise<string> => {
        const timestamp = Date.now();
        const filename = `${officeId}_${timestamp}_${file.name}`;
        const storageRef = ref(storage, `campuses/offices/${filename}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const handleAddMedia = async (officeIndex: number, file: File) => {
        const office = offices[officeIndex];
        const isVideo = file.type.startsWith('video/');

        try {
            const url = await uploadOfficeMedia(file, office.id);
            const newMedia: OfficeMedia = {
                id: crypto.randomUUID(),
                url,
                type: isVideo ? 'video' : 'image',
                title: '',
                description: '',
            };

            const updated = [...offices];
            updated[officeIndex] = {
                ...office,
                media: [...(office.media || []), newMedia],
            };
            setOffices(updated);
            showToast.success('Media uploaded successfully');
        } catch (error) {
            console.error('Error uploading media:', error);
            showToast.error('Failed to upload media');
        }
    };

    const handleUpdateMedia = (officeIndex: number, mediaIndex: number, updates: Partial<OfficeMedia>) => {
        const updated = [...offices];
        const office = updated[officeIndex];
        const media = [...(office.media || [])];
        media[mediaIndex] = { ...media[mediaIndex], ...updates };
        updated[officeIndex] = { ...office, media };
        setOffices(updated);
    };

    const handleDeleteMedia = (officeIndex: number, mediaId: string) => {
        const updated = [...offices];
        const office = updated[officeIndex];
        updated[officeIndex] = {
            ...office,
            media: (office.media || []).filter(m => m.id !== mediaId),
        };
        setOffices(updated);
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
                offices: offices.filter(o => o.name.trim() || o.street.trim()), // Only save offices with data
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
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda transition-all font-sans text-sm"
                                        style={{ borderRadius: '0.25rem' }}
                                        placeholder="e.g. London"
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

                            {/* Offices Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-sans">
                                        Offices
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setOffices([...offices, createEmptyOffice()])}
                                        className="flex items-center gap-1 text-xs text-imeda hover:text-imeda/80 transition-colors font-medium"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Office
                                    </button>
                                </div>

                                {offices.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                        <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">No offices added yet</p>
                                        <button
                                            type="button"
                                            onClick={() => setOffices([createEmptyOffice()])}
                                            className="mt-2 text-xs text-imeda hover:underline"
                                        >
                                            Add your first office
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {offices.map((office, index) => (
                                            <div
                                                key={office.id}
                                                className="p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-gray-500">Office {index + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOffices(offices.filter(o => o.id !== office.id))}
                                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Office Name */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Office Name</label>
                                                    <input
                                                        type="text"
                                                        value={office.name}
                                                        onChange={(e) => {
                                                            const updated = [...offices];
                                                            updated[index] = { ...office, name: e.target.value };
                                                            setOffices(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                        placeholder="e.g. Main Office, Admissions"
                                                    />
                                                </div>

                                                {/* Street Address */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Street Address</label>
                                                    <input
                                                        type="text"
                                                        value={office.street}
                                                        onChange={(e) => {
                                                            const updated = [...offices];
                                                            updated[index] = { ...office, street: e.target.value };
                                                            setOffices(updated);
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                        placeholder="123 Main Street, Suite 100"
                                                    />
                                                </div>

                                                {/* City, State, Postal */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">City</label>
                                                        <input
                                                            type="text"
                                                            value={office.city}
                                                            onChange={(e) => {
                                                                const updated = [...offices];
                                                                updated[index] = { ...office, city: e.target.value };
                                                                setOffices(updated);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                            placeholder="London"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">State/Province</label>
                                                        <input
                                                            type="text"
                                                            value={office.state || ''}
                                                            onChange={(e) => {
                                                                const updated = [...offices];
                                                                updated[index] = { ...office, state: e.target.value };
                                                                setOffices(updated);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                            placeholder="Greater London"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                                                        <input
                                                            type="text"
                                                            value={office.postalCode || ''}
                                                            onChange={(e) => {
                                                                const updated = [...offices];
                                                                updated[index] = { ...office, postalCode: e.target.value };
                                                                setOffices(updated);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                            placeholder="SW1A 1AA"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Country */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Country</label>
                                                    <CountrySelect
                                                        value={office.country}
                                                        onChange={(val) => {
                                                            const updated = [...offices];
                                                            updated[index] = { ...office, country: val };
                                                            setOffices(updated);
                                                        }}
                                                    />
                                                </div>

                                                {/* Phone & Email */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Phone</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="tel"
                                                                value={office.phone || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...offices];
                                                                    updated[index] = { ...office, phone: e.target.value };
                                                                    setOffices(updated);
                                                                }}
                                                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                                placeholder="+44 20 1234 5678"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Email</label>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="email"
                                                                value={office.email || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...offices];
                                                                    updated[index] = { ...office, email: e.target.value };
                                                                    setOffices(updated);
                                                                }}
                                                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                                placeholder="office@example.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Google Maps Link */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Google Maps Link</label>
                                                    <div className="relative">
                                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="url"
                                                            value={office.googleMapsLink || ''}
                                                            onChange={(e) => {
                                                                const updated = [...offices];
                                                                updated[index] = { ...office, googleMapsLink: e.target.value };
                                                                setOffices(updated);
                                                            }}
                                                            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                            placeholder="https://goo.gl/maps/..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Google Maps Image */}
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Google Maps Image</label>
                                                    {office.mapImageUrl ? (
                                                        <div className="relative group">
                                                            <img
                                                                src={office.mapImageUrl}
                                                                alt="Map"
                                                                className="w-full h-32 object-cover rounded border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...offices];
                                                                    updated[index] = { ...office, mapImageUrl: undefined };
                                                                    setOffices(updated);
                                                                }}
                                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-imeda transition-colors">
                                                            <Upload className="w-4 h-4 text-gray-400" />
                                                            <span className="text-xs text-gray-500">Upload Map Screenshot</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;

                                                                    try {
                                                                        const storageRef = ref(storage, `campuses/maps/${Date.now()}_${file.name}`);
                                                                        await uploadBytes(storageRef, file);
                                                                        const url = await getDownloadURL(storageRef);

                                                                        const updated = [...offices];
                                                                        updated[index] = { ...office, mapImageUrl: url };
                                                                        setOffices(updated);
                                                                        showToast.success('Map image uploaded');
                                                                    } catch (error) {
                                                                        console.error('Error uploading map image:', error);
                                                                        showToast.error('Failed to upload map image');
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>

                                                {/* Office Media */}
                                                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-xs text-gray-500">Photos & Videos</label>
                                                        <label className="flex items-center gap-1 text-xs text-imeda hover:text-imeda/80 transition-colors font-medium cursor-pointer">
                                                            <Plus className="w-3 h-3" />
                                                            Add Media
                                                            <input
                                                                type="file"
                                                                accept="image/*,video/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleAddMedia(index, file);
                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    {(!office.media || office.media.length === 0) ? (
                                                        <div className="text-center py-4 bg-white dark:bg-zinc-800 border border-dashed border-gray-200 dark:border-gray-600 rounded">
                                                            <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                                                            <p className="text-xs text-gray-400">No media added</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {office.media.map((media, mediaIndex) => (
                                                                <div key={media.id} className="p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-600 rounded space-y-2">
                                                                    <div className="flex gap-3">
                                                                        {/* Thumbnail */}
                                                                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-zinc-700">
                                                                            {media.type === 'video' ? (
                                                                                <div className="w-full h-full flex items-center justify-center">
                                                                                    <Video className="w-8 h-8 text-gray-400" />
                                                                                </div>
                                                                            ) : (
                                                                                <img src={media.url} alt={media.title || 'Media'} className="w-full h-full object-cover" />
                                                                            )}
                                                                        </div>
                                                                        {/* Details */}
                                                                        <div className="flex-1 space-y-2">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={media.title || ''}
                                                                                    onChange={(e) => handleUpdateMedia(index, mediaIndex, { title: e.target.value })}
                                                                                    className="flex-1 px-2 py-1 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-imeda"
                                                                                    placeholder="Title (optional)"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteMedia(index, media.id)}
                                                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                            <textarea
                                                                                value={media.description || ''}
                                                                                onChange={(e) => handleUpdateMedia(index, mediaIndex, { description: e.target.value })}
                                                                                className="w-full px-2 py-1 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-imeda resize-none"
                                                                                placeholder="Description (optional)"
                                                                                rows={2}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                                        {media.type === 'video' ? (
                                                                            <><Video className="w-3 h-3" /> Video</>
                                                                        ) : (
                                                                            <><ImageIcon className="w-3 h-3" /> Image</>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
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
