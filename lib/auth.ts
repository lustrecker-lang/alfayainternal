import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import app from './firebase';

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle(): Promise<User> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        throw new Error(error.message || 'Failed to sign in with Google');
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error('Sign out error:', error);
        throw new Error(error.message || 'Failed to sign out');
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

/**
 * Get current user (sync)
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}
