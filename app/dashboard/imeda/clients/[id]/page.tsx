'use client';

import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getClientById, updateClient, deleteClient, type ClientFull } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import CountrySelect from '@/components/ui/CountrySelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Contact {
    id: string;
    title: string;
    name: string;
    occupation: string;
    email1: string;
    email2: string;
    phone1: string;
    phone2: string;
}

const createEmptyContact = (): Contact => ({
    id: crypto.randomUUID(),
    title: '',
    name: '',
    occupation: '',
    email1: '',
    email2: '',
    phone1: '',
    phone2: '',
});

export default function ImedaClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [client, setClient] = useState<ClientFull | null>(null);

    const [formData, setFormData] = useState({
        clientType: 'company' as 'company' | 'personal',
        name: '',
        vatNumber: '',
        street: '',
        addressLine2: '',
        zipCode: '',
        city: '',
        country: '',
    });

    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {
        if (clientId) {
            loadClient();
        }
    }, [clientId]);

    const loadClient = async () => {
        setLoading(true);
        try {
            const data = await getClientById(clientId);
            if (data) {
                setClient(data);
                setFormData({
                    clientType: (data as any).clientType || 'company',
                    name: data.name || '',
                    vatNumber: (data as any).vatNumber || '',
                    street: data.address?.street_line1 || '',
                    addressLine2: data.address?.street_line2 || '',
                    zipCode: data.address?.zip_code || '',
                    city: data.address?.city || '',
                    country: data.address?.country || '',
                });

                const existingContacts = (data as any).contacts || [];
                if (existingContacts.length > 0) {
                    setContacts(existingContacts.map((c: any) => ({
                        ...c,
                        id: c.id || crypto.randomUUID(),
                        title: c.title || '',
                        name: c.name || '',
                        occupation: c.occupation || '',
                        email1: c.email1 || '',
                        email2: c.email2 || '',
                        phone1: c.phone1 || '',
                        phone2: c.phone2 || '',
                    })));
                } else {
                    setContacts([createEmptyContact()]);
                }
            }
        } catch (error) {
            console.error('Error loading client:', error);
            showToast.error('Failed to load client');
        } finally {
            setLoading(false);
        }
    };

    const addContact = () => {
        setContacts([...contacts, createEmptyContact()]);
    };

    const removeContact = (id: string) => {
        if (contacts.length > 1) {
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    const updateContact = (id: string, field: keyof Contact, value: string) => {
        setContacts(contacts.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // For personal clients, use Contact 1's name as the client name
        const clientName = formData.clientType === 'personal'
            ? contacts[0]?.name?.trim()
            : formData.name.trim();

        if (!clientName) {
            const errorMsg = formData.clientType === 'personal'
                ? 'Primary contact name is required for personal clients'
                : 'Company name is required';
            showToast.error(errorMsg);
            return;
        }

        setSaving(true);
        try {
            const validContacts = contacts.filter(c => c.name.trim());
            const primaryContact = validContacts[0];

            const updatePayload = {
                name: clientName,
                clientType: formData.clientType,
                // Only include VAT for company clients
                vatNumber: formData.clientType === 'company' && formData.vatNumber.trim()
                    ? formData.vatNumber.trim()
                    : null,
                contact: primaryContact?.name || null,
                email: primaryContact?.email1 || null,
                phone: primaryContact?.phone1 || null,
                address: {
                    street_line1: formData.street.trim() || null,
                    street_line2: formData.addressLine2.trim() || null,
                    city: formData.city.trim() || null,
                    zip_code: formData.zipCode.trim() || null,
                    country: formData.country || null,
                },
                contacts: validContacts.length > 0 ? validContacts.map(c => ({
                    title: c.title,
                    name: c.name,
                    occupation: c.occupation,
                    email1: c.email1,
                    email2: c.email2,
                    phone1: c.phone1,
                    phone2: c.phone2,
                })) : null,
            };

            await updateClient(clientId, updatePayload);
            showToast.success('Client updated successfully');
        } catch (error) {
            console.error('Error updating client:', error);
            showToast.error('Failed to update client');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);
        setDeleting(true);
        try {
            await deleteClient(clientId);
            showToast.success('Client deleted successfully');
            router.push('/dashboard/imeda/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            showToast.error('Failed to delete client');
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard/imeda/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Edit Client</h1>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={deleting || saving}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                        title="Delete Client"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Client"
                message={`Are you sure you want to delete ${formData.name}? This action cannot be undone and will remove all associated data.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isLoading={deleting}
            />

            <form onSubmit={handleSave} className="space-y-6">
                {/* Company Info */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Client Details</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Client Type */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Client Type *</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="company"
                                        checked={formData.clientType === 'company'}
                                        onChange={() => setFormData({ ...formData, clientType: 'company' })}
                                        className="w-4 h-4 text-imeda border-gray-300 focus:ring-imeda"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-sans">Company</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="personal"
                                        checked={formData.clientType === 'personal'}
                                        onChange={() => setFormData({ ...formData, clientType: 'personal' })}
                                        className="w-4 h-4 text-imeda border-gray-300 focus:ring-imeda"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-sans">Personal</span>
                                </label>
                            </div>
                        </div>

                        {/* VAT Number - Only for Company clients */}
                        {formData.clientType === 'company' && (
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">VAT Number</label>
                                <input
                                    type="text"
                                    value={formData.vatNumber}
                                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="e.g., 100123456700003"
                                />
                            </div>
                        )}

                        {/* Company Name - Only for Company clients */}
                        {formData.clientType === 'company' && (
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="e.g., ACME Corporation"
                                    required
                                />
                            </div>
                        )}

                        {/* Personal client hint */}
                        {formData.clientType === 'personal' && (
                            <div className="lg:col-span-2 p-3 bg-imeda/5 border border-imeda/20 text-sm text-imeda" style={{ borderRadius: '0.25rem' }}>
                                ℹ️ For personal clients, the Primary Contact name below will be used as the client name.
                            </div>
                        )}

                        {/* Street */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Street Address</label>
                            <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Street address"
                            />
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Address Line 2</label>
                            <input
                                type="text"
                                value={formData.addressLine2}
                                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder="Apartment, suite, etc."
                            />
                        </div>

                        {/* ZIP & City */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">ZIP Code</label>
                                <input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="00000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                    placeholder="Dubai"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Country</label>
                            <CountrySelect
                                value={formData.country}
                                onChange={(val) => setFormData({ ...formData, country: val })}
                            />
                        </div>
                    </div>
                </div>

                {/* Contacts Section */}
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans">Contacts</h3>
                        <button
                            type="button"
                            onClick={addContact}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-imeda hover:bg-imeda/10 transition-colors font-sans"
                            style={{ borderRadius: '0.25rem' }}
                        >
                            <Plus className="w-3 h-3" />
                            Add Contact
                        </button>
                    </div>

                    <div className="space-y-6">
                        {contacts.map((contact, index) => (
                            <div
                                key={contact.id}
                                className="p-4 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-700"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-medium text-gray-500 font-sans uppercase">
                                        Contact {index + 1} {index === 0 && formData.clientType === 'personal' ? '(Client)' : index === 0 ? '(Primary)' : ''}
                                    </span>
                                    {contacts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeContact(contact.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Title</label>
                                        <select
                                            value={contact.title}
                                            onChange={(e) => updateContact(contact.id, 'title', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">
                                            Full Name {index === 0 && formData.clientType === 'personal' && '*'}
                                        </label>
                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="John Smith"
                                            required={index === 0 && formData.clientType === 'personal'}
                                        />
                                    </div>

                                    {/* Occupation */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Occupation / Role</label>
                                        <input
                                            type="text"
                                            value={contact.occupation}
                                            onChange={(e) => updateContact(contact.id, 'occupation', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="CEO, Manager, etc."
                                        />
                                    </div>

                                    {/* Email 1 */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Email 1</label>
                                        <input
                                            type="email"
                                            value={contact.email1}
                                            onChange={(e) => updateContact(contact.id, 'email1', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="john@company.com"
                                        />
                                    </div>

                                    {/* Email 2 */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Email 2</label>
                                        <input
                                            type="email"
                                            value={contact.email2}
                                            onChange={(e) => updateContact(contact.id, 'email2', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="john.personal@email.com"
                                        />
                                    </div>

                                    {/* Phone 1 */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Phone 1</label>
                                        <input
                                            type="tel"
                                            value={contact.phone1}
                                            onChange={(e) => updateContact(contact.id, 'phone1', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="+971 4 000 0000"
                                        />
                                    </div>

                                    {/* Phone 2 */}
                                    <div>
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Phone 2</label>
                                        <input
                                            type="tel"
                                            value={contact.phone2}
                                            onChange={(e) => updateContact(contact.id, 'phone2', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="+971 50 000 0000"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}
