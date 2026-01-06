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
    orderBy,
    arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import type { Deal, DealFormData, DealStage } from '@/types/deal';

/**
 * Get all deals for a specific business unit
 */
export async function getDeals(unitId: string): Promise<Deal[]> {
    try {
        const q = query(
            collection(db, 'deals'),
            where('unitId', '==', unitId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                stage: data.stage,
                clientId: data.clientId,
                clientName: data.clientName,
                quoteIds: data.quoteIds || (data.quoteId ? [data.quoteId] : []),
                invoiceIds: data.invoiceIds || [],
                notes: data.notes || '',
                noteLog: (data.noteLog || []).map((n: any) => ({
                    ...n,
                    createdAt: n.createdAt?.toDate ? n.createdAt.toDate() : (n.createdAt ? new Date(n.createdAt) : new Date())
                })),
                amount: data.amount,
                unitId: data.unitId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });
    } catch (error) {
        console.error('Error fetching deals:', error);
        return [];
    }
}

/**
 * Get a single deal by ID
 */
export async function getDealById(id: string): Promise<Deal | null> {
    try {
        const docSnap = await getDoc(doc(db, 'deals', id));
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            stage: data.stage,
            clientId: data.clientId,
            clientName: data.clientName,
            quoteIds: data.quoteIds || (data.quoteId ? [data.quoteId] : []),
            invoiceIds: data.invoiceIds || [],
            notes: data.notes || '',
            noteLog: (data.noteLog || []).map((n: any) => ({
                ...n,
                createdAt: n.createdAt?.toDate ? n.createdAt.toDate() : (n.createdAt ? new Date(n.createdAt) : new Date())
            })),
            amount: data.amount,
            unitId: data.unitId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    } catch (error) {
        console.error('Error fetching deal:', error);
        return null;
    }
}

/**
 * Create a new deal
 */
export async function createDeal(
    unitId: string,
    data: DealFormData
): Promise<string> {
    if (!db) {
        console.error('Firestore DB not initialized');
        throw new Error('Firestore connection failed');
    }
    try {
        const docRef = await addDoc(collection(db, 'deals'), {
            name: data.name,
            stage: data.stage,
            clientId: data.clientId || null,
            clientName: data.clientName || null,
            quoteIds: data.quoteIds || [],
            invoiceIds: data.invoiceIds || [],
            notes: data.notes || '', // Legacy
            noteLog: data.noteLog || [],
            amount: 0, // Will be set when quotes are attached
            unitId: unitId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating deal:', error);
        throw new Error('Failed to create deal');
    }
}

/**
 * Update an existing deal
 */
export async function updateDeal(
    id: string,
    updates: Partial<Deal>
): Promise<void> {
    if (!db) throw new Error('Firestore DB not initialized');
    try {
        const updateData: any = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        // Remove fields that shouldn't be updated
        delete updateData.id;
        delete updateData.createdAt;

        await updateDoc(doc(db, 'deals', id), updateData);
    } catch (error) {
        console.error('Error updating deal:', error);
        throw new Error('Failed to update deal');
    }
}

/**
 * Update deal stage (for drag-and-drop)
 */
export async function updateDealStage(
    id: string,
    stage: DealStage
): Promise<void> {
    if (!db) throw new Error('Firestore DB not initialized');
    try {
        await updateDoc(doc(db, 'deals', id), {
            stage: stage,
            updatedAt: Timestamp.now(),
            noteLog: arrayUnion({
                id: crypto.randomUUID(),
                content: `Stage changed to ${stage.charAt(0).toUpperCase() + stage.slice(1)}`,
                createdAt: new Date(),
                isSystem: true
            })
        });
    } catch (error) {
        console.error('Error updating deal stage:', error);
        throw new Error('Failed to update deal stage');
    }
}

/**
 * Delete a deal
 */
export async function deleteDeal(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'deals', id));
    } catch (error) {
        console.error('Error deleting deal:', error);
        throw new Error('Failed to delete deal');
    }
}

/**
 * Update deal quotes and amount
 */
export async function updateDealQuotes(
    dealId: string,
    quoteIds: string[],
    totalAmount: number,
    clientId?: string,
    clientName?: string
): Promise<void> {
    try {
        const updates: any = {
            quoteIds: quoteIds,
            amount: totalAmount,
            updatedAt: Timestamp.now(),
        };

        if (clientId) {
            updates.clientId = clientId;
        }
        if (clientName) {
            updates.clientName = clientName;
        }

        await updateDoc(doc(db, 'deals', dealId), updates);
    } catch (error) {
        console.error('Error updating deal quotes:', error);
        throw new Error('Failed to update deal quotes');
    }
}

/**
 * Add a note to a deal
 */
export async function addNoteToDeal(
    dealId: string,
    content: string,
    existingNotes: any[] = [], // Legacy param, ignored now but kept for compatibility if needed, or better removed.
    noteObject?: any
): Promise<void> {
    try {
        // If noteObject is provided, use it (filtering mainly for properties)
        // Otherwise create new
        const newNote = noteObject || {
            id: crypto.randomUUID(),
            content,
            createdAt: Timestamp.now(), // Store as Timestamp
        };

        // If noteObject has Date, we might want to ensure it's compatible or let Firestore convert.
        // Firestore stores Date objects as Timestamps.

        await updateDoc(doc(db, 'deals', dealId), {
            noteLog: arrayUnion(newNote),
            notes: '', // clear legacy notes field if it was used as input
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error adding note to deal:', error);
        throw new Error('Failed to add note');
    }
}

/**
 * Attach invoices to a deal
 */
export async function updateDealInvoices(
    dealId: string,
    invoiceIds: string[]
): Promise<void> {
    try {
        await updateDoc(doc(db, 'deals', dealId), {
            invoiceIds: invoiceIds,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating deal invoices:', error);
        throw new Error('Failed to update invoices');
    }
}
