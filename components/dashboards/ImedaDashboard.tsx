import { Plus } from 'lucide-react';
import TransactionDialog from '@/components/finance/TransactionDialog';

export default function ImedaDashboard() {
    return (
        <div>
            {/* Transaction Action */}
            <div className="mb-6 flex justify-end">
                <TransactionDialog
                    defaultUnitId="imeda"
                    triggerButton={
                        <button className="flex items-center gap-2 px-4 py-2 bg-imeda text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Seminars</h3>
                    <p className="text-3xl font-bold text-imeda">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This year</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Participants</h3>
                    <p className="text-3xl font-bold text-green-600">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AED</p>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Seminar Management</h2>
                <div className="text-gray-600 dark:text-gray-400">
                    <p>Seminar scheduling and participant tracking coming soon...</p>
                </div>
            </div>
        </div>
    );
}
