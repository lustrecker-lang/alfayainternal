import PortfolioDashboard from '@/components/dashboards/PortfolioDashboard';
import { getUnitBySlug } from '@/config/units';

export default function AftechPage() {
    const unit = getUnitBySlug('aftech');
    return <PortfolioDashboard unit={unit} />;
}
