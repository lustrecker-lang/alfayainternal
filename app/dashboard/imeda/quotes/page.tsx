'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getQuotes, deleteQuote } from '@/lib/quotes';
import { getClients, type ClientFull } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Quote } from '@/types/quote';
import { format } from 'date-fns';

export default function QuotesPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');

    const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quotesData, clientsData] = await Promise.all([
                getQuotes('imeda'),
                getClients('imeda')
            ]);
            setQuotes(quotesData);
            setClients(clientsData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast.error('Failed to load quotes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!quoteToDelete) return;
        try {
            setIsDeleting(true);
            await deleteQuote(quoteToDelete.id);
            showToast.success('Quote deleted successfully');
            loadData();
            setQuoteToDelete(null);
        } catch (error) {
            console.error('Error deleting quote:', error);
            showToast.error('Failed to delete quote');
        } finally {
            setIsDeleting(false);
        }
    };

    const getClientName = (clientId?: string) => {
        if (!clientId) return '-';
        const client = clients.find(c => c.id === clientId);
        return client?.name || '-';
    };

    const formatCurrency = (amount: number) => {
        return `AED ${amount.toLocaleString()}`;
    };

    // Filter quotes
    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = q.quoteName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClient = !clientFilter || q.clientId === clientFilter;
        return matchesSearch && matchesClient;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl text-gray-900 dark:text-white">Quotes</h1>
                <Link href="/dashboard/imeda/quotes/new">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-imeda text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium w-full md:w-auto"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Plus className="w-4 h-4" />
                        New Quote
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search quotes..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm"
                        style={{ borderRadius: '0.25rem' }}
                    />
                </div>
                <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-imeda text-sm min-w-[160px]"
                    style={{ borderRadius: '0.25rem' }}
                >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ borderRadius: '0.5rem' }}>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-imeda"></div>
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">No quotes found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900">
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Quote Name</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Client</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Dates</th>
                                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Participants</th>
                                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Total Cost</th>
                                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Profit</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((quote) => (
                                <tr
                                    key={quote.id}
                                    onClick={() => router.push(`/dashboard/imeda/quotes/${quote.id}`)}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{quote.quoteName}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{getClientName(quote.clientId)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {format(quote.arrivalDate, 'MMM d')} – {format(quote.departureDate, 'MMM d, yyyy')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{quote.participantCount}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(quote.summary.totalInternalCost)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-sm font-medium ${quote.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(quote.summary.netProfit)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setQuoteToDelete(quote);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!quoteToDelete}
                onClose={() => setQuoteToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Quote"
                message={`Are you sure you want to delete "${quoteToDelete?.quoteName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
