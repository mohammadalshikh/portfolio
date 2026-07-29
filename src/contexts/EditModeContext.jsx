import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { fetchData, saveData, validateConfig } from '../services/dataService';

const EditModeContext = createContext();


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
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPassword, setEditPassword] = useState(null);
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

    const enterEditMode = useCallback(async (password) => {
        try {
            const response = await fetch("/api/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "auth",
                    password,
                }),
            });

            if (!response.ok) {
                return false;
            }

            setEditPassword(password);
            setIsEditMode(true);
            return true;
        } catch {
            return false;
        }
    }, []);

    const exitEditMode = useCallback(() => {
        if (isDirty) {
            const confirmed = window
                .confirm('You have unsaved changes. Are you sure you want to exit? Your changes will be lost.'
            );
            if (!confirmed) {
                return false;
            }
        }

        setIsEditMode(false);
        setData(originalData);
        setIsDirty(false);
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
            await saveData(data, editPassword);
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
        editPassword,
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
