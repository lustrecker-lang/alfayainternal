'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Tab {
    label: string;
    href?: string;
    subTabs?: Tab[];
}

interface ModuleLayoutProps {
    tabs: Tab[];
    brandColor: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function ModuleLayout({ tabs, brandColor, actions, children }: ModuleLayoutProps) {
    const pathname = usePathname();

    const isTabActive = (tab: Tab) => {
        if (tab.href === pathname) return true;
        if (tab.subTabs) {
            return tab.subTabs.some(sub => sub.href === pathname);
        }
        return false;
    };

    return (
        <div>
            {/* Tab Navigation Bar */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-14 z-40 transition-colors print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-visible items-center">
                            {tabs.map((tab) => {
                                const isActive = isTabActive(tab);
                                const baseClasses = `
                                    flex items-center gap-1 py-4 px-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap cursor-pointer select-none
                                    ${isActive
                                        ? `border-${brandColor} text-gray-900 dark:text-white font-bold`
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }
                                `;

                                if (tab.subTabs) {
                                    return (
                                        <div key={tab.label} className="relative group">
                                            <div className={baseClasses}>
                                                {tab.label}
                                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform group-hover:rotate-180 opacity-50`} />
                                            </div>

                                            {/* Dropdown Menu */}
                                            <div className="absolute left-0 top-full pt-1 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden py-1">
                                                    {tab.subTabs.map(subTab => (
                                                        <Link
                                                            key={subTab.href}
                                                            href={subTab.href!}
                                                            className={`
                                                                block px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-zinc-700/50
                                                                ${pathname === subTab.href
                                                                    ? `text-${brandColor} font-semibold bg-gray-50 dark:bg-zinc-700/30`
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                                }
                                                            `}
                                                        >
                                                            {subTab.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href!}
                                        className={baseClasses}
                                    >
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Actions (right side) */}
                        {actions && (
                            <div className="flex items-center gap-2 ml-4">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}
