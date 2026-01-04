'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInvoice, updateInvoiceStatus, deleteInvoice } from '@/lib/invoice';
import type { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/finance';
import TransactionDialog from '@/components/finance/TransactionDialog';
import { ArrowLeft, Printer, Download, CheckCircle, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useBrandTheme } from '@/hooks/useBrandTheme';
import { toast } from 'react-hot-toast';

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    // Theme Hook - hardcoded to imeda for this context as it's under imeda dashboard
    const { brand, loading: brandLoading } = useBrandTheme('imeda');
    const brandColor = brand?.brand_color_primary || '#000000';

    useEffect(() => {
        if (params.id) {
            loadInvoice(params.id as string);
        }
    }, [params.id]);

    const loadInvoice = async (id: string) => {
        setLoading(true);
        try {
            const data = await getInvoice(id);
            setInvoice(data);
        } catch (error) {
            console.error('Error loading invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        if (!invoice?.id) return;
        try {
            await updateInvoiceStatus(invoice.id, 'PAID');
            loadInvoice(invoice.id); // Reload to show new status
            toast.success('Payment recorded successfully');
        } catch (error) {
            console.error('Error updating invoice status:', error);
            toast.error('Failed to update invoice status');
        }
    };

    const handleDelete = async () => {
        if (!invoice?.id) return;
        if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

        try {
            await deleteInvoice(invoice.id);
            toast.success('Invoice deleted successfully');
            router.push('/dashboard/imeda/invoices');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500">Loading invoice...</div>;
    if (!invoice) return <div className="text-center py-12 text-red-500">Invoice not found.</div>;

    const isPaid = invoice.status === 'PAID';
    const currency = invoice.currency || 'AED';

    // Logo Logic: Prioritize squared logo as requested, fallback to regular logo
    const logoSrc = brand?.logo_squared_url || brand?.logo_url;

    // Email for confirmation text
    const contactEmail = invoice.holding_company_email || 'accounting@alfaya.com';

    // Format Date helper
    const formatDateLong = (d: Date | string) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-a4-page, #invoice-a4-page * {
                        visibility: visible;
                    }
                    #invoice-a4-page {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 48px !important; /* Force padding to match screen p-12 */
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}} />
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/imeda/invoices" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Invoice {invoice.invoice_number}
                    </h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                        {invoice.status.toLowerCase()}
                    </span>
                </div>

                <div className="flex gap-3">
                    {/* Record Payment Button - Only if not PAID */}
                    {!isPaid && (
                        <TransactionDialog
                            defaultUnit="imeda"
                            brandColor="imeda"
                            prefillData={{
                                type: 'INCOME',
                                amount: invoice.total_amount,
                                currency: currency,
                                category: 'Sales Revenue',
                                vendor: invoice.client_name,
                                description: `Payment for Invoice ${invoice.invoice_number}`,
                                invoiceReference: invoice.invoice_number
                            }}
                            onSuccess={handlePaymentSuccess}
                            triggerButton={
                                <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Record Payment
                                </button>
                            }
                        />
                    )}

                    <Link
                        href={`/dashboard/imeda/invoices/${invoice.id}/edit`}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Link>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                </div>
            </div>

            {/* A4 Preview */}
            <div id="invoice-a4-page" className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-lg p-12 text-gray-900 text-sm flex flex-col justify-between">
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            {logoSrc ? (
                                <div className="relative w-16 h-16 mb-4">
                                    <Image
                                        src={logoSrc}
                                        alt={brand?.display_name || 'Logo'}
                                        fill
                                        className="object-contain object-left rounded"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 font-bold mb-4 rounded">
                                    LOGO
                                </div>
                            )}
                            <div className="text-gray-500 text-xs mt-2">
                                <p className="font-semibold text-gray-700 text-sm">{brand?.display_name || 'IMEDA'}</p>
                                {invoice.holding_company_name ? (
                                    <>
                                        <p>by {invoice.holding_company_name}</p>
                                        <p className="mt-1 max-w-[200px] whitespace-pre-wrap">{invoice.holding_company_address || 'Dubai, UAE'}</p>
                                    </>
                                ) : (
                                    <p>Dubai, UAE</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <h2
                                className="text-4xl font-light mb-4"
                                style={{ color: brandColor }}
                            >
                                INVOICE
                            </h2>
                            <div className="space-y-1 text-gray-600">
                                <p><span className="font-bold">Invoice #:</span> {invoice.invoice_number}</p>
                                <p><span className="font-bold">Date:</span> {new Date(invoice.date_issue).toLocaleDateString()}</p>
                                <p><span className="font-bold">Due Date:</span> {new Date(invoice.date_due).toLocaleDateString()}</p>
                                <p><span className="font-bold">Currency:</span> {currency}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-12">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Bill To</h3>
                        <p className="font-bold text-lg">{invoice.client_name}</p>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full mb-4">
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${brandColor}` }}>
                                    <th className="py-2 text-left font-bold text-gray-600 w-[50%]">Description</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Quantity</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Rate</th>
                                    <th className="py-2 text-right font-bold text-gray-600 w-[15%]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoice.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-3 pr-4">
                                            <div className="font-medium text-gray-900">{item.description}</div>
                                            {item.details && (
                                                <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">{item.details}</div>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-right">{item.quantity}</td>
                                        <td className="py-3 pr-4 text-right">{formatCurrency(item.rate, currency)}</td>
                                        <td className="py-3 text-right font-mono text-gray-700">{formatCurrency(item.amount, currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                        <div className="w-1/3 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatCurrency(invoice.subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT ({invoice.vat_rate * 100}%)</span>
                                <span className="font-mono">{formatCurrency(invoice.vat_amount, currency)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-300 pt-3">
                                <span>Total ({currency})</span>
                                <span className="font-mono">{formatCurrency(invoice.total_amount, currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section (Bottom) */}
                <div>
                    {/* Additional Notes (if any) */}
                    {invoice.notes && (
                        <div className="mb-6">
                            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Additional Notes</h3>
                            <p className="whitespace-pre-wrap text-gray-600 font-mono text-xs">{invoice.notes}</p>
                        </div>
                    )}

                    {/* 2-Column Payment & Bank Details Footer */}
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">

                        {/* Left Box: Payment Details */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-3">Payment Details</h3>
                                    <div className="space-y-1.5 text-xs text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Total amount due:</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(invoice.total_amount, currency)}</span>
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
                                            <span className="text-gray-900">{formatDateLong(invoice.date_due)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1.5">Confirmation</h3>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        Once the transfer has been completed, please send a payment confirmation or transfer receipt to the following address: <span className="font-medium" style={{ color: brandColor }}>{contactEmail}</span>. This will allow us to track your payment and confirm your registration without delay.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Box: Bank Details */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-full">
                            <h3 className="font-bold text-gray-900 text-sm mb-3">Bank Details</h3>

                            {invoice.bank_account ? (
                                <div className="space-y-2 text-xs text-gray-600">
                                    <div>
                                        <span className="block text-[10px] text-gray-400">Beneficiary name</span>
                                        <span className="font-medium text-gray-900">{invoice.bank_account.holder_name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400">Company address</span>
                                        <span className="font-medium text-gray-900">{invoice.bank_account.bank_address}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400">Bank name</span>
                                        <span className="font-medium text-gray-900">{invoice.bank_account.bank_name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="block text-[10px] text-gray-400">IBAN</span>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">{invoice.bank_account.iban}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400">BIC/SWIFT</span>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">{invoice.bank_account.swift_code}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-gray-400">Reference to indicate</span>
                                        <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-xs text-italic">
                                    {invoice.notes ? 'See Notes regarding payment details.' : 'No bank details attached.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legal Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-center items-center gap-4 text-[10px] text-gray-500 font-medium">
                        {brand?.official_website && (
                            <span style={{ color: brandColor }} className="font-bold">{brand.official_website}</span>
                        )}

                        {invoice.holding_company_trade_license && (
                            <span>Trade License: {invoice.holding_company_trade_license}</span>
                        )}
                        {invoice.holding_company_trn && (
                            <span>TRN: {invoice.holding_company_trn}</span>
                        )}
                        {invoice.holding_company_email && (
                            <span>E: {invoice.holding_company_email}</span>
                        )}
                        {invoice.holding_company_phone && (
                            <span>T: {invoice.holding_company_phone}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
