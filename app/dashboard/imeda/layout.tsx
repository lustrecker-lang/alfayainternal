import ModuleLayout from '@/components/layout/ModuleLayout';

export default function ImedaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/imeda' },
        { label: 'Clients', href: '/dashboard/imeda/clients' },
        { label: 'Seminars', href: '/dashboard/imeda/seminars' },
        { label: 'Finance', href: '/dashboard/imeda/finance' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="imeda">
            {children}
        </ModuleLayout>
    );
}
