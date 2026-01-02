import ModuleLayout from '@/components/layout/ModuleLayout';

export default function AfconsultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/afconsult' },
        { label: 'Projects', href: '/dashboard/afconsult/projects' },
        { label: 'Finance', href: '/dashboard/afconsult/finance' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="afconsult">
            {children}
        </ModuleLayout>
    );
}
