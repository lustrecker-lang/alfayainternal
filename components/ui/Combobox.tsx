'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X, Search } from 'lucide-react';

interface ComboboxOption {
    id: string;
    label: string;
    value: string;
}

interface ComboboxProps {
    value: string;
    options: ComboboxOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onAdd?: (searchValue: string) => void;
    addLabel?: string;
    icon?: React.ReactNode;
}

export default function Combobox({
    value,
    options,
    onChange,
    placeholder = 'Select...',
    className = '',
    onAdd,
    addLabel = 'Add new',
    icon
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync search with value prop changes or when dropdown closes (to revert uncommitted typing)
    useEffect(() => {
        if (!isOpen) {
            const selectedOption = options.find(opt => opt.value === value);
            if (selectedOption) {
                setSearch(selectedOption.label);
            } else if (!value) {
                setSearch('');
            } else {
                // Keep raw value if no label found (fallback)
                setSearch(value);
            }
        }
    }, [value, options, isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
    );

    const showAddOption = onAdd && search.trim() !== '' &&
        !options.some(opt => opt.label.toLowerCase() === search.trim().toLowerCase());

    const handleSelect = (optionValue: string) => {
        const selectedOption = options.find(opt => opt.value === optionValue);
        onChange(optionValue);
        if (selectedOption) {
            setSearch(selectedOption.label);
        }
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && showAddOption) {
            e.preventDefault();
            onAdd?.(search.trim());
            setIsOpen(false);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                        // Optional: if you want to clear selection on typing, uncomment next line
                        // if (e.target.value !== value) onChange(''); 
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md ${icon ? 'pl-9' : 'pr-8'}`}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto rounded-md">
                    {filteredOptions.length > 0 ? (
                        <ul className="py-1">
                            {filteredOptions.map((option) => (
                                <li key={option.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full px-3 py-2 text-left text-sm font-sans hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${option.value === value
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 font-sans">
                            {search ? 'No matches found' : 'Type to search...'}
                        </div>
                    )}

                    {showAddOption && (
                        <button
                            type="button"
                            onClick={() => {
                                onAdd?.(search.trim());
                                setIsOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-sans border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-blue-600 dark:text-blue-400"
                        >
                            <Plus className="w-4 h-4" />
                            {addLabel} "{search.trim()}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
