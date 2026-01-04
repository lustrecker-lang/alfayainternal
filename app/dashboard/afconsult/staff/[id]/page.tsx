import ConsultantDetailClient from '@/components/staff/ConsultantDetailClient';

// Required for output: 'export' - returns empty array for client-side routing
export function generateStaticParams() {
    return [{ id: 'debug' }];
}

export default function ConsultantDetailPage() {
    return <ConsultantDetailClient />;
}
