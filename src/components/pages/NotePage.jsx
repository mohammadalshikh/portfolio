import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';

/**
 * Parse note content from JSON string
 * Returns array of content blocks: { type: 'text', content: string }
 */
const parseNoteContent = (contentString) => {
    try {
        return JSON.parse(contentString);
    } catch {
        return [{ type: 'text', content: contentString }];
    }
};

/**
 * Get plain text from content blocks
 */
const getPlainText = (contentBlocks) => {
    return contentBlocks.map(block => block.content).join('\n\n');
};

/**
 * Single note page
 */
const NotePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { data, isEditMode, updateSection, loadNotes, isLoading, isLoadingNotes, notesLoaded } = useEditMode();
    const { notes = {} } = data;

    // Load notes when page is visited directly
    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const note = notes[slug];
    const contentBlocks = note ? parseNoteContent(note.content) : [];

    const [editedTitle, setEditedTitle] = useState(note?.title || '');
    const [editedContent, setEditedContent] = useState(getPlainText(contentBlocks));

    // Update local state when note changes (e.g., after save)
    useEffect(() => {
        if (note) {
            setEditedTitle(note.title);
            setEditedContent(getPlainText(parseNoteContent(note.content)));
        }
    }, [note]);

    const handleTitleChange = useCallback((e) => {
        const newTitle = e.target.value;
        setEditedTitle(newTitle);

        // Update in context
        updateSection('notes', {
            ...notes,
            [slug]: {
                ...notes[slug],
                title: newTitle
            }
        });
    }, [notes, slug, updateSection]);

    const handleContentChange = useCallback((e) => {
        const newContent = e.target.value;
        setEditedContent(newContent);

        // Update in context - store as JSON array with single text block
        const contentArray = [{ type: 'text', content: newContent }];
        updateSection('notes', {
            ...notes,
            [slug]: {
                ...notes[slug],
                content: JSON.stringify(contentArray)
            }
        });
    }, [notes, slug, updateSection]);

    // Show loading spinner until notes are fully loaded
    if (isLoading || isLoadingNotes || !notesLoaded) {
        return (
            <div className="page-container">
                <div className="notes-loading">
                    <svg className="notes-loading-spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Loading notes...</span>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="page-container">
                <button
                    onClick={() => navigate('/notes')}
                    className="note-back-btn"
                >
                    <svg className="note-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Notes
                </button>
                <h1 className="page-heading page-heading-static">Note Not Found</h1>
                <p className="empty-state">The note you're looking for doesn't exist.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <button
                onClick={() => navigate('/notes')}
                className="note-back-btn"
            >
                <svg className="note-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Notes
            </button>

            <div className="note-content">
                {isEditMode ? (
                    <>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={handleTitleChange}
                            className="note-title note-title-input note-title-input-edit"
                            placeholder="Note title..."
                        />
                        <textarea
                            value={editedContent}
                            onChange={handleContentChange}
                            className="note-text note-content-textarea note-content-textarea-edit"
                            placeholder="Write your note here..."
                        />
                    </>
                ) : (
                    <>
                        <h1 className="note-title">{note.title}</h1>
                        {contentBlocks.map((block, index) => (
                            <pre key={index} className="note-text">
                                {block.content}
                            </pre>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotePage;
