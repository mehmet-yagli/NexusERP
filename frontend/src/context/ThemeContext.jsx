// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // LocalStorage'dan önceki ayarları çek veya varsayılanları kullan
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  // Tema veya kontrast değiştiğinde HTML kök elementine class ekle/çıkar
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Dark Mode Kontrolü
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Yüksek Kontrast / Büyük Metin Kontrolü
    if (isHighContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('highContrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('highContrast', 'false');
    }
  }, [isDarkMode, isHighContrast]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleHighContrast = () => setIsHighContrast(!isHighContrast);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);