import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [
        'bg-imeda', 'bg-afconsult', 'bg-aftech', 'bg-zinc-500',
        'text-imeda', 'text-afconsult', 'text-aftech', 'text-zinc-500',
        'border-imeda', 'border-afconsult', 'border-aftech', 'border-zinc-500',
        'hover:border-imeda', 'hover:border-afconsult', 'hover:border-aftech', 'hover:border-zinc-500',
        'decoration-imeda', 'decoration-afconsult', 'decoration-aftech', 'decoration-zinc-500',
    ],
    theme: {
        extend: {
            colors: {
                imeda: '#051E3A',
                afconsult: '#520230',
                aftech: '#737373',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                serif: ['var(--font-unna)', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
};

export default config;
