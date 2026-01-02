'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BUSINESS_UNITS } from '@/config/units';
import * as LucideIcons from 'lucide-react';

export default function AppLauncher() {
    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Al Faya Ventures</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-sans">Select a business unit to continue</p>
                </div>

                {/* Glassy App Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {BUSINESS_UNITS.map((unit) => {
                        const IconComponent = unit.icon ? (LucideIcons as any)[unit.icon] : null;

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
                    border border-gray-200 dark:border-white/10 
                    rounded-2xl p-6 
                    flex items-center justify-center
                    transition-all duration-300 
                    hover:scale-105 hover:shadow-xl 
                    hover:border-${unit.brandColor}
                    dark:hover:border-${unit.brandColor}
                  `}
                                >
                                    {/* Logo or Icon only - no text */}
                                    {unit.logo ? (
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 group-hover:scale-110 transition-transform">
                                            <Image
                                                src={unit.logo}
                                                alt={unit.name}
                                                fill
                                                className="object-contain dark:invert"
                                            />
                                        </div>
                                    ) : IconComponent ? (
                                        <IconComponent
                                            className={`
                        w-16 h-16 sm:w-20 sm:h-20 
                        text-${unit.brandColor}
                        group-hover:scale-110 
                        transition-transform
                      `}
                                        />
                                    ) : null}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
