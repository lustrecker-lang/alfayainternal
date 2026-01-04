import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Project, NewProjectData } from '@/types/project';

const COLLECTION = 'projects';

/**
 * Get all active projects for a unit
 */
export async function getProjects(unitId: string): Promise<Project[]> {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('unitId', '==', unitId),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                clientId: data.clientId,
                clientName: data.clientName,
                description: data.description,
                unitId: data.unitId,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Project;
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects');
    }
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
    try {
        const docRef = doc(db, COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            clientId: data.clientId,
            clientName: data.clientName,
            description: data.description,
            unitId: data.unitId,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Project;
    } catch (error) {
        console.error('Error fetching project:', error);
        throw new Error('Failed to fetch project');
    }
}

/**
 * Create a new project
 */
export async function createProject(data: NewProjectData): Promise<string> {
    try {
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTION), {
            name: data.name,
            clientId: data.clientId,
            clientName: data.clientName,
            description: data.description,
            unitId: data.unitId,
            status: 'active',
            createdAt: now,
            updatedAt: now,
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating project:', error);
        throw new Error('Failed to create project');
    }
}

/**
 * Update a project
 */
export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION, id);

        // Filter out undefined values
        const updateData: any = {
            updatedAt: Timestamp.now(),
        };

        if (data.name !== undefined) updateData.name = data.name;
        if (data.clientId !== undefined) updateData.clientId = data.clientId;
        if (data.clientName !== undefined) updateData.clientName = data.clientName;
        if (data.description !== undefined) updateData.description = data.description;

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Failed to update project');
    }
}

/**
 * Archive a project (soft delete)
 */
export async function deleteProject(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION, id);
        await updateDoc(docRef, {
            status: 'archived',
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error archiving project:', error);
        throw new Error('Failed to archive project');
    }
}
