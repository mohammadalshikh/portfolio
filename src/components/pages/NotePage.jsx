import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';

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
    const { data, isEditMode, updateSection, loadNotes, isLoading, isLoadingNotes, notesLoaded } = useEditMode();
    const { notes = {} } = data;

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const note = notes[slug];
    const contentBlocks = note ? parseNoteContent(note.content) : [];

    const [editedTitle, setEditedTitle] = useState(note?.title || '');
    const [editedContent, setEditedContent] = useState(getPlainText(contentBlocks));

    useEffect(() => {
        if (note) {
            setEditedTitle(note.title);
            setEditedContent(getPlainText(parseNoteContent(note.content)));
        }
    }, [note]);

    const handleTitleChange = useCallback((e) => {
        const newTitle = e.target.value;
        setEditedTitle(newTitle);

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

        const contentArray = [{ type: 'text', content: newContent }];
        updateSection('notes', {
            ...notes,
            [slug]: {
                ...notes[slug],
                content: JSON.stringify(contentArray)
            }
        });
    }, [notes, slug, updateSection]);

    const isLoadingNote = isLoading || isLoadingNotes || !notesLoaded;

    const renderContent = () => {
        if (isLoadingNote) {
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

        if (!note) {
            return (
                <div className="note-content">
                    <h1 className="note-title">Note not found</h1>
                </div>
            );
        }

        return (
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
        );
    };

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

            {renderContent()}
        </div>
    );
};

export default NotePage;
