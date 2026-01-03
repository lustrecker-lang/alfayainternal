'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, User } from 'lucide-react';
import { getClients, addClient, type Client } from '@/lib/finance';

interface ClientComboboxProps {
    value: string;
    onChange: (value: string) => void;
    unitId: string;
    placeholder?: string;
    className?: string;
}

export default function ClientCombobox({
    value,
    onChange,
    unitId,
    placeholder = 'Select or add client',
    className = '',
}: ClientComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load clients on mount and when unitId changes
    useEffect(() => {
        if (unitId) {
            loadClients();
        }
    }, [unitId]);

    // Sync search with value
    useEffect(() => {
        setSearch(value);
    }, [value]);

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

    const loadClients = async () => {
        const data = await getClients(unitId);
        setClients(data);
    };

    const filteredClients = clients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const showAddOption = search.trim() !== '' &&
        !clients.some(c => c.name.toLowerCase() === search.trim().toLowerCase());

    const handleSelect = (clientName: string) => {
        onChange(clientName);
        setSearch(clientName);
        setIsOpen(false);
    };

    const handleAddNew = async () => {
        if (!search.trim() || isAdding || !unitId) return;

        setIsAdding(true);
        try {
            const newClient = await addClient(unitId, search.trim());
            setClients([...clients, newClient].sort((a, b) => a.name.localeCompare(b.name)));
            onChange(newClient.name);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to add client:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        onChange(val);
        setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && showAddOption) {
            e.preventDefault();
            handleAddNew();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            {/* Input */}
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderRadius: '0.25rem' }}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto"
                    style={{ borderRadius: '0.25rem' }}
                >
                    {filteredClients.length > 0 ? (
                        <ul className="py-1">
                            {filteredClients.map((client) => (
                                <li key={client.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(client.name)}
                                        className={`w-full px-3 py-2 text-left text-sm font-sans hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors ${client.name === value
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        {client.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 font-sans">
                            {search ? 'No matches found' : 'No clients yet'}
                        </div>
                    )}

                    {/* Add new option */}
                    {showAddOption && (
                        <button
                            type="button"
                            onClick={handleAddNew}
                            disabled={isAdding}
                            className="w-full px-3 py-2 text-left text-sm font-sans border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 text-green-600 dark:text-green-400"
                        >
                            <Plus className="w-4 h-4" />
                            {isAdding ? 'Adding...' : `Add "${search.trim()}" as new client`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
