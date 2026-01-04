import type { Metadata } from "next";
import { Unna, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const unna = Unna({
    subsets: ['latin'],
    weight: ['400'], // Use regular weight (closest to light)
    style: ['normal'], // Normal only - no italic
    variable: '--font-unna',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Al Faya Ventures Internal",
    description: "Internal management system for Al Faya Ventures",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={`${unna.variable} ${inter.variable}`}>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    <AuthProvider>
                        {children}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                // Default options
                                duration: 3000,
                                style: {
                                    background: 'var(--toast-bg)',
                                    color: 'var(--toast-text)',
                                    border: '1px solid var(--toast-border)',
                                },
                                // Success
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: 'white',
                                    },
                                },
                                // Error
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: 'white',
                                    },
                                    duration: 4000,
                                },
                            }}
                        />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
