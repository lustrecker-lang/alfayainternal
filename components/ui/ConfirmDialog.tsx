'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    isLoading = false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const confirmColors = variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-imeda hover:opacity-90'; // Use imeda color as default or specific business unit color can be passed later

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-zinc-800 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 relative pointer-events-auto overflow-hidden animate-in fade-in zoom-in duration-200"
                    style={{ borderRadius: '0.5rem' }}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 font-sans leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all font-sans text-sm disabled:opacity-50"
                                style={{ borderRadius: '0.25rem' }}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 py-2.5 text-white font-medium shadow-sm transition-all font-sans text-sm disabled:opacity-50 ${confirmColors}`}
                                style={{ borderRadius: '0.25rem' }}
                            >
                                {isLoading ? 'Processing...' : confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
