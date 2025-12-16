

export default function VerifiedListing() {
  return (
    <>
      <section id="verified-listings">
        <h2>Verified Listings – Safe to Buy</h2>
        <p>All vouchers below are AI-validated and held in secure escrow.</p>

        <div className="listing-grid">
          {/* Card 1 */}
          <article className="listing-card">
            {/* Voucher Logo */}
            <div className="voucher-logo-container">
              <img
                src="/img/blank_coupon.png"
                alt="Amazon Gift Voucher logo"
                className="voucher-logo"
              />
            </div>

            <div className="listing-header">
              <h3 className="voucher-name">Amazon Gift Voucher</h3>
              <span className="verified-badge">✔ Verified</span>
            </div>

            <p className="voucher-type"><strong>Type:</strong> Gift Card</p>
            <p className="voucher-discount">₹500 OFF</p>
            <p className="voucher-description">
              Valid on all Amazon orders above ₹1,999. Single-use only.
            </p>

            <p className="voucher-price">
              Price: <strong>0.015 ETH</strong>
            </p>

            <button type="button" className="verified-buy-btn">View / Buy</button>
          </article>

          {/* Card 2 */}
          <article className="listing-card">
            {/* Voucher Logo */}
            <div className="voucher-logo-container">
              <img
                src="/img/blank_coupon.png"
                alt="Swiggy Food Coupon logo"
                className="voucher-logo"
              />
            </div>

            <div className="listing-header">
              <h3 className="voucher-name">Swiggy Food Coupon</h3>
              <span className="verified-badge">✔ Verified</span>
            </div>

            <p className="voucher-type"><strong>Type:</strong> Discount Coupon</p>
            <p className="voucher-discount">Flat 30% OFF</p>
            <p className="voucher-description">
              Max discount ₹200. Applicable on partnered restaurants only.
            </p>

            <p className="voucher-price">
              Price: <strong>0.008 ETH</strong>
            </p>

            <button type="button" className="verified-buy-btn">View / Buy</button>
          </article>

          {/* Card 3 */}
          <article className="listing-card">
            {/* Voucher Logo */}
            <div className="voucher-logo-container">
              <img
                src="/img/blank_coupon.png"
                alt="Myntra Fashion Voucher logo"
                className="voucher-logo"
              />
            </div>

            <div className="listing-header">
              <h3 className="voucher-name">Myntra Fashion Voucher</h3>
              <span className="verified-badge">✔ Verified</span>
            </div>

            <p className="voucher-type"><strong>Type:</strong> Store Credit</p>
            <p className="voucher-discount">20% OFF</p>
            <p className="voucher-description">
              Valid on all clothing categories. Not combinable with other offers.
            </p>

            <p className="voucher-price">
              Price: <strong>0.010 ETH</strong>
            </p>

            <button type="button" className="verified-buy-btn">View / Buy</button>
          </article>

          {/* Card 4 */}
          <article className="listing-card">
            {/* Voucher Logo */}
            <div className="voucher-logo-container">
              <img
                src="/img/blank_coupon.png"
                alt="MakeMyTrip Travel Credit logo"
                className="voucher-logo"
              />
            </div>

            <div className="listing-header">
              <h3 className="voucher-name">MakeMyTrip Travel Credit</h3>
              <span className="verified-badge">✔ Verified</span>
            </div>

            <p className="voucher-type"><strong>Type:</strong> Travel Credit</p>
            <p className="voucher-discount">₹1,000 Travel Credit</p>
            <p className="voucher-description">
              Can be used on flights or hotels. Minimum booking value ₹4,000.
            </p>

            <p className="voucher-price">
              Price: <strong>0.02 ETH</strong>
            </p>

            <button type="button" className="verified-buy-btn">View / Buy</button>
          </article>

        </div>
      </section>


    </>
  )
}