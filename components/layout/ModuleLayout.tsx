'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface Tab {
    label: string;
    href: string;
}

interface ModuleLayoutProps {
    tabs: Tab[];
    brandColor: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function ModuleLayout({ tabs, brandColor, actions, children }: ModuleLayoutProps) {
    const pathname = usePathname();

    return (
        <div>
            {/* Tab Navigation Bar */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-14 z-40 transition-colors print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Tabs */}
                        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={`
                      py-4 px-1 border-b-2 text-sm font-medium transition-all whitespace-nowrap
                      ${isActive
                                                ? `border-${brandColor} text-gray-900 dark:text-white font-bold`
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                    `}
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

            {/* Page Content - Wrapped with consistent max-width */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </div>
        </div>
    );
}
