import { useState, useEffect } from 'react';
import Planet from './components/Planet';
import Modal from './components/Modal';
import StarField from './components/StarField';
import TypingHeader from './components/TypingHeader';
import Experiences from './components/sections/Experiences';
import Education from './components/sections/Education';
import Projects from './components/sections/Projects';
import About from './components/sections/About';
import EditableAbout from './components/sections/EditableAbout';
import Contact from './components/sections/Contact';
import EditableExperiences from './components/sections/EditableExperiences';
import EditableEducation from './components/sections/EditableEducation';
import EditableProjects from './components/sections/EditableProjects';
import PasswordModal from './components/PasswordModal';
import EditModeActions from './components/EditModeActions';
import FormModal from './components/FormModal';
import { EditModeProvider, useEditMode } from './contexts/EditModeContext';
import { fallbackData } from './fallback/fallbackData';
import { recordVisit } from './services/analyticsService';

function AppContent() {
    const [activeModal, setActiveModal] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const { isEditMode, data, updateSection } = useEditMode();

    useEffect(() => {
        recordVisit();
    }, []);

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        window.scrollTo(0, 0);

        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const destinationsDesktop = [
        {
            id: 'experiences',
            name: 'Experience',
            color: 'orange',
            size: 160,
            position: { top: '33vh', left: '50%', transform: 'translateX(-50%)' }
        },
        {
            id: 'about',
            name: 'About Me',
            color: 'blue',
            size: 140,
            position: { top: '25vh', left: '12%' }
        },
        {
            id: 'contact',
            name: 'Contact',
            color: 'pink',
            size: 150,
            position: { top: '25vh', right: '12%' }
        },
        {
            id: 'education',
            name: 'Education',
            color: 'purple',
            size: 130,
            position: { top: '31vh', left: '27%' }
        },
        {
            id: 'projects',
            name: 'Projects',
            color: 'cyan',
            size: 120,
            position: { top: '31vh', right: '27%' }
        },
    ];

    const destinationsMobile = [
        destinationsDesktop.find(d => d.id === 'about'),
        destinationsDesktop.find(d => d.id === 'contact'),
        destinationsDesktop.find(d => d.id === 'education'),
        destinationsDesktop.find(d => d.id === 'experiences'),
        destinationsDesktop.find(d => d.id === 'projects'),
    ];

    const handlePlanetClick = (planetId) => {
        setActiveModal(planetId);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    const handleAsteroidClick = () => {
        setIsPasswordModalOpen(true);
    };

    const handleAddCard = () => {
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (newCard) => {
        switch (activeModal) {
            case 'experiences':
                updateSection('experiences', [newCard, ...data.experiences]);
                break;
            case 'education':
                updateSection('education', [newCard, ...data.education]);
                break;
            case 'projects':
                updateSection('projects', [newCard, ...data.projects]);
                break;
            default:
                break;
        }
    };

    const renderModalContent = () => {
        switch (activeModal) {
            case 'about':
                return isEditMode ? (
                    <EditableAbout
                        about={data.about}
                        onChange={(newAbout) =>
                            updateSection('about', newAbout)
                        } />
                ) : (
                    <About about={data.about} />
                );
            case 'experiences':
                return isEditMode ? (
                    <EditableExperiences
                        experiences={data.experiences}
                        onChange={(newExperiences) =>
                            updateSection('experiences', newExperiences)
                        }
                    />
                ) : (
                    <Experiences experiences={data.experiences} />
                );
            case 'education':
                return isEditMode ? (
                    <EditableEducation
                        education={data.education}
                        onChange={(newEducation) =>
                            updateSection('education', newEducation)
                        }
                    />
                ) : (
                    <Education education={data.education} />
                );
            case 'projects':
                return isEditMode ? (
                    <EditableProjects
                        projects={data.projects}
                        onChange={(newProjects) =>
                            updateSection('projects', newProjects)
                        }
                    />
                ) : (
                    <Projects projects={data.projects} />
                );
            case 'contact':
                return <Contact onClose={handleCloseModal} />;
            default:
                return null;
        }
    };

    const renderEditModeActions = () => {
        if (!isEditMode || activeModal === 'contact') {
            return null;
        }

        // Hide adding button for About
        if (activeModal === 'about') {
            return <EditModeActions onAdd={handleAddCard} showAdd={false} />;
        }

        return <EditModeActions onAdd={handleAddCard} />;
    };

    const getModalTitle = () => {
        const destination = destinationsDesktop.find(d => d.id === activeModal);
        return destination ? destination.name : '';
    };

    const getModalColor = () => {
        const destination = destinationsDesktop.find(d => d.id === activeModal);
        return destination ? destination.color : 'purple';
    };

    return (
        <div className="app-container">
            <StarField starCount={300} />

            <div className="app-planets-desktop">
                {destinationsDesktop.map(dest => (
                    <div
                        key={dest.id}
                        className="app-planet-wrapper"
                        style={{
                            top: dest.position.top,
                            left: dest.position.left,
                            right: dest.position.right,
                            bottom: dest.position.bottom,
                            transform: dest.position.transform
                        }}
                    >
                        <Planet
                            {...dest}
                            onClick={handlePlanetClick}
                            onAsteroidClick={dest.id === 'contact' ? handleAsteroidClick : undefined}
                        />
                    </div>
                ))}
            </div>

            <div className="app-planets-mobile">
                {destinationsMobile.map(dest => (
                    <div
                        key={dest.id}
                        className="app-planet-wrapper"
                    >
                        <Planet
                            {...dest}
                            size={Math.max(80, dest.size * 0.5)}
                            onClick={handlePlanetClick}
                            onAsteroidClick={dest.id === 'contact' ? handleAsteroidClick : undefined}
                        />
                    </div>
                ))}
            </div>

            <div className="app-stars">
                <TypingHeader />
            </div>

            {/* Content modal */}
            <Modal
                isOpen={activeModal !== null}
                onClose={handleCloseModal}
                title={getModalTitle()}
                color={getModalColor()}
                editModeActions={renderEditModeActions()}
            >
                {renderModalContent()}
            </Modal>

            {/* Password modal */}
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                isExitMode={isEditMode}
            />

            {/* Form modal */}
            <FormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                sectionType={activeModal}
                color={getModalColor()}
            />
        </div>
    );
}

function App() {
    return (
        <EditModeProvider initialData={fallbackData}>
            <AppContent />
        </EditModeProvider>
    );
}

export default App;
