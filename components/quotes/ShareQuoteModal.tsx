'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Check } from 'lucide-react';
import { getCourses } from '@/lib/courses';
import { getQuote } from '@/lib/quotes';
import { getClientById, type ClientFull } from '@/lib/finance';
import type { Course } from '@/types/course';
import type { Quote } from '@/types/quote';

interface ShareQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    quoteId: string;
}

// Currencies we work in
const CURRENCIES = [
    { code: 'AED', name: 'UAE Dirham', defaultRate: 1 },
    { code: 'USD', name: 'US Dollar', defaultRate: 0.27 },
    { code: 'EUR', name: 'Euro', defaultRate: 0.230 },
];

const LANGUAGES = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
];

export default function ShareQuoteModal({ isOpen, onClose, quoteId }: ShareQuoteModalProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [client, setClient] = useState<ClientFull | null>(null);
    const [loadingClient, setLoadingClient] = useState(false);

    // Form state
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [customCourse, setCustomCourse] = useState<string>('');
    const [isCustomCourse, setIsCustomCourse] = useState(false);
    const [currency, setCurrency] = useState('AED');
    const [conversionRate, setConversionRate] = useState(1);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [language, setLanguage] = useState('fr'); // Default to French

    useEffect(() => {
        if (isOpen && quoteId) {
            loadData();
        }
    }, [isOpen, quoteId]);

    const loadData = async () => {
        setLoadingCourses(true);
        setLoadingClient(true);
        try {
            const [coursesData, quoteData] = await Promise.all([
                getCourses('imeda'),
                getQuote(quoteId)
            ]);
            setCourses(coursesData);
            setQuote(quoteData);

            // Load client if quote has clientId
            if (quoteData?.clientId) {
                const clientData = await getClientById(quoteData.clientId);
                setClient(clientData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoadingCourses(false);
            setLoadingClient(false);
        }
    };

    const handleToggleContact = (contactName: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactName)
                ? prev.filter(c => c !== contactName)
                : [...prev, contactName]
        );
    };

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency);
        const currencyInfo = CURRENCIES.find(c => c.code === newCurrency);
        if (currencyInfo) {
            setConversionRate(currencyInfo.defaultRate);
        }
    };

    const handleOpenPrintView = () => {
        // Build URL params
        const params = new URLSearchParams();

        // Language
        params.set('lang', language);

        // Course
        if (isCustomCourse && customCourse.trim()) {
            params.set('course', customCourse.trim());
            params.set('courseType', 'custom');
        } else if (selectedCourseId) {
            const course = courses.find(c => c.id === selectedCourseId);
            if (course) {
                params.set('course', course.title);
                params.set('courseId', course.formationId); // Use formationId for display
                if (course.domain) {
                    params.set('domain', course.domain);
                }
            }
        }

        // Currency
        if (currency !== 'AED') {
            params.set('currency', currency);
            params.set('rate', conversionRate.toString());
        }

        // Client contacts
        if (selectedContacts.length > 0) {
            params.set('contact', selectedContacts.join(', '));
        }

        const queryString = params.toString();
        const url = `/dashboard/imeda/quotes/${quoteId}/print${queryString ? '?' + queryString : ''}`;
        window.open(url, '_blank');
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Share Quote
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Course
                            </label>
                            {!isCustomCourse ? (
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                        disabled={loadingCourses}
                                    >
                                        <option value="">Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.formationId} - {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsCustomCourse(true)}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm flex items-center gap-1"
                                        title="Custom course"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCourse}
                                        onChange={(e) => setCustomCourse(e.target.value)}
                                        placeholder="Enter custom course name..."
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            setIsCustomCourse(false);
                                            setCustomCourse('');
                                        }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm text-gray-500"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Currency & Rate */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Currency
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code} - {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Rate (1 AED =)
                                </label>
                                <input
                                    type="number"
                                    value={conversionRate}
                                    onChange={(e) => setConversionRate(parseFloat(e.target.value) || 0)}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                    disabled={currency === 'AED'}
                                />
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                            >
                                {LANGUAGES.map(l => (
                                    <option key={l.code} value={l.code}>
                                        {l.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Client Contacts */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Client Contacts <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            {loadingClient ? (
                                <div className="text-sm text-gray-400 py-2">Loading contacts...</div>
                            ) : client?.contacts && client.contacts.length > 0 ? (
                                <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 max-h-32 overflow-y-auto">
                                    {client.contacts.map((contact, idx) => {
                                        const contactName = contact.name || `Contact ${idx + 1}`;
                                        const isSelected = selectedContacts.includes(contactName);
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleToggleContact(contactName)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${isSelected ? 'bg-gray-50 dark:bg-zinc-700' : ''
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected
                                                        ? 'bg-imeda border-imeda text-white'
                                                        : 'border-gray-300 dark:border-gray-500'
                                                    }`}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-gray-900 dark:text-white truncate">{contactName}</div>
                                                    {contact.occupation && (
                                                        <div className="text-xs text-gray-400 truncate">{contact.occupation}</div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 py-2 italic">No contacts available for this client</div>
                            )}
                            {selectedContacts.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                    Selected: {selectedContacts.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-md transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleOpenPrintView}
                            className="flex-1 px-4 py-2 bg-imeda text-white hover:opacity-90 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Generate PDF
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
