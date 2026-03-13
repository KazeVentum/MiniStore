/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary brand palette — indigo/slate for a clean e-commerce feel
                brand: {
                    light:   '#EEF2FF', // indigo-50
                    soft:    '#C7D2FE', // indigo-200
                    default: '#4F46E5', // indigo-600  — primary CTAs, active nav
                    hover:   '#4338CA', // indigo-700
                    deep:    '#312E81', // indigo-900
                },
                surface: {
                    page:    '#F8FAFC', // slate-50
                    card:    '#FFFFFF',
                    muted:   '#F1F5F9', // slate-100
                    border:  '#E2E8F0', // slate-200
                },
                text: {
                    primary:   '#0F172A', // slate-900
                    secondary: '#475569', // slate-600
                    muted:     '#94A3B8', // slate-400
                },
                // Semantic colors
                success: '#10B981', // emerald-500
                warning: '#F59E0B', // amber-500
                danger:  '#EF4444', // red-500
                // Dark mode surfaces
                dark: {
                    bg:      '#0F172A', // slate-950
                    surface: '#1E293B', // slate-800
                    border:  '#334155', // slate-700
                    accent:  '#818CF8', // indigo-400
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%':   { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
