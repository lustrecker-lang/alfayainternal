'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { BUSINESS_UNITS } from '@/config/units';
import { getCompanyBrands } from '@/lib/brands';
import { CompanyBrand } from '@/types/brands';

// Map slugs to static cover images (Fallback)
const COVER_IMAGES: Record<string, string> = {
    'afconsult': '/covers/afconsult_cover.jpg',
    'aftech': '/covers/aftech_cover.jpg',
    'imeda': '/covers/imeda_cover.jpg',
    'finance': '/covers/dashboard_cover.jpg',
};

export default function AppLauncher() {
    const [brands, setBrands] = useState<CompanyBrand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        const data = await getCompanyBrands();
        setBrands(data);
        setLoading(false);
    };

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
                        // Find dynamic brand data
                        const brand = brands.find(b => b.unit_slug === unit.slug);

                        // Cover Logic: Dynamic Banner -> Static Map -> Color Fallback
                        const coverImage = brand?.brand_banner_url || COVER_IMAGES[unit.slug];

                        // Logo Logic: Dynamic Squared -> Dynamic Logo -> Static Config Logo
                        const logoImage = brand?.logo_squared_url || brand?.logo_url || unit.logo;

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
                                        {loading ? (
                                            <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-zinc-800" />
                                        ) : coverImage ? (
                                            <Image
                                                src={coverImage}
                                                alt={unit.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center"
                                                style={{ backgroundColor: brand?.brand_color_primary || `var(--${unit.brandColor}, #6b7280)` }}
                                            >
                                                {/* Fallback to inverted logo in center if no cover available */}
                                                {(brand?.logo_url || unit.logo) && (
                                                    <div className="relative w-16 h-16 opacity-50">
                                                        <Image
                                                            src={brand?.logo_url || unit.logo!}
                                                            alt={unit.name}
                                                            fill
                                                            className="object-contain invert"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Overlay Gradient for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 flex items-center gap-3">
                                        {/* Squared Logo / Icon */}
                                        <div className="relative w-10 h-10 flex-shrink-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-600 overflow-hidden flex items-center justify-center">
                                            {loading ? (
                                                <div className="w-full h-full animate-pulse bg-gray-200 dark:bg-zinc-600" />
                                            ) : logoImage ? (
                                                <img
                                                    src={logoImage}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-400">
                                                    {unit.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-base font-medium text-gray-900 dark:text-white font-sans group-hover:text-afconsult transition-colors">
                                                {brand?.display_name || unit.name}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-mono hidden sm:block">
                                                {unit.type.toLowerCase()}
                                            </p>
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
