import React from "react";
import { Search, Globe, Bell, ChevronDown } from "lucide-react";
import avatarImg from "../../assets/dinesh.png";
import "./Topbar.css";

function Topbar() {
    return (
        <header className="topbar">
            {/* Offscreen dummy inputs to satisfy Chrome's password manager and prevent it from binding to the search input */}
            <div style={{ position: "absolute", top: "-1000px", left: "-1000px", width: "1px", height: "1px", overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
                <input type="text" name="chrome-username-dummy" autoComplete="username" tabIndex={-1} />
                <input type="password" name="chrome-password-dummy" autoComplete="current-password" tabIndex={-1} />
            </div>

            {/* Welcome banner text */}
            <div className="topbar-welcome">
                <h1>Welcome, Dinesh G.K</h1>
                <p>Here's how your shop performed recently.</p>
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

                {/* Admin Profile */}
                <div className="profile-container">
                    <img 
                        src={`${avatarImg}?v=2`} 
                        alt="Dinesh G.K Profile Avatar" 
                        className="profile-avatar"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                        }}
                    />
                    <div className="profile-details">
                        <span className="profile-name">Dinesh G.K</span>
                        <span className="profile-role">Super Admin</span>
                    </div>
                    <ChevronDown size={14} className="dropdown-arrow" />
                </div>
            </div>
        </header>
    );
}

export default Topbar;