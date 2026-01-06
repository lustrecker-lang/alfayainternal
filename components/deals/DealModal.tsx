'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Send, Check, Activity, History } from 'lucide-react';
import { createDeal, updateDeal, deleteDeal, updateDealQuotes, addNoteToDeal } from '@/lib/deals';
import { getQuotes } from '@/lib/quotes';
import { getClients } from '@/lib/finance';
import { showToast } from '@/lib/toast';
import type { Deal, DealStage, DealNote } from '@/types/deal';
import type { ClientFull } from '@/lib/finance';
import type { Quote } from '@/types/quote';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal?: Deal | null;
}

const STAGES = [
    { value: 'cold', label: '❄️ Cold' },
    { value: 'warm', label: '🔥 Warm' },
    { value: 'hot', label: '🔥🔥 Hot' },
    { value: 'won', label: '🎉 Won' },
];

export default function DealModal({ isOpen, onClose, deal }: DealModalProps) {
    const [name, setName] = useState('');
    const [stage, setStage] = useState<DealStage>('cold');
    const [clientId, setClientId] = useState('');
    const [quoteIds, setQuoteIds] = useState<string[]>([]);
    const [newNote, setNewNote] = useState('');
    const [noteLog, setNoteLog] = useState<DealNote[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const notesEndRef = useRef<HTMLDivElement>(null);

    // Data
    const [clients, setClients] = useState<ClientFull[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadData();
            if (deal) {
                // Edit mode
                setName(deal.name);
                setStage(deal.stage);
                setClientId(deal.clientId || '');
                setQuoteIds(deal.quoteIds || ((deal as any).quoteId ? [(deal as any).quoteId] : [])); // Handle migration
                setNoteLog(deal.noteLog || []);
            } else {
                // Create mode
                resetForm();
            }
        }
    }, [isOpen, deal]);

    useEffect(() => {
        // Auto-scroll to bottom of notes
        if (notesEndRef.current) {
            notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [noteLog, isOpen]);

    // Calculate total value from selected quotes
    const selectedQuotesTotal = quoteIds.reduce((total, qId) => {
        const quote = quotes.find(q => q.id === qId);
        return total + (quote?.summary?.totalInternalCost || 0);
    }, 0);

    const loadData = async () => {
        setLoadingClients(true);
        try {
            const [clientsData, quotesData] = await Promise.all([
                getClients('imeda'),
                getQuotes('imeda')
            ]);
            setClients(clientsData);
            setQuotes(quotesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoadingClients(false);
        }
    };

    const resetForm = () => {
        setName('');
        setStage('cold');
        setClientId('');
        setQuoteIds([]);
        setNewNote('');
        setNoteLog([]);
    };

    const handleToggleQuote = (qId: string) => {
        setQuoteIds(prev => {
            const newIds = prev.includes(qId)
                ? prev.filter(id => id !== qId)
                : [...prev, qId];

            // Auto-set client if first quote selected and no client set
            if (newIds.length === 1 && !clientId) {
                const quote = quotes.find(q => q.id === qId);
                if (quote?.clientId) {
                    setClientId(quote.clientId);
                }
            }

            return newIds;
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast.error('Deal name is required');
            return;
        }

        setSaving(true);
        try {
            const selectedClient = clients.find(c => c.id === clientId);

            if (deal) {
                // Update existing deal
                await updateDeal(deal.id, {
                    name: name.trim(),
                    stage,
                    clientId: clientId || undefined,
                    clientName: selectedClient?.name,
                    quoteIds, // Save all quote IDs
                });

                // Update amounts based on quotes
                await updateDealQuotes(
                    deal.id,
                    quoteIds,
                    selectedQuotesTotal,
                    clientId,
                    selectedClient?.name
                );

                // Add new note if present
                if (newNote.trim()) {
                    await addNoteToDeal(deal.id, newNote.trim(), noteLog);
                }

                showToast.success('Deal updated');
            } else {
                // Create new deal
                // Combine any notes added via Send button + pending text
                const finalNoteLog = [...noteLog];
                if (newNote.trim()) {
                    finalNoteLog.push({
                        id: crypto.randomUUID(),
                        content: newNote.trim(),
                        createdAt: new Date()
                    });
                }

                const dealId = await createDeal('imeda', {
                    name: name.trim(),
                    stage,
                    clientId: clientId || undefined,
                    clientName: selectedClient?.name,
                    quoteIds,
                    noteLog: finalNoteLog,
                });

                // Set initial amount from quotes
                if (quoteIds.length > 0) {
                    await updateDealQuotes(
                        dealId,
                        quoteIds,
                        selectedQuotesTotal,
                        clientId, // Pass client info to ensure consistency
                        selectedClient?.name
                    );
                }

                showToast.success('Deal created');
            }

            onClose();
        } catch (error) {
            console.error('Error saving deal:', error);
            showToast.error('Failed to save deal');
        } finally {
            setSaving(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        const note: DealNote = {
            id: crypto.randomUUID(),
            content: newNote.trim(),
            createdAt: new Date()
        };

        setNoteLog([...noteLog, note]);
        setNewNote('');

        // Immediate save for existing deals
        if (deal) {
            try {
                await addNoteToDeal(deal.id, note.content, [], note);
            } catch (err) {
                console.error('Failed to save note', err);
                showToast.error('Failed to save note');
            }
        }
    };

    const handleDeleteClick = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        if (!deal) return;

        setDeleting(true);
        try {
            await deleteDeal(deal.id);
            showToast.success('Deal deleted');
            onClose();
        } catch (error) {
            console.error('Error deleting deal:', error);
            showToast.error('Failed to delete deal');
        } finally {
            setDeleting(false);
            setShowConfirmDelete(false);
        }
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
                    className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {deal ? 'Edit Deal' : 'New Deal'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLogs(!showLogs)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${showLogs
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                Log
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body - Scrollable */}
                    <div className="p-5 space-y-6 overflow-y-auto flex-1">

                        {/* 1. Deal Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                1. Deal Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Spring Training 2026"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                autoFocus
                            />
                        </div>

                        {/* 2. Client */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                2. Client
                            </label>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-sm"
                                disabled={loadingClients}
                            >
                                <option value="">No client selected</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>



                        {/* 3. Quotes (Multi-select) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                3. Quotes <span className="text-gray-400 font-normal ml-1">({quoteIds.length} selected)</span>
                            </label>

                            <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 max-h-40 overflow-y-auto">
                                {quotes.length > 0 ? quotes.map(quote => {
                                    const isSelected = quoteIds.includes(quote.id);
                                    return (
                                        <div
                                            key={quote.id}
                                            onClick={() => handleToggleQuote(quote.id)}
                                            className={`flex items-center p-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 border-b last:border-0 border-gray-100 dark:border-gray-700 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 flex-shrink-0 ${isSelected
                                                ? 'bg-imeda border-imeda text-white'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{quote.quoteName || 'Untitled Quote'}</div>
                                                <div className="text-xs text-gray-500 flex justify-between">
                                                    <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                                                    {quote.summary?.totalInternalCost > 0 && (
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                            AED {quote.summary.totalInternalCost.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-4 text-center text-sm text-gray-500">No quotes available</div>
                                )}
                            </div>

                            {selectedQuotesTotal > 0 && (
                                <div className="mt-2 flex justify-between items-center text-sm bg-gray-50 dark:bg-zinc-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                                    <span className="font-bold text-imeda text-lg">
                                        AED {selectedQuotesTotal.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 4. Notes Log */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                4. Notes & Activity
                            </label>

                            <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col h-64">
                                {/* Scrollable Log */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {noteLog.length === 0 && !deal?.notes ? (
                                        <div className="text-center text-gray-400 text-sm py-8 flex flex-col items-center gap-2">
                                            <Activity className="w-8 h-8 opacity-20" />
                                            <span>No notes yet. Start writing below...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Legacy Note */}
                                            {deal?.notes && (
                                                <div className="flex gap-3">
                                                    <div className="mt-1 flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                        OLD
                                                    </div>
                                                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm text-sm max-w-[85%]">
                                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{deal.notes}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Note Log */}
                                            {[...noteLog].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((note) => {
                                                if (note.isSystem && !showLogs) return null;

                                                if (note.isSystem) {
                                                    return (
                                                        <div key={note.id} className="flex justify-center my-4 animate-in fade-in">
                                                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                                                {note.content} • {new Date(note.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={note.id} className="flex gap-3">
                                                        <div className="mt-1 flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                            Me
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium text-gray-900 dark:text-white">You</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(note.createdAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
                                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={notesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex gap-2">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Type a note..."
                                        rows={1}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-zinc-900 text-sm resize-none focus:ring-1 focus:ring-imeda"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddNote();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim()}
                                        className="p-2 bg-imeda text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        {deal && (
                            <button
                                onClick={handleDeleteClick}
                                disabled={deleting}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        )}
                        <div className="flex-1"></div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-md transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-imeda text-white hover:opacity-90 rounded-md transition-colors text-sm font-medium"
                        >
                            {saving ? 'Saving...' : deal ? 'Save' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={confirmDelete}
                title="Delete Deal"
                message="Are you sure you want to delete this deal? This action cannot be undone."
                variant="danger"
                isLoading={deleting}
                confirmLabel="Delete Deal"
            />
        </>
    );
}
