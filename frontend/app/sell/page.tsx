"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Header from "@/components/Header";
import PriceSection from "@/components/PriceSection";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { getMarketplaceContract } from "@/lib/contracts-instance";
import { parseTokenAmount } from "@/lib/contracts-instance";

export default function Sell() {
    const router = useRouter();
    const { wallet, ensureSepolia } = useWallet();

    // Form state
    const [voucherTitle, setVoucherTitle] = useState("");
    const [voucherType, setVoucherType] = useState("Gift Card");
    const [brandName, setBrandName] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherValue, setVoucherValue] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [terms, setTerms] = useState("");
    const [price, setPrice] = useState("");
    const [logo, setLogo] = useState("");
    const [voucherImage, setVoucherImage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


    const handleLogoUpload = (logoUrl: string) => {
        setLogo(logoUrl);
    };

    const handleVoucherImageUpload = (imageUrl: string) => {
        setVoucherImage(imageUrl);
    };

    // Helper function to validate and parse expiry date
    const parseExpiryTimestamp = (dateString: string): bigint => {
        if (!dateString) {
            return BigInt(0); // No expiry
        }

        const expiryDate = new Date(dateString);
        const currentTime = new Date();

        // Validate date is valid
        if (isNaN(expiryDate.getTime())) {
            throw new Error('Invalid expiry date format');
        }

        // Validate date is in the future (at least 1 hour buffer)
        const minFutureTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1 hour from now
        if (expiryDate <= minFutureTime) {
            throw new Error('Expiry date must be at least 1 hour in the future');
        }

        // Convert to Unix timestamp
        return BigInt(Math.floor(expiryDate.getTime() / 1000));
    };

    const handleSubmitListing = async () => {
        if (!wallet.signer) {
            alert('Please connect your wallet first');
            return;
        }

        // Validate required fields
        if (!voucherCode || !price) {
            setError('Voucher code and price are required');
            return;
        }

        // Validate price is a positive number
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError('Price must be a positive number');
            return;
        }


        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            // Ensure on Sepolia
            await ensureSepolia();

            // Create metadata hash (in production, this would be an IPFS CID hash)
            // For now, we'll hash the voucher data
            const metadataString = JSON.stringify({
                title: voucherTitle,
                type: voucherType,
                brand: brandName,
                code: voucherCode,
                value: voucherValue,
                discount: discountPercentage,
                terms: terms,
                logo: logo,
                voucherImage: voucherImage
            });
            const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(metadataString));

            // Create partial code pattern (mask most of the code for security)
            // Show first 2 and last 4 characters, mask the rest
            const codeLength = voucherCode.length;
            let partialPattern = "";
            if (codeLength <= 6) {
                partialPattern = voucherCode; // Show full code if short
            } else {
                partialPattern = `${voucherCode.slice(0, 2)}${'X'.repeat(Math.max(0, codeLength - 6))}${voucherCode.slice(-4)}`;
            }

            // Parse price to wei
            const priceAmount = await parseTokenAmount(wallet.provider!, price);

            // Parse expiry timestamp using helper function
            const expiryTimestamp = parseExpiryTimestamp(expiryDate);

            // Parse voucher value (optional)
            const valueAmount = voucherValue ? BigInt(voucherValue.replace(/\D/g, '')) : BigInt(0);

            // AI initial proof hash (placeholder - in production this would come from AI validation)
            const aiInitialProofHash = ethers.keccak256(ethers.toUtf8Bytes(`proof_${voucherCode}_${Date.now()}`));

            // Create listing on blockchain
            const marketplaceContract = getMarketplaceContract(wallet.signer);
            const tx = await marketplaceContract.createListing(
                metadataHash,
                partialPattern,
                priceAmount,
                valueAmount,
                expiryTimestamp,
                aiInitialProofHash
            );

            setSuccess('Transaction submitted. Waiting for confirmation...');

            const receipt = await tx.wait();
            const listingId = receipt.logs[0]?.args?.[0] || 'unknown';

            setSuccess(`Listing created successfully! Listing ID: ${listingId}`);

            // Redirect to marketplace after 3 seconds
            setTimeout(() => {
                router.push('/marketplace');
            }, 3000);

        } catch (err: any) {
            console.error('Error creating listing:', err);
            setError(err.message || 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="sell" />

            {/* Sell Page Header */}
            <div className="sell-page-header">
                <div className="sell-container">
                    <h1>Sell Your Voucher</h1>
                    <p>List your unused vouchers and earn crypto. All listings are AI-validated for authenticity.</p>
                </div>
            </div>

            {/* Main Sell Content */}
            <div className="sell-page-content">
                {/* Top Section: Voucher Info + Upload */}
                <div className="sell-top-section">
                    <div className="voucher-info-section">
                        <h2>Voucher Information</h2>

                        {error && (
                            <div style={{ padding: '1rem', marginBottom: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '1rem', marginBottom: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                                {success}
                            </div>
                        )}

                        {/* Voucher Title */}
                        <div className="form-group">
                            <label>Voucher Title (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon ₹500 Gift Card"
                                value={voucherTitle}
                                onChange={(e) => setVoucherTitle(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Voucher Type */}
                        <div className="form-group">
                            <label>Voucher Type</label>
                            <select
                                value={voucherType}
                                onChange={(e) => setVoucherType(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option>Gift Card</option>
                                <option>Discount Coupon</option>
                                <option>Store Credit</option>
                                <option>Travel Voucher</option>
                                <option>Food & Dining</option>
                                <option>Fashion & Apparel</option>
                            </select>
                        </div>

                        {/* Brand / Store Name */}
                        <div className="form-group">
                            <label>Brand / Store Name (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon, Myntra, Swiggy"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Voucher Code */}
                        <div className="form-group">
                            <label>Voucher / Coupon Code *</label>
                            <input
                                type="text"
                                placeholder="Enter the voucher or coupon code"
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                                Only a partial pattern will be shown publicly for security.
                            </small>
                        </div>

                        {/* Voucher Value */}
                        <div className="form-group">
                            <label>Voucher Value (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., 500 (numeric value only)"
                                value={voucherValue}
                                onChange={(e) => setVoucherValue(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div className="form-group">
                            <label>Discount Percentage (optional)</label>
                            <input
                                type="number"
                                placeholder="e.g., 20"
                                value={discountPercentage}
                                onChange={(e) => setDiscountPercentage(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Expiry Date */}
                        <div className="form-group">
                            <label>Expiry Date (optional)</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                disabled={isSubmitting}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Tomorrow minimum
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                                Leave empty for no expiry. If set, must be at least 24 hours in the future.
                            </small>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="form-group">
                            <label>Terms & Conditions (optional)</label>
                            <textarea
                                placeholder="Describe voucher terms, restrictions, usage instructions..."
                                rows={4}
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                                disabled={isSubmitting}
                            ></textarea>
                        </div>
                    </div>

                    <UploadSection
                        onLogoUpload={handleLogoUpload}
                        onVoucherImageUpload={handleVoucherImageUpload}
                    />
                </div>

                {/* Bottom Section: Price */}
                <div className="sell-bottom-section">
                    <PriceSection
                        price={price}
                        onPriceChange={setPrice}
                        onSubmitListing={handleSubmitListing}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
            <Footer />
        </div>
    )
}