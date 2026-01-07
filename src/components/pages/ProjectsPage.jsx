import { useEditMode } from '../../contexts/EditModeContext';
import EditableProjects from '../sections/EditableProjects';
import ImageGallery from '../ImageGallery';

/**
 * ProjectsPage - Page displaying projects portfolio
 */
const ProjectsPage = () => {
    const { isEditMode, data, updateSection, hasUnsavedChanges, undo, save, isSaving } = useEditMode();
    const { projects = [] } = data;

    const handleAddProject = () => {
        const newEntry = {
            id: Date.now(),
            name: '',
            description: '',
            technologies: [],
            link: null,
            github: null,
            screenshots: []
        };
        updateSection('projects', [newEntry, ...projects]);
    };

    return (
        <div className="page-container">
            {isEditMode ? (
                <div className="page-heading-row">
                    <h1 className="page-heading">Projects</h1>
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
                        <button onClick={handleAddProject} className="edit-action-btn edit-action-btn-add" title="Add project">
                            <svg className="edit-action-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <h1 className="page-heading page-heading-static">Projects</h1>
            )}

            {isEditMode ? (
                <EditableProjects
                    projects={projects}
                    onChange={(newProjects) => updateSection('projects', newProjects)}
                />
            ) : (
                <div>
                    {projects.length === 0 ? (
                        <p className="empty-state">No projects yet.</p>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="card">
                                <h3 className="card-title">{project.name}</h3>
                                <p className="card-description">{project.description}</p>

                                {project.screenshots && project.screenshots.length > 0 && (
                                    <ImageGallery images={project.screenshots} />
                                )}

                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="tech-tags">
                                        {project.technologies.map((tech, idx) => (
                                            <span key={idx} className="tech-tag">{tech}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="links-container">
                                    {project.link && (
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-btn"
                                        >
                                            <svg className="link-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Live Demo
                                        </a>
                                    )}
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-btn"
                                        >
                                            <svg className="link-btn-icon" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                            </svg>
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
