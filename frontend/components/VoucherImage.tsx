import { useState, useEffect } from "react";

interface VoucherImageProps {
    src?: string;
    alt: string;
    className?: string;
}

export default function VoucherImage({ src, alt, className = "" }: VoucherImageProps) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [hasErrored, setHasErrored] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const defaultImage = "./img/blank_coupon.png";

    useEffect(() => {
        // Reset state when src prop changes
        setHasErrored(false);
        setIsLoading(true);
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

    return (
        <div className={`voucher-image-container ${className}`}>
            {isLoading && (
                <div className="image-placeholder">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <img
                src={imageSrc}
                alt={alt}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: isLoading ? 'none' : 'block' }}
            />
        </div>
    );
}