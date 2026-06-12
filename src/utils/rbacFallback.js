// Helper to build page permission object
const page = (pageId, pageName, moduleName, mode) => {
    // mode: "checked", "eye", "cross"
    const isChecked = mode === "checked";
    const isEye = mode === "eye";
    return {
        pageId,
        pageName,
        moduleName,
        canView: isChecked || isEye,
        canCreate: isChecked,
        canEdit: isChecked,
        canDelete: isChecked,
        canApprove: isChecked
    };
};

export const getFallbackAccessiblePages = (roleName) => {
    const name = (roleName || "").toLowerCase();

    const isSuperAdmin = name.includes("super admin") || name === "sa";
    const isAdmin = name === "administrator" || name === "admin";
    
    // Define all new page stubs grouped by module
    const loginPages = [
        page("LOGIN_FORGOT", "Forgot Password", "Login", "checked"),
        page("LOGIN_USER", "User Login", "Login", "checked")
    ];
    
    const dashboardPages = [];
    
    const adminPages = [
        page("ADMIN_USERS", "Manage Users", "Admin", "checked"),
        page("ADMIN_PERMISSIONS", "Role & Page Permissions", "Admin", "checked"),
        page("ADMIN_ROLE_MASTER", "Role Master", "Admin", "checked"),
        page("ADMIN_FACILITIES", "Manage Warehouses & Dark Houses", "Admin", "checked"),
        page("ADMIN_CATEGORIES", "Manage Categories", "Admin", "checked"),
        page("ADMIN_PRODUCTS", "Manage Products", "Admin", "checked")
    ];
    
    const inventoryPages = [
        page("INV_WH_LIST", "Warehouse Inventory List", "Inventory Management", "checked"),
        page("INV_ADJUSTMENT", "Inventory Adjustment", "Inventory Management", "checked"),
        page("INV_HISTORY", "Inventory Transaction History", "Inventory Management", "checked"),
        page("INV_DH_ADJUSTMENT", "Dark House Adjustment", "Inventory Management", "checked"),
        page("INV_DH_HISTORY", "Dark House Inventory History", "Inventory Management", "checked")
    ];
    
    const grnPages = [
        page("GRN_LIST", "GRN List", "GRN (Goods Receipt Note)", "checked"),
        page("GRN_CREATE", "Create GRN", "GRN (Goods Receipt Note)", "checked"),
        page("GRN_DETAILS", "GRN Details", "GRN (Goods Receipt Note)", "checked")
    ];
    
    const indentPages = [
        page("INDENT_LIST", "Indent List", "Indent Management", "checked"),
        page("INDENT_CREATE", "Create Indent", "Indent Management", "checked"),
        page("INDENT_DETAILS", "Indent Details", "Indent Management", "checked"),
        page("INDENT_PENDING", "Indent Status - Pending", "Indent Management", "checked"),
        page("INDENT_APPROVED", "Indent Status - Approved", "Indent Management", "checked"),
        page("INDENT_REJECTED", "Indent Status - Rejected", "Indent Management", "checked")
    ];
    
    const dispatchPages = [
        page("DISPATCH_LIST", "Dispatch List", "Dispatch Management", "checked"),
        page("DISPATCH_CREATE", "Create Dispatch", "Dispatch Management", "checked"),
        page("DISPATCH_DETAILS", "Dispatch Details", "Dispatch Management", "checked"),
        page("DISPATCH_TRACKING", "Dispatch Tracking", "Dispatch Management", "checked")
    ];
    
    const receivingPages = [
        page("RECEIVING_PENDING", "Pending Receipts", "Receiving Management", "checked"),
        page("RECEIVING_PROCESS", "Receive Dispatch", "Receiving Management", "checked"),
        page("RECEIVING_HISTORY", "Receipt History", "Receiving Management", "checked")
    ];
    
    const reportsPages = [
        page("REP_INV_SUMMARY", "Inventory Summary Report", "Reports", "checked"),
        page("REP_LOW_STOCK", "Low Stock Report", "Reports", "checked"),
        page("REP_INV_MOVEMENT", "Inventory Movement Report", "Reports", "checked"),
        page("REP_INDENT", "Indent Report", "Reports", "checked"),
        page("REP_DISPATCH", "Dispatch Report", "Reports", "checked"),
        page("REP_RECEIVING", "Receiving Report", "Reports", "checked"),
        page("REP_ORDER_SUMMARY", "Order Summary Report", "Reports", "checked"),
        page("REP_ORDERS_BY_DH", "Orders by Dark House", "Reports", "checked"),
        page("REP_TOP_SELLING", "Top Selling Products", "Reports", "checked"),
        page("REP_ORDER_STATUS", "Order Status Report", "Reports", "checked")
    ];
    
    const ordersPages = [
        page("ORD_MANAGEMENT", "Order Management", "Orders", "checked"),
        page("ORD_LIST", "Order List", "Orders", "checked"),
        page("ORD_DETAILS", "Order Details", "Orders", "checked"),
        page("ORD_QUERY", "New Order Query", "Orders", "checked"),
        page("ORD_PICKING", "Picking", "Orders", "checked"),
        page("ORD_PACKING", "Packing", "Orders", "checked"),
        page("ORD_DELIVERY", "Delivery Management", "Orders", "checked"),
        page("ORD_CANCELLED", "Cancelled Orders", "Orders", "checked")
    ];

    const baseLegacyPages = [
        page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
        page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "checked"),
        page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
        page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
        page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
        page("ORDERS", "Orders", "Orders", "checked"),
        page("CUSTOMERS", "Customers", "Customers", "checked"),
        page("EMPLOYEES", "Employees", "Employees", "checked"),
        page("BILLING", "Billing", "Billing", "checked"),
        page("ANALYTICS", "Analytics", "Analytics", "checked"),
        page("REPORTS", "Reports", "Reports", "checked"),
        page("OPERATIONS", "Operations", "Operations", "checked"),
        page("SETTINGS", "Settings", "Settings", "checked"),
        page("SUPPORT", "Support", "Support", "checked"),
        page("ADMIN", "Admin", "Admin", "checked")
    ];

    if (isSuperAdmin || isAdmin) {
        // Full access to all old and new modules
        return [
            ...loginPages,
            ...dashboardPages,
            ...adminPages,
            ...inventoryPages,
            ...grnPages,
            ...indentPages,
            ...dispatchPages,
            ...receivingPages,
            ...reportsPages,
            ...ordersPages,
            ...baseLegacyPages
        ];
    }
    
    if (name.includes("warehouse manager") || name.includes("store manager")) {
        // Managers have access to core operational modules
        return [
            ...dashboardPages,
            ...inventoryPages,
            ...grnPages,
            ...indentPages,
            ...dispatchPages,
            ...receivingPages,
            ...reportsPages,
            ...ordersPages,
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
            page("ORDERS", "Orders", "Orders", "checked"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "checked"),
            page("REPORTS", "Reports", "Reports", "checked")
        ];
    }

    if (name.includes("inventory manager")) {
        // Inventory managers focus on stock, catalog, receipts, indents
        return [
            ...dashboardPages,
            ...inventoryPages,
            ...grnPages,
            ...indentPages,
            ...receivingPages,
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye")
        ];
    }

    if (name.includes("order manager") || name.includes("delivery coordinator")) {
        // Order managers handle orders, delivery, dispatch
        return [
            ...dashboardPages,
            ...dispatchPages,
            ...ordersPages,
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("ORDERS", "Orders", "Orders", "checked"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye")
        ];
    }

    if (name.includes("finance manager")) {
        return [
            ...dashboardPages,
            ...reportsPages,
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("BILLING", "Billing", "Billing", "checked"),
            page("ANALYTICS", "Analytics", "Analytics", "checked"),
            page("REPORTS", "Reports", "Reports", "checked")
        ];
    }

    if (name.includes("support") || name.includes("customer representative")) {
        return [
            ...dashboardPages,
            ...ordersPages,
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("CUSTOMERS", "Customers", "Customers", "checked"),
            page("BILLING", "Billing", "Billing", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("SUPPORT", "Support", "Support", "checked")
        ];
    }

    if (name.includes("read only") || name.includes("stakeholder")) {
        // Convert page definitions to read-only/view mode
        const viewAll = (pages) => pages.map(p => ({ ...p, canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false }));
        return [
            ...viewAll(dashboardPages),
            ...viewAll(inventoryPages),
            ...viewAll(grnPages),
            ...viewAll(indentPages),
            ...viewAll(dispatchPages),
            ...viewAll(receivingPages),
            ...viewAll(reportsPages),
            ...viewAll(ordersPages),
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "eye"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "eye"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "eye"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("BILLING", "Billing", "Billing", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye")
        ];
    }

    // Default fallback (minimal)
    return [
        page("DASHBOARD", "Dashboard", "Dashboard", "checked")
    ];
};
