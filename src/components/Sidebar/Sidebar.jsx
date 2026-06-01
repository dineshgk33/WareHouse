import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Database,
    BarChart3,
    UserCircle,
    CreditCard,
    Settings,
    HelpCircle,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles
} from "lucide-react";
import logoImg from "../../assets/logo.jpeg";
import "./Sidebar.css";

function Sidebar({ isCollapsed, toggleSidebar }) {
    const navItems = [
        { path: "/", label: "Dashboard", icon: LayoutDashboard },
        { path: "/orders", label: "Orders", icon: ShoppingBag },
        { path: "/products", label: "Products", icon: Package },
        { path: "/inventory", label: "Inventory", icon: Database },
        { path: "/analytics", label: "Analytics", icon: BarChart3 },
        { path: "/customers", label: "Customers", icon: UserCircle },
        { path: "/billing", label: "Billing", icon: CreditCard },
    ];

    const bottomItems = [
        { path: "/settings", label: "Settings", icon: Settings },
        { path: "/support", label: "Help & Support", icon: HelpCircle },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Logo/Brand Header with Integrated Toggle */}
            <div className="sidebar-brand-container">
                {isCollapsed ? (
                    <button className="sidebar-header-toggle collapsed-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                        <PanelLeftOpen size={20} />
                    </button>
                ) : (
                    <div className="sidebar-brand">
                        <div className="brand-logo-group">
                            <div className="logo-icon-container">
                                <img src={logoImg} className="brand-logo-img" alt="HAATZA Logo" />
                            </div>
                            <span className="logo-text-main">HAATZA</span>
                        </div>
                        <button className="sidebar-header-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                            <PanelLeftClose size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation links */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active" : ""}`
                                    }
                                    end={item.path === "/"}
                                >
                                    <Icon size={18} className="nav-icon" />
                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom menu links */}
            <div className="sidebar-footer">
                <ul className="nav-list">
                    {bottomItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    <Icon size={18} className="nav-icon" />
                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;