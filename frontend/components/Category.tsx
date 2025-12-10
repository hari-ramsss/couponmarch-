
interface CategoryProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export default function Category({ label, isActive, onClick }: CategoryProps) {
    return (
        <button
            className={`category-tab ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}