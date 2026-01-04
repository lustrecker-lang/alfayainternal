'use client';

import { useState, useEffect } from 'react';
import { getCountries, addCountry, removeCountry, seedCountries } from '@/lib/locations';
import { Country } from '@/types/settings';
import { Plus, Trash2, Search, Loader2, Globe, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CountriesManager() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newCountry, setNewCountry] = useState({ name: '', code: '', flag: '' });

    useEffect(() => {
        loadCountries();
    }, []);

    const loadCountries = async () => {
        setLoading(true);
        const data = await getCountries();
        setCountries(data);
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCountry.name || !newCountry.code) return;

        try {
            await addCountry(newCountry);
            toast.success('Country added successfully');
            setNewCountry({ name: '', code: '', flag: '' });
            setIsAdding(false);
            loadCountries();
        } catch (error) {
            toast.error('Failed to add country');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;

        try {
            await removeCountry(id);
            toast.success('Country removed');
            loadCountries();
        } catch (error) {
            toast.error('Failed to remove country');
        }
    };

    const handleSeed = async () => {
        if (countries.length > 0 && !confirm('This will seed common countries. Continue?')) return;

        setLoading(true);
        try {
            await seedCountries();
            toast.success('Countries seeded successfully');
            loadCountries();
        } catch (error) {
            toast.error('Failed to seed countries');
        } finally {
            setLoading(false);
        }
    };

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-afconsult outline-none text-sm"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" />
                        Seed List
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-afconsult rounded-lg hover:bg-afconsult/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Country
                    </button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Country Name</label>
                            <input
                                required
                                value={newCountry.name}
                                onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                                placeholder="e.g. United Arab Emirates"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-afconsult outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">ISO Code (2-letter)</label>
                            <input
                                required
                                maxLength={2}
                                value={newCountry.code}
                                onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. AE"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-afconsult outline-none text-sm uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Flag Emoji</label>
                            <input
                                value={newCountry.flag}
                                onChange={(e) => setNewCountry({ ...newCountry, flag: e.target.value })}
                                placeholder="e.g. 🇦🇪"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-afconsult outline-none text-sm"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-2 bg-gray-900 dark:bg-zinc-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Country</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                </td>
                            </tr>
                        ) : filteredCountries.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No countries found. Add one or seed the list.
                                </td>
                            </tr>
                        ) : (
                            filteredCountries.map((country) => (
                                <tr key={country.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{country.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                                            {country.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDelete(country.id, country.name)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && countries.length > 0 && (
                <p className="text-[10px] text-gray-400 text-center">
                    Total {countries.length} countries registered globally.
                </p>
            )}
        </div>
    );
}
