import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/pages/LandingPage';
import ExperiencePage from './components/pages/ExperiencePage';
import ProjectsPage from './components/pages/ProjectsPage';
import NotesPage from './components/pages/NotesPage';
import NotePage from './components/pages/NotePage';
import PasswordModal from './components/PasswordModal';
import { EditModeProvider, useEditMode } from './contexts/EditModeContext';
import { fallbackData } from './fallback/fallbackData';
import { recordVisit } from './services/analyticsService';

const ProtectedNotesRoute = ({ children }) => {
    const { canAccessNotes } = useEditMode();
    const location = useLocation();

    if (!canAccessNotes) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

function AppContent() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const { isEditMode } = useEditMode();

    useEffect(() => {
        recordVisit();
    }, []);

    const handleEditClick = () => {
        setIsPasswordModalOpen(true);
    };

    return (
        <div className="app-container">
            <Navbar onEditClick={handleEditClick} />

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/experience" element={<ExperiencePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route
                    path="/notes"
                    element={
                        <ProtectedNotesRoute>
                            <NotesPage />
                        </ProtectedNotesRoute>
                    }
                />
                <Route
                    path="/notes/:slug"
                    element={
                        <ProtectedNotesRoute>
                            <NotePage />
                        </ProtectedNotesRoute>
                    }
                />
                {/* Catch-all route - redirect unknown paths to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
}

function App() {
    return (
        <EditModeProvider initialData={fallbackData}>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </EditModeProvider>
    );
}

export default App;
