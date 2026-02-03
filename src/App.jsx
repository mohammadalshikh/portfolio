import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/pages/LandingPage';
import ExperiencePage from './components/pages/ExperiencePage';
import ProjectsPage from './components/pages/ProjectsPage';
import PasswordModal from './components/PasswordModal';
import { EditModeProvider } from './contexts/EditModeContext';
import { fallbackData } from './fallback/fallbackData';
import { recordVisit } from './services/analyticsService';

function AppContent() {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
