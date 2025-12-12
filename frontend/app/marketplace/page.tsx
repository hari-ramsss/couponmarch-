"use client";

import Header from "@/components/Header";
import { useState } from "react";
import CategoryTab from "@/components/Category";
import FilterSidebar from "@/components/FilterSidebar";
import ListingsGrid from "@/components/ListingsGrid";
import Footer from "@/components/Footer";
export default function Marketplace() {
    const categories = [
        "Food",
        "Fashion",
        "Travel",
        "Groceries",
        "Electronics",
        "Online Stores"
    ];
    const [active, setActive] = useState("Food");
    const listings = [
        {
            id: 1,
            title: "₹500 Gift Card",
            type: "Gift Card",
            discount: "30% OFF",
            description: "Valid on all Amazon orders above ₹1,999.",
            price: "0.015 ETH",
            verified: true,
        },
        {
            id: 2,
            title: "Swiggy Food Coupon",
            type: "Discount Coupon",
            discount: "25% OFF",
            description: "Applicable on orders above ₹299.",
            price: "0.008 ETH",
            verified: true,
        },
        {
            id: 3,
            title: "Myntra Fashion Voucher",
            type: "Store Credit",
            discount: "20% OFF",
            description: "Valid on fashion and accessories.",
            price: "0.010 ETH",
            verified: false,
        },
        {
            id: 4,
            title: "MakeMyTrip Travel Credit",
            type: "Travel Voucher",
            discount: "₹1000 OFF",
            description: "Usable on flights or hotels above ₹4000.",
            price: "0.020 ETH",
            verified: true,
        },
    ];
    return (
        <div className="min-h-screen bg-off-white">
            <Header pageType="marketplace" />

            {/* Marketplace Header */}
            <main className="marketplace-main">
                <div className="marketplace-container">
                    <h1>Marketplace</h1>
                    <p>Browse and purchase verified vouchers from trusted sellers</p>
                </div>
            </main>

            {/* Category Tabs */}
            <div className="category-tabs">
                {categories.map((cat) => (
                    <CategoryTab
                        key={cat}
                        label={cat}
                        isActive={active === cat}
                        onClick={() => setActive(cat)}
                    />
                ))}
            </div>

            {/* Marketplace Content Layout */}
            <div className="marketplace-layout">
                <FilterSidebar />

                <main className="marketplace-content-area">
                    <section className="listings-section">
                        <div className="listings-header">
                            <h2>Marketplace Listings</h2>
                            <p>Browse verified vouchers available for purchase in the "{active}" category.</p>
                            <div className="results-info">
                                <span className="results-count">{listings.length} vouchers found</span>
                            </div>
                        </div>

                        <ListingsGrid listings={listings} />
                    </section>
                </main>
            </div>
            <Footer/>
        </div>
    )
}