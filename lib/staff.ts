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
    runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Consultant, NewConsultantData } from '@/types/staff';

const COLLECTION = 'staff';

function removeUndefined(obj: any) {
    const newObj = { ...obj };
    Object.keys(newObj).forEach(key => {
        if (newObj[key] === undefined) {
            delete newObj[key];
        }
    });
    return newObj;
}

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
 * Get the next sequential Employee ID (00000 format)
 */
async function getNextEmployeeId(): Promise<string> {
    const counterRef = doc(db, 'settings', 'staff_counter');

    return await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let nextCount = 0;

        if (counterDoc.exists()) {
            nextCount = counterDoc.data().current + 1;
        }

        transaction.set(counterRef, { current: nextCount }, { merge: true });

        // Pad with zeros to 5 digits
        return nextCount.toString().padStart(5, '0');
    });
}

/**
 * Upload staff avatar to storage
 */
export async function uploadStaffAvatar(id: string, file: File): Promise<string> {
    const storageRef = ref(storage, `staff_avatars/${id}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
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
        const employeeId = data.unitId === 'imeda' ? await getNextEmployeeId() : undefined;

        const docData = removeUndefined({
            ...data,
            joinedDate: Timestamp.fromDate(data.joinedDate),
            rate: Number(data.rate), // Ensure number
            unitId: data.unitId || 'afconsult',
            status: 'active',
            createdAt: Timestamp.now(),
            employeeId: employeeId,
        });

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

        const updates = removeUndefined({
            ...data,
            joinedDate: data.joinedDate ? Timestamp.fromDate(data.joinedDate) : undefined,
            rate: data.rate ? Number(data.rate) : undefined,
        });

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
