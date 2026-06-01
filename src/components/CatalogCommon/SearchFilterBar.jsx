import React from "react";
import { Search } from "lucide-react";
import "./CatalogCommon.css";

function SearchFilterBar({ 
    search, 
    onSearchChange, 
    placeholder = "Search...", 
    filters = [],
    extraElement = null
}) {
    return (
        <div className="cat-controls-row">
            {/* Search wrap */}
            <div className="cat-search-wrap">
                <Search size={15} className="cat-search-icon" />
                <input
                    type="text"
                    className="cat-search-input"
                    placeholder={placeholder}
                    value={search}
                    onChange={onSearchChange}
                    aria-label="Search items"
                />
            </div>

            {/* Filters and Extra elements */}
            <div className="cat-controls-right">
                {filters.map((filter, idx) => (
                    <div key={idx} className="cat-filter-wrap">
                        <select
                            value={filter.value}
                            onChange={filter.onChange}
                            className="cat-filter-select"
                            aria-label={filter.label || "Filter"}
                        >
                            {filter.options.map((opt, oIdx) => {
                                const val = typeof opt === "object" ? opt.value : opt;
                                const lbl = typeof opt === "object" ? opt.label : opt;
                                return (
                                    <option key={oIdx} value={val}>
                                        {lbl}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                ))}
                {extraElement}
            </div>
        </div>
    );
}

export default SearchFilterBar;
