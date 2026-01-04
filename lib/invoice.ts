import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { Invoice, NewInvoiceData, InvoiceStatus } from '@/types/invoice';

const COLLECTION_NAME = 'invoices';

export async function createInvoice(data: NewInvoiceData): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
}

export async function getInvoices(unitId: string): Promise<Invoice[]> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('unit_id', '==', unitId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date_issue: data.date_issue instanceof Timestamp ? data.date_issue.toDate() : new Date(data.date_issue),
                date_due: data.date_due instanceof Timestamp ? data.date_due.toDate() : new Date(data.date_due),
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            } as Invoice;
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
}

export async function getInvoice(id: string): Promise<Invoice | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                date_issue: data.date_issue instanceof Timestamp ? data.date_issue.toDate() : new Date(data.date_issue),
                date_due: data.date_due instanceof Timestamp ? data.date_due.toDate() : new Date(data.date_due),
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            } as Invoice;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
    }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating invoice status:', error);
        throw error;
    }
}

export async function updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
}

export async function deleteInvoice(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
}
