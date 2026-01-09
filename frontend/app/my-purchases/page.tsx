"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { getEnhancedActiveListings, getAllListings } from "@/lib/marketplace";
import { confirmVoucher, disputeVoucher } from "@/lib/escrow";
import { ListingStatus } from "@/lib/contracts";
import { EnhancedListingData } from "@/lib/ipfs-metadata";
import { getIPFSImageUrl, enhanceListingWithMetadata } from "@/lib/ipfs-metadata";
import { resolveIPFSHash } from "@/lib/ipfs-resolver";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RevealedVouchersPage() {
    const [purchasedVouchers, setPurchasedVouchers] = useState<EnhancedListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: 'confirm' | 'dispute' | null }>({});
    const { wallet } = useWallet();

    // Fetch revealed vouchers for the current user
    useEffect(() => {
        async function fetchPurchasedVouchers() {
            if (!wallet.isConnected || !wallet.provider || !wallet.address) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const allListings = await getAllListings(wallet.provider);

                // Filter vouchers that are revealed to the current user
                const userRevealedListings = allListings.filter(listing =>
                    listing.buyer.toLowerCase() === wallet.address?.toLowerCase() &&
                    (listing.status === ListingStatus.REVEALED ||
                        listing.status === ListingStatus.BUYER_CONFIRMED ||
                        listing.status === ListingStatus.BUYER_DISPUTED)
                );

                // Enhance listings with metadata
                const enhancedVouchers: EnhancedListingData[] = [];
                for (const listing of userRevealedListings) {
                    try {
                        const ipfsHash = await resolveIPFSHash(wallet.provider, listing.id);
                        const enhanced = await enhanceListingWithMetadata(listing, wallet.provider, ipfsHash || undefined);
                        enhancedVouchers.push(enhanced);
                    } catch (error) {
                        console.error(`Error enhancing listing ${listing.id}:`, error);
                        // Add basic listing without metadata
                        const basicEnhanced = await enhanceListingWithMetadata(listing, wallet.provider);
                        enhancedVouchers.push(basicEnhanced);
                    }
                }

                setPurchasedVouchers(enhancedVouchers);
            } catch (error) {
                console.error('Error fetching revealed vouchers:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchasedVouchers();
    }, [wallet.isConnected, wallet.provider, wallet.address]);

    const handleConfirm = async (listingId: number) => {
        if (!wallet.signer) {
            alert('Please connect your wallet');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [listingId]: 'confirm' }));

            const tx = await confirmVoucher(wallet.signer, listingId);
            await tx.wait();

            // Update the voucher status locally
            setPurchasedVouchers(prev =>
                prev.map(voucher =>
                    voucher.id === listingId
                        ? { ...voucher, status: ListingStatus.BUYER_CONFIRMED }
                        : voucher
                )
            );

            alert('Voucher confirmed successfully!');
        } catch (error: any) {
            console.error('Error confirming voucher:', error);
            alert(error.message || 'Failed to confirm voucher');
        } finally {
            setActionLoading(prev => ({ ...prev, [listingId]: null }));
        }
    };

    const handleDispute = async (listingId: number) => {
        if (!wallet.signer) {
            alert('Please connect your wallet');
            return;
        }

        const evidenceCID = prompt('Please provide evidence (IPFS CID) for your dispute:');
        if (!evidenceCID) {
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [listingId]: 'dispute' }));

            const tx = await disputeVoucher(wallet.signer, listingId, evidenceCID);
            await tx.wait();

            // Update the voucher status locally
            setPurchasedVouchers(prev =>
                prev.map(voucher =>
                    voucher.id === listingId
                        ? { ...voucher, status: ListingStatus.BUYER_DISPUTED }
                        : voucher
                )
            );

            alert('Dispute submitted successfully!');
        } catch (error: any) {
            console.error('Error disputing voucher:', error);
            alert(error.message || 'Failed to submit dispute');
        } finally {
            setActionLoading(prev => ({ ...prev, [listingId]: null }));
        }
    };

    const getCardBackgroundClass = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.REVEALED:
                return 'bg-white border-gray-200';
            case ListingStatus.BUYER_CONFIRMED:
                return 'bg-green-50 border-green-200';
            case ListingStatus.BUYER_DISPUTED:
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    const getStatusLabel = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.REVEALED:
                return 'Revealed';
            case ListingStatus.BUYER_CONFIRMED:
                return 'Confirmed';
            case ListingStatus.BUYER_DISPUTED:
                return 'Disputed';
            default:
                return 'Unknown';
        }
    };

    const formatPrice = (price: bigint) => {
        return `${(Number(price) / 1e18).toFixed(2)} MNEE`;
    };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString();
    };

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
                            <h1 className="vouchers-empty-title">
                                Connect Your Wallet
                            </h1>
                            <p className="vouchers-empty-text">
                                Please connect your wallet to view your revealed vouchers.
                            </p>
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
                        <h1 className="vouchers-page-title">
                            My Purchases
                        </h1>
                        <p className="vouchers-page-subtitle">
                            Vouchers that have been revealed to you after purchase
                        </p>
                    </div>

                    {loading ? (
                        <div className="vouchers-loading">
                            <div className="vouchers-spinner"></div>
                            <p className="vouchers-loading-text">Loading your vouchers...</p>
                        </div>
                    ) : purchasedVouchers.length === 0 ? (
                        <div className="vouchers-empty">
                            <div className="vouchers-empty-icon">
                                <span className="material-icons">confirmation_number</span>
                            </div>
                            <h2 className="vouchers-empty-title">
                                No Revealed Vouchers
                            </h2>
                            <p className="vouchers-empty-text">
                                You haven't purchased any vouchers yet.
                            </p>
                            <a
                                href="/marketplace"
                                className="vouchers-cta-button"
                            >
                                Browse Marketplace
                            </a>
                        </div>
                    ) : (
                        <div className="vouchers-grid">
                            {purchasedVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className={`voucher-card voucher-card--${voucher.status === ListingStatus.REVEALED ? 'revealed' : voucher.status === ListingStatus.BUYER_CONFIRMED ? 'confirmed' : 'disputed'}`}
                                >
                                    {/* Voucher Banner Image */}
                                    <div className="voucher-banner">
                                        <img
                                            src={voucher.metadata?.images?.voucher?.original ? getIPFSImageUrl(voucher.metadata.images.voucher.original) : "/img/blank_coupon.png"}
                                            alt={voucher.metadata?.title || `Voucher #${voucher.id}`}
                                            className="voucher-banner-img"
                                            onError={(e) => {
                                                e.currentTarget.src = "/img/blank_coupon.png";
                                            }}
                                        />
                                    </div>

                                    {/* Voucher Content */}
                                    <div className="voucher-content">
                                        <div className="voucher-header">
                                            <h3 className="voucher-title">
                                                {voucher.metadata?.title || `Voucher #${voucher.id}`}
                                            </h3>
                                            <span className={`voucher-status-badge voucher-status-badge--${voucher.status === ListingStatus.REVEALED ? 'revealed' : voucher.status === ListingStatus.BUYER_CONFIRMED ? 'confirmed' : 'disputed'}`}>
                                                {getStatusLabel(voucher.status)}
                                            </span>
                                        </div>

                                        <p className="voucher-brand">
                                            {voucher.metadata?.brand || 'Unknown Brand'}
                                        </p>

                                        <p className="voucher-description">
                                            {voucher.metadata?.description || voucher.partialPattern}
                                        </p>

                                        {/* Voucher Code */}
                                        {voucher.metadata?.code && (
                                            <div className="voucher-code-box">
                                                <p className="voucher-code-label">Voucher Code:</p>
                                                <p className="voucher-code-value">
                                                    {voucher.metadata.code}
                                                </p>
                                            </div>
                                        )}

                                        {/* Price and Value */}
                                        <div className="voucher-price-info">
                                            <span>Paid: {formatPrice(voucher.price)}</span>
                                            <span>Value: {formatPrice(voucher.value)}</span>
                                        </div>

                                        {/* Purchase Date */}
                                        <p className="voucher-date">
                                            Purchased: {formatDate(voucher.createdAt)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {voucher.status === ListingStatus.REVEALED && (
                                        <div className="voucher-actions">
                                            <button
                                                onClick={() => handleConfirm(voucher.id)}
                                                disabled={actionLoading[voucher.id] === 'confirm'}
                                                className="voucher-btn voucher-btn-confirm"
                                            >
                                                {actionLoading[voucher.id] === 'confirm' ? 'Confirming...' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={() => handleDispute(voucher.id)}
                                                disabled={actionLoading[voucher.id] === 'dispute'}
                                                className="voucher-btn voucher-btn-dispute"
                                            >
                                                {actionLoading[voucher.id] === 'dispute' ? 'Disputing...' : 'Dispute'}
                                            </button>
                                        </div>
                                    )}
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