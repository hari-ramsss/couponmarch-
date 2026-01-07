"use client";

import { useWallet } from "@/contexts/WalletContext";
import Header from "@/components/Header";

export default function MyListingsPage() {
    const { wallet } = useWallet();

    if (!wallet.isConnected) {
        return (
            <>
                <Header pageType="marketplace" />
                <div className="min-h-screen bg-[var(--off-white)] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
                        <p className="text-lg text-gray-600">
                            Please connect your wallet to view your listings.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header pageType="marketplace" />
            <div className="min-h-screen bg-[var(--off-white)] p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8">My Listings</h1>
                    <div className="bg-white border-4 border-black rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-semibold mb-4">No Listings Yet</h2>
                        <p className="text-gray-600 mb-6">
                            You haven't created any voucher listings yet. Start selling your vouchers to see them here!
                        </p>
                        <a
                            href="/sell"
                            className="inline-block bg-[var(--bold-teal)] text-white px-6 py-3 rounded-lg font-semibold hover:transform hover:-translate-y-1 transition-all duration-200"
                        >
                            Create Your First Listing
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}