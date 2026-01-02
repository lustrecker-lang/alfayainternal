import ModuleLayout from '@/components/layout/ModuleLayout';

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/finance' },
        { label: 'Reports', href: '/dashboard/finance/reports' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="zinc-500">
            {children}
        </ModuleLayout>
    );
}
