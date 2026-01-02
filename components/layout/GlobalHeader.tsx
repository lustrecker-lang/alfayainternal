'use client';

import Link from 'next/link';
import { Building2, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

export default function GlobalHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
            <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
                {/* Logo / Home Button */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors group"
                >
                    <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-lg hidden sm:inline">Al Faya Ventures</span>
                    <span className="font-semibold text-lg sm:hidden">AFV</span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:inline">Admin</span>
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
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        // TODO: Navigate to settings
                                    }}
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        </header>
    );
}
