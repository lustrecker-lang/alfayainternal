import { notFound } from 'next/navigation';
import { getUnitBySlug, BUSINESS_UNITS } from '@/config/units';
import ImedaDashboard from '@/components/dashboards/ImedaDashboard';
import ConsultDashboard from '@/components/dashboards/ConsultDashboard';
import PortfolioDashboard from '@/components/dashboards/PortfolioDashboard';

// Generate static paths for all business units
export async function generateStaticParams() {
    return BUSINESS_UNITS.map((unit) => ({
        unitSlug: unit.slug,
    }));
}

interface PageProps {
    params: Promise<{
        unitSlug: string;
    }>;
}

export default async function UnitPage({ params }: PageProps) {
    const { unitSlug } = await params;
    const unit = getUnitBySlug(unitSlug);

    if (!unit) {
        notFound();
    }

    // Render different dashboards based on unit type
    if (unit.slug === 'imeda') {
        return <ImedaDashboard />;
    }

    if (unit.slug === 'afconsult') {
        return <ConsultDashboard />;
    }

    if (unit.type === 'PORTFOLIO') {
        return <PortfolioDashboard unit={unit} />;
    }

    return <div className="p-8">Dashboard not configured for {unit.name}</div>;
}
