'use client';

import { useState, useEffect } from 'react';
import { getVendors, addVendor, deleteVendor, type Vendor } from '@/lib/finance';
import { Plus, Search, Trash2, Edit2, Loader2, Building, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import VendorDialog from './VendorDialog';

export default function VendorManager() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Add state
    const [newVendorName, setNewVendorName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Dialog state
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        try {
            const data = await getVendors();
            setVendors(data);
        } catch (error) {
            console.error('Failed to load vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVendorName.trim()) return;

        setIsAdding(true);
        try {
            await addVendor(newVendorName);
            setNewVendorName('');
            await loadVendors();
        } catch (error) {
            console.error('Failed to add vendor:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this vendor? Current transactions will keep the historical name.')) return;

        try {
            await deleteVendor(id);
            setVendors(vendors.filter(v => v.id !== id));
        } catch (error) {
        }
    };



    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Global Vendors</h2>
                <div className="text-sm text-gray-500">Shared across all units</div>
            </div>

            {/* Add New Section */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleAddVendor} className="flex gap-4">
                    <input
                        type="text"
                        value={newVendorName}
                        onChange={(e) => setNewVendorName(e.target.value)}
                        placeholder="Organization or Individual Name (e.g. Amazon AWS, Emirates, Freelancer John)"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newVendorName.trim() || isAdding}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Vendor
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vendors..."
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                    />
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    {filteredVendors.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            {searchQuery ? 'No matching vendors found.' : 'No vendors added yet.'}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 font-medium text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Vendor Name</th>
                                    <th className="px-6 py-3 w-1/3">Details</th>
                                    <th className="px-6 py-3">Added On</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <span className="text-gray-900 dark:text-gray-100 font-medium">{vendor.name}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                {vendor.taxId && (
                                                    <div className="flex items-center gap-1.5" title="Tax ID">
                                                        <Building className="w-3 h-3" />
                                                        <span>{vendor.taxId}</span>
                                                    </div>
                                                )}
                                                {vendor.address?.city && (
                                                    <div className="flex items-center gap-1.5" title="Location">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>
                                                            {[vendor.address.city, vendor.address.country].filter(Boolean).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                                {!vendor.taxId && !vendor.address?.city && (
                                                    <span className="text-gray-400 italic">No extra details</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {format(vendor.createdAt, 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedVendor(vendor)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vendor.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            {selectedVendor && (
                <VendorDialog
                    vendor={selectedVendor}
                    isOpen={!!selectedVendor}
                    onClose={() => setSelectedVendor(null)}
                    onUpdate={loadVendors}
                />
            )}
        </div>
    );
}
