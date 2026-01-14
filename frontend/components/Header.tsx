"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import { getMneeBalance, formatTokenAmount } from "@/lib/contracts-instance";

interface HeaderProps {
    pageType?: 'home' | 'marketplace' | 'sell' | 'vouchers' | 'other';
}

// Inner component that uses useSearchParams
function HeaderContent({ pageType = 'home' }: HeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
    const [mneeBalance, setMneeBalance] = useState<string | null>(null);
    const { wallet, connect, disconnect, ensureSepolia, isLoading } = useWallet();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const walletDropdownRef = useRef<HTMLDivElement>(null);

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (pageType === 'marketplace') {
            // Update URL with search query
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            } else {
                params.delete('search');
            }
            const queryString = params.toString();
            router.push(queryString ? `/marketplace?${queryString}` : '/marketplace');
        } else {
            // Navigate to marketplace with search query
            if (searchQuery.trim()) {
                router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
            } else {
                router.push('/marketplace');
            }
        }
    };

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

    // Handle switching accounts - opens MetaMask account picker
    const handleSwitchAccount = async () => {
        try {
            if (window.ethereum) {
                // Request permissions to trigger MetaMask account selector
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }],
                });
                setIsWalletDropdownOpen(false);
            }
        } catch (error: any) {
            // Check if user rejected/cancelled the request (error code 4001)
            // This is a normal user action, not an error - silently close dropdown
            if (error?.code === 4001 || error?.message?.includes('User rejected')) {
                setIsWalletDropdownOpen(false);
                return; // Silently return, no error logging needed
            }
            // Only log unexpected errors
            console.error('Failed to switch account:', error);
        }
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
                        <form className="nav-form" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search vouchers by name or brand..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`nav-search ${isSearchExpanded ? 'nav-search-expanded' : ''}`}
                                onFocus={() => setIsSearchExpanded(true)}
                                onBlur={() => setIsSearchExpanded(false)}
                            />
                            <button
                                type="submit"
                                className="search-btn"
                            >
                                <span className="material-icons">search</span>
                            </button>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="search-clear-btn"
                                    onClick={() => {
                                        setSearchQuery('');
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete('search');
                                        router.push(`/marketplace?${params.toString()}`);
                                    }}
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            )}
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
                                        <Link href="/my-purchases" className="wallet-dropdown-item" onClick={handleNavClick}>
                                            <span className="dropdown-icon material-icons">confirmation_number</span>
                                            My Vouchers
                                        </Link>
                                        <Link href="/my-listings" className="wallet-dropdown-item" onClick={handleNavClick}>
                                            <span className="dropdown-icon material-icons">list_alt</span>
                                            My Listings
                                        </Link>

                                        <div className="wallet-dropdown-divider"></div>
                                        <button
                                            className="wallet-dropdown-item"
                                            onClick={handleSwitchAccount}
                                        >
                                            <span className="dropdown-icon material-icons">swap_horiz</span>
                                            Switch Account
                                        </button>
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
                                    <Link href="/my-purchases" className="mobile-wallet-menu-item" onClick={handleNavClick}>
                                        <span className="mobile-menu-icon material-icons">confirmation_number</span>
                                        My Vouchers
                                    </Link>
                                    <Link href="/my-listings" className="mobile-wallet-menu-item" onClick={handleNavClick}>
                                        <span className="mobile-menu-icon material-icons">list_alt</span>
                                        My Listings
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

// Loading fallback for the header
function HeaderFallback() {
    return (
        <header className="header">
            <nav className="nav-container">
                <h1 className="nav-logo">
                    <Link href="/">CouponMarchè</Link>
                </h1>
            </nav>
        </header>
    );
}

// Main Header component wrapped with Suspense
export default function Header({ pageType = 'home' }: HeaderProps) {
    return (
        <Suspense fallback={<HeaderFallback />}>
            <HeaderContent pageType={pageType} />
        </Suspense>
    );
}
