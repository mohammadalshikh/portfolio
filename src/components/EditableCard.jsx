import { useState } from 'react';

/**
 * Wrapper component for editable cards with drag-and-drop
 * 
 * @param {ReactNode} children - Card content
 * @param {function} onDelete - Delete handler
 * @param {function} onDragStart - Drag start handler
 * @param {function} onDragOver - Drag over handler
 * @param {function} onDrop - Drop handler
 * @param {boolean} isDraggable - Whether card is draggable
 * @param {number} index - Card index
 */
const EditableCard = ({
    children,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    isDraggable = true,
    index
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        onDragStart?.(e, index);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        onDragOver?.(e, index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        onDrop?.(e, index);
    };

    return (
        <div
            className={`editable-card-wrapper ${isDragging ? 'editable-card-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isDraggable && (
                <button
                    draggable={true}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="editable-card-drag-handle"
                    aria-label="Drag to reorder"
                >
                    <svg className="editable-card-drag-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            )}

            <button
                onClick={onDelete}
                className="editable-card-delete"
                title="Delete"
                aria-label="Delete card"
            >
                <svg className="editable-card-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {children}
        </div>
    );
};

export default EditableCard;
