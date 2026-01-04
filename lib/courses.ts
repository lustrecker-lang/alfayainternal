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
    serverTimestamp,
    limit
} from 'firebase/firestore';
import type { Course } from '@/types/course';

/**
 * Get all courses for a specific unit (e.g., 'imeda')
 */
export async function getCourses(unitId: string): Promise<Course[]> {
    try {
        const q = query(
            collection(db, 'courses'),
            where('unitId', '==', unitId),
            orderBy('formationId', 'asc')
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Course));
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
    try {
        const docSnap = await getDoc(doc(db, 'courses', courseId));
        if (!docSnap.exists()) return null;

        return {
            id: docSnap.id,
            ...docSnap.data()
        } as Course;
    } catch (error) {
        console.error('Error fetching course:', error);
        return null;
    }
}

/**
 * Add a new course
 */
export async function addCourse(courseData: Omit<Course, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'courses'), {
            ...courseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding course:', error);
        throw error;
    }
}

/**
 * Update an existing course
 */
export async function updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    try {
        const docRef = doc(db, 'courses', courseId);
        await updateDoc(docRef, {
            ...courseData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
}
