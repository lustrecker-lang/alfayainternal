'use client';

import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getClientById, deleteClient, type ClientFull } from '@/lib/finance';
import { useRouter } from 'next/navigation';

export default function ImedaClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [client, setClient] = useState<ClientFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (clientId) {
            loadClient();
        }
    }, [clientId]);

    const loadClient = async () => {
        setLoading(true);
        try {
            const data = await getClientById(clientId);
            setClient(data);
        } catch (error) {
            console.error('Error loading client:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        setDeleting(true);
        try {
            await deleteClient(clientId);
            router.push('/dashboard/imeda/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="text-gray-500 font-sans">Loading client...</span>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="space-y-6">
                <Link href="/dashboard/imeda/clients">
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

    const clientData = client as ClientFull & {
        clientType?: string;
        vatNumber?: string;
        contacts?: Array<{
            title?: string;
            name: string;
            occupation?: string;
            email1?: string;
            email2?: string;
            phone1?: string;
            phone2?: string;
        }>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/imeda/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl text-gray-900 dark:text-white">{client.name}</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium font-sans disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Client Details */}
            <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Client Details</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <span className="block text-xs text-gray-500 font-sans mb-1">Type</span>
                        <span className="text-sm text-gray-900 dark:text-white font-sans capitalize">
                            {clientData.clientType || 'Company'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 font-sans mb-1">VAT Number</span>
                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                            {clientData.vatNumber || '-'}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <span className="block text-xs text-gray-500 font-sans mb-1">Address</span>
                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                            {client.address?.street_line1 || '-'}
                            {client.address?.street_line2 && <><br />{client.address.street_line2}</>}
                            {(client.address?.city || client.address?.zip_code) && (
                                <><br />{client.address?.zip_code} {client.address?.city}</>
                            )}
                            {client.address?.country && <><br />{client.address.country}</>}
                        </span>
                    </div>
                </div>
            </div>

            {/* Contacts */}
            {clientData.contacts && clientData.contacts.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Contacts</h3>

                    <div className="space-y-4">
                        {clientData.contacts.map((contact, index) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-700" style={{ borderRadius: '0.25rem' }}>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <span className="block text-xs text-gray-500 font-sans mb-1">Name</span>
                                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                                            {contact.title} {contact.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-500 font-sans mb-1">Role</span>
                                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                                            {contact.occupation || '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-500 font-sans mb-1">Email</span>
                                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                                            {contact.email1 || '-'}
                                            {contact.email2 && <><br />{contact.email2}</>}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-500 font-sans mb-1">Phone</span>
                                        <span className="text-sm text-gray-900 dark:text-white font-sans">
                                            {contact.phone1 || '-'}
                                            {contact.phone2 && <><br />{contact.phone2}</>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
