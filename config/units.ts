// Business Unit Types
export type UnitType = 'OPERATION' | 'PORTFOLIO' | 'FINANCE';

// Unit Interface
export interface Unit {
    slug: string;
    name: string;
    type: UnitType;
    icon?: string; // Lucide icon name (fallback)
    logo?: string; // Path to logo file
    brandColor: string;
    apps?: App[];
}

export interface App {
    slug: string;
    name: string;
    icon?: string;
    logo?: string;
}

// Business Units Registry
export const BUSINESS_UNITS: Unit[] = [
    {
        slug: 'imeda',
        name: 'IMEDA',
        type: 'OPERATION',
        logo: '/logos/imeda.svg',
        brandColor: 'imeda',
    },
    {
        slug: 'afconsult',
        name: 'AF Consult',
        type: 'OPERATION',
        logo: '/logos/afconsult.svg',
        brandColor: 'afconsult',
    },
    {
        slug: 'aftech',
        name: 'AFTECH',
        type: 'PORTFOLIO',
        icon: 'Laptop',
        brandColor: 'aftech',
        apps: [
            { slug: 'circles', name: 'Circles', logo: '/logos/circles.png' },
            { slug: 'whosfree', name: 'WhosFree', logo: '/logos/whosfree.png' },
        ],
    },
    {
        slug: 'finance',
        name: 'Finance HQ',
        type: 'FINANCE',
        icon: 'DollarSign',
        brandColor: 'zinc-500',
    },
];

// Helper function to find unit by slug
export function getUnitBySlug(slug: string): Unit | undefined {
    return BUSINESS_UNITS.find(unit => unit.slug === slug);
}

// Helper function to find app within a portfolio unit
export function getAppBySlug(unitSlug: string, appSlug: string): App | undefined {
    const unit = getUnitBySlug(unitSlug);
    if (unit?.type === 'PORTFOLIO' && unit.apps) {
        return unit.apps.find(app => app.slug === appSlug);
    }
    return undefined;
}
