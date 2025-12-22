"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getListing, ListingData, formatPrice as formatListingPrice, getStatusLabel, isListingExpired } from "@/lib/marketplace";
import { getEscrowContract, approveMnee, getMneeBalance, getMneeAllowance, formatTokenAmount } from "@/lib/contracts-instance";
import { ListingStatus } from "@/lib/contracts";

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = Number(params.id);
    const { wallet, ensureSepolia } = useWallet();

    const [listing, setListing] = useState<ListingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mneeBalance, setMneeBalance] = useState<string>("0");
    const [mneeBalanceWei, setMneeBalanceWei] = useState<bigint>(BigInt(0));
    const [allowance, setAllowance] = useState<string>("0");
    const [allowanceWei, setAllowanceWei] = useState<bigint>(BigInt(0));
    const [isProcessing, setIsProcessing] = useState(false);
    const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
    // Moved up so it's always called in the same order
    const [priceFormatted, setPriceFormatted] = useState<string>("0");

    // Fetch listing data
    useEffect(() => {
        async function fetchListing() {
            if (!wallet.provider || !listingId) {
                setIsLoading(false);
                return;
            }

            try {
                // Disable loading state for testing
                // setIsLoading(true);
                setError(null);
                const listingData = await getListing(wallet.provider, listingId);

                if (!listingData) {
                    setError('Listing not found');
                    return;
                }

                setListing(listingData);

                // Fetch user's MNEE balance and allowance
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
                // Keep loading disabled for testing
                setIsLoading(false);
            }
        }

        fetchListing();
        const interval = setInterval(fetchListing, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [wallet.provider, listingId, wallet.address]);

    // Moved this effect up so it's not after early returns
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

            // Ensure on Sepolia
            await ensureSepolia();

            // Parse price amount
            const priceAmount = listing.price;

            // Approve escrow to spend tokens
            const tx = await approveMnee(wallet.signer, priceAmount);
            setTxStatus({ type: null, message: 'Transaction submitted. Waiting for confirmation...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Approval successful!' });

            // Refresh allowance
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

            // Ensure on Sepolia
            await ensureSepolia();

            // Check if user is the seller
            if (wallet.address?.toLowerCase() === listing.seller.toLowerCase()) {
                throw new Error('You cannot buy your own listing');
            }

            // Check if listing is still available
            if (listing.status !== ListingStatus.LISTED) {
                throw new Error('Listing is no longer available');
            }

            // Check if expired
            if (isListingExpired(listing)) {
                throw new Error('This listing has expired');
            }

            // Check balance (refresh first)
            const currentBalance = await getMneeBalance(wallet.provider!, wallet.address!);
            if (currentBalance < listing.price) {
                throw new Error('Insufficient MNEE balance');
            }

            // Check allowance
            const currentAllowance = await getMneeAllowance(wallet.provider!, wallet.address!);
            if (currentAllowance < listing.price) {
                throw new Error('Insufficient allowance. Please approve first.');
            }

            // Lock payment
            const escrowContract = getEscrowContract(wallet.signer);
            const tx = await escrowContract.lockPayment(listingId);
            setTxStatus({ type: null, message: 'Transaction submitted. Waiting for confirmation...' });

            await tx.wait();
            setTxStatus({ type: 'success', message: 'Payment locked successfully! The seller will now reveal the voucher.' });

            // Refresh listing
            const updatedListing = await getListing(wallet.provider!, listingId);
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
        if (!wallet.signer || !listing) {
            return;
        }

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
            setTxStatus({ type: 'success', message: 'Voucher confirmed! Payment will be released to seller.' });

            // Refresh listing
            const updatedListing = await getListing(wallet.provider!, listingId);
            if (updatedListing) {
                setListing(updatedListing);
            }
        } catch (err: any) {
            console.error('Confirm error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Failed to confirm voucher' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisputeVoucher = async () => {
        if (!wallet.signer || !listing) {
            return;
        }

        const evidenceCID = prompt('Enter evidence CID (IPFS hash) for the dispute:');
        if (!evidenceCID) {
            return;
        }

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

            // Refresh listing
            const updatedListing = await getListing(wallet.provider!, listingId);
            if (updatedListing) {
                setListing(updatedListing);
            }
        } catch (err: any) {
            console.error('Dispute error:', err);
            setTxStatus({ type: 'error', message: err.message || 'Failed to raise dispute' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-off-white">
                <Header pageType="marketplace" />
                <div className="listing-detail-container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading listing...</p>
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
                <div className="listing-detail-container">
                    <div className="error-state">
                        <p className="error-message">{error || 'Listing not found'}</p>
                        <button onClick={() => router.push('/marketplace')} className="back-btn">
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

    // Compare BigInt values directly
    const needsApproval = allowanceWei < listing.price;
    const hasEnoughBalance = mneeBalanceWei >= listing.price;

    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="marketplace" />

            <div className="listing-detail-container">
                <button onClick={() => router.push('/marketplace')} className="back-btn">
                    ← Back to Marketplace
                </button>

                <div className="listing-detail-card">
                    <h1 className="listing-detail-title">Listing #{listing.id}</h1>

                    <div className="listing-info-section">
                        <div className="info-item">
                            <span className="info-label">Status:</span>
                            <span className={`status-badge status-${getStatusLabel(listing.status).toLowerCase().replace(' ', '-')}`}>
                                {getStatusLabel(listing.status)}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Seller:</span>
                            <span className="wallet-address-display">{listing.seller}</span>
                        </div>
                        {listing.buyer && listing.buyer !== '0x0000000000000000000000000000000000000000' && (
                            <div className="info-item">
                                <span className="info-label">Buyer:</span>
                                <span className="wallet-address-display">{listing.buyer}</span>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="info-label">Partial Code Pattern:</span>
                            <span className="code-pattern">{listing.partialPattern || 'N/A'}</span>
                        </div>
                        <div className="info-item price-item">
                            <span className="info-label">Price:</span>
                            <span className="price-display">{priceFormatted} MNEE</span>
                        </div>
                        {listing.value > BigInt(0) && (
                            <div className="info-item">
                                <span className="info-label">Voucher Value:</span>
                                <span className="value-display">{listing.value.toString()}</span>
                            </div>
                        )}
                        {listing.expiryTimestamp > BigInt(0) && (
                            <div className="info-item">
                                <span className="info-label">Expires:</span>
                                <span className="expiry-display">{new Date(Number(listing.expiryTimestamp) * 1000).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {wallet.isConnected && (
                        <div className="wallet-balance-section">
                            <div className="balance-item">
                                <span className="balance-label">Your MNEE Balance:</span>
                                <span className="balance-value">{mneeBalance} MNEE</span>
                            </div>
                            <div className="balance-item">
                                <span className="balance-label">Current Allowance:</span>
                                <span className="balance-value">{allowance} MNEE</span>
                            </div>
                            {needsApproval && (
                                <div className="warning-message approval-warning">
                                    ⚠️ You need to approve MNEE spending first
                                </div>
                            )}
                            {!hasEnoughBalance && (
                                <div className="warning-message balance-warning">
                                    ⚠️ Insufficient MNEE balance
                                </div>
                            )}
                        </div>
                    )}

                    {txStatus.type && (
                        <div className={`tx-status ${txStatus.type === 'success' ? 'tx-success' : 'tx-error'}`}>
                            {txStatus.message}
                        </div>
                    )}

                    {/* Buyer Actions */}
                    {wallet.isConnected && !isSeller && listing.status === ListingStatus.LISTED && (
                        <div className="buyer-actions">
                            {needsApproval ? (
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing || !hasEnoughBalance}
                                    className={`verified-buy-btn ${isProcessing || !hasEnoughBalance ? 'disabled' : ''}`}
                                >
                                    {isProcessing ? 'Processing...' : 'Approve MNEE'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleLockPayment}
                                    disabled={isProcessing || !hasEnoughBalance}
                                    className={`verified-buy-btn premium ${isProcessing || !hasEnoughBalance ? 'disabled' : ''}`}
                                >
                                    {isProcessing ? 'Processing...' : 'Lock Payment & Buy'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Show why buttons are not available */}
                    {wallet.isConnected && isSeller && (
                        <div className="info-message seller-message">
                            <p>📝 This is your own listing. You cannot purchase it.</p>
                        </div>
                    )}

                    {wallet.isConnected && !isSeller && listing.status !== ListingStatus.LISTED && (
                        <div className="info-message status-message">
                            <p>⏳ This listing is not available for purchase (Status: {getStatusLabel(listing.status)})</p>
                        </div>
                    )}

                    {/* Buyer can confirm or dispute after reveal */}
                    {wallet.isConnected && isBuyer && listing.status === ListingStatus.REVEALED && (
                        <div className="confirm-dispute-actions">
                            <button
                                onClick={handleConfirmVoucher}
                                disabled={isProcessing}
                                className={`verified-buy-btn ${isProcessing ? 'disabled' : ''}`}
                            >
                                Confirm Voucher Valid
                            </button>
                            <button
                                onClick={handleDisputeVoucher}
                                disabled={isProcessing}
                                className={`secure-buy-btn ${isProcessing ? 'disabled' : ''}`}
                            >
                                Dispute Voucher
                            </button>
                        </div>
                    )}

                    {!wallet.isConnected && (
                        <div className="connect-wallet-message">
                            Please connect your wallet to interact with this listing.
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}