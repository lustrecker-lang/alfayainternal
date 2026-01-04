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
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { ImedaService } from '@/types/finance';

const COLLECTION_NAME = 'services';

/**
 * Remove undefined properties from an object recursively
 */
function removeUndefined(obj: any) {
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
 * Get all services
 */
export async function getServices(): Promise<ImedaService[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('order', 'asc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                order: data.order ?? 0,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate(),
            } as ImedaService;
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

/**
 * Upload service image to storage
 */
export async function uploadServiceImage(file: File): Promise<string> {
    const storageRef = ref(storage, `services/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

/**
 * Add a new service
 */
export async function addService(data: Omit<ImedaService, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<string> {
    try {
        // Get highest order to place new service at end
        const existing = await getServices();
        const maxOrder = existing.reduce((max, s) => Math.max(max, s.order || 0), 0);

        const docRef = await addDoc(collection(db, COLLECTION_NAME), removeUndefined({
            ...data,
            order: maxOrder + 1,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }));
        return docRef.id;
    } catch (error) {
        console.error('Error adding service:', error);
        throw new Error('Failed to add service');
    }
}

/**
 * Update an existing service
 */
export async function updateService(id: string, data: Partial<Omit<ImedaService, 'id' | 'createdAt'>>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, removeUndefined({
            ...data,
            updatedAt: Timestamp.now(),
        }));
    } catch (error) {
        console.error('Error updating service:', error);
        throw new Error('Failed to update service');
    }
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting service:', error);
        throw new Error('Failed to delete service');
    }
}

/**
 * Reorder services by updating their order field
 */
export async function reorderServices(orderedIds: string[]): Promise<void> {
    try {
        const batch = writeBatch(db);
        orderedIds.forEach((id, index) => {
            const docRef = doc(db, COLLECTION_NAME, id);
            batch.update(docRef, { order: index + 1, updatedAt: Timestamp.now() });
        });
        await batch.commit();
    } catch (error) {
        console.error('Error reordering services:', error);
        throw new Error('Failed to reorder services');
    }
}
