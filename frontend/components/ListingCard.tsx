import BuyVoucherModal from "./BuyVoucherModal";
import { useState } from "react";
import { createPortal } from "react-dom";
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

    const handleBuyClick = () => {
        setIsModalOpen(true);
    };
    return (
        <div className="listing-card">

            {/* Voucher Logo */}
            <div className="voucher-logo-container">
                <img
                    src={logo || "/img/blank_coupon.png"}
                    alt={`${title} logo`}
                    className="voucher-logo"
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
            <button className="listing-btn" onClick={handleBuyClick}>
                View / Buy
            </button>
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
