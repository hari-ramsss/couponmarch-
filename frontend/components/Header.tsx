"use client";

export default function Header() {
    return (
        <header className="header">
            <nav className="nav-container">
                {/* Logo */}
                <h1 className="nav-logo">
                    CouponMarchè
                </h1>

                {/* Navigation Links */}
                <ul className="nav-links">
                    <li>
                        <a href="#marketplace" className="nav-link">
                            MarketPlace
                        </a>
                    </li>
                    <li>
                        <a href="#sell" className="nav-link">
                            Sell
                        </a>
                    </li>
                    <li>
                        <a href="#how-it-works" className="nav-link">
                            How it works
                        </a>
                    </li>
                    <li>
                        <a href="#about" className="nav-link">
                            About
                        </a>
                    </li>
                </ul>

                {/* Search  */}
                <form className="nav-form">
                    <input
                        type="text"
                        placeholder="what do u want to know"
                        className="nav-search"
                    />
                    <button
                        type="button"
                        className="nav-wallet-btn"
                    >
                        Search
                    </button>
                </form>
            </nav>
        </header>
    );
}
