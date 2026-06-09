import React, { useState, useEffect, useRef } from "react";
import { Building2, Users, ChevronDown } from "lucide-react";
import "./SearchableSelect.css";

// Reusable Searchable Dropdown Selector Component
function SearchableSelect({
    label,
    placeholder,
    options,
    value,
    onChange,
    disabled = false,
    displayKey = "label",
    valueKey = "value",
    searchKey = "label",
    iconType
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find(opt => opt[valueKey] === value);

    const filteredOptions = options.filter(opt =>
        String(opt[searchKey]).toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleOutsideClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        setSearch("");
    };

    const handleOptionSelect = (option) => {
        onChange(option[valueKey], option);
        setIsOpen(false);
        setSearch("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("", null);
        setIsOpen(false);
        setSearch("");
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) setIsOpen(true);
            else setHighlightedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : prev);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (isOpen) setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleOptionSelect(filteredOptions[highlightedIndex]);
            } else if (!isOpen) {
                setIsOpen(true);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className={`searchable-select-root ${isOpen ? "open" : ""}`} ref={containerRef} onKeyDown={handleKeyDown}>
            <button
                type="button"
                className={`select-trigger-btn ${isOpen ? "open" : ""}`}
                onClick={handleToggle}
                disabled={disabled}
            >
                {/* Dynamic Icon */}
                {iconType === 'warehouse' && (
                    <div className="select-icon-left warehouse">
                        <Building2 size={16} />
                    </div>
                )}
                {iconType === 'role' && (
                    <div className="select-icon-left role">
                        <Users size={16} />
                    </div>
                )}

                <div className="select-trigger-value">
                    {selectedOption ? (
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{selectedOption[displayKey]}</span>
                    ) : (
                        <span className="select-trigger-placeholder">{placeholder}</span>
                    )}
                </div>
                <div className="select-actions" style={{ display: 'flex', alignItems: 'center' }}>
                    {selectedOption && !disabled && (
                        <span role="button" onClick={handleClear} aria-label="Clear selection" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', padding: '0 4px', color: '#64748b' }}>
                            ✕
                        </span>
                    )}
                    <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", marginLeft: '4px', color: '#64748b' }} />
                </div>
            </button>

            {isOpen && (
                <div className="select-dropdown-menu">
                    <div className="select-search-container">
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="select-search-input"
                            placeholder="Search options..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setHighlightedIndex(-1);
                            }}
                        />
                    </div>
                    <ul className="select-options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <li
                                    key={opt[valueKey]}
                                    className={`select-option-item ${opt[valueKey] === value ? "selected" : ""} ${idx === highlightedIndex ? "highlighted" : ""}`}
                                    onClick={() => handleOptionSelect(opt)}
                                >
                                    {opt[displayKey]}
                                </li>
                            ))
                        ) : (
                            <li className="select-no-results">No options matched</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SearchableSelect;
