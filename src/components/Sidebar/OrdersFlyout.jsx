import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, PackageSearch, PackageCheck, Truck, Clock, History } from "lucide-react";
import "./Sidebar.css"; // Reuse sidebar styling structure

function OrdersFlyout({ menu, position, onMouseEnter, onMouseLeave }) {
    const location = useLocation();

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
            case "All Orders":
                return <ShoppingBag size={16} className="flyout-item-icon" />;
            case "Pending Orders":
                return <Clock size={16} className="flyout-item-icon" />;
            case "Picking":
                return <PackageSearch size={16} className="flyout-item-icon" />;
            case "Packing":
                return <PackageCheck size={16} className="flyout-item-icon" />;
            case "Delivery Tracking":
                return <Truck size={16} className="flyout-item-icon" />;
            case "Label History":
                return <History size={16} className="flyout-item-icon" />;
            default:
                return <ShoppingBag size={16} className="flyout-item-icon" />;
        }
    };

    return (
        <div 
            className="sidebar-flyout-panel orders-flyout-panel fade-in"
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flyout-header">
                <span className="flyout-title">{menu.label}</span>
            </div>
            
            <ul className="flyout-list">
                {menu.submenu.map((item, idx) => {
                    const isActive = isLinkActive(item.path);
                    return (
                        <li key={idx}>
                            <Link 
                                to={item.path} 
                                className={`flyout-link ${isActive ? "active" : ""}`}
                            >
                                <span className="flyout-icon-wrap">
                                    {getMenuIcon(item.label)}
                                </span>
                                <span className="flyout-label">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default OrdersFlyout;
