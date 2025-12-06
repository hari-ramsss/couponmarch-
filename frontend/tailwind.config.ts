import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['var(--font-fredoka)', 'system-ui', 'sans-serif'],
                body: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Core Brand Colors
                'punchy-red': '#F2352B',
                'off-white': '#FFF7EF',
                'pure-black': '#000000',

                // Supporting Accent Colors
                'sunny-yellow': '#FFD432',
                'bold-teal': '#00C7B1',
                'deep-purple': '#5B2BA8',
                'orange-accent': '#FF8A2A',

                // Shadow and Line Colors
                'ticket-shadow': '#1A1A1A',
                'soft-red-line': '#E3433A',
                'muted-gray': '#3A3A3A',
            },
            boxShadow: {
                'ticket': '0 4px 12px #1A1A1A',
            },
        },
    },
    plugins: [],
};

export default config;
