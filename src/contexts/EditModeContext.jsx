import { createContext, useState, useContext, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { fetchData, fetchNotes, saveData, validateConfig } from '../services/dataService';

const EditModeContext = createContext();

const verifyPassword = (password) => {
    const hash = CryptoJS.SHA256(password).toString();
    const storedHash = import.meta.env.PASSWORD_HASH;
    return hash === storedHash;
};

/**
 * Manages edit mode state and data synchronization
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
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [notesLoaded, setNotesLoaded] = useState(false);
    const [configValid, setConfigValid] = useState(false);
    const [binConnected, setBinConnected] = useState(false);

    useEffect(() => {
        const isValid = validateConfig();
        setConfigValid(isValid);
    }, []);

    // Load main data from backend on mount (excluding notes)
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const { data: fetchedData, success } = await fetchData();

                // Successfully fetched from bin
                if (success) {
                    // Preserve existing notes if already loaded
                    setData(prev => ({ ...fetchedData, notes: prev.notes || {} }));
                    setOriginalData(prev => ({ ...fetchedData, notes: prev.notes || {} }));
                    setBinConnected(true);
                } else {
                    setData(prev => ({ ...initialData, notes: prev.notes || {} }));
                    setOriginalData(prev => ({ ...initialData, notes: prev.notes || {} }));
                    setBinConnected(false);
                }
            } catch {
                setData(prev => ({ ...initialData, notes: prev.notes || {} }));
                setOriginalData(prev => ({ ...initialData, notes: prev.notes || {} }));
                setBinConnected(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [initialData]);

    // Function to load notes on demand (with sessionStorage caching)
    const loadNotes = async () => {
        if (notesLoaded || isLoadingNotes) return;

        // Check sessionStorage first
        const cachedNotes = sessionStorage.getItem('notes');
        if (cachedNotes) {
            try {
                const notes = JSON.parse(cachedNotes);
                // Set data and mark as loaded in one batch
                setData(prev => {
                    setNotesLoaded(true);
                    return { ...prev, notes };
                });
                setOriginalData(prev => ({ ...prev, notes }));
                return;
            } catch {
                // Invalid cache, proceed with fetch
            }
        }

        setIsLoadingNotes(true);
        try {
            const { notes, success } = await fetchNotes();
            if (success) {
                // Cache in sessionStorage
                sessionStorage.setItem('notes', JSON.stringify(notes));
                // Set data and mark as loaded in one batch
                setData(prev => {
                    setNotesLoaded(true);
                    return { ...prev, notes };
                });
                setOriginalData(prev => ({ ...prev, notes }));
            } else {
                setNotesLoaded(true);
            }
        } catch {
            setNotesLoaded(true);
        } finally {
            setIsLoadingNotes(false);
        }
    };

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
        if (!binConnected) {
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
        // Update sessionStorage cache when notes are modified
        if (section === 'notes') {
            sessionStorage.setItem('notes', JSON.stringify(newValue));
        }
    };

    const value = {
        isEditMode,
        isAuthenticated,
        data,
        originalData,
        isDirty,
        hasUnsavedChanges: isDirty,
        isLoading,
        isLoadingNotes,
        notesLoaded,
        loadNotes,
        isSaving: isLoading,
        configValid,
        binConnected,
        enterEditMode,
        exitEditMode,
        updateData,
        saveChanges,
        save: saveChanges,
        undoChanges,
        undo: undoChanges,
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
