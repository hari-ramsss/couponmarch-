"use client";

import Header from "@/components/Header";
import HeroComp from "@/components/HeroComp";
import VerifiedListing from "@/components/VerifiedListing";

export default function Home() {
  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <HeroComp />

      {/* How it works section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="section-title">How It Works</h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">
                <img src="./icons/uploadicon.png" alt="Upload icon" />
              </div>
              <h3 className="step-title">🧩 STEP 1 — List Voucher</h3>
              <h6 className="step-subtitle">List your voucher</h6>
              <p className="step-description">
                Upload your unused voucher in a few clicks. Our system captures all details and prepares it for AI validation.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <img src="./icons/wallet.png" alt="Wallet icon" />
              </div>
              <h3 className="step-title">💰 STEP 2 — Buyer Pays (Escrow)</h3>
              <h6 className="step-subtitle">Buyer locks in payment</h6>
              <p className="step-description">
                A buyer selects your voucher and pays into a blockchain escrow smart contract so the funds are held safely.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <img src="./icons/magnigfyingglass.png" alt="Magnifying glass icon" />
              </div>
              <h3 className="step-title">🔍 STEP 3 — Verify Code</h3>
              <h6 className="step-subtitle">Buyer tests the voucher</h6>
              <p className="step-description">
                The buyer receives the voucher details and tests or redeems it within the allowed time window.
              </p>
            </div>

            <div className="step-card">
              <div className="step-icon">
                <img src="./icons/cointick.png" alt="Coin tick icon" />
              </div>
              <h3 className="step-title">✅ STEP 4 — Release Funds / Resolve</h3>
              <h6 className="step-subtitle">Funds released or refunded</h6>
              <p className="step-description">
                If the voucher works, escrow instantly releases payment to the seller. If there's an issue, a dispute can be raised and funds are returned to the buyer for invalid vouchers.
              </p>
            </div>
          </div>
        </div>
      </section>

    <VerifiedListing/>
    <section id="why-couponmarch">
  <h2>Why Use Couponmarch?</h2>

  <div className="timeline-layout">

    <div className="timeline-item">
      <span className="timeline-icon">🧠</span>
      <div className="timeline-text">
        <h3>AI-Based Authenticity Checks</h3>
        <p>AI detects fake, reused, or invalid vouchers instantly.</p>
      </div>
    </div>

    <div className="timeline-item">
      <span className="timeline-icon">🔒</span>
      <div className="timeline-text">
        <h3>Secure Blockchain Escrow</h3>
        <p>Funds stay safely locked until the voucher is verified by the buyer.</p>
      </div>
    </div>

    <div className="timeline-item">
      <span className="timeline-icon">⚖️</span>
      <div className="timeline-text">
        <h3>Fair Dispute Resolution</h3>
        <p>Buyers can raise disputes for invalid vouchers; refunds are secure.</p>
      </div>
    </div>

    <div className="timeline-item">
      <span className="timeline-icon">📊</span>
      <div className="timeline-text">
        <h3>On-Chain Transparency</h3>
        <p>Every transaction is traceable and tamper-proof.</p>
      </div>
    </div>

  </div>
</section>

<footer id="footer">

  {/* Top Divider */}
  <hr className="footer-divider" />

  <div className="footer-container">

    {/* Column 1 – Information */}
    <div className="footer-section">
      <h3>Information</h3>
      <ul className="footer-links">
        <li><a href="/about">About</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/terms">Terms & Privacy</a></li>
      </ul>
    </div>

    {/* Middle Divider */}
    <hr className="footer-divider-vertical" />

    {/* Column 2 – Quick Links */}
    <div className="footer-section">
      <h3>Quick Links</h3>
      <ul className="footer-links">
        <li><a href="/marketplace">Marketplace</a></li>
        <li><a href="/create-listing">Create Listing</a></li>
        <li><a href="/how-it-works">How It Works</a></li>
        <li><a href="/support">Support</a></li>
      </ul>
    </div>

    {/* Middle Divider */}
    <hr className="footer-divider-vertical" />

    {/* Column 3 – Social */}
    <div className="footer-section">
      <h3>Follow Us</h3>
      <ul className="footer-links">
        <li><a href="#">Instagram</a></li>
        <li><a href="#">Twitter / X</a></li>
        <li><a href="#">YouTube</a></li>
        <li><a href="#">LinkedIn</a></li>
      </ul>
    </div>

  </div>

  {/* Bottom Divider */}
  <hr className="footer-divider" />

  <p className="footer-copy">© 2025 Couponmarch. All rights reserved.</p>

</footer>

    </div>
  );
}