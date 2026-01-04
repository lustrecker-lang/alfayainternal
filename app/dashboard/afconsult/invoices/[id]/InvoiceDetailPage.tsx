'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoice, updateInvoiceStatus, deleteInvoice } from '@/lib/invoice';
import { formatCurrency } from '@/lib/finance';
import type { Invoice } from '@/types/invoice';
import { ArrowLeft, Trash2, Printer, CheckCircle, XCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadInvoice();
        }
    }, [params.id]);

    const loadInvoice = async () => {
        try {
            const data = await getInvoice(params.id as string);
            setInvoice(data);
        } catch (error) {
            console.error('Error loading invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status: Invoice['status']) => {
        if (!invoice) return;
        try {
            await updateInvoiceStatus(invoice.id, status);
            setInvoice({ ...invoice, status });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async () => {
        if (!invoice || !confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await deleteInvoice(invoice.id);
            router.push('/dashboard/afconsult/invoices');
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!invoice) return <div className="p-8">Invoice not found</div>;

    const formatDate = (d: Date | string) => {
        if (!d) return '';
        // Handle both Date objects and string/Firestore timestamps
        const date = typeof d === 'string' ? new Date(d) : d;
        // Check if valid date
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/invoices" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice {invoice.invoice_number}</h1>
                        <span className={`px-2 py-1 rounded text-xs font-medium border
                            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' :
                                invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                            {invoice.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded shadow-sm transition-colors"
                        title="Print Invoice"
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    {invoice.status !== 'PAID' && (
                        <button
                            onClick={() => handleStatusChange('PAID')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm transition-colors text-sm font-medium"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark Paid
                        </button>
                    )}

                    {invoice.status === 'DRAFT' && (
                        <button
                            onClick={() => handleStatusChange('SENT')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-colors text-sm font-medium"
                        >
                            <Send className="w-4 h-4" />
                            Mark Sent
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="p-2 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-gray-400 rounded shadow-sm transition-colors"
                        title="Delete Invoice"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* A4 Preview Container */}
            <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-lg p-12 text-gray-900 text-sm flex flex-col justify-between print:shadow-none print:w-full print:max-w-none print:m-0 print:p-8">
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="w-32 h-12 bg-gray-200 flex items-center justify-center text-gray-400 font-bold mb-4">
                                LOGO
                            </div>
                            <div className="text-gray-500 text-xs">
                                <p className="font-semibold text-gray-700">AF Consult</p>
                                <p>by {invoice.holding_company_name || 'Al Faya Ventures'}</p>
                                <p className="mt-1 max-w-[200px]">{invoice.holding_company_address}</p>
                                <p className="mt-1">TRN: {invoice.holding_company_trn}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-light text-afconsult mb-4">INVOICE</h2>
                            <div className="space-y-1 text-gray-600">
                                <div className="flex justify-end gap-4">
                                    <span className="font-medium">Invoice #</span>
                                    <span className="w-32">{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="font-medium">Date</span>
                                    <span className="w-32">{formatDate(invoice.date_issue)}</span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="font-medium">Due Date</span>
                                    <span className="w-32">{formatDate(invoice.date_due)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-12">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Bill To</h3>
                        <div className="text-gray-800">
                            <p className="font-bold text-lg">{invoice.client_name}</p>
                            {/* We don't have client address snapshotted yet, relying on name for now */}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-afconsult">
                                    <th className="py-2 text-left font-bold text-gray-600 w-[50%]">Description</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Quantity</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Rate</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoice.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-3">
                                            <p className="font-medium">{item.description}</p>
                                            {item.details && <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>}
                                        </td>
                                        <td className="py-3 text-right">{item.quantity}</td>
                                        <td className="py-3 text-right">{formatCurrency(item.rate, invoice.currency)}</td>
                                        <td className="py-3 text-right font-mono">{formatCurrency(item.amount, invoice.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-1/3 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT {(invoice.vat_rate * 100)}%</span>
                                <span className="font-mono">{formatCurrency(invoice.vat_amount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-300 pt-2 mt-1">
                                <span>Total</span>
                                <span className="font-mono">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="grid grid-cols-2 gap-12 border-t pt-8">
                    {/* Payment Details */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Payment Details</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Total amount due:</span>
                                <span className="font-bold text-gray-900">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Invoice number:</span>
                                <span className="font-bold text-gray-900">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment description:</span>
                                <span className="text-gray-900">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment deadline:</span>
                                <span className="text-gray-900">{formatDate(invoice.date_due)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 print:bg-transparent print:border-none print:p-0">
                        <h3 className="font-bold text-gray-900 mb-4">Bank Details</h3>
                        {invoice.bank_account ? (
                            <div className="space-y-2 text-sm text-gray-600">
                                <div>
                                    <span className="block text-xs text-gray-400">Beneficiary name</span>
                                    <span className="font-bold text-gray-900">{invoice.bank_account.holder_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">Bank name</span>
                                    <span className="font-bold text-gray-900">{invoice.bank_account.bank_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">IBAN</span>
                                    <span className="font-bold text-gray-900">{invoice.bank_account.iban}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">BIC/SWIFT</span>
                                    <span className="font-medium text-gray-900">{invoice.bank_account.swift_code}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-xs">No bank account specified.</p>
                        )}
                    </div>
                </div>

                {invoice.notes && (
                    <div className="mt-8 border-t pt-4">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Notes</h3>
                        <p className="text-gray-600 italic">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
