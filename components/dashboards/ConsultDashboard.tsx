export default function ConsultDashboard() {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Active Clients</h3>
                    <p className="text-3xl font-bold text-afconsult">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current contracts</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Projects</h3>
                    <p className="text-3xl font-bold text-green-600">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In progress</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">-</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This quarter</p>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Contract Management</h2>
                <div className="text-gray-600 dark:text-gray-400">
                    <p>Client contract tracking coming soon...</p>
                </div>
            </div>
        </div>
    );
}
