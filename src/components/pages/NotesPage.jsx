import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';
import NoteModal from '../NoteModal';

/**
 * Convert string to kebab-case
 */
const toKebabCase = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

/**
 * Notes listing page
 */
const NotesPage = () => {
    const { isEditMode, data, updateSection, hasUnsavedChanges, undo, save, isSaving, loadNotes, isLoading, isLoadingNotes, notesLoaded } = useEditMode();
    const { notes = {} } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Load notes when page is visited
    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const notesArray = Object.entries(notes).map(([slug, note]) => ({
        slug,
        ...note
    }));

    const handleAddNote = (newNote) => {
        // Generate slug from title or use custom URL
        let slug = newNote.url ? toKebabCase(newNote.url) : toKebabCase(newNote.title);

        // Ensure unique slug
        let counter = 1;
        let baseSlug = slug;
        while (notes[slug]) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const noteData = {
            title: newNote.title,
            content: JSON.stringify(newNote.content),
            createdAt: new Date().toISOString()
        };

        updateSection('notes', {
            ...notes,
            [slug]: noteData
        });

        setIsModalOpen(false);

        // Navigate to the new note page
        navigate(`/notes/${slug}`);
    };

    const handleDeleteNote = (slug) => {
        const confirmed = window.confirm('Are you sure you want to delete this note?');
        if (confirmed) {
            const { [slug]: _, ...remainingNotes } = notes;
            updateSection('notes', remainingNotes);
        }
    };

    const handleNoteClick = (slug) => {
        navigate(`/notes/${slug}`);
    };

    const existingSlugs = Object.keys(notes);

    return (
        <div className="page-container">
            {isEditMode ? (
                <div className="page-heading-row">
                    <h1 className="page-heading">Notes</h1>
                    <div className="edit-actions-bar">
                        <button
                            onClick={undo}
                            disabled={!hasUnsavedChanges}
                            className="edit-action-btn edit-action-btn-undo"
                            title="Undo changes"
                        >
                            <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </button>
                        <button
                            onClick={save}
                            disabled={!hasUnsavedChanges || isSaving}
                            className="edit-action-btn edit-action-btn-save"
                            title="Save changes"
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
                        <button onClick={() => setIsModalOpen(true)} className="edit-action-btn edit-action-btn-add" title="Add note">
                            <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <h1 className="page-heading page-heading-static">Notes</h1>
            )}

            <div className="notes-grid">
                {(isLoading || isLoadingNotes || !notesLoaded) ? (
                    <div className="notes-loading">
                        <svg className="notes-loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading notes...</span>
                    </div>
                ) : notesArray.length === 0 ? (
                    <p className="empty-state">No notes yet.</p>
                ) : (
                    notesArray.map((note) => (
                        <div key={note.slug} className="note-card-wrapper">
                            {isEditMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note.slug);
                                    }}
                                    className="editable-card-delete"
                                    title="Delete note"
                                >
                                    <svg className="editable-card-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            <div
                                className="note-card"
                                onClick={() => handleNoteClick(note.slug)}
                            >
                                <h3 className="note-card-title">{note.title}</h3>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddNote}
                existingSlugs={existingSlugs}
            />
        </div>
    );
};

export default NotesPage;
