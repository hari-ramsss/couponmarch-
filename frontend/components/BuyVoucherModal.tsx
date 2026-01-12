import { useState, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import VoucherImage from "./VoucherImage";
import { getEscrowContract, getMneeBalance, getMneeAllowance, approveMnee, formatTokenAmount } from "../lib/contracts-instance";
import { getEnhancedListing } from "../lib/marketplace";
import { EnhancedListingData, getIPFSImageUrl } from "../lib/ipfs-metadata";
import { ListingStatus } from "../lib/contracts";

// Animated loading dots component that cycles through . .. ... ....
function LoadingDots() {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev >= 4 ? 1 : prev + 1));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return <span className="loading-dots">{".".repeat(dotCount)}</span>;
}

type ModalState =
    | "LOADING"
    | "PREVIEW"
    | "INSUFFICIENT_BALANCE"
    | "APPROVING"
    | "PROCESSING"
    | "REVEALED"
    | "VERIFY"
    | "SUCCESS"
    | "FAILED"
    | "ERROR";

interface BuyVoucherModalProps {
    voucherId: string | number;
    voucherTitle?: string;
    voucherPrice?: string;
    voucherImage?: string;
    onClose: () => void;
    onPurchaseComplete?: () => void;
}

export default function BuyVoucherModal({
    voucherId,
    voucherTitle = "Amazon ₹500 Gift Card",
    voucherPrice = "0.015 ETH",
    voucherImage,
    onClose,
    onPurchaseComplete
}: BuyVoucherModalProps) {

    const [state, setState] = useState<ModalState>("LOADING");
    const [listing, setListing] = useState<EnhancedListingData | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [userAddress, setUserAddress] = useState<string>("");
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [allowance, setAllowance] = useState<bigint>(BigInt(0));
    const [error, setError] = useState<string>("");
    const [txHash, setTxHash] = useState<string>("");
    const [formattedPrice, setFormattedPrice] = useState<string>("0");
    const [formattedBalance, setFormattedBalance] = useState<string>("0");

    // Debug: Log when component mounts/unmounts
    useEffect(() => {
        console.log('🔴 BuyVoucherModal MOUNTED for voucher:', voucherId);
        return () => {
            console.log('⚪ BuyVoucherModal UNMOUNTED for voucher:', voucherId);
        };
    }, []);

    // Debug: Log state changes
    useEffect(() => {
        console.log('🟢 Modal state changed to:', state);
    }, [state]);

    // Initialize wallet and load listing data
    useEffect(() => {
        initializeWalletAndListing();
    }, [voucherId]);

    // Format prices when provider or listing changes
    useEffect(() => {
        const formatPrices = async () => {
            if (provider && listing) {
                const priceFormatted = await formatTokenAmount(provider, listing.price);
                const balanceFormatted = await formatTokenAmount(provider, balance);
                setFormattedPrice(priceFormatted);
                setFormattedBalance(balanceFormatted);
            }
        };
        formatPrices();
    }, [provider, listing, balance]);

    const initializeWalletAndListing = async () => {
        try {
            if (!window.ethereum) {
                setError("MetaMask not found. Please install MetaMask.");
                setState("ERROR");
                return;
            }

            const browserProvider = new BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_requestAccounts", []);
            const userSigner = await browserProvider.getSigner();
            const address = accounts[0];

            setProvider(browserProvider);
            setSigner(userSigner);
            setUserAddress(address);

            // Load listing data
            const listingData = await getEnhancedListing(browserProvider, Number(voucherId));
            if (!listingData) {
                setError("Listing not found");
                setState("ERROR");
                return;
            }

            if (listingData.status !== ListingStatus.LISTED) {
                setError("This voucher is no longer available for purchase");
                setState("ERROR");
                return;
            }

            if (listingData.seller.toLowerCase() === address.toLowerCase()) {
                setError("You cannot buy your own voucher");
                setState("ERROR");
                return;
            }

            setListing(listingData);

            // Check balance and allowance
            const userBalance = await getMneeBalance(browserProvider, address);
            const userAllowance = await getMneeAllowance(browserProvider, address);

            setBalance(userBalance);
            setAllowance(userAllowance);

            // Determine initial state
            if (userBalance < listingData.price) {
                setState("INSUFFICIENT_BALANCE");
            } else {
                setState("PREVIEW");
            }

        } catch (err) {
            console.error("Error initializing:", err);
            setError("Failed to initialize. Please try again.");
            setState("ERROR");
        }
    };

    const handleApprove = async () => {
        if (!signer || !listing) {
            console.error('❌ handleApprove: signer or listing is null');
            return;
        }

        try {
            console.log('🔄 Starting token approval...');
            setState("APPROVING");

            const tx = await approveMnee(signer, listing.price);
            console.log('📝 Approval tx submitted:', tx.hash);
            setTxHash(tx.hash);

            console.log('⏳ Waiting for approval confirmation...');
            await tx.wait();
            console.log('✅ Approval confirmed!');

            // Update allowance
            const newAllowance = await getMneeAllowance(provider!, userAddress);
            console.log('💰 New allowance:', newAllowance.toString());
            setAllowance(newAllowance);

            // Immediately proceed to purchase
            console.log('🚀 Proceeding to purchase after approval...');
            await handlePurchaseAfterApproval();
        } catch (err: any) {
            console.error("❌ Approval failed:", err);
            const errorMessage = err?.reason || err?.message || "Token approval failed. Please try again.";
            setError(errorMessage);
            setState("ERROR");
        }
    };

    const handlePurchaseAfterApproval = async () => {
        console.log('🔄 handlePurchaseAfterApproval called');
        console.log('📋 signer:', signer ? 'exists' : 'null');
        console.log('📋 listing:', listing ? `ID: ${listing.id}` : 'null');

        if (!signer || !listing) {
            console.error('❌ handlePurchaseAfterApproval: signer or listing is null');
            setError('Wallet or listing data not available. Please try again.');
            setState("ERROR");
            return;
        }

        try {
            console.log('🔄 Starting payment processing...');
            setState("PROCESSING");

            console.log('📦 Getting escrow contract...');
            const escrowContract = getEscrowContract(signer);

            console.log('💸 Calling lockPayment for listing:', listing.id);
            const tx = await escrowContract.lockPayment(listing.id);
            console.log('📝 Payment tx submitted:', tx.hash);
            setTxHash(tx.hash);

            console.log('⏳ Waiting for payment confirmation...');
            await tx.wait();
            console.log('✅ Payment confirmed!');

            // Payment locked successfully, voucher is automatically revealed by contract
            console.log('🎉 Setting state to REVEALED');
            setState("REVEALED");

            // Don't call onPurchaseComplete here - let user go through verification first
            console.log('✅ Purchase flow completed successfully');
        } catch (err: any) {
            console.error("❌ Purchase failed:", err);
            const errorMessage = err?.reason || err?.message || "Purchase failed. Please try again.";
            setError(errorMessage);
            setState("ERROR");
        }
    };

    const handlePurchase = async () => {
        console.log('🔄 handlePurchase called (direct purchase)');

        if (!signer || !listing) {
            console.error('❌ handlePurchase: signer or listing is null');
            return;
        }

        try {
            console.log('🔄 Starting direct payment processing...');
            setState("PROCESSING");

            const escrowContract = getEscrowContract(signer);
            console.log('💸 Calling lockPayment for listing:', listing.id);
            const tx = await escrowContract.lockPayment(listing.id);
            console.log('📝 Payment tx submitted:', tx.hash);
            setTxHash(tx.hash);

            console.log('⏳ Waiting for payment confirmation...');
            await tx.wait();
            console.log('✅ Payment confirmed!');

            // Payment locked successfully, voucher is automatically revealed by contract
            console.log('🎉 Setting state to REVEALED');
            setState("REVEALED");

            console.log('✅ Direct purchase flow completed successfully');
        } catch (err: any) {
            console.error("❌ Direct purchase failed:", err);
            const errorMessage = err?.reason || err?.message || "Purchase failed. Please try again.";
            setError(errorMessage);
            setState("ERROR");
        }
    };

    const handleConfirmVoucher = async () => {
        if (!signer || !listing) return;

        try {
            const escrowContract = getEscrowContract(signer);
            const tx = await escrowContract.confirmVoucher(listing.id);
            setTxHash(tx.hash);

            await tx.wait();

            setState("SUCCESS");
        } catch (err) {
            console.error("Confirmation failed:", err);
            setError("Confirmation failed. Please try again.");
            setState("ERROR");
        }
    };

    const handleDisputeVoucher = async () => {
        if (!signer || !listing) return;

        try {
            const evidenceCID = "dispute-evidence-" + Date.now(); // In real app, this would be IPFS hash of evidence

            const escrowContract = getEscrowContract(signer);
            const tx = await escrowContract.disputeVoucher(listing.id, evidenceCID);
            setTxHash(tx.hash);

            await tx.wait();

            setState("FAILED");
        } catch (err) {
            console.error("Dispute failed:", err);
            setError("Dispute failed. Please try again.");
            setState("ERROR");
        }
    };

    // Handle backdrop click to close modal
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Prevent event bubbling when clicking inside modal
    const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-container" onClick={handleModalClick}>

                {/* HEADER */}
                <div className="modal-header">
                    <h2>Purchase Voucher Securely</h2>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* BODY */}
                <div className="modal-body">

                    {state === "LOADING" && (
                        <>
                            <h3>Loading<LoadingDots /></h3>
                            <p>Fetching voucher details and checking wallet<LoadingDots /></p>
                        </>
                    )}

                    {state === "ERROR" && (
                        <>
                            <h3>Error</h3>
                            <p className="error-message">{error}</p>
                            <button onClick={onClose}>Close</button>
                        </>
                    )}

                    {state === "INSUFFICIENT_BALANCE" && listing && provider && (
                        <>
                            <h3>Insufficient Balance</h3>
                            <p>You don't have enough MNEE tokens to purchase this voucher.</p>
                            <p><strong>Required:</strong> {formattedPrice} MNEE</p>
                            <p><strong>Your Balance:</strong> {formattedBalance} MNEE</p>
                            <button onClick={onClose}>Close</button>
                        </>
                    )}

                    {state === "PREVIEW" && listing && provider && (
                        <>
                            <h3>Voucher Overview</h3>
                            <p><strong>Voucher:</strong> {listing.metadata?.title || voucherTitle}</p>
                            <p><strong>Seller:</strong> {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p>
                            <p><strong>Expiry:</strong> {listing.expiryTimestamp > BigInt(0) ? new Date(Number(listing.expiryTimestamp) * 1000).toLocaleDateString() : "No expiry"}</p>

                            <div className="modal-voucher-preview">
                                <VoucherImage
                                    src={listing.metadata?.images?.voucher?.blurred ? getIPFSImageUrl(listing.metadata.images.voucher.blurred) : (voucherImage || "/img/blank_coupon.png")}
                                    alt={listing.metadata?.title || voucherTitle}
                                    className="modal-voucher-image"
                                    allowUnblur={false}
                                    forceBlurred={true}
                                />
                                <p className="voucher-preview-note">
                                    <span className="material-icons">lock</span> Voucher image will be revealed after payment
                                </p>
                            </div>

                            <p><strong>Price:</strong> {formattedPrice} MNEE</p>

                            <p>
                                Funds will be sent to an <strong>Escrow Smart Contract</strong>.
                                Seller cannot access funds until verification.
                            </p>

                            {allowance < listing.price ? (
                                <button onClick={handleApprove}>
                                    Approve {formattedPrice} MNEE
                                </button>
                            ) : (
                                <button onClick={handlePurchase}>
                                    Confirm & Pay {formattedPrice} MNEE
                                </button>
                            )}
                        </>
                    )}

                    {
                        state === "APPROVING" && (
                            <>
                                <h3>Approving Tokens<LoadingDots /></h3>
                                <p>Please confirm the token approval in your wallet<LoadingDots /></p>
                                <p>After approval, we'll automatically proceed with the purchase.</p>
                                {txHash && (
                                    <p><strong>Transaction:</strong> <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.slice(0, 10)}...</a></p>
                                )}
                            </>
                        )
                    }

                    {
                        state === "PROCESSING" && (
                            <>
                                <h3>Processing Payment<LoadingDots /></h3>
                                <p>Please confirm the transaction in your wallet<LoadingDots /></p>
                                <p>Locking funds in escrow<LoadingDots /></p>
                                {txHash && (
                                    <p><strong>Transaction:</strong> <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash.slice(0, 10)}...</a></p>
                                )}
                            </>
                        )
                    }

                    {
                        state === "REVEALED" && listing && (
                            <>
                                <h3>Payment Successful!</h3>

                                <p><span className="material-icons">check_circle</span> Your payment has been locked in escrow and the voucher has been revealed!</p>

                                <div className="modal-voucher-reveal">
                                    {(() => {
                                        // Get the original voucher image URL
                                        const voucherHash = listing.metadata?.images?.voucher?.original;
                                        const imageUrl = voucherHash
                                            ? getIPFSImageUrl(voucherHash)
                                            : (voucherImage || "/img/blank_coupon.png");
                                        console.log('🖼️ Revealed voucher image:', { voucherHash, imageUrl, voucherImage });
                                        return (
                                            <VoucherImage
                                                src={imageUrl}
                                                alt={listing.metadata?.title || voucherTitle}
                                                className="modal-voucher-image"
                                                allowUnblur={true}
                                                forceBlurred={false}
                                            />
                                        );
                                    })()}
                                    <p className="voucher-reveal-note">
                                        <span className="material-icons">check_circle</span> Voucher details have been revealed
                                    </p>
                                </div>

                                <p><strong>Coupon Code:</strong> {listing.metadata?.code || "AMAZON-XYZ-123"}</p>

                                <p>
                                    Please test the coupon code to verify it works correctly before confirming.
                                </p>

                                <button onClick={() => setState("VERIFY")}>
                                    Continue to Verification
                                </button>
                            </>
                        )
                    }

                    {
                        state === "VERIFY" && (
                            <>
                                <h3>Verify Voucher</h3>
                                <p>Did the voucher work as expected?</p>
                                <p>Please test the coupon code before confirming.</p>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button onClick={handleConfirmVoucher} style={{ backgroundColor: '#4CAF50' }}>
                                        <span className="material-icons">check_circle</span> Coupon Works
                                    </button>

                                    <button onClick={handleDisputeVoucher} style={{ backgroundColor: '#f44336' }}>
                                        <span className="material-icons">cancel</span> Coupon Doesn't Work
                                    </button>
                                </div>
                            </>
                        )
                    }

                    {
                        state === "SUCCESS" && (
                            <>
                                <h3>Success</h3>
                                <p><span className="material-icons">check_circle</span> Voucher confirmed! Funds have been released to the seller.</p>
                                <p>Thank you for using our secure marketplace.</p>
                                <button onClick={onClose}>Close</button>
                            </>
                        )
                    }

                    {
                        state === "FAILED" && (
                            <>
                                <h3>Dispute Initiated</h3>
                                <p><span className="material-icons">sync</span> Your dispute has been submitted. An admin will review the case.</p>
                                <p>Your payment will be refunded if the dispute is valid.</p>
                                <button onClick={onClose}>Close</button>
                            </>
                        )
                    }

                </div >

            </div >

        </div >
    );
}