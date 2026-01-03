'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BUSINESS_UNITS } from '@/config/units';

// Map slugs to cover images
const COVER_IMAGES: Record<string, string> = {
    'afconsult': '/covers/afconsult_cover.jpg',
    'aftech': '/covers/aftech_cover.jpg',
    'imeda': '/covers/imeda_cover.jpg',
    'finance': '/covers/dashboard_cover.jpg',
};

export default function AppLauncher() {
    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Al Faya Ventures</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-sans">Select a business unit to continue</p>
                </div>

                {/* Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BUSINESS_UNITS.map((unit) => {
                        const coverImage = COVER_IMAGES[unit.slug];

                        return (
                            <Link
                                key={unit.slug}
                                href={`/dashboard/${unit.slug}`}
                                className="group"
                            >
                                <div
                                    className="
                                        bg-white dark:bg-zinc-800
                                        border border-gray-200 dark:border-zinc-700
                                        rounded-xl
                                        overflow-hidden
                                        transition-all duration-300
                                        hover:shadow-xl hover:scale-[1.02]
                                        hover:border-gray-300 dark:hover:border-zinc-600
                                    "
                                >
                                    {/* Cover Image */}
                                    <div className="relative h-40 sm:h-48 bg-gray-100 dark:bg-zinc-900 overflow-hidden">
                                        {coverImage ? (
                                            <Image
                                                src={coverImage}
                                                alt={unit.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center"
                                                style={{ backgroundColor: `var(--${unit.brandColor}, #6b7280)` }}
                                            >
                                                {unit.logo && (
                                                    <div className="relative w-16 h-16">
                                                        <Image
                                                            src={unit.logo}
                                                            alt={unit.name}
                                                            fill
                                                            className="object-contain invert"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 flex items-center gap-3">
                                        {unit.logo && (
                                            <div className="relative w-8 h-8 flex-shrink-0">
                                                <Image
                                                    src={unit.logo}
                                                    alt=""
                                                    fill
                                                    className="object-contain dark:invert"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white font-sans">
                                                {unit.name}
                                            </h3>
                                        </div>
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
