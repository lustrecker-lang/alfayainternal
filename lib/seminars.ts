import { db, storage } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Seminar, SeminarFormData, SeminarDocument } from '@/types/seminar';

/**
 * Generate a unique seminar ID based on campus name and year
 * Format: {CAMPUS_CODE}-{YEAR}-{SEQUENCE}
 * Example: LON-2024-001
 */
export async function generateSeminarId(campusName: string): Promise<string> {
    const year = new Date().getFullYear();
    const campusCode = campusName.slice(0, 3).toUpperCase();
    const prefix = `${campusCode}-${year}-`;

    // Count existing seminars with same prefix
    const q = query(
        collection(db, 'seminars'),
        where('seminarId', '>=', prefix),
        where('seminarId', '<', prefix + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    const nextNumber = snapshot.size + 1;

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Get all seminars for a specific unit
 */
export async function getSeminars(unitId: string): Promise<Seminar[]> {
    try {
        const q = query(
            collection(db, 'seminars'),
            where('unitId', '==', unitId),
            orderBy('startDate', 'desc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                seminarId: data.seminarId,
                name: data.name,
                campusId: data.campusId,
                officeIds: data.officeIds || [],
                clientId: data.clientId,
                participantIds: data.participantIds || [],
                assignedStaffIds: data.assignedStaffIds || [],
                courseIds: data.courseIds || [],
                startDate: data.startDate?.toDate?.() || new Date(data.startDate),
                endDate: data.endDate?.toDate?.() || new Date(data.endDate),
                documents: (data.documents || []).map((d: any) => ({
                    ...d,
                    uploadedAt: d.uploadedAt?.toDate?.() || new Date(d.uploadedAt),
                })),
                unitId: data.unitId,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || undefined,
            } as Seminar;
        });
    } catch (error) {
        console.error('Error fetching seminars:', error);
        return [];
    }
}

/**
 * Get a single seminar by ID
 */
export async function getSeminarById(seminarId: string): Promise<Seminar | null> {
    try {
        const docSnap = await getDoc(doc(db, 'seminars', seminarId));
        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            seminarId: data.seminarId,
            name: data.name,
            campusId: data.campusId,
            officeIds: data.officeIds || [],
            clientId: data.clientId,
            participantIds: data.participantIds || [],
            assignedStaffIds: data.assignedStaffIds || [],
            courseIds: data.courseIds || [],
            startDate: data.startDate?.toDate?.() || new Date(data.startDate),
            endDate: data.endDate?.toDate?.() || new Date(data.endDate),
            documents: (data.documents || []).map((d: any) => ({
                ...d,
                uploadedAt: d.uploadedAt?.toDate?.() || new Date(d.uploadedAt),
            })),
            unitId: data.unitId,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || undefined,
        } as Seminar;
    } catch (error) {
        console.error('Error fetching seminar:', error);
        return null;
    }
}

/**
 * Create a new seminar
 */
export async function createSeminar(
    data: SeminarFormData,
    campusName: string
): Promise<string> {
    try {
        const seminarId = await generateSeminarId(campusName);

        const docRef = await addDoc(collection(db, 'seminars'), {
            ...data,
            seminarId,
            startDate: Timestamp.fromDate(new Date(data.startDate)),
            endDate: Timestamp.fromDate(new Date(data.endDate)),
            documents: (data.documents || []).map(d => ({
                ...d,
                uploadedAt: Timestamp.fromDate(new Date(d.uploadedAt)),
            })),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error creating seminar:', error);
        throw new Error('Failed to create seminar');
    }
}

/**
 * Update an existing seminar
 */
export async function updateSeminar(
    id: string,
    data: Partial<SeminarFormData>
): Promise<void> {
    try {
        const updateData: any = { ...data, updatedAt: Timestamp.now() };

        if (data.startDate) {
            updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
        }
        if (data.endDate) {
            updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
        }
        if (data.documents) {
            updateData.documents = data.documents.map(d => ({
                ...d,
                uploadedAt: Timestamp.fromDate(new Date(d.uploadedAt)),
            }));
        }

        await updateDoc(doc(db, 'seminars', id), updateData);
    } catch (error) {
        console.error('Error updating seminar:', error);
        throw new Error('Failed to update seminar');
    }
}

/**
 * Delete a seminar
 */
export async function deleteSeminar(id: string): Promise<void> {
    try {
        // First, get the seminar to delete its documents from storage
        const seminar = await getSeminarById(id);
        if (seminar?.documents) {
            for (const doc of seminar.documents) {
                try {
                    await deleteSeminarDocument(doc.url);
                } catch (e) {
                    console.warn('Failed to delete document:', doc.url);
                }
            }
        }

        await deleteDoc(doc(db, 'seminars', id));
    } catch (error) {
        console.error('Error deleting seminar:', error);
        throw new Error('Failed to delete seminar');
    }
}

/**
 * Upload a document to Firebase Storage
 */
export async function uploadSeminarDocument(
    file: File,
    seminarId: string
): Promise<SeminarDocument> {
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `seminars/${seminarId}/${timestamp}_${safeFileName}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    return {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        fileType: extension,
        uploadedAt: new Date(),
    };
}

/**
 * Delete a document from Firebase Storage
 */
export async function deleteSeminarDocument(url: string): Promise<void> {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting document from storage:', error);
        // Don't throw - the file might already be deleted
    }
}
