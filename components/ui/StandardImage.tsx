'use client';

import React, { useState, useEffect } from 'react';
import { User, Loader2, Image as ImageIcon } from 'lucide-react';

interface StandardImageProps {
    src?: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    fallbackIcon?: React.ReactNode;
}

/**
 * A robust image component that handles:
 * 1. Loading states with a pulse animation and spinner
 * 2. Error states with a fallback icon
 * 3. Smooth transition once loaded
 */
export function StandardImage({
    src,
    alt,
    className = "w-full h-full object-cover",
    containerClassName = "",
    fallbackIcon
}: StandardImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);

    // Reset state when src changes, but check if already cached
    useEffect(() => {
        if (!src || src.trim() === '') {
            setIsLoading(false);
            return;
        }

        // Check if image is already cached/complete
        if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
            setIsLoading(false);
            setHasError(false);
        } else {
            setIsLoading(true);
            setHasError(false);
        }
    }, [src]);

    const defaultFallback = (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-zinc-900 text-gray-300 dark:text-gray-700">
            {fallbackIcon || <ImageIcon className="w-1/3 h-1/3 opacity-50" />}
        </div>
    );

    // Show fallback immediately if no valid src
    if (!src || src.trim() === '' || hasError) {
        return (
            <div className={`overflow-hidden ${containerClassName}`}>
                {defaultFallback}
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${containerClassName}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-zinc-900 animate-pulse z-10">
                    <Loader2 className="w-5 h-5 text-imeda animate-spin opacity-20" />
                </div>
            )}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setHasError(true);
                    setIsLoading(false);
                    console.warn(`StandardImage failed to load: ${src}`);
                }}
            />
        </div>
    );
}
