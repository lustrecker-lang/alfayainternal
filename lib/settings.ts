import { db, storage } from '@/lib/firebase';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CompanyProfile } from '@/types/settings';

const SETTINGS_COLLECTION = 'settings';
const PROFILE_DOC_ID = 'company_profile';

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
