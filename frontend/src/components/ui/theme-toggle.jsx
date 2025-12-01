import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-300"
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-rosa-oscuro transition-transform hover:rotate-12" />
            ) : (
                <Sun className="h-5 w-5 text-amarillo-warning transition-transform hover:rotate-90" />
            )}
        </Button>
    );
};

export default ThemeToggle;
