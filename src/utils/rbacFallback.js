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
    
    if (isSuperAdmin || isAdmin) {
        // Full access to all modules
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "checked"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
            page("INDENT", "Indent Requests", "Catalogue", "checked"),
            page("ORDERS", "Orders", "Orders", "checked"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "checked"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "checked"),
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
    }
    
    if (name.includes("warehouse manager") || name.includes("store manager")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
            page("INDENT", "Indent Requests", "Catalogue", "checked"),
            page("ORDERS", "Orders", "Orders", "checked"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "checked"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "checked"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "cross"),
            page("ANALYTICS", "Analytics", "Analytics", "checked"),
            page("REPORTS", "Reports", "Reports", "checked"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "cross"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    if (name.includes("inventory manager")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "checked"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "checked"),
            page("INDENT", "Indent Requests", "Catalogue", "checked"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "eye"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "checked"),
            page("CUSTOMERS", "Customers", "Customers", "cross"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "cross"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "cross"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    if (name.includes("order manager") || name.includes("delivery coordinator")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "cross"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "cross"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "cross"),
            page("ORDERS", "Orders", "Orders", "checked"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "checked"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "eye"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "cross"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "cross"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    if (name.includes("finance manager")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "cross"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "cross"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "cross"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "eye"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "checked"),
            page("CUSTOMERS", "Customers", "Customers", "cross"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "checked"),
            page("ANALYTICS", "Analytics", "Analytics", "checked"),
            page("REPORTS", "Reports", "Reports", "checked"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "cross"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    if (name.includes("support") || name.includes("customer representative")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "cross"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "cross"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "cross"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "eye"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "eye"),
            page("CUSTOMERS", "Customers", "Customers", "checked"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "cross"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "checked"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    if (name.includes("read only") || name.includes("stakeholder")) {
        return [
            page("DASHBOARD", "Dashboard", "Dashboard", "checked"),
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("WAREHOUSE_INVENTORY", "Warehouse Catalogue", "Catalogue", "eye"),
            page("DARKHOUSE_INVENTORY", "Darkhouse Catalogue", "Catalogue", "eye"),
            page("STOCK_TRANSFERS", "Stock Transfers", "Catalogue", "eye"),
            page("INDENT", "Indent Requests", "Catalogue", "eye"),
            page("ORDERS", "Orders", "Orders", "eye"),
            page("DISPATCH", "Dispatch Management", "Dispatch Management", "eye"),
            page("GRN", "GRN (Goods Receipt Note)", "GRN (Goods Receipt Note)", "eye"),
            page("CUSTOMERS", "Customers", "Customers", "eye"),
            page("EMPLOYEES", "Employees", "Employees", "cross"),
            page("BILLING", "Billing", "Billing", "eye"),
            page("ANALYTICS", "Analytics", "Analytics", "eye"),
            page("REPORTS", "Reports", "Reports", "eye"),
            page("SETTINGS", "Settings", "Settings", "cross"),
            page("SUPPORT", "Support", "Support", "cross"),
            page("ADMIN", "Admin", "Admin", "cross")
        ];
    }

    // Default fallback (minimal)
    return [
        page("DASHBOARD", "Dashboard", "Dashboard", "checked")
    ];
};
