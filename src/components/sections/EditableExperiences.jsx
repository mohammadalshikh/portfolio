import { useState, useEffect, useRef } from 'react';
import EditableCard from '../EditableCard';
import LogoUploader from '../LogoUploader';

const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

const EditableExperiences = ({ experiences = [], onChange }) => {
    const [expandedCards, setExpandedCards] = useState({});
    const [newCardIds, setNewCardIds] = useState(new Set());
    const initializedIds = useRef(new Set());
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [draggedCardHeight, setDraggedCardHeight] = useState(null);
    const [isDropping, setIsDropping] = useState(false);

    const allFolded = experiences.every(exp => !expandedCards[exp.id] && !newCardIds.has(exp.id));

    useEffect(() => {
        const currentIds = new Set(experiences.map(e => e.id));
        setNewCardIds(prev => {
            const updated = new Set([...prev].filter(id => currentIds.has(id)));
            return updated.size !== prev.size ? updated : prev;
        });
    }, [experiences]);

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
                const newExperiences = [...experiences];
                const [draggedItem] = newExperiences.splice(fromIndex, 1);
                newExperiences.splice(toIndex, 0, draggedItem);
                onChange(newExperiences);
            }

            setDraggedIndex(null);
            setHoverIndex(null);
            setDraggedCardHeight(null);
            setIsDropping(false);
        }, 200);
    };

    const handleDelete = (index) => {
        const confirmed = window
            .confirm('Are you sure you want to delete this experience?');
        if (confirmed) {
            const newExperiences = experiences.filter((_, i) => i !== index);
            onChange(newExperiences);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const newExperiences = [...experiences];
        newExperiences[index] = { ...newExperiences[index], [field]: value };
        onChange(newExperiences);
    };

    const handleTechnologiesBlur = (index, value) => {
        if (typeof value === 'string') {
            const array = value
                .split(',').map((item) => item.trim()).filter((item) => item);
            handleFieldChange(index, 'technologies', array);
        }
    };

    useEffect(() => {
        experiences.forEach(exp => {
            if (!initializedIds.current.has(exp.id)) {
                initializedIds.current.add(exp.id);
                if (!exp.position && !exp.company) {
                    setNewCardIds(prev => new Set([...prev, exp.id]));
                    setExpandedCards(prev => ({ ...prev, [exp.id]: true }));
                }
            }
        });
    }, [experiences]);

    return (
        <div className="editable-cards-list">
            {experiences.length === 0 ? (
                <p className="empty-state">
                    No experience entries yet. Click + to add one.
                </p>
            ) : (
                experiences.map((exp, index) => {
                    const isNew = newCardIds.has(exp.id);
                    const isExpanded = isNew || expandedCards[exp.id] || false;

                    return (
                        <EditableCard
                            key={exp.id}
                            index={index}
                            onDelete={() => handleDelete(index)}
                            isNew={isNew}
                            isExpanded={isExpanded}
                            onExpandChange={(expanded) => handleExpandChange(exp.id, expanded)}
                            allFolded={allFolded}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                            totalItems={experiences.length}
                            draggedIndex={draggedIndex}
                            hoverIndex={hoverIndex}
                            draggedCardHeight={draggedCardHeight}
                            isDropping={isDropping}
                            foldedContent={
                                <div className="card card-folded">
                                    <div className="card-folded-content">
                                        {exp.image && (
                                            <img
                                                src={exp.image}
                                                alt={`${exp.company} logo`}
                                                className="card-logo card-logo-small"
                                            />
                                        )}
                                        <span className="card-folded-title">
                                            {exp.position || exp.company || 'Untitled Experience'}
                                        </span>
                                    </div>
                                </div>
                            }
                        >
                            <div className="card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        <LogoUploader
                                            logoUrl={exp.image || null}
                                            onChange={(newLogoUrl) => handleFieldChange(index, 'image', newLogoUrl)}
                                            apiKey={IMGBB_API_KEY}
                                            alt={`${exp.company} logo`}
                                        />
                                        <div>
                                            <input
                                                type="text"
                                                value={exp.position}
                                                onChange={(e) => handleFieldChange(index, 'position', e.target.value)}
                                                className="editable-input card-title"
                                                placeholder="Position"
                                            />
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => handleFieldChange(index, 'company', e.target.value)}
                                                className="editable-input card-subtitle"
                                                placeholder="Company"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={exp.duration}
                                        onChange={(e) => handleFieldChange(index, 'duration', e.target.value)}
                                        className="editable-input card-meta card-meta-input"
                                        placeholder="Duration"
                                    />
                                </div>
                                <textarea
                                    value={exp.description || ''}
                                    onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                    className="editable-textarea"
                                    rows="2"
                                    placeholder="Description"
                                />
                                <div className="form-group">
                                    <input
                                        type="text"
                                        value={Array.isArray(exp.technologies) ? exp.technologies.join(', ') : exp.technologies || ''}
                                        onChange={(e) => handleFieldChange(index, 'technologies', e.target.value)}
                                        onBlur={(e) => handleTechnologiesBlur(index, e.target.value)}
                                        className="editable-input list"
                                        placeholder="Python, React"
                                    />
                                </div>
                                {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                                    <div className="tech-tags">
                                        {exp.technologies.map((tech, idx) => (
                                            <span key={idx} className="tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </EditableCard>
                    );
                })
            )}
        </div>
    );
};

export default EditableExperiences;
