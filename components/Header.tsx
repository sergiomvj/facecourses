import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconSun, IconMoon } from './Icons';

interface HeaderProps {
  onLogout: () => void;
}

const LOGO_LIGHT = 'https://i.imgur.com/GxFYJQt.png';
const LOGO_DARK = 'https://i.imgur.com/zVTjKN8.png';

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-0">
                <img src={theme === 'light' ? LOGO_LIGHT : LOGO_DARK} alt="FaceCourses Logo" className="h-8" />
                <div className="flex items-center gap-4">
                     <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <IconMoon className="w-6 h-6" /> : <IconSun className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={onLogout} 
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
export default Header;
