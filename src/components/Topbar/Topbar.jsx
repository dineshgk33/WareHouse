import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Globe, Bell, ChevronDown, LogOut, Settings, User, Menu, Building2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SwitchWorkspaceModal from "./SwitchWorkspaceModal";
import avatarImg from "../../assets/dinesh.png";
import logoImg from "../../assets/logo.jpeg";
import "./Topbar.css";

function Topbar({ onOpenMobileSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

    const { user, selectedRoleName, selectedWarehouseName, logout } = useAuth();
    
    const userName = user ? `${user.firstName} ${user.lastName}` : "";
    const userRole = selectedRoleName || "";
    const warehouseName = selectedWarehouseName || "";
    const profileImage = user?.ProfileImage || avatarImg;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getPageTitle = () => {
        const path = location.pathname.toLowerCase();
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/catalogue')) return 'Catalogue';
        if (path.includes('/orders')) return 'Orders';
        if (path.includes('/customers')) return 'Customers';
        if (path.includes('/settings')) return 'Settings';
        if (path.includes('/admin')) return 'Admin';
        if (path.includes('/catalog')) return 'Catalog';
        if (path.includes('/billing')) return 'Billing';
        if (path.includes('/analytics')) return 'Analytics';
        if (path.includes('/darkhouses')) return 'Darkhouses';
        if (path.includes('/indent')) return 'Indent Management';
        if (path.includes('/dispatch')) return 'Dispatch Management';
        if (path.includes('/receiving')) return 'Receiving Management';
        if (path.includes('/grn')) return 'GRN (Goods Receipt Note)';
        return 'Dashboard';
    };

    return (
        <header className="topbar">
            {/* Offscreen dummy inputs to satisfy Chrome's password manager and prevent it from binding to the search input */}
            <div style={{ position: "absolute", top: "-1000px", left: "-1000px", width: "1px", height: "1px", overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
                <input type="text" name="chrome-username-dummy" autoComplete="username" tabIndex={-1} />
                <input type="password" name="chrome-password-dummy" autoComplete="current-password" tabIndex={-1} />
            </div>

            {/* Left Section: Mobile Hamburger menu, Logo & Dynamic Title */}
            <div className="topbar-left-wrapper">
                <button className="topbar-hamburger-btn" onClick={onOpenMobileSidebar} aria-label="Open menu">
                    <Menu size={20} />
                </button>
                <div className="topbar-mobile-logo-group">
                    <img src={logoImg} className="topbar-mobile-logo-img" alt="HAATZA Logo" />
                    <span className="topbar-mobile-logo-text">HAATZA</span>
                </div>
                <h1 className="topbar-page-title">{getPageTitle()}</h1>
            </div>

            {/* Center Section: Global Search */}
            <div className="topbar-center-wrapper">
                <div className="global-search-container">
                    <Search className="search-icon" size={16} />
                    <input 
                        type="search" 
                        placeholder="Search products, orders, customers..." 
                        className="topbar-search-input"
                        autoComplete="new-password"
                        name="topbar-search"
                    />
                    <kbd className="search-kbd">/</kbd>
                </div>
            </div>

            {/* Right Section: Actions, Workspace & Profile */}
            <div className="topbar-actions">
                {/* Mobile Search Trigger Icon */}
                <button className="topbar-mobile-search-btn" onClick={() => setIsMobileSearchOpen(true)} aria-label="Search">
                    <Search size={18} />
                </button>

                {/* Language Picker */}
                <div className="action-item language-selector">
                    <Globe size={18} />
                    <span>EN</span>
                </div>

                {/* Notifications Bell */}
                <div className="action-item notification-bell">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </div>

                {/* Workspace Switcher */}
                <div className="workspace-switcher-btn" onClick={() => setIsSwitchModalOpen(true)}>
                    <div className="ws-switcher-info">
                        <span className="ws-name">{warehouseName}</span>
                        <span className="ws-role">{userRole}</span>
                    </div>
                    <ChevronDown size={14} className="ws-dropdown-icon" />
                </div>

                {/* Simplified Admin Profile */}
                <div className="topbar-profile-wrapper">
                    <div 
                        className={`profile-container ${isDropdownOpen ? "dropdown-active" : ""}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <img 
                            src={profileImage} 
                            alt={`${userName} Profile Avatar`} 
                            className="profile-avatar"
                            onError={(e) => {
                                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
                            }}
                        />
                        <span className="profile-name-simple">{userName}</span>
                        <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? "arrow-rotate" : ""}`} />
                    </div>

                    {isDropdownOpen && (
                        <>
                            <div className="topbar-dropdown-overlay" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="topbar-profile-dropdown">
                                {/* Mobile-only user header */}
                                <div className="dropdown-user-header-mobile">
                                    <span className="user-name-title">{userName}</span>
                                    <span className="user-role-subtitle">{userRole} • {warehouseName}</span>
                                    <div className="dropdown-divider"></div>
                                </div>
                                
                                {/* Mobile-only notifications section */}
                                <button className="dropdown-btn dropdown-notifications-item" onClick={() => { setIsDropdownOpen(false); alert("Opening Notifications Dashboard..."); }}>
                                    <Bell size={15} />
                                    <span>Notifications</span>
                                    <span className="dropdown-notification-badge">3 new</span>
                                </button>
                                
                                {/* Mobile-only workspace switch */}
                                <button className="dropdown-btn dropdown-workspace-item" onClick={() => { setIsDropdownOpen(false); setIsSwitchModalOpen(true); }}>
                                    <Building2 size={15} />
                                    <span>Switch Workspace</span>
                                </button>

                                <button className="dropdown-btn" onClick={() => { setIsDropdownOpen(false); navigate("/settings"); }}>
                                    <Settings size={15} />
                                    <span>Account Settings</span>
                                </button>
                                <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                                    <LogOut size={15} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Search Overlay Input Box */}
            {isMobileSearchOpen && (
                <div className="mobile-search-overlay">
                    <div className="mobile-search-overlay-input-wrap">
                        <Search className="mobile-search-overlay-icon" size={16} />
                        <input 
                            type="search" 
                            placeholder="Search products, orders, customers..." 
                            className="mobile-search-overlay-field"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setIsMobileSearchOpen(false);
                            }}
                        />
                        <button className="mobile-search-overlay-close-btn" onClick={() => setIsMobileSearchOpen(false)}>✕</button>
                    </div>
                </div>
            )}

            {isSwitchModalOpen && (
                <SwitchWorkspaceModal onClose={() => setIsSwitchModalOpen(false)} />
            )}
        </header>
    );
}

export default Topbar;