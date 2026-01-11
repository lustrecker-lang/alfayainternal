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
export interface BankStatementContext {
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
        // When bankContext is present, totalAmount is ALREADY in AED (user enters "Amount Deducted from Bank in AED")
        // Only apply exchange rate conversion for legacy flow without bankContext
        let amountInAED: number;
        if (bankContext) {
            // Bank statement flow: totalAmount IS the AED amount from the bank
            amountInAED = totalAmount;
        } else {
            // Legacy flow: convert to AED if needed
            const exchangeRate = data.exchangeRate || 1;
            amountInAED = data.currency === 'AED'
                ? totalAmount
                : totalAmount * exchangeRate;
        }

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

// ============================================================
// CLIENT MANAGEMENT (Per Business Unit)
// ============================================================

// Simple client for dropdowns
export interface Client {
    id: string;
    name: string;
    unitId: string;
    createdAt?: Date;
}

// Full client record for client management pages
export interface ClientFull extends Client {
    clientType?: 'company' | 'personal';
    vatNumber?: string | null;
    industry?: string | null;
    contact?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
        street_line1?: string | null;
        street_line2?: string | null;
        city?: string | null;
        zip_code?: string | null;
        country?: string | null;
    } | null;
    contacts?: {
        title?: string;
        name?: string;
        occupation?: string;
        email1?: string;
        email2?: string;
        phone1?: string;
        phone2?: string;
        // Dietary & Travel
        restrictionsAlimentaires?: string;
        preferencesAlimentaires?: string;
        passportPhotoUrl?: string;
    }[];
}

/**
 * Get all clients for a specific business unit
 */
export async function getClients(unitId: string): Promise<ClientFull[]> {
    try {
        const q = query(
            collection(db, 'clients'),
            where('unitId', '==', unitId),
            orderBy('name', 'asc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                unitId: data.unitId,
                clientType: data.clientType,
                vatNumber: data.vatNumber,
                industry: data.industry,
                contact: data.contact,
                email: data.email,
                phone: data.phone,
                address: data.address,
                contacts: data.contacts || [],
                createdAt: data.createdAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
}

/**
 * Get a single client by ID
 */
export async function getClientById(clientId: string): Promise<ClientFull | null> {
    try {
        const docSnap = await getDoc(doc(db, 'clients', clientId));
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            unitId: data.unitId,
            clientType: data.clientType,
            vatNumber: data.vatNumber,
            industry: data.industry,
            contact: data.contact,
            email: data.email,
            phone: data.phone,
            address: data.address,
            contacts: data.contacts || [],
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('Error fetching client:', error);
        return null;
    }
}

/**
 * Add a new client (simple - for combobox)
 */
export async function addClient(unitId: string, name: string): Promise<Client> {
    try {
        // Check if client already exists (case-insensitive)
        const existingClients = await getClients(unitId);
        const exists = existingClients.find(
            c => c.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (exists) {
            return exists;
        }

        const docRef = await addDoc(collection(db, 'clients'), {
            name: name.trim(),
            unitId: unitId,
            createdAt: Timestamp.now(),
        });

        return {
            id: docRef.id,
            name: name.trim(),
            unitId: unitId,
            createdAt: new Date(),
        };
    } catch (error) {
        console.error('Error adding client:', error);
        throw new Error('Failed to add client');
    }
}

/**
 * Add a new client with full details
 */
export async function addClientFull(client: Omit<ClientFull, 'id' | 'createdAt'>): Promise<ClientFull> {
    try {
        // Helper to recursively remove undefined values (Firestore doesn't accept them)
        const removeUndefined = (obj: Record<string, unknown>): Record<string, unknown> => {
            const cleaned: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== undefined) {
                    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                        const nestedCleaned = removeUndefined(value as Record<string, unknown>);
                        if (Object.keys(nestedCleaned).length > 0) {
                            cleaned[key] = nestedCleaned;
                        }
                    } else {
                        cleaned[key] = value;
                    }
                }
            }
            return cleaned;
        };

        const cleanedClient = removeUndefined(client as Record<string, unknown>);

        const docRef = await addDoc(collection(db, 'clients'), {
            ...cleanedClient,
            createdAt: Timestamp.now(),
        });

        return {
            id: docRef.id,
            ...client,
            createdAt: new Date(),
        };
    } catch (error) {
        console.error('Error adding client:', error);
        throw new Error('Failed to add client');
    }
}

/**
 * Update an existing client
 */
export async function updateClient(clientId: string, updates: Partial<ClientFull>): Promise<void> {
    try {
        // Helper to recursively remove undefined values (Firestore doesn't accept them)
        // But we WANT to keep null values to "clear" fields if explicitly passed
        const cleanPayload = (obj: any): any => {
            const cleaned: any = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value === undefined) continue;
                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                    cleaned[key] = cleanPayload(value);
                } else {
                    cleaned[key] = value;
                }
            }
            return cleaned;
        };

        const updateData = cleanPayload(updates);

        await updateDoc(doc(db, 'clients', clientId), {
            ...updateData,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating client:', error);
        throw new Error('Failed to update client');
    }
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'clients', clientId));
    } catch (error) {
        console.error('Error deleting client:', error);
        throw new Error('Failed to delete client');
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
    unitId?: string,
    appId?: string
): Promise<Transaction[]> {
    try {
        let q = query(collection(db, 'general_ledger'), orderBy('createdAt', 'desc'));

        if (startDate) {
            q = query(q, where('createdAt', '>=', Timestamp.fromDate(startDate)));
        }
        if (endDate) {
            q = query(q, where('createdAt', '<=', Timestamp.fromDate(endDate)));
        }
        // if (unitId && unitId !== 'all') {
        //     q = query(q, where('unitId', '==', unitId));
        // }

        const snapshot = await getDocs(q);

        let transactions = snapshot.docs.map(doc => {
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

        // Client-side filtering for Unit ID (since we removed server-side filter)
        if (unitId && unitId !== 'all') {
            transactions = transactions.filter(t => t.unitId === unitId);
        }

        // Filter by appId if provided (client-side filter for now)
        if (appId) {
            transactions = transactions.filter(t =>
                t.metadata &&
                'app_id' in t.metadata &&
                t.metadata.app_id === appId
            );
        }

        return transactions;
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
/**
 * Export transactions to CSV and trigger download
 * Core fields are columns, metadata is flattened for accountant visibility
 */
export async function exportLedgerToCSV(
    startDate?: Date,
    endDate?: Date,
    unitId?: string,
    appId?: string
): Promise<void> {
    try {
        const transactions = await getTransactions(startDate, endDate, unitId, appId);

        // CSV headers (core fields + flattened metadata for accountants)
        const headers = [
            'Transaction ID',
            'Date',
            'Business Unit',
            'Type',
            'Category',
            'Vendor / Client',
            'Description',
            // Financials
            'Currency',
            'Net Amount (Original)',
            'VAT Rate (%)',
            'VAT Amount (Original)',
            'Total Amount (Original)',
            'Exchange Rate',
            'Total Amount (AED)',
            // Common Metadata Flattened
            'Client Name',
            'Project Name / Code',
            'Consultant / Staff',
            'Invoice #',
            'Billable',
            'Payment Method',
            // Audit
            'Proof URL',
            'Raw Metadata (JSON)',
        ];

        // CSV rows
        const rows = transactions.map(t => {
            // Safe helper for metadata access
            const meta = t.metadata || {};

            // Extract common metadata values safely
            const clientName = 'client_name' in meta ? String(meta.client_name) : '';
            const projectName = 'project_name' in meta ? String(meta.project_name) :
                'project_code' in meta ? String(meta.project_code) : '';
            const consultant = 'consultant_name' in meta ? String(meta.consultant_name) :
                'staff_name' in meta ? String(meta.staff_name) : '';
            const invoiceNum = 'invoice_number' in meta ? String(meta.invoice_number) :
                'invoice_link' in meta ? String(meta.invoice_link) : '';
            const billable = 'is_billable' in meta ? (meta.is_billable ? 'Yes' : 'No') : '';
            const paymentMethod = 'payment_method' in meta ? String(meta.payment_method) : '';

            return [
                t.id,
                t.date instanceof Date ? t.date.toLocaleDateString() : new Date(t.date).toLocaleDateString(),
                t.unitId.toUpperCase(),
                t.type,
                t.category,
                t.vendor || '',
                t.description || '',
                // Financials
                t.currency,
                t.amount.toFixed(2),
                (t.vatRate || 0).toString() + '%',
                (t.vatAmount || 0).toFixed(2),
                (t.totalAmount || t.amount).toFixed(2),
                t.exchangeRate?.toFixed(4) || '1.0000',
                t.amountInAED.toFixed(2),
                // Metadata
                clientName,
                projectName,
                consultant,
                invoiceNum,
                billable,
                paymentMethod,
                // Audit
                t.proofUrl || '',
                JSON.stringify(meta), // Keep raw JSON just in case
            ];
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const filename = `ledger_export_${unitId || 'all'}${appId ? '_' + appId : ''}_${new Date().toISOString().split('T')[0]}.csv`;
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
