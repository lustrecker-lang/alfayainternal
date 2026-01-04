'use client';

import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ClientFull, getClientById, updateClient, deleteClient } from '@/lib/finance';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CountrySelect from '@/components/ui/CountrySelect';

export default function AFClientEditor() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [client, setClient] = useState<Partial<ClientFull>>({
        name: '',
        clientType: 'company',
        industry: '',
        contact: '',
        email: '',
        phone: '',
        vatNumber: '',
        address: {
            street_line1: '',
            street_line2: '',
            city: '',
            zip_code: '',
            country: 'United Arab Emirates'
        }
    });

    useEffect(() => {
        loadClient();
    }, []);

    async function loadClient() {
        if (!params.id) return;
        try {
            const data = await getClientById(params.id as string);
            if (data) {
                setClient({
                    ...data,
                    address: data.address || {
                        street_line1: '',
                        street_line2: '',
                        city: '',
                        zip_code: '',
                        country: 'United Arab Emirates'
                    }
                });
            }
        } catch (error) {
            console.error('Error loading client:', error);
            showToast.error('Failed to load client details');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateClient(params.id as string, client);
            showToast.success('Client updated successfully');
        } catch (error) {
            console.error('Error updating client:', error);
            showToast.error('Failed to update client');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteClient(params.id as string);
            showToast.success('Client deleted successfully');
            router.push('/dashboard/afconsult/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            showToast.error('Failed to delete client');
            setDeleting(false);
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/clients" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Client</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete Client"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded hover:bg-afconsult/90 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                            <input
                                type="text"
                                value={client.name}
                                onChange={e => setClient({ ...client, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                            <input
                                type="text"
                                value={client.industry || ''}
                                onChange={e => setClient({ ...client, industry: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TRN / VAT Number</label>
                            <input
                                type="text"
                                value={client.vatNumber || ''}
                                onChange={e => setClient({ ...client, vatNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Person</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                            <input
                                type="text"
                                value={client.contact || ''}
                                onChange={e => setClient({ ...client, contact: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={client.email || ''}
                                onChange={e => setClient({ ...client, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={client.phone || ''}
                                onChange={e => setClient({ ...client, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 md:col-span-2 border-t pt-6 mt-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Address</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    value={client.address?.street_line1 || ''}
                                    onChange={e => setClient({
                                        ...client,
                                        address: { ...client.address, street_line1: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <input
                                    type="text"
                                    value={client.address?.city || ''}
                                    onChange={e => setClient({
                                        ...client,
                                        address: { ...client.address, city: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-afconsult focus:border-afconsult outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                <CountrySelect
                                    value={client.address?.country || 'United Arab Emirates'}
                                    onChange={val => setClient({
                                        ...client,
                                        address: { ...client.address, country: val }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Client"
                message={`Are you sure you want to delete ${client.name}? This action cannot be undone.`}
                confirmLabel="Delete Client"
                variant="danger"
                isLoading={deleting}
            />
        </div>
    );
}
