'use client';

import { useState } from 'react';
import { CompanyProfile, BankAccount } from '@/types/settings';
import { updateCompanyProfile } from '@/lib/settings';
import { Plus, Trash2, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface BankAccountsManagerProps {
    initialAccounts: BankAccount[];
    onUpdate?: () => void;
}

export default function BankAccountsManager({ initialAccounts, onUpdate }: BankAccountsManagerProps) {
    const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts || []);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<BankAccount>({
        defaultValues: {
            currency: 'AED',
            is_default: false
        }
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return;

        const newAccounts = accounts.filter(acc => acc.id !== id);
        setAccounts(newAccounts); // Optimistic update

        try {
            await updateCompanyProfile({ bank_accounts: newAccounts });
            toast.success('Bank account removed');
            onUpdate?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove bank account');
            setAccounts(accounts); // Revert
        }
    };

    const onSubmit = async (data: BankAccount) => {
        setIsSaving(true);
        const newAccount = { ...data, id: crypto.randomUUID() };

        // If this is default, uncheck others. If it's the first one, force default.
        if (accounts.length === 0) newAccount.is_default = true;

        let updatedList = [...accounts];
        if (newAccount.is_default) {
            updatedList = updatedList.map(a => ({ ...a, is_default: false }));
        }
        updatedList.push(newAccount);

        try {
            await updateCompanyProfile({ bank_accounts: updatedList });
            setAccounts(updatedList);
            setIsAdding(false);
            reset();
            toast.success('Bank account added');
            onUpdate?.();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add bank account');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Account Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                    <div key={account.id} className="relative bg-white dark:bg-zinc-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group">

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(account.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-full">
                                        <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{account.bank_name}</h3>
                                        <p className="text-xs text-gray-500">{account.account_name}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${account.currency === 'AED' ? 'bg-blue-100 text-blue-800' :
                                        account.currency === 'EUR' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {account.currency}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-zinc-900 p-3 rounded">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">A/C Name</span>
                                    <span>{account.holder_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">Number</span>
                                    <span>{account.account_number}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">IBAN</span>
                                    <span>{account.iban}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-xs">SWIFT</span>
                                    <span>{account.swift_code}</span>
                                </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500 truncate">
                                <span className="text-gray-400 mr-2">Address:</span>
                                {account.bank_address}
                            </div>
                        </div>

                        {account.is_default && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Default Account
                            </div>
                        )}
                    </div>
                ))}

                {/* Add New Button */}
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-afconsult hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all text-gray-500 h-full min-h-[300px]"
                    >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="font-medium">Add Bank Account</span>
                    </button>
                )}
            </div>

            {/* Add Account Form */}
            {isAdding && (
                <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">New Bank Account</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bank Name</label>
                                <input {...register('bank_name', { required: true })} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-600" placeholder="e.g. Wio Business" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Label</label>
                                <input {...register('account_name', { required: true })} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-600" placeholder="e.g. Main AED" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Holder Name</label>
                                <input {...register('holder_name', { required: true })} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-600" placeholder="e.g. Al Faya Ventures LLC" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</label>
                                <input {...register('account_number', { required: true })} className="w-full px-3 py-2 border rounded-md font-mono dark:bg-zinc-800 dark:border-gray-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">IBAN</label>
                                <input {...register('iban', { required: true })} className="w-full px-3 py-2 border rounded-md font-mono dark:bg-zinc-800 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">SWIFT / BIC</label>
                                <input {...register('swift_code', { required: true })} className="w-full px-3 py-2 border rounded-md font-mono dark:bg-zinc-800 dark:border-gray-600" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bank Address</label>
                            <input {...register('bank_address', { required: true })} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-600" placeholder="Full Bank Address" />
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Currency</label>
                                <select {...register('currency')} className="px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-600 w-32">
                                    <option value="AED">AED</option>
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input type="checkbox" {...register('is_default')} className="w-4 h-4 rounded border-gray-300 text-afconsult focus:ring-afconsult" />
                                <label className="text-sm text-gray-700 dark:text-gray-300">Set as default account</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 bg-afconsult text-white rounded-md text-sm hover:bg-afconsult/90 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                Save Account
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}
