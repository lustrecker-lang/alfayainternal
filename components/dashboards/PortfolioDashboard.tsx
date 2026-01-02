'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getUnitBySlug } from '@/config/units';

interface PortfolioDashboardProps {
    unit: ReturnType<typeof getUnitBySlug>;
}

export default function PortfolioDashboard({ unit }: PortfolioDashboardProps) {
    if (!unit || !unit.apps) return null;

    return (
        <div>
            <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                    Select an application to view analytics
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {unit.apps.map((app) => (
                    <Link
                        key={app.slug}
                        href={`/dashboard/${unit.slug}/${app.slug}`}
                        className="group"
                    >
                        <div className="aspect-square bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-aftech">
                            {/* App Logo */}
                            {app.logo ? (
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-110 transition-transform">
                                    <Image
                                        src={app.logo}
                                        alt={app.name}
                                        fill
                                        className="object-contain rounded-xl"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            )}

                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {app.name}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
