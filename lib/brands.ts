import { db, storage } from '@/lib/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CompanyBrand } from '@/types/brands';
import { BUSINESS_UNITS } from '@/config/units';

const BRANDS_COLLECTION = 'company_brands';

// Initial Seeding Function
export async function seedBrands(): Promise<void> {
    const brandsRef = collection(db, BRANDS_COLLECTION);
    const snap = await getDocs(brandsRef);

    if (!snap.empty) return; // Already seeded

    console.log('Seeding brands...');
    for (const unit of BUSINESS_UNITS) {
        // Skip valid units only if needed, but for now map all
        const brand: CompanyBrand = {
            unit_slug: unit.slug,
            display_name: unit.name,
            logo_url: unit.logo || '',
            brand_color_primary: unit.brandColor.startsWith('#') ? unit.brandColor : '#000000', // Fallback for tailwind classes if needed, though color picker needs hex. 
            // Note: existing config uses some tailwind classes like 'imeda' or 'zinc-500'. 
            // We might need a mapping or just let the user edit it later. 
            // For seeding, let's try to map known ones or default to black.
            brand_color_secondary: '',
            official_website: ''
        };

        // Attempt to map known colors for better UX on first load
        if (unit.slug === 'imeda') brand.brand_color_primary = '#1e3a8a'; // Example Blue
        if (unit.slug === 'afconsult') brand.brand_color_primary = '#F97316'; // Orange-500
        if (unit.slug === 'aftech') brand.brand_color_primary = '#10b981'; // Emerald-500
        if (unit.slug === 'finance') brand.brand_color_primary = '#71717a'; // Zinc-500

        await setDoc(doc(db, BRANDS_COLLECTION, unit.slug), {
            ...brand,
            updatedAt: serverTimestamp()
        });
    }
}

export async function getCompanyBrands(): Promise<CompanyBrand[]> {
    try {
        const querySnapshot = await getDocs(collection(db, BRANDS_COLLECTION));
        const brands: CompanyBrand[] = [];
        querySnapshot.forEach((doc) => {
            brands.push(doc.data() as CompanyBrand);
        });

        // If empty, try seeding then fetch again
        if (brands.length === 0) {
            await seedBrands();
            return getCompanyBrands(); // Recursive once
        }

        return brands;
    } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
}

export async function getBrandBySlug(slug: string): Promise<CompanyBrand | null> {
    try {
        const docRef = doc(db, BRANDS_COLLECTION, slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as CompanyBrand;
        }
        return null; // The hook will fallback to config if this is null
    } catch (error) {
        console.error(`Error fetching brand ${slug}:`, error);
        return null;
    }
}

export async function updateBrand(slug: string, data: Partial<CompanyBrand>): Promise<void> {
    try {
        const docRef = doc(db, BRANDS_COLLECTION, slug);
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error(`Error updating brand ${slug}:`, error);
        throw error;
    }
}

// type: 'logo' | 'logo_squared' | 'banner'
export async function uploadBrandAsset(file: File, slug: string, assetType: 'logo' | 'logo_squared' | 'banner'): Promise<string> {
    try {
        const extension = file.name.split('.').pop();
        const filename = `${assetType}_${Date.now()}.${extension}`;
        // Structure: company_assets/brands/{slug}/{filename}
        const storageRef = ref(storage, `company_assets/brands/${slug}/${filename}`);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error(`Error uploading ${assetType} for ${slug}:`, error);
        throw error;
    }
}
