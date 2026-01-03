import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Transaction, TransactionFormData, FinancialSummary, TransactionMetadata } from '@/types/finance';

/**
 * Bank statement calculation context
 */
interface BankStatementContext {
    vatIncluded: boolean;
    netAmount: number;
    vatAmount: number;
    totalAmount: number;
    foreignAmount?: number;
}

/**
 * Save a new transaction to Firestore with polymorphic metadata
 * Now supports bank statement workflow with pre-calculated VAT breakdown
 */
export async function saveTransaction(
    data: TransactionFormData,
    metadata?: TransactionMetadata,
    bankContext?: BankStatementContext
): Promise<string> {
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

        // Use pre-calculated values from bank statement flow, or calculate if not provided
        let netAmount: number;
        let vatAmount: number;
        let totalAmount: number;

        if (bankContext) {
            // Bank statement flow: values already calculated
            netAmount = bankContext.netAmount;
            vatAmount = bankContext.vatAmount;
            totalAmount = bankContext.totalAmount;
        } else {
            // Legacy flow: calculate from net amount
            vatAmount = data.amount * (data.vatRate / 100);
            netAmount = data.amount;
            totalAmount = data.amount + vatAmount;
        }

        // Calculate amount in AED (normalized)
        const exchangeRate = data.exchangeRate || 1;
        const amountInAED = data.currency === 'AED'
            ? totalAmount
            : totalAmount * exchangeRate;

        // Create transaction document
        const transaction: Record<string, any> = {
            // Core fields (The "Envelope")
            date: Timestamp.fromDate(new Date(data.date)),
            vendor: data.vendor,
            amount: netAmount,
            currency: data.currency,
            vatRate: data.vatRate,
            vatAmount: vatAmount,
            totalAmount: totalAmount,
            amountInAED: amountInAED,
            type: data.type,
            category: data.category,
            unitId: data.unitId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        // Add optional core fields
        if (data.exchangeRate && data.currency !== 'AED') {
            transaction.exchangeRate = data.exchangeRate;
        }
        if (bankContext?.foreignAmount && data.currency !== 'AED') {
            transaction.foreignAmount = bankContext.foreignAmount;
            transaction.foreignCurrency = data.currency;
        }
        if (data.description) {
            transaction.description = data.description;
        }
        if (proofUrl) {
            transaction.proofUrl = proofUrl;
        }

        // Add polymorphic metadata (The "Letter")
        if (metadata && Object.keys(metadata).length > 0) {
            transaction.metadata = metadata;
        }

        const docRef = await addDoc(collection(db, 'general_ledger'), transaction);
        return docRef.id;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw new Error('Failed to save transaction');
    }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
    id: string,
    updates: Partial<Transaction>,
    metadata?: TransactionMetadata
): Promise<void> {
    try {
        const docRef = doc(db, 'general_ledger', id);

        const updateData: Record<string, any> = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        // Convert date if provided
        if (updates.date) {
            updateData.date = Timestamp.fromDate(
                updates.date instanceof Date ? updates.date : new Date(updates.date)
            );
        }

        // Remove fields that shouldn't be directly updated
        delete updateData.id;
        delete updateData.createdAt;

        // Add metadata if provided
        if (metadata && Object.keys(metadata).length > 0) {
            updateData.metadata = metadata;
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error('Failed to update transaction');
    }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'general_ledger', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
    }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(id: string): Promise<Transaction | null> {
    try {
        const docRef = doc(db, 'general_ledger', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            vatRate: data.vatRate || 0,
            vatAmount: data.vatAmount || 0,
            totalAmount: data.totalAmount || data.amountInAED || data.amount || 0,
            vendor: data.vendor || '',
            metadata: data.metadata,
        } as Transaction;
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return null;
    }
}

// ============================================================
// VENDOR MANAGEMENT - Global Vendors Collection
// ============================================================

export interface Vendor {
    id: string;
    name: string;
    createdAt: Date;
}

/**
 * Get all vendors from the global vendors collection
 */
export async function getVendors(): Promise<Vendor[]> {
    try {
        const snapshot = await getDocs(
            query(collection(db, 'vendors'), orderBy('name', 'asc'))
        );

        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
    } catch (error) {
        console.error('Error fetching vendors:', error);
        return [];
    }
}

/**
 * Add a new vendor to the global collection
 */
export async function addVendor(name: string): Promise<Vendor> {
    try {
        // Check if vendor already exists (case-insensitive)
        const existingVendors = await getVendors();
        const exists = existingVendors.find(
            v => v.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (exists) {
            return exists;
        }

        const docRef = await addDoc(collection(db, 'vendors'), {
            name: name.trim(),
            createdAt: Timestamp.now(),
        });

        return {
            id: docRef.id,
            name: name.trim(),
            createdAt: new Date(),
        };
    } catch (error) {
        console.error('Error adding vendor:', error);
        throw new Error('Failed to add vendor');
    }
}

/**
 * Delete a vendor from the global collection
 */
export async function deleteVendor(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'vendors', id));
    } catch (error) {
        console.error('Error deleting vendor:', error);
        throw new Error('Failed to delete vendor');
    }
}

