"use client";

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <section className="py-8 px-6 bg-white border-b-4 border-muted-gray sticky top-[73px] z-40">
            <div className="max-w-6xl mx-auto">
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap border-4 transition-all ${selectedCategory === cat.id
                                    ? "bg-punchy-red text-white border-pure-black scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    : "bg-off-white text-pure-black border-muted-gray hover:border-punchy-red hover:scale-105"
                                }`}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
