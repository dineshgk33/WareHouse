import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Store, Repeat, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css"; // Reuse sidebar styling structure

function InventoryFlyout({ menu, position, onMouseEnter, onMouseLeave }) {
    const location = useLocation();
    const [hoveredSubLabel, setHoveredSubLabel] = useState(null);
    const { canView } = useAuth();

    if (!menu || !menu.submenu) return null;

    // Helper to check if a specific submenu path is active
    const isLinkActive = (path) => {
        const currentPath = location.pathname + location.search;
        if (path.includes("?")) {
            return currentPath === path;
        }
        return location.pathname === path;
    };

    // Calculate absolute styles dynamically
    const style = position && position.isBottom
        ? { bottom: `${position.bottom}px`, top: "auto" }
        : { top: `${position ? position.top : 0}px`, bottom: "auto" };

    // Map label to matching icon
    const getMenuIcon = (label) => {
        switch (label) {
            case "Warehouse Inventory":
            case "Warehouse Catalogue":
                return <Package size={16} className="flyout-item-icon" />;
            case "Darkhouse Inventory":
            case "Darkhouse Catalogue":
                return <Store size={16} className="flyout-item-icon" />;
            case "Stock Transfers":
                return <Repeat size={16} className="flyout-item-icon" />;
            default:
                return <Package size={16} className="flyout-item-icon" />;
        }
    };

    const visibleSubmenu = menu.submenu;

    return (
        <div 
            className="sidebar-flyout-panel inventory-flyout-panel fade-in"
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flyout-header">
                <span className="flyout-title">{menu.label}</span>
            </div>
            
            <ul className="flyout-list">
                {visibleSubmenu.map((item, idx) => {
                    const hasSubmenu = !!item.submenu;
                    const isSubHovered = hoveredSubLabel === item.label;
                    const isActive = isLinkActive(item.path);

                    return (
                        <li 
                            key={idx}
                            className={`flyout-item-container ${hasSubmenu ? "has-submenu" : ""}`}
                            style={{ position: "relative" }}
                            onMouseEnter={() => { if (hasSubmenu) setHoveredSubLabel(item.label); }}
                            onMouseLeave={() => { if (hasSubmenu) setHoveredSubLabel(null); }}
                        >
                            {hasSubmenu ? (
                                <div 
                                    className={`flyout-link ${isSubHovered ? "active" : ""}`}
                                    style={{ cursor: "pointer", justifyContent: "space-between" }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span className="flyout-icon-wrap">
                                            {getMenuIcon(item.label)}
                                        </span>
                                        <span className="flyout-label">{item.label}</span>
                                    </div>
                                    <ChevronRight size={14} className="flyout-submenu-indicator" />
                                </div>
                            ) : (
                                <Link 
                                    to={item.path} 
                                    className={`flyout-link ${isActive ? "active" : ""}`}
                                >
                                    <span className="flyout-icon-wrap">
                                        {getMenuIcon(item.label)}
                                    </span>
                                    <span className="flyout-label">{item.label}</span>
                                </Link>
                            )}

                            {/* Secondary popup for cascading menu */}
                            {hasSubmenu && isSubHovered && (
                                <div 
                                    className="sidebar-flyout-panel flyout-secondary-panel fade-in"
                                    style={{
                                        position: "absolute",
                                        left: "calc(100% + 10px)",
                                        top: "-12px",
                                        width: "240px",
                                        margin: 0
                                    }}
                                >
                                    <div className="flyout-header">
                                        <span className="flyout-title">{item.label}</span>
                                    </div>
                                    <ul className="flyout-list">
                                        {item.submenu.map((sub, sIdx) => {
                                            const isSubActive = isLinkActive(sub.path);
                                            return (
                                                <li key={sIdx}>
                                                    <Link 
                                                        to={sub.path} 
                                                        className={`flyout-link ${isSubActive ? "active" : ""}`}
                                                    >
                                                        <span className="flyout-bullet"></span>
                                                        <span className="flyout-label">{sub.label}</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default InventoryFlyout;
