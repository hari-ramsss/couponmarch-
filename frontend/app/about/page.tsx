"use client";

import Header from "@/components/Header";

export default function AboutPage() {
    return (
        <>
            <Header pageType="other" />
            <div className="about-page">
                {/* Hero / Intro Section */}
                <section className="about-hero">
                    <div className="about-hero-content">
                        <h1 className="about-title">About CouponMarche</h1>
                        <p className="about-subtitle">
                            The blockchain-powered marketplace revolutionizing how people buy, sell, and trade digital vouchers securely.
                        </p>
                    </div>
                </section>

                <div className="about-container">
                    {/* The Problem We're Solving */}
                    <section className="about-section">
                        <div className="about-section-header">
                            <span className="about-section-badge">The Challenge</span>
                            <h2 className="about-section-title">The Problem We're Solving</h2>
                        </div>
                        <div className="about-content-card">
                            <p className="about-text">
                                Traditional voucher and coupon marketplaces suffer from trust issues, fraud, and lack of transparency.
                                Buyers can't verify authenticity, sellers face chargebacks, and intermediaries take hefty fees.
                            </p>
                            <div className="about-problem-grid">
                                <div className="about-problem-item">
                                    <div className="about-problem-icon">
                                        <span className="material-icons">block</span>
                                    </div>
                                    <h3 className="about-problem-title">Fraud & Scams</h3>
                                    <p className="about-problem-desc">Fake vouchers and dishonest sellers plague traditional platforms</p>
                                </div>
                                <div className="about-problem-item">
                                    <div className="about-problem-icon">
                                        <span className="material-icons">attach_money</span>
                                    </div>
                                    <h3 className="about-problem-title">High Fees</h3>
                                    <p className="about-problem-desc">Centralized platforms charge excessive transaction fees</p>
                                </div>
                                <div className="about-problem-item">
                                    <div className="about-problem-icon">
                                        <span className="material-icons">lock</span>
                                    </div>
                                    <h3 className="about-problem-title">No Transparency</h3>
                                    <p className="about-problem-desc">Lack of verifiable transaction history and authenticity</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Our Solution */}
                    <section className="about-section">
                        <div className="about-section-header">
                            <span className="about-section-badge">Our Innovation</span>
                            <h2 className="about-section-title">What CouponMarche Does</h2>
                        </div>
                        <div className="about-content-card about-solution-card">
                            <p className="about-text">
                                CouponMarche leverages blockchain technology to create a trustless, transparent marketplace where
                                vouchers are tokenized as NFTs, ensuring authenticity and enabling secure peer-to-peer transactions.
                            </p>
                            <div className="about-features-grid">
                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <span className="material-icons">link</span>
                                    </div>
                                    <h3 className="about-feature-title">Blockchain Security</h3>
                                    <p className="about-feature-desc">All transactions secured by smart contracts on the blockchain</p>
                                </div>
                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <span className="material-icons">confirmation_number</span>
                                    </div>
                                    <h3 className="about-feature-title">NFT Vouchers</h3>
                                    <p className="about-feature-desc">Each voucher is a unique, verifiable digital asset</p>
                                </div>
                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <span className="material-icons">handshake</span>
                                    </div>
                                    <h3 className="about-feature-title">Trustless Trading</h3>
                                    <p className="about-feature-desc">No intermediaries needed - direct peer-to-peer exchange</p>
                                </div>
                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <span className="material-icons">verified</span>
                                    </div>
                                    <h3 className="about-feature-title">Transparent History</h3>
                                    <p className="about-feature-desc">Complete transaction history visible on-chain</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Who Is This For */}
                    <section className="about-section">
                        <div className="about-section-header">
                            <span className="about-section-badge">Our Community</span>
                            <h2 className="about-section-title">Who Is This For?</h2>
                        </div>
                        <div className="about-audience-grid">
                            <div className="about-audience-card about-audience-buyers">
                                <div className="about-audience-icon">
                                    <span className="material-icons">shopping_bag</span>
                                </div>
                                <h3 className="about-audience-title">Smart Shoppers</h3>
                                <p className="about-audience-desc">
                                    Find authentic vouchers at discounted prices with complete peace of mind.
                                    Verify authenticity before purchase and enjoy secure transactions.
                                </p>
                                <ul className="about-audience-list">
                                    <li>Verified voucher authenticity</li>
                                    <li>Competitive marketplace pricing</li>
                                    <li>Instant digital delivery</li>
                                </ul>
                            </div>
                            <div className="about-audience-card about-audience-sellers">
                                <div className="about-audience-icon">
                                    <span className="material-icons">business_center</span>
                                </div>
                                <h3 className="about-audience-title">Voucher Sellers</h3>
                                <p className="about-audience-desc">
                                    Monetize unused vouchers quickly and securely. No chargebacks,
                                    minimal fees, and instant payment upon sale.
                                </p>
                                <ul className="about-audience-list">
                                    <li>List vouchers in minutes</li>
                                    <li>Low platform fees</li>
                                    <li>Instant cryptocurrency payments</li>
                                </ul>
                            </div>
                            <div className="about-audience-card about-audience-businesses">
                                <div className="about-audience-icon">
                                    <span className="material-icons">corporate_fare</span>
                                </div>
                                <h3 className="about-audience-title">Businesses</h3>
                                <p className="about-audience-desc">
                                    Create promotional campaigns and distribute vouchers with built-in
                                    tracking and authenticity verification.
                                </p>
                                <ul className="about-audience-list">
                                    <li>Blockchain-verified promotions</li>
                                    <li>Real-time campaign analytics</li>
                                    <li>Fraud prevention built-in</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="about-section">
                        <div className="about-section-header">
                            <span className="about-section-badge">Meet the Team</span>
                            <h2 className="about-section-title">The People Behind CouponMarche</h2>
                        </div>
                        <div className="about-team-grid">
                            <div className="about-team-card">
                                <div className="about-team-avatar">
                                    <span className="material-icons">person</span>
                                </div>
                                <h3 className="about-team-name">Alex Chen</h3>
                                <p className="about-team-role">Founder & CEO</p>
                                <p className="about-team-bio">
                                    Former blockchain engineer at Coinbase with 8+ years building decentralized applications.
                                </p>
                            </div>
                            <div className="about-team-card">
                                <div className="about-team-avatar">
                                    <span className="material-icons">person</span>
                                </div>
                                <h3 className="about-team-name">Sarah Martinez</h3>
                                <p className="about-team-role">Head of Product</p>
                                <p className="about-team-bio">
                                    Product leader from Shopify, specializing in marketplace platforms and user experience.
                                </p>
                            </div>
                            <div className="about-team-card">
                                <div className="about-team-avatar">
                                    <span className="material-icons">person</span>
                                </div>
                                <h3 className="about-team-name">David Kim</h3>
                                <p className="about-team-role">Lead Smart Contract Developer</p>
                                <p className="about-team-bio">
                                    Security-focused Solidity expert with audited contracts managing $50M+ in assets.
                                </p>
                            </div>
                            <div className="about-team-card">
                                <div className="about-team-avatar">
                                    <span className="material-icons">person</span>
                                </div>
                                <h3 className="about-team-name">Emily Johnson</h3>
                                <p className="about-team-role">Head of Design</p>
                                <p className="about-team-bio">
                                    Award-winning designer creating intuitive interfaces for Web3 applications.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className="about-cta">
                        <h2 className="about-cta-title">Ready to Get Started?</h2>
                        <p className="about-cta-text">
                            Join thousands of users buying and selling vouchers securely on the blockchain.
                        </p>
                        <div className="about-cta-buttons">
                            <a href="/marketplace" className="about-cta-btn about-cta-primary">
                                Explore Marketplace
                            </a>
                            <a href="/contact" className="about-cta-btn about-cta-secondary">
                                Contact Us
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
