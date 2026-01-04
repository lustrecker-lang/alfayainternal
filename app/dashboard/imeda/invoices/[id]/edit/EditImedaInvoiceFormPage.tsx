'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { updateInvoice, getInvoice } from '@/lib/invoice';
import { getClients } from '@/lib/finance';
import { getCompanyProfile } from '@/lib/settings';
import { getBrandBySlug } from '@/lib/brands';
import type { ClientFull } from '@/lib/finance';
import type { NewInvoiceData, Invoice } from '@/types/invoice';
import type { CompanyProfile, BankAccount } from '@/types/settings';
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/finance';

export default function EditImedaInvoiceFormPage() {
    const router = useRouter();
    const params = useParams();
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
    const [brand, setBrand] = useState<any>(null);
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<NewInvoiceData>({
        defaultValues: {
            unit_id: 'imeda',
            invoice_number: '',
            date_issue: new Date().toISOString().split('T')[0] as any,
            date_due: new Date().toISOString().split('T')[0] as any,
            items: [],
            vat_rate: 0,
            status: 'DRAFT',
            currency: 'AED',
            notes: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // Watchers
    const items = watch('items');
    const vatRate = watch('vat_rate');
    const selectedCurrency = watch('currency');
    const invoiceNumber = watch('invoice_number');
    const dateDue = watch('date_due');

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const vatAmount = subtotal * vatRate;
    const totalAmount = subtotal + vatAmount;

    useEffect(() => {
        loadData();
    }, []);

    // Update totals
    useEffect(() => {
        setValue('subtotal', subtotal);
        setValue('vat_amount', vatAmount);
        setValue('total_amount', totalAmount);
    }, [subtotal, vatAmount, totalAmount, setValue]);

    // Handle currency change - clear or update selected bank
    useEffect(() => {
        if (!loading && selectedBank && selectedBank.currency !== selectedCurrency) {
            setSelectedBank(null);
            // Try to find a match in the new currency
            if (companyProfile?.bank_accounts) {
                const match = companyProfile.bank_accounts.find(b => b.currency === selectedCurrency && b.is_default)
                    || companyProfile.bank_accounts.find(b => b.currency === selectedCurrency);
                if (match) setSelectedBank(match);
            }
        }
    }, [selectedCurrency, companyProfile, loading]);


    const loadData = async () => {
        setLoading(true);
        try {
            const [clientsData, profileData, brandData, invoiceData] = await Promise.all([
                getClients('imeda'),
                getCompanyProfile(),
                getBrandBySlug('imeda'),
                getInvoice(params.id as string)
            ]);
            setClients(clientsData);
            setCompanyProfile(profileData);
            setBrand(brandData);

            if (invoiceData) {
                // Formatting dates for input[type="date"]
                const formatDate = (date: Date | string) => {
                    const d = new Date(date);
                    return d.toISOString().split('T')[0];
                };

                reset({
                    ...invoiceData,
                    date_issue: formatDate(invoiceData.date_issue) as any,
                    date_due: formatDate(invoiceData.date_due) as any,
                });

                // Set bank account from invoice if available
                if (invoiceData.bank_account) {
                    setSelectedBank(invoiceData.bank_account);
                }
            } else {
                alert('Invoice not found');
                router.push('/dashboard/imeda/invoices');
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBankSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const bankId = e.target.value;
        const bank = companyProfile?.bank_accounts.find(b => b.id === bankId);
        if (bank) {
            setSelectedBank(bank);
        }
    };

    const onSubmit = async (data: NewInvoiceData) => {
        setSubmitting(true);
        try {
            const client = clients.find(c => c.id === data.client_id);

            // Format address
            let holdingAddress = '';
            if (companyProfile?.address) {
                const { street, city, state, country } = companyProfile.address;
                holdingAddress = [street, city, state, country].filter(Boolean).join(', ');
            }

            // We only send the updated fields, plus re-calculated totals to be safe
            const updatedData: Partial<Invoice> = {
                ...data,
                client_name: client?.name || 'Unknown Client',
                holding_company_name: companyProfile?.legal_name || 'Al Faya Ventures',
                holding_company_address: holdingAddress,
                holding_company_trn: companyProfile?.trn_number,
                holding_company_trade_license: companyProfile?.trade_license_number,

                // Prioritize Brand level contact info
                holding_company_email: brand?.unit_email || companyProfile?.contact_email,
                holding_company_phone: brand?.unit_phone || companyProfile?.contact_phone,

                bank_account: selectedBank || undefined,

                date_issue: new Date(data.date_issue),
                date_due: new Date(data.date_due),
                subtotal,
                vat_amount: vatAmount,
                total_amount: totalAmount
            };

            await updateInvoice(params.id as string, updatedData);

            router.push(`/dashboard/imeda/invoices/${params.id}`);
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('Failed to update invoice');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter banks by currency
    const availableBanks = companyProfile?.bank_accounts.filter(b => b.currency === selectedCurrency) || [];

    const formatDate = (d: Date | string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const contactEmail = brand?.unit_email || companyProfile?.contact_email || 'accounting@alfaya.com';

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/imeda/invoices/${params.id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* A4 Container */}
                <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-lg p-12 text-gray-900 text-sm flex flex-col justify-between">
                    <div>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <div className="w-32 h-12 bg-gray-200 flex items-center justify-center text-gray-400 font-bold mb-4">
                                    LOGO
                                </div>
                                <div className="text-gray-500 text-xs">
                                    <p className="font-semibold text-gray-700">IMEDA</p>
                                    {companyProfile && (
                                        <>
                                            <p>by {companyProfile.legal_name}</p>
                                            <p className="mt-1 max-w-[200px]">{companyProfile.address.street}, {companyProfile.address.city}, {companyProfile.address.country}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-light text-imeda mb-4">INVOICE</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-end gap-4">
                                        <label className="text-gray-500 font-medium w-24">Invoice #</label>
                                        <input
                                            {...register('invoice_number', { required: true })}
                                            className="text-right font-mono border-b border-gray-300 focus:border-imeda outline-none w-32"
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <label className="text-gray-500 font-medium w-24">Date</label>
                                        <input
                                            type="date"
                                            {...register('date_issue', { required: true })}
                                            className="text-right font-mono border-b border-gray-300 focus:border-imeda outline-none w-32"
                                        />
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <label className="text-gray-500 font-medium w-24">Due Date</label>
                                        <input
                                            type="date"
                                            {...register('date_due', { required: true })}
                                            className="text-right font-mono border-b border-gray-300 focus:border-imeda outline-none w-32"
                                        />
                                    </div>
                                    {/* Currency Selector */}
                                    <div className="flex items-center justify-end gap-4">
                                        <label className="text-gray-500 font-medium w-24">Currency</label>
                                        <select
                                            {...register('currency')}
                                            className="text-right font-mono border-b border-gray-300 focus:border-imeda outline-none w-32 bg-transparent"
                                        >
                                            <option value="AED">AED</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-12">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Bill To</label>
                            <select
                                {...register('client_id', { required: true })}
                                className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-imeda outline-none"
                            >
                                <option value="">Select a client...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <table className="w-full mb-4">
                                <thead>
                                    <tr className="border-b-2 border-imeda">
                                        <th className="py-2 text-left font-bold text-gray-600 w-[50%]">Description</th>
                                        <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Quantity</th>
                                        <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Rate</th>
                                        <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Amount</th>
                                        <th className="w-[5%]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {fields.map((item, index) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-2 pr-4">
                                                <div className="space-y-1">
                                                    <input
                                                        {...register(`items.${index}.description` as const, { required: true })}
                                                        placeholder="Item description"
                                                        className="w-full p-1 border border-transparent hover:border-gray-200 focus:border-imeda outline-none rounded transition-colors font-medium"
                                                    />
                                                    <input
                                                        {...register(`items.${index}.details` as const)}
                                                        placeholder="Additional details (optional)"
                                                        className="w-full p-1 text-xs text-gray-500 border border-transparent hover:border-gray-200 focus:border-imeda outline-none rounded transition-colors"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                                    className="w-full text-right p-1 border border-transparent hover:border-gray-200 focus:border-imeda outline-none rounded"
                                                />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    {...register(`items.${index}.rate` as const, { valueAsNumber: true })}
                                                    className="w-full text-right p-1 border border-transparent hover:border-gray-200 focus:border-imeda outline-none rounded"
                                                />
                                            </td>
                                            <td className="py-2 text-right font-mono text-gray-700">
                                                {formatCurrency((items[index]?.quantity || 0) * (items[index]?.rate || 0), selectedCurrency)}
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <button
                                type="button"
                                onClick={() => append({ id: crypto.randomUUID(), description: '', details: '', quantity: 1, rate: 0, amount: 0 })}
                                className="flex items-center gap-2 text-imeda hover:text-imeda/80 font-medium text-xs px-2 py-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Line Item
                            </button>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/3 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-mono">{formatCurrency(subtotal, selectedCurrency)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>VAT</span>
                                        <select
                                            {...register('vat_rate', { valueAsNumber: true })}
                                            className="text-xs border border-gray-300 rounded p-0.5"
                                        >
                                            <option value={0}>0%</option>
                                            <option value={0.05}>5%</option>
                                        </select>
                                    </div>
                                    <span className="font-mono">{formatCurrency(vatAmount, selectedCurrency)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-300 pt-3">
                                    <span>Total ({selectedCurrency})</span>
                                    <span className="font-mono">{formatCurrency(totalAmount, selectedCurrency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div>
                        {/* Additional Notes */}
                        <div className="mb-8">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Additional Notes</label>
                            <textarea
                                {...register('notes')}
                                rows={2}
                                className="w-full p-3 border border-gray-200 rounded resize-none focus:border-imeda outline-none text-gray-600 text-sm bg-gray-50"
                                placeholder="Any additional terms or notes..."
                            />
                        </div>

                        {/* 2-Column Payment & Bank Details Footer */}
                        <div className="grid grid-cols-2 gap-12 border-t pt-8">

                            {/* Left Box: Payment Details */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4">Payment Details</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Total amount due:</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(totalAmount, selectedCurrency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Invoice number:</span>
                                            <span className="font-bold text-gray-900">{invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment description:</span>
                                            <span className="text-gray-900">{invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment deadline:</span>
                                            <span className="text-gray-900">{formatDate(dateDue as any)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Confirmation</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Once the transfer has been completed, please send a payment confirmation or transfer receipt to the following address: <span className="text-imeda font-medium">{contactEmail}</span>. This will allow us to track your payment and confirm your registration without delay.
                                    </p>
                                </div>
                            </div>

                            {/* Right Box: Bank Details */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900">Bank Details</h3>
                                    {/* Bank Selector inside the box */}
                                    <select
                                        className="text-xs border border-gray-300 rounded p-1 bg-white"
                                        onChange={handleBankSelection}
                                        value={selectedBank?.id || ''}
                                    >
                                        <option value="" disabled>Select Bank...</option>
                                        {availableBanks.map(bank => (
                                            <option key={bank.id} value={bank.id}>{bank.bank_name} ({bank.currency})</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBank ? (
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs text-gray-400">Beneficiary name</span>
                                            <span className="font-medium text-gray-900">{selectedBank.holder_name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Company address</span>
                                            <span className="font-medium text-gray-900">{selectedBank.bank_address}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Bank name</span>
                                            <span className="font-medium text-gray-900">{selectedBank.bank_name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-xs text-gray-400">IBAN</span>
                                                <span className="font-medium text-gray-900 break-words">{selectedBank.iban}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-400">BIC/SWIFT</span>
                                                <span className="font-medium text-gray-900">{selectedBank.swift_code}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Reference to indicate</span>
                                            <span className="font-medium text-gray-900">{invoiceNumber}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-xs text-italic">
                                        Please select a bank account above.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Bar */}
                <div className="fixed bottom-6 right-6 flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/imeda/invoices/${params.id}`)}
                        className="px-6 py-3 bg-white text-gray-700 font-medium rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-imeda text-white font-medium rounded-full shadow-lg hover:bg-imeda/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Update Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
