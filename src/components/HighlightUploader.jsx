import { useState } from 'react';
import axios from 'axios';

const HighlightUploader = ({ images = [], onChange, apiKey, id }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [_dragCounter, setDragCounter] = useState(0);

    const inputId = `image-upload-input-${id || Math.random().toString(36).substr(2, 9)}`;

    const uploadToImageBB = async (file) => {
        if (!apiKey) {
            throw new Error('ImageBB API key is required. Please add IMGBB_API_KEY to your .env file');
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${apiKey}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.data.url;
    };

    const handleFileSelect = async (files) => {
        setError(null);
        setUploading(true);

        try {
            const uploadPromises = Array.from(files).map(file => {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error(`File ${file.name} is not an image`);
                }

                // Validate file size (max 32MB for ImageBB)
                if (file.size > 32 * 1024 * 1024) {
                    throw new Error(`File ${file.name} exceeds 32MB limit`);
                }

                return uploadToImageBB(file);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onChange([...images, ...uploadedUrls]);
        } catch (err) {
            setError(err.message || 'Failed to upload images');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        setDragCounter(0);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => {
            const newCount = prev + 1;
            if (newCount === 1) {
                setDragOver(true);
            }
            return newCount;
        });
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => {
            const newCount = prev - 1;
            if (newCount === 0) {
                setDragOver(false);
            }
            return newCount;
        });
    };

    const handleDelete = (index) => {
        const confirmed = window.confirm('Are you sure you want to delete this image?');
        if (confirmed) {
            const newImages = images.filter((_, i) => i !== index);
            onChange(newImages);
        }
    };

    const moveImage = (fromIndex, toIndex) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        onChange(newImages);
    };

    return (
        <div className="highlight-uploader-container">
            <div
                className={`highlight-uploader-dropzone ${dragOver ? 'highlight-uploader-dropzone-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="highlight-uploader-input"
                    id={inputId}
                    disabled={uploading}
                />
                <label htmlFor={inputId} className="highlight-uploader-dropzone-label">
                    {uploading ? (
                        <>
                            <svg className="highlight-uploader-spinner" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading...</span>
                        </>
                    ) : (
                        <>
                            <svg className="highlight-uploader-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Click to upload or drag and drop images</span>
                            <span className="highlight-uploader-hint">PNG, JPG, GIF up to 32MB</span>
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="highlight-uploader-error">
                    {error}
                </div>
            )}

            {images.length > 0 && (
                <div className="highlight-uploader-preview-container">
                    {images.map((image, index) => (
                        <div key={index} className="highlight-uploader-preview group">
                            <img
                                src={image}
                                alt={`Screenshot ${index + 1}`}
                                className="highlight-uploader-preview-img"
                            />
                            <div className="highlight-uploader-preview-controls">
                                {index > 0 && (
                                    <button
                                        onClick={() => moveImage(index, index - 1)}
                                        className="highlight-uploader-preview-btn"
                                        title="Move left"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}
                                {index < images.length - 1 && (
                                    <button
                                        onClick={() => moveImage(index, index + 1)}
                                        className="highlight-uploader-preview-btn"
                                        title="Move right"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="highlight-uploader-preview-btn highlight-uploader-preview-btn-delete"
                                    title="Delete"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HighlightUploader;
