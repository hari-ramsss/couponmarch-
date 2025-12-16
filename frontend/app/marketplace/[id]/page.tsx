"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getListing, ListingData, formatPrice as formatListingPrice, getStatusLabel, isListingExpired } from "@/lib/marketplace";
import { getEscrowContract, getMockERC20Contract, approveMnee, getMneeBalance, getMneeAllowance, formatTokenAmount, parseTokenAmount } from "@/lib/contracts-instance";
import { ListingStatus, ESCROW_ADDRESS } from "@/lib/contracts";

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = Number(params.id);
    const { wallet, ensureSepolia } = useWallet();
    
    const [listing, setListing] = useState<ListingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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
                setIsLoading(true);
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
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading listing...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-off-white">
                <Header pageType="marketplace" />
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'red' }}>{error || 'Listing not found'}</p>
                    <button onClick={() => router.push('/marketplace')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
                        Back to Marketplace
                    </button>
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
            
            <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={() => router.push('/marketplace')} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
                    ← Back to Marketplace
                </button>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Listing #{listing.id}</h1>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <p><strong>Status:</strong> {getStatusLabel(listing.status)}</p>
                        <p><strong>Seller:</strong> {listing.seller}</p>
                        {listing.buyer && listing.buyer !== '0x0000000000000000000000000000000000000000' && (
                            <p><strong>Buyer:</strong> {listing.buyer}</p>
                        )}
                        <p><strong>Partial Code Pattern:</strong> {listing.partialPattern || 'N/A'}</p>
                        <p><strong>Price:</strong> {priceFormatted} MNEE</p>
                        {listing.value > BigInt(0) && (
                            <p><strong>Voucher Value:</strong> {listing.value.toString()}</p>
                        )}
                        {listing.expiryTimestamp > BigInt(0) && (
                            <p><strong>Expires:</strong> {new Date(Number(listing.expiryTimestamp) * 1000).toLocaleString()}</p>
                        )}
                    </div>

                    {wallet.isConnected && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                            <p><strong>Your MNEE Balance:</strong> {mneeBalance} MNEE</p>
                            <p><strong>Current Allowance:</strong> {allowance} MNEE</p>
                            {needsApproval && (
                                <p style={{ color: 'orange' }}>⚠️ You need to approve MNEE spending first</p>
                            )}
                            {!hasEnoughBalance && (
                                <p style={{ color: 'red' }}>⚠️ Insufficient MNEE balance</p>
                            )}
                        </div>
                    )}

                    {txStatus.type && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '4px',
                            background: txStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: txStatus.type === 'success' ? '#155724' : '#721c24'
                        }}>
                            {txStatus.message}
                        </div>
                    )}

                    {/* Buyer Actions */}
                    {wallet.isConnected && !isSeller && listing.status === ListingStatus.LISTED && (
                        <div style={{ marginTop: '2rem' }}>
                            {needsApproval ? (
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing || !hasEnoughBalance}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        background: '#F2352B',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        opacity: isProcessing ? 0.6 : 1
                                    }}
                                >
                                    {isProcessing ? 'Processing...' : 'Approve MNEE'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleLockPayment}
                                    disabled={isProcessing || !hasEnoughBalance}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '1rem',
                                        background: '#F2352B',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        opacity: isProcessing ? 0.6 : 1
                                    }}
                                >
                                    {isProcessing ? 'Processing...' : 'Lock Payment & Buy'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Buyer can confirm or dispute after reveal */}
                    {wallet.isConnected && isBuyer && listing.status === ListingStatus.REVEALED && (
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleConfirmVoucher}
                                disabled={isProcessing}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    background: '#00C7B1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Confirm Voucher Valid
                            </button>
                            <button
                                onClick={handleDisputeVoucher}
                                disabled={isProcessing}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '1rem',
                                    background: '#FF8A2A',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Dispute Voucher
                            </button>
                        </div>
                    )}

                    {!wallet.isConnected && (
                        <p style={{ marginTop: '1rem', color: '#666' }}>
                            Please connect your wallet to interact with this listing.
                        </p>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}