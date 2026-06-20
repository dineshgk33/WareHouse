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
    ClipboardList,
    ArrowDownToLine,
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
const getRouteForPage = (pageId, pageName, moduleName) => {
    const isDept = [
        "operations", "inventory", "purchase", "logistics & delivery", 
        "customer support", "sales & business", "marketing", "finance & accounts", 
        "human resources", "information technology", "administration"
    ].includes((moduleName || "").toLowerCase());

    if (isDept) {
        const modSlug = moduleName.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
        const pageSlug = pageName.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
        
        // Custom exceptions where routes differ from slug formula
        if (moduleName === "Operations" && pageName === "Order Management") {
            return "/orders?tab=management";
        }
        if (moduleName === "Inventory" && pageName === "Stock Transfer") {
            return "/inventory/stock-transfer";
        }
        if (moduleName === "Customer Support" && pageName === "Order Lookup") {
            return "/customer-support/order-lookup";
        }
        if (moduleName === "Purchase" && pageName === "Vendor Management") {
            return "/purchase/vendor-management";
        }
        if (moduleName === "Purchase" && pageName === "Goods Receipt (GRN)") {
            return "/purchase/goods-receipt-grn";
        }
        if (moduleName === "Marketing" && pageName === "Coupons & Offers") {
            return "/marketing/coupons-offers";
        }
        if (moduleName === "Finance & Accounts" && pageName === "Profit & Loss Reports") {
            return "/finance-accounts/profit-loss-reports";
        }
        if (moduleName === "Information Technology" && pageName === "Role & Permissions") {
            return "/information-technology/role-permissions";
        }
        
        return `/${modSlug}/${pageSlug}`;
    }

    const id = pageId.toUpperCase();
    switch (id) {
        case "DASHBOARD":
            return "/";
        case "MANAGE_PREVIEW":
            return "/manage-preview";
        case "ORDERS":
            if (pageName === "Fulfillment Board") return "/orders?tab=board";
            if (pageName === "Pending Queue") return "/orders?tab=board&step=pending";
            if (pageName === "Picking Queue") return "/orders?tab=board&step=picking";
            if (pageName === "Packing Queue") return "/orders?tab=board&step=packing";
            if (pageName === "Delivery Queue") return "/orders?tab=board&step=delivery";
            if (pageName === "Order Inspector") return "/orders?tab=details";
            if (pageName === "Control Center") return "/orders?tab=management";
            if (pageName === "Order Lookup") return "/orders?tab=new-query";
            if (pageName === "Cancelled Orders") return "/orders?tab=cancelled";
            
            // Legacy fallbacks for compatibility
            if (pageName === "Order Management") return "/orders?tab=management";
            if (pageName === "Order List") return "/orders?tab=board";
            if (pageName === "Order Details") return "/orders?tab=details";
            if (pageName === "New Order Query") return "/orders?tab=new-query";
            if (pageName === "Picking") return "/orders?tab=board&step=picking";
            if (pageName === "Packing") return "/orders?tab=board&step=packing";
            if (pageName === "Delivery Management") return "/orders?tab=board&step=delivery";
            if (pageName === "Pending Orders") return "/orders/pending";
            if (pageName === "Delivery Tracking") return "/orders?tab=board&step=delivery";
            if (pageName === "Label History") return "/orders?tab=label-history";
            return "/orders";
        case "RECEIVING":
            if (pageName === "Pending Receipts") return "/receiving?tab=pending";
            if (pageName === "Receive Dispatch") return "/receiving?tab=receive";
            if (pageName === "Receipt History") return "/receiving?tab=history";
            return "/receiving";
        case "DISPATCH":
            if (pageName === "Dispatch List") return "/dispatch?tab=list";
            if (pageName === "Create Dispatch") return "/dispatch?tab=create";
            if (pageName === "Dispatch Details") return "/dispatch?tab=details";
            if (pageName === "Dispatch Tracking") return "/dispatch?tab=tracking";
            return "/dispatch";
        case "GRN":
            if (pageName === "GRN List") return "/grn?tab=list";
            if (pageName === "Create GRN") return "/grn?tab=create";
            if (pageName === "GRN Details") return "/grn?tab=details";
            return "/grn";
        case "WAREHOUSE_INVENTORY":
        case "WAREHOUSE_CATALOGUE":
            return "/catalogue/warehouse";
        case "DARKHOUSE_INVENTORY":
        case "DARKHOUSE_CATALOGUE":
            return "/catalogue/darkhouse";
        case "STOCK_TRANSFERS":
            return "/catalogue/transfers";
        case "INDENT":
            if (pageName === "Indent List") return "/indent?tab=list";
            if (pageName === "Create Indent") return "/indent?tab=create";
            if (pageName === "Indent Details") return "/indent?tab=details";
            if (pageName === "Pending Indents") return "/indent?tab=list&status=Pending";
            if (pageName === "Approved Indents") return "/indent?tab=list&status=Approved";
            if (pageName === "Rejected Indents") return "/indent?tab=list&status=Rejected";
            return "/indent";
        case "EMPLOYEES":
            return "/employees";
        case "REPORTS":
            if (pageName === "Inventory Summary Report") return "/reports/inventory-summary";
            if (pageName === "Low Stock Report") return "/reports/low-stock";
            if (pageName === "Inventory Movement Report") return "/reports/inventory-movement";
            if (pageName === "Indent Report") return "/reports/indent";
            if (pageName === "Dispatch Report") return "/reports/dispatch";
            if (pageName === "Receiving Report") return "/reports/receiving";
            if (pageName === "Order Summary Report") return "/reports/order-summary";
            if (pageName === "Orders by Dark House") return "/reports/orders-by-darkhouse";
            if (pageName === "Top Selling Products") return "/reports/top-selling";
            if (pageName === "Order Status Report") return "/reports/order-status";
            if (moduleName && pageName === "Reports") {
                return `/${moduleName.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-")}/reports`;
            }
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
            if (pageName === "Manage Users") return "/admin/users";
            if (pageName === "Role & Page Permissions") return "/admin/permissions";
            if (pageName === "Role Master") return "/admin/rolemaster";
            if (pageName === "Manage Warehouses & Dark Houses") return "/admin/warehouses";
            if (pageName === "Warehouse Mapping") return "/admin/warehouse-mapping";
            if (pageName === "Manage Categories") return "/admin/categories";
            if (pageName === "Manage Products") return "/admin/products";
            return "/admin/users";
        case "DARKHOUSES":
            if (pageName === "Darkhouse List") return "/darkhouses";
            if (pageName === "Managers") return "/darkhouses?tab=managers";
            if (pageName === "Assign Products") return "/darkhouses?tab=assign";
            return "/darkhouses";
        default:
            // Dynamic path resolver for sub-module pages
            if (id.startsWith("OPERATIONS_")) return `/operations/${id.replace("OPERATIONS_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("INVENTORY_")) return `/inventory/${id.replace("INVENTORY_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("PURCHASE_")) return `/purchase/${id.replace("PURCHASE_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("LOGISTICS_")) return `/logistics-delivery/${id.replace("LOGISTICS_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("CUSTOMER_SUPPORT_")) return `/customer-support/${id.replace("CUSTOMER_SUPPORT_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("SALES_BUSINESS_")) return `/sales-business/${id.replace("SALES_BUSINESS_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("MARKETING_")) return `/marketing/${id.replace("MARKETING_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("FINANCE_ACCOUNTS_")) return `/finance-accounts/${id.replace("FINANCE_ACCOUNTS_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("HR_")) return `/human-resources/${id.replace("HR_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("IT_")) return `/information-technology/${id.replace("IT_", "").toLowerCase().replace(/_/g, "-")}`;
            if (id.startsWith("ADMINISTRATION_")) return `/administration/${id.replace("ADMINISTRATION_", "").toLowerCase().replace(/_/g, "-")}`;
            
            return `/${id.toLowerCase().replace(/_/g, "-")}`;
    }
};

const getIconForModule = (moduleName) => {
    const iconMap = {
        "Dashboard": LayoutDashboard,
        "Manage Preview": Eye,
        "Orders": ShoppingBag,
        "Purchase": ShoppingBag,
        "Inventory": Database,
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
        "Support": HelpCircle,
        "Indent Management": ClipboardList,
        "Receiving Management": ArrowDownToLine,
        "GRN (Goods Receipt Note)": FileText,
        "Dispatch Management": Truck,
        
        // Excel Modules
        "Logistics & Delivery": Truck,
        "Customer Support": HelpCircle,
        "Sales & Business": ShoppingBag,
        "Marketing": BarChart3,
        "Finance & Accounts": CreditCard,
        "Human Resources": Users,
        "Information Technology": Shield,
        "Administration": Settings
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

        const allowedPages = pages.filter(p => {
            const pageIdUpper = (p.pageId || "").toUpperCase();
            return p.canView && 
                   p.pageName !== "User Roles" &&
                   pageIdUpper !== "CATALOG" &&
                   pageIdUpper !== "DARKHOUSES";
        });

        const groups = {};
        allowedPages.forEach(page => {
            let mod = page.moduleName || "General";
            let pName = page.pageName;

            const isInventoryRole = (userRole || "").toLowerCase().includes("inventory");

            if (!isInventoryRole) {
                // Map Inventory and Darkhouses to Catalogue module only for default catalog/transfers
                if (mod === "Inventory" || mod === "Catalogue" || page.pageId === "WAREHOUSE_INVENTORY" || page.pageId === "DARKHOUSE_INVENTORY") {
                    if (page.pageId === "WAREHOUSE_INVENTORY" || page.pageId === "DARKHOUSE_INVENTORY" || page.pageId === "STOCK_TRANSFERS") {
                        mod = "Catalogue";
                    } else {
                        mod = "Inventory";
                    }
                }
                const pageIdUpper = (page.pageId || "").toUpperCase();
                const pageModUpper = (page.moduleName || "").toUpperCase();
                if (pageIdUpper === "INDENT" || pageModUpper === "INDENT" || pageModUpper === "INDENT MANAGEMENT") {
                    mod = "Indent Management";
                    if (pageIdUpper === "INDENT") {
                        pName = "Indent Management";
                    }
                }

                // Map page labels to Catalogue names
                if (page.pageId === "WAREHOUSE_INVENTORY") {
                    pName = "Warehouse Catalogue";
                } else if (page.pageId === "DARKHOUSE_INVENTORY") {
                    pName = "Darkhouse Catalogue";
                }
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
            "Orders",
            "Darkhouses",
            "Customers",
            "Indent Management",
            "Receiving Management",
            "GRN (Goods Receipt Note)",
            "Dispatch Management",
            "Employees",
            "Billing",
            "Analytics",
            "Admin",
            "Reports",
            "Operations",
            "Settings",
            "Support",
            
            // Excel custom modules ordering
            "Logistics & Delivery",
            "Customer Support",
            "Sales & Business",
            "Marketing",
            "Finance & Accounts",
            "Human Resources",
            "Information Technology",
            "Administration"
        ];

        const BOTTOM_MODULES = ["Settings", "Support"];

        const sidebarItems = [];
        const bottomItems = [];

        Object.keys(groups).forEach(moduleName => {
            // Check if user has permission to view this module
            let isAuthorized;
            const upperModule = moduleName.toUpperCase();
            if (upperModule === "CATALOGUE") {
                isAuthorized = canView("WAREHOUSE_INVENTORY") || canView("DARKHOUSE_INVENTORY") || canView("STOCK_TRANSFERS");
            } else if (moduleName === "Indent Management") {
                isAuthorized = canView("INDENT");
            } else if (upperModule === "SETTINGS") {
                isAuthorized = true;
            } else if (upperModule === "SUPPORT") {
                isAuthorized = canView("SUPPORT");
            } else {
                isAuthorized = canView(moduleName) || modulePagesHasAccess(groups[moduleName]);
            }

            function modulePagesHasAccess(modPages) {
                return Array.isArray(modPages) && modPages.some(p => p.canView);
            }

            if (!isAuthorized) {
                return;
            }

            const modulePages = groups[moduleName];
            const id = moduleName.toLowerCase().replace(/\s+/g, "-");

            const item = {
                id,
                label: moduleName,
                icon: getIconForModule(moduleName),
            };

            if (modulePages.length === 1) {
                const singlePage = modulePages[0];
                item.path = getRouteForPage(singlePage.pageId, singlePage.pageName, moduleName);
            } else {
                item.submenu = modulePages.map(page => {
                    return {
                        label: page.pageName,
                        path: getRouteForPage(page.pageId, page.pageName, moduleName)
                    };
                });
                if (item.submenu.length > 0) {
                    item.path = item.submenu[0].path;
                }
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

        // Ensure Settings is available in the bottomItems list for all users
        const hasSettings = bottomItems.some(item => item.id === "settings");
        if (!hasSettings) {
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

        // Ensure Receiving Management is available in the sidebarItems list if authorized
        const hasReceiving = sidebarItems.some(item => item.id === "receiving-management");
        if (!hasReceiving && (canView("ORDERS") || canView("RECEIVING"))) {
            sidebarItems.push({
                id: "receiving-management",
                label: "Receiving Management",
                icon: getIconForModule("Receiving Management"),
                path: "/receiving?tab=pending",
                submenu: [
                    { label: "Pending Receipts", path: "/receiving?tab=pending" },
                    { label: "Receive Dispatch", path: "/receiving?tab=receive" },
                    { label: "Receipt History", path: "/receiving?tab=history" }
                ]
            });
        }

        // Ensure Dispatch Management is available in the sidebarItems list if authorized
        const hasDispatch = sidebarItems.some(item => item.id === "dispatch-management");
        if (!hasDispatch && canView("DISPATCH")) {
            sidebarItems.push({
                id: "dispatch-management",
                label: "Dispatch Management",
                icon: getIconForModule("Dispatch Management"),
                path: "/dispatch?tab=list",
                submenu: [
                    { label: "Dispatch List", path: "/dispatch?tab=list" },
                    { label: "Create Dispatch", path: "/dispatch?tab=create" },
                    { label: "Dispatch Details", path: "/dispatch?tab=details" },
                    { label: "Dispatch Tracking", path: "/dispatch?tab=tracking" }
                ]
            });
        }

        // Ensure Indent Management is available in the sidebarItems list if authorized
        const hasIndent = sidebarItems.some(item => item.id === "indent-management");
        if (!hasIndent && canView("INDENT")) {
            sidebarItems.push({
                id: "indent-management",
                label: "Indent Management",
                icon: getIconForModule("Indent Management"),
                path: "/indent?tab=list",
                submenu: [
                    { label: "Indent List", path: "/indent?tab=list" },
                    { label: "Indent Details", path: "/indent?tab=details" },
                    { label: "Pending Indents", path: "/indent?tab=list&status=Pending" },
                    { label: "Approved Indents", path: "/indent?tab=list&status=Approved" },
                    { label: "Rejected Indents", path: "/indent?tab=list&status=Rejected" }
                ]
            });
        }

        // Ensure GRN Management is available in the sidebarItems list if authorized
        const hasGRN = sidebarItems.some(item => item.id === "grn-management");
        if (!hasGRN && canView("GRN")) {
            sidebarItems.push({
                id: "grn-management",
                label: "GRN (Goods Receipt Note)",
                icon: getIconForModule("GRN (Goods Receipt Note)"),
                path: "/grn?tab=list",
                submenu: [
                    { label: "GRN List", path: "/grn?tab=list" },
                    { label: "Create GRN", path: "/grn?tab=create" },
                    { label: "GRN Details", path: "/grn?tab=details" }
                ]
            });
        }

        // Ensure Purchase Management is available in the sidebarItems list if authorized
        const hasPurchase = sidebarItems.some(item => item.id === "purchase-management");
        if (!hasPurchase && canView("PURCHASE")) {
            sidebarItems.push({
                id: "purchase-management",
                label: "Purchase",
                icon: getIconForModule("Purchase"),
                path: "/purchase/dashboard",
                submenu: [
                    { label: "Purchase Dashboard", path: "/purchase/dashboard" },
                    { label: "Purchase Requisition", path: "/purchase/requisition" },
                    { label: "Purchase Orders", path: "/purchase/orders" },
                    { label: "Vendors", path: "/purchase/vendors" },
                    { label: "Inbound Deliveries", path: "/purchase/deliveries" },
                    { label: "Purchase GRN", path: "/purchase/grn" },
                    { label: "Vendor Performance", path: "/purchase/performance" }
                ]
            });
        }

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
            
            const liElement = e.currentTarget;
            const sidebarElement = liElement.closest('.sidebar');
            if (sidebarElement) {
                const sidebarRect = sidebarElement.getBoundingClientRect();
                const itemRect = liElement.getBoundingClientRect();
                const relativeTop = itemRect.top - sidebarRect.top;
                
                // Estimate height dynamically based on character lengths of labels to account for wrapping
                let estimatedHeight = 50; // Base padding/header
                item.submenu.forEach(sub => {
                    const labelText = sub.label || "";
                    // A 220px card width fits approximately 20 characters of 13.5px semibold text per line
                    const lines = labelText.length > 20 ? Math.ceil(labelText.length / 20) : 1;
                    estimatedHeight += (lines * 18) + 16; // 18px per line + 16px item spacing/padding
                });
                estimatedHeight += 24; // Extra safety buffer
                
                // Clamp the top offset so the submenu never overflows the viewport top (16px padding) or bottom (16px padding)
                const top = Math.max(16, Math.min(relativeTop, sidebarRect.height - estimatedHeight - 16));
                
                setFlyoutPosition({ top, isBottom: false });
            } else {
                setFlyoutPosition({ top: liElement.offsetTop, isBottom: false });
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