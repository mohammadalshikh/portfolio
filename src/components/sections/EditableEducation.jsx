import { useState } from 'react';
import EditableCard from '../EditableCard';
import LogoUploader from '../LogoUploader';

const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

/**
 * Edit mode version of Education section
 */
const EditableEducation = ({ education = [], onChange }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
    };

    const handleDrop = (e, dropIndex) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        const newEducation = [...education];
        const [draggedItem] = newEducation.splice(draggedIndex, 1);
        newEducation.splice(dropIndex, 0, draggedItem);
        onChange(newEducation);
        setDraggedIndex(null);
    };

    const handleDelete = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this education entry?');
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
        const array = value.split(',').map((item) => item.trim()).filter((item) => item);
        handleFieldChange(index, field, array);
    };

    return (
        <div>
            {education.length === 0 ? (
                <p className="empty-state">No education entries yet. Click + to add one.</p>
            ) : (
                education.map((edu, index) => (
                    <EditableCard
                        key={edu.id}
                        index={index}
                        onDelete={() => handleDelete(index)}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
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
                ))
            )}
        </div>
    );
};

export default EditableEducation;
