'use client';

import { EXPENSE_CATEGORY_GROUPS, INCOME_CATEGORY_GROUPS } from '@/config/finance';

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    type: 'INCOME' | 'EXPENSE';
    className?: string;
}

export default function CategorySelect({
    value,
    onChange,
    type,
    className = '',
}: CategorySelectProps) {
    const groups = type === 'INCOME' ? INCOME_CATEGORY_GROUPS : EXPENSE_CATEGORY_GROUPS;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            style={{ borderRadius: '0.25rem' }}
        >
            <option value="">Select a category</option>
            {Object.entries(groups).map(([groupName, categories]) => (
                <optgroup key={groupName} label={groupName}>
                    {(categories as string[]).map((category: string) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </optgroup>
            ))}
        </select>
    );
}
