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
                rosa: {
                    suave: '#FFF0F5', // Lavender Blush
                    primario: '#FFB6C1', // Light Pink
                    secundario: '#FF69B4', // Hot Pink
                    oscuro: '#C71585', // Medium Violet Red
                    profundo: '#8B008B', // Dark Magenta (for dark mode)
                },
                gris: {
                    fondo: '#F8F9FA',
                    texto: '#4A4A4A',
                    claro: '#E9ECEF',
                    oscuro: '#1F2937', // Gray 800
                    plata: '#D1D5DB', // Gray 300
                },
                amarillo: {
                    warning: '#FFC107',
                },
                dark: {
                    bg: '#1a1b26', // Deep blue-black
                    surface: '#24283b', // Slightly lighter blue-black
                    accent: '#7aa2f7', // Soft blue accent
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
