'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import { addClientFull } from '@/lib/finance';
import { getCountries } from '@/lib/locations';
import { showToast } from '@/lib/toast';
import type { Country } from '@/types/settings';

interface RawClient {
    "Client Type": string;
    "Company Name": string;
    "VAT Number": string;
    "Street": string;
    "Address Line 2": string;
    "ZIP Code": string;
    "City": string;
    "Country": string;
    "Contact Title": string;
    "Contact Name": string;
    "Occupation": string;
    "Contact Email 1": string;
    "Contact Email 2": string;
    "Contact Phone 1": string | number;
    "Contact Phone 2": string | number;
    "Personal Title": string;
    "Full Name": string;
    "Personal Email": string;
    "Personal Phone": string | number;
}

interface ProcessedClient {
    name: string;
    clientType: 'company' | 'personal';
    vatNumber?: string;
    address?: {
        street_line1?: string;
        street_line2?: string;
        city?: string;
        zip_code?: string;
        country?: string;
    };
    contacts: {
        title: string;
        name: string;
        occupation: string;
        email1: string;
        email2: string;
        phone1: string;
        phone2: string;
    }[];
}

// Known country name mappings from JSON -> DB names
const COUNTRY_MAPPINGS: Record<string, string> = {
    "Ivory Coast": "Côte d'Ivoire",
    "Democratic Republic of the Congo": "Congo - Kinshasa",
    "Republic of the Congo": "Congo - Brazzaville",
    "Central African Republic": "Central African Republic",
    "United Arab Emirates": "United Arab Emirates",
    // Add more mappings as needed
};

