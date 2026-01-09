"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getEnhancedListing } from "@/lib/marketplace";
import { formatPrice as formatListingPrice, getStatusLabel, isListingExpired } from "@/lib/marketplace";
import { getEscrowContract, approveMnee, getMneeBalance, getMneeAllowance, formatTokenAmount } from "@/lib/contracts-instance";
import { ListingStatus } from "@/lib/contracts";
import { EnhancedListingData, getIPFSImageUrl } from "@/lib/ipfs-metadata";

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = Number(params.id);
    const { wallet, ensureSepolia } = useWallet();

    const [listing, setListing] = useState<EnhancedListingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mneeBalance, setMneeBalance] = useState<string>("0");
    const [mneeBalanceWei, setMneeBalanceWei] = useState<bigint>(BigInt(0));
    const [allowance, setAllowance] = useState<string>("0");
    const [allowanceWei, setAllowanceWei] = useState<bigint>(BigInt(0));
    const [isProcessing, setIsProcessing] = useState(false);
    const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    const [priceFormatted, setPriceFormatted] = useState<string>("0");
    const [imageError, setImageError] = useState(false);

    // Fetch listing data
    useEffect(() => {
        async function fetchListing() {
            if (!wallet.provider || !listingId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const listingData = await getEnhancedListing(wallet.provider, listingId);

                if (!listingData) {
                    setError('Listing not found');
                    return;
                }

                console.log('📦 Listing data:', listingData);
                setListing(listingData);

                if (wallet.address) {
                    const balance = await getMneeBalance(wallet.provider, wallet.address);
                    const formattedBalance = await formatTokenAmount(wallet.provider, balance);
                    setMneeBalance(formattedBalance);
                    setMneeBalanceWei(balance);

                    const allowanceAmount = await getMneeAllowance(wallet.provider, wallet.address);
                    const formattedAllowance = await formatTokenAmount(wallet.provider, allowanceAmount);
                    setAllowance(formattedAllowance);
                    setAllowanceWei(allowanceAmount);
                }
            } catch (err: any) {
                console.error('Error fetching listing:', err);
                setError(err.message || 'Failed to fetch listing');
            } finally {
                setIsLoading(false);
            }
        }

        fetchListing();
        const interval = setInterval(fetchListing, 10000);
        return () => clearInterval(interval);
    }, [wallet.provider, listingId, wallet.address]);

    useEffect(() => {
        async function fetchFormattedPrice() {
            if (wallet.provider && listing) {
                const formatted = await formatListingPrice(wallet.provider, listing.price);
                setPriceFormatted(formatted);
            }
        }
        fetchFormattedPrice();
    }, [wallet.provider, listing]);

    const handleApprove = async () => {
        if (!wallet.signer || !listing) {
            alert('Please connect your wallet');
            return;
        }

        try {
            setIsProcessing(true);
            setTxStatus({ type: null, message: '' });
            await ensureSepolia();

            const tx = await approveMnee(wallet.signer, listing.price);
            setTxStatus({ type: null, message: 'Transaction submitted. Waiting for confirmation...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Approval successful!' });

            if (wallet.provider && wallet.address) {
                const newAllowance = await getMneeAllowance(wallet.provider, wallet.address);
                const formatted = await formatTokenAmount(wallet.provider, newAllowance);
                setAllowance(formatted);
                setAllowanceWei(newAllowance);
            }
        } catch (err: any) {
            console.error('Approval error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Approval failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLockPayment = async () => {
        if (!wallet.signer || !listing) {
            alert('Please connect your wallet');
            return;
        }

        try {
            setIsProcessing(true);
            setTxStatus({ type: null, message: '' });
            await ensureSepolia();

            if (wallet.address?.toLowerCase() === listing.seller.toLowerCase()) {
                throw new Error('You cannot buy your own listing');
            }

            if (listing.status !== ListingStatus.LISTED) {
                throw new Error('Listing is no longer available');
            }

            if (isListingExpired(listing)) {
                throw new Error('This listing has expired');
            }

            const currentBalance = await getMneeBalance(wallet.provider!, wallet.address!);
            if (currentBalance < listing.price) {
                throw new Error('Insufficient MNEE balance');
            }

            const currentAllowance = await getMneeAllowance(wallet.provider!, wallet.address!);
            if (currentAllowance < listing.price) {
                throw new Error('Insufficient allowance. Please approve first.');
            }

            const escrowContract = getEscrowContract(wallet.signer);
            const tx = await escrowContract.lockPayment(listingId);
            setTxStatus({ type: null, message: 'Transaction submitted. Waiting for confirmation...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Payment locked successfully! The voucher has been revealed.' });

            const updatedListing = await getEnhancedListing(wallet.provider!, listingId);
            if (updatedListing) {
                setListing(updatedListing);
            }
        } catch (err: any) {
            console.error('Lock payment error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Failed to lock payment' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmVoucher = async () => {
        if (!wallet.signer || !listing) return;

        try {
            setIsProcessing(true);
            setTxStatus({ type: null, message: '' });

            if (listing.status !== ListingStatus.REVEALED) {
                throw new Error('Voucher must be revealed first');
            }

            const escrowContract = getEscrowContract(wallet.signer);
            const tx = await escrowContract.confirmVoucher(listingId);
            setTxStatus({ type: null, message: 'Transaction submitted...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Voucher confirmed! Payment released to seller.' });

            const updatedListing = await getEnhancedListing(wallet.provider!, listingId);
            if (updatedListing) setListing(updatedListing);
        } catch (err: any) {
            console.error('Confirm error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Failed to confirm voucher' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisputeVoucher = async () => {
        if (!wallet.signer || !listing) return;

        const evidenceCID = prompt('Enter evidence CID (IPFS hash) for the dispute:');
        if (!evidenceCID) return;

        try {
            setIsProcessing(true);
            setTxStatus({ type: null, message: '' });

            if (listing.status !== ListingStatus.REVEALED) {
                throw new Error('Voucher must be revealed first');
            }

            const escrowContract = getEscrowContract(wallet.signer);
            const tx = await escrowContract.disputeVoucher(listingId, evidenceCID);
            setTxStatus({ type: null, message: 'Dispute submitted...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Dispute raised successfully. Admin will review.' });

            const updatedListing = await getEnhancedListing(wallet.provider!, listingId);
            if (updatedListing) setListing(updatedListing);
        } catch (err: any) {
            console.error('Dispute error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Failed to raise dispute' });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatExpiryDate = (timestamp: bigint) => {
        if (timestamp === BigInt(0)) return 'No expiry';
        const date = new Date(Number(timestamp) * 1000);
        const isExpired = date < new Date();
        return isExpired ? `Expired: ${date.toLocaleDateString()}` : date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-off-white">
                <Header pageType="marketplace" />
                <div className="listing-detail-page">
                    <div className="listing-detail-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading listing details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-off-white">
                <Header pageType="marketplace" />
                <div className="listing-detail-page">
                    <div className="listing-detail-error">
                        <span className="material-icons">error_outline</span>
                        <p>{error || 'Listing not found'}</p>
                        <button onClick={() => router.push('/marketplace')} className="back-to-marketplace-btn">
                            <span className="material-icons">arrow_back</span>
                            Back to Marketplace
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const isBuyer = wallet.address?.toLowerCase() === listing.buyer?.toLowerCase();
    const isSeller = wallet.address?.toLowerCase() === listing.seller.toLowerCase();
    const needsApproval = allowanceWei < listing.price;
    const hasEnoughBalance = mneeBalanceWei >= listing.price;

    // Get image URLs from metadata
    const logoUrl = listing.metadata?.images?.logo?.original
        ? getIPFSImageUrl(listing.metadata.images.logo.original)
        : '';
    const voucherImageUrl = listing.metadata?.images?.voucher?.blurred
        ? getIPFSImageUrl(listing.metadata.images.voucher.blurred)
        : listing.previewImageUrl || '';

    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="marketplace" />

            <div className="listing-detail-page">
                <button onClick={() => router.push('/marketplace')} className="back-to-marketplace-btn">
                    <span className="material-icons">arrow_back</span>
                    Back to Marketplace
                </button>

                <div className="listing-detail-grid">
                    {/* Left Column - Images & Basic Info */}
                    <div className="listing-detail-left">
                        {/* Main Image */}
                        <div className="listing-detail-image-container">
                            {logoUrl && (
                                <img
                                    src={logoUrl}
                                    alt="Brand logo"
                                    className="listing-detail-logo"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            )}
                            <img
                                src={!imageError && voucherImageUrl ? voucherImageUrl : "/img/blank_coupon.png"}
                                alt={listing.title}
                                className="listing-detail-image"
                                onError={() => setImageError(true)}
                            />
                            <div className="listing-detail-image-overlay">
                                <span className="material-icons">lock</span>
                                <span>Full image revealed after purchase</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {listing.tags && listing.tags.length > 0 && (
                            <div className="listing-detail-tags">
                                {listing.tags.map((tag, i) => (
                                    <span key={i} className="listing-tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details & Actions */}
                    <div className="listing-detail-right">
                        {/* Header */}
                        <div className="listing-detail-header">
                            <div className="listing-detail-title-row">
                                <h1 className="listing-detail-title">
                                    {listing.metadata?.title || listing.title || `Voucher #${listing.id}`}
                                </h1>
                                <span className={`listing-detail-status listing-detail-status--${getStatusLabel(listing.status).toLowerCase().replace(' ', '-')}`}>
                                    {getStatusLabel(listing.status)}
                                </span>
                            </div>
                            <div className="listing-detail-brand-row">
                                <span className="listing-detail-brand">
                                    <span className="material-icons">store</span>
                                    {listing.metadata?.brand || listing.brand || 'Unknown Brand'}
                                </span>
                                <span className="listing-detail-type">{listing.metadata?.type || 'Voucher'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="listing-detail-description">
                            <p>{listing.metadata?.description || listing.description}</p>
                        </div>

                        {/* Price Card */}
                        <div className="listing-detail-price-card">
                            <div className="price-card-main">
                                <span className="price-label">Price</span>
                                <span className="price-value">{priceFormatted} MNEE</span>
                            </div>
                            {listing.metadata?.value && listing.metadata.value > 0 && (
                                <div className="price-card-value">
                                    <span className="material-icons">payments</span>
                                    <span>Face Value: ₹{listing.metadata.value}</span>
                                </div>
                            )}
                            {listing.metadata?.discountPercentage && listing.metadata.discountPercentage > 0 && (
                                <div className="price-card-discount">
                                    <span className="material-icons">local_offer</span>
                                    <span>{listing.metadata.discountPercentage}% OFF</span>
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="listing-detail-info-grid">
                            <div className="info-grid-item">
                                <span className="material-icons">fingerprint</span>
                                <div>
                                    <span className="info-label">Partial Code</span>
                                    <span className="info-value code">{listing.partialPattern || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="info-grid-item">
                                <span className="material-icons">schedule</span>
                                <div>
                                    <span className="info-label">Expiry</span>
                                    <span className="info-value">{formatExpiryDate(listing.expiryTimestamp)}</span>
                                </div>
                            </div>
                            <div className="info-grid-item">
                                <span className="material-icons">person</span>
                                <div>
                                    <span className="info-label">Seller</span>
                                    <span className="info-value address">{listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</span>
                                </div>
                            </div>
                            {listing.isVerified && (
                                <div className="info-grid-item verified">
                                    <span className="material-icons">verified</span>
                                    <div>
                                        <span className="info-label">AI Verified</span>
                                        <span className="info-value">Authenticity checked</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Wallet Balance Section */}
                        {wallet.isConnected && (
                            <div className="listing-detail-wallet">
                                <div className="wallet-balance-row">
                                    <span>Your MNEE Balance:</span>
                                    <span className="balance-amount">{mneeBalance} MNEE</span>
                                </div>
                                <div className="wallet-balance-row">
                                    <span>Approved Allowance:</span>
                                    <span className="balance-amount">{allowance} MNEE</span>
                                </div>
                                {needsApproval && (
                                    <div className="wallet-warning">
                                        <span className="material-icons">warning</span>
                                        You need to approve MNEE spending first
                                    </div>
                                )}
                                {!hasEnoughBalance && (
                                    <div className="wallet-warning error">
                                        <span className="material-icons">error</span>
                                        Insufficient MNEE balance
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Transaction Status */}
                        {txStatus.type && (
                            <div className={`listing-detail-tx-status ${txStatus.type}`}>
                                <span className="material-icons">
                                    {txStatus.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {txStatus.message}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="listing-detail-actions">
                            {wallet.isConnected && !isSeller && listing.status === ListingStatus.LISTED && (
                                <>
                                    {needsApproval ? (
                                        <button
                                            onClick={handleApprove}
                                            disabled={isProcessing || !hasEnoughBalance}
                                            className="action-btn approve"
                                        >
                                            <span className="material-icons">check_circle</span>
                                            {isProcessing ? 'Processing...' : 'Approve MNEE'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleLockPayment}
                                            disabled={isProcessing || !hasEnoughBalance}
                                            className="action-btn buy"
                                        >
                                            <span className="material-icons">shopping_cart</span>
                                            {isProcessing ? 'Processing...' : 'Buy Now'}
                                        </button>
                                    )}
                                </>
                            )}

                            {wallet.isConnected && isSeller && (
                                <div className="action-message seller">
                                    <span className="material-icons">info</span>
                                    This is your listing. You cannot purchase it.
                                </div>
                            )}

                            {wallet.isConnected && !isSeller && listing.status !== ListingStatus.LISTED && listing.status !== ListingStatus.REVEALED && (
                                <div className="action-message">
                                    <span className="material-icons">info</span>
                                    This listing is not available (Status: {getStatusLabel(listing.status)})
                                </div>
                            )}

                            {wallet.isConnected && isBuyer && listing.status === ListingStatus.REVEALED && (
                                <div className="buyer-confirm-actions">
                                    <button onClick={handleConfirmVoucher} disabled={isProcessing} className="action-btn confirm">
                                        <span className="material-icons">thumb_up</span>
                                        {isProcessing ? 'Processing...' : 'Confirm Working'}
                                    </button>
                                    <button onClick={handleDisputeVoucher} disabled={isProcessing} className="action-btn dispute">
                                        <span className="material-icons">report_problem</span>
                                        {isProcessing ? 'Processing...' : 'Report Issue'}
                                    </button>
                                </div>
                            )}

                            {!wallet.isConnected && (
                                <div className="action-message connect">
                                    <span className="material-icons">account_balance_wallet</span>
                                    Connect your wallet to purchase this voucher
                                </div>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        {listing.metadata?.terms && (
                            <details className="listing-detail-terms">
                                <summary>
                                    <span className="material-icons">description</span>
                                    Terms & Conditions
                                </summary>
                                <p>{listing.metadata.terms}</p>
                            </details>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
