import { useLayoutEffect, useRef, useState } from 'react';

const HighlightGallery = ({ images = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [navPlacement, setNavPlacement] = useState('bottom');
    const modalRef = useRef(null);
    const modalImageRef = useRef(null);

    if (!images || images.length === 0) {
        return null;
    }

    const openModal = (index) => {
        setCurrentIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const goToPrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            goToPrevious(e);
        } else if (e.key === 'ArrowRight') {
            goToNext(e);
        }
    };

    const updateNavPlacement = () => {
        const modal = modalRef.current;
        const modalImage = modalImageRef.current;

        if (!modal || !modalImage) {
            return;
        }

        const modalWidth = modal.clientWidth || window.innerWidth;
        const imageWidth = modalImage.getBoundingClientRect().width || modalImage.naturalWidth;
        const navButtonWidth = 72;
        const sideSpacing = 32;
        const requiredWidth = imageWidth + (navButtonWidth * 2) + sideSpacing;
        const nextPlacement = modalWidth >= requiredWidth ? 'side' : 'bottom';

        setNavPlacement((previousPlacement) => (
            previousPlacement === nextPlacement ? previousPlacement : nextPlacement
        ));
    };

    useLayoutEffect(() => {
        if (!isModalOpen || images.length <= 1) {
            return undefined;
        }

        updateNavPlacement();

        const resizeObserver = new ResizeObserver(() => {
            updateNavPlacement();
        });

        if (modalRef.current) {
            resizeObserver.observe(modalRef.current);
        }

        window.addEventListener('resize', updateNavPlacement);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateNavPlacement);
        };
    }, [isModalOpen, currentIndex, images.length]);

    return (
        <>
            <div className="highlight-gallery-container">
                <div className="highlight-gallery-thumbnails">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="highlight-gallery-thumbnail"
                            onClick={() => openModal(index)}
                        >
                            <img
                                src={image}
                                alt={`Screenshot ${index + 1}`}
                                className="highlight-gallery-thumbnail-img"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="highlight-gallery-modal"
                    ref={modalRef}
                    onClick={closeModal}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="dialog"
                    aria-modal="true"
                >
                    <button
                        className="highlight-gallery-modal-close"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {images.length > 1 && navPlacement === 'side' && (
                        <>
                            <button
                                className="highlight-gallery-modal-nav highlight-gallery-modal-nav-floating highlight-gallery-modal-nav-floating-left"
                                onClick={goToPrevious}
                                aria-label="Previous image"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                className="highlight-gallery-modal-nav highlight-gallery-modal-nav-floating highlight-gallery-modal-nav-floating-right"
                                onClick={goToNext}
                                aria-label="Next image"
                            >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    <div className="highlight-gallery-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="highlight-gallery-modal-stage">
                            <img
                                ref={modalImageRef}
                                src={images[currentIndex]}
                                alt={`Screenshot ${currentIndex + 1}`}
                                className="highlight-gallery-modal-img"
                                onLoad={updateNavPlacement}
                            />
                        </div>
                        {images.length > 1 && (
                            navPlacement === 'side' ? (
                                <div className="highlight-gallery-modal-counter">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            ) : (
                                <div className="highlight-gallery-modal-controls">
                                    <button
                                        className="highlight-gallery-modal-nav"
                                        onClick={goToPrevious}
                                        aria-label="Previous image"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    <div className="highlight-gallery-modal-counter">
                                        {currentIndex + 1} / {images.length}
                                    </div>

                                    <button
                                        className="highlight-gallery-modal-nav"
                                        onClick={goToNext}
                                        aria-label="Next image"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default HighlightGallery;
