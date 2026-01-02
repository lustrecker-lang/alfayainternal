import { Plus } from 'lucide-react';
import TransactionDialog from '@/components/finance/TransactionDialog';

interface AppAnalyticsDashboardProps {
    appName: string;
    unitSlug: string;
}

export default function AppAnalyticsDashboard({ appName, unitSlug }: AppAnalyticsDashboardProps) {
    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>AFTECH</span>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{appName}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">{appName} Analytics</h1>
                    <p className="text-gray-600 mt-2">Consumer App Analytics & Metrics</p>
                </div>

                {/* Transaction Dialog */}
                <TransactionDialog
                    defaultUnitId="aftech"
                    defaultSubProject={appName.toLowerCase()}
                    triggerButton={
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">-</p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-green-600">-</p>
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Engagement</h3>
                    <p className="text-3xl font-bold text-purple-600">-</p>
                    <p className="text-xs text-gray-500 mt-1">Avg. session time</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Retention</h3>
                    <p className="text-3xl font-bold text-orange-600">-</p>
                    <p className="text-xs text-gray-500 mt-1">30-day retention</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity</h2>
                <div className="text-gray-600">
                    <p>Analytics data will be populated from Firebase...</p>
                </div>
            </div>
        </div>
    );
}
