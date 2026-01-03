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
import { db } from './firebase';
import type { Consultant, NewConsultantData } from '@/types/staff';

const COLLECTION = 'staff';

/**
 * Fetch all active consultants for a unit
 */
export async function getConsultants(unitId: string = 'afconsult'): Promise<Consultant[]> {
    try {
        // Query active consultants, ordered by name (requires index potentially, or simple sort)
        // If sorting causes index issues, fetch all and sort client-side.
        // For now, simpler query: where unitId == unitId AND status == 'active'
        const q = query(
            collection(db, COLLECTION),
            where('unitId', '==', unitId),
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                joinedDate: data.joinedDate?.toDate?.() || new Date(),
                // Handle optional fields
                rate: Number(data.rate) || 0,
            };
        }) as Consultant[];
    } catch (error) {
        console.error('Error fetching consultants:', error);
        return [];
    }
}

/**
 * Get a single consultant by ID
 */
export async function getConsultant(id: string): Promise<Consultant | null> {
    try {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                joinedDate: data.joinedDate?.toDate?.() || new Date(),
                rate: Number(data.rate) || 0,
            } as Consultant;
        }
        return null;
    } catch (error) {
        console.error('Error fetching consultant:', error);
        return null;
    }
}

/**
 * Add a new consultant
 */
export async function createConsultant(data: NewConsultantData): Promise<string> {
    try {
        const docData = {
            ...data,
            joinedDate: Timestamp.fromDate(data.joinedDate),
            rate: Number(data.rate), // Ensure number
            unitId: data.unitId || 'afconsult',
            status: 'active',
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, COLLECTION), docData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating consultant:', error);
        throw error;
    }
}

/**
 * Update an existing consultant
 */
export async function updateConsultant(id: string, data: Partial<Consultant>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION, id);

        const updates: any = { ...data };
        if (data.joinedDate) {
            updates.joinedDate = Timestamp.fromDate(data.joinedDate);
        }
        if (data.rate) {
            updates.rate = Number(data.rate);
        }

        // Remove undefined
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
        delete updates.id; // Don't update ID

        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Error updating consultant:', error);
        throw error;
    }
}

/**
 * Soft delete (archive) a consultant
 */
export async function deleteConsultant(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, { status: 'archived' });
    } catch (error) {
        console.error('Error archiving consultant:', error);
        throw error;
    }
}
