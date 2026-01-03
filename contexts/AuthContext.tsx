'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut } from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
