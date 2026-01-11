
import { useState, useEffect } from 'react';
import { type Vendor, updateVendor } from '@/lib/finance';
import { getCountries } from '@/lib/locations';
import { type Country } from '@/types/settings';
import { X, Check, Loader2, Building, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface VendorDialogProps {
    vendor: Vendor;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function VendorDialog({ vendor, isOpen, onClose, onUpdate }: VendorDialogProps) {
    const [formData, setFormData] = useState<Partial<Vendor>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        try {
            const data = await getCountries();
            setCountries(data);
        } catch (error) {
            console.error('Failed to load countries:', error);
        } finally {
            setIsLoadingCountries(false);
        }
    };

    useEffect(() => {
        if (isOpen && vendor) {
            setFormData({
                name: vendor.name,
                taxId: vendor.taxId || '',
                contactPerson: vendor.contactPerson || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                website: vendor.website || '',
                address: {
                    street: vendor.address?.street || '',
                    city: vendor.address?.city || '',
                    country: vendor.address?.country || '',
                }
            });
        }
    }, [isOpen, vendor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateVendor(vendor.id, formData);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update vendor:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Vendor Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax ID / TRN</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.taxId || ''}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    className="w-full pl-9 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. 100234567890003"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                            <input
                                type="text"
                                value={formData.contactPerson || ''}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-9 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-9 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={formData.website || ''}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full pl-9 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Address
                        </h3>
                        <div>
                            <input
                                type="text"
                                value={formData.address?.street || ''}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, street: e.target.value } })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                                placeholder="Street Address"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={formData.address?.city || ''}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, city: e.target.value } })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="City"
                                />
                                {isLoadingCountries ? (
                                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-zinc-900 rounded-md text-gray-500 text-sm">
                                        Loading countries...
                                    </div>
                                ) : (
                                    <select
                                        value={formData.address?.country || ''}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address!, country: e.target.value } })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 rounded-md focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.name}>
                                                {country.flag} {country.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
