import { useEditMode } from '../../contexts/EditModeContext';
import EditableAbout from '../sections/EditableAbout';
import EditableEducation from '../sections/EditableEducation';
import Contact from '../sections/Contact';

const LandingPage = () => {
    const { isEditMode, data, updateSection, hasUnsavedChanges, undo, save, isSaving } = useEditMode();
    const { about = {}, education = [] } = data;

    const handleAddEducation = () => {
        const newEntry = {
            id: crypto.randomUUID(),
            institution: '',
            degree: '',
            field: '',
            duration: '',
            achievements: []
        };
        updateSection('education', [newEntry, ...education]);
    };

    return (
        <div className="page-container">
            {isEditMode ? (
                <div className="page-heading-row">
                    <h1 className="page-heading">Mohammad Alshikh</h1>
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
                    </div>
                </div>
            ) : (
                <h1 className="page-heading page-heading-static">Mohammad Alshikh</h1>
            )}

            {/* About Section */}
            {isEditMode ? (
                <EditableAbout
                    about={about}
                    onChange={(newAbout) => updateSection('about', newAbout)}
                />
            ) : (
                <>
                    {about.intro && (
                        <p className="section-text">{about.intro}</p>
                    )}
                </>
            )}

            {/* Skills Section */}
            <h2 className="section-heading">Skills</h2>
            {isEditMode ? (
                <>
                    <div className="form-group">
                        <input
                            type="text"
                            value={Array.isArray(about.skills) ? about.skills.join(', ') : about.skills || ''}
                            onChange={(e) => updateSection('about', { ...about, skills: e.target.value })}
                            onBlur={(e) => {
                                const value = e.target.value;
                                if (typeof value === 'string') {
                                    const array = value.split(',').map((item) => item.trim()).filter((item) => item);
                                    updateSection('about', { ...about, skills: array });
                                }
                            }}
                            className="editable-input list"
                            placeholder="Python, React"
                        />
                    </div>
                    {Array.isArray(about.skills) && about.skills.length > 0 && (
                        <div className="skill-tags">
                            {about.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="skill-tags">
                    {(about.skills || []).map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                </div>
            )}

            {/* Education Section */}
            {isEditMode ? (
                <div className="section-heading-row">
                    <h2 className="section-heading-inline">Education</h2>
                    <button onClick={handleAddEducation} className="edit-action-btn edit-action-btn-add" title="Add education">
                        <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            ) : (
                <h2 className="section-heading">Education</h2>
            )}

            {isEditMode ? (
                <EditableEducation
                    education={education}
                    onChange={(newEducation) => updateSection('education', newEducation)}
                />
            ) : (
                <div className="education-list">
                    {education.length === 0 ? (
                        <p className="empty-state">No education entries yet.</p>
                    ) : (
                        education.map((edu) => (
                            <div key={edu.id} className="card">
                                <div className="card-header">
                                    <div className="card-header-left">
                                        {edu.image && (
                                            <img
                                                src={edu.image}
                                                alt={`${edu.institution} logo`}
                                                className="card-logo"
                                            />
                                        )}
                                        <div>
                                            <h3 className="card-title">{edu.degree}</h3>
                                            <p className="card-subtitle">{edu.institution}</p>
                                            {edu.field && (
                                                <p className="card-description">{edu.field}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="card-meta">{edu.duration}</span>
                                </div>
                                {edu.achievements && edu.achievements.length > 0 && (
                                    <ul className="achievement-list">
                                        {edu.achievements.map((achievement, idx) => (
                                            <li key={idx} className="achievement-item">
                                                <span className="achievement-icon">▸</span>
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Contact Section */}
            <div>
                <h2 className="section-heading contact">Contact</h2>
                <Contact />
            </div>
        </div>
    );
};

export default LandingPage;
