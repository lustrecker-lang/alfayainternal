export default function ConsultDashboard() {
    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">AF Consult Dashboard</h1>
                <p className="text-gray-600 mt-2">Client Services & Consulting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Clients</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                    <p className="text-sm text-gray-500 mt-1">Current contracts</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Billable Hours</h3>
                    <p className="text-3xl font-bold text-green-600">1,240</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">AED 186K</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Contracts</h2>
                <div className="text-gray-600">
                    <p>Contract management coming soon...</p>
                </div>
            </div>
        </div>
    );
}