export default function ImportClientsPage() {
    const [rawData, setRawData] = useState<RawClient[]>([]);
    const [processedClients, setProcessedClients] = useState<ProcessedClient[]>([]);
    const [dbCountries, setDbCountries] = useState<Country[]>([]);
    const [unmappedCountries, setUnmappedCountries] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: 0 });
    const [importComplete, setImportComplete] = useState(false);

    // Load countries from Firestore on mount
    useEffect(() => {
        loadDbCountries();
    }, []);

    const loadDbCountries = async () => {
        try {
            const countries = await getCountries();
            setDbCountries(countries);
            console.log(`Loaded ${countries.length} countries from DB`);
        } catch (error) {
            console.error('Error loading countries:', error);
            showToast.error('Failed to load countries from database');
        }
    };

    const mapCountryName = (rawCountry: string): string | undefined => {
        if (!rawCountry || rawCountry.trim() === '') return undefined;

        const trimmed = rawCountry.trim();

        // First check our manual mappings
        if (COUNTRY_MAPPINGS[trimmed]) {
            return COUNTRY_MAPPINGS[trimmed];
        }

        // Then try exact match with DB countries
        const exactMatch = dbCountries.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (exactMatch) {
            return exactMatch.name;
        }

        // Try partial match
        const partialMatch = dbCountries.find(c =>
            c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            trimmed.toLowerCase().includes(c.name.toLowerCase())
        );
        if (partialMatch) {
            return partialMatch.name;
        }

        // No match found
        return trimmed; // Keep original, will be flagged as unmapped
    };

    const loadFromPublic = async () => {
        if (dbCountries.length === 0) {
            showToast.error('Please wait for countries to load from database');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/imedaclients.json');
            const data: RawClient[] = await response.json();
            setRawData(data);
            processClients(data);
            showToast.success(`Loaded ${data.length} raw entries`);
        } catch (error) {
            console.error('Error loading JSON:', error);
            showToast.error('Failed to load JSON file');
        } finally {
            setIsLoading(false);
        }
    };

    const processClients = (data: RawClient[]) => {
        const clientMap = new Map<string, ProcessedClient>();
        const unmapped = new Set<string>();
        const dbCountryNames = new Set(dbCountries.map(c => c.name.toLowerCase()));

        for (const row of data) {
            const isPersonal = row["Client Type"] === 'personal';
            const clientName = isPersonal ? row["Full Name"]?.trim() : row["Company Name"]?.trim();

            if (!clientName) continue;

            const phone1 = row["Contact Phone 1"] || row["Personal Phone"];
            const phone2 = row["Contact Phone 2"];
            const email1 = row["Contact Email 1"] || row["Personal Email"];
            const email2 = row["Contact Email 2"];

            // Map country name
            const rawCountry = row["Country"]?.trim() || '';
            const mappedCountry = mapCountryName(rawCountry);

            // Check if country is in DB
            if (mappedCountry && !dbCountryNames.has(mappedCountry.toLowerCase())) {
                unmapped.add(rawCountry);
            }

            const contact = {
                title: (isPersonal ? row["Personal Title"] : row["Contact Title"])?.trim() || '',
                name: (isPersonal ? row["Full Name"] : row["Contact Name"])?.trim() || '',
                occupation: row["Occupation"]?.trim() || '',
                email1: (typeof email1 === 'string' ? email1 : '').trim(),
                email2: (typeof email2 === 'string' ? email2 : '').trim(),
                phone1: phone1 ? String(phone1).trim() : '',
                phone2: phone2 ? String(phone2).trim() : '',
            };

            // Check if client already exists (for consolidating company contacts)
            const existingClient = clientMap.get(clientName);
            if (existingClient && !isPersonal) {
                // Add contact to existing company client
                if (contact.name && !existingClient.contacts.some(c => c.name === contact.name)) {
                    existingClient.contacts.push(contact);
                }
            } else {
                // Create new client
                clientMap.set(clientName, {
                    name: clientName,
                    clientType: isPersonal ? 'personal' : 'company',
                    vatNumber: row["VAT Number"]?.trim() || undefined,
                    address: {
                        street_line1: row["Street"]?.trim() || undefined,
                        street_line2: row["Address Line 2"]?.trim() || undefined,
                        city: row["City"]?.trim() || undefined,
                        zip_code: row["ZIP Code"]?.trim() || undefined,
                        country: mappedCountry || undefined,
                    },
                    contacts: contact.name ? [contact] : [],
                });
            }
        }

        const clients = Array.from(clientMap.values());
        setProcessedClients(clients);
        setUnmappedCountries(Array.from(unmapped));
        showToast.success(`Processed into ${clients.length} unique clients`);
    };

    const startImport = async () => {
        if (processedClients.length === 0) return;

        setIsImporting(true);
        setImportProgress({ current: 0, total: processedClients.length, errors: 0 });

        let errors = 0;
        for (let i = 0; i < processedClients.length; i++) {
            const client = processedClients[i];
            try {
                const primaryContact = client.contacts[0];
                await addClientFull({
                    name: client.name,
                    unitId: 'imeda',
                    clientType: client.clientType,
                    vatNumber: client.vatNumber,
                    contact: primaryContact?.name,
                    email: primaryContact?.email1,
                    phone: primaryContact?.phone1,
                    address: client.address,
                    contacts: client.contacts.length > 0 ? client.contacts : undefined,
                } as Parameters<typeof addClientFull>[0]);
            } catch (error) {
                console.error(`Failed to import ${client.name}:`, error);
                errors++;
            }
            setImportProgress({ current: i + 1, total: processedClients.length, errors });
        }

        setIsImporting(false);
        setImportComplete(true);
        showToast.success(`Import complete! ${processedClients.length - errors} clients imported, ${errors} errors`);
    };

    const companyCount = processedClients.filter(c => c.clientType === 'company').length;
    const personalCount = processedClients.filter(c => c.clientType === 'personal').length;
    const multiContactCount = processedClients.filter(c => c.contacts.length > 1).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/imeda/clients">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </Link>
                <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Import IMEDA Clients</h1>
            </div>

            {/* Countries Status */}
            <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                {dbCountries.length > 0 ? (
                    <span className="text-green-600">✓ {dbCountries.length} countries loaded from database</span>
                ) : (
                    <span className="text-gray-500">Loading countries from database...</span>
                )}
            </div>

            {/* Step 1: Load Data */}
            <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Step 1: Load JSON Data</h3>
                <button
                    onClick={loadFromPublic}
                    disabled={isLoading || isImporting || dbCountries.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ borderRadius: '0.25rem' }}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Load /public/imedaclients.json
                </button>

                {rawData.length > 0 && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        ✓ Loaded <strong>{rawData.length}</strong> raw entries from JSON
                    </p>
                )}
            </div>

            {/* Unmapped Countries Warning */}
            {unmappedCountries.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800" style={{ borderRadius: '0.5rem' }}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-200">Unmapped Countries</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                The following countries from the JSON don't match any in your database. They will be imported as-is:
                            </p>
                            <ul className="mt-2 text-sm text-amber-600 dark:text-amber-400 list-disc list-inside">
                                {unmappedCountries.map((c, i) => (
                                    <li key={i}>{c}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-amber-600 mt-2">
                                You can add mappings to the COUNTRY_MAPPINGS object in the import page code.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Review Processed Data */}
            {processedClients.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Step 2: Review Processed Data</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{processedClients.length}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Unique Clients</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                            <p className="text-2xl font-bold text-imeda">{companyCount}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Companies</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                            <p className="text-2xl font-bold text-purple-600">{personalCount}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Personal</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-900" style={{ borderRadius: '0.25rem' }}>
                            <p className="text-2xl font-bold text-orange-500">{multiContactCount}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Multi-Contact</p>
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.25rem' }}>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900 sticky top-0">
                                <tr>
                                    <th className="text-left p-2 font-medium text-gray-600">Name</th>
                                    <th className="text-left p-2 font-medium text-gray-600">Type</th>
                                    <th className="text-left p-2 font-medium text-gray-600">Contacts</th>
                                    <th className="text-left p-2 font-medium text-gray-600">Country</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedClients.slice(0, 50).map((client, i) => (
                                    <tr key={i} className="border-t border-gray-100 dark:border-zinc-700">
                                        <td className="p-2 text-gray-900 dark:text-white">{client.name}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${client.clientType === 'company' ? 'bg-imeda/10 text-imeda' : 'bg-purple-100 text-purple-600'}`}>
                                                {client.clientType}
                                            </span>
                                        </td>
                                        <td className="p-2 text-gray-600 dark:text-gray-400">{client.contacts.length}</td>
                                        <td className="p-2 text-gray-600 dark:text-gray-400">{client.address?.country || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedClients.length > 50 && (
                            <p className="p-2 text-center text-xs text-gray-400">...and {processedClients.length - 50} more</p>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Import */}
            {processedClients.length > 0 && !importComplete && (
                <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <h3 className="text-sm font-normal uppercase tracking-wider text-imeda font-sans mb-4">Step 3: Import to Firestore</h3>

                    {isImporting ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-imeda" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Importing {importProgress.current} of {importProgress.total}...
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2" style={{ borderRadius: '1rem' }}>
                                <div
                                    className="bg-imeda h-2 transition-all"
                                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%`, borderRadius: '1rem' }}
                                />
                            </div>
                            {importProgress.errors > 0 && (
                                <p className="text-sm text-red-500">{importProgress.errors} errors so far</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Ready to import <strong>{processedClients.length}</strong> clients to Firestore. This action cannot be undone.
                            </p>
                            <button
                                onClick={startImport}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Start Import
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Complete */}
            {importComplete && (
                <div className="bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800" style={{ borderRadius: '0.5rem' }}>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                            <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Import Complete!</h3>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Successfully imported {importProgress.current - importProgress.errors} clients.
                                {importProgress.errors > 0 && ` ${importProgress.errors} errors.`}
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/imeda/clients">
                        <button className="mt-4 px-4 py-2 bg-imeda text-white hover:opacity-90" style={{ borderRadius: '0.25rem' }}>
                            View All Clients
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
