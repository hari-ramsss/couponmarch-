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
    const [revealedVouchers, setRevealedVouchers] = useState<EnhancedListingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: 'confirm' | 'dispute' | null }>({});
    const { wallet } = useWallet();

    // Fetch revealed vouchers for the current user
    useEffect(() => {
        async function fetchRevealedVouchers() {
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

                setRevealedVouchers(enhancedVouchers);
            } catch (error) {
                console.error('Error fetching revealed vouchers:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRevealedVouchers();
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
            setRevealedVouchers(prev => 
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
            setRevealedVouchers(prev => 
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
                <Header />
                <main className="min-h-screen bg-gray-50 py-8">
                    <div className="container mx-auto px-4">
                        <div className="text-center py-16">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Connect Your Wallet
                            </h1>
                            <p className="text-gray-600">
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
            <Header />
            <main className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Revealed Vouchers
                        </h1>
                        <p className="text-gray-600">
                            Vouchers that have been revealed to you after purchase
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading your vouchers...</p>
                        </div>
                    ) : revealedVouchers.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🎫</div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                No Revealed Vouchers
                            </h2>
                            <p className="text-gray-600 mb-6">
                                You haven't purchased any vouchers yet.
                            </p>
                            <a
                                href="/marketplace"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Browse Marketplace
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {revealedVouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className={`rounded-lg border-2 p-6 shadow-sm transition-all hover:shadow-md ${getCardBackgroundClass(voucher.status)}`}
                                >
                                    {/* Voucher Image */}
                                    {voucher.metadata?.images?.voucher?.original && (
                                        <div className="mb-4">
                                            <img
                                                src={getIPFSImageUrl(voucher.metadata.images.voucher.original)}
                                                alt={voucher.metadata.title || `Voucher #${voucher.id}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Voucher Details */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {voucher.metadata?.title || `Voucher #${voucher.id}`}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                voucher.status === ListingStatus.REVEALED ? 'bg-yellow-100 text-yellow-800' :
                                                voucher.status === ListingStatus.BUYER_CONFIRMED ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {getStatusLabel(voucher.status)}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-600 text-sm mb-2">
                                            {voucher.metadata?.brand || 'Unknown Brand'}
                                        </p>
                                        
                                        <p className="text-gray-700 text-sm mb-3">
                                            {voucher.metadata?.description || voucher.partialPattern}
                                        </p>

                                        {/* Voucher Code */}
                                        {voucher.metadata?.code && (
                                            <div className="bg-gray-100 p-3 rounded-lg mb-3">
                                                <p className="text-xs text-gray-600 mb-1">Voucher Code:</p>
                                                <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                                                    {voucher.metadata.code}
                                                </p>
                                            </div>
                                        )}

                                        {/* Price and Value */}
                                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                                            <span>Paid: {formatPrice(voucher.price)}</span>
                                            <span>Value: {formatPrice(voucher.value)}</span>
                                        </div>

                                        {/* Purchase Date */}
                                        <p className="text-xs text-gray-500">
                                            Purchased: {formatDate(voucher.createdAt)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {voucher.status === ListingStatus.REVEALED && (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleConfirm(voucher.id)}
                                                disabled={actionLoading[voucher.id] === 'confirm'}
                                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {actionLoading[voucher.id] === 'confirm' ? 'Confirming...' : 'Confirm'}
                                            </button>
                                            <button
                                                onClick={() => handleDispute(voucher.id)}
                                                disabled={actionLoading[voucher.id] === 'dispute'}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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