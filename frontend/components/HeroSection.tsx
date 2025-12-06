export default function HeroSection() {
    return (
        <section className="bg-punchy-red border-b-8 border-pure-black py-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Text Content */}
                    <div className="space-y-8">
                        <div className="inline-block bg-sunny-yellow text-pure-black px-4 py-2 rounded-lg border-4 border-pure-black font-bold text-sm">
                            🚀 MNEE-POWERED MARKETPLACE
                        </div>

                        <h1 className="text-white leading-tight">
                            Trade Vouchers
                            <br />
                            <span className="text-sunny-yellow">Zero Fraud</span>
                        </h1>

                        <p className="text-xl text-white font-body leading-relaxed max-w-lg">
                            AI-verified vouchers meet blockchain escrow for 100% secure transactions. Buy and sell with confidence.
                        </p>

                        <div className="flex gap-4 flex-wrap">
                            <button className="bg-sunny-yellow text-pure-black font-bold py-4 px-10 rounded-xl hover:scale-105 transition-transform border-6 border-pure-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-lg">
                                Explore →
                            </button>
                            <button className="bg-white text-punchy-red font-bold py-4 px-10 rounded-xl hover:scale-105 transition-transform border-6 border-pure-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-lg">
                                Sell Voucher
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 pt-4">
                            <div>
                                <div className="text-4xl font-bold text-sunny-yellow font-display">1.2K+</div>
                                <div className="text-white/80 font-body text-sm">Active Listings</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold text-sunny-yellow font-display">$50K+</div>
                                <div className="text-white/80 font-body text-sm">Total Volume</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div>
                                <div className="text-4xl font-bold text-sunny-yellow font-display">100%</div>
                                <div className="text-white/80 font-body text-sm">AI Verified</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Brutalist Illustration */}
                    <div className="relative">
                        <div className="relative z-10">
                            {/* Large Voucher Card */}
                            <div className="bg-sunny-yellow rounded-2xl border-6 border-pure-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 transform rotate-3 hover:rotate-0 transition-transform">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-bold-teal text-white px-3 py-1 rounded-full border-3 border-pure-black font-bold text-xs">
                                        ✓ VERIFIED
                                    </div>
                                    <div className="text-3xl">🎫</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-pure-black rounded w-3/4"></div>
                                    <div className="h-4 bg-pure-black rounded w-1/2"></div>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-3xl font-bold text-pure-black font-display">$45</div>
                                    <div className="bg-orange-accent text-white px-3 py-1 rounded-lg border-3 border-pure-black font-bold text-sm">
                                        10% OFF
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-8 -right-8 bg-bold-teal rounded-full w-24 h-24 border-6 border-pure-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-4xl animate-bounce-slow">
                                💰
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-deep-purple rounded-2xl border-6 border-pure-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 transform -rotate-12">
                                <div className="text-2xl">🔒</div>
                            </div>

                            <div className="absolute top-1/2 -right-12 bg-orange-accent rounded-xl border-4 border-pure-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 transform rotate-12">
                                <div className="text-xl">✨</div>
                            </div>
                        </div>

                        {/* Background Geometric Shapes */}
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-10 left-10 w-32 h-32 bg-bold-teal/20 rounded-full border-4 border-white/30"></div>
                            <div className="absolute bottom-20 right-20 w-40 h-40 bg-sunny-yellow/20 rounded-2xl border-4 border-white/30 transform rotate-45"></div>
                            <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-deep-purple/20 rounded-xl border-4 border-white/30"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
