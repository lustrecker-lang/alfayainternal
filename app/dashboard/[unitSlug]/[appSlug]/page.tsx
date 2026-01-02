import { notFound } from 'next/navigation';
import { getUnitBySlug, getAppBySlug, BUSINESS_UNITS } from '@/config/units';
import AppAnalyticsDashboard from '@/components/dashboards/AppAnalyticsDashboard';

// Generate static paths for all portfolio apps
export async function generateStaticParams() {
    const paths: { unitSlug: string; appSlug: string }[] = [];

    BUSINESS_UNITS.forEach((unit) => {
        if (unit.type === 'PORTFOLIO' && unit.apps) {
            unit.apps.forEach((app) => {
                paths.push({
                    unitSlug: unit.slug,
                    appSlug: app.slug,
                });
            });
        }
    });

    return paths;
}

interface PageProps {
    params: Promise<{
        unitSlug: string;
        appSlug: string;
    }>;
}

export default async function AppPage({ params }: PageProps) {
    const { unitSlug, appSlug } = await params;

    const unit = getUnitBySlug(unitSlug);
    const app = getAppBySlug(unitSlug, appSlug);

    if (!unit || !app || unit.type !== 'PORTFOLIO') {
        notFound();
    }

    return <AppAnalyticsDashboard appName={app.name} unitSlug={unitSlug} />;
}
