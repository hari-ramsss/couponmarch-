import Link from "next/link";

export default function Footer() {
  return (
    <footer id="footer">

      {/* Top Divider */}
      <hr className="footer-divider" />

      <div className="footer-container">

        {/* Column 1 – Information */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul className="footer-links">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/terms">Terms & Privacy</Link></li>
          </ul>
        </div>

        {/* Middle Divider */}
        <hr className="footer-divider-vertical" />

        {/* Column 2 – Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/sell">Create Listing</Link></li>
            <li><Link href="/my-purchases">My Vouchers</Link></li>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>

        {/* Middle Divider */}
        <hr className="footer-divider-vertical" />

        {/* Column 3 – Social */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <ul className="footer-links">
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
            <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Divider */}
      <hr className="footer-divider" />

      <p className="footer-copy">© 2025 Couponmarch. All rights reserved.</p>

    </footer>
  )
}