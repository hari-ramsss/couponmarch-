export default function Header() {
    return (
        <header className="bg-pure-black text-white sticky top-0 z-50 border-b-4 border-punchy-red">
            <nav className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src=""
                            alt="CouponMarche"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="font-display text-xl font-bold">CouponMarche</span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 font-body">
                        <a href="#marketplace" className="hover:text-sunny-yellow transition-colors font-semibold">
                            Marketplace
                        </a>
                        <a href="#how-it-works" className="hover:text-sunny-yellow transition-colors font-semibold">
                            How It Works
                        </a>
                        <a href="#about" className="hover:text-sunny-yellow transition-colors font-semibold">
                            About
                        </a>
                    </div>

                    <button className="bg-bold-teal text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transition-transform border-4 border-white shadow-lg">
                        Connect Wallet
                    </button>
                </div>
            </nav>
        </header>
    );
}
