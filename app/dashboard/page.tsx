'use client';

import Link from 'next/link';
import { BUSINESS_UNITS } from '@/config/units';
import * as LucideIcons from 'lucide-react';

export default function AppLauncher() {
    return (
        <div className="min-h-screen p- sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Al Faya Ventures</h1>
                    <p className="text-gray-600 mt-1">Select a business unit to continue</p>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {BUSINESS_UNITS.map((unit) => {
                        // Dynamically get the icon component
                        const IconComponent = (LucideIcons as any)[unit.icon];

                        return (
                            <Link
                                key={unit.slug}
                                href={`/dashboard/${unit.slug}`}
                                className="group"
                            >
                                <div className="aspect-square bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:shadow-xl hover:scale-105 hover:border-blue-300">
                                    {/* Icon */}
                                    {IconComponent && (
                                        <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 group-hover:scale-110 transition-transform" />
                                    )}

                                    {/* Unit Name */}
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                            {unit.name}
                                        </h3>
                                        {unit.type === 'PORTFOLIO' && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {unit.apps?.length || 0} apps
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
