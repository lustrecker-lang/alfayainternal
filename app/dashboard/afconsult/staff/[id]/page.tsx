import ConsultantDetailClient from '@/components/staff/ConsultantDetailClient';

// Required for output: 'export' - returns empty array for client-side routing
export function generateStaticParams() {
    return [] as { id: string }[];
}

export default function ConsultantDetailPage() {
    return <ConsultantDetailClient />;
}
