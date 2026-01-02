import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Transaction, TransactionFormData, FinancialSummary } from '@/types/finance';

/**
 * Save a new transaction to Firestore
 */
export async function saveTransaction(data: TransactionFormData): Promise<string> {
    try {
        let proofUrl: string | undefined;

        // Upload proof file if provided
        if (data.proofFile) {
            const timestamp = Date.now();
            const filename = `${data.unitId}_${timestamp}_${data.proofFile.name}`;
            const storageRef = ref(storage, `transaction_proofs/${filename}`);

            await uploadBytes(storageRef, data.proofFile);
            proofUrl = await getDownloadURL(storageRef);
        }

        // Calculate amount in AED
        const amountInAED = data.currency === 'AED'
            ? data.amount
            : data.amount * (data.exchangeRate || 1);

        // Create transaction document
        const transaction = {
            unitId: data.unitId,
            subProject: data.subProject,
            amount: data.amount,
            currency: data.currency,
            exchangeRate: data.exchangeRate,
            amountInAED,
            type: data.type,
            category: data.category,
            description: data.description,
            proofUrl,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'general_ledger'), transaction);
        return docRef.id;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw new Error('Failed to save transaction');
    }
}

/**
 * Get transactions with optional filters
 */
export async function getTransactions(
    startDate?: Date,
    endDate?: Date,
    unitId?: string
): Promise<Transaction[]> {
    try {
        let q = query(collection(db, 'general_ledger'), orderBy('createdAt', 'desc'));

        if (startDate) {
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
        }
        if (endDate) {
            q = query(q, where('createdAt', '<=', Timestamp.fromDate(endDate)));
        }
        if (unitId && unitId !== 'all') {
            q = query(q, where('unitId', '==', unitId));
        }

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as Transaction[];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

/**
 * Calculate financial summary from transactions
 */
export function calculateSummary(transactions: Transaction[]): FinancialSummary {
    const summary: FinancialSummary = {
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        transactionCount: transactions.length,
        byUnit: {},
    };

    transactions.forEach(transaction => {
        const amount = transaction.amountInAED;

        if (transaction.type === 'INCOME') {
            summary.totalIncome += amount;
        } else {
            summary.totalExpenses += amount;
        }

        // Track by unit
        if (!summary.byUnit[transaction.unitId]) {
            summary.byUnit[transaction.unitId] = { income: 0, expenses: 0 };
        }

        if (transaction.type === 'INCOME') {
            summary.byUnit[transaction.unitId].income += amount;
        } else {
            summary.byUnit[transaction.unitId].expenses += amount;
        }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpenses;

    return summary;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'AED'): string {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Export transactions to CSV and trigger download
 */
export async function exportLedgerToCSV(
    startDate?: Date,
    endDate?: Date,
    unitId?: string
): Promise<void> {
    try {
        const transactions = await getTransactions(startDate, endDate, unitId);

        // CSV headers
        const headers = [
            'Date',
            'Unit',
            'Sub-Project',
            'Type',
            'Category',
            'Amount',
            'Currency',
            'Exchange Rate',
            'Amount (AED)',
            'Description',
            'Proof URL',
        ];

        // CSV rows
        const rows = transactions.map(t => [
            t.createdAt.toLocaleDateString(),
            t.unitId,
            t.subProject || '',
            t.type,
            t.category,
            t.amount.toFixed(2),
            t.currency,
            t.exchangeRate?.toFixed(4) || '1.0000',
            t.amountInAED.toFixed(2),
            t.description || '',
            t.proofUrl || '',
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const filename = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw new Error('Failed to export ledger');
    }
}
