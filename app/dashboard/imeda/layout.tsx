import ModuleLayout from '@/components/layout/ModuleLayout';

export default function ImedaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const tabs = [
        { label: 'Overview', href: '/dashboard/imeda' },
        { label: 'Seminars', href: '/dashboard/imeda/seminars' },
        { label: 'Deals', href: '/dashboard/imeda/deals' },
        {
            label: 'Financial',
            subTabs: [
                { label: 'Quotes', href: '/dashboard/imeda/quotes' },
                { label: 'Analytics', href: '/dashboard/imeda/analytics' },
                { label: 'Finance', href: '/dashboard/imeda/finance' },
                { label: 'Invoices', href: '/dashboard/imeda/invoices' },
            ]
        },
        {
            label: 'People',
            subTabs: [
                { label: 'Clients', href: '/dashboard/imeda/clients' },
                { label: 'Teachers', href: '/dashboard/imeda/teachers' },
                { label: 'Staff', href: '/dashboard/imeda/staff' },
            ]
        },
        {
            label: 'Other',
            subTabs: [
                { label: 'Campuses', href: '/dashboard/imeda/campuses' },
                { label: 'Courses', href: '/dashboard/imeda/courses' },
                { label: 'Services', href: '/dashboard/imeda/services' },
            ]
        },
    ];

    return (
        <ModuleLayout tabs={tabs} brandColor="imeda">
            {children}
        </ModuleLayout>
    );
}
