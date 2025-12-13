"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { getMneeBalance, formatTokenAmount } from "@/lib/contracts-instance";

interface HeaderProps {
    pageType?: 'home' | 'marketplace' | 'sell';
}

export default function Header({ pageType = 'home' }: HeaderProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [mneeBalance, setMneeBalance] = useState<string | null>(null);
    const { wallet, connect, ensureSepolia, isLoading } = useWallet();

    // Fetch MNEE balance when wallet is connected
    useEffect(() => {
        async function fetchBalance() {
            if (wallet.isConnected && wallet.provider && wallet.address) {
                try {
                    const balance = await getMneeBalance(wallet.provider, wallet.address);
                    const formatted = await formatTokenAmount(wallet.provider, balance);
                    setMneeBalance(formatted);
                } catch (error) {
                    console.error('Error fetching MNEE balance:', error);
                    setMneeBalance(null);
                }
            } else {
                setMneeBalance(null);
            }
        }

        fetchBalance();
        // Refresh balance every 10 seconds
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [wallet.isConnected, wallet.provider, wallet.address]);

    const handleConnectWallet = async () => {
        try {
            await connect();
            // Ensure we're on Sepolia
            if (wallet.provider) {
                await ensureSepolia();
            }
        } catch (error: any) {
            console.error('Failed to connect wallet:', error);
            alert(error.message || 'Failed to connect wallet');
        }
    };

    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <header className="header">
            <nav className="nav-container">
                {/* Logo */}
                <h1 className="nav-logo">
                    CouponMarchè
                </h1>

                {/* Navigation Links */}
                <ul className="nav-links">
                    {pageType != 'home' && (
                        <li>
                            <a href="/" className="nav-link">
                                Home
                            </a>
                        </li>
                    )}
                    <li>
                        <a href="/marketplace" className="nav-link">
                            MarketPlace
                        </a>
                    </li>
                    <li>
                        <a href="/sell" className="nav-link">
                            Sell
                        </a>
                    </li>
                    <li>
                        <a href="/about" className="nav-link">
                            About
                        </a>
                    </li>
                    <li>
                        <a href="/contact" className="nav-link">
                            contact
                        </a>
                    </li>
                </ul>

                {/* Conditional Right Section based on page type */}
                {pageType === 'marketplace' ? (
                    /* Marketplace: Search Bar */
                    <form className="nav-form">
                        <input
                            type="text"
                            placeholder="Search vouchers..."
                            className={`nav-search ${isSearchExpanded ? 'nav-search-expanded' : ''}`}
                            onFocus={() => setIsSearchExpanded(true)}
                            onBlur={() => setIsSearchExpanded(false)}
                        />
                        <button
                            type="button"
                            className="nav-search-btn"
                        >
                            🔍
                        </button>
                    </form>
                ) : (
                    /* Home: Wallet Profile */
                    <div className="nav-wallet-section">
                        {wallet.isConnected && wallet.address ? (
                            /* Connected Wallet */
                            <div className="wallet-profile">
                                <div className="wallet-info">
                                    <span className="wallet-address">{formatWalletAddress(wallet.address)}</span>
                                    {mneeBalance !== null && (
                                        <span className="wallet-balance">{mneeBalance} MNEE</span>
                                    )}
                                    <span className="wallet-status">Connected</span>
                                </div>
                                <div className="wallet-avatar">
                                    <img src="./img/blank-user.png" alt="User Avatar" />
                                </div>
                            </div>
                        ) : (
                            /* No Wallet Connected */
                            <div className="wallet-disconnected">
                                <button
                                    onClick={handleConnectWallet}
                                    className="nav-wallet-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                                </button>
                                <div className="wallet-avatar-placeholder">
                                    <img src="./img/blank-user.png" alt="No wallet connected" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
