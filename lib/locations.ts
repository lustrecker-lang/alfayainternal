import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { Country } from '@/types/settings';

const COUNTRIES_COLLECTION = 'countries';

export async function getCountries(): Promise<Country[]> {
    try {
        const q = query(collection(db, COUNTRIES_COLLECTION), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Country));
    } catch (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
}

export async function addCountry(country: Omit<Country, 'id' | 'updatedAt'>): Promise<string> {
    try {
        const id = country.code.toLowerCase();
        const docRef = doc(db, COUNTRIES_COLLECTION, id);

        await setDoc(docRef, {
            ...country,
            updatedAt: serverTimestamp()
        });

        return id;
    } catch (error) {
        console.error('Error adding country:', error);
        throw error;
    }
}

export async function removeCountry(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COUNTRIES_COLLECTION, id));
    } catch (error) {
        console.error('Error removing country:', error);
        throw error;
    }
}

export async function seedCountries(): Promise<void> {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json');
        const data = await response.json();

        // Data format from CDN is { name, code, emoji, ... }
        // Map it to our Country interface
        const countriesToSeed = data.map((c: any) => ({
            name: c.name,
            code: c.code,
            flag: c.emoji
        }));

        // Batch processing - promise.all with smaller chunks if needed, 
        // but for ~250 countries, we can try direct or sequential if preferred.
        // Let's do batch for better performance but be careful with firestore limits.
        const CHUNK_SIZE = 50;
        for (let i = 0; i < countriesToSeed.length; i += CHUNK_SIZE) {
            const chunk = countriesToSeed.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map((c: any) => addCountry(c)));
        }
    } catch (error) {
        console.error('Error seeding countries:', error);
        throw error;
    }
}
