import { useState, useEffect } from 'react';
import { useEditMode, ACCESS_MODES } from '../contexts/EditModeContext';

/**
 * Entering/exiting edit mode or view mode
 */
const PasswordModal = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [selectedMode, setSelectedMode] = useState(ACCESS_MODES.VIEW);
    const {
        enterAccessMode,
        exitAccessMode,
        switchAccessMode,
        isAuthenticated,
        accessMode,
        binConnected
    } = useEditMode();

    const isExitMode = isAuthenticated;

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
            setSelectedMode(isAuthenticated ? accessMode : ACCESS_MODES.VIEW);
        }
    }, [isOpen, isAuthenticated, accessMode]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleModeChange = (mode) => {
        if (isAuthenticated && mode !== accessMode) {
            const success = switchAccessMode(mode);
            if (success) {
                setSelectedMode(mode);
            }
        } else {
            // Not authenticated 
            setSelectedMode(mode);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isExitMode) {
            const success = exitAccessMode();
            if (success) {
                onClose();
            }
        } else {
            // Not authenticated
            const success = enterAccessMode(password, selectedMode);
            if (success) {
                onClose();
            } else {
                setError('Invalid password');
                setPassword('');
            }
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const EditIcon = () => (
        <svg className="mode-selector-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    const ViewIcon = () => (
        <svg className="mode-selector-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-mode-selector">
                    <button
                        type="button"
                        className={`mode-selector-btn ${selectedMode === ACCESS_MODES.VIEW ? 'mode-selector-btn-active' : ''}`}
                        onClick={() => handleModeChange(ACCESS_MODES.VIEW)}
                        title="View Mode"
                        aria-label="View Mode"
                    >
                        <ViewIcon />
                    </button>
                    <button
                        type="button"
                        className={`mode-selector-btn ${selectedMode === ACCESS_MODES.EDIT ? 'mode-selector-btn-active' : ''}`}
                        onClick={() => handleModeChange(ACCESS_MODES.EDIT)}
                        title="Edit Mode"
                        aria-label="Edit Mode"
                    >
                        <EditIcon />
                    </button>
                </div>


                <div className="modal-status">
                    <p className={`modal-status-text ${binConnected ? 'modal-status-connected' : 'modal-status-disconnected'}`}>
                        {binConnected ? '● Connected' : '● Disconnected'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {!isExitMode && (
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="modal-input"
                                autoFocus
                            />
                            {error && (
                                <div className="modal-error">
                                    <svg className="modal-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-buttons">
                        <button type="button" onClick={onClose} className="modal-btn modal-btn-cancel">
                            Cancel
                        </button>
                        {isExitMode ? (
                            <button
                                type="submit"
                                className="modal-btn modal-btn-danger"
                            >
                                Exit
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="modal-btn modal-btn-primary"
                            >
                                Unlock
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
