'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompanyProfile } from '@/lib/settings';
import { CompanyProfile } from '@/types/settings';
import LegalIdentityForm from '@/components/settings/LegalIdentityForm';
import BankAccountsManager from '@/components/settings/BankAccountsManager';
import CountriesManager from '@/components/settings/CountriesManager';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'legal' | 'banking' | 'localization'>('legal');
    const [profile, setProfile] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await getCompanyProfile();
        // Fallback or empty object if null
        setProfile(data || {
            legal_name: '',
            trn_number: '',
            address: {
                street: '', city: '', state: '', zip: '', country: 'United Arab Emirates'
            },
            bank_accounts: []
        });
        setLoading(false);
    };

    if (loading) {
        return <div className="h-[50vh] flex items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Settings</h1>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('legal')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'legal'
                            ? 'border-afconsult text-afconsult'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Legal Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('banking')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'banking'
                            ? 'border-afconsult text-afconsult'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Bank Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('localization')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'localization'
                            ? 'border-afconsult text-afconsult'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Localization
                    </button>
                    <Link
                        href="/dashboard/settings/brands"
                        className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        Brands & Theme
                    </Link>
                    <Link
                        href="/dashboard/settings/templates"
                        className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        Document Templates
                    </Link>
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'legal' && profile && (
                    <div className="animate-in fade-in duration-300">
                        <LegalIdentityForm defaultValues={profile} />
                    </div>
                )}

                {activeTab === 'banking' && profile && (
                    <div className="animate-in fade-in duration-300">
                        <BankAccountsManager
                            initialAccounts={profile.bank_accounts || []}
                            onUpdate={loadSettings}
                        />
                    </div>
                )}

                {activeTab === 'localization' && (
                    <div className="animate-in fade-in duration-300">
                        <CountriesManager />
                    </div>
                )}
            </div>
        </div>
    );
}
