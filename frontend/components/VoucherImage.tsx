import { useState, useEffect } from "react";

interface VoucherImageProps {
    src?: string;
    alt: string;
    className?: string;
    allowUnblur?: boolean; // Option to allow clicking to unblur
    forceBlurred?: boolean; // Force the image to stay blurred regardless of user interaction
}

export default function VoucherImage({ src, alt, className = "", allowUnblur = true, forceBlurred = false }: VoucherImageProps) {
    const defaultImage = "/img/blank_coupon.png";
    const [imageSrc, setImageSrc] = useState<string>(src || defaultImage);
    const [hasErrored, setHasErrored] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBlurred, setIsBlurred] = useState(true); // Start with blurred state

    useEffect(() => {
        // Reset state when src prop changes
        setHasErrored(false);
        setIsLoading(true);
        setIsBlurred(true); // Reset blur state when image changes
        setImageSrc(src || defaultImage);
    }, [src]);

    const handleImageError = () => {
        if (!hasErrored && imageSrc !== defaultImage) {
            setHasErrored(true);
            setImageSrc(defaultImage);
        }
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageClick = () => {
        if (allowUnblur && isBlurred && !forceBlurred) {
            setIsBlurred(false);
        }
    };

    // Ensure we never pass empty string to src
    const finalSrc = imageSrc || defaultImage;

    return (
        <div className={`voucher-image-container ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-xl">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div
                className={`relative ${allowUnblur && isBlurred && !forceBlurred ? 'cursor-pointer' : ''}`}
                onClick={handleImageClick}
            >
                <img
                    src={finalSrc}
                    alt={alt}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-500 ${(isBlurred || forceBlurred) ? 'filter blur-sm' : ''
                        }`}
                    style={{ display: isLoading ? 'none' : 'block' }}
                />
                {(isBlurred || forceBlurred) && !isLoading && (
                    <div className={`voucher-blur-overlay ${forceBlurred ? 'force-blurred' : ''}`}>
                        <div className="voucher-reveal-content">
                            <span className="voucher-reveal-icon material-icons">lock</span>
                            <p className="voucher-reveal-text">
                                {forceBlurred ? 'Payment required to reveal' : 'Click to reveal voucher'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}