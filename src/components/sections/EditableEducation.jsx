import { useState, useEffect, useRef } from 'react';
import EditableCard from '../EditableCard';
import LogoUploader from '../LogoUploader';

const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

const EditableEducation = ({ education = [], onChange }) => {
    const [expandedCards, setExpandedCards] = useState({});
    const [newCardIds, setNewCardIds] = useState(new Set());
    const initializedIds = useRef(new Set());
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [draggedCardHeight, setDraggedCardHeight] = useState(null);
    const [isDropping, setIsDropping] = useState(false);

    const allFolded = education.every(edu => !expandedCards[edu.id] && !newCardIds.has(edu.id));

    useEffect(() => {
        const currentIds = new Set(education.map(e => e.id));
        setNewCardIds(prev => {
            const updated = new Set([...prev].filter(id => currentIds.has(id)));
            return updated.size !== prev.size ? updated : prev;
        });
    }, [education]);

    const handleExpandChange = (id, expanded) => {
        setExpandedCards(prev => ({ ...prev, [id]: expanded }));
        if (!expanded && newCardIds.has(id)) {
            setNewCardIds(prev => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        }
    };

    const handleDragStart = (index, cardHeight) => {
        setDraggedIndex(index);
        setHoverIndex(index);
        setDraggedCardHeight(cardHeight);
    };

    const handleDragMove = (fromIndex, toIndex) => {
        setHoverIndex(toIndex);
    };

    const handleDragEnd = (fromIndex, toIndex) => {
        setIsDropping(true);

        setTimeout(() => {
            if (fromIndex !== toIndex) {
                const newEducation = [...education];
                const [draggedItem] = newEducation.splice(fromIndex, 1);
                newEducation.splice(toIndex, 0, draggedItem);
                onChange(newEducation);
            }

            setDraggedIndex(null);
            setHoverIndex(null);
            setDraggedCardHeight(null);
            setIsDropping(false);
        }, 200);
    };

    const handleDelete = (index) => {
        const confirmed = window
            .confirm('Are you sure you want to delete this education entry?');
        if (confirmed) {
            const newEducation = education.filter((_, i) => i !== index);
            onChange(newEducation);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const newEducation = [...education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        onChange(newEducation);
    };

    const handleArrayFieldChange = (index, field, value) => {
        const array = value
            .split(',').map((item) => item.trim()).filter((item) => item);
        handleFieldChange(index, field, array);
    };

    useEffect(() => {
        education.forEach(edu => {
            if (!initializedIds.current.has(edu.id)) {

                initializedIds.current.add(edu.id);
                if (!edu.degree && !edu.institution) {
                    setNewCardIds(prev => new Set([...prev, edu.id]));
                    setExpandedCards(prev => ({ ...prev, [edu.id]: true }));
                }
            }
        });
    }, [education]);

    return (
        <div className="editable-cards-list">
            {education.length === 0 ? (
                <p className="empty-state">
                    No education entries yet. Click + to add one.
                </p>
            ) : (
                education.map((edu, index) => {
                    const isNew = newCardIds.has(edu.id);
                    const isExpanded = isNew || expandedCards[edu.id] || false;

                    return (
                        <EditableCard
                            key={edu.id}
                            index={index}
                            onDelete={() => handleDelete(index)}
                            isNew={isNew}
                            isExpanded={isExpanded}
                            onExpandChange={(expanded) => handleExpandChange(edu.id, expanded)}
                            allFolded={allFolded}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            totalItems={education.length}
                            draggedIndex={draggedIndex}
                            hoverIndex={hoverIndex}
                            draggedCardHeight={draggedCardHeight}
                            isDropping={isDropping}
                            foldedContent={
                                <div className="card card-folded">
                                    <div className="card-folded-content">
                                        {edu.image && (
                                            <img
                                                src={edu.image}
                                                alt={`${edu.institution} logo`}
                                                className="card-logo card-logo-small"
                                            />
                                        )}
                                        <span className="card-folded-title">
                                            {edu.degree || edu.institution || 'Untitled Education'}
                                        </span>
                                    </div>
                                </div>
                            }
                        >
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        <LogoUploader
                                            logoUrl={edu.image || null}
                                            onChange={(newLogoUrl) => handleFieldChange(index, 'image', newLogoUrl)}
                                            apiKey={IMGBB_API_KEY}
                                            alt={`${edu.institution} logo`}
                                        />
                                        <div>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => handleFieldChange(index, 'degree', e.target.value)}
                                                className="editable-input card-title"
                                                placeholder="Degree"
                                            />
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => handleFieldChange(index, 'institution', e.target.value)}
                                                className="editable-input card-subtitle"
                                                placeholder="Institution"
                                            />
                                            <input
                                                type="text"
                                                value={edu.field || ''}
                                                onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
                                                className="editable-input card-description"
                                                placeholder="Field"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={edu.duration}
                                        onChange={(e) => handleFieldChange(index, 'duration', e.target.value)}
                                        className="editable-input card-meta card-meta-input"
                                        placeholder="Duration"
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={(edu.achievements || []).join(', ')}
                                        onChange={(e) => handleArrayFieldChange(index, 'achievements', e.target.value)}
                                        className="editable-input"
                                        placeholder="Achievement 1, Achievement 2"
                                    />
                                </div>
                            </div>
                        </EditableCard>
                    );
                })
            )}
        </div>
    );
};

export default EditableEducation;
