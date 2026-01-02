'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BUSINESS_UNITS } from '@/config/units';
import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedUnits, setExpandedUnits] = useState<string[]>(['aftech']);

    const toggleUnit = (slug: string) => {
        setExpandedUnits(prev =>
            prev.includes(slug)
                ? prev.filter(s => s !== slug)
                : [...prev, slug]
        );
    };

    const isActive = (path: string) => pathname === path;
    const isUnitActive = (unitSlug: string) => pathname.startsWith(`/dashboard/${unitSlug}`);

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-blue-400">AFV Internal</h1>
                <p className="text-xs text-gray-400 mt-1">Al Faya Ventures</p>
            </div>

            <nav className="space-y-2">
                {BUSINESS_UNITS.map((unit) => {
                    const IconComponent = (Icons as any)[unit.icon] || Icons.Circle;
                    const isExpanded = expandedUnits.includes(unit.slug);
                    const unitActive = isUnitActive(unit.slug);

                    return (
                        <div key={unit.slug}>
                            <div className="flex items-center">
                                <Link
                                    href={`/dashboard/${unit.slug}`}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors flex-1 ${isActive(`/dashboard/${unit.slug}`)
                                            ? 'bg-blue-600 text-white'
                                            : unitActive
                                                ? 'bg-gray-800 text-blue-300'
                                                : 'hover:bg-gray-800 text-gray-300'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    <span className="font-medium">{unit.name}</span>
                                </Link>

                                {unit.type === 'PORTFOLIO' && unit.apps && (
                                    <button
                                        onClick={() => toggleUnit(unit.slug)}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Portfolio Apps Accordion */}
                            {unit.type === 'PORTFOLIO' && unit.apps && isExpanded && (
                                <div className="ml-8 mt-1 space-y-1">
                                    {unit.apps.map((app) => (
                                        <Link
                                            key={app.slug}
                                            href={`/dashboard/${unit.slug}/${app.slug}`}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(`/dashboard/${unit.slug}/${app.slug}`)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-800 text-gray-400'
                                                }`}
                                        >
                                            {app.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
