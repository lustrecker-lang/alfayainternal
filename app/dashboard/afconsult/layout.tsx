'use client';

import ModuleLayout from '@/components/layout/ModuleLayout';

export default function AfconsultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/afconsult' },
        { label: 'Analytics', href: '/dashboard/afconsult/analytics' },
        { label: 'Projects', href: '/dashboard/afconsult/projects' },
        { label: 'Clients', href: '/dashboard/afconsult/clients' },
        { label: 'Invoices', href: '/dashboard/afconsult/invoices' },
        { label: 'Staff', href: '/dashboard/afconsult/staff' },

        { label: 'Finance', href: '/dashboard/afconsult/finance' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="afconsult">
            {children}
        </ModuleLayout>
    );
}
