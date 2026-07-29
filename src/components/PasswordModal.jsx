import { useState, useEffect } from 'react';
import { useEditMode } from '../contexts/EditModeContext';

const PasswordModal = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {
        enterEditMode,
        exitEditMode,
        isEditMode,
        binConnected
    } = useEditMode();

    const isExitMode = isEditMode;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isExitMode) {
            const success = exitEditMode();
            if (success) {
                onClose();
            }
        } else {
            const success = await enterEditMode(password);
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
                        <svg className="modal-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
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
