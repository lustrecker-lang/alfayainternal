'use client';

import { useState, useEffect } from 'react';
import { getCompanyBrands } from '@/lib/brands';
import { CompanyBrand } from '@/types/brands';
import { Loader2, Palette } from 'lucide-react';
import BrandEditor from '@/components/settings/BrandEditor';

export default function BrandsPage() {
    const [brands, setBrands] = useState<CompanyBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBrand, setEditingBrand] = useState<CompanyBrand | null>(null);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        setLoading(true);
        const data = await getCompanyBrands();
        setBrands(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Identity</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Manage the visual identity for each business unit. These settings affect invoices and docs.
                    </p>
                </div>
            </div>

            {/* Brand Identity Cards - Square Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {brands.map((brand) => (
                    <button
                        key={brand.unit_slug}
                        onClick={() => setEditingBrand(brand)}
                        className="group relative aspect-square w-full bg-gray-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-afconsult hover:shadow-lg transition-all"
                    >
                        {/* Banner Background */}
                        {brand.brand_banner_url ? (
                            <img
                                src={brand.brand_banner_url}
                                alt="Banner"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            // Fallback gradient if no banner
                            <div
                                className="absolute inset-0 w-full h-full opacity-20 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-zinc-700 dark:to-zinc-900"
                                style={{ backgroundColor: brand.brand_color_primary ? `${brand.brand_color_primary}20` : undefined }}
                            />
                        )}

                        {/* Gradient Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center z-10">

                            {/* Logo Squared */}
                            <div className="w-16 h-16 mb-3 rounded-xl bg-white shadow-lg overflow-hidden flex items-center justify-center ring-2 ring-white/20">
                                {(brand.logo_squared_url || brand.logo_url) ? (
                                    <img
                                        src={brand.logo_squared_url || brand.logo_url}
                                        alt={brand.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-gray-400">
                                        {brand.display_name.charAt(0)}
                                    </span>
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="text-lg font-bold text-white mb-0.5 shadow-sm drop-shadow-md">
                                {brand.display_name}
                            </h3>
                            <p className="text-[10px] text-white/70 font-mono uppercase tracking-wider">
                                {brand.unit_slug}
                            </p>
                        </div>

                        {/* Status/Color Dot */}
                        <div
                            className="absolute top-3 right-3 w-3 h-3 rounded-full border-2 border-white/20 shadow-sm"
                            style={{ backgroundColor: brand.brand_color_primary }}
                        />
                    </button>
                ))}
            </div>

            {editingBrand && (
                <BrandEditor
                    brand={editingBrand}
                    onClose={() => setEditingBrand(null)}
                    onUpdate={loadBrands}
                />
            )}
        </div>
    );
}
