import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
    Warehouse,
    BookOpen,
    ChevronRight,
    FileText,
    Activity,
    Shield
} from "lucide-react";
import logoImg from "../../assets/logo.jpeg";
import avatarImg from "../../assets/dinesh.png";
import FlyoutMenu from "./FlyoutMenu";
import InventoryFlyout from "./InventoryFlyout";
import OrdersFlyout from "./OrdersFlyout";
import DarkhouseFlyout from "./DarkhouseFlyout";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

// ─── Complete Master Sidebar Menu Configuration ───────────────────────────────────────────────
const ALL_SIDEBAR_MENU = [
    {
        id: "dashboard",
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        id: "catalog",
        label: "Catalog",
        icon: BookOpen,
        submenu: [
            { label: "Products", path: "/catalog/products" },
            { label: "Categories", path: "/catalog/categories" },
            { label: "Brands", path: "/catalog/brands" },
            { label: "Attributes", path: "/catalog/attributes" },
            { label: "Variants", path: "/catalog/variants" },
            { label: "Pricing", path: "/catalog/pricing" },
            { label: "Product Mapping", path: "/catalog/mapping" },
            { label: "Bulk Upload", path: "/catalog/bulk-upload" },
            { label: "Media Library", path: "/catalog/media" },
            { label: "Product Audit", path: "/catalog/audit" }
        ]
    },
    {
        id: "inventory",
        label: "Inventory",
        icon: Database,
        submenu: [
            { label: "Warehouse Inventory", path: "/inventory" },
            { label: "Darkhouse Inventory", path: "/inventory?tab=darkhouse" },
            { label: "Stock Transfers", path: "/inventory?tab=transfers" }
        ]
    },
    {
        id: "orders",
        label: "Orders",
        icon: ShoppingBag,
        submenu: [
            { label: "All Orders", path: "/orders" },
            { label: "Pending Orders", path: "/orders/pending" },
            { label: "Picking", path: "/orders?tab=picking" },
            { label: "Packing", path: "/orders?tab=packing" },
            { label: "Delivery Tracking", path: "/orders?tab=tracking" }
        ]
    },
    {
        id: "darkhouses",
        label: "Darkhouses",
        icon: Warehouse,
        submenu: [
            { label: "Darkhouse List", path: "/darkhouses" },
            { label: "Managers", path: "/darkhouses?tab=managers" },
            { label: "Assign Products", path: "/darkhouses?tab=assign" }
        ]
    },
    {
        id: "customers",
        label: "Customers",
        path: "/customers",
        icon: UserCircle,
    },
    {
        id: "billing",
        label: "Billing",
        path: "/billing",
        icon: CreditCard,
    },
    {
        id: "analytics",
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
    },
    {
        id: "admin",
        label: "Admin",
        icon: Shield,
        submenu: [
            { label: "Members", path: "/admin/members" },
            { label: "User Roles", path: "/admin/roles" }
        ]
    },
    {
        id: "reports",
        label: "Reports",
        path: "/reports",
        icon: FileText,
    },
    {
        id: "operations",
        label: "Operations",
        path: "/operations",
        icon: Activity,
    }
];

const ALL_BOTTOM_MENU = [
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        submenu: [
            { label: "General", path: "/settings" },
            { label: "Notifications", path: "/settings?tab=notifications" },
            { label: "Billing Plans", path: "/settings?tab=billing" },
            { label: "Login & Security", path: "/settings?tab=security" }
        ]
    },
    {
        id: "support",
        label: "Help & Support",
        path: "/support",
        icon: HelpCircle,
    }
];

