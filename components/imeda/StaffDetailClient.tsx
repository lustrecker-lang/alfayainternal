'use client';

import { ArrowLeft, Save, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getConsultant, updateConsultant, deleteConsultant, uploadStaffAvatar } from '@/lib/staff';
import type { Consultant } from '@/types/staff';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { StandardImage } from '@/components/ui/StandardImage';
import { Camera, X } from 'lucide-react';

export default function ImedaStaffDetailClient() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        expertise: '',
        email: '',
        phone: '',
        bio: '',
        joinedDate: '',
    });
    const [employeeId, setEmployeeId] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
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
        // Note: This only removes the local preview/file, not the actual avatarUrl from the DB
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const consultant = await getConsultant(id);
            if (consultant) {
                setFormData({
                    name: consultant.name,
                    expertise: consultant.expertise,
                    email: consultant.email || '',
                    phone: consultant.phone || '',
                    bio: consultant.bio || '',
                    joinedDate: new Date(consultant.joinedDate).toISOString().split('T')[0],
                });
                setEmployeeId(consultant.employeeId || '');
                setAvatarUrl(consultant.avatarUrl || '');
                setImagePreview(consultant.avatarUrl || null);
            } else {
                console.error('Staff member not found');
                showToast.error('Staff member not found');
                router.push('/dashboard/imeda/staff');
            }
        } catch (error) {
            console.error('Failed to load staff member:', error);
            showToast.error('Failed to load staff member');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            let finalAvatarUrl = avatarUrl;
            if (imageFile) {
                finalAvatarUrl = await uploadStaffAvatar(id, imageFile);
            }

            await updateConsultant(id, {
                ...formData,
                joinedDate: new Date(formData.joinedDate),
                rate: 0,
                avatarUrl: finalAvatarUrl || undefined,
            });
            setAvatarUrl(finalAvatarUrl);
            showToast.success('Staff member updated successfully');
        } catch (error) {
            console.error('Error updating staff member:', error);
            showToast.error('Failed to update staff member');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteConsultant(id);
            showToast.success('Staff member archived successfully');
            router.push('/dashboard/imeda/staff');
        } catch (error) {
            console.error('Error archiving staff member:', error);
            showToast.error('Failed to archive staff member');
        }
        setShowDeleteDialog(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                <span className="ml-3 text-gray-500 font-sans">Loading staff details...</span>
            </div>
        );
    }

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
                    <h1 className="text-xl font-medium text-gray-900 dark:text-white">Staff Details</h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        style={{ borderRadius: '0.25rem' }}
                        title="Archive Staff Member"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
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
                                Save Changes
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
                                <h3 className="text-xs font-bold uppercase tracking-widest text-imeda font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Staff Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 font-sans">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            <div className="flex justify-center text-center">
                                {imagePreview ? (
                                    <div className="relative group">
                                        <StandardImage
                                            src={imagePreview}
                                            alt="Preview"
                                            containerClassName="w-32 h-32 rounded-full border-2 border-imeda/20"
                                            fallbackIcon={<Camera className="w-8 h-8 text-gray-400" />}
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                                            <Camera className="w-6 h-6 text-white" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
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

                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <StandardImage
                                src={avatarUrl}
                                alt={formData.name}
                                containerClassName="w-12 h-12 rounded-full border border-gray-100 dark:border-zinc-700"
                                fallbackIcon={<User className="w-6 h-6 text-imeda opacity-50" />}
                            />
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans leading-none">Employee ID</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white font-sans mt-1">#{employeeId || '---'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-sans">Role Status</p>
                                <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Archive Staff Member"
                message={`Are you sure you want to archive ${formData.name}? This will hide them from the active directory.`}
                confirmLabel="Archive"
                variant="danger"
            />
        </div>
    );
}
