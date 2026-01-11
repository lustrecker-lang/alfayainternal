import { db, storage } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CompanyProfile, DocumentTemplate } from '@/types/settings';

const SETTINGS_COLLECTION = 'settings';
const PROFILE_DOC_ID = 'company_profile';
const TEMPLATES_COLLECTION = 'document_templates';

export async function uploadCompanyAsset(file: File, type: 'logo' | 'stamp' | 'signature' | 'signed_stamp'): Promise<string> {
    try {
        const extension = file.name.split('.').pop();
        const filename = `company_${type}_${Date.now()}.${extension}`;
        const storageRef = ref(storage, `company_assets/${filename}`);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        throw error;
    }
}

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as CompanyProfile;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return null;
    }
}

export async function updateCompanyProfile(data: Partial<CompanyProfile>): Promise<void> {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);

        // Merge with existing data
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating company profile:', error);
        throw error;
    }
}

// ===== DOCUMENT TEMPLATES =====

export async function getDocumentTemplates(): Promise<DocumentTemplate[]> {
    try {
        const q = query(
            collection(db, TEMPLATES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(doc.data().updatedAt),
        } as DocumentTemplate));
    } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
    }
}

export async function saveDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    try {
        const data = {
            ...template,
            updatedAt: Timestamp.now(),
        };

        if (template.id) {
            // Update
            await setDoc(doc(db, TEMPLATES_COLLECTION, template.id), data, { merge: true });
            return template.id;
        } else {
            // Create
            const newDoc = {
                ...data,
                createdAt: Timestamp.now(),
            };
            const dockRef = await addDoc(collection(db, TEMPLATES_COLLECTION), newDoc);
            return dockRef.id;
        }
    } catch (error) {
        console.error('Error saving template:', error);
        throw new Error('Failed to save template');
    }
}

export async function deleteDocumentTemplate(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, TEMPLATES_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting template:', error);
        throw new Error('Failed to delete template');
    }
}
