import ModuleLayout from '@/components/layout/ModuleLayout';

export default function AftechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Portfolio', href: '/dashboard/aftech' },
        { label: 'Overview', href: '/dashboard/aftech/overview' },
    ];

    return (
        <ModuleLayout tabs={tabs}>
            {children}
        </ModuleLayout>
    );
}
