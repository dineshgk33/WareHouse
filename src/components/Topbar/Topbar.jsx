import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Globe, Bell, ChevronDown, LogOut, Settings, User, Menu, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SwitchWorkspaceModal from "./SwitchWorkspaceModal";
import avatarImg from "../../assets/dinesh.png";
import logoImg from "../../assets/logo.jpeg";
import "./Topbar.css";

function Topbar({ onOpenMobileSidebar }) {
    const navigate = useNavigate();
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

    return (
        <header className="topbar">
            {/* Offscreen dummy inputs to satisfy Chrome's password manager and prevent it from binding to the search input */}
            <div style={{ position: "absolute", top: "-1000px", left: "-1000px", width: "1px", height: "1px", overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
                <input type="text" name="chrome-username-dummy" autoComplete="username" tabIndex={-1} />
                <input type="password" name="chrome-password-dummy" autoComplete="current-password" tabIndex={-1} />
            </div>

            {/* Left Section: Mobile Hamburger menu & Logo */}
            <div className="topbar-left-wrapper">
                <button className="topbar-hamburger-btn" onClick={onOpenMobileSidebar} aria-label="Open menu">
                    <Menu size={20} />
                </button>
                <div className="topbar-mobile-logo-group">
                    <img src={logoImg} className="topbar-mobile-logo-img" alt="HAATZA Logo" />
                    <span className="topbar-mobile-logo-text">HAATZA</span>
                </div>
            </div>

            {/* Welcome banner text */}
            <div className="topbar-welcome">
                <h1>Welcome, {userName}</h1>
                <p className="welcome-desc">
                    {userRole} • {warehouseName}
                </p>
            </div>

            {/* Actions: Search, Language, Notification, User Profile */}
            <div className="topbar-actions">
                {/* Search Bar */}
                <div className="search-container">
                    <Search className="search-icon" size={16} />
                    <input 
                        type="search" 
                        placeholder="Search anything..." 
                        className="topbar-search-input"
                        autoComplete="new-password"
                        name="topbar-search"
                    />
                    <kbd className="search-kbd">/</kbd>
                </div>

                {/* Mobile Search Trigger Icon */}
                <button className="topbar-mobile-search-btn" onClick={() => setIsMobileSearchOpen(true)} aria-label="Search">
                    <Search size={18} />
                </button>

                {/* Language Picker */}
                <div className="action-item language-selector">
                    <Globe size={18} />
                    <span>EN</span>
                    <ChevronDown size={14} className="dropdown-arrow" />
                </div>

                {/* Notifications Bell */}
                <div className="action-item notification-bell">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </div>

                {/* Vertical Divider */}
                <div className="vertical-divider"></div>

                {/* Admin Profile with Interactive Dropdown */}
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
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                            }}
                        />
                        <div className="profile-details">
                            <span className="profile-name">{userName}</span>
                            <span className="profile-role">{userRole} • {warehouseName}</span>
                        </div>
                        <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? "arrow-rotate" : ""}`} />
                    </div>

                    {isDropdownOpen && (
                        <>
                            <div className="topbar-dropdown-overlay" onClick={() => setIsDropdownOpen(false)}></div>
                            <div className="topbar-profile-dropdown">
                                <div className="dropdown-user-header">
                                    <span className="user-name-title">{userName}</span>
                                    <span className="user-role-subtitle">{userRole} • {warehouseName}</span>
                                </div>
                                <div className="dropdown-divider"></div>
                                
                                {/* Mobile-only notifications section */}
                                <button className="dropdown-btn dropdown-notifications-item" onClick={() => { setIsDropdownOpen(false); alert("Opening Notifications Dashboard..."); }}>
                                    <Bell size={15} />
                                    <span>Notifications</span>
                                    <span className="dropdown-notification-badge">3 new</span>
                                </button>
                                
                                <button className="dropdown-btn" onClick={() => { setIsDropdownOpen(false); setIsSwitchModalOpen(true); }}>
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
                            placeholder="Search anything..." 
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