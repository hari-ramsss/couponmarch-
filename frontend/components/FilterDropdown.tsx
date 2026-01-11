import { useState, useEffect } from "react";

interface FilterDropdownProps {
    label: string;
    options: string[];
    selected?: string;
    onSelect?: (option: string) => void;
}

export default function FilterDropdown({ label, options, selected = "", onSelect }: FilterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [currentSelected, setCurrentSelected] = useState<string>(selected);

    // Sync with external selected prop
    useEffect(() => {
        setCurrentSelected(selected);
    }, [selected]);

    const handleSelect = (option: string) => {
        setCurrentSelected(option);
        setOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };

    // Display text - show label if nothing selected
    const displayText = currentSelected || label;
    const isActive = Boolean(currentSelected);

    return (
        <div className={`filter-dropdown ${isActive ? 'filter-active' : ''}`}>
            <button
                className="filter-dropdown-header"
                onClick={() => setOpen(!open)}
            >
                <span className="filter-dropdown-text">{displayText}</span>
                <span className="material-icons filter-dropdown-icon">
                    {open ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {open && (
                <ul className="filter-dropdown-list">
                    {options.map((opt: string) => (
                        <li
                            key={opt}
                            className={`filter-dropdown-item ${currentSelected === opt ? 'selected' : ''}`}
                            onClick={() => handleSelect(opt)}
                        >
                            {opt}
                            {currentSelected === opt && (
                                <span className="material-icons check-icon">check</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}