"use client";

import Header from "@/components/Header";
import { useState, useEffect } from "react";
import CategoryTab from "@/components/Category";
import FilterSidebar from "@/components/FilterSidebar";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getActiveListings, ListingData, formatPrice, getStatusLabel, isListingExpired } from "@/lib/marketplace";

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
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
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
                // Disable loading state for testing
                // setIsLoading(true);
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
                            discount: listing.value > BigInt(0) ? `${listing.value.toString()} value` : undefined,
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
                // Keep loading states disabled for testing
                setIsLoading(false);
                setIsInitialLoad(false);
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

            {/* Show full page loading on initial load */}
            {isInitialLoad ? (
                <div className="page-loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading CouponMarchè Marketplace...</p>
                    <p className="loading-subtext">Connecting to blockchain and fetching listings</p>
                </div>
            ) : (
                <>
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
                                        <div className="loading-spinner"></div>
                                        <p>Loading marketplace listings from blockchain...</p>
                                        <p className="loading-subtext">This may take a few seconds</p>
                                    </div>
                                ) : error ? (
                                    <div className="error-state">
                                        <p>Error loading listings: {error}</p>
                                        <p>Make sure you're connected to Sepolia testnet and contract addresses are configured.</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="retry-btn"
                                        >
                                            Retry Loading
                                        </button>
                                    </div>
                                ) : (
                                    <ListingsGrid listings={listings} />
                                )}
                            </section>
                        </main>
                    </div>
                </>
            )}
            <Footer />
        </div>
    )
}