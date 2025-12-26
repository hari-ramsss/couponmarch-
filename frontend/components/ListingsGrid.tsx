import ListingCard from "./ListingCard";
import { useState, useEffect } from "react";

interface Listing {
    id: string | number;
    title: string;
    type: string;
    brand?: string;
    discount?: string;
    description: string;
    price: string;
    value?: string; // Voucher face value
    verified: boolean;
    status?: string;
    category?: string;
    tags?: string[];
    logoUrl?: string;
    previewImageUrl?: string;
    image?: string; // Keep for backward compatibility
}

interface ListingsGridProps {
    listings: Listing[];
}

export default function ListingsGrid({ listings }: ListingsGridProps) {
    const [isRendering, setIsRendering] = useState(false);

    // Disable rendering loading for testing
    useEffect(() => {
        setIsRendering(false);
    }, [listings]);

    return (
        <div className="listings-grid">
            {listings && listings.length > 0 ? (
                listings.map((item: Listing) => (
                    <ListingCard key={item.id} {...item} />
                ))
            ) : (
                <div className="no-listings">
                    <p>No listings available for this category.</p>
                </div>
            )}
        </div>
    );
}
