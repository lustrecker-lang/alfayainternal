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
    actions?: ReactNode;
    children: ReactNode;
}

export default function ModuleLayout({ tabs, actions, children }: ModuleLayoutProps) {
    const pathname = usePathname();

    return (
        <div>
            {/* Tab Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4">
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
                      py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
                      ${isActive
                                                ? 'border-black text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

            {/* Page Content */}
            <div>{children}</div>
        </div>
    );
}
