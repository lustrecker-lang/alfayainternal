import type { Transaction } from '@/types/finance';
import { startOfYear, startOfMonth, isAfter, format } from 'date-fns';

export interface TimeSeriesDataPoint {
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
}

export interface SeminarProfitability {
    seminarId: string;
    seminarName: string;
    revenue: number;
    expenses: number;
    profit: number;
}

export type TimePeriod = 'all' | 'ytd' | 'mtd';

/**
 * Filter transactions by time period
 */
export function filterByTimePeriod(transactions: Transaction[], period: TimePeriod): Transaction[] {
    if (period === 'all') return transactions;

    const now = new Date();
    const cutoffDate = period === 'ytd' ? startOfYear(now) : startOfMonth(now);

    return transactions.filter(t => {
        const txDate = t.date instanceof Date ? t.date : new Date(t.date);
        return isAfter(txDate, cutoffDate) || txDate.getTime() === cutoffDate.getTime();
    });
}

/**
 * Generate cumulative time series data for line charts
 */
export function generateCumulativeTimeSeries(transactions: Transaction[]): TimeSeriesDataPoint[] {
    if (transactions.length === 0) return [];

    // Sort by date
    const sorted = [...transactions].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    const dataPoints: TimeSeriesDataPoint[] = [];
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0;

    sorted.forEach(t => {
        const amount = t.amountInAED || 0;

        if (t.type === 'INCOME') {
            cumulativeRevenue += amount;
        } else {
            cumulativeExpenses += amount;
        }

        const dateStr = format(t.date instanceof Date ? t.date : new Date(t.date), 'MMM dd, yyyy');

        dataPoints.push({
            date: dateStr,
            revenue: cumulativeRevenue,
            expenses: cumulativeExpenses,
            profit: cumulativeRevenue - cumulativeExpenses,
        });
    });

    return dataPoints;
}

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';

/**
 * Generate time-aggregated cumulative series with CONTINUOUS time axis
 * Shows every day/week/month in the range, even if there are no transactions
 * Like Google Analytics
 */
export function generateTimeAggregatedSeries(
    transactions: Transaction[],
    granularity: TimeGranularity,
    startDate: Date,
    endDate: Date
): TimeSeriesDataPoint[] {
    // Group transactions by time bucket
    const buckets = new Map<string, { revenue: number; expenses: number }>();

    transactions.forEach(t => {
        const txDate = t.date instanceof Date ? t.date : new Date(t.date);
        let bucketKey: string;

        if (granularity === 'daily') {
            bucketKey = format(txDate, 'yyyy-MM-dd');
        } else if (granularity === 'weekly') {
            // Get the Monday of the week
            const day = txDate.getDay();
            const diff = txDate.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(txDate);
            monday.setDate(diff);
            bucketKey = format(monday, 'yyyy-MM-dd');
        } else {
            // Monthly
            bucketKey = format(txDate, 'yyyy-MM');
        }

        const current = buckets.get(bucketKey) || { revenue: 0, expenses: 0 };
        const amount = t.amountInAED || 0;

        if (t.type === 'INCOME') {
            current.revenue += amount;
        } else {
            current.expenses += amount;
        }

        buckets.set(bucketKey, current);
    });

    // Generate ALL time buckets in the range (continuous axis)
    const allBuckets: string[] = [];
    const current = new Date(startDate);

    if (granularity === 'daily') {
        // Every single day
        while (current <= endDate) {
            allBuckets.push(format(current, 'yyyy-MM-dd'));
            current.setDate(current.getDate() + 1);
        }
    } else if (granularity === 'weekly') {
        // Move to Monday of the start week
        const day = current.getDay();
        const diff = current.getDate() - day + (day === 0 ? -6 : 1);
        current.setDate(diff);

        // Every week (52 per year)
        while (current <= endDate) {
            allBuckets.push(format(current, 'yyyy-MM-dd'));
            current.setDate(current.getDate() + 7);
        }
    } else {
        // Monthly - 12 per year
        current.setDate(1); // Start of month
        while (current <= endDate) {
            allBuckets.push(format(current, 'yyyy-MM'));
            current.setMonth(current.getMonth() + 1);
        }
    }

    // Convert to cumulative series
    const dataPoints: TimeSeriesDataPoint[] = [];
    let cumulativeRevenue = 0;
    let cumulativeExpenses = 0;

    allBuckets.forEach(key => {
        const bucket = buckets.get(key);
        if (bucket) {
            cumulativeRevenue += bucket.revenue;
            cumulativeExpenses += bucket.expenses;
        }
        // If no bucket, values stay the same (carry forward)

        // Format label based on granularity
        let dateLabel: string;
        if (granularity === 'daily') {
            dateLabel = format(new Date(key), 'MMM dd');
        } else if (granularity === 'weekly') {
            dateLabel = format(new Date(key), 'MMM dd');
        } else {
            dateLabel = format(new Date(key + '-01'), 'MMM');
        }

        dataPoints.push({
            date: dateLabel,
            revenue: cumulativeRevenue,
            expenses: cumulativeExpenses,
            profit: cumulativeRevenue - cumulativeExpenses,
        });
    });

    return dataPoints;
}

/**
 * Group expenses by category
 */
export function groupExpensesByCategory(transactions: Transaction[]): CategoryBreakdown[] {
    const categoryMap = new Map<string, number>();

    transactions
        .filter(t => t.type === 'EXPENSE')
        .forEach(t => {
            const category = t.category || 'Uncategorized';
            const amount = t.amountInAED || 0;
            categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
        });

    return Array.from(categoryMap.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Separate seminar-linked expenses from operational expenses
 */
export function separateSeminarAndOperationalExpenses(transactions: Transaction[]): {
    seminarExpenses: CategoryBreakdown[];
    operationalExpenses: CategoryBreakdown[];
} {
    const seminarTxs = transactions.filter(t =>
        t.type === 'EXPENSE' &&
        t.metadata &&
        'seminar_id' in t.metadata &&
        t.metadata.seminar_id
    );

    const operationalTxs = transactions.filter(t =>
        t.type === 'EXPENSE' &&
        (!t.metadata || !('seminar_id' in t.metadata) || !t.metadata.seminar_id)
    );

    return {
        seminarExpenses: groupExpensesByCategory(seminarTxs),
        operationalExpenses: groupExpensesByCategory(operationalTxs),
    };
}

/**
 * Calculate profitability by seminar batch
 */
export function calculateProfitabilityBySeminar(
    transactions: Transaction[],
    seminars: { id: string; name: string }[]
): SeminarProfitability[] {
    const seminarMap = new Map<string, { revenue: number; expenses: number }>();

    transactions.forEach(t => {
        if (!t.metadata || !('seminar_id' in t.metadata)) return;

        const seminarId = t.metadata.seminar_id as string;
        if (!seminarId) return;

        const current = seminarMap.get(seminarId) || { revenue: 0, expenses: 0 };
        const amount = t.amountInAED || 0;

        if (t.type === 'INCOME') {
            current.revenue += amount;
        } else {
            current.expenses += amount;
        }

        seminarMap.set(seminarId, current);
    });

    return Array.from(seminarMap.entries())
        .map(([seminarId, { revenue, expenses }]) => {
            const seminar = seminars.find(s => s.id === seminarId);
            return {
                seminarId,
                seminarName: seminar?.name || `Seminar ${seminarId.substring(0, 8)}`,
                revenue,
                expenses,
                profit: revenue - expenses,
            };
        })
        .sort((a, b) => b.profit - a.profit);
}
