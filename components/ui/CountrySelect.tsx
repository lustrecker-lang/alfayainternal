'use client';

import { useState, useEffect } from 'react';
import { getCountries } from '@/lib/locations';
import { Country } from '@/types/settings';
import { Loader2 } from 'lucide-react';

interface CountrySelectProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    required?: boolean;
}

export default function CountrySelect({
    value,
    onChange,
    className = "",
    placeholder = "Select country...",
    required = false
}: CountrySelectProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getCountries();
            setCountries(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading && !countries.length) {
        return (
            <div className={`flex items-center gap-2 text-gray-400 text-sm py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-zinc-800 ${className}`}>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading countries...</span>
            </div>
        );
    }

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={`w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-afconsult outline-none text-sm appearance-none ${className}`}
        >
            <option value="">{placeholder}</option>
            {countries.map((c) => (
                <option key={c.id} value={c.name}>
                    {c.flag} {c.name}
                </option>
            ))}
        </select>
    );
}
