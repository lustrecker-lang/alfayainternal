import ImedaStaffDetailClient from '@/components/imeda/StaffDetailClient';

// Required for output: 'export' - returns empty array for client-side routing
export function generateStaticParams() {
    return [] as { id: string }[];
}

export default function ImedaStaffDetailPage() {
    return <ImedaStaffDetailClient />;
}
