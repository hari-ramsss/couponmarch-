"use client";

import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import StepCard from "@/components/StepCard";
import CategoryFilter from "@/components/CategoryFilter";
import VoucherCard from "@/components/VoucherCard";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All", icon: "🎫" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "food", name: "Food", icon: "🍔" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
  ];

  const featuredVouchers = [
    { id: 1, name: "Amazon Gift Card", value: 50, price: 45, discount: 10, category: "shopping" },
    { id: 2, name: "Starbucks Coffee", value: 25, price: 22, discount: 12, category: "food" },
    { id: 3, name: "Netflix Premium", value: 100, price: 85, discount: 15, category: "entertainment" },
    { id: 4, name: "Uber Ride Credit", value: 30, price: 27, discount: 10, category: "shopping" },
  ];

  const filteredVouchers = selectedCategory === "all"
    ? featuredVouchers
    : featuredVouchers.filter(v => v.category === selectedCategory);

  return (
    <div className="min-h-screen bg-off-white">
      <Header />

      <main>
        <HeroSection />

        {/* Three Feature Cards */}
        <section className="py-20 px-6 bg-off-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🤖"
                title="AI Validation"
                description="Every voucher is automatically verified by AI before listing. No fake codes, no expired vouchers."
                bgColor="bg-bold-teal"
              />
              <FeatureCard
                icon="🔐"
                title="Escrow Protection"
                description="Funds locked in smart contract until verification. Automatic release or refund based on outcome."
                bgColor="bg-sunny-yellow"
              />
              <FeatureCard
                icon="💎"
                title="MNEE Payments"
                description="Stable, predictable pricing with MNEE stablecoin. No volatility, just smooth transactions."
                bgColor="bg-orange-accent"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 bg-sunny-yellow border-y-8 border-pure-black">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block bg-pure-black text-sunny-yellow px-4 py-2 rounded-lg border-4 border-pure-black font-bold text-sm mb-4">
                SIMPLE PROCESS
              </div>
              <h2 className="mb-4">How It Works</h2>
              <p className="font-body text-lg text-pure-black/70 max-w-2xl mx-auto">
                Four simple steps to trade vouchers securely
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <StepCard step="01" icon="📝" title="List Voucher" description="Upload voucher. AI validates instantly." />
              <StepCard step="02" icon="💰" title="Buyer Pays" description="Funds locked in escrow smart contract." />
              <StepCard step="03" icon="✅" title="Verify Code" description="Buyer tests within 7-hour window." />
              <StepCard step="04" icon="🎉" title="Get Paid" description="Seller receives MNEE automatically." />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Voucher Grid */}
        <section id="marketplace" className="py-16 px-6 bg-off-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="mb-2">Featured Vouchers</h2>
              <p className="font-body text-muted-gray">Verified and ready to trade</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  {...voucher}
                  onBuy={() => console.log(`Buying voucher ${voucher.id}`)}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="bg-deep-purple text-white font-bold py-4 px-10 rounded-xl hover:scale-105 transition-transform border-6 border-pure-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-lg">
                View All Listings →
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-deep-purple text-white py-20 px-6 border-t-8 border-pure-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6">Got Unused Vouchers?</h2>
            <p className="text-xl mb-10 font-body max-w-2xl mx-auto">
              Turn them into cash! List your vouchers in minutes and get paid in MNEE tokens.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-sunny-yellow text-pure-black font-bold py-4 px-10 rounded-xl hover:scale-105 transition-transform border-6 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-lg">
                List Your Voucher
              </button>
              <button className="bg-transparent text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-colors border-6 border-white text-lg">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
