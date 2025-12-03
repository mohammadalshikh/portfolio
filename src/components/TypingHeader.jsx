import { useState, useEffect, useRef } from 'react';
import typingSound from '../assets/typing.mp3';
import AstronautLogo from './AstronautLogo';
import heartSvg from '../assets/heart.svg?raw';

const primaryMessages = [
    `> Log ID: STARSHIP-042 |PAUSE|1000|PAUSE|

    > Date: ${new Date().toLocaleDateString()} |PAUSE|1000|PAUSE|

    > Location: Orbiting GitHub Nebula`,

    `Hi there, I'm Mohammad.|PAUSE|1000|PAUSE|
    Welcome to my digital space.`,

    "I hope you enjoy exploring my website. |PAUSE|500|PAUSE|Welcome aboard.|PAUSE|500|PAUSE|\n\n> END_LOG",
];

/**
 * TypingHeader - Header with typing animation and audio
 */
const TypingHeader = () => {

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [showArrow, setShowArrow] = useState(false);
    const [audioReady, setAudioReady] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const audioRef = useRef(null);
    const typingIntervalRef = useRef(null);
    const nameHeadingRef = useRef(null);

    // Set up ResizeObserver to track heading width
    useEffect(() => {
        if (!nameHeadingRef.current) return;

        const observer = new ResizeObserver(() => {
            if (nameHeadingRef.current) {
                const width = nameHeadingRef.current.offsetWidth;
                document.documentElement.style.setProperty('--title-width', `${width}px`);
            }
        });

        observer.observe(nameHeadingRef.current);

        // Initial measurement
        const width = nameHeadingRef.current.offsetWidth;
        document.documentElement.style.setProperty('--title-width', `${width}px`);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio(typingSound);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        // Wait for audio to be ready to play
        const handleCanPlay = () => {
            setAudioReady(true);
        };

        audioRef.current.addEventListener(
            'canplaythrough', handleCanPlay
        );

        // Also try loadeddata as backup
        audioRef.current.addEventListener('loadeddata', () => {
            setAudioReady(true);
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (audioReady &&
            !isTyping && displayedText && currentMessageIndex < primaryMessages.length) {
            setShowArrow(true);
        }
    }, [audioReady, isTyping, displayedText, currentMessageIndex]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');

        const handleChange = (e) => {
            setIsMobile(e.matches);
            if (e.matches) {
                // Stop typing on mobile
                if (isTyping) {
                    setIsTyping(false);
                    if (typingIntervalRef.current) {
                        clearInterval(typingIntervalRef.current);
                    }
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
            }
        };

        setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [isTyping]);

    useEffect(() => {
        if (!isTyping) return;
        if (isMobile) return;

        const currentMessages = primaryMessages
        const currentMessage = currentMessages[currentMessageIndex];

        // Check if message has pauses
        if (currentMessage.includes('|PAUSE|')) {

            // Split by |PAUSE| to get alternating text and pause
            const parts = currentMessage.split('|PAUSE|');

            let textSegments = [];
            let pauseDurations = [];

            for (let i = 0; i < parts.length; i++) {
                if (i % 2 === 0) {
                    textSegments.push(parts[i]); // text
                } else {
                    pauseDurations.push(parseInt(parts[i])); // pause
                }
            }

            let charIndex = 0;
            let segmentIndex = 0;
            let isPaused = false;
            let accumulatedText = '';

            // Start typing sound
            if (audioRef.current && !isMuted) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
                    .then(() => { })
                    .catch(() => { });
            }

            const typeNextChar = () => {
                if (isPaused) return;

                if (segmentIndex < textSegments.length) {
                    const currentSegment = textSegments[segmentIndex];

                    if (charIndex < currentSegment.length) {
                        accumulatedText = textSegments.slice(0, segmentIndex).join('') +
                            currentSegment.substring(0, charIndex + 1);
                        setDisplayedText(accumulatedText);
                        charIndex++;
                    } else {
                        segmentIndex++; // Move to next segment
                        charIndex = 0;

                        if (segmentIndex < textSegments.length && segmentIndex - 1 < pauseDurations.length) {
                            isPaused = true;

                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                            }

                            setTimeout(() => {
                                isPaused = false;

                                if (audioRef.current && !isMuted
                                    && segmentIndex < textSegments.length) {
                                    audioRef.current.currentTime = 0;
                                    audioRef.current.play().catch(() => { });
                                }

                            },
                                pauseDurations[segmentIndex - 1]
                            );
                        } else if (segmentIndex >= textSegments.length) {
                            if (currentMessages[currentMessageIndex].includes("pixel heart")) {
                                setDisplayedText(accumulatedText + heartSvg);
                            } else {
                                setDisplayedText(accumulatedText);
                            }
                            clearInterval(typingIntervalRef.current);
                            setIsTyping(false);
                            setShowArrow(true);

                            if (audioRef.current) {
                                audioRef.current.pause();
                                audioRef.current.currentTime = 0;
                            }
                        }
                    }
                }
            };

            typingIntervalRef.current = setInterval(typeNextChar, 50);
        } else {
            // Simple message without pauses
            let charIndex = 0;

            // Start typing sound
            if (audioRef.current && !isMuted) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
                    .then(() => { })
                    .catch(() => { });
            }

            typingIntervalRef.current = setInterval(() => {
                if (charIndex < currentMessage.length) {
                    let newText = currentMessage.substring(0, charIndex + 1);
                    setDisplayedText(newText);
                    charIndex++;
                } else {
                    // Finished typing current message
                    if (currentMessage.includes("pixel heart")) {
                        setDisplayedText(currentMessage + heartSvg);
                    }
                    clearInterval(typingIntervalRef.current);
                    setIsTyping(false);
                    setShowArrow(true);

                    // Stop typing sound
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
            }, 50);
        }

        return () => {
            if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [currentMessageIndex, isTyping, isMuted, isMobile]);

    const handleArrowClick = () => {
        const currentMessages = primaryMessages
        if (currentMessageIndex < currentMessages.length - 1) {
            setShowArrow(false);
            setDisplayedText('');
            setCurrentMessageIndex(prev => prev + 1);
            setIsTyping(true);
        } else {
            // Last message reached
            setShowArrow(false);
        }
    };

    return (
        <header className="typing-header">
            {/* Name heading with controls */}
            <div className="name-heading-container">
                {/* Mute/Unmute button */}
                <button
                    onClick={() => {
                        setIsMuted(!isMuted);
                        if (!isMuted && audioRef.current && !audioRef.current.paused) {
                            audioRef.current.pause();
                        }
                    }}
                    className="mute-button group"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? (
                        <svg className="typing-header-mute-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg className="typing-header-mute-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>

                <h1 ref={nameHeadingRef} className="name-heading">
                    Mohammad<span className="name-break"> </span>Alshikh
                </h1>

                {/* Social Links */}
                <div className="social-links">
                    {/* LinkedIn */}
                    <a
                        href="https://linkedin.com/in/mohammadalshikh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link group"
                        aria-label="LinkedIn"
                    >
                        <svg className="typing-header-social-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>

                    <a
                        href="https://github.com/mohammadalshikh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link group"
                        aria-label="GitHub"
                    >
                        <svg className="typing-header-social-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </div>

            <div className="astronaut-logo-container">
                <AstronautLogo size={80} className="typing-header-logo" />
            </div>

            <div className="typing-messages-container typing-messages-hide-mobile">
                <div className="typing-header-messages-inner" style={{ minHeight: '350px' }}>
                    <div className="typing-header-messages-text-wrapper">
                        <p className="typing-text">
                            <span dangerouslySetInnerHTML={{ __html: displayedText }} />
                            {isTyping && <span className="typing-header-messages-cursor">|</span>}
                        </p>
                    </div>

                    <div className="typing-header-messages-actions">
                        {showArrow && (
                            <button
                                onClick={handleArrowClick}
                                className="arrow-button group"
                                aria-label="Next message"
                            >
                                <svg
                                    className="typing-header-messages-arrow-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TypingHeader;
