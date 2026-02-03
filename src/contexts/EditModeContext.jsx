import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { fetchData, saveData, validateConfig } from '../services/dataService';

const EditModeContext = createContext();

const SESSION_COOKIE_NAME = '_ma_sess';
const SESSION_EXPIRY_MINUTES = 30;

const verifyPassword = (password) => {
    const hash = CryptoJS.SHA256(password).toString();
    const storedHash = import.meta.env.PASSWORD_HASH;
    return hash === storedHash;
};


const setSessionCookie = () => {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (SESSION_EXPIRY_MINUTES * 60 * 1000));

    const payload = JSON.stringify({ mode: 'edit', exp: expiryDate.getTime() });
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
                    return false;
                }

                const payloadB64 = value.substring(0, dotIndex);
                const signature = value.substring(dotIndex + 1);
                const payload = atob(payloadB64);
                const { mode, exp } = JSON.parse(payload);

                const expectedSignature = CryptoJS.HmacSHA256(payload, import.meta.env.PASSWORD_HASH || 'fallback').toString();
                if (signature !== expectedSignature) {
                    clearSessionCookie();
                    return false;
                }

                if (Date.now() > exp) {
                    clearSessionCookie();
                    return false;
                }

                if (mode === 'edit') {
                    return true;
                }
            } catch {
                clearSessionCookie();
                return false;
            }
        }
    }
    return false;
};

const clearSessionCookie = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

const sanitizeData = (data) => {
    if (!data) return data;

    const sanitizedData = { ...data };
    const seenIds = new Set();

    const arrayFields = ['experiences', 'projects', 'education'];

    arrayFields.forEach(field => {
        if (Array.isArray(sanitizedData[field])) {
            sanitizedData[field] = sanitizedData[field].map(item => {
                if (!item.id || seenIds.has(item.id)) {
                    return { ...item, id: crypto.randomUUID() };
                }
                seenIds.add(item.id);
                return item;
            });
        }
    });

    return sanitizedData;
};

export const EditModeProvider = ({ children, initialData }) => {
    const initialSession = getSessionCookie();

    const [isEditMode, setIsEditMode] = useState(initialSession);
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

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const { data: fetchedData, success } = await fetchData();

                if (success) {
                    const sanitized = sanitizeData(fetchedData);
                    setData(sanitized);
                    setOriginalData(sanitized);
                    setBinConnected(true);
                } else {
                    const sanitized = sanitizeData(initialData);
                    setData(sanitized);
                    setOriginalData(sanitized);
                    setBinConnected(false);
                }
            } catch {
                const sanitized = sanitizeData(initialData);
                setData(sanitized);
                setOriginalData(sanitized);
                setBinConnected(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [initialData]);

    useEffect(() => {
        const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);
        setIsDirty(hasChanges);
    }, [data, originalData]);

    const enterEditMode = useCallback((password) => {
        if (verifyPassword(password)) {
            setIsEditMode(true);
            setSessionCookie();
            return true;
        }
        return false;
    }, []);

    const exitEditMode = useCallback(() => {
        if (isDirty) {
            const confirmed = window.confirm(
                'You have unsaved changes. Are you sure you want to exit? Your changes will be lost.'
            );
            if (!confirmed) {
                return false;
            }
        }

        setIsEditMode(false);
        setData(originalData);
        setIsDirty(false);
        clearSessionCookie();
        return true;
    }, [isDirty, originalData]);

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
    };

    const value = {
        isEditMode,
        data,
        originalData,
        isDirty,
        hasUnsavedChanges: isDirty,
        isLoading,
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
