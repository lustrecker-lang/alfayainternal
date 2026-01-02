import ModuleLayout from '@/components/layout/ModuleLayout';

export default function ImedaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/imeda' },
        { label: 'Seminars', href: '/dashboard/imeda/seminars' },
        { label: 'Finance', href: '/dashboard/imeda/finance' },
    ];

    return (
        <ModuleLayout tabs={tabs}>
            {children}
        </ModuleLayout>
    );
}
