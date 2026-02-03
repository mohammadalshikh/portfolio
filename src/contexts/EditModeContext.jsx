import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { fetchData, fetchNotes, saveData, validateConfig } from '../services/dataService';

const EditModeContext = createContext();

export const ACCESS_MODES = {
    NORMAL: 'normal',
    VIEW: 'view',
    EDIT: 'edit'
};

const SESSION_COOKIE_NAME = '_ma_sess';
const SESSION_EXPIRY_MINUTES = 30;

const verifyPassword = (password) => {
    const hash = CryptoJS.SHA256(password).toString();
    const storedHash = import.meta.env.PASSWORD_HASH;
    return hash === storedHash;
};


const setSessionCookie = (mode) => {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (SESSION_EXPIRY_MINUTES * 60 * 1000));

    const payload = JSON.stringify({ mode, exp: expiryDate.getTime() });
    const signature = CryptoJS.HmacSHA256(payload, import.meta.env.PASSWORD_HASH || 'fallback').toString();
    const token = btoa(payload) + '.' + signature;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${SESSION_COOKIE_NAME}=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${secure}`;
};


const getSessionCookie = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;

        const name = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);

        if (name === SESSION_COOKIE_NAME && value) {
            try {
                const dotIndex = value.lastIndexOf('.');
                if (dotIndex === -1) {
                    clearSessionCookie();
                    return null;
                }

                const payloadB64 = value.substring(0, dotIndex);
                const signature = value.substring(dotIndex + 1);
                const payload = atob(payloadB64);
                const { mode, exp } = JSON.parse(payload);

                const expectedSignature = CryptoJS.HmacSHA256(payload, import.meta.env.PASSWORD_HASH || 'fallback').toString();
                if (signature !== expectedSignature) {
                    clearSessionCookie();
                    return null;
                }

                if (Date.now() > exp) {
                    clearSessionCookie();
                    return null;
                }

                if (mode === ACCESS_MODES.VIEW || mode === ACCESS_MODES.EDIT) {
                    return mode;
                }
            } catch {
                clearSessionCookie();
                return null;
            }
        }
    }
    return null;
};

/**
 * Clear the session cookie
 */
const clearSessionCookie = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

/**
 * Manages edit mode state and data synchronization
 * 
 * @param {Object} children - Child components
 * @param {Object} initialData - Fallback data (if fetch fails)
 */
export const EditModeProvider = ({ children, initialData }) => {
    // Initialize state from cookie if valid session exists
    const initialSession = getSessionCookie();

    const [accessMode, setAccessMode] = useState(initialSession || ACCESS_MODES.NORMAL);
    const [isEditMode, setIsEditMode] = useState(initialSession === ACCESS_MODES.EDIT);
    const [isAuthenticated, setIsAuthenticated] = useState(!!initialSession);
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

        const cachedNotes = sessionStorage.getItem('notes');
        if (cachedNotes) {
            try {
                const notes = JSON.parse(cachedNotes);
                setData(prev => {
                    setNotesLoaded(true);
                    return { ...prev, notes };
                });
                setOriginalData(prev => ({ ...prev, notes }));
                return;
            } catch {
                // Invalid cache
            }
        }

        setIsLoadingNotes(true);
        try {
            const { notes, success } = await fetchNotes();
            if (success) {
                sessionStorage.setItem('notes', JSON.stringify(notes));
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

    useEffect(() => {
        const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
        setIsDirty(hasChanges);
    }, [data, originalData]);

    // Enter access mode
    const enterAccessMode = useCallback((password, mode) => {
        if (verifyPassword(password)) {
            setIsAuthenticated(true);
            setAccessMode(mode);
            setIsEditMode(mode === ACCESS_MODES.EDIT);
            setSessionCookie(mode);
            return true;
        }
        return false;
    }, []);

    // Switch between modes
    const switchAccessMode = useCallback((newMode) => {
        if (!isAuthenticated) return false;

        if (accessMode === ACCESS_MODES.EDIT && isDirty) {
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to switch modes? Your changes will be lost.'
            );
            if (!confirmed) {
                return false;
            }
            setData(originalData);
            setIsDirty(false);
        }

        setAccessMode(newMode);
        setIsEditMode(newMode === ACCESS_MODES.EDIT);
        setSessionCookie(newMode);
        return true;
    }, [isAuthenticated, accessMode, isDirty, originalData]);

    // Legacy function
    const enterEditMode = (password) => {
        return enterAccessMode(password, ACCESS_MODES.EDIT);
    };

    const exitAccessMode = useCallback(() => {
        if (accessMode === ACCESS_MODES.EDIT && isDirty) {
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to exit? Your changes will be lost.'
            );
            if (!confirmed) {
                return false;
            }
        }

        setAccessMode(ACCESS_MODES.NORMAL);
        setIsEditMode(false);
        setIsAuthenticated(false);
        setData(originalData);
        setIsDirty(false);
        clearSessionCookie();
        return true;
    }, [accessMode, isDirty, originalData]);

    // Legacy function
    const exitEditMode = () => {
        return exitAccessMode();
    };

    const canAccessNotes = accessMode !== ACCESS_MODES.NORMAL;

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
        if (section === 'notes') {
            sessionStorage.setItem('notes', JSON.stringify(newValue));
        }
    };

    const value = {
        isEditMode,
        isAuthenticated,
        accessMode,
        canAccessNotes,
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
        enterAccessMode,
        exitAccessMode,
        switchAccessMode,
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
