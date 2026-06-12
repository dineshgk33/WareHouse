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
    Users,
    Eye,
    Truck
} from "lucide-react";
import logoImg from "../../assets/logo.jpeg";
import avatarImg from "../../assets/dinesh.png";
import FlyoutMenu from "./FlyoutMenu";
import InventoryFlyout from "./InventoryFlyout";
import OrdersFlyout from "./OrdersFlyout";
import DarkhouseFlyout from "./DarkhouseFlyout";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";

// ─── Dynamic Routing & Menu Configuration Helper Mapping Functions ──────────────────────────────
const getRouteForPage = (pageId, pageName) => {
    const id = pageId.toUpperCase();
    switch (id) {
        case "DASHBOARD":
            return "/";
        case "MANAGE_PREVIEW":
            return "/manage-preview";
        case "ORDERS":
            if (pageName === "Pending Orders") return "/orders/pending";
            if (pageName === "Picking") return "/orders?tab=picking";
            if (pageName === "Packing") return "/orders?tab=packing";
            if (pageName === "Delivery Tracking") return "/orders?tab=tracking";
            if (pageName === "Label History") return "/orders?tab=label-history";
            return "/orders";
        case "WAREHOUSE_INVENTORY":
        case "WAREHOUSE_CATALOGUE":
            return "/catalogue/warehouse";
        case "DARKHOUSE_INVENTORY":
        case "DARKHOUSE_CATALOGUE":
            return "/catalogue/darkhouse";
        case "STOCK_TRANSFERS":
            return "/catalogue/transfers";
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
            

        // ─── Module 3: Admin ───
        case "ADMIN_USERS":
            return "/admin/users";
        case "ADMIN_PERMISSIONS":
            return "/admin/permissions";
        case "ADMIN_ROLE_MASTER":
            return "/admin/role-master";
        case "ADMIN_FACILITIES":
            return "/admin/facilities";
        case "ADMIN_CATEGORIES":
            return "/admin/categories";
        case "ADMIN_PRODUCTS":
            return "/admin/products";
            
        // ─── Module 5: Inventory Management ───
        case "INV_WH_LIST":
            return "/inventory/warehouse-list";
        case "INV_ADJUSTMENT":
            return "/inventory/adjustment";
        case "INV_HISTORY":
            return "/inventory/history";
        case "INV_DH_ADJUSTMENT":
            return "/inventory/darkhouse-adjustment";
        case "INV_DH_HISTORY":
            return "/inventory/darkhouse-history";
            
        // ─── Module 6: GRN ───
        case "GRN_LIST":
            return "/grn/list";
        case "GRN_CREATE":
            return "/grn/create";
        case "GRN_DETAILS":
            return "/grn/details";
            
        // ─── Module 7: Indent Management ───
        case "INDENT_LIST":
            return "/indent/list";
        case "INDENT_CREATE":
            return "/indent/create";
        case "INDENT_DETAILS":
            return "/indent/details";
        case "INDENT_PENDING":
            return "/indent/status/pending";
        case "INDENT_APPROVED":
            return "/indent/status/approved";
        case "INDENT_REJECTED":
            return "/indent/status/rejected";
            
        // ─── Module 8: Dispatch Management ───
        case "DISPATCH_LIST":
            return "/dispatch/list";
        case "DISPATCH_CREATE":
            return "/dispatch/create";
        case "DISPATCH_DETAILS":
            return "/dispatch/details";
        case "DISPATCH_TRACKING":
            return "/dispatch/tracking";
            
        // ─── Module 9: Receiving Management ───
        case "RECEIVING_PENDING":
            return "/receiving/pending";
        case "RECEIVING_PROCESS":
            return "/receiving/process";
        case "RECEIVING_HISTORY":
            return "/receiving/history";
            
        // ─── Module 10: Reports ───
        case "REP_INV_SUMMARY":
            return "/reports/inventory-summary";
        case "REP_LOW_STOCK":
            return "/reports/low-stock";
        case "REP_INV_MOVEMENT":
            return "/reports/inventory-movement";
        case "REP_INDENT":
            return "/reports/indent";
        case "REP_DISPATCH":
            return "/reports/dispatch";
        case "REP_RECEIVING":
            return "/reports/receiving";
        case "REP_ORDER_SUMMARY":
            return "/reports/order-summary";
        case "REP_ORDERS_BY_DH":
            return "/reports/orders-by-darkhouse";
        case "REP_TOP_SELLING":
            return "/reports/top-selling";
        case "REP_ORDER_STATUS":
            return "/reports/order-status";
            
        // ─── Module 11: Orders ───
        case "ORD_MANAGEMENT":
            return "/orders/management";
        case "ORD_LIST":
            return "/orders/list";
        case "ORD_DETAILS":
            return "/orders/details";
        case "ORD_QUERY":
            return "/orders/query";
        case "ORD_PICKING":
            return "/orders/picking";
        case "ORD_PACKING":
            return "/orders/packing";
        case "ORD_DELIVERY":
            return "/orders/delivery";
        case "ORD_CANCELLED":
            return "/orders/cancelled";
            
        default:
            return `/${id.toLowerCase().replace(/_/g, "-")}`;
    }
};

