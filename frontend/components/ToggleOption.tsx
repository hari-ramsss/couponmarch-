import { useState } from "react";

interface ToggleOptionProps {
    label: string;
    defaultActive?: boolean;
    onToggle?: (isActive: boolean) => void;
}

export default function ToggleOption({
    label,
    defaultActive = false,
    onToggle
}: ToggleOptionProps) {
    const [active, setActive] = useState<boolean>(defaultActive);

    const handleToggle = () => {
        const newActive = !active;
        setActive(newActive);
        if (onToggle) {
            onToggle(newActive);
        }
    };

    return (
        <div
            className={`toggle-option ${active ? "active" : ""}`}
            onClick={handleToggle}
        >
            {label}
        </div>
    );
}
