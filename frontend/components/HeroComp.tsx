
import Link from "next/link";

export default function HeroComp() {
    return (
        <section className="hero-comp">
            <div className="hero-content-wrapper">
                <h1 className="hero-main-title">
                    A secure marketplace for buying and selling verified vouchers.
                </h1>
                <p className="hero-subtitle">
                    Powered by AI validation and blockchain escrow for 100% safe transactions.
                </p>
                <Link href="/marketplace" className="hero-cta-btn">
                    Explore the Marketplace
                </Link>
            </div>
        </section>
    )
}