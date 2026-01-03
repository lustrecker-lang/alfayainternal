'use client';

import GlobalHeader from '@/components/layout/GlobalHeader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
                {/* Dark mode radial gradient overlay */}
                <div className="fixed inset-0 pointer-events-none dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_40%)]" />

                <GlobalHeader />
                <main className="pt-14 relative">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
