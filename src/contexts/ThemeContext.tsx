'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isThemeEnabled: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Company pages where dark mode should NOT be applied
const COMPANY_PAGE_PREFIXES = [
  '/company',
  '/company-get-started',
  '/company-sign-in',
  '/company-forgot-password',
  '/company-reset-password',
  '/company-dash',
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Check if current page is a company page
  const isCompanyPage = COMPANY_PAGE_PREFIXES.some(prefix => pathname?.startsWith(prefix));
  const isThemeEnabled = !isCompanyPage;

  useEffect(() => {
    setMounted(true);
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Only apply dark mode on non-company pages
    if (isThemeEnabled && theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Still save preference regardless of page
    localStorage.setItem('theme', theme);
  }, [theme, mounted, isThemeEnabled]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isThemeEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
