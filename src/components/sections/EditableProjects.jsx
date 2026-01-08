import { useState } from 'react';
import EditableCard from '../EditableCard';
import HighlightUploader from '../HighlightUploader';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

/**
 * Edit mode version of Projects section
 */
const EditableProjects = ({ projects = [], onChange }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
    };

    const handleDrop = (e, dropIndex) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        const newProjects = [...projects];
        const [draggedItem] = newProjects.splice(draggedIndex, 1);
        newProjects.splice(dropIndex, 0, draggedItem);
        onChange(newProjects);
        setDraggedIndex(null);
    };

    const handleDelete = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this project?');
        if (confirmed) {
            const newProjects = projects.filter((_, i) => i !== index);
            onChange(newProjects);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        onChange(newProjects);
    };

    const handleTechnologiesBlur = (index, value) => {
        if (typeof value === 'string') {
            const array = value.split(',').map((item) => item.trim()).filter((item) => item);
            handleFieldChange(index, 'technologies', array);
        }
    };

    return (
        <div>
            {projects.length === 0 ? (
                <p className="empty-state">No projects yet. Click + to add one.</p>
            ) : (
                projects.map((project, index) => (
                    <EditableCard
                        key={project.id}
                        index={index}
                        onDelete={() => handleDelete(index)}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                    >
                        <div className="card">
                            <input
                                type="text"
                                value={project.name}
                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                className="editable-input card-title"
                                placeholder="Project"
                            />
                            <textarea
                                value={project.description || ''}
                                onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                className="editable-textarea"
                                rows="2"
                                placeholder="Description"
                            />

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || ''}
                                    onChange={(e) => handleFieldChange(index, 'technologies', e.target.value)}
                                    onBlur={(e) => handleTechnologiesBlur(index, e.target.value)}
                                    className="editable-input list"
                                    placeholder="Python, React"
                                />
                            </div>

                            {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                                <div className="tech-tags">
                                    {project.technologies.map((tech, idx) => (
                                        <span key={idx} className="tech-tag">{tech}</span>
                                    ))}
                                </div>
                            )}

                            <HighlightUploader
                                images={project.screenshots || []}
                                onChange={(newImages) => handleFieldChange(index, 'screenshots', newImages)}
                                apiKey={IMGBB_API_KEY}
                                id={`project-${project.id || index}`}
                            />

                            <div className="form-group">
                                <input
                                    type="url"
                                    value={project.link || ''}
                                    onChange={(e) => handleFieldChange(index, 'link', e.target.value)}
                                    className="editable-input"
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="url"
                                    value={project.github || ''}
                                    onChange={(e) => handleFieldChange(index, 'github', e.target.value)}
                                    className="editable-input"
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>

                            <div className="links-container">
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                                        <svg className="link-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Live Demo
                                    </a>
                                )}
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="link-btn">
                                        <svg className="link-btn-icon" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                        </svg>
                                        GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    </EditableCard>
                ))
            )}
        </div>
    );
};

export default EditableProjects;
