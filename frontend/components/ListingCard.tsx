interface ListingCardProps {
    title: string;
    type: string;
    discount?: string;
    description: string;
    price: string;
    verified: boolean;
    id?: string | number;
}

export default function ListingCard({
    title,
    type,
    discount,
    description,
    price,
    verified
}: ListingCardProps) {
    return (
        <div className="listing-card">

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
            <button className="listing-btn">
                View / Buy
            </button>

        </div>
    );
}
