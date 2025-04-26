import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Load theme preference from storage
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('isDarkMode');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme colors
export const lightTheme = {
    background: '#f8f7ea',
    text: '#393939',
    primary: '#A081C3',
    secondary: '#929292',
    card: 'white',
    border: '#e1e1e1',
    subcard: '#ffffff',
    navbar: '#ffffff',
    modalbutton: '#A081C3',
};

export const darkTheme = {
    background: '#1a1a1a',
    text: '#ffffff',
    primary: '#A081C3',
    secondary: '#929292',
    card: '#2d2d2d',
    border: '#404040',
    subcard: '#3D3D3D',
    navbar: '#f8f7ea', 
    modalbutton: '#ffffff',
}; 