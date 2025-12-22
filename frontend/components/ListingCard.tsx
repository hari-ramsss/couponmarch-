"use client";

import BuyVoucherModal from "./BuyVoucherModal";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface ListingCardProps {
    title: string;
    type: string;
    discount?: string;
    description: string;
    price: string;
    verified: boolean;
    id?: string | number;
    logo?: string;
    voucherImage?: string;
}

export default function ListingCard({
    title,
    type,
    discount,
    description,
    price,
    verified,
    id,
    logo,
    voucherImage
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
                    src={logo || "/img/blank_coupon.png"}
                    alt={`${title} logo`}
                    className="voucher-logo"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>

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

            {/* Title */}
            <h3 className="listing-title">{title}</h3>

            {/* Voucher Type */}
            <p className="listing-type">
                <strong>Type:</strong> {type}
            </p>

            {/* Description */}
            <p className="listing-description">
                {description}
            </p>

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
                    voucherImage={voucherImage}
                    onClose={() => setIsModalOpen(false)}
                />,
                document.body
            )}

        </div>
    );
}
