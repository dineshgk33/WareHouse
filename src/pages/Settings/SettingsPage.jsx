import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
    Trash2, 
    Upload, 
    MoreHorizontal, 
    Check, 
    Shield, 
    Lock, 
    Plus, 
    Download, 
    ExternalLink,
    RotateCcw
} from "lucide-react";
import avatarImg from "../../assets/dinesh.png";
import "./Settings.css";

function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryTab = searchParams.get("tab");
    
    // Determine initial tab from query parameters
    const initialTab = queryTab && ["general", "notifications", "billing", "security", "members", "roles"].includes(queryTab)
        ? queryTab
        : "general";

    const [activeTab, setActiveTab] = useState(initialTab);
    const [theme, setTheme] = useState("light");

    // Sync activeTab state when URL query parameters change
    useEffect(() => {
        if (queryTab && ["general", "notifications", "billing", "security", "members", "roles"].includes(queryTab)) {
            setActiveTab(queryTab);
        } else if (!queryTab) {
            setActiveTab("general");
        }
    }, [queryTab]);


    // Dynamic states for interactive controls
    const [name, setName] = useState("Dinesh G.K");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [email, setEmail] = useState("dinesh.gk@haatza.com");
    const [googleConnected, setGoogleConnected] = useState(true);
    const [activeIntegrationDropdownOpen, setActiveIntegrationDropdownOpen] = useState(false);
    
    // Notification toggles state
    const [notifs, setNotifs] = useState({
        orders: true,
        security: true,
        weekly: false,
        registrations: true,
        stock: true,
        refunds: false
    });

    const toggleNotif = (key) => {
        setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const tabs = [
        { id: "general", label: "General" },
        { id: "notifications", label: "Notifications" },
        { id: "billing", label: "Billing plans" },
        { id: "security", label: "Login & security" },
        { id: "members", label: "Members" },
        { id: "roles", label: "User roles" }
    ];

    // Render corresponding settings panel based on activeTab
    const renderActiveContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="tab-panel-content fade-in">
                        {/* 1. Profile Picture Row */}
                        <div className="settings-row profile-row">
                            <img 
                                src={`${avatarImg}?v=2`} 
                                alt="Dinesh G.K Profile Avatar" 
                                className="settings-profile-avatar"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                                }}
                            />
                            <div className="profile-actions">
                                <button className="btn-delete" aria-label="Delete avatar">
                                    <Trash2 size={16} />
                                </button>
                                <button className="btn-upload">
                                    <Upload size={14} />
                                    <span>Upload</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Name Section */}
                        <div className="settings-row item-row">
                            <div className="row-info">
                                <h3>Name</h3>
                                <p>{name}</p>
                            </div>
                            <button className="btn-row-edit">Edit</button>
                        </div>

                        {/* 3. Contacts Section */}
                        <div className="settings-row item-row">
                            <div className="row-info">
                                <h3>Contacts</h3>
                                <div className="contact-details">
                                    <p>Phone: {phone}</p>
                                    <p>Email: {email}</p>
                                </div>
                            </div>
                            <button className="btn-row-edit">Edit</button>
                        </div>

                        {/* 4. Social Media Section */}
                        <div className="settings-row item-row">
                            <div className="row-info">
                                <h3>Social media</h3>
                                <div className="contact-details">
                                    <p>linkedin.com/in/dineshgk</p>
                                    <p>dribbble.com/haatza</p>
                                </div>
                            </div>
                            <button className="btn-row-edit">Edit</button>
                        </div>

                        {/* 5. Language & Currency Section */}
                        <div className="settings-row item-row">
                            <div className="row-info">
                                <h3>Language & currency</h3>
                                <p>English, INR</p>
                            </div>
                            <button className="btn-row-edit">Edit</button>
                        </div>

                        {/* 6. Theme Section */}
                        <div className="settings-row item-row">
                            <div className="row-info">
                                <h3>Theme</h3>
                                <p>Appearance</p>
                            </div>
                            <div className="theme-select-container">
                                <select 
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="theme-select"
                                    aria-label="Select color theme"
                                >
                                    <option value="light">Light mode</option>
                                    <option value="dark">Dark mode</option>
                                </select>
                            </div>
                        </div>

                        {/* 7. Integration Section */}
                        <div className="settings-row item-row integration-row">
                            <div className="row-info">
                                <h3>Integration</h3>
                                <p>{googleConnected ? "Google • dinesh.gk@gmail.com" : "No active integration"}</p>
                            </div>
                            <div className="integration-actions" style={{ position: "relative" }}>
                                {googleConnected ? (
                                    <span className="integration-badge">
                                        <Check size={12} className="badge-check-icon" />
                                        <span>Connected</span>
                                    </span>
                                ) : (
                                    <span className="integration-badge status-disabled">
                                        <Lock size={12} className="badge-check-icon" />
                                        <span>Disconnected</span>
                                    </span>
                                )}
                                <button 
                                    className="btn-more" 
                                    aria-label="More actions"
                                    onClick={() => setActiveIntegrationDropdownOpen(prev => !prev)}
                                >
                                    <MoreHorizontal size={16} />
                                </button>

                                {activeIntegrationDropdownOpen && (
                                    <>
                                        <div className="global-dropdown-overlay" onClick={() => setActiveIntegrationDropdownOpen(false)} />
                                        <div className="global-action-dropdown" style={{ right: "0", top: "36px" }}>
                                            <button 
                                                className="global-dropdown-item"
                                                onClick={() => {
                                                    setGoogleConnected(prev => !prev);
                                                    setActiveIntegrationDropdownOpen(false);
                                                }}
                                            >
                                                {googleConnected ? <Lock size={13} /> : <Check size={13} />}
                                                <span>{googleConnected ? "Disconnect" : "Connect"}</span>
                                            </button>
                                            <button 
                                                className="global-dropdown-item"
                                                onClick={() => {
                                                    alert("Google Integration Synced Successfully!");
                                                    setActiveIntegrationDropdownOpen(false);
                                                }}
                                            >
                                                <RotateCcw size={13} />
                                                <span>Sync Account</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case "notifications":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block">
                            <h3>Notification Preferences</h3>
                            <p>Configure how you receive transaction updates and system alerts.</p>
                        </div>

                        {/* Email Notifications */}
                        <div className="settings-section-divider">Email Notifications</div>
                        
                        <div className="settings-row item-row toggle-row">
                            <div className="row-info">
                                <h3>Order Status Updates</h3>
                                <p>Receive emails when orders are processed, shipped, or completed.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.orders} onChange={() => toggleNotif("orders")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-row item-row toggle-row">
                            <div className="row-info">
                                <h3>Security Alerts</h3>
                                <p>Get notified about new logins, password changes, and account recovery updates.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.security} onChange={() => toggleNotif("security")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-row item-row toggle-row">
                            <div className="row-info">
                                <h3>Weekly Performance Report</h3>
                                <p>Receive weekly summary digests of sales curves and inventory health logs.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.weekly} onChange={() => toggleNotif("weekly")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {/* Push Notifications */}
                        <div className="settings-section-divider">Real-Time Alerts</div>

                        <div className="settings-row item-row toggle-row">
                            <div className="row-info">
                                <h3>New Registrations</h3>
                                <p>Get push notifications when new customers create an account.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.registrations} onChange={() => toggleNotif("registrations")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-row item-row toggle-row">
                            <div className="row-info">
                                <h3>Low Stock Alerts</h3>
                                <p>Immediate browser warning banner when item stock falls below critical thresholds.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.stock} onChange={() => toggleNotif("stock")} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                );
            case "billing":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block">
                            <h3>Billing Plans & Invoices</h3>
                            <p>Manage subscription scales, linked credit cards, and invoice history files.</p>
                        </div>

                        {/* Plan Card */}
                        <div className="billing-active-plan-card">
                            <div className="plan-details">
                                <span className="plan-tag">Active Plan</span>
                                <h4>Haatza Premium Pro</h4>
                                <p>Unlimited catalog items, real-time Recharts analytics, custom domains.</p>
                            </div>
                            <div className="plan-price-block">
                                <span className="price-val">₹49</span>
                                <span className="price-period">/ month</span>
                            </div>
                        </div>

                        {/* Card details */}
                        <div className="settings-row item-row align-center-row">
                            <div className="row-info">
                                <h3>Payment Method</h3>
                                <p>Visa ending in 4242 • Expiry 12/28</p>
                            </div>
                            <button className="btn-row-edit">Update Card</button>
                        </div>

                        {/* Invoices table */}
                        <div className="settings-section-divider">Billing History</div>
                        <div className="billing-invoices-container">
                            <table className="settings-invoice-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>01/05/2026</td>
                                        <td>Haatza Premium Pro - May 2026</td>
                                        <td>₹49.00</td>
                                        <td><button className="btn-icon-action" aria-label="Download PDF"><Download size={14} /></button></td>
                                    </tr>
                                    <tr>
                                        <td>01/04/2026</td>
                                        <td>Haatza Premium Pro - April 2026</td>
                                        <td>₹49.00</td>
                                        <td><button className="btn-icon-action" aria-label="Download PDF"><Download size={14} /></button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block">
                            <h3>Login & Account Security</h3>
                            <p>Maintain session safety logs, update credentials, and enable strict protection shields.</p>
                        </div>

                        {/* Change Password form */}
                        <div className="settings-section-divider">Change Password</div>
                        
                        <div className="settings-row item-row">
                            <div className="row-info password-inputs-group">
                                <h3>Password Credentials</h3>
                                <input type="password" placeholder="Current Password" className="settings-input settings-password-field" />
                                <input type="password" placeholder="New Password" className="settings-input settings-password-field" />
                            </div>
                            <button className="btn-row-edit self-end-btn">Update Password</button>
                        </div>

                        {/* 2FA */}
                        <div className="settings-row item-row align-center-row">
                            <div className="row-info">
                                <h3>Two-Factor Authentication (2FA)</h3>
                                <p>Add an extra layer of system security using authenticator apps.</p>
                            </div>
                            <span className="integration-badge status-disabled">
                                <Lock size={12} className="badge-check-icon" />
                                <span>Disabled</span>
                            </span>
                        </div>

                        {/* Sessions logs */}
                        <div className="settings-section-divider">Logged-In Sessions</div>
                        <div className="session-item-row">
                            <div className="session-dot active-dot"></div>
                            <div className="session-details">
                                <span className="session-device">Chrome on Windows (Current Session)</span>
                                <span className="session-ip">IP: 192.168.1.104 • Mumbai, India</span>
                            </div>
                        </div>
                    </div>
                );
            case "members":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block flex-between-header">
                            <div>
                                <h3>Team Members</h3>
                                <p>Invite teammates and organize catalog editing permissions.</p>
                            </div>
                            <button className="btn-add-member">
                                <Plus size={14} />
                                <span>Add Member</span>
                            </button>
                        </div>

                        {/* Members list */}
                        <div className="members-listing-block">
                            <div className="member-row-item">
                                <img src={`${avatarImg}?v=2`} alt="Dinesh G.K avatar" className="member-thumb-img" />
                                <div className="member-info">
                                    <span className="member-name">Dinesh G.K</span>
                                    <span className="member-email">dinesh.gk@haatza.com</span>
                                </div>
                                <span className="role-tag-badge owner-role">Owner</span>
                            </div>

                            <div className="member-row-item">
                                <div className="member-thumb-placeholder text-bg-pink">SC</div>
                                <div className="member-info">
                                    <span className="member-name">Sarah Connor</span>
                                    <span className="member-email">s.connor@haatza.com</span>
                                </div>
                                <span className="role-tag-badge admin-role">Administrator</span>
                            </div>

                            <div className="member-row-item">
                                <div className="member-thumb-placeholder text-bg-blue">AJ</div>
                                <div className="member-info">
                                    <span className="member-name">Alex Jackson</span>
                                    <span className="member-email">alex.j@haatza.com</span>
                                </div>
                                <span className="role-tag-badge rep-role">Developer</span>
                            </div>
                        </div>
                    </div>
                );
            case "roles":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block">
                            <h3>System Roles & Permissions</h3>
                            <p>Breakdown of permission structures defined for Haatza store representative ranks.</p>
                        </div>

                        {/* Roles structure breakdown */}
                        <div className="roles-breakdown-list">
                            <div className="role-card-item">
                                <div className="role-card-header">
                                    <h4>Super Admin</h4>
                                    <span className="permissions-count">All Privileges</span>
                                </div>
                                <p>Full root ownership access. Can change payment pathways, delete logs, edit catalogs, invite members, and adjust billing tiers.</p>
                            </div>

                            <div className="role-card-item">
                                <div className="role-card-header">
                                    <h4>Administrator</h4>
                                    <span className="permissions-count">24 permissions active</span>
                                </div>
                                <p>Day-to-day administrative privileges. Can manage low-stock indices, process orders, edit product details, and generate charts.</p>
                            </div>

                            <div className="role-card-item">
                                <div className="role-card-header">
                                    <h4>Support Representative</h4>
                                    <span className="permissions-count">8 permissions active</span>
                                </div>
                                <p>Read-only access to analytics logs. Can check tracking IDs, view invoices, verify customers, and issue refunds.</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-page-wrapper">
            {/* Top Title Block */}
            <div className="settings-page-header">
                <h1>Settings</h1>
            </div>

            {/* Split Grid Container Box */}
            <div className="settings-container">
                {/* Left Sidebar */}
                <aside className="settings-sidebar">
                    <ul className="settings-tab-list">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setSearchParams({ tab: tab.id })}
                                >
                                    {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Right Content Pane */}
                <section className="settings-content">
                    {renderActiveContent()}
                </section>
            </div>
        </div>
    );
}

export default SettingsPage;