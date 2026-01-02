'use client';

import Link from 'next/link';
import { Building2, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function GlobalHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50 transition-colors">
            <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
                {/* Logo / Home Button */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                    <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg hidden sm:inline">Al Faya Ventures</span>
                    <span className="font-semibold text-lg sm:hidden">AFV</span>
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>
                    )}

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">Admin</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />

                                {/* Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // TODO: Navigate to settings
                                        }}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                    <button
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // TODO: Implement logout
                                            alert('Logout functionality to be implemented');
                                        }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