const getIconForModule = (moduleName) => {
    const iconMap = {
        "Dashboard": LayoutDashboard,
        "Manage Preview": Eye,
        "Orders": ShoppingBag,
        "Inventory": Database,
        "Inventory Management": Database,
        "GRN (Goods Receipt Note)": FileText,
        "Indent Management": BookOpen,
        "Dispatch Management": Truck,
        "Receiving Management": Package,
        "Catalogue": Database,
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
    const sidebarRef = useRef(null);

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

        const allowedPages = pages.filter(p => {
            const pageIdUpper = (p.pageId || "").toUpperCase();
            return p.canView && 
                   p.pageName !== "User Roles" &&
                   pageIdUpper !== "CATALOG" &&
                   pageIdUpper !== "DARKHOUSES" &&
                   p.moduleName !== "Login" &&
                   pageIdUpper !== "DASHBOARD_SUPER_ADMIN" &&
                   pageIdUpper !== "DASHBOARD_WAREHOUSE" &&
                   pageIdUpper !== "DASHBOARD_DARKHOUSE";
        });

        const groups = {};
        allowedPages.forEach(page => {
            let mod = page.moduleName || "General";
            let pName = page.pageName;

            // Map Inventory and Darkhouses to Catalogue module
            if (mod === "Inventory" || mod === "Catalogue" || page.pageId === "WAREHOUSE_INVENTORY" || page.pageId === "DARKHOUSE_INVENTORY") {
                mod = "Catalogue";
            }

            // Map page labels to Catalogue names
            if (page.pageId === "WAREHOUSE_INVENTORY") {
                pName = "Warehouse Catalogue";
            } else if (page.pageId === "DARKHOUSE_INVENTORY") {
                pName = "Darkhouse Catalogue";
            }

            if (!groups[mod]) {
                groups[mod] = [];
            }
            groups[mod].push({ ...page, pageName: pName });
        });

        const MODULE_ORDER = [
            "Dashboard",
            "Manage Preview",
            "Catalog",
            "Catalogue",
            "Inventory",
            "Inventory Management",
            "GRN (Goods Receipt Note)",
            "Indent Management",
            "Dispatch Management",
            "Receiving Management",
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
            // Check if user has permission to view this module (has at least one visible subpage)
            const modulePages = groups[moduleName] || [];
            const isAuthorized = modulePages.some(p => p.canView);

            if (!isAuthorized) {
                return;
            }

            const id = moduleName.toLowerCase().replace(/\s+/g, "-");

            const item = {
                id,
                label: moduleName,
                icon: getIconForModule(moduleName),
            };

            if (moduleName === "Catalogue") {
                item.submenu = [
                    { label: "Products", path: "/catalogue/darkhouse/products" },
                    { label: "Inventory", path: "/catalogue/darkhouse/inventory" },
                    { label: "Find Product to Sell", path: "/catalogue/darkhouse/find-product-to-sell" }
                ];
            } else if (modulePages.length === 1) {
                const singlePage = modulePages[0];
                item.path = getRouteForPage(singlePage.pageId, singlePage.pageName);
            } else {
                item.submenu = modulePages.map(page => {
                    return {
                        label: page.pageName,
                        path: getRouteForPage(page.pageId, page.pageName)
                    };
                });
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

        // Ensure Settings is available in the bottomItems list if authorized
        const hasSettings = bottomItems.some(item => item.id === "settings");
        if (!hasSettings && canView("SETTINGS")) {
            bottomItems.push({
                id: "settings",
                label: "Settings",
                icon: getIconForModule("Settings"),
                path: "/settings"
            });
        }

        // Ensure Manage Preview is available in the sidebarItems list if authorized
        const hasManagePreview = sidebarItems.some(item => item.id === "manage-preview");
        if (!hasManagePreview && canView("MANAGE_PREVIEW")) {
            sidebarItems.push({
                id: "manage-preview",
                label: "Manage Preview",
                icon: getIconForModule("Manage Preview"),
                path: "/manage-preview"
            });
        }

        sidebarItems.sort(sortFn);
        bottomItems.sort(sortFn);

        return { main: sidebarItems, bottom: bottomItems };
    };

    const { main: activeSidebarMenu, bottom: activeBottomMenu } = buildDynamicMenu(accessiblePages || []);

    const [hoveredElement, setHoveredElement] = useState(null);
    const navRef = useRef(null);

    const updatePosition = (element, item) => {
        if (!element || !item || !sidebarRef.current) return;
        
        const navEl = navRef.current;
        if (navEl) {
            const navRect = navEl.getBoundingClientRect();
            const rect = element.getBoundingClientRect();
            // If the item scrolls out of the visible bounds of the navigation list, hide it immediately
            if (rect.bottom < navRect.top || rect.top > navRect.bottom) {
                setHoveredMenu(null);
                setHoveredElement(null);
                return;
            }
        }

        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const sidebarHeight = sidebarRect.height;
        const isBottomItem = activeBottomMenu.some(b => b.id === item.id);
        
        const rect = element.getBoundingClientRect();
        // Calculate offset relative to the sidebar container top to be independent of viewport shift
        const computedTopOffset = rect.top - sidebarRect.top;
        
        if (isBottomItem) {
            const bottomOffset = sidebarHeight - computedTopOffset - rect.height;
            setFlyoutPosition({ bottom: bottomOffset, isBottom: true });
        } else {
            const estimatedHeight = 70 + (item.submenu.length * 39);
            let computedTop = computedTopOffset;
            
            if (computedTop + estimatedHeight > sidebarHeight) {
                computedTop = sidebarHeight - estimatedHeight - 16;
            }
            if (computedTop < 10) {
                computedTop = 10;
            }
            setFlyoutPosition({ top: computedTop, isBottom: false });
        }
    };

    useEffect(() => {
        const handleScrollOrResize = () => {
            if (hoveredMenu && hoveredElement) {
                if (leaveTimeoutRef.current) {
                    clearTimeout(leaveTimeoutRef.current);
                    leaveTimeoutRef.current = setTimeout(() => {
                        setHoveredMenu(null);
                        setHoveredElement(null);
                    }, 400); // 400ms scroll buffer to allow scrolling to settle
                }
                updatePosition(hoveredElement, hoveredMenu);
            }
        };
        
        const navEl = navRef.current;
        if (navEl) {
            navEl.addEventListener('scroll', handleScrollOrResize, { passive: true });
        }
        window.addEventListener('resize', handleScrollOrResize);
        
        return () => {
            if (navEl) {
                navEl.removeEventListener('scroll', handleScrollOrResize);
            }
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [hoveredMenu, hoveredElement]);



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
            setHoveredElement(e.currentTarget);
            updatePosition(e.currentTarget, item);
        } else {
            setHoveredMenu(null);
            setHoveredElement(null);
        }
    };

    const handleParentMouseLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
            setHoveredElement(null);
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
        setHoveredElement(null);
    };

    const handleSubmenuItemClick = () => {
        setMobileOpen?.(false);
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
                className={`sidebar-item-container sidebar-item-${item.id}`}
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
        <aside ref={sidebarRef} className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
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
            <nav ref={navRef} className="sidebar-nav">
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

            {!isMobile && hoveredMenu && (hoveredMenu.id === "inventory" || hoveredMenu.id === "catalogue") ? (
                <InventoryFlyout
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                    onItemClick={handleSubmenuItemClick}
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
            ) : !isMobile && hoveredMenu ? (
                <FlyoutMenu 
                    menu={hoveredMenu}
                    position={flyoutPosition}
                    onMouseEnter={handleFlyoutMouseEnter}
                    onMouseLeave={handleFlyoutMouseLeave}
                />
            ) : null}
        </aside>
    );
}

export default Sidebar;