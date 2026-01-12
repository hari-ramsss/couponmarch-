"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { getAllListings } from "@/lib/marketplace";
import { confirmVoucher, disputeVoucher } from "@/lib/escrow";
import { ListingStatus } from "@/lib/contracts";
import { EnhancedListingData } from "@/lib/ipfs-metadata";
import { getIPFSImageUrl, enhanceListingWithMetadata } from "@/lib/ipfs-metadata";
import { resolveIPFSHash } from "@/lib/ipfs-resolver";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyPurchasesPage() {
    const [purchasedVouchers, setPurchasedVouchers] = useState<EnhancedListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: 'confirm' | 'dispute' | null }>({});
    const [copiedCode, setCopiedCode] = useState<number | null>(null);
    const { wallet } = useWallet();

    useEffect(() => {
        async function fetchPurchasedVouchers() {
            if (!wallet.isConnected || !wallet.provider || !wallet.address) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const allListings = await getAllListings(wallet.provider);

                const userRevealedListings = allListings.filter(listing =>
                    listing.buyer.toLowerCase() === wallet.address?.toLowerCase() &&
                    (listing.status === ListingStatus.REVEALED ||
                        listing.status === ListingStatus.BUYER_CONFIRMED ||
                        listing.status === ListingStatus.BUYER_DISPUTED ||
                        listing.status === ListingStatus.RELEASED)
                );

                const enhancedVouchers: EnhancedListingData[] = [];
                for (const listing of userRevealedListings) {
                    try {
                        const ipfsHash = await resolveIPFSHash(wallet.provider, listing.id);
                        const enhanced = await enhanceListingWithMetadata(listing, wallet.provider, ipfsHash || undefined);
                        enhancedVouchers.push(enhanced);
                    } catch (error) {
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
        if (!wallet.signer) return alert('Please connect your wallet');
        try {
            setActionLoading(prev => ({ ...prev, [listingId]: 'confirm' }));
            const tx = await confirmVoucher(wallet.signer, listingId);
            await tx.wait();
            setPurchasedVouchers(prev => prev.map(v => v.id === listingId ? { ...v, status: ListingStatus.BUYER_CONFIRMED } : v));
            alert('Voucher confirmed!');
        } catch (error: any) {
            alert(error.message || 'Failed to confirm');
        } finally {
            setActionLoading(prev => ({ ...prev, [listingId]: null }));
        }
    };

    const handleDispute = async (listingId: number) => {
        if (!wallet.signer) return alert('Please connect your wallet');
        const evidenceCID = prompt('Provide evidence (IPFS CID):');
        if (!evidenceCID) return;
        try {
            setActionLoading(prev => ({ ...prev, [listingId]: 'dispute' }));
            const tx = await disputeVoucher(wallet.signer, listingId, evidenceCID);
            await tx.wait();
            setPurchasedVouchers(prev => prev.map(v => v.id === listingId ? { ...v, status: ListingStatus.BUYER_DISPUTED } : v));
            alert('Dispute submitted!');
        } catch (error: any) {
            alert(error.message || 'Failed to dispute');
        } finally {
            setActionLoading(prev => ({ ...prev, [listingId]: null }));
        }
    };

    const handleCopyCode = (code: string, voucherId: number) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(voucherId);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getStatusLabel = (status: ListingStatus) => {
        switch (status) {
            case ListingStatus.REVEALED: return 'Revealed';
            case ListingStatus.BUYER_CONFIRMED: return 'Confirmed';
            case ListingStatus.BUYER_DISPUTED: return 'Disputed';
            case ListingStatus.RELEASED: return 'Completed';
            default: return 'Unknown';
        }
    };

    const formatMNEE = (price: bigint) => `${(Number(price) / 1e18).toFixed(2)}`;
    const formatDate = (timestamp: bigint) => new Date(Number(timestamp) * 1000).toLocaleDateString();
    const formatValue = (val: number | bigint | undefined) => {
        if (!val) return null;
        const num = typeof val === 'bigint' ? Number(val) : val;
        if (num === 0) return null;
        return `₹${num.toLocaleString()}`;
    };

    const formatExpiry = (timestamp: number | bigint | undefined) => {
        if (!timestamp) return 'No expiry';
        const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
        if (ts === 0) return 'No expiry';
        const date = new Date(ts * 1000);
        return date < new Date() ? `Expired ${date.toLocaleDateString()}` : date.toLocaleDateString();
    };

    if (!wallet.isConnected) {
        return (
            <>
                <Header pageType="vouchers" />
                <main className="purchases-page">
                    <div className="purchases-container">
                        <div className="purchases-empty">
                            <span className="material-icons">account_balance_wallet</span>
                            <h1>Connect Your Wallet</h1>
                            <p>Please connect your wallet to view your purchased vouchers.</p>
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
            <main className="purchases-page">
                <div className="purchases-container">
                    <div className="purchases-header">
                        <h1>My Purchases</h1>
                        <p>Your purchased vouchers with revealed codes</p>
                    </div>

                    {loading ? (
                        <div className="purchases-loading"><div className="loading-spinner"></div><p>Loading...</p></div>
                    ) : purchasedVouchers.length === 0 ? (
                        <div className="purchases-empty">
                            <span className="material-icons">shopping_bag</span>
                            <h2>No Purchases Yet</h2>
                            <p>Browse the marketplace to find vouchers!</p>
                            <a href="/marketplace" className="purchases-cta"><span className="material-icons">storefront</span>Browse Marketplace</a>
                        </div>
                    ) : (
                        <div className="purchases-grid">
                            {purchasedVouchers.map((v) => (
                                <div key={v.id} className={`purchase-card purchase-card--${v.status === ListingStatus.REVEALED ? 'revealed' : v.status === ListingStatus.BUYER_CONFIRMED ? 'confirmed' : v.status === ListingStatus.RELEASED ? 'completed' : 'disputed'}`}>
                                    {/* Header with Image */}
                                    <div className="pc-header">
                                        <div className="pc-image">
                                            <img src={v.metadata?.images?.voucher?.original ? getIPFSImageUrl(v.metadata.images.voucher.original) : "/img/blank_coupon.png"} alt={v.title} onError={(e) => { e.currentTarget.src = "/img/blank_coupon.png"; }} />
                                            {v.metadata?.images?.logo?.original && (
                                                <img src={getIPFSImageUrl(v.metadata.images.logo.original)} alt="logo" className="pc-logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            )}
                                        </div>
                                        <span className={`pc-status pc-status--${v.status === ListingStatus.REVEALED ? 'revealed' : v.status === ListingStatus.BUYER_CONFIRMED ? 'confirmed' : v.status === ListingStatus.RELEASED ? 'completed' : 'disputed'}`}>
                                            {getStatusLabel(v.status)}
                                        </span>
                                    </div>

                                    {/* Voucher Details Section */}
                                    <div className="pc-details-section">
                                        {/* Voucher Name */}
                                        <div className="pc-field">
                                            <span className="pc-label">Voucher Name</span>
                                            <span className="pc-value title">{v.metadata?.title || v.title || `Voucher #${v.id}`}</span>
                                        </div>

                                        {/* Voucher Type */}
                                        <div className="pc-field">
                                            <span className="pc-label">Voucher Type</span>
                                            <span className="pc-value">{v.metadata?.type || 'Gift Card'}</span>
                                        </div>

                                        {/* Brand */}
                                        <div className="pc-field">
                                            <span className="pc-label">Brand</span>
                                            <span className="pc-value">{v.metadata?.brand || v.brand || 'Unknown'}</span>
                                        </div>

                                        {/* Description */}
                                        <div className="pc-field full">
                                            <span className="pc-label">Description</span>
                                            <span className="pc-value desc">{v.metadata?.description || v.description || 'No description available'}</span>
                                        </div>

                                        {/* Voucher Code - Highlighted */}
                                        <div className="pc-field full code-field">
                                            <span className="pc-label">Voucher Code</span>
                                            {v.metadata?.code ? (
                                                <div className="pc-code-box">
                                                    <code>{v.metadata.code}</code>
                                                    <button onClick={() => handleCopyCode(v.metadata!.code, v.id)} className="pc-copy-btn">
                                                        <span className="material-icons">{copiedCode === v.id ? 'check' : 'content_copy'}</span>
                                                    </button>
                                                    {copiedCode === v.id && <span className="pc-copied">Copied!</span>}
                                                </div>
                                            ) : v.partialPattern ? (
                                                <div className="pc-code-box partial">
                                                    <code>{v.partialPattern}</code>
                                                    <span className="pc-partial-note">Partial code from blockchain</span>
                                                </div>
                                            ) : (
                                                <span className="pc-value pending">IPFS metadata not found - check debug tool</span>
                                            )}
                                        </div>

                                        {/* Partial Pattern */}
                                        {v.partialPattern && (
                                            <div className="pc-field">
                                                <span className="pc-label">Partial Pattern</span>
                                                <span className="pc-value mono">{v.partialPattern}</span>
                                            </div>
                                        )}

                                        {/* Face Value */}
                                        <div className="pc-field">
                                            <span className="pc-label">Face Value</span>
                                            <span className="pc-value highlight">{formatValue(v.metadata?.value) || formatValue(v.value) || 'N/A'}</span>
                                        </div>

                                        {/* Price Paid */}
                                        <div className="pc-field">
                                            <span className="pc-label">Price Paid</span>
                                            <span className="pc-value">{formatMNEE(v.price)} MNEE</span>
                                        </div>

                                        {/* Discount */}
                                        {v.metadata?.discountPercentage && v.metadata.discountPercentage > 0 && (
                                            <div className="pc-field">
                                                <span className="pc-label">Discount</span>
                                                <span className="pc-value discount">{v.metadata.discountPercentage}% OFF</span>
                                            </div>
                                        )}

                                        {/* Expiry Date */}
                                        <div className="pc-field">
                                            <span className="pc-label">Expiry Date</span>
                                            <span className="pc-value">{formatExpiry(v.metadata?.expiryTimestamp || v.expiryTimestamp)}</span>
                                        </div>

                                        {/* Purchase Date */}
                                        <div className="pc-field">
                                            <span className="pc-label">Purchase Date</span>
                                            <span className="pc-value">{formatDate(v.createdAt)}</span>
                                        </div>

                                        {/* Seller */}
                                        <div className="pc-field">
                                            <span className="pc-label">Seller</span>
                                            <span className="pc-value mono">{v.seller.slice(0, 6)}...{v.seller.slice(-4)}</span>
                                        </div>

                                        {/* Verification Status */}
                                        <div className="pc-field">
                                            <span className="pc-label">Verification</span>
                                            <span className={`pc-value ${v.isVerified ? 'verified' : ''}`}>
                                                {v.isVerified ? '✓ AI Verified' : 'Not verified'}
                                            </span>
                                        </div>

                                        {/* Terms */}
                                        {v.metadata?.terms && (
                                            <div className="pc-field full">
                                                <span className="pc-label">Terms & Conditions</span>
                                                <span className="pc-value terms">{v.metadata.terms}</span>
                                            </div>
                                        )}

                                        {/* Usage Instructions */}
                                        {v.metadata?.usageInstructions && (
                                            <div className="pc-field full">
                                                <span className="pc-label">How to Use</span>
                                                <span className="pc-value">{v.metadata.usageInstructions}</span>
                                            </div>
                                        )}

                                        {/* Restrictions */}
                                        {v.metadata?.restrictions && (
                                            <div className="pc-field full">
                                                <span className="pc-label">Restrictions</span>
                                                <span className="pc-value">{v.metadata.restrictions}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {v.status === ListingStatus.REVEALED && (
                                        <div className="pc-actions">
                                            <button onClick={() => handleConfirm(v.id)} disabled={actionLoading[v.id] === 'confirm'} className="pc-btn confirm">
                                                <span className="material-icons">thumb_up</span>{actionLoading[v.id] === 'confirm' ? 'Confirming...' : 'Confirm Working'}
                                            </button>
                                            <button onClick={() => handleDispute(v.id)} disabled={actionLoading[v.id] === 'dispute'} className="pc-btn dispute">
                                                <span className="material-icons">report_problem</span>{actionLoading[v.id] === 'dispute' ? 'Disputing...' : 'Report Issue'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Status Footer */}
                                    {v.status === ListingStatus.BUYER_CONFIRMED && (
                                        <div className="pc-footer confirmed"><span className="material-icons">check_circle</span>Confirmed - Seller has been paid</div>
                                    )}
                                    {v.status === ListingStatus.RELEASED && (
                                        <div className="pc-footer completed"><span className="material-icons">verified</span>Completed - Transaction finalized</div>
                                    )}
                                    {v.status === ListingStatus.BUYER_DISPUTED && (
                                        <div className="pc-footer disputed"><span className="material-icons">gavel</span>Dispute submitted - Awaiting resolution</div>
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
