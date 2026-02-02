import { useState, useEffect } from 'react';

/**
 * Convert string to kebab-case
 */
const toKebabCase = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

/**
 * Modal for creating a new note
 */
const NoteModal = ({ isOpen, onClose, onSubmit, existingSlugs = [] }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setUrl('');
            setContent('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        setUrl(toKebabCase(newTitle));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (!url.trim()) {
            setError('URL is required');
            return;
        }

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        // Check for duplicate URL/slug
        const slug = toKebabCase(url);
        if (existingSlugs.includes(slug)) {
            setError('A note with this URL already exists. Please use a different URL.');
            return;
        }

        onSubmit({
            title: title.trim(),
            url: slug,
            content: [{ type: 'text', content: content }]
        });
    };

    return (
        <div className="modal-overlay">
            <div className="note-modal-container">
                <button
                    type="button"
                    onClick={onClose}
                    className="note-modal-close"
                    aria-label="Close modal"
                >
                    <svg className="note-modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="modal-title">Create New Note</h2>

                <form onSubmit={handleSubmit} className="note-modal-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="title"
                            className="modal-input"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="url"
                            className="modal-input"
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note content here..."
                            className="note-modal-textarea"
                            rows={8}
                        />
                    </div>

                    {error && (
                        <div className="modal-error">
                            <svg className="modal-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="modal-buttons">
                        <button type="submit" className="modal-btn modal-btn-primary note-modal-submit">
                            Create Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteModal;
