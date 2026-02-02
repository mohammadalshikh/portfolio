import { useState } from 'react';
import EditableCard from '../EditableCard';
import LogoUploader from '../LogoUploader';

const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

/**
 * Edit mode version of Experiences section
 */
const EditableExperiences = ({ experiences = [], onChange }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
    };

    const handleDrop = (e, dropIndex) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        const newExperiences = [...experiences];
        const [draggedItem] = newExperiences.splice(draggedIndex, 1);
        newExperiences.splice(dropIndex, 0, draggedItem);
        onChange(newExperiences);
        setDraggedIndex(null);
    };

    const handleDelete = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this experience?');
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
            const array = value.split(',').map((item) => item.trim()).filter((item) => item);
            handleFieldChange(index, 'technologies', array);
        }
    };

    return (
        <div>
            {experiences.length === 0 ? (
                <p className="empty-state">No experience entries yet. Click + to add one.</p>
            ) : (
                experiences.map((exp, index) => (
                    <EditableCard
                        key={exp.id}
                        index={index}
                        onDelete={() => handleDelete(index)}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
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
                ))
            )}
        </div>
    );
};

export default EditableExperiences;
