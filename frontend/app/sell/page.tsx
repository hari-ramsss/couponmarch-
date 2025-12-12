"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PriceSection from "@/components/PriceSection";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";

export default function Sell() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    const handleConnectWallet = () => {
        // Mock wallet connection - replace with actual wallet integration
        setWalletAddress("0x1234...5678");
    };

    const handleSubmitListing = () => {
        // Handle listing submission
        console.log("Submitting listing...");
    };

    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="sell" walletAddress={walletAddress} />

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

                        {/* Voucher Title */}
                        <div className="form-group">
                            <label>Voucher Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon ₹500 Gift Card"
                            />
                        </div>

                        {/* Voucher Type */}
                        <div className="form-group">
                            <label>Voucher Type</label>
                            <select>
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
                            <label>Brand / Store Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Amazon, Myntra, Swiggy"
                            />
                        </div>

                        {/* Voucher Code */}
                        <div className="form-group">
                            <label>Voucher / Coupon Code</label>
                            <input
                                type="text"
                                placeholder="Enter the voucher or coupon code"
                            />
                        </div>

                        {/* Voucher Value */}
                        <div className="form-group">
                            <label>Voucher Value</label>
                            <input
                                type="text"
                                placeholder="e.g., ₹500 or 30% OFF"
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div className="form-group">
                            <label>Discount Percentage (optional)</label>
                            <input
                                type="number"
                                placeholder="e.g., 20"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input type="date" />
                        </div>

                        {/* Terms & Conditions */}
                        <div className="form-group">
                            <label>Terms & Conditions</label>
                            <textarea
                                placeholder="Describe voucher terms, restrictions, usage instructions..."
                                rows={4}
                            ></textarea>
                        </div>
                    </div>

                    <UploadSection />
                </div>

                {/* Bottom Section: Price */}
                <div className="sell-bottom-section">
                    <PriceSection
                        walletAddress={walletAddress}
                        onConnectWallet={handleConnectWallet}
                        onSubmitListing={handleSubmitListing}
                    />
                </div>
            </div>
            <Footer/>
        </div>
    )
}