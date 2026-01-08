import { useEditMode } from '../../contexts/EditModeContext';
import EditableExperiences from '../sections/EditableExperiences';

/**
 * Job experiences
 */
const ExperiencePage = () => {
    const { isEditMode, data, updateSection, hasUnsavedChanges, undo, save, isSaving } = useEditMode();
    const { experiences = [] } = data;

    const handleAddExperience = () => {
        const newEntry = {
            id: Date.now(),
            company: '',
            position: '',
            duration: '',
            description: '',
            technologies: []
        };
        updateSection('experiences', [newEntry, ...experiences]);
    };

    return (
        <div className="page-container">
            {isEditMode ? (
                <div className="page-heading-row">
                    <h1 className="page-heading">Experience</h1>
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
                        <button onClick={handleAddExperience} className="edit-action-btn edit-action-btn-add" title="Add experience">
                            <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <h1 className="page-heading page-heading-static">Experience</h1>
            )}

            {isEditMode ? (
                <EditableExperiences
                    experiences={experiences}
                    onChange={(newExperiences) => updateSection('experiences', newExperiences)}
                />
            ) : (
                <div>
                    {experiences.length === 0 ? (
                        <p className="empty-state">No experience entries yet.</p>
                    ) : (
                        experiences.map((exp) => (
                            <div key={exp.id} className="card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        {exp.image && (
                                            <img
                                                src={exp.image}
                                                alt={`${exp.company} logo`}
                                                className="card-logo"
                                            />
                                        )}
                                        <div>
                                            <h3 className="card-title">{exp.position}</h3>
                                            <p className="card-subtitle">{exp.company}</p>
                                        </div>
                                    </div>
                                    <span className="card-meta">{exp.duration}</span>
                                </div>
                                <p className="card-description">{exp.description}</p>
                                {exp.technologies && exp.technologies.length > 0 && (
                                    <div className="tech-tags">
                                        {exp.technologies.map((tech, idx) => (
                                            <span key={idx} className="tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ExperiencePage;
