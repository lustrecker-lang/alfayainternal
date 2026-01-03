'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export default function GlobalHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 transition-colors">
            <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo / Home Button */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <Image
                        src="/logos/alfaya.svg"
                        alt="Al Faya Ventures"
                        width={140}
                        height={32}
                        className="h-8 w-auto dark:invert"
                        priority
                    />
                </Link>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white dark:text-black" />
                            </div>
                        )}
                    </button>

                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                {/* User Info */}
                                {user && (
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white font-sans truncate">
                                            {user.displayName || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-sans truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                )}

                                {/* Theme Toggle */}
                                {mounted && (
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors font-sans"
                                        onClick={() => {
                                            setTheme(theme === 'dark' ? 'light' : 'dark');
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun className="w-4 h-4" />
                                                Light Mode
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="w-4 h-4" />
                                                Dark Mode
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors font-sans"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors font-sans"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
