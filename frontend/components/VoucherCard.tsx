interface VoucherCardProps {
    id: number;
    name: string;
    value: number;
    price: number;
    discount: number;
    onBuy?: () => void;
}

export default function VoucherCard({ id, name, value, price, discount, onBuy }: VoucherCardProps) {
    return (
        <div className="bg-white rounded-2xl border-6 border-pure-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <span className="bg-bold-teal text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-pure-black">
                    ✓ Verified
                </span>
                <span className="text-2xl">🎫</span>
            </div>

            <h4 className="mb-3 text-lg">{name}</h4>

            <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-punchy-red font-display">
                        ${price}
                    </span>
                    <span className="text-sm line-through text-muted-gray">
                        ${value}
                    </span>
                </div>
                <div className="inline-block bg-orange-accent text-white px-3 py-1 rounded-lg border-3 border-pure-black font-bold text-xs">
                    {discount}% OFF
                </div>
            </div>

            <button
                onClick={onBuy}
                className="w-full bg-punchy-red text-white font-bold py-3 px-4 rounded-xl hover:scale-105 transition-transform border-4 border-pure-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
                Buy Now
            </button>
        </div>
    );
}
