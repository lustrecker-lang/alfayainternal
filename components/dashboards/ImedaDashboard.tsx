import { Plus } from 'lucide-react';
import TransactionDialog from '@/components/finance/TransactionDialog';

export default function ImedaDashboard() {
    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">IMEDA Dashboard</h1>
                    <p className="text-gray-600 mt-2">Education & Seminars Management</p>
                </div>

                {/* Transaction Dialog */}
                <TransactionDialog
                    defaultUnitId="imeda"
                    triggerButton={
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Seminars</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                    <p className="text-sm text-gray-500 mt-1">This year</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">AED 245K</p>
                    <p className="text-sm text-gray-500 mt-1">This year</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Avg. Profitability</h3>
                    <p className="text-3xl font-bold text-purple-600">68%</p>
                    <p className="text-sm text-gray-500 mt-1">Per seminar</p>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Seminars</h2>
                <div className="text-gray-600">
                    <p>Seminar management coming soon...</p>
                </div>
            </div>
        </div>
    );
}
