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
    value?: string; // Voucher face value
    verified: boolean;
    id?: string | number;
    category?: string;
    tags?: string[];
    logoUrl?: string;
    previewImageUrl?: string; // Keep for modal, but don't display in card
    status?: string;
}

export default function ListingCard({
    title,
    type,
    brand,
    discount,
    description,
    price,
    value,
    verified,
    id,
    category,
    tags,
    logoUrl,
    previewImageUrl, // Accept but don't display in card
    status
}: ListingCardProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleBuyClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="listing-card">

            {/* Voucher Logo */}
            <div className="voucher-logo-container">
                <img
                    src={logoUrl || "/img/blank_coupon.png"}
                    alt={`${title} logo`}
                    className="voucher-logo"
                />
            </div>

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

            {/* Brand & Type Row */}
            <div className="listing-info-row">
                {brand && (
                    <span className="listing-brand">
                        <strong>{brand}</strong>
                    </span>
                )}
                <span className="listing-type">{type}</span>
            </div>

            {/* Value & Price Row */}
            <div className="listing-value-price-row">
                {value && (
                    <div className="voucher-value">
                        <span className="value-label">Value:</span>
                        <span className="value-amount">{value}</span>
                    </div>
                )}
                <div className="listing-price">
                    <span className="price-label">Price:</span>
                    <span className="price-amount">{price}</span>
                </div>
            </div>

            {/* Description */}
            <p className="listing-description">
                {description}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="listing-tags">
                    {tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                        </span>
                    ))}
                    {tags.length > 2 && (
                        <span className="tag-more">+{tags.length - 2}</span>
                    )}
                </div>
            )}

            {/* Remove the separate price display since it's now in the value-price row */}

            {/* CTA Buttons */}
            <div className="listing-actions">
                <button className="listing-btn primary" onClick={handleBuyClick}>
                    Buy Now
                </button>
                <button className="listing-btn secondary" onClick={() => {
                    if (id) {
                        router.push(`/marketplace/${id}`);
                    }
                }}>
                    View Details
                </button>
            </div>
            <p className="listing-note">
                "Buy Now" for quick purchase or "View Details" for technical info
            </p>

            {/* Modal Integration - Render at document root */}
            {isModalOpen && id && typeof document !== 'undefined' && createPortal(
                <BuyVoucherModal
                    voucherId={id}
                    voucherTitle={title}
                    voucherPrice={price}
                    voucherImage={previewImageUrl} // Use preview image for modal
                    onClose={() => setIsModalOpen(false)}
                    onPurchaseComplete={() => {
                        setIsModalOpen(false);
                        // Could add a callback here to refresh the listing data
                    }}
                />,
                document.body
            )}

        </div>
    );
}
