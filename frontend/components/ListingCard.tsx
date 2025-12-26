"use client";

import BuyVoucherModal from "./BuyVoucherModal";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface ListingCardProps {
    title: string;
    type: string;
    brand?: string;
    discount?: string;
    description: string;
    price: string;
    verified: boolean;
    id?: string | number;
    category?: string;
    tags?: string[];
    logoUrl?: string;
    previewImageUrl?: string;
    status?: string;
}

export default function ListingCard({
    title,
    type,
    brand,
    discount,
    description,
    price,
    verified,
    id,
    category,
    tags,
    logoUrl,
    previewImageUrl,
    status
}: ListingCardProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const router = useRouter();

    const handleBuyClick = () => {
        setIsModalOpen(true);
    };

    const handleViewClick = () => {
        if (id) {
            router.push(`/marketplace/${id}`);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
    };

    return (
        <div className="listing-card">

            {/* Voucher Logo */}
            <div className="voucher-logo-container">
                <img
                    src={logoUrl || "/img/blank_coupon.png"}
                    alt={`${title} logo`}
                    className="voucher-logo"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>

            {/* Preview Image (if available) */}
            {previewImageUrl && (
                <div className="voucher-preview-container">
                    <img
                        src={previewImageUrl}
                        alt={`${title} preview`}
                        className="voucher-preview"
                    />
                    <div className="preview-overlay">
                        <span>Preview (Blurred)</span>
                    </div>
                </div>
            )}

            {/* Category Badge */}
            {category && (
                <div className="category-badge">
                    {category}
                </div>
            )}

            {/* Discount Badge */}
            {discount && (
                <div className="discount-badge">
                    {discount}
                </div>
            )}

            {/* Verified Badge */}
            {verified && (
                <div className="verified-badge">
                    ✔ Verified
                </div>
            )}

            {/* Status Badge */}
            {status && status !== 'pending' && (
                <div className={`status-badge status-${status.toLowerCase()}`}>
                    {status}
                </div>
            )}

            {/* Title */}
            <h3 className="listing-title">{title}</h3>

            {/* Brand */}
            {brand && (
                <p className="listing-brand">
                    <strong>Brand:</strong> {brand}
                </p>
            )}

            {/* Voucher Type */}
            <p className="listing-type">
                <strong>Type:</strong> {type}
            </p>

            {/* Description */}
            <p className="listing-description">
                {description}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="listing-tags">
                    {tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="tag-more">+{tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* Price Display */}
            <p className="listing-price">
                <strong>{price}</strong>
            </p>

            {/* CTA Button */}
            <button className="listing-btn" onClick={handleViewClick}>
                View Details
            </button>
            <p className="listing-note">
                Click "View Details" to see buy options and wallet requirements
            </p>

            {/* Modal Integration - Render at document root */}
            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <BuyVoucherModal
                    voucherId={id}
                    voucherTitle={title}
                    voucherPrice={price}
                    voucherImage={previewImageUrl}
                    onClose={() => setIsModalOpen(false)}
                />,
                document.body
            )}

        </div>
    );
}
