import ModuleLayout from '@/components/layout/ModuleLayout';

export default function ImedaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/imeda' },
        { label: 'Clients', href: '/dashboard/imeda/clients' },
        { label: 'Courses', href: '/dashboard/imeda/courses' },
        { label: 'Seminars', href: '/dashboard/imeda/seminars' },
        { label: 'Campuses', href: '/dashboard/imeda/campuses' },
        { label: 'Teachers', href: '/dashboard/imeda/teachers' },
        { label: 'Invoices', href: '/dashboard/imeda/invoices' },
        { label: 'Quotes', href: '/dashboard/imeda/quotes' },
        { label: 'Deals', href: '/dashboard/imeda/deals' },
        { label: 'Services', href: '/dashboard/imeda/services' },
        { label: 'Staff', href: '/dashboard/imeda/staff' },
        { label: 'Finance', href: '/dashboard/imeda/finance' },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="imeda">
            {children}
        </ModuleLayout>
    );
}
