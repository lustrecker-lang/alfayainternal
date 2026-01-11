'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSeminars } from '@/lib/seminars';
import { getTransactions, formatCurrency } from '@/lib/finance';
import type { Seminar } from '@/types/seminar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, addMonths, subMonths, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export default function ImedaDashboard() {
    const [seminars, setSeminars] = useState<Seminar[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [revenue, setRevenue] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentYearStart = startOfDay(new Date(new Date().getFullYear(), 0, 1));
            const currentYearEnd = endOfMonth(new Date(new Date().getFullYear(), 11, 31));

            const [seminarsData, transactionsData] = await Promise.all([
                getSeminars('imeda'),
                getTransactions(currentYearStart, currentYearEnd, 'imeda')
            ]);

            setSeminars(seminarsData);

            // Calculate revenue (Income only)
            const totalRevenue = transactionsData
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + (t.amountInAED || 0), 0);

            setRevenue(totalRevenue);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const seminarsThisYear = seminars.filter(s => new Date(s.startDate).getFullYear() === currentYear);
    const totalParticipants = seminars.reduce((sum, s) => sum + (s.participants?.length || 0), 0);

    const today = startOfDay(new Date());
    const upcomingSeminars = seminars
        .filter(s => isAfter(new Date(s.startDate), today) || isSameDay(new Date(s.startDate), today))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getSeminarsForDay = (day: Date) => {
        return seminars.filter(s => {
            const start = startOfDay(new Date(s.startDate));
            const end = startOfDay(new Date(s.endDate));
            return (isSameDay(day, start) || isAfter(day, start)) && (isSameDay(day, end) || isBefore(day, end));
        });
    };

    const firstDayOfWeek = monthStart.getDay();
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Seminars</h3>
                    <p className="text-3xl font-bold text-imeda">{seminarsThisYear.length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This year</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Participants</h3>
                    <p className="text-3xl font-bold text-imeda">{totalParticipants}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Revenue</h3>
                    <p className="text-3xl font-bold text-imeda">{formatCurrency(revenue)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This year</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs bg-imeda text-white rounded hover:opacity-90">
                                Today
                            </button>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">{day}</div>
                        ))}

                        {Array.from({ length: paddingDays }).map((_, i) => (
                            <div key={`pad-${i}`} className="aspect-square" />
                        ))}

                        {daysInMonth.map(day => {
                            const daySeminars = getSeminarsForDay(day);
                            const isToday = isSameDay(day, new Date());
                            const hasSeminars = daySeminars.length > 0;

                            return (
                                <div key={day.toISOString()} className={`aspect-square border rounded p-1 relative ${isToday ? 'bg-imeda/10 border-imeda' : 'border-gray-200 dark:border-gray-700'} ${hasSeminars ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{format(day, 'd')}</div>
                                    {hasSeminars && (
                                        <div className="absolute bottom-1 right-1 bg-imeda text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{daySeminars.length}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Seminars</h2>
                    <div className="space-y-3">
                        {upcomingSeminars.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming seminars</p>
                        ) : (
                            upcomingSeminars.map(seminar => (
                                <Link key={seminar.id} href={`/dashboard/imeda/seminars/${seminar.id}`} className="block p-3 border border-gray-200 dark:border-gray-700 rounded hover:border-imeda transition-colors">
                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">{seminar.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(seminar.startDate), 'd MMM', { locale: fr })} - {format(new Date(seminar.endDate), 'd MMM yyyy', { locale: fr })}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                        {seminar.participants?.length || 0} participant{(seminar.participants?.length || 0) > 1 ? 's' : ''}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
