"use client"
import { useState } from "react";

interface PriceSectionProps {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
  onSubmitListing?: () => void;
}

export default function PriceSection({
  walletAddress,
  onConnectWallet,
  onSubmitListing
}: PriceSectionProps) {
  
  const [price, setPrice] = useState<string>("");

  return (
    <div className="price-section">

      <h2>Pricing & Wallet</h2>

      {/* Selling Price */}
      <div className="form-group">
        <label>Selling Price (ETH / MATIC)</label>
        <input
          type="text"
          placeholder="e.g., 0.015"
          value={price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPrice(e.target.value)
          }
        />
      </div>

      {/* Market Suggestion */}
      <div className="price-note">
        <p>
          💡 Tip: Competitive pricing increases the chances of your voucher selling faster.
        </p>
      </div>

      {/* Wallet Section */}
      <div className="wallet-section">
        <label>Your Wallet :</label>

        {walletAddress ? (
          <p className="wallet-address">{walletAddress} Wallet-Connected ✅</p>
        ) : (
          <button 
            className="connect-wallet-btn"
            onClick={onConnectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button 
        className="submit-listing-btn"
        onClick={onSubmitListing}
      >
        List Voucher for Sale
      </button>
    </div>
  );
}
