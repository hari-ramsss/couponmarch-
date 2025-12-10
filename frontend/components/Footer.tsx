export default function Footer(){
    return(
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
    )
}