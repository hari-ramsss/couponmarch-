"use client";

import Header from "@/components/Header";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CategoryTab from "@/components/Category";
import FilterSidebar from "@/components/FilterSidebar";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getEnhancedActiveListings } from "@/lib/marketplace";
import { EnhancedListingData } from "@/lib/ipfs-metadata";

function MarketplaceContent() {
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { wallet } = useWallet();
    const searchParams = useSearchParams();

    // Get filter values from URL
    const searchQuery = searchParams.get('search') || '';
    const filterType = searchParams.get('type') || '';
    const filterDiscount = searchParams.get('discount') || '';
    const filterPrice = searchParams.get('price') || '';
    const filterSort = searchParams.get('sort') || '';
    const verifiedOnly = searchParams.get('verified') === 'true';
    const hasDiscount = searchParams.get('hasDiscount') === 'true';
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    // Apply all filters to listings
    const filteredListings = listings.filter((listing) => {
        // Search filter (by name and brand)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const titleMatch = listing.title?.toLowerCase().includes(query);
            const brandMatch = listing.brand?.toLowerCase().includes(query);
            if (!titleMatch && !brandMatch) return false;
        }

        // Voucher Type filter
        if (filterType && listing.type !== filterType) {
            return false;
        }

        // Discount filter
        if (filterDiscount) {
            const discountNum = parseInt(listing.discount?.replace(/[^0-9]/g, '') || '0');
            const minDiscount = parseInt(filterDiscount.replace(/[^0-9]/g, '') || '0');
            if (discountNum < minDiscount) return false;
        }

        // Price filter (in MNEE tokens)
        if (filterPrice) {
            const priceNum = parseFloat(listing.price?.replace(/[^0-9.]/g, '') || '0');
            if (filterPrice === 'Under 100 MNEE' && priceNum >= 100) return false;
            if (filterPrice === '100 - 500 MNEE' && (priceNum < 100 || priceNum >= 500)) return false;
            if (filterPrice === '500 - 1000 MNEE' && (priceNum < 500 || priceNum >= 1000)) return false;
            if (filterPrice === '1000+ MNEE' && priceNum < 1000) return false;
        }

        // Verified only filter
        if (verifiedOnly && !listing.verified) {
            return false;
        }

        // Has discount filter
        if (hasDiscount && !listing.discount) {
            return false;
        }

        // Expiring soon filter (within 7 days)
        if (expiringSoon && listing.expiryTimestamp) {
            const expiryDate = new Date(Number(listing.expiryTimestamp) * 1000);
            const now = new Date();
            const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (daysUntilExpiry > 7) return false;
        }

        return true;
    }).sort((a, b) => {
        // Apply sorting
        if (!filterSort) return 0;

        if (filterSort === 'Price: Low → High') {
            const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
            const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
            return priceA - priceB;
        }
        if (filterSort === 'Price: High → Low') {
            const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
            const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
            return priceB - priceA;
        }
        if (filterSort === 'Discount: High → Low') {
            const discountA = parseInt(a.discount?.replace(/[^0-9]/g, '') || '0');
            const discountB = parseInt(b.discount?.replace(/[^0-9]/g, '') || '0');
            return discountB - discountA;
        }
        if (filterSort === 'Newest First') {
            return b.id - a.id; // Assuming higher ID = newer
        }
        if (filterSort === 'Expiring Soon') {
            const expiryA = a.expiryTimestamp || BigInt(Number.MAX_SAFE_INTEGER);
            const expiryB = b.expiryTimestamp || BigInt(Number.MAX_SAFE_INTEGER);
            return Number(expiryA) - Number(expiryB);
        }
        return 0;
    });

    // Fetch listings from blockchain
    const fetchListings = async () => {
        if (!wallet.provider) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);

            // Fetch enhanced listings with IPFS metadata
            const enhancedListings = await getEnhancedActiveListings(wallet.provider);

            // Transform enhanced data to UI format
            const transformedListings = enhancedListings.map((listing: EnhancedListingData) => {
                return {
                    id: listing.id,
                    title: listing.title, // Rich title from IPFS
                    type: listing.metadata?.type || listing.partialPattern || "Voucher",
                    brand: listing.brand, // Brand from IPFS
                    discount: listing.metadata?.discountPercentage ?
                        `${listing.metadata.discountPercentage}% off` : undefined,
                    description: listing.description, // Rich description from IPFS
                    price: listing.formattedPrice, // Already formatted
                    value: listing.value > BigInt(0) ? `₹${listing.value.toString()}` : undefined, // Voucher face value
                    verified: listing.isVerified,
                    status: listing.metadata?.validation?.validationStatus || 'pending',
                    seller: listing.seller,
                    expiryTimestamp: listing.expiryTimestamp,
                    expired: listing.isExpired,
                    category: listing.category, // Category from IPFS
                    tags: listing.tags, // Tags from IPFS
                    logoUrl: listing.logoUrl, // Logo image URL
                    previewImageUrl: listing.previewImageUrl, // Blurred voucher image
                    listingData: listing, // Store full enhanced listing data
                };
            });

            // Filter out expired listings
            const validListings = transformedListings.filter((l: any) => !l.expired);
            setListings(validListings);
        } catch (err: any) {
            console.error('Error fetching listings:', err);
            setError(err.message || 'Failed to fetch listings');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsInitialLoad(false);
        }
    };

    // Initial load only when wallet provider changes
    useEffect(() => {
        fetchListings();
        // No auto-refresh - user can manually refresh to avoid disrupting purchase flow
    }, [wallet.provider]);

    // Manual refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchListings();
    };

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
                                    <div className="listings-header-top">
                                        <h2>Marketplace Listings</h2>
                                        <button
                                            onClick={handleRefresh}
                                            className="refresh-btn"
                                            disabled={isRefreshing}
                                        >
                                            <span className="material-icons">{isRefreshing ? 'sync' : 'refresh'}</span>
                                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                    <p>Browse verified vouchers available for purchase in the "{active}" category.</p>
                                    <div className="results-info">
                                        {isLoading ? (
                                            <span className="results-count">Loading listings...</span>
                                        ) : error ? (
                                            <span className="results-count error">Error: {error}</span>
                                        ) : (
                                            <span className="results-count">
                                                {searchQuery ? `${filteredListings.length} of ${listings.length}` : listings.length} vouchers found
                                                {searchQuery && ` matching "${searchQuery}"`}
                                            </span>
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
                                    <ListingsGrid listings={filteredListings} />
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

function MarketplaceFallback() {
    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="marketplace" />
            <div className="page-loading-state">
                <div className="loading-spinner"></div>
                <p>Loading CouponMarchè Marketplace...</p>
            </div>
            <Footer />
        </div>
    );
}

export default function Marketplace() {
    return (
        <Suspense fallback={<MarketplaceFallback />}>
            <MarketplaceContent />
        </Suspense>
    );
}