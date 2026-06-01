import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Building, Users, PackagePlus } from "lucide-react";
import "./Sidebar.css"; // Reuse sidebar styling structure

function DarkhouseFlyout({ menu, position, onMouseEnter, onMouseLeave }) {
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
            case "Darkhouse List":
                return <Building size={16} className="flyout-item-icon" />;
            case "Managers":
                return <Users size={16} className="flyout-item-icon" />;
            case "Assign Products":
                return <PackagePlus size={16} className="flyout-item-icon" />;
            default:
                return <Building size={16} className="flyout-item-icon" />;
        }
    };

    return (
        <div 
            className="sidebar-flyout-panel darkhouses-flyout-panel fade-in"
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

export default DarkhouseFlyout;
