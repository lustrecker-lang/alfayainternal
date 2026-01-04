import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Campus } from '@/types/finance';

const COLLECTION_NAME = 'campuses';

/**
 * Get all campuses
 */
export async function getCampuses(): Promise<Campus[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('name', 'asc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                country: data.country,
                address: data.address,
                googleMapsLink: data.googleMapsLink,
                imageUrl: data.imageUrl,
                directorId: data.directorId,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
            } as Campus;
        });
    } catch (error) {
        console.error('Error fetching campuses:', error);
        return [];
    }
}

/**
 * Add a new campus
 */
export async function addCampus(data: Omit<Campus, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding campus:', error);
        throw new Error('Failed to add campus');
    }
}

/**
 * Update an existing campus
 */
export async function updateCampus(id: string, data: Partial<Omit<Campus, 'id' | 'createdAt'>>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating campus:', error);
        throw new Error('Failed to update campus');
    }
}

/**
 * Delete a campus
 */
export async function deleteCampus(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting campus:', error);
        throw new Error('Failed to delete campus');
    }
}
