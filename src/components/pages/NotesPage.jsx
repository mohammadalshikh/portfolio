import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '../../contexts/EditModeContext';
import NoteModal from '../NoteModal';

const toKebabCase = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};


const NotesPage = () => {
    const { isEditMode, data, updateSection, hasUnsavedChanges, undo, save, isSaving, loadNotes, isLoading, isLoadingNotes, notesLoaded } = useEditMode();
    const { notes = {}, notesOrder = [] } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const [isDragging, setIsDragging] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isDropping, setIsDropping] = useState(false);
    const [draggedCardHeight, setDraggedCardHeight] = useState(null);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartY = useRef(0);
    const cardRefs = useRef({});
    const containerRef = useRef(null);
    const holdTimerRef = useRef(null);
    const isHoldingRef = useRef(false);
    const mouseDownPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const notesArray = (() => {
        const allSlugs = Object.keys(notes);

        const orderedSlugs = notesOrder.length > 0
            ? [...notesOrder.filter(slug => notes[slug]), ...allSlugs.filter(slug => !notesOrder.includes(slug))]
            : allSlugs;
        return orderedSlugs.map(slug => ({ slug, ...notes[slug] }));
    })();

    const handleAddNote = (newNote) => {
        let slug = newNote.url ? toKebabCase(newNote.url) : toKebabCase(newNote.title);

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

        const newOrder = [slug, ...notesArray.map(n => n.slug)];
        updateSection('notesOrder', newOrder);

        setIsModalOpen(false);

        navigate(`/notes/${slug}`);
    };

    const handleDeleteNote = (slug) => {
        const confirmed = window
            .confirm('Are you sure you want to delete this note?');
        if (confirmed) {
            const { [slug]: _, ...remainingNotes } = notes;
            updateSection('notes', remainingNotes);

            const newOrder = notesArray
                .filter(n => n.slug !== slug).map(n => n.slug);
            updateSection('notesOrder', newOrder);
        }
    };

    const handleNoteClick = (slug) => {
        if (!isDragging && !isHoldingRef.current) {
            navigate(`/notes/${slug}`);
        }
    };

    const handleMouseDown = useCallback((e, index) => {
        if (!isEditMode) return;

        mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
        dragStartY.current = e.clientY;

        const card = cardRefs.current[index];
        const cardHeight = card ? card.getBoundingClientRect().height : 60;

        holdTimerRef.current = setTimeout(() => {
            isHoldingRef.current = true;
            setIsDragging(true);
            setDragIndex(index);
            setHoverIndex(index);
            setDraggedCardHeight(cardHeight);
            setDragOffset(0);
        }, 150);
    }, [isEditMode]);

    const handleMouseMove = useCallback((e) => {
        if (holdTimerRef.current && !isDragging) {
            const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
            const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
            if (dx > 5 || dy > 5) {
                clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
            }
            return;
        }

        if (!isDragging || dragIndex === null) return;

        const deltaY = e.clientY - dragStartY.current;
        setDragOffset(deltaY);

        const gap = 16; // Gap between cards
        const cardHeightWithGap = (draggedCardHeight || 60) + gap;
        const itemsMoved = Math.round(deltaY / cardHeightWithGap);
        const newHoverIndex = Math.max(0, Math.min(notesArray.length - 1, dragIndex + itemsMoved));

        if (newHoverIndex !== hoverIndex) {
            setHoverIndex(newHoverIndex);
        }
    }, [isDragging, dragIndex, hoverIndex, draggedCardHeight, notesArray.length]);

    const handleMouseUp = useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }

        if (!isDragging || dragIndex === null || hoverIndex === null) {
            isHoldingRef.current = false;
            setIsDragging(false);
            setDragIndex(null);
            setHoverIndex(null);
            return;
        }

        const fromIndex = dragIndex;
        const toIndex = hoverIndex;

        setIsDropping(true);

        setTimeout(() => {
            if (fromIndex !== toIndex) {
                const newOrder = [...notesArray.map(n => n.slug)];
                const [draggedSlug] = newOrder.splice(fromIndex, 1);
                newOrder.splice(toIndex, 0, draggedSlug);
                updateSection('notesOrder', newOrder);
            }

            isHoldingRef.current = false;
            setIsDragging(false);
            setDragIndex(null);
            setHoverIndex(null);
            setIsDropping(false);
            setDraggedCardHeight(null);
            setDragOffset(0);
        }, 200);
    }, [isDragging, dragIndex, hoverIndex, notesArray, updateSection]);

    const handleTouchStart = useCallback((e, index) => {
        if (!isEditMode) return;
        const touch = e.touches[0];

        mouseDownPosRef.current = { x: touch.clientX, y: touch.clientY };
        dragStartY.current = touch.clientY;

        const card = cardRefs.current[index];
        const cardHeight = card ? card.getBoundingClientRect().height : 60;

        holdTimerRef.current = setTimeout(() => {
            isHoldingRef.current = true;
            setIsDragging(true);
            setDragIndex(index);
            setHoverIndex(index);
            setDraggedCardHeight(cardHeight);
            setDragOffset(0);
        }, 150);
    }, [isEditMode]);

    const handleTouchMove = useCallback((e) => {
        if (holdTimerRef.current && !isDragging) {
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - mouseDownPosRef.current.x);
            const dy = Math.abs(touch.clientY - mouseDownPosRef.current.y);
            if (dx > 5 || dy > 5) {
                clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
            }
            return;
        }

        if (!isDragging || dragIndex === null) return;
        e.preventDefault();
        const touch = e.touches[0];

        const deltaY = touch.clientY - dragStartY.current;
        setDragOffset(deltaY);

        const gap = 16;
        const cardHeightWithGap = (draggedCardHeight || 60) + gap;
        const itemsMoved = Math.round(deltaY / cardHeightWithGap);
        const newHoverIndex = Math.max(0, Math.min(notesArray.length - 1, dragIndex + itemsMoved));

        if (newHoverIndex !== hoverIndex) {
            setHoverIndex(newHoverIndex);
        }
    }, [isDragging, dragIndex, hoverIndex, draggedCardHeight, notesArray.length]);

    const handleTouchEnd = useCallback(() => {
        handleMouseUp();
    }, [handleMouseUp]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    const existingSlugs = Object.keys(notes);

    const getVisualOffset = (actualIndex) => {
        if (dragIndex === null || hoverIndex === null) return 0;
        if (actualIndex === dragIndex) return 0;

        const gap = 16;
        const cardHeightWithGap = (draggedCardHeight || 60) + gap;

        if (dragIndex < hoverIndex) {
            if (actualIndex > dragIndex && actualIndex <= hoverIndex) {
                return -cardHeightWithGap;
            }
        }
        else if (dragIndex > hoverIndex) {
            if (actualIndex >= hoverIndex && actualIndex < dragIndex) {
                return cardHeightWithGap;
            }
        }
        return 0;
    };

    const getDropTargetOffset = () => {
        if (!isDropping || dragIndex === null || hoverIndex === null) return 0;
        const gap = 16;
        const cardHeightWithGap = (draggedCardHeight || 60) + gap;
        const slotsToMove = hoverIndex - dragIndex;
        return slotsToMove * cardHeightWithGap;
    };

    const getCardStyle = (index) => {
        const isThisCardBeingDragged = dragIndex === index;
        const visualOffset = getVisualOffset(index);

        if (isThisCardBeingDragged && isDropping) {
            return {
                transform: `translateY(${getDropTargetOffset()}px)`,
                zIndex: 100,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            };
        }

        if (isThisCardBeingDragged && isDragging) {
            return {
                transform: `translateY(${dragOffset}px)`,
                zIndex: 100,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                transition: 'box-shadow 0.2s ease'
            };
        }

        if (isDropping) {
            return {
                transform: visualOffset !== 0 ? `translateY(${visualOffset}px)` : 'none',
                transition: 'none'
            };
        }

        if (dragIndex !== null) {
            return {
                transform: visualOffset !== 0 ? `translateY(${visualOffset}px)` : 'none',
                transition: 'transform 0.2s ease'
            };
        }

        return {
            transform: 'none',
            transition: 'none'
        };
    };

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

            <div className="notes-grid" ref={containerRef}>
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
                    notesArray.map((note, index) => {
                        const isBeingDragged = dragIndex === index;

                        return (
                            <div
                                key={note.slug}
                                ref={(el) => cardRefs.current[index] = el}
                                className={`note-card-wrapper ${isEditMode ? 'note-card-draggable' : ''} ${isBeingDragged && isDragging ? 'note-card-dragging' : ''}`}
                                style={getCardStyle(index)}
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                onTouchStart={(e) => handleTouchStart(e, index)}
                            >
                                {isEditMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNote(note.slug);
                                        }}
                                        className="editable-card-delete"
                                        title="Delete note"
                                        onMouseDown={(e) => e.stopPropagation()}
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
                        );
                    })
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
