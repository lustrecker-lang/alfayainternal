'use client';

import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addClientFull } from '@/lib/finance';

// Comprehensive country list
const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
    'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
    'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
    'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago',
    'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
    'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

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

export default function NewImedaClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        clientType: 'company' as 'company' | 'personal',
        name: '',
        vatNumber: '',
        street: '',
        addressLine2: '',
        zipCode: '',
        city: '',
        country: 'United Arab Emirates',
    });

    const [contacts, setContacts] = useState<Contact[]>([createEmptyContact()]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Company/Client name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Filter out empty contacts and prepare data
            const validContacts = contacts.filter(c => c.name.trim());
            const primaryContact = validContacts[0];

            await addClientFull({
                name: formData.name.trim(),
                unitId: 'imeda',
                clientType: formData.clientType,
                vatNumber: formData.vatNumber.trim() || undefined,
                contact: primaryContact?.name || undefined,
                email: primaryContact?.email1 || undefined,
                phone: primaryContact?.phone1 || undefined,
                address: {
                    street_line1: formData.street.trim() || undefined,
                    street_line2: formData.addressLine2.trim() || undefined,
                    city: formData.city.trim() || undefined,
                    zip_code: formData.zipCode.trim() || undefined,
                    country: formData.country || undefined,
                },
                contacts: validContacts.length > 0 ? validContacts.map(c => ({
                    title: c.title,
                    name: c.name,
                    occupation: c.occupation,
                    email1: c.email1,
                    email2: c.email2,
                    phone1: c.phone1,
                    phone2: c.phone2,
                })) : undefined,
            } as Parameters<typeof addClientFull>[0]);

            router.push('/dashboard/imeda/clients');
        } catch (err) {
            console.error('Error creating client:', err);
            setError('Failed to create client. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                <h1 className="text-3xl text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Add Client</h1>
                <button
                    type="submit"
                    form="client-form"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-sans" style={{ borderRadius: '0.25rem' }}>
                    {error}
                </div>
            )}

            <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
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

                        {/* VAT Number */}
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

                        {/* Company Name */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">
                                {formData.clientType === 'company' ? 'Company Name' : 'Full Name'} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                                placeholder={formData.clientType === 'company' ? 'e.g., ACME Corporation' : 'e.g., John Smith'}
                                required
                            />
                        </div>

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
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
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
                                        Contact {index + 1} {index === 0 && '(Primary)'}
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
                                        <label className="block text-xs font-normal text-gray-500 mb-1 font-sans">Full Name</label>
                                        <input
                                            type="text"
                                            value={contact.name}
                                            onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-imeda outline-none"
                                            style={{ borderRadius: '0.25rem' }}
                                            placeholder="John Smith"
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