function Sidebar({ isCollapsed, toggleSidebar, mobileOpen, setMobileOpen }) {
    const location = useLocation();
    const { user, selectedRoleName, canView } = useAuth();
    
    // Hover & Flyout states
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [flyoutPosition, setFlyoutPosition] = useState(null);
    const leaveTimeoutRef = useRef(null);

    // Dynamic configuration based on active role
    const userName = user ? `${user.firstName} ${user.lastName}` : "";
    const userRole = selectedRoleName || "";
    const profileImage = user?.ProfileImage || avatarImg;

    // Filter main menu and bottom menu items
    const getFilteredMenus = () => {
        const filteredMain = ALL_SIDEBAR_MENU.filter(item => {
            return canView(item.id.toUpperCase());
        });
        
        const allowedBottomIds = ["support"];
        if (canView("SETTINGS")) {
            allowedBottomIds.push("settings");
        }
        
        const filteredBottom = ALL_BOTTOM_MENU.filter(item => allowedBottomIds.includes(item.id));

        return { main: filteredMain, bottom: filteredBottom };
    };

    const { main: activeSidebarMenu, bottom: activeBottomMenu } = getFilteredMenus();

    // Helper to check active highlighting on parents
    const isParentActive = (item) => {
        if (item.path) {
            return location.pathname === item.path;
        }
        if (item.submenu) {
            const currentPath = location.pathname + location.search;
            return item.submenu.some(sub => {
                if (sub.path.includes("?")) {
                    return currentPath === sub.path;
                }
                return location.pathname === sub.path;
            });
        }
        return false;
    };

    // Clean up timeouts
    useEffect(() => {
        return () => {
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    // ─── Interaction Handlers ──────────────────────────────────────────────────
    const handleParentMouseEnter = (item, e) => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }

        if (item.submenu) {
            setHoveredMenu(item);
            
            // Detect if item is at the bottom (e.g. settings) to align from the bottom upward
            const isBottomItem = activeBottomMenu.some(b => b.id === item.id);
            if (isBottomItem && e.currentTarget.offsetParent) {
                const sidebarHeight = e.currentTarget.offsetParent.offsetHeight;
                const bottomOffset = sidebarHeight - e.currentTarget.offsetTop - e.currentTarget.offsetHeight;
                setFlyoutPosition({ bottom: bottomOffset, isBottom: true });
            } else {
                setFlyoutPosition({ top: e.currentTarget.offsetTop, isBottom: false });
            }
        } else {
            setHoveredMenu(null);
        }
    };

    const handleParentMouseLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
        }, 180);
    };

    const handleFlyoutMouseEnter = () => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }
    };

    const handleFlyoutMouseLeave = () => {
        setHoveredMenu(null);
    };

    const handleSubmenuItemClick = () => {
        setHoveredMenu(null);
        if (setMobileOpen) {
            setMobileOpen(false);
        }
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isActive = isParentActive(item);

        const content = (
            <>
                <Icon size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {!isCollapsed && item.submenu && (
                    <ChevronRight size={14} className="submenu-indicator-arrow" />
                )}
            </>
        );

        return (
            <li 
                key={item.id}
                className="sidebar-item-container"
                onMouseEnter={(e) => handleParentMouseEnter(item, e)}
                onMouseLeave={handleParentMouseLeave}
            >
                {item.path ? (
                    <Link
                        to={item.path}
                        className={`nav-link ${isActive ? "active" : ""}`}
                        onClick={handleSubmenuItemClick}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {content}
                    </Link>
                ) : (
                    <div
                        className={`nav-link clickable-parent ${isActive ? "active" : ""}`}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {content}
                    </div>
                )}
            </li>
        );
    };

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {isCollapsed && (
                <button 
                    className="sidebar-expand-floating-btn" 
                    onClick={toggleSidebar} 
                    aria-label="Expand Sidebar"
                    title="Expand Sidebar"
                >
                    <ChevronRight size={14} />
                </button>
            )}

            {/* Logo/Brand Header with Integrated Toggle */}
            <div className={`sidebar-brand-container ${isCollapsed ? "collapsed-brand" : ""}`}>
                {isCollapsed ? (
                    <div className="collapsed-logo-only-container" onClick={toggleSidebar}>
                        <img src={logoImg} className="brand-logo-img collapsed-logo-img" alt="HAATZA Logo" />
                    </div>
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

            {/* User Profile Card - Mobile Drawer / Desktop Sidebar */}
            <div className="sidebar-profile-card">
                <img 
                    src={profileImage} 
                    alt={`${userName} Profile`} 
                    className="sidebar-profile-avatar"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                    }}
                />
                <div className="sidebar-profile-info">
                    <span className="sidebar-profile-name">{userName}</span>
                    <span className="sidebar-profile-role">{userRole}</span>
                </div>
            </div>

            {/* Navigation links */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {activeSidebarMenu.map(renderMenuItem)}
                </ul>
            </nav>

            {/* Bottom menu links */}
            <div className="sidebar-footer">
                <ul className="nav-list">
                    {activeBottomMenu.map(renderMenuItem)}
                </ul>
            </div>

            {/* Wix Studio-Style Floating Submenu flyout */}
            {hoveredMenu && hoveredMenu.id === "inventory" ? (
                <InventoryFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : hoveredMenu && hoveredMenu.id === "orders" ? (
                <OrdersFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : hoveredMenu && hoveredMenu.id === "darkhouses" ? (
                <DarkhouseFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : hoveredMenu && (
                <FlyoutMenu 
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            )}
        </aside>
    );
}

export default Sidebar;