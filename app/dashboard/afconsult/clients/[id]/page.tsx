'use client';

import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getClientById, updateClient, deleteClient, type ClientFull } from '@/lib/finance';
import { showToast } from '@/lib/toast';

export default function ClientDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [client, setClient] = useState<ClientFull | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        contact: '',
        email: '',
        phone: '',
        street_line1: '',
        street_line2: '',
        city: '',
        zip_code: '',
        country: '',
    });

    useEffect(() => {
        loadClient();
    }, [id]);

    const loadClient = async () => {
        try {
            setLoading(true);
            const data = await getClientById(id);
            if (data) {
                setClient(data);
                setFormData({
                    name: data.name || '',
                    industry: (data as any).industry || '',
                    contact: data.contact || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    street_line1: data.address?.street_line1 || '',
                    street_line2: data.address?.street_line2 || '',
                    city: data.address?.city || '',
                    zip_code: data.address?.zip_code || '',
                    country: data.address?.country || '',
                });
            }
        } catch (error) {
            console.error('Failed to load client:', error);
            showToast.error('Failed to load client');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateClient(id, {
                name: formData.name,
                industry: formData.industry || undefined,
                contact: formData.contact || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: {
                    street_line1: formData.street_line1 || undefined,
                    street_line2: formData.street_line2 || undefined,
                    city: formData.city || undefined,
                    zip_code: formData.zip_code || undefined,
                    country: formData.country || undefined,
                },
            });
            showToast.success('Client updated successfully');
        } catch (error) {
            console.error('Error updating client:', error);
            showToast.error('Failed to update client');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteClient(id);
            showToast.success('Client archived successfully');
            router.push('/dashboard/afconsult/clients');
        } catch (error) {
            console.error('Error archiving client:', error);
            showToast.error('Failed to archive client');
        }
        setShowDeleteDialog(false);
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500 font-sans">Loading client details...</div>;
    }

    if (!client) {
        return (
            <div className="space-y-6">
                <Link href="/dashboard/afconsult/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <div className="text-center py-12 text-gray-500 font-sans">
                    Client not found.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back, Centered Title, and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/clients">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                </div>

                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                    Client Details
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Archive Client"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700 shadow-sm" style={{ borderRadius: '0.5rem' }}>
                <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    {/* Company Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Industry</label>
                                <input
                                    type="text"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Contact Person</label>
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans border-b border-gray-100 dark:border-zinc-800 pb-2">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address Line 1</label>
                                <input
                                    type="text"
                                    value={formData.street_line1}
                                    onChange={(e) => setFormData({ ...formData, street_line1: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address Line 2</label>
                                <input
                                    type="text"
                                    value={formData.street_line2}
                                    onChange={(e) => setFormData({ ...formData, street_line2: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">ZIP / Postal Code</label>
                                <input
                                    type="text"
                                    value={formData.zip_code}
                                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Archive Client?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to archive {formData.name}? This will move them to the inactive directory.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 bg-red-600 text-white font-normal hover:bg-red-700 transition-colors font-sans text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Archive
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
