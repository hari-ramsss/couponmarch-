"use client"
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { getMneeBalance, formatTokenAmount } from "@/lib/contracts-instance";

interface PriceSectionProps {
  price: string;
  onPriceChange: (price: string) => void;
  onSubmitListing: () => void;
  isSubmitting: boolean;
}

export default function PriceSection({
  price,
  onPriceChange,
  onSubmitListing,
  isSubmitting
}: PriceSectionProps) {
  const { wallet, connect, ensureSepolia, isLoading } = useWallet();
  const [mneeBalance, setMneeBalance] = useState<string>("0");

  // Fetch MNEE balance
  useEffect(() => {
    async function fetchBalance() {
      if (wallet.isConnected && wallet.provider && wallet.address) {
        try {
          const balance = await getMneeBalance(wallet.provider, wallet.address);
          const formatted = await formatTokenAmount(wallet.provider, balance);
          setMneeBalance(formatted);
        } catch (error) {
          console.error('Error fetching MNEE balance:', error);
        }
      }
    }
    fetchBalance();
  }, [wallet.isConnected, wallet.provider, wallet.address]);

  const handleConnectWallet = async () => {
    try {
      await connect();
      if (wallet.provider) {
        await ensureSepolia();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to connect wallet');
    }
  };

  return (
    <div className="price-section">

      <h2>Pricing & Wallet</h2>

      {/* Selling Price */}
      <div className="form-group">
        <label>Selling Price (MNEE)</label>
        <input
          type="text"
          placeholder="e.g., 100"
          value={price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPriceChange(e.target.value)
          }
          disabled={!wallet.isConnected || isSubmitting}
        />
        <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
          Enter price in MNEE tokens (not ETH). Gas fees are still paid in ETH.
        </small>
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

        {wallet.isConnected && wallet.address ? (
          <div>
            <p className="wallet-address">{wallet.address} Wallet-Connected ✅</p>
            {mneeBalance !== "0" && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Your MNEE Balance: {mneeBalance} MNEE
              </p>
            )}
          </div>
        ) : (
          <button
            className="connect-wallet-btn"
            onClick={handleConnectWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button
        className="submit-listing-btn"
        onClick={() => {
          onSubmitListing();
        }}
        disabled={!wallet.isConnected || isSubmitting || !price}
      >
        {isSubmitting ? 'Creating Listing...' : 'List Voucher for Sale'}
      </button>
    </div>
  );
}
