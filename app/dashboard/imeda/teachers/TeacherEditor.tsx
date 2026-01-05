'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveTeacher, getCourseDomains } from '@/lib/teachers';
import { showToast } from '@/lib/toast';
import type { ImedaTeacher } from '@/types/teacher';

interface TeacherEditorProps {
    teacher?: ImedaTeacher | null;
}

export default function TeacherEditor({ teacher }: TeacherEditorProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [availableDomains, setAvailableDomains] = useState<string[]>([]);
    const [domainsDropdownOpen, setDomainsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        fullName: teacher?.fullName || '',
        domains: teacher?.domains || [],
        email: teacher?.contact.email || '',
        phone: teacher?.contact.phone || '',
        address: teacher?.contact.address || '',
        bankName: teacher?.bankDetails.bankName || '',
        accountName: teacher?.bankDetails.accountName || '',
        accountNumber: teacher?.bankDetails.accountNumber || '',
        iban: teacher?.bankDetails.iban || '',
        swiftCode: teacher?.bankDetails.swiftCode || '',
    });

    useEffect(() => {
        loadDomains();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDomainsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadDomains = async () => {
        try {
            const domains = await getCourseDomains();
            setAvailableDomains(domains);
        } catch (error) {
            console.error('Error loading domains:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.fullName.trim()) {
            showToast.error('Please enter a full name');
            return;
        }

        try {
            setSaving(true);
            await saveTeacher(
                {
                    fullName: formData.fullName,
                    domains: formData.domains,
                    contact: {
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                    },
                    bankDetails: {
                        bankName: formData.bankName,
                        accountName: formData.accountName,
                        accountNumber: formData.accountNumber,
                        iban: formData.iban,
                        swiftCode: formData.swiftCode,
                    },
                },
                teacher?.id
            );
            showToast.success(teacher ? 'Teacher updated' : 'Teacher created');
            router.push('/dashboard/imeda/teachers');
        } catch (error) {
            console.error('Error saving teacher:', error);
            showToast.error('Failed to save teacher');
        } finally {
            setSaving(false);
        }
    };

    const toggleDomain = (domain: string) => {
        if (formData.domains.includes(domain)) {
            setFormData({ ...formData, domains: formData.domains.filter(d => d !== domain) });
        } else {
            setFormData({ ...formData, domains: [...formData.domains, domain] });
        }
    };

    const removeDomain = (domain: string) => {
        setFormData({ ...formData, domains: formData.domains.filter(d => d !== domain) });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/dashboard/imeda/teachers')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                    {teacher ? formData.fullName || 'Edit Teacher' : 'New Teacher'}
                </h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-imeda text-white hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                    style={{ borderRadius: '0.25rem' }}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Basic Info */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-5" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            <div ref={dropdownRef}>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Domains Taught</label>
                                {/* Selected domains display */}
                                {formData.domains.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {formData.domains.map((domain) => (
                                            <span
                                                key={domain}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-imeda/10 text-imeda text-xs rounded"
                                            >
                                                {domain}
                                                <button
                                                    type="button"
                                                    onClick={() => removeDomain(domain)}
                                                    className="hover:bg-imeda/20 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Dropdown button */}
                                <button
                                    type="button"
                                    onClick={() => setDomainsDropdownOpen(!domainsDropdownOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm text-left"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    <span className={formData.domains.length === 0 ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                                        {formData.domains.length === 0 ? 'Select domains...' : `${formData.domains.length} selected`}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${domainsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {/* Dropdown menu */}
                                {domainsDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full max-w-sm bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-48 overflow-y-auto" style={{ borderRadius: '0.25rem' }}>
                                        {availableDomains.length === 0 ? (
                                            <div className="px-3 py-2 text-xs text-gray-400">No domains available</div>
                                        ) : (
                                            availableDomains.map((domain) => (
                                                <label
                                                    key={domain}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.domains.includes(domain)}
                                                        onChange={() => toggleDomain(domain)}
                                                        className="w-4 h-4 text-imeda bg-gray-100 dark:bg-zinc-900 border-gray-300 dark:border-gray-600 rounded focus:ring-imeda"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{domain}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-5" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Contact Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+971 50 123 4567"
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Full address"
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm resize-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Bank Details */}
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 p-5 h-fit" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Bank Details for Payout</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</label>
                            <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="e.g., Emirates NBD"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Account Holder Name</label>
                            <input
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                placeholder="Name as shown on account"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Account number"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">IBAN</label>
                            <input
                                type="text"
                                value={formData.iban}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                placeholder="e.g., AE07 0331 2345 6789 0123 456"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">SWIFT/BIC Code</label>
                            <input
                                type="text"
                                value={formData.swiftCode}
                                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                                placeholder="e.g., EABORAEA"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
