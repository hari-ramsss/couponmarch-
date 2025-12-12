import { useState } from "react";

interface FilterDropdownProps {
    label: string;
    options: string[];
    onSelect?: (option: string) => void;
}

export default function FilterDropdown({ label, options, onSelect }: FilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string>("");

    const handleSelect = (option: string) => {
        setSelected(option);
        setOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };

    return (
        <div className="filter-dropdown">
            <button
                className="filter-dropdown-header"
                onClick={() => setOpen(!open)}
            >
                {selected || label}
            </button>

            {open && (
                <ul className="filter-dropdown-list">
                    {options.map((opt: string) => (
                        <li
                            key={opt}
                            className="filter-dropdown-item"
                            onClick={() => handleSelect(opt)}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}