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
    Shield,
    Users
} from "lucide-react";
import logoImg from "../../assets/logo.jpeg";
import avatarImg from "../../assets/dinesh.png";
import FlyoutMenu from "./FlyoutMenu";
import InventoryFlyout from "./InventoryFlyout";
import OrdersFlyout from "./OrdersFlyout";
import DarkhouseFlyout from "./DarkhouseFlyout";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

// ─── Dynamic Routing & Menu Configuration Helper Mapping Functions ──────────────────────────────
const getRouteForPage = (pageId, pageName) => {
    const id = pageId.toUpperCase();
    switch (id) {
        case "DASHBOARD":
            return "/";
        case "ORDERS":
            if (pageName === "Pending Orders") return "/orders/pending";
            if (pageName === "Picking") return "/orders?tab=picking";
            if (pageName === "Packing") return "/orders?tab=packing";
            if (pageName === "Delivery Tracking") return "/orders?tab=tracking";
            if (pageName === "Label History") return "/orders?tab=label-history";
            return "/orders";
        case "WAREHOUSE_INVENTORY":
            return "/inventory";
        case "DARKHOUSE_INVENTORY":
            return "/inventory?tab=darkhouse";
        case "STOCK_TRANSFERS":
            return "/inventory?tab=transfers";
        case "EMPLOYEES":
            return "/employees";
        case "REPORTS":
            return "/reports";
        case "ANALYTICS":
            return "/analytics";
        case "CUSTOMERS":
            return "/customers";
        case "BILLING":
            return "/billing";
        case "SETTINGS":
            if (pageName === "General") return "/settings";
            if (pageName === "Notifications") return "/settings?tab=notifications";
            if (pageName === "Billing Plans") return "/settings?tab=billing";
            if (pageName === "Login & Security") return "/settings?tab=security";
            return "/settings";
        case "SUPPORT":
            return "/support";
        case "CATALOG":
            if (pageName === "Products") return "/catalog/products";
            if (pageName === "Categories") return "/catalog/categories";
            if (pageName === "Brands") return "/catalog/brands";
            if (pageName === "Attributes") return "/catalog/attributes";
            if (pageName === "Variants") return "/catalog/variants";
            if (pageName === "Pricing") return "/catalog/pricing";
            if (pageName === "Product Mapping") return "/catalog/mapping";
            if (pageName === "Bulk Upload") return "/catalog/bulk-upload";
            if (pageName === "Media Library") return "/catalog/media";
            if (pageName === "Product Audit") return "/catalog/audit";
            return "/catalog/products";
        case "OPERATIONS":
            return "/operations";
        case "ADMIN":
            if (pageName === "Members") return "/admin/members";
            if (pageName === "User Roles") return "/admin/roles";
            return "/admin";
        case "DARKHOUSES":
            if (pageName === "Darkhouse List") return "/darkhouses";
            if (pageName === "Managers") return "/darkhouses?tab=managers";
            if (pageName === "Assign Products") return "/darkhouses?tab=assign";
            return "/darkhouses";
        default:
            return `/${id.toLowerCase().replace(/_/g, "-")}`;
    }
};

const getIconForModule = (moduleName) => {
    const iconMap = {
        "Dashboard": LayoutDashboard,
        "Orders": ShoppingBag,
        "Inventory": Database,
        "Catalog": BookOpen,
        "Darkhouses": Warehouse,
        "Customers": UserCircle,
        "Employees": Users,
        "Billing": CreditCard,
        "Analytics": BarChart3,
        "Admin": Shield,
        "Reports": FileText,
        "Operations": Activity,
        "Settings": Settings,
        "Support": HelpCircle
    };
    return iconMap[moduleName] || Package;
};

