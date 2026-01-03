'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, loading, signIn } = useAuth();
    const router = useRouter();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleSignIn = async () => {
        try {
            await signIn();
            router.push('/dashboard');
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
                <div className="text-gray-500 font-sans">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-md w-full mx-4">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">AFV Internal</h1>
                    <p className="text-gray-400 font-sans">Al Faya Ventures Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-zinc-800 p-8 shadow-2xl border border-gray-200 dark:border-gray-700" style={{ borderRadius: '0.5rem' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-xl text-gray-900 dark:text-white font-sans mb-1">Welcome</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
                            Sign in to access the management dashboard
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 transition-colors font-sans text-gray-700 dark:text-white"
                        style={{ borderRadius: '0.25rem' }}
                    >
                        {/* Google Icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4 font-sans">
                        Access restricted to authorized administrators
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-6 font-sans">
                    © 2026 Al Faya Ventures. All rights reserved.
                </p>
            </div>
        </div>
    );
}
