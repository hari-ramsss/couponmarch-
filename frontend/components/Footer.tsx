export default function Footer() {
    return (
        <footer className="bg-pure-black text-white py-16 px-6 border-t-8 border-punchy-red">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-sunny-yellow rounded-lg p-2 border-4 border-white">
                                <img
                                    
                                    alt="CouponMarche"
                                    className="w-8 h-8 object-contain"
                                />
                            </div>
                            <span className="font-display text-2xl font-bold">CouponMarche</span>
                        </div>
                        <p className="text-base font-body text-white/80 leading-relaxed">
                            AI-verified voucher marketplace powered by MNEE stablecoin.
                        </p>

                        {/* Social Links with Brutalist Style */}
                        <div className="flex gap-3 mt-6">
                            <a
                                href="#"
                                className="bg-bold-teal text-white w-10 h-10 rounded-lg border-4 border-white flex items-center justify-center hover:scale-110 transition-transform font-bold"
                            >
                                𝕏
                            </a>
                            <a
                                href="#"
                                className="bg-deep-purple text-white w-10 h-10 rounded-lg border-4 border-white flex items-center justify-center hover:scale-110 transition-transform font-bold"
                            >
                                D
                            </a>
                            <a
                                href="#"
                                className="bg-orange-accent text-white w-10 h-10 rounded-lg border-4 border-white flex items-center justify-center hover:scale-110 transition-transform font-bold"
                            >
                                G
                            </a>
                        </div>
                    </div>

                    {/* Marketplace Links */}
                    <div>
                        <h6 className="text-eyebrow mb-6 text-sunny-yellow">
                            Marketplace
                        </h6>
                        <ul className="space-y-3 font-body">
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Browse Vouchers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Sell Voucher
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> My Listings
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> My Purchases
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h6 className="text-eyebrow mb-6 text-sunny-yellow">
                            Resources
                        </h6>
                        <ul className="space-y-3 font-body">
                            <li>
                                <a
                                    href="#how-it-works"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> How It Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> FAQ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Smart Contracts
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h6 className="text-eyebrow mb-6 text-sunny-yellow">
                            Legal
                        </h6>
                        <ul className="space-y-3 font-body">
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Terms of Service
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-white/90 hover:text-sunny-yellow transition-colors font-semibold inline-flex items-center gap-2"
                                >
                                    <span className="text-sunny-yellow">→</span> Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar with Brutalist Style */}
                <div className="border-t-4 border-punchy-red pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="bg-punchy-red text-white px-6 py-3 rounded-xl border-4 border-white font-bold font-body text-sm">
                            © 2025 CouponMarche • Built for MNEE Hackathon 🚀
                        </div>

                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors font-semibold text-sm"
                            >
                                Status
                            </a>
                            <a
                                href="#"
                                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border-2 border-white/30 hover:bg-white/20 transition-colors font-semibold text-sm"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
