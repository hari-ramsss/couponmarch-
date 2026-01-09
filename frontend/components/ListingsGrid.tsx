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
    return (
        <div className="listings-grid">
            {listings && listings.length > 0 ? (
                listings.map((item: Listing) => (
                    <ListingCard key={item.id} {...item} />
                ))
            ) : (
                <div className="empty-state" style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: '2px dashed #e9ecef',
                    gridColumn: '1 / -1'
                }}>
                    <span className="material-icons" style={{
                        fontSize: '4rem',
                        color: '#6c757d',
                        marginBottom: '1rem',
                        display: 'block'
                    }}>
                        inventory_2
                    </span>
                    <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>No Vouchers Available</h3>
                    <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                        There are no vouchers listed in this category yet.
                    </p>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Be the first to list a voucher and start earning!
                    </p>
                    <a href="/sell" style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        background: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: '500'
                    }}>
                        <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}>
                            add_circle
                        </span>
                        List Your Voucher
                    </a>
                </div>
            )}
        </div>
    );
}
