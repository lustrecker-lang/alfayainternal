'use client';

import { ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createConsultant, uploadStaffAvatar } from '@/lib/staff'; // Uses 'staff' collection
import type { NewConsultantData } from '@/types/staff';
import { showToast } from '@/lib/toast';
import { Camera, X } from 'lucide-react';

export default function NewImedaStaffPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        expertise: '', // Used for "Role" in IMEDA
        email: '',
        phone: '',
        bio: '',
        joinedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSave = async () => {
        if (!formData.name) {
            showToast.error('Staff member name is required');
            return;
        }

        try {
            setSaving(true);
            const tempId = Math.random().toString(36).substring(7); // Temporary ID for storage naming
            let avatarUrl = '';

            if (imageFile) {
                avatarUrl = await uploadStaffAvatar(tempId, imageFile);
            }

            const newStaff: NewConsultantData = {
                name: formData.name,
                rate: 0, // IMEDA staff doesn't need hourly rate for now
                expertise: formData.expertise || 'Staff Member',
                email: formData.email,
                phone: formData.phone,
                bio: formData.bio,
                joinedDate: new Date(formData.joinedDate),
                unitId: 'imeda',
                status: 'active',
                avatarUrl: avatarUrl || undefined,
            };

            await createConsultant(newStaff);
            showToast.success('Staff member added successfully');
            router.push('/dashboard/imeda/staff');
        } catch (error) {
            console.error('Error saving IMEDA staff member:', error);
            showToast.error('Failed to save staff member');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/imeda/staff">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-xl font-medium text-gray-900 dark:text-white">Add Staff Member</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        {saving ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-imeda font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Dr. Sarah Jenkins"
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none text-sm transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Role / Responsibility</label>
                                        <input
                                            type="text"
                                            value={formData.expertise}
                                            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                            placeholder="e.g. Campus Director / Seminar Lead"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none text-sm transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="staff@imeda.com"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none text-sm transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+971 50 123 4567"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none text-sm transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Joined Date</label>
                                        <input
                                            type="date"
                                            value={formData.joinedDate}
                                            onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none text-sm transition-all"
                                            style={{ borderRadius: '0.25rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-imeda font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Bio / Experience</h3>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    placeholder="Brief background and qualifications..."
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-imeda outline-none resize-none font-sans text-sm transition-all"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Image Upload */}
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-imeda font-sans mb-4">Staff Picture</h3>
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover border-2 border-imeda/20"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-32 h-32 rounded-full bg-gray-50 dark:bg-zinc-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-imeda/50 transition-colors group">
                                        <Camera className="w-8 h-8 text-gray-400 group-hover:text-imeda transition-colors" />
                                        <span className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">Upload Photo</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                                Recommended: Square image, max 2MB.
                            </p>
                        </div>
                    </div>

                    <div className="bg-imeda/5 p-6 border border-imeda/20 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-imeda font-sans mb-4 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            IMEDA Staff Roles
                        </h3>
                        <div className="space-y-4">
                            <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-900 dark:text-white block mb-1">Campus Director</strong>
                                Responsible for overall operations and seminar coordination at specific campus locations.
                            </div>
                            <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-900 dark:text-white block mb-1">Seminar Lead</strong>
                                Primary instructor or host for academic and professional seminars.
                            </div>
                            <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-900 dark:text-white block mb-1">Academic Advisor</strong>
                                Coordinates content and curriculum development for IMEDA programs.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
