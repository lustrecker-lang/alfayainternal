import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Quote } from '@/types/quote';

const COLLECTION_NAME = 'quotes';

/**
 * Remove undefined properties from an object recursively
 */
function removeUndefined(obj: any): any {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
        if (newObj[key] === undefined) {
            delete newObj[key];
        } else if (typeof newObj[key] === 'object' && newObj[key] !== null && !(newObj[key] instanceof Date) && !(newObj[key] instanceof Timestamp)) {
            newObj[key] = removeUndefined(newObj[key]);
        }
    });
    return newObj;
}

/**
 * Convert Quote to Firestore format
 */
function toFirestore(quote: Omit<Quote, 'id'>): any {
    return removeUndefined({
        ...quote,
        arrivalDate: Timestamp.fromDate(quote.arrivalDate),
        departureDate: Timestamp.fromDate(quote.departureDate),
        createdAt: quote.createdAt ? Timestamp.fromDate(quote.createdAt) : Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

/**
 * Convert Firestore document to Quote
 */
function fromFirestore(docId: string, data: any): Quote {
    return {
        id: docId,
        ...data,
        arrivalDate: data.arrivalDate?.toDate() || new Date(),
        departureDate: data.departureDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        activeWorkdays: data.activeWorkdays || [],
        teachers: data.teachers || [],
        services: data.services || [],
    } as Quote;
}

/**
 * Get all quotes for a unit
 */
export async function getQuotes(unitId: string = 'imeda'): Promise<Quote[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('unitId', '==', unitId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => fromFirestore(doc.id, doc.data()));
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }
}

/**
 * Get a single quote by ID
 */
export async function getQuote(id: string): Promise<Quote | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return fromFirestore(docSnap.id, docSnap.data());
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

/**
 * Save a quote (create or update)
 */
export async function saveQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<string> {
    try {
        const data = toFirestore(quoteData as Omit<Quote, 'id'>);

        if (id) {
            // Update existing
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, data);
            return id;
        } else {
            // Create new
            const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
            return docRef.id;
        }
    } catch (error) {
        console.error('Error saving quote:', error);
        throw new Error('Failed to save quote');
    }
}

/**
 * Delete a quote
 */
export async function deleteQuote(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting quote:', error);
        throw new Error('Failed to delete quote');
    }
}

/**
 * Duplicate a quote
 */
export async function duplicateQuote(id: string): Promise<string> {
    try {
        const original = await getQuote(id);
        if (!original) {
            throw new Error('Quote not found');
        }

        const { id: _, createdAt, updatedAt, ...quoteData } = original;
        const duplicated = {
            ...quoteData,
            quoteName: `${quoteData.quoteName} (Copy)`,
            status: 'draft' as const,
        };

        return await saveQuote(duplicated);
    } catch (error) {
        console.error('Error duplicating quote:', error);
        throw new Error('Failed to duplicate quote');
    }
}
