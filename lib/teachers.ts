import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import type { ImedaTeacher } from '@/types/teacher';

const COLLECTION = 'teachers';

/**
 * Convert Firestore document to ImedaTeacher
 */
function fromFirestore(id: string, data: Record<string, unknown>): ImedaTeacher {
    return {
        id,
        fullName: (data.fullName as string) || '',
        domains: Array.isArray(data.domains) ? data.domains : [],
        contact: {
            email: (data.contact as Record<string, string>)?.email || '',
            phone: (data.contact as Record<string, string>)?.phone || '',
            address: (data.contact as Record<string, string>)?.address || '',
        },
        bankDetails: {
            bankName: (data.bankDetails as Record<string, string>)?.bankName || '',
            accountName: (data.bankDetails as Record<string, string>)?.accountName || '',
            accountNumber: (data.bankDetails as Record<string, string>)?.accountNumber || '',
            iban: (data.bankDetails as Record<string, string>)?.iban || '',
            swiftCode: (data.bankDetails as Record<string, string>)?.swiftCode || '',
        },
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    };
}

/**
 * Get all teachers
 */
export async function getTeachers(): Promise<ImedaTeacher[]> {
    const q = query(
        collection(db, COLLECTION),
        orderBy('fullName', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore(doc.id, doc.data()));
}

/**
 * Get a single teacher by ID
 */
export async function getTeacher(id: string): Promise<ImedaTeacher | null> {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return fromFirestore(docSnap.id, docSnap.data());
}

/**
 * Create or update a teacher
 */
export async function saveTeacher(
    teacher: Omit<ImedaTeacher, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
): Promise<string> {
    const timestamp = Timestamp.now();
    const data = {
        ...teacher,
        updatedAt: timestamp,
    };

    if (id) {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, data);
        return id;
    } else {
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...data,
            createdAt: timestamp,
        });
        return docRef.id;
    }
}

/**
 * Delete a teacher
 */
export async function deleteTeacher(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
}

/**
 * Get unique domains from all courses (for dropdown options)
 */
export async function getCourseDomains(): Promise<string[]> {
    const q = query(collection(db, 'courses'), where('unitId', '==', 'imeda'));
    const snapshot = await getDocs(q);
    const domains = new Set<string>();
    snapshot.docs.forEach(doc => {
        const domain = doc.data().domain as string;
        if (domain) domains.add(domain);
    });
    return Array.from(domains).sort();
}
