import { Unit } from '@/types';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';

interface PortfolioDashboardProps {
    unit: Unit;
}

export default function PortfolioDashboard({ unit }: PortfolioDashboardProps) {
    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{unit.name} Portfolio</h1>
                <p className="text-gray-600 mt-2">Consumer Applications Portfolio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unit.apps?.map((app) => (
                    <Link
                        key={app.slug}
                        href={`/dashboard/${unit.slug}/${app.slug}`}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{app.name}</h3>
                                <p className="text-sm text-gray-500">Consumer App</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Users:</span>
                                <span className="font-semibold text-gray-900">-</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-semibold text-green-600">Active</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-blue-600 text-sm font-medium">View Analytics →</span>
                        </div>
                    </Link>
                ))}
            </div>

            {(!unit.apps || unit.apps.length === 0) && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500">No apps in this portfolio yet.</p>
                </div>
            )}
        </div>
    );
}
