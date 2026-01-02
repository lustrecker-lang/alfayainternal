'use client';

import ModuleLayout from '@/components/layout/ModuleLayout';
import { Plus, Clock } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AfconsultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { label: 'Overview', href: '/dashboard/afconsult' },
        { label: 'Projects', href: '/dashboard/afconsult/projects' },
        { label: 'Clients', href: '/dashboard/afconsult/clients' },
        { label: 'Time Logs', href: '/dashboard/afconsult/time-logs' },
        { label: 'Finance', href: '/dashboard/afconsult/finance' },
    ];

    // Define contextual actions based on the current tab
    let actions = null;
    if (pathname === '/dashboard/afconsult/projects') {
        actions = (
            <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                <Plus className="w-4 h-4" />
                New Project
            </button>
        );
    } else if (pathname === '/dashboard/afconsult/time-logs') {
        actions = (
            <button className="flex items-center gap-2 px-4 py-2 bg-afconsult text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm text-sm font-medium">
                <Clock className="w-4 h-4" />
                Log Hours
            </button>
        );
    }

    return (
        <ModuleLayout tabs={tabs} brandColor="afconsult" actions={actions}>
            {children}
        </ModuleLayout>
    );
}
