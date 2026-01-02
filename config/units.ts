// Business Unit Types
export type UnitType = 'OPERATION' | 'PORTFOLIO';

// Unit Interface
export interface Unit {
    slug: string; // e.g., 'imeda', 'aftech'
    name: string;
    type: UnitType;
    icon: string; // Lucide icon name
    // specific config for Portfolio types
    apps?: { slug: string; name: string }[];
}

// Business Units Registry
export const BUSINESS_UNITS: Unit[] = [
    {
        slug: 'imeda',
        name: 'IMEDA',
        type: 'OPERATION',
        icon: 'GraduationCap',
    },
    {
        slug: 'afconsult',
        name: 'AF Consult',
        type: 'OPERATION',
        icon: 'Briefcase',
    },
    {
        slug: 'aftech',
        name: 'AFTECH',
        type: 'PORTFOLIO',
        icon: 'Laptop',
        apps: [
            { slug: 'circles', name: 'Circles' },
            { slug: 'whosfree', name: 'WhosFree' },
        ],
    },
];

// Helper function to find unit by slug
export function getUnitBySlug(slug: string): Unit | undefined {
    return BUSINESS_UNITS.find(unit => unit.slug === slug);
}

// Helper function to find app within a portfolio unit
export function getAppBySlug(unitSlug: string, appSlug: string): { slug: string; name: string } | undefined {
    const unit = getUnitBySlug(unitSlug);
    if (unit?.type === 'PORTFOLIO' && unit.apps) {
        return unit.apps.find(app => app.slug === appSlug);
    }
    return undefined;
}
