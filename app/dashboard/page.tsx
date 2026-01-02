'use client';

import Link from 'next/link';
import { BUSINESS_UNITS } from '@/config/units';
import * as LucideIcons from 'lucide-react';

export default function AppLauncher() {
    return (
        <div className="min-h-screen p-6 sm:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Al Faya Ventures</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Select a business unit to continue</p>
                </div>

                {/* Glassy App Grid */}
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
                                <div
                                    className={`
                    aspect-square 
                    bg-white/60 dark:bg-white/5 
                    backdrop-blur-xl 
                    border border-white/40 dark:border-white/10 
                    rounded-2xl p-6 
                    flex flex-col items-center justify-center gap-4 
                    transition-all duration-300 
                    hover:scale-105 hover:shadow-xl 
                    hover:border-${unit.brandColor}
                    dark:hover:border-${unit.brandColor}
                  `}
                                >
                                    {/* Icon with brand color */}
                                    {IconComponent && (
                                        <IconComponent
                                            className={`
                        w-12 h-12 sm:w-16 sm:h-16 
                        text-${unit.brandColor}
                        group-hover:scale-110 
                        transition-transform
                      `}
                                        />
                                    )}

                                    {/* Unit Name */}
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                            {unit.name}
                                        </h3>
                                        {unit.type === 'PORTFOLIO' && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {unit.apps?.length || 0} apps
                                            </p>
                                        )}
                                        {unit.type === 'FINANCE' && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Financial HQ
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
