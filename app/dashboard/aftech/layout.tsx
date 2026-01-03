import ModuleLayout from '@/components/layout/ModuleLayout';

export default function AftechLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Portfolio', href: '/dashboard/aftech' },
        { label: 'Finance', href: '/dashboard/aftech/finance' },
        { label: 'Circles', href: '/dashboard/aftech/circles' },
        { label: 'WhosFree', href: '/dashboard/aftech/whosfree' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="aftech">
            {children}
        </ModuleLayout>
    );
}