function Sidebar({ isCollapsed, toggleSidebar, mobileOpen, setMobileOpen }) {
    const location = useLocation();
    const { user, selectedRoleName, canView, accessiblePages } = useAuth();
    
    // Hover & Flyout states
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [flyoutPosition, setFlyoutPosition] = useState(null);
    const leaveTimeoutRef = useRef(null);

    // Responsive states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Dynamic configuration based on active role
    const userName = user ? `${user.firstName} ${user.lastName}` : "";
    const userRole = selectedRoleName || "";
    const profileImage = user?.ProfileImage || avatarImg;

    // Dynamically construct menus from accessiblePages
    const buildDynamicMenu = (pages) => {
        if (!pages || !Array.isArray(pages)) return { main: [], bottom: [] };

        const allowedPages = pages.filter(p => p.canView);

        const groups = {};
        allowedPages.forEach(page => {
            const mod = page.moduleName || "General";
            if (!groups[mod]) {
                groups[mod] = [];
            }
            groups[mod].push(page);
        });

        const MODULE_ORDER = [
            "Dashboard",
            "Catalog",
            "Inventory",
            "Orders",
            "Darkhouses",
            "Customers",
            "Employees",
            "Billing",
            "Analytics",
            "Admin",
            "Reports",
            "Operations",
            "Settings",
            "Support"
        ];

        const BOTTOM_MODULES = ["Settings", "Support"];

        const sidebarItems = [];
        const bottomItems = [];

        Object.keys(groups).forEach(moduleName => {
            const modulePages = groups[moduleName];
            const id = moduleName.toLowerCase().replace(/\s+/g, "-");

            const item = {
                id,
                label: moduleName,
                icon: getIconForModule(moduleName),
            };

            if (modulePages.length === 1) {
                const singlePage = modulePages[0];
                item.path = getRouteForPage(singlePage.pageId, singlePage.pageName);
            } else {
                item.submenu = modulePages.map(page => ({
                    label: page.pageName,
                    path: getRouteForPage(page.pageId, page.pageName)
                }));
            }

            if (BOTTOM_MODULES.includes(moduleName)) {
                bottomItems.push(item);
            } else {
                sidebarItems.push(item);
            }
        });

        const sortFn = (a, b) => {
            const indexA = MODULE_ORDER.indexOf(a.label);
            const indexB = MODULE_ORDER.indexOf(b.label);
            const rankA = indexA === -1 ? 999 : indexA;
            const rankB = indexB === -1 ? 999 : indexB;
            return rankA - rankB;
        };

        sidebarItems.sort(sortFn);
        bottomItems.sort(sortFn);

        return { main: sidebarItems, bottom: bottomItems };
    };

    const { main: activeSidebarMenu, bottom: activeBottomMenu } = buildDynamicMenu(accessiblePages || []);

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

    const handleParentClick = (item, e) => {
        if (isMobile && item.submenu) {
            e.preventDefault();
            setExpandedMobileMenu(prev => prev === item.id ? null : item.id);
        }
    };

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const isActive = isParentActive(item);
        const isExpanded = expandedMobileMenu === item.id;

        const content = (
            <>
                <Icon size={18} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {!isCollapsed && item.submenu && (
                    <ChevronRight 
                        size={14} 
                        className="submenu-indicator-arrow" 
                        style={{
                            transform: isMobile && isExpanded ? "rotate(90deg)" : "none",
                            transition: "transform 0.2s ease",
                            color: isMobile && isExpanded ? "#ffffff" : undefined
                        }}
                    />
                )}
            </>
        );

        return (
            <li 
                key={item.id}
                className="sidebar-item-container"
                onMouseEnter={!isMobile ? (e) => handleParentMouseEnter(item, e) : undefined}
                onMouseLeave={!isMobile ? handleParentMouseLeave : undefined}
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
                        onClick={(e) => handleParentClick(item, e)}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {content}
                    </div>
                )}

                {/* Inline submenu accordion for mobile */}
                {isMobile && item.submenu && isExpanded && (
                    <ul className="mobile-submenu-list" style={{
                        listStyle: "none",
                        paddingLeft: "30px",
                        marginTop: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}>
                        {item.submenu.map((sub, idx) => {
                            const currentPath = location.pathname + location.search;
                            const isSubActive = sub.path.includes("?") 
                                ? currentPath === sub.path 
                                : location.pathname === sub.path;
                            return (
                                <li key={idx}>
                                    <Link
                                        to={sub.path}
                                        className={`nav-link ${isSubActive ? "active" : ""}`}
                                        onClick={handleSubmenuItemClick}
                                        style={{
                                            padding: "8px 12px",
                                            fontSize: "13px",
                                            minHeight: "36px",
                                            borderRadius: "10px",
                                            backgroundColor: isSubActive ? "#ffffff" : "transparent",
                                            color: isSubActive ? "#020079" : "rgba(255, 255, 255, 0.85)"
                                        }}
                                    >
                                        <span className="mobile-submenu-bullet" style={{
                                            width: "5px",
                                            height: "5px",
                                            borderRadius: "50%",
                                            backgroundColor: isSubActive ? "#020079" : "rgba(255, 255, 255, 0.5)",
                                            marginRight: "8px",
                                            flexShrink: 0
                                        }}></span>
                                        {sub.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
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
            {!isMobile && hoveredMenu && hoveredMenu.id === "inventory" ? (
                <InventoryFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : !isMobile && hoveredMenu && hoveredMenu.id === "orders" ? (
                <OrdersFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : !isMobile && hoveredMenu && hoveredMenu.id === "darkhouses" ? (
                <DarkhouseFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : !isMobile && hoveredMenu && (
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