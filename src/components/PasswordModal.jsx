import { useState, useEffect } from 'react';
import { useEditMode } from '../contexts/EditModeContext';

/**
 * PasswordModal - Modal for entering/exiting edit mode
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {boolean} isExitMode - True if exiting edit mode, false if entering
 */
const PasswordModal = ({ isOpen, onClose, isExitMode = false }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { enterEditMode, exitEditMode, binConnected } = useEditMode();

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    // Close on escape
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
            // Exit edit mode
            const success = exitEditMode();
            if (success) {
                onClose();
            }
        } else {
            // Enter edit mode
            const success = enterEditMode(password);
            if (success) {
                onClose();
                setError('');
            } else {
                setError('Incorrect password. Please try again.');
                setPassword('');
            }
        }
    };

    return (
        <div
            className="password-modal-overlay"
            onClick={onClose}
        >
            <div
                className="password-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="password-modal-icon-wrapper">
                    <div className="password-modal-icon-bg">
                        {isExitMode ? (
                            <svg className="password-modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        ) : (
                            <svg className="password-modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        )}
                    </div>
                </div>

                <h2 className="password-modal-title">
                    {isExitMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </h2>

                {!isExitMode && (
                    <div className="password-modal-status">
                        <p className={`password-modal-status-text ${binConnected ? 'password-modal-status-connected' : 'password-modal-status-disconnected'}`}>
                            {binConnected ? '● Bin enabled' : '● Bin disabled'}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="password-modal-form">
                    {!isExitMode && (
                        <div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="password-modal-input"
                                placeholder="Enter password"
                                autoFocus
                                required
                            />
                            {error && (
                                <p className="password-modal-error">
                                    <svg className="password-modal-error-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="password-modal-buttons">
                        <button
                            type="button"
                            onClick={onClose}
                            className="password-modal-button-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={isExitMode ? 'password-modal-button-exit' : 'password-modal-button-unlock'}
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
