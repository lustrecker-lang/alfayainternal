'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInvoices } from '@/lib/invoice';
import type { Invoice } from '@/types/invoice';
import { Plus, FileText, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/finance';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await getInvoices('afconsult');
            setInvoices(data);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'SENT': return 'bg-blue-100 text-blue-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'OVERDUE': return 'bg-red-100 text-red-800';
            case 'VOID': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
                <Link
                    href="/dashboard/afconsult/invoices/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-afconsult hover:bg-afconsult/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afconsult transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Link>
            </div>

            {/* Invoices List */}
            <div className="bg-white dark:bg-zinc-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-zinc-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Issued</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No invoices found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/afconsult/invoices/${invoice.id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-mono">
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.client_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.date_issue.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono text-right">
                                            {formatCurrency(invoice.total_amount, invoice.currency || 'AED')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                                                {invoice.status.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/dashboard/afconsult/invoices/${invoice.id}`} className="text-afconsult hover:text-afconsult/80">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
