import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';

const toKebabCase = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

const parseNoteContent = (contentString) => {
    try {
        return JSON.parse(contentString);
    } catch {
        return [{ type: 'text', content: contentString }];
    }
};

const getPlainText = (contentBlocks) => {
    return contentBlocks.map(block => block.content).join('\n\n');
};

const NotePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { data, isEditMode, updateSection, loadNotes, isLoading, isLoadingNotes, notesLoaded, save, isSaving, hasUnsavedChanges } = useEditMode();
    const { notes = {}, notesOrder = [] } = data;

    const isNewNote = slug === 'new';

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const note = notes[slug];
    const contentBlocks = note ? parseNoteContent(note.content) : [];

    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [editedUrl, setEditedUrl] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [urlManuallyEdited, setUrlManuallyEdited] = useState(false);
    const [error, setError] = useState('');
    const initialValuesSet = useRef(false);
    const saveAfterUpdate = useRef(false);
    const slugToNavigate = useRef(null);
    const initialTitle = useRef('');
    const initialContent = useRef('');
    const initialUrl = useRef('');

    useEffect(() => {
        if (!isNewNote && note && !initialValuesSet.current) {
            const title = note.title;
            const content = getPlainText(parseNoteContent(note.content));
            setEditedTitle(title);
            setEditedContent(content);
            setEditedUrl(slug);
            initialTitle.current = title;
            initialContent.current = content;
            initialUrl.current = slug;
            initialValuesSet.current = true;
        }
    }, [note, slug, isNewNote]);

    useEffect(() => {
        if (isNewNote) {
            setEditedTitle('');
            setEditedContent('');
            setEditedUrl('');
            setIsDirty(false);
            setUrlManuallyEdited(false);
            setError('');
            initialValuesSet.current = false;
            initialTitle.current = '';
            initialContent.current = '';
            initialUrl.current = '';
        }
    }, [slug, isNewNote]);

    useEffect(() => {
        const titleChanged = editedTitle !== initialTitle.current;
        const contentChanged = editedContent !== initialContent.current;
        const urlChanged = editedUrl !== initialUrl.current;
        const isFormDirty = titleChanged || contentChanged || urlChanged;
        setIsDirty(isFormDirty);
    }, [editedTitle, editedContent, editedUrl]);

    useEffect(() => {
        if (saveAfterUpdate.current && hasUnsavedChanges && !isSaving) {
            saveAfterUpdate.current = false;
            const doSave = async () => {
                await save();
                setIsDirty(false);
                if (slugToNavigate.current) {
                    navigate(`/notes/${slugToNavigate.current}`);
                    slugToNavigate.current = null;
                }
            };
            doSave();
        }
    }, [hasUnsavedChanges, isSaving, save, navigate]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        const handleClick = (e) => {
            if (!isDirty) return;

            const target = e.target.closest('a');
            if (target && target.href) {
                const currentPath = window.location.pathname;
                const targetUrl = new URL(target.href);
                const targetPath = targetUrl.pathname;

                if (targetPath !== currentPath) {
                    e.preventDefault();
                    e.stopPropagation();

                    const confirmed = window.confirm(
                        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
                    );

                    if (confirmed) {
                        setIsDirty(false);
                        // Use setTimeout to allow state to update before navigation
                        setTimeout(() => {
                            window.location.href = target.href;
                        }, 0);
                    }
                }
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [isDirty]);

    const handleTitleChange = useCallback((e) => {
        const newTitle = e.target.value;
        setEditedTitle(newTitle);

        if (!urlManuallyEdited && isNewNote) {
            const autoUrl = toKebabCase(newTitle);
            setEditedUrl(autoUrl);
        }
    }, [isNewNote, urlManuallyEdited]);

    const handleContentChange = useCallback((e) => {
        const newContent = e.target.value;
        setEditedContent(newContent);
    }, []);

    const handleUrlChange = useCallback((e) => {
        const input = e.target.value;
        const sanitized = input.replace(/[^a-z0-9-]/g, '');
        setEditedUrl(sanitized);
        setUrlManuallyEdited(true);
    }, []);

    const handleSave = useCallback(async () => {
        setError('');

        if (!editedTitle.trim()) {
            setError('Title is required');
            return;
        }

        if (!editedUrl.trim()) {
            setError('URL is required');
            return;
        }

        if (!editedContent.trim()) {
            setError('Content is required');
            return;
        }

        const finalSlug = toKebabCase(editedUrl);

        if (finalSlug === 'new') {
            setError('The URL "new" is reserved. Please use a different URL.');
            return;
        }

        if (isNewNote || finalSlug !== slug) {
            if (notes[finalSlug]) {
                setError('A note with this URL already exists. Please use a different URL.');
                return;
            }
        }

        const noteData = {
            title: editedTitle.trim(),
            content: JSON.stringify([{ type: 'text', content: editedContent }]),
            createdAt: new Date().toISOString()
        };

        if (isNewNote) {
            const newNotes = {
                ...notes,
                [finalSlug]: noteData
            };

            const notesArray = Object.keys(notes);
            const orderedSlugs = notesOrder.length > 0
                ? [...notesOrder.filter(s => notes[s]), ...notesArray.filter(s => !notesOrder.includes(s))]
                : notesArray;
            const newOrder = [...orderedSlugs, finalSlug];

            updateSection('notes', newNotes);
            updateSection('notesOrder', newOrder);

            saveAfterUpdate.current = true;
            slugToNavigate.current = finalSlug;
        } else {
            if (finalSlug !== slug) {
                const { [slug]: _, ...remainingNotes } = notes;
                updateSection('notes', {
                    ...remainingNotes,
                    [finalSlug]: noteData
                });

                const newOrder = notesOrder.map(s => s === slug ? finalSlug : s);
                updateSection('notesOrder', newOrder);

                saveAfterUpdate.current = true;
                slugToNavigate.current = finalSlug;

                initialTitle.current = editedTitle.trim();
                initialContent.current = editedContent;
                initialUrl.current = finalSlug;
            } else {
                updateSection('notes', {
                    ...notes,
                    [slug]: noteData
                });

                saveAfterUpdate.current = true;

                initialTitle.current = editedTitle.trim();
                initialContent.current = editedContent;
            }
        }
    }, [editedTitle, editedContent, editedUrl, notes, slug, isNewNote, notesOrder, updateSection, navigate, save]);

    const handleBackClick = useCallback(() => {
        if (isDirty) {
            const confirmed = window
                .confirm('You have unsaved changes. Are you sure you want to leave? Your changes will be lost.');
            if (!confirmed) {
                return;
            }
        }
        navigate('/notes');
    }, [isDirty, navigate]);

    const isLoadingNote = isLoading || isLoadingNotes || !notesLoaded;

    const renderContent = () => {
        if (isLoadingNote && !isNewNote) {
            return (
                <div className="note-content">
                    <div className="notes-loading">
                        <svg className="notes-loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading note...</span>
                    </div>
                </div>
            );
        }

        if (!note && !isNewNote) {
            return (
                <div className="note-content">
                    <h1 className="note-title">Note not found</h1>
                </div>
            );
        }

        if (isNewNote || isEditMode) {
            return (
                <div className="note-content">
                    <div className="note-title-row">
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={handleTitleChange}
                            className="note-title note-title-input note-title-input-edit"
                            placeholder="title"
                        />
                        <button
                            onClick={handleSave}
                            disabled={!isDirty || isSaving}
                            className="edit-action-btn edit-action-btn-save"
                            title="Save note"
                        >
                            {isSaving ? (
                                <svg className="edit-action-btn-icon edit-action-btn-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            ) : (
                                <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={editedContent}
                        onChange={handleContentChange}
                        className="note-text note-content-textarea note-content-textarea-edit"
                        placeholder="write your note here..."
                    />
                </div>
            );
        }

        return (
            <div className="note-content">
                <h1 className="note-title">{note.title}</h1>
                {contentBlocks.map((block, index) => (
                    <pre key={index} className="note-text">
                        {block.content}
                    </pre>
                ))}
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="note-header-row">
                <button
                    onClick={handleBackClick}
                    className="note-back-btn"
                >
                    <svg className="note-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Notes
                </button>

                {(isNewNote || isEditMode) && (
                    <div className="note-url-container">
                        <span className="note-url-label">/notes/</span>
                        <input
                            type="text"
                            value={editedUrl}
                            onChange={handleUrlChange}
                            className="note-url-input"
                            placeholder="url"
                        />
                    </div>
                )}
            </div>

            {error && (
                <div className="note-error">
                    <svg className="note-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {renderContent()}
        </div>
    );
};

export default NotePage;
