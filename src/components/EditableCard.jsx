import { useState, useRef, useEffect, useCallback } from 'react';

const EditableCard = ({
    children,
    foldedContent,
    onDelete,
    index,
    isNew = false,
    isExpanded: controlledExpanded,
    onExpandChange,
    allFolded = false,
    onDragStart,
    onDragMove,
    onDragEnd,
    totalItems = 0,
    draggedIndex = null,
    hoverIndex = null,
    draggedCardHeight = null,
    isDropping = false
}) => {
    const [internalExpanded, setInternalExpanded] = useState(isNew);
    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const cardRef = useRef(null);
    const dragStartY = useRef(0);
    const dragStartIndex = useRef(index);
    const currentHoverIndex = useRef(index);
    const cardHeight = useRef(0);
    const isDraggingRef = useRef(false);
    const justFinishedDragging = useRef(false);

    useEffect(() => {
        if (!isDraggingRef.current) {
            dragStartIndex.current = index;
            currentHoverIndex.current = index;
        }
    }, [index]);

    useEffect(() => {
        if (draggedIndex === null && isDragging) {
            setIsDragging(false);
            setDragOffset(0);
        }
    }, [draggedIndex, isDragging]);

    const handleExpandToggle = () => {
        const newExpanded = !isExpanded;
        if (onExpandChange) {
            onExpandChange(newExpanded);
        } else {
            setInternalExpanded(newExpanded);
        }
    };

    const canDrag = allFolded && !isExpanded;

    const handleMouseMove = useCallback((e) => {
        if (!isDraggingRef.current) return;

        const deltaY = e.clientY - dragStartY.current;
        setDragOffset(deltaY);

        const itemsMoved = Math.round(deltaY / (cardHeight.current + 12));
        const newHoverIndex = Math.max(0, Math.min(totalItems - 1, dragStartIndex.current + itemsMoved));

        if (newHoverIndex !== currentHoverIndex.current) {
            currentHoverIndex.current = newHoverIndex;
            if (onDragMove) {
                onDragMove(dragStartIndex.current, newHoverIndex);
            }
        }
    }, [totalItems, onDragMove]);

    const handleMouseUp = useCallback(() => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const fromIndex = dragStartIndex.current;
        const toIndex = currentHoverIndex.current;

        const wasDragging = isDraggingRef.current;
        isDraggingRef.current = false;

        if (wasDragging && onDragEnd) {
            justFinishedDragging.current = true;
            onDragEnd(fromIndex, toIndex);

            setTimeout(() => {
                justFinishedDragging.current = false;
            }, 100);
        }
    }, [handleMouseMove, onDragEnd]);

    const handleMouseDown = (e) => {
        if (e.target.closest('button')) return;

        const mouseDownPos = { x: e.clientX, y: e.clientY };
        const mouseDownTime = Date.now();

        if (!canDrag) return;

        const rect = cardRef.current.getBoundingClientRect();
        cardHeight.current = rect.height;
        dragStartY.current = e.clientY;
        dragStartIndex.current = index;
        currentHoverIndex.current = index;

        const dragDelay = setTimeout(() => {
            isDraggingRef.current = true;
            setIsDragging(true);
            setDragOffset(0);

            if (onDragStart) {
                onDragStart(index, cardHeight.current, cardHeight.current);
            }
        }, 150);

        const handleMouseMoveStart = (moveEvent) => {
            const deltaX = Math.abs(moveEvent.clientX - mouseDownPos.x);
            const deltaY = Math.abs(moveEvent.clientY - mouseDownPos.y);

            if (deltaX > 5 || deltaY > 5) {
                clearTimeout(dragDelay);
                if (!isDraggingRef.current) {
                    isDraggingRef.current = true;
                    setIsDragging(true);
                    setDragOffset(0);

                    if (onDragStart) {
                        onDragStart(index, cardHeight.current, cardHeight.current);
                    }
                }
            }
        };

        const handleMouseUpLocal = () => {
            clearTimeout(dragDelay);
            document.removeEventListener('mousemove', handleMouseMoveStart);
            document.removeEventListener('mouseup', handleMouseUpLocal);
        };

        document.addEventListener('mousemove', handleMouseMoveStart);
        document.addEventListener('mouseup', handleMouseUpLocal);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTouchStart = (e) => {
        if (!canDrag) return;
        if (e.target.closest('button')) return;

        const touch = e.touches[0];
        const rect = cardRef.current.getBoundingClientRect();
        cardHeight.current = rect.height;
        dragStartY.current = touch.clientY;
        dragStartIndex.current = index;
        currentHoverIndex.current = index;

        isDraggingRef.current = true;
        setIsDragging(true);
        setDragOffset(0);

        if (onDragStart) {
            onDragStart(index);
        }
    };

    const handleTouchMove = (e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();

        const touch = e.touches[0];
        const deltaY = touch.clientY - dragStartY.current;
        setDragOffset(deltaY);

        const itemsMoved = Math.round(deltaY / (cardHeight.current + 12)); // 12px gap
        const newHoverIndex = Math.max(0, Math.min(totalItems - 1, dragStartIndex.current + itemsMoved));

        if (newHoverIndex !== currentHoverIndex.current) {
            currentHoverIndex.current = newHoverIndex;
            if (onDragMove) {
                onDragMove(dragStartIndex.current, newHoverIndex);
            }
        }
    };

    const handleTouchEnd = () => {
        const fromIndex = dragStartIndex.current;
        const toIndex = currentHoverIndex.current;

        isDraggingRef.current = false;

        if (onDragEnd) {
            onDragEnd(fromIndex, toIndex);
        }
    };

    const getVisualOffset = () => {
        if (draggedIndex === null || hoverIndex === null) return 0;
        if (index === draggedIndex) return 0;

        const gap = 20.8;
        const cardHeightWithGap = draggedCardHeight ? draggedCardHeight + gap : 72;

        if (draggedIndex < hoverIndex) {
            if (index > draggedIndex && index <= hoverIndex) {
                return -cardHeightWithGap;
            }
        }
        else if (draggedIndex > hoverIndex) {
            if (index >= hoverIndex && index < draggedIndex) {
                return cardHeightWithGap;
            }
        }
        return 0;
    };

    const visualOffset = getVisualOffset();

    const getDropTargetOffset = () => {
        if (!isDropping || draggedIndex === null || hoverIndex === null) return 0;
        if (index !== draggedIndex) return 0;

        const gap = 20.8;
        const cardHeightWithGap = draggedCardHeight ? draggedCardHeight + gap : 72;
        const slotsToMove = hoverIndex - draggedIndex;
        return slotsToMove * cardHeightWithGap;
    };

    const dropTargetOffset = getDropTargetOffset();

    const isThisCardBeingDragged = draggedIndex === index;

    const getCardStyle = () => {
        if (isThisCardBeingDragged && isDropping) {
            return {
                transform: `translateY(${dropTargetOffset}px)`,
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

        if (draggedIndex !== null) {
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

    const cardStyle = getCardStyle();

    return (
        <div
            ref={cardRef}
            className={`editable-card-wrapper ${isDragging ? 'editable-card-dragging' : ''} ${isExpanded ? 'editable-card-expanded' : 'editable-card-folded'} ${canDrag ? 'editable-card-draggable' : ''}`}
            style={cardStyle}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
                if (isDragging || isDraggingRef.current || justFinishedDragging.current) return;
                const target = e.target;
                if (target.closest('button, input, textarea, select, a, [contenteditable="true"]')) return;
                if (!isExpanded) {
                    handleExpandToggle();
                }
            }}
        >
            <div className="editable-card-actions">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="editable-card-delete"
                    title="Delete"
                    aria-label="Delete card"
                >
                    <svg className="editable-card-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div
                    className="editable-card-fold-header"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <svg
                        className="editable-card-fold-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isDragging || isDraggingRef.current || justFinishedDragging.current) return;
                            handleExpandToggle();
                        }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </div>
            )}

            <div className="editable-card-content">
                {isExpanded ? children : foldedContent}
            </div>
        </div>
    );
};

export default EditableCard;
