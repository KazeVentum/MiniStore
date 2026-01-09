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
                    suave: '#FAFAFB',
                    primario: '#FEE2E2',
                    secundario: '#EC4899',
                    oscuro: '#BE185D',
                    profundo: '#831843',
                },
                gris: {
                    fondo: '#F9FAFB',
                    texto: '#1F2937',
                    claro: '#F3F4F6',
                    oscuro: '#111827',
                    plata: '#9CA3AF',
                },
                amarillo: {
                    warning: '#F59E0B',
                },
                dark: {
                    bg: '#0F172A',
                    surface: '#1E293B',
                    accent: '#F472B6',
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
