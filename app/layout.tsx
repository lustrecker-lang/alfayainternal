import type { Metadata } from "next";
import { Unna, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes';

const unna = Unna({
    subsets: ['latin'],
    weight: ['400', '700'],
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
            <body className="font-sans antialiased">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
