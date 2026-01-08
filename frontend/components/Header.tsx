"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletContext";
import { getMneeBalance, formatTokenAmount } from "@/lib/contracts-instance";

interface HeaderProps {
    pageType?: 'home' | 'marketplace' | 'sell' | 'vouchers' | 'other';
}

export default function Header({ pageType = 'home' }: HeaderProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
    const [mneeBalance, setMneeBalance] = useState<string | null>(null);
    const { wallet, connect, disconnect, ensureSepolia, isLoading } = useWallet();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const walletDropdownRef = useRef<HTMLDivElement>(null);

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

    const handleDisconnectWallet = () => {
        disconnect();
        setIsMobileMenuOpen(false); // Close mobile menu when disconnecting
        setIsWalletDropdownOpen(false); // Close wallet dropdown when disconnecting
    };

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Handle wallet dropdown toggle
    const toggleWalletDropdown = () => {
        setIsWalletDropdownOpen(!isWalletDropdownOpen);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
            if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
                setIsWalletDropdownOpen(false);
            }
        };

        if (isMobileMenuOpen || isWalletDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            if (isMobileMenuOpen) {
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen, isWalletDropdownOpen]);

    // Close mobile menu on navigation
    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
        setIsWalletDropdownOpen(false);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isMobileMenuOpen) {
                    setIsMobileMenuOpen(false);
                }
                if (isWalletDropdownOpen) {
                    setIsWalletDropdownOpen(false);
                }
            }
        };

        if (isMobileMenuOpen || isWalletDropdownOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileMenuOpen, isWalletDropdownOpen]);

    // Function to get user profile picture (placeholder for future implementation)
    const getUserProfilePicture = () => {
        // In the future, this could fetch from user preferences, ENS avatar, etc.
        // For now, return default
        return "./img/blank-user.png";
    };

    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <>
            <header className="header">
                <nav className="nav-container">
                    {/* Mobile Hamburger Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        <div className={`hamburger ${isMobileMenuOpen ? 'hamburger-open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>

                    {/* Logo */}
                    <h1 className="nav-logo">
                        <Link href="/" onClick={handleNavClick}>
                            CouponMarchè
                        </Link>
                    </h1>

                    {/* Desktop Navigation Links */}
                    <ul className="nav-links">
                        {pageType != 'home' && (
                            <li>
                                <Link href="/" className="nav-link">
                                    Home
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link href="/marketplace" className="nav-link">
                                MarketPlace
                            </Link>
                        </li>
                        <li>
                            <Link href="/sell" className="nav-link">
                                Sell
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="nav-link">
                                About
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" className="nav-link">
                                Contact
                            </Link>
                        </li>
                    </ul>

                    {/* Conditional Right Section based on page type */}
                    {pageType === 'marketplace' ? (
                        /* Marketplace: Search Bar (Desktop only) */
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
                                className="search-btn"
                            >
                                <span className="material-icons">search</span>
                            </button>
                        </form>
                    ) : null}

                    {/* Wallet Profile (Always show on desktop, hidden on mobile) */}
                    <div className="nav-wallet-section">
                        {wallet.isConnected && wallet.address ? (
                            /* Connected Wallet */
                            <div className="wallet-profile" ref={walletDropdownRef}>
                                <div className="wallet-info">
                                    <span className="wallet-address">{formatWalletAddress(wallet.address)}</span>
                                    {mneeBalance !== null && (
                                        <span className="wallet-balance">{mneeBalance} MNEE</span>
                                    )}
                                </div>
                                <div className="wallet-divider"></div>
                                <div className="wallet-avatar-container">
                                    <div className="wallet-avatar">
                                        <img src={getUserProfilePicture()} alt="User Avatar" />
                                    </div>
                                    <button
                                        className="wallet-dropdown-toggle"
                                        onClick={toggleWalletDropdown}
                                        aria-label="Toggle wallet menu"
                                    >
                                        <svg
                                            className={`dropdown-arrow ${isWalletDropdownOpen ? 'dropdown-arrow-open' : ''}`}
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Wallet Dropdown Menu */}
                                {isWalletDropdownOpen && (
                                    <div className="wallet-dropdown-menu">
                                        <Link href="/revealed-vouchers" className="wallet-dropdown-item" onClick={handleNavClick}>
                                            <span className="dropdown-icon material-icons">confirmation_number</span>
                                            My Vouchers
                                        </Link>
                                        <Link href="/my-listings" className="wallet-dropdown-item" onClick={handleNavClick}>
                                            <span className="dropdown-icon material-icons">list_alt</span>
                                            My Listings
                                        </Link>
                                        <Link href="/my-purchases" className="wallet-dropdown-item" onClick={handleNavClick}>
                                            <span className="dropdown-icon material-icons">shopping_bag</span>
                                            My Purchases
                                        </Link>
                                        <div className="wallet-dropdown-divider"></div>
                                        <button
                                            className="wallet-dropdown-item disconnect-item"
                                            onClick={handleDisconnectWallet}
                                        >
                                            <span className="dropdown-icon material-icons">power_settings_new</span>
                                            Disconnect
                                        </button>
                                    </div>
                                )}
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

                            </div>
                        )}
                    </div>
                </nav>
            </header>

            {/* Mobile Side Navigation Menu */}
            <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'mobile-nav-overlay-open' : ''}`}>
                <div
                    ref={mobileMenuRef}
                    className={`mobile-nav-panel ${isMobileMenuOpen ? 'mobile-nav-panel-open' : ''}`}
                >
                    {/* Mobile Menu Header */}
                    <div className="mobile-nav-header">
                        <h2 className="mobile-nav-title">Menu</h2>
                        <button
                            className="mobile-nav-close"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close mobile menu"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Mobile Navigation Links */}
                    <nav className="mobile-nav-links">
                        {pageType != 'home' && (
                            <Link href="/" className="mobile-nav-link" onClick={handleNavClick}>
                                <span className="material-icons">home</span> Home
                            </Link>
                        )}
                        <Link href="/marketplace" className="mobile-nav-link" onClick={handleNavClick}>
                            <span className="material-icons">store</span> MarketPlace
                        </Link>
                        <Link href="/sell" className="mobile-nav-link" onClick={handleNavClick}>
                            <span className="material-icons">sell</span> Sell
                        </Link>
                        <Link href="/about" className="mobile-nav-link" onClick={handleNavClick}>
                            <span className="material-icons">info</span> About
                        </Link>
                        <Link href="/contact" className="mobile-nav-link" onClick={handleNavClick}>
                            <span className="material-icons">email</span> Contact
                        </Link>
                    </nav>

                    {/* Mobile Wallet Section */}
                    <div className="mobile-wallet-section">
                        {wallet.isConnected && wallet.address ? (
                            /* Connected Wallet in Mobile Menu */
                            <div className="mobile-wallet-profile">
                                <div className="mobile-wallet-avatar">
                                    <img src={getUserProfilePicture()} alt="User Avatar" />
                                </div>
                                <div className="mobile-wallet-info">
                                    <span className="mobile-wallet-address">{formatWalletAddress(wallet.address)}</span>
                                    {mneeBalance !== null && (
                                        <span className="mobile-wallet-balance">{mneeBalance} MNEE</span>
                                    )}
                                </div>

                                {/* Mobile Wallet Menu Items */}
                                <div className="mobile-wallet-menu">
                                    <Link href="/revealed-vouchers" className="mobile-wallet-menu-item" onClick={handleNavClick}>
                                        <span className="mobile-menu-icon material-icons">confirmation_number</span>
                                        My Vouchers
                                    </Link>
                                    <Link href="/my-listings" className="mobile-wallet-menu-item" onClick={handleNavClick}>
                                        <span className="mobile-menu-icon material-icons">list_alt</span>
                                        My Listings
                                    </Link>
                                    <Link href="/my-purchases" className="mobile-wallet-menu-item" onClick={handleNavClick}>
                                        <span className="mobile-menu-icon material-icons">shopping_bag</span>
                                        My Purchases
                                    </Link>
                                </div>

                                <button
                                    className="mobile-disconnect-btn"
                                    onClick={handleDisconnectWallet}
                                >
                                    <span className="material-icons">power_settings_new</span> Disconnect
                                </button>
                            </div>
                        ) : (
                            /* No Wallet Connected in Mobile Menu */
                            <div className="mobile-wallet-disconnected">
                                <button
                                    onClick={handleConnectWallet}
                                    className="mobile-connect-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Connecting...' : (
                                        <>
                                            <span className="material-icons">link</span> Connect Wallet
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