/**
 * Legacy: Get unique vendor names from transactions (fallback)
 */
export async function getUniqueVendorsFromTransactions(): Promise<string[]> {
    try {
        const snapshot = await getDocs(collection(db, 'general_ledger'));
        const vendors = new Set<string>();

        snapshot.docs.forEach(doc => {
            const vendor = doc.data().vendor;
            if (vendor && typeof vendor === 'string') {
                vendors.add(vendor);
            }
        });

        return Array.from(vendors).sort();
    } catch (error) {
        console.error('Error fetching vendors from transactions:', error);
        return [];
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

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Handle date fields safely
                date: data.date?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
                // Handle optional fields with safe defaults
                vatRate: data.vatRate || 0,
                vatAmount: data.vatAmount || 0,
                totalAmount: data.totalAmount || data.amountInAED || data.amount || 0,
                vendor: data.vendor || '',
                metadata: data.metadata, // May be undefined for old records
            };
        }) as Transaction[];
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
        const amount = transaction.amountInAED || 0;

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
 * Core fields are columns, metadata is serialized as JSON
 */
export async function exportLedgerToCSV(
    startDate?: Date,
    endDate?: Date,
    unitId?: string
): Promise<void> {
    try {
        const transactions = await getTransactions(startDate, endDate, unitId);

        // CSV headers (core fields only - accountant friendly)
        const headers = [
            'Date',
            'Unit',
            'Type',
            'Category',
            'Vendor',
            'Amount',
            'Currency',
            'VAT Rate',
            'VAT Amount',
            'Total Amount',
            'Exchange Rate',
            'Amount (AED)',
            'Description',
            'Proof URL',
            'Metadata (JSON)', // Serialized for reference
        ];

        // CSV rows
        const rows = transactions.map(t => [
            t.date instanceof Date ? t.date.toLocaleDateString() : new Date(t.date).toLocaleDateString(),
            t.unitId,
            t.type,
            t.category,
            t.vendor || '',
            t.amount.toFixed(2),
            t.currency,
            (t.vatRate || 0).toString() + '%',
            (t.vatAmount || 0).toFixed(2),
            (t.totalAmount || t.amount).toFixed(2),
            t.exchangeRate?.toFixed(4) || '1.0000',
            t.amountInAED.toFixed(2),
            t.description || '',
            t.proofUrl || '',
            t.metadata ? JSON.stringify(t.metadata) : '',
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
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

/**
 * Get transactions filtered by metadata (for unit-specific views)
 */
export async function getTransactionsByClient(
    clientId: string,
    unitId: string = 'afconsult'
): Promise<Transaction[]> {
    const transactions = await getTransactions(undefined, undefined, unitId);
    return transactions.filter(t => t.metadata && 'client_id' in t.metadata && t.metadata.client_id === clientId);
}

/**
 * Calculate profitability for a specific client
 */
export async function getClientProfitability(
    clientId: string
): Promise<{ income: number; expenses: number; profit: number; billableExpenses: number }> {
    const transactions = await getTransactionsByClient(clientId);

    let income = 0;
    let expenses = 0;
    let billableExpenses = 0;

    transactions.forEach(t => {
        const amount = t.amountInAED || 0;
        if (t.type === 'INCOME') {
            income += amount;
        } else {
            expenses += amount;
            if (t.metadata && 'is_billable' in t.metadata && t.metadata.is_billable) {
                billableExpenses += amount;
            }
        }
    });

    return {
        income,
        expenses,
        profit: income - expenses,
        billableExpenses,
    };
}
