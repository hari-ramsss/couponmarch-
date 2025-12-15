import ListingCard from "./ListingCard";

interface Listing {
    id: string | number;
    title: string;
    type: string;
    discount?: string;
    description: string;
    price: string;
    verified: boolean;
    image?: string;
}

interface ListingsGridProps {
    listings: Listing[];
}

export default function ListingsGrid({ listings }: ListingsGridProps) {
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
