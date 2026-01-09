"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { getAllListings } from "@/lib/marketplace";
import { ListingStatus } from "@/lib/contracts";
import { EnhancedListingData } from "@/lib/ipfs-metadata";
import { getIPFSImageUrl, enhanceListingWithMetadata } from "@/lib/ipfs-metadata";
import { resolveIPFSHash } from "@/lib/ipfs-resolver";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyListingsPage() {
    const [myListings, setMyListings] = useState<EnhancedListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const { wallet } = useWallet();

    useEffect(() => {
        async function fetchMyListings() {
            if (!wallet.isConnected || !wallet.provider || !wallet.address) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('📦 Fetching listings for seller:', wallet.address);
                const allListings = await getAllListings(wallet.provider);

                // Filter listings created by the current user
                const userListings = allListings.filter(listing =>
                    listing.seller.toLowerCase() === wallet.address?.toLowerCase()
                );

                console.log('📋 Found', userListings.length, 'listings by user');

                // Enhance listings with metadata
                const enhancedListings: EnhancedListingData[] = [];
                for (const listing of userListings) {
                    try {
                        const ipfsHash = await resolveIPFSHash(wallet.provider, listing.id);
                        const enhanced = await enhanceListingWithMetadata(listing, wallet.provider, ipfsHash || undefined);
                        enhancedListings.push(enhanced);
                    } catch (error) {
                        console.error(`Error enhancing listing ${listing.id}:`, error);
                        const basicEnhanced = await enhanceListingWithMetadata(listing, wallet.provider);
                        enhancedListings.push(basicEnhanced);
                    }
                }

                setMyListings(enhancedListings);
            } catch (error) {
                console.error('Error fetching my listings:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMyListings();
    }, [wallet.isConnected, wallet.provider, wallet.address]);

    const getStatusLabel = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.LISTED: return 'Active';
            case ListingStatus.REVEALED: return 'Sold - Pending Confirmation';
            case ListingStatus.BUYER_CONFIRMED: return 'Completed';
            case ListingStatus.BUYER_DISPUTED: return 'Disputed';
            case ListingStatus.CANCELLED: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    const getStatusClass = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.LISTED: return 'active';
            case ListingStatus.REVEALED: return 'pending';
            case ListingStatus.BUYER_CONFIRMED: return 'completed';
            case ListingStatus.BUYER_DISPUTED: return 'disputed';
            case ListingStatus.CANCELLED: return 'cancelled';
            default: return '';
        }
    };

    const formatPrice = (price: bigint) => `${(Number(price) / 1e18).toFixed(2)} MNEE`;
    const formatDate = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleDateString();

    if (!wallet.isConnected) {
        return (
            <>
                <Header pageType="vouchers" />
                <main className="vouchers-page">
                    <div className="vouchers-container">
                        <div className="vouchers-empty">
                            <div className="vouchers-empty-icon">
                                <span className="material-icons">account_balance_wallet</span>
                            </div>
                            <h1 className="vouchers-empty-title">Connect Your Wallet</h1>
                            <p className="vouchers-empty-text">Please connect your wallet to view your listings.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header pageType="vouchers" />
            <main className="vouchers-page">
                <div className="vouchers-container">
                    <div className="vouchers-header">
                        <h1 className="vouchers-page-title">My Listings</h1>
                        <p className="vouchers-page-subtitle">Vouchers you have listed for sale</p>
                    </div>

                    {loading ? (
                        <div className="vouchers-loading">
                            <div className="vouchers-spinner"></div>
                            <p className="vouchers-loading-text">Loading your listings...</p>
                        </div>
                    ) : myListings.length === 0 ? (
                        <div className="vouchers-empty">
                            <div className="vouchers-empty-icon">
                                <span className="material-icons">sell</span>
                            </div>
                            <h2 className="vouchers-empty-title">No Listings Yet</h2>
                            <p className="vouchers-empty-text">You haven't created any voucher listings yet. Start selling your vouchers!</p>
                            <a href="/sell" className="vouchers-cta-button">
                                <span className="material-icons" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>add_circle</span>
                                Create Your First Listing
                            </a>
                        </div>
                    ) : (
                        <div className="vouchers-grid">
                            {myListings.map((listing) => (
                                <div key={listing.id} className={`listing-card-seller listing-card-seller--${getStatusClass(listing.status)}`}>
                                    {/* Banner */}
                                    <div className="listing-banner">
                                        {listing.metadata?.images?.logo?.original && (
                                            <img
                                                src={getIPFSImageUrl(listing.metadata.images.logo.original)}
                                                alt="Logo"
                                                className="listing-logo-badge"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        )}
                                        <img
                                            src={listing.metadata?.images?.voucher?.blurred
                                                ? getIPFSImageUrl(listing.metadata.images.voucher.blurred)
                                                : "/img/blank_coupon.png"}
                                            alt={listing.title}
                                            className="listing-banner-img"
                                            onError={(e) => { e.currentTarget.src = "/img/blank_coupon.png"; }}
                                        />
                                        <span className={`listing-status-badge listing-status-badge--${getStatusClass(listing.status)}`}>
                                            {getStatusLabel(listing.status)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="listing-content">
                                        <h3 className="listing-title-seller">{listing.metadata?.title || listing.title || `Voucher #${listing.id}`}</h3>

                                        <div className="listing-meta">
                                            <span className="listing-brand-seller">
                                                <span className="material-icons">store</span>
                                                {listing.metadata?.brand || listing.brand || 'Unknown Brand'}
                                            </span>
                                            <span className="listing-type-seller">{listing.metadata?.type || 'Voucher'}</span>
                                        </div>

                                        <p className="listing-description-seller">{listing.metadata?.description || listing.description}</p>

                                        {/* Stats */}
                                        <div className="listing-stats">
                                            <div className="listing-stat">
                                                <span className="stat-label">Price</span>
                                                <span className="stat-value">{listing.formattedPrice || formatPrice(listing.price)}</span>
                                            </div>
                                            {listing.metadata?.value && listing.metadata.value > 0 && (
                                                <div className="listing-stat">
                                                    <span className="stat-label">Value</span>
                                                    <span className="stat-value">₹{listing.metadata.value}</span>
                                                </div>
                                            )}
                                            <div className="listing-stat">
                                                <span className="stat-label">Listed</span>
                                                <span className="stat-value">{formatDate(listing.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Buyer Info (if sold) */}
                                        {listing.buyer && listing.buyer !== '0x0000000000000000000000000000000000000000' && (
                                            <div className="listing-buyer-info">
                                                <span className="material-icons">person</span>
                                                <span>Buyer: {listing.buyer.slice(0, 6)}...{listing.buyer.slice(-4)}</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="listing-actions-seller">
                                            <a href={`/marketplace/${listing.id}`} className="listing-btn-seller view">
                                                <span className="material-icons">visibility</span>
                                                View Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
