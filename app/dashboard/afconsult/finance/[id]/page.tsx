'use client';

import { ArrowLeft, Save, FileDown, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, use } from 'react';

interface LineItem {
    id: string;
    itemName: string;
    description: string;
    quantity: number;
    amount: number;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: 'INV-2026-001',
        status: 'Paid',
        clientName: 'Global Industries',
        issuedDate: '2026-01-02',
        dueDate: '2026-02-01',
        createdDate: '2026-01-02',
        currency: 'AED',
    });

    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: '1', itemName: '', description: '', quantity: 1, amount: 0 },
    ]);

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            itemName: '',
            description: '',
            quantity: 1,
            amount: 0,
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter(item => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setLineItems(lineItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    };

    const handleExportPDF = () => {
        alert('Export PDF functionality - would generate PDF here');
    };

    const handleSave = () => {
        alert('Save functionality - would save invoice data');
    };

    const confirmDelete = () => {
        alert('Delete functionality - would delete and redirect');
        setShowDeleteDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Back and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/afconsult/finance">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors" style={{ borderRadius: '0.25rem' }}>
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </Link>
                    <h1 className="text-3xl text-gray-900 dark:text-white">Invoice Details</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Delete Icon */}
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        style={{ borderRadius: '0.25rem' }}
                        title="Delete Invoice"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {/* PDF Button */}
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <FileDown className="w-4 h-4" />
                        PDF
                    </button>
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white hover:opacity-90 transition-opacity shadow-sm text-sm font-medium font-sans"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        <Save className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Invoice Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                        <form id="invoice-form" className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                        style={{ borderRadius: '0.25rem' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none appearance-none bg-no-repeat bg-right"
                                        style={{ borderRadius: '0.25rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Sent">Sent</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Client Name</label>
                                <input
                                    type="text"
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                    style={{ borderRadius: '0.25rem' }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Issued Date</label>
                                    <input
                                        type="date"
                                        value={formData.issuedDate}
                                        onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                        style={{ borderRadius: '0.25rem' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                        style={{ borderRadius: '0.25rem' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-2 font-sans">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none appearance-none bg-no-repeat bg-right"
                                        style={{ borderRadius: '0.25rem', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 12px center' }}
                                    >
                                        <option value="AED">AED</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white dark:bg-zinc-800 p-8 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Line Items</h3>

                        <div className="space-y-3">
                            {lineItems.map((item, index) => (
                                <div key={item.id} className="border border-gray-200 dark:border-gray-700 p-4" style={{ borderRadius: '0.25rem' }}>
                                    <div className="grid grid-cols-12 gap-3 items-start">
                                        <div className="col-span-3">
                                            <label className="block text-xs font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Item Name</label>
                                            <input
                                                type="text"
                                                value={item.itemName}
                                                onChange={(e) => updateLineItem(item.id, 'itemName', e.target.value)}
                                                placeholder="Service/Product"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                        </div>

                                        <div className="col-span-4">
                                            <label className="block text-xs font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Description</label>
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                placeholder="Brief description"
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-normal text-gray-700 dark:text-gray-300 mb-1 font-sans">Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.amount}
                                                onChange={(e) => updateLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-afconsult outline-none"
                                                style={{ borderRadius: '0.25rem' }}
                                            />
                                        </div>

                                        <div className="col-span-1 flex items-end justify-center pb-2">
                                            <button
                                                onClick={() => removeLineItem(item.id)}
                                                disabled={lineItems.length === 1}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                style={{ borderRadius: '0.25rem' }}
                                                title="Delete item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add Line Item Button */}
                            <button
                                onClick={addLineItem}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-afconsult hover:text-afconsult transition-colors flex items-center justify-center gap-2 font-sans text-sm"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Line Item
                            </button>

                            <div className="pt-4 border-t border-gray-300 dark:border-gray-600 flex justify-between items-center">
                                <span className="text-sm font-normal text-gray-700 dark:text-gray-300 font-sans">Total Amount:</span>
                                <span className="text-xl font-normal text-gray-900 dark:text-white font-sans">
                                    {formData.currency} {calculateTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary Only */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-zinc-800 p-6 border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                        <h3 className="text-sm font-normal uppercase tracking-wider text-afconsult font-sans mb-4">Summary</h3>
                        <div className="space-y-2 text-sm font-sans">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Invoice ID:</span>
                                <span className="text-gray-900 dark:text-white">#{id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span className="text-gray-900 dark:text-white">{formData.createdDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Items:</span>
                                <span className="text-gray-900 dark:text-white">{lineItems.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteDialog(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-800 p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                            <h3 className="text-lg font-normal text-gray-900 dark:text-white mb-2">Delete Invoice?</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-sans">
                                Are you sure you want to delete this invoice? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteDialog(false)}
                                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-normal hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 bg-red-600 text-white font-normal hover:bg-red-700 transition-colors font-sans"
                                    style={{ borderRadius: '0.25rem' }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
