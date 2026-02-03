import { useState, useRef } from 'react';
import axios from 'axios';
import { useEditMode } from '../contexts/EditModeContext';

const LogoUploader = ({ logoUrl, onChange, apiKey, alt = 'Logo' }) => {
    const { isEditMode } = useEditMode();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isEditMode) {
        return logoUrl ? (
            <img src={logoUrl} alt={alt} className="card-logo" />
        ) : null;
    }

    const uploadToImageBB = async (file) => {
        if (!apiKey) {
            throw new Error('ImageBB API key is required');
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

    const handleFileSelect = async (file) => {
        if (!file) return;

        setError(null);
        setUploading(true);

        try {
            if (!file.type.startsWith('image/')) {
                throw new Error('File is not an image');
            }

            if (file.size > 32 * 1024 * 1024) {
                throw new Error('File exceeds 32MB limit');
            }

            const uploadedUrl = await uploadToImageBB(file);
            onChange(uploadedUrl);
        } catch (err) {
            setError(err.message || 'Failed to upload logo');
            console.error('Logo upload error:', err);
            setTimeout(() => setError(null), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleLogoClick = () => {
        if (!uploading) {
            fileInputRef.current?.click();
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        const confirmed = window
            .confirm('Are you sure you want to delete this logo?');
        if (confirmed) {
            onChange(null);
        }
    };

    return (
        <div className="logo-uploader-wrapper">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="logo-uploader-input"
                disabled={uploading}
            />

            <div
                className={`logo-uploader-container ${uploading ? 'logo-uploader-uploading' : ''}`}
                onClick={handleLogoClick}
                title={uploading ? 'Uploading...' : 'Click to upload logo'}
            >
                {uploading ? (
                    <div className="logo-uploader-spinner-wrapper">
                        <svg className="logo-uploader-spinner" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : logoUrl ? (
                    <>
                        <img src={logoUrl} alt={alt} className="logo-uploader-image" />
                        <button
                            onClick={handleDelete}
                            className="logo-uploader-delete"
                            title="Delete logo"
                            aria-label="Delete logo"
                        >
                            <svg className="logo-uploader-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div className="logo-uploader-placeholder">
                        <svg className="logo-uploader-placeholder-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {error && (
                <div className="logo-uploader-error">
                    {error}
                </div>
            )}
        </div>
    );
};

export default LogoUploader;
