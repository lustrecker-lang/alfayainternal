import GlobalHeader from '@/components/layout/GlobalHeader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <GlobalHeader />
            <main className="pt-14">
                {children}
            </main>
        </div>
    );
}
