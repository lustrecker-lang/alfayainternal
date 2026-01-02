import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from 'next-themes';

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
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
