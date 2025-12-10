"use client";

import { useState } from "react";

interface HeaderProps {
    pageType?: 'home' | 'marketplace';
    walletAddress?: string | null;
}

export default function Header({ pageType = 'home', walletAddress = null }: HeaderProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    // Mock function to simulate wallet connection
    const connectWallet = () => {
        // This would integrate with your actual wallet connection logic
        console.log("Connecting wallet...");
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
                        {walletAddress ? (
                            /* Connected Wallet */
                            <div className="wallet-profile">
                                <div className="wallet-info">
                                    <span className="wallet-address">{formatWalletAddress(walletAddress)}</span>
                                    <span className="wallet-status">Connected</span>
                                </div>
                                <div className="wallet-avatar">
                                    <img src="./images/user-avatar.png" alt="User Avatar" />
                                </div>
                            </div>
                        ) : (
                            /* No Wallet Connected */
                            <div className="wallet-disconnected">
                                <button
                                    onClick={connectWallet}
                                    className="nav-wallet-btn"
                                >
                                    Connect Wallet
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
