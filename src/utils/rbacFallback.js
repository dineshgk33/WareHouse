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
    
    // Pages helper arrays
    const commonPages = [
        page("DASHBOARD", "Dashboard", "Dashboard", "checked")
    ];

    if (isSuperAdmin || isAdmin) {
        // Full access to all modules
        return [
            ...commonPages,
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "checked"),
            page("RECEIVING", "Receiving Management", "Receiving Management", "checked"),
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
            page("ADMIN", "Admin", "Admin", "checked"),
            page("PURCHASE", "Purchase Management", "Purchase", "checked"),
            page("CATALOG", "Products", "Catalog", "checked"),
            page("CATALOG", "Categories", "Catalog", "checked"),
            page("CATALOG", "Brands", "Catalog", "checked"),
            page("CATALOG", "Attributes", "Catalog", "checked"),
            page("CATALOG", "Variants", "Catalog", "checked"),
            page("CATALOG", "Pricing", "Catalog", "checked"),
            page("CATALOG", "Product Mapping", "Catalog", "checked"),
            page("CATALOG", "Bulk Upload", "Catalog", "checked"),
            page("CATALOG", "Media Library", "Catalog", "checked"),
            page("CATALOG", "Product Audit", "Catalog", "checked"),
            page("DARKHOUSES", "Darkhouse List", "Darkhouses", "checked"),
            page("DARKHOUSES", "Managers", "Darkhouses", "checked"),
            page("DARKHOUSES", "Assign Products", "Darkhouses", "checked"),
            
            // Excel and Phase 6 Pages
            page("OPERATIONS_ORDER_PICKING", "Order Picking", "Operations", "checked"),
            page("OPERATIONS_ORDER_PACKING", "Order Packing", "Operations", "checked"),
            page("OPERATIONS_STORE_OPERATIONS", "Store Operations", "Operations", "checked"),
            page("OPERATIONS_SHIFT_MANAGEMENT", "Shift Management", "Operations", "checked"),
            page("OPERATIONS_WORKFORCE_MANAGEMENT", "Workforce Management", "Operations", "checked"),
            page("OPERATIONS_PERFORMANCE_REPORTS", "Performance Reports", "Operations", "checked"),
            page("OPERATIONS_SUPPORT", "Support", "Operations", "checked"),
            page("INVENTORY_STOCK_INWARD", "Stock Inward", "Inventory", "checked"),
            page("INVENTORY_STOCK_ADJUSTMENT", "Stock Adjustment", "Inventory", "checked"),
            page("INVENTORY_INVENTORY_AUDIT", "Inventory Audit", "Inventory", "checked"),
            page("INVENTORY_BIN_LOCATION_MANAGEMENT", "Bin Location Management", "Inventory", "checked"),
            page("INVENTORY_EXPIRY_MANAGEMENT", "Expiry Management", "Inventory", "checked"),
            page("INVENTORY_LOW_STOCK_ALERTS", "Low Stock Alerts", "Inventory", "checked"),
            page("INVENTORY_SUPPORT", "Support", "Inventory", "checked"),
            page("PURCHASE_VENDOR_PAYMENTS_STATUS", "Vendor Payments Status", "Purchase", "checked"),
            page("PURCHASE_REPORTS", "Purchase Reports", "Purchase", "checked"),
            page("PURCHASE_SUPPORT", "Support", "Purchase", "checked"),
            page("LOGISTICS_DELIVERY_ASSIGNMENT", "Delivery Assignment", "Logistics & Delivery", "checked"),
            page("LOGISTICS_DELIVERY_TRACKING", "Delivery Tracking", "Logistics & Delivery", "checked"),
            page("LOGISTICS_RIDER_MANAGEMENT", "Rider Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_ROUTE_MANAGEMENT", "Route Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_DELIVERY_REPORTS", "Delivery Reports", "Logistics & Delivery", "checked"),
            page("LOGISTICS_RETURN_PICKUP_MANAGEMENT", "Return Pickup Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_SUPPORT", "Support", "Logistics & Delivery", "checked"),
            page("CUSTOMER_SUPPORT_CUSTOMER_TICKETS", "Customer Tickets", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_ORDER_LOOKUP", "Order Lookup", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_REFUND_REQUESTS", "Refund Requests", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_RETURN_REQUESTS", "Return Requests", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_COMPLAINT_MANAGEMENT", "Complaint Management", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_CUSTOMER_CHAT", "Customer Chat", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_CUSTOMER_FEEDBACK", "Customer Feedback", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_SUPPORT", "Support", "Customer Support", "checked"),
            page("SALES_BUSINESS_MERCHANT_MANAGEMENT", "Merchant Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_PARTNER_MANAGEMENT", "Partner Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_LEADS_MANAGEMENT", "Leads Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_BUSINESS_OPPORTUNITIES", "Business Opportunities", "Sales & Business", "checked"),
            page("SALES_BUSINESS_SALES_REPORTS", "Sales Reports", "Sales & Business", "checked"),
            page("SALES_BUSINESS_EXPANSION_PLANNING", "Expansion Planning", "Sales & Business", "checked"),
            page("SALES_BUSINESS_SUPPORT", "Support", "Sales & Business", "checked"),
            page("MARKETING_CAMPAIGN_MANAGEMENT", "Campaign Management", "Marketing", "checked"),
            page("MARKETING_COUPONS_OFFERS", "Coupons & Offers", "Marketing", "checked"),
            page("MARKETING_BANNER_MANAGEMENT", "Banner Management", "Marketing", "checked"),
            page("MARKETING_PUSH_NOTIFICATIONS", "Push Notifications", "Marketing", "checked"),
            page("MARKETING_CUSTOMER_SEGMENTATION", "Customer Segmentation", "Marketing", "checked"),
            page("MARKETING_MARKETING_ANALYTICS", "Marketing Analytics", "Marketing", "checked"),
            page("MARKETING_SUPPORT", "Support", "Marketing", "checked"),
            page("FINANCE_ACCOUNTS_VENDOR_PAYMENTS", "Vendor Payments", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_CUSTOMER_REFUNDS", "Customer Refunds", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_SETTLEMENTS", "Settlements", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_REVENUE_REPORTS", "Revenue Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_EXPENSE_MANAGEMENT", "Expense Management", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_GST_REPORTS", "GST Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_PROFIT_LOSS_REPORTS", "Profit & Loss Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_WALLET_MANAGEMENT", "Wallet Management", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_SUPPORT", "Support", "Finance & Accounts", "checked"),
            page("HR_ATTENDANCE", "Attendance", "Human Resources", "checked"),
            page("HR_LEAVE_MANAGEMENT", "Leave Management", "Human Resources", "checked"),
            page("HR_PAYROLL", "Payroll", "Human Resources", "checked"),
            page("HR_RECRUITMENT", "Recruitment", "Human Resources", "checked"),
            page("HR_PERFORMANCE_REVIEWS", "Performance Reviews", "Human Resources", "checked"),
            page("HR_OFFER_LETTERS", "Offer Letters", "Human Resources", "checked"),
            page("HR_SUPPORT", "Support", "Human Resources", "checked"),
            page("IT_USER_MANAGEMENT", "User Management", "Information Technology", "checked"),
            page("IT_ROLE_PERMISSIONS", "Role & Permissions", "Information Technology", "checked"),
            page("IT_API_LOGS", "API Logs", "Information Technology", "checked"),
            page("IT_SYSTEM_LOGS", "System Logs", "Information Technology", "checked"),
            page("IT_DEVICE_MANAGEMENT", "Device Management", "Information Technology", "checked"),
            page("IT_SECURITY_SETTINGS", "Security Settings", "Information Technology", "checked"),
            page("IT_APPLICATION_SETTINGS", "Application Settings", "Information Technology", "checked"),
            page("IT_SUPPORT", "Support", "Information Technology", "checked"),
            page("ADMINISTRATION_ASSET_MANAGEMENT", "Asset Management", "Administration", "checked"),
            page("ADMINISTRATION_FACILITY_MANAGEMENT", "Facility Management", "Administration", "checked"),
            page("ADMINISTRATION_OFFICE_SUPPLIES", "Office Supplies", "Administration", "checked"),
            page("ADMINISTRATION_VEHICLE_MANAGEMENT", "Vehicle Management", "Administration", "checked"),
            page("ADMINISTRATION_GENERAL_ADMINISTRATION", "General Administration", "Administration", "checked"),
            page("ADMINISTRATION_SUPPORT", "Support", "Administration", "checked")
        ];
    }

    // Mappings for Excel Module Role Groups
    if (name === "operations" || name.includes("operations manager") || name === "operations head") {
        return [
            ...commonPages,
            page("ORDERS", "Order Management", "Operations", "checked"),
            page("OPERATIONS_ORDER_PICKING", "Order Picking", "Operations", "checked"),
            page("OPERATIONS_ORDER_PACKING", "Order Packing", "Operations", "checked"),
            page("OPERATIONS_STORE_OPERATIONS", "Store Operations", "Operations", "checked"),
            page("OPERATIONS_SHIFT_MANAGEMENT", "Shift Management", "Operations", "checked"),
            page("OPERATIONS_WORKFORCE_MANAGEMENT", "Workforce Management", "Operations", "checked"),
            page("OPERATIONS_PERFORMANCE_REPORTS", "Performance Reports", "Operations", "checked"),
            page("OPERATIONS_SUPPORT", "Support", "Operations", "checked"),
            page("REPORTS", "Reports", "Operations", "checked")
        ];
    }

    if (name === "inventory" || name.includes("inventory manager")) {
        return [
            ...commonPages,
            page("WAREHOUSE_INVENTORY", "Inventory Management", "Inventory", "checked"),
            page("INVENTORY_STOCK_INWARD", "Stock Inward", "Inventory", "checked"),
            page("STOCK_TRANSFERS", "Stock Transfer", "Inventory", "checked"),
            page("INVENTORY_STOCK_ADJUSTMENT", "Stock Adjustment", "Inventory", "checked"),
            page("INVENTORY_INVENTORY_AUDIT", "Inventory Audit", "Inventory", "checked"),
            page("INVENTORY_BIN_LOCATION_MANAGEMENT", "Bin Location Management", "Inventory", "checked"),
            page("INVENTORY_EXPIRY_MANAGEMENT", "Expiry Management", "Inventory", "checked"),
            page("INVENTORY_LOW_STOCK_ALERTS", "Low Stock Alerts", "Inventory", "checked"),
            page("INVENTORY_SUPPORT", "Support", "Inventory", "checked"),
            page("REPORTS", "Reports", "Inventory", "checked")
        ];
    }

    if (name === "purchase" || name.includes("procurement manager")) {
        return [
            ...commonPages,
            page("PURCHASE_VENDOR_PAYMENTS_STATUS", "Vendor Management", "Purchase", "checked"),
            page("PURCHASE_REPORTS", "Purchase Requests", "Purchase", "checked"),
            page("PURCHASE_REPORTS", "Purchase Orders", "Purchase", "checked"),
            page("PURCHASE_REPORTS", "Goods Receipt (GRN)", "Purchase", "checked"),
            page("PURCHASE_VENDOR_PAYMENTS_STATUS", "Vendor Payments Status", "Purchase", "checked"),
            page("PURCHASE_REPORTS", "Purchase Reports", "Purchase", "checked"),
            page("PURCHASE_SUPPORT", "Support", "Purchase", "checked"),
            page("REPORTS", "Reports", "Purchase", "checked")
        ];
    }

    if (name === "logistics & delivery" || name.includes("delivery coordinator")) {
        return [
            ...commonPages,
            page("LOGISTICS_DELIVERY_ASSIGNMENT", "Delivery Assignment", "Logistics & Delivery", "checked"),
            page("LOGISTICS_DELIVERY_TRACKING", "Delivery Tracking", "Logistics & Delivery", "checked"),
            page("LOGISTICS_RIDER_MANAGEMENT", "Rider Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_ROUTE_MANAGEMENT", "Route Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_DELIVERY_REPORTS", "Delivery Reports", "Logistics & Delivery", "checked"),
            page("LOGISTICS_RETURN_PICKUP_MANAGEMENT", "Return Pickup Management", "Logistics & Delivery", "checked"),
            page("LOGISTICS_SUPPORT", "Support", "Logistics & Delivery", "checked"),
            page("REPORTS", "Reports", "Logistics & Delivery", "checked")
        ];
    }

    if (name === "customer support" || name.includes("support representative")) {
        return [
            ...commonPages,
            page("CUSTOMER_SUPPORT_CUSTOMER_TICKETS", "Customer Tickets", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_ORDER_LOOKUP", "Order Lookup", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_REFUND_REQUESTS", "Refund Requests", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_RETURN_REQUESTS", "Return Requests", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_COMPLAINT_MANAGEMENT", "Complaint Management", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_CUSTOMER_CHAT", "Customer Chat", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_CUSTOMER_FEEDBACK", "Customer Feedback", "Customer Support", "checked"),
            page("CUSTOMER_SUPPORT_SUPPORT", "Support", "Customer Support", "checked"),
            page("REPORTS", "Reports", "Customer Support", "checked")
        ];
    }

    if (name === "sales & business" || name === "seller") {
        return [
            ...commonPages,
            page("SALES_BUSINESS_MERCHANT_MANAGEMENT", "Merchant Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_PARTNER_MANAGEMENT", "Partner Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_LEADS_MANAGEMENT", "Leads Management", "Sales & Business", "checked"),
            page("SALES_BUSINESS_BUSINESS_OPPORTUNITIES", "Business Opportunities", "Sales & Business", "checked"),
            page("SALES_BUSINESS_SALES_REPORTS", "Sales Reports", "Sales & Business", "checked"),
            page("SALES_BUSINESS_EXPANSION_PLANNING", "Expansion Planning", "Sales & Business", "checked"),
            page("SALES_BUSINESS_SUPPORT", "Support", "Sales & Business", "checked"),
            page("REPORTS", "Reports", "Sales & Business", "checked")
        ];
    }

    if (name === "marketing") {
        return [
            ...commonPages,
            page("MARKETING_CAMPAIGN_MANAGEMENT", "Campaign Management", "Marketing", "checked"),
            page("MARKETING_COUPONS_OFFERS", "Coupons & Offers", "Marketing", "checked"),
            page("MARKETING_BANNER_MANAGEMENT", "Banner Management", "Marketing", "checked"),
            page("MARKETING_PUSH_NOTIFICATIONS", "Push Notifications", "Marketing", "checked"),
            page("MARKETING_CUSTOMER_SEGMENTATION", "Customer Segmentation", "Marketing", "checked"),
            page("MARKETING_MARKETING_ANALYTICS", "Marketing Analytics", "Marketing", "checked"),
            page("MARKETING_SUPPORT", "Support", "Marketing", "checked"),
            page("REPORTS", "Reports", "Marketing", "checked")
        ];
    }

    if (name === "finance & accounts" || name.includes("finance manager")) {
        return [
            ...commonPages,
            page("FINANCE_ACCOUNTS_VENDOR_PAYMENTS", "Vendor Payments", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_CUSTOMER_REFUNDS", "Customer Refunds", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_SETTLEMENTS", "Settlements", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_REVENUE_REPORTS", "Revenue Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_EXPENSE_MANAGEMENT", "Expense Management", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_GST_REPORTS", "GST Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_PROFIT_LOSS_REPORTS", "Profit & Loss Reports", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_WALLET_MANAGEMENT", "Wallet Management", "Finance & Accounts", "checked"),
            page("FINANCE_ACCOUNTS_SUPPORT", "Support", "Finance & Accounts", "checked"),
            page("REPORTS", "Reports", "Finance & Accounts", "checked")
        ];
    }

    if (name === "human resources") {
        return [
            ...commonPages,
            page("EMPLOYEES", "Employee Management", "Human Resources", "checked"),
            page("HR_ATTENDANCE", "Attendance", "Human Resources", "checked"),
            page("HR_LEAVE_MANAGEMENT", "Leave Management", "Human Resources", "checked"),
            page("HR_PAYROLL", "Payroll", "Human Resources", "checked"),
            page("HR_RECRUITMENT", "Recruitment", "Human Resources", "checked"),
            page("HR_PERFORMANCE_REVIEWS", "Performance Reviews", "Human Resources", "checked"),
            page("HR_OFFER_LETTERS", "Offer Letters", "Human Resources", "checked"),
            page("HR_SUPPORT", "Support", "Human Resources", "checked"),
            page("REPORTS", "Reports", "Human Resources", "checked")
        ];
    }

    if (name === "information technology") {
        return [
            ...commonPages,
            page("IT_USER_MANAGEMENT", "User Management", "Information Technology", "checked"),
            page("IT_ROLE_PERMISSIONS", "Role & Permissions", "Information Technology", "checked"),
            page("IT_API_LOGS", "API Logs", "Information Technology", "checked"),
            page("IT_SYSTEM_LOGS", "System Logs", "Information Technology", "checked"),
            page("IT_DEVICE_MANAGEMENT", "Device Management", "Information Technology", "checked"),
            page("IT_SECURITY_SETTINGS", "Security Settings", "Information Technology", "checked"),
            page("IT_APPLICATION_SETTINGS", "Application Settings", "Information Technology", "checked"),
            page("IT_SUPPORT", "Support", "Information Technology", "checked"),
            page("REPORTS", "Reports", "Information Technology", "checked")
        ];
    }

    if (name === "administration") {
        return [
            ...commonPages,
            page("ADMINISTRATION_ASSET_MANAGEMENT", "Asset Management", "Administration", "checked"),
            page("ADMINISTRATION_FACILITY_MANAGEMENT", "Facility Management", "Administration", "checked"),
            page("ADMINISTRATION_OFFICE_SUPPLIES", "Office Supplies", "Administration", "checked"),
            page("ADMINISTRATION_VEHICLE_MANAGEMENT", "Vehicle Management", "Administration", "checked"),
            page("ADMINISTRATION_GENERAL_ADMINISTRATION", "General Administration", "Administration", "checked"),
            page("ADMINISTRATION_SUPPORT", "Support", "Administration", "checked"),
            page("REPORTS", "Reports", "Administration", "checked")
        ];
    }

    if (name.includes("warehouse manager") || name.includes("store manager") || name.includes("dark house manager")) {
        return [
            ...commonPages,
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("RECEIVING", "Receiving Management", "Receiving Management", "checked"),
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
            page("ADMIN", "Admin", "Admin", "cross"),
            page("PURCHASE", "Purchase Management", "Purchase", "checked"),
            page("CATALOG", "Products", "Catalog", "checked"),
            page("CATALOG", "Categories", "Catalog", "checked"),
            page("CATALOG", "Brands", "Catalog", "checked"),
            page("CATALOG", "Attributes", "Catalog", "checked"),
            page("CATALOG", "Variants", "Catalog", "checked"),
            page("CATALOG", "Pricing", "Catalog", "checked"),
            page("CATALOG", "Product Mapping", "Catalog", "checked"),
            page("CATALOG", "Bulk Upload", "Catalog", "checked"),
            page("CATALOG", "Media Library", "Catalog", "checked"),
            page("CATALOG", "Product Audit", "Catalog", "checked"),
            page("DARKHOUSES", "Darkhouse List", "Darkhouses", "checked"),
            page("DARKHOUSES", "Managers", "Darkhouses", "checked"),
            page("DARKHOUSES", "Assign Products", "Darkhouses", "checked"),
        ];
    }

    if (name.includes("read only") || name.includes("stakeholder") || name === "viewer") {
        return [
            ...commonPages,
            page("MANAGE_PREVIEW", "Manage Preview", "Manage Preview", "cross"),
            page("RECEIVING", "Receiving Management", "Receiving Management", "eye"),
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
            page("ADMIN", "Admin", "Admin", "cross"),
            page("PURCHASE", "Purchase Management", "Purchase", "eye"),
            page("CATALOG", "Products", "Catalog", "eye"),
            page("CATALOG", "Categories", "Catalog", "eye"),
            page("CATALOG", "Brands", "Catalog", "eye"),
            page("CATALOG", "Attributes", "Catalog", "eye"),
            page("CATALOG", "Variants", "Catalog", "eye"),
            page("CATALOG", "Pricing", "Catalog", "eye"),
            page("CATALOG", "Product Mapping", "Catalog", "eye"),
            page("CATALOG", "Bulk Upload", "Catalog", "eye"),
            page("CATALOG", "Media Library", "Catalog", "eye"),
            page("CATALOG", "Product Audit", "Catalog", "eye"),
            page("DARKHOUSES", "Darkhouse List", "Darkhouses", "eye"),
            page("DARKHOUSES", "Managers", "Darkhouses", "eye"),
            page("DARKHOUSES", "Assign Products", "Darkhouses", "eye"),
        ];
    }

    // Default fallback (minimal)
    return [
        page("DASHBOARD", "Dashboard", "Dashboard", "checked")
    ];
};
