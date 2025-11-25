import { createContext, useState, useContext, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { fetchData, saveData, validateConfig } from '../services/dataService';

const EditModeContext = createContext();

const verifyPassword = (password) => {
    const hash = CryptoJS.SHA256(password).toString();
    const storedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    return hash === storedHash;
};

/**
 * EditModeProvider - Manages edit mode state and data synchronization
 * 
 * @param {Object} children - Child components
 * @param {Object} initialData - Fallback data (if fetch fails)
 */
export const EditModeProvider = ({ children, initialData }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [data, setData] = useState(initialData);
    const [originalData, setOriginalData] = useState(initialData);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [configValid, setConfigValid] = useState(false);
    const [binConnected, setBinConnected] = useState(false);

    useEffect(() => {
        const isValid = validateConfig();
        setConfigValid(isValid);
    }, []);

    // Load data from backend on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const { data: fetchedData, success } = await fetchData();

                // Successfully fetched from bin
                if (success) {
                    setData(fetchedData);
                    setOriginalData(fetchedData);
                    setBinConnected(true);
                } else {
                    setData(initialData);
                    setOriginalData(initialData);
                    setBinConnected(false);
                }
            } catch {
                setData(initialData);
                setOriginalData(initialData);
                setBinConnected(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [initialData]);

    // Check if data has changed
    useEffect(() => {
        const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
        setIsDirty(hasChanges);
    }, [data, originalData]);

    const enterEditMode = (password) => {
        if (verifyPassword(password)) {
            setIsEditMode(true);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const exitEditMode = () => {
        if (isDirty) {
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to exit edit mode?'
            );
            if (!confirmed) {
                return false;
            }
        }

        setIsEditMode(false);
        setIsAuthenticated(false);
        setData(originalData);
        setIsDirty(false);
        return true;
    };

    const updateData = (newData) => {
        setData(newData);
    };

    const saveChanges = async () => {
        if (!configValid) {
            alert('Backend not configured. Changes are only saved locally.');
            setOriginalData(data);
            setIsDirty(false);
            return true;
        }

        setIsLoading(true);
        try {
            await saveData(data);
            setOriginalData(data);
            setIsDirty(false);
            alert('Changes saved successfully!');
            return true;
        } catch {
            alert('Failed to save changes. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const undoChanges = () => {
        if (!isDirty) {
            return;
        }

        const confirmed = window.confirm(
            'Are you sure you want to undo all changes?'
        );

        if (confirmed) {
            setData(originalData);
            setIsDirty(false);
        }
    };

    const updateSection = (section, newValue) => {
        setData((prev) => ({
            ...prev,
            [section]: newValue,
        }));
    };

    const value = {
        isEditMode,
        isAuthenticated,
        data,
        originalData,
        isDirty,
        isLoading,
        configValid,
        binConnected,
        enterEditMode,
        exitEditMode,
        updateData,
        saveChanges,
        undoChanges,
        updateSection,
    };

    return (
        <EditModeContext.Provider value={value}>
            {children}
        </EditModeContext.Provider>
    );
};

export const useEditMode = () => {
    const context = useContext(EditModeContext);
    if (!context) {
        throw new Error('useEditMode must be used within EditModeProvider');
    }
    return context;
};
