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
    RotateCcw,
    User,
    Bell,
    CreditCard,
    Briefcase,
    Users,
    Palette,
    Phone,
    Mail,
    Globe,
    Languages,
    Zap,
    LogOut,
    Monitor,
    Moon,
    Sun,
    CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import avatarImg from "../../assets/dinesh.png";
import { useToast } from "../../hooks/useToast";
import UserRolesSection from "../../components/Roles/UserRolesSection";
import "./Settings.css";

function SettingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryTab = searchParams.get("tab");
    const { user, selectedRole, selectedRoleName } = useAuth();
    
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
    const [name, setName] = useState(() => user ? `${user.firstName} ${user.lastName}` : "");
    const [phone, setPhone] = useState(() => user?.phone || "");
    const [email, setEmail] = useState(() => user?.email || "");
    const [googleConnected, setGoogleConnected] = useState(true);
    const [activeIntegrationDropdownOpen, setActiveIntegrationDropdownOpen] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const { toast, showToast } = useToast(3000);

    // Inline editing state for name and phone
    const [editingName, setEditingName] = useState(false);
    const [editingPhone, setEditingPhone] = useState(false);
    const [pendingName, setPendingName] = useState("");
    const [pendingPhone, setPendingPhone] = useState("");
    
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
        setHasChanges(true);
    };

    const handleResetChanges = () => {
        setActiveTab("general");
        setHasChanges(false);
        showToast("Changes reset to default!");
    };

    const handleSaveChanges = () => {
        setHasChanges(false);
        showToast("Settings saved successfully!");
    };

    const tabs = [
        { id: "general", label: "General", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing plans", icon: CreditCard },
        { id: "security", label: "Login & security", icon: Shield },
        { id: "members", label: "Members", icon: Users },
        { id: "roles", label: "User roles", icon: Briefcase }
    ];

    // Render corresponding settings panel based on activeTab
    const renderActiveContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="tab-panel-content fade-in">
                        {/* 1. Profile Picture Row */}
                        <div className="settings-row profile-row">
                            <div className="profile-section-wrapper">
                                <div className="profile-pic-container">
                                    <img 
                                        src={user?.ProfileImage || avatarImg} 
                                        alt={`${name} Profile Avatar`} 
                                        className="settings-profile-avatar"
                                        onError={(e) => {
                                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                                        }}
                                    />
                                    <label className="camera-overlay-btn" title="Change photo">
                                        <Upload size={16} />
                                        <input type="file" accept="image/*" hidden />
                                    </label>
                                </div>
                                <div className="profile-meta">
                                    <h4 className="profile-name">{name}</h4>
                                    <p className="profile-status">
                                        <span className="status-badge online">●</span> {selectedRoleName || ""} • {selectedRole ? selectedRole.status : "Active"}
                                    </p>
                                    <p className="profile-login">
                                        Organization: <strong>{user?.Organization || ""}</strong>
                                    </p>
                                    <p className="profile-login">
                                        Employee ID: <strong>{user?.employeeId || ""}</strong> | Type: <strong>{user?.employmentType || ""}</strong>
                                    </p>
                                </div>
                            </div>
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
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <User size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Name</h3>
                                    {editingName ? (
                                        <div className="inline-edit-group">
                                            <input
                                                className="settings-inline-input"
                                                value={pendingName}
                                                onChange={e => setPendingName(e.target.value)}
                                                autoFocus
                                                aria-label="Edit your name"
                                            />
                                            <button className="btn-edit-pill" onClick={() => {
                                                if (pendingName.trim()) { setName(pendingName.trim()); setHasChanges(true); showToast("Name updated!"); }
                                                setEditingName(false);
                                            }}>Save</button>
                                            <button className="btn-edit-pill btn-cancel-edit" onClick={() => setEditingName(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <p>{name}</p>
                                    )}
                                </div>
                                {!editingName && (
                                    <button
                                        className="btn-edit-pill"
                                        onClick={() => { setPendingName(name); setEditingName(true); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 3. Contacts Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Phone size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Contact Information</h3>
                                    {editingPhone ? (
                                        <div className="inline-edit-group">
                                            <input
                                                className="settings-inline-input"
                                                value={pendingPhone}
                                                onChange={e => setPendingPhone(e.target.value)}
                                                autoFocus
                                                aria-label="Edit your phone number"
                                            />
                                            <button className="btn-edit-pill" onClick={() => {
                                                if (pendingPhone.trim()) { setPhone(pendingPhone.trim()); setHasChanges(true); showToast("Phone updated!"); }
                                                setEditingPhone(false);
                                            }}>Save</button>
                                            <button className="btn-edit-pill btn-cancel-edit" onClick={() => setEditingPhone(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="contact-details">
                                            <p><span className="detail-label">Phone:</span> {phone}</p>
                                            <p><span className="detail-label">Email:</span> {email}</p>
                                        </div>
                                    )}
                                </div>
                                {!editingPhone && (
                                    <button
                                        className="btn-edit-pill"
                                        onClick={() => { setPendingPhone(phone); setEditingPhone(true); }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 4. Social Media Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Globe size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Social Media</h3>
                                    <div className="contact-details">
                                        <p>linkedin.com/in/dineshgk</p>
                                        <p>dribbble.com/haatza</p>
                                    </div>
                                </div>
                                <button 
                                    className="btn-edit-pill"
                                    onClick={() => showToast("Social Media editing coming soon")}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* 5. Language & Currency Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Languages size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Language & Currency</h3>
                                    <p>English (US), INR ₹</p>
                                </div>
                                <button 
                                    className="btn-edit-pill"
                                    onClick={() => showToast("Language & Currency editing coming soon")}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>



                        {/* 7. Integration Section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Zap size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Connected Services</h3>
                                    <p>{googleConnected ? "Google • dinesh.gk@gmail.com" : "No active integrations"}</p>
                                </div>
                                <div className="integration-actions" style={{ position: "relative", display: "flex", gap: "8px", alignItems: "center" }}>
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
                                                        showToast("Google Integration Synced Successfully!");
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
                        
                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>Order Status Updates</h4>
                                <p>Receive emails when orders are processed, shipped, or delivered.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.orders} onChange={() => toggleNotif("orders")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>Security Alerts</h4>
                                <p>Get notified about new logins, password changes, and account recovery.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.security} onChange={() => toggleNotif("security")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>Weekly Performance Report</h4>
                                <p>Receive weekly summary digests of sales and inventory metrics.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.weekly} onChange={() => toggleNotif("weekly")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {/* Push Notifications */}
                        <div className="settings-section-divider">Real-Time Alerts</div>

                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>New Registrations</h4>
                                <p>Get push notifications when new customers create accounts.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.registrations} onChange={() => toggleNotif("registrations")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>Low Stock Alerts</h4>
                                <p>Immediate notification when item stock falls below critical levels.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.stock} onChange={() => toggleNotif("stock")} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-card">
                            <div className="notif-content">
                                <h4>Refund Processing</h4>
                                <p>Get notified when customer refund requests are processed.</p>
                            </div>
                            <label className="switch-toggle">
                                <input type="checkbox" checked={notifs.refunds} onChange={() => toggleNotif("refunds")} />
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
                            <p>Manage your subscription, payment methods, and download invoices.</p>
                        </div>

                        {/* Plan Card */}
                        <div className="plan-card-premium">
                            <div className="plan-badge">Active Plan</div>
                            <div className="plan-header-section">
                                <div>
                                    <h4 className="plan-name">Haatza Premium Pro</h4>
                                    <p className="plan-desc">Unlimited catalog, real-time analytics, custom domains.</p>
                                </div>
                                <div className="plan-pricing">
                                    <span className="price-amount">₹49</span>
                                    <span className="price-period">/month</span>
                                </div>
                            </div>
                            <div className="plan-details-row">
                                <span className="plan-detail"><strong>Users:</strong> 10</span>
                                <span className="plan-detail"><strong>Renewal:</strong> 1 July 2026</span>
                            </div>
                            <div className="plan-actions-row">
                                <button className="btn-secondary">Upgrade Plan</button>
                                <button className="btn-outline">Manage Billing</button>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <CreditCard size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Payment Method</h3>
                                    <p>Visa Card ending in 4242 • Expires 12/28</p>
                                </div>
                                <button className="btn-edit-pill">Update Card</button>
                            </div>
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
                                    <tr>
                                        <td>01/03/2026</td>
                                        <td>Haatza Premium Pro - March 2026</td>
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
                            <p>Protect your account with strong passwords and two-factor authentication.</p>
                        </div>

                        {/* Change Password section */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Lock size={18} className="card-icon" />
                            </div>
                            <div className="card-content-column">
                                <div className="row-info mb-16">
                                    <h3>Change Password</h3>
                                    <p>Update your password regularly for better security</p>
                                </div>
                                <div className="password-inputs-group">
                                    <input type="password" placeholder="Current Password" className="settings-input settings-password-field" />
                                    <input type="password" placeholder="New Password" className="settings-input settings-password-field" />
                                    <input type="password" placeholder="Confirm Password" className="settings-input settings-password-field" />
                                </div>
                                <button className="btn-secondary">Update Password</button>
                            </div>
                        </div>

                        {/* 2FA */}
                        <div className="settings-card-item">
                            <div className="card-icon-wrapper">
                                <Shield size={18} className="card-icon" />
                            </div>
                            <div className="card-content">
                                <div className="row-info">
                                    <h3>Two-Factor Authentication (2FA)</h3>
                                    <p>Add extra security with authenticator apps or SMS</p>
                                </div>
                                <div className="security-controls">
                                    <div className="status-badge-wrapper">
                                        {twoFAEnabled ? (
                                            <span className="integration-badge">
                                                <Check size={12} className="badge-check-icon" />
                                                <span>Enabled</span>
                                            </span>
                                        ) : (
                                            <span className="integration-badge status-disabled">
                                                <Lock size={12} className="badge-check-icon" />
                                                <span>Disabled</span>
                                            </span>
                                        )}
                                    </div>
                                    <button 
                                        className={`btn-secondary ${twoFAEnabled ? 'btn-danger' : ''}`}
                                        onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                                    >
                                        {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sessions logs */}
                        <div className="settings-section-divider">Active Sessions</div>
                        <div className="sessions-list">
                            <div className="session-item-row">
                                <div className="session-info">
                                    <div className="session-dot active-dot"></div>
                                    <div className="session-details">
                                        <span className="session-device">Chrome on Windows</span>
                                        <span className="session-ip">IP: 192.168.1.104 • Mumbai, India • Current</span>
                                    </div>
                                </div>
                                <span className="session-badge">Active</span>
                            </div>
                            <div className="session-item-row">
                                <div className="session-info">
                                    <div className="session-dot"></div>
                                    <div className="session-details">
                                        <span className="session-device">Safari on iPhone</span>
                                        <span className="session-ip">IP: 122.161.23.45 • Delhi, India • Last active 2 hours ago</span>
                                    </div>
                                </div>
                                <button className="btn-icon-logout" title="Logout from this device">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Dangerous Zone */}
                        <div className="danger-zone-section">
                            <div className="danger-zone-header">
                                <h4>Danger Zone</h4>
                                <p>Irreversible actions that require confirmation</p>
                            </div>
                            <button className="btn-danger-outline">Delete Account</button>
                        </div>
                    </div>
                );
            case "members":
                return (
                    <div className="tab-panel-content fade-in">
                        <div className="panel-title-block flex-between-header">
                            <div>
                                <h3>Team Members</h3>
                                <p>Invite teammates and manage their permissions and roles.</p>
                            </div>
                            <button className="btn-add-member">
                                <Plus size={14} />
                                <span>Add Member</span>
                            </button>
                        </div>

                        {/* Members list */}
                        <div className="members-listing-block">
                            <div className="member-card-item">
                                <img src={user?.ProfileImage || avatarImg} alt={`${name} avatar`} className="member-thumb-img" />
                                <div className="member-info">
                                    <span className="member-name">{name}</span>
                                    <span className="member-email">{email}</span>
                                    <div className="member-meta">
                                        <span className="member-join">Joined 3 months ago</span>
                                    </div>
                                </div>
                                <span className="role-tag-badge owner-role">{selectedRole ? selectedRole.roleName : "Owner"}</span>
                                <div className="member-actions">
                                    <button className="btn-icon-action" title="Edit">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="member-card-item">
                                <div className="member-thumb-placeholder text-bg-pink">SC</div>
                                <div className="member-info">
                                    <span className="member-name">Sarah Connor</span>
                                    <span className="member-email">s.connor@haatza.com</span>
                                    <div className="member-meta">
                                        <span className="member-join">Joined 2 months ago</span>
                                    </div>
                                </div>
                                <span className="role-tag-badge admin-role">Administrator</span>
                                <div className="member-actions">
                                    <button className="btn-icon-action" title="Edit">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="member-card-item">
                                <div className="member-thumb-placeholder text-bg-blue">AJ</div>
                                <div className="member-info">
                                    <span className="member-name">Alex Jackson</span>
                                    <span className="member-email">alex.j@haatza.com</span>
                                    <div className="member-meta">
                                        <span className="member-join">Joined 1 month ago</span>
                                    </div>
                                </div>
                                <span className="role-tag-badge rep-role">Developer</span>
                                <div className="member-actions">
                                    <button className="btn-icon-action" title="Edit">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "roles":
                return <UserRolesSection showToast={showToast} />;
            default:
                return null;
        }
    };

    return (
        <div className="settings-page-wrapper">
            {/* Accessible Toast Notification */}
            {toast && (
                <div
                    className="orders-toast slide-in-top"
                    role="alert"
                    aria-live="polite"
                    style={{ position: "fixed", top: 20, right: 24, zIndex: 2000 }}
                >
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Top Title Block with Action Buttons */}
            <div className="settings-page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>Settings</h1>
                        <p className="header-subtitle">Manage account preferences, security, billing and workspace settings.</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-reset" onClick={handleResetChanges}>Reset</button>
                        <button className="btn-save" onClick={handleSaveChanges}>Save Changes</button>
                    </div>
                </div>
            </div>

            {/* Split Grid Container Box */}
            <div className="settings-container">
                {/* Left Sidebar with Icons */}
                <aside className="settings-sidebar">
                    <ul className="settings-tab-list">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <li key={tab.id}>
                                    <button
                                        className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setSearchParams({ tab: tab.id })}
                                        title={tab.label}
                                    >
                                        <Icon size={18} className="tab-icon" />
                                        <span className="tab-label">{tab.label}</span>
                                    </button>
                                </li>
                            );
                        })}
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