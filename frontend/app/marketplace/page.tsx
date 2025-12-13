"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import CategoryTab from "@/components/Category";
import FilterSidebar from "@/components/FilterSidebar";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getActiveListings, ListingData, formatPrice, getStatusLabel, isListingExpired } from "@/lib/marketplace";
import { ListingStatus } from "@/lib/contracts";

export default function Marketplace() {
    const categories = [
        "Food",
        "Fashion",
        "Travel",
        "Groceries",
        "Electronics",
        "Online Stores"
    ];
    const [active, setActive] = useState("Food");
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { wallet } = useWallet();

    // Fetch listings from blockchain
    useEffect(() => {
        async function fetchListings() {
            if (!wallet.provider) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const activeListings = await getActiveListings(wallet.provider);
                
                // Transform blockchain data to UI format
                const transformedListings = await Promise.all(
                    activeListings.map(async (listing: ListingData) => {
                        const priceFormatted = await formatPrice(wallet.provider!, listing.price);
                        const expired = isListingExpired(listing);
                        
                        return {
                            id: listing.id,
                            title: `Voucher #${listing.id}`,
                            type: listing.partialPattern || "Voucher",
                            discount: listing.value > 0n ? `${listing.value.toString()} value` : undefined,
                            description: `Partial code: ${listing.partialPattern || "N/A"}`,
                            price: `${priceFormatted} MNEE`,
                            verified: listing.aiInitialProof !== "0x0000000000000000000000000000000000000000000000000000000000000000",
                            status: getStatusLabel(listing.status),
                            seller: listing.seller,
                            expiryTimestamp: listing.expiryTimestamp,
                            expired,
                            listingData: listing, // Store full listing data
                        };
                    })
                );

                // Filter out expired listings
                const validListings = transformedListings.filter((l: any) => !l.expired);
                setListings(validListings);
            } catch (err: any) {
                console.error('Error fetching listings:', err);
                setError(err.message || 'Failed to fetch listings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchListings();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchListings, 30000);
        return () => clearInterval(interval);
    }, [wallet.provider]);

    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="marketplace" />

            {/* Marketplace Header */}
            <main className="marketplace-main">
                <div className="marketplace-container">
                    <h1>Marketplace</h1>
                    <p>Browse and purchase verified vouchers from trusted sellers</p>
                </div>
            </main>

            {/* Category Tabs */}
            <div className="category-tabs">
                {categories.map((cat) => (
                    <CategoryTab
                        key={cat}
                        label={cat}
                        isActive={active === cat}
                        onClick={() => setActive(cat)}
                    />
                ))}
            </div>

            {/* Marketplace Content Layout */}
            <div className="marketplace-layout">
                <FilterSidebar />

                <main className="marketplace-content-area">
                    <section className="listings-section">
                        <div className="listings-header">
                            <h2>Marketplace Listings</h2>
                            <p>Browse verified vouchers available for purchase in the "{active}" category.</p>
                            <div className="results-info">
                                {isLoading ? (
                                    <span className="results-count">Loading listings...</span>
                                ) : error ? (
                                    <span className="results-count error">Error: {error}</span>
                                ) : (
                                    <span className="results-count">{listings.length} vouchers found</span>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="loading-state">
                                <p>Loading marketplace listings...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>Error loading listings: {error}</p>
                                <p>Make sure you're connected to Sepolia testnet and contract addresses are configured.</p>
                            </div>
                        ) : (
                            <ListingsGrid listings={listings} />
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    )
}