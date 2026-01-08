import { useState, useEffect } from 'react';
import { useEditMode } from '../contexts/EditModeContext';

/**
 * Entering/exiting edit mode
 */
const PasswordModal = ({ isOpen, onClose, isExitMode = false }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { enterEditMode, exitEditMode, binConnected } = useEditMode();

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isExitMode) {
            const success = exitEditMode();
            if (success) {
                onClose();
            }
        } else {
            const success = enterEditMode(password);
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

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
                <div className="modal-icon-wrapper">
                    <div className="modal-icon-bg">
                        {isExitMode ? (
                            <svg className="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        ) : (
                            <svg className="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                    </div>
                </div>

                <h2 className="modal-title">
                    {isExitMode ? 'Exit edit mode' : 'Enter edit mode'}
                </h2>

                {!isExitMode && (
                    <div className="modal-status">
                        <p className={`modal-status-text ${binConnected ? 'modal-status-connected' : 'modal-status-disconnected'}`}>
                            {binConnected ? '● Connected' : '● Disconnected'}
                        </p>
                    </div>
                )}

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
                        <button
                            type="submit"
                            className={`modal-btn ${isExitMode ? 'modal-btn-danger' : 'modal-btn-primary'}`}
                        >
                            {isExitMode ? 'Exit' : 'Unlock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
