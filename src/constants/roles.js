/**
 * HAATZA Role Constants
 * Single source of truth for all user role identifiers.
 * Import this instead of using magic strings anywhere in the codebase.
 */

export const ROLES = {
    SUPER_ADMIN: "Super Admin",
    ADMINISTRATOR: "Administrator",
    WAREHOUSE_MANAGER: "Warehouse Manager",
    INVENTORY_MANAGER: "Inventory Manager",
    ORDER_MANAGER: "Order Manager",
    SUPPORT_REPRESENTATIVE: "Support Representative",
    DELIVERY_COORDINATOR: "Delivery Coordinator",
    FINANCE_MANAGER: "Finance Manager",
    READ_ONLY_USER: "Read Only User",
    STORE_MANAGER: "Store Manager",
    OPERATION_HEAD: "Operation Head",
    
    // Phase 6 Mapped Roles
    DARK_HOUSE_MANAGER: "Dark House Manager",
    PROCUREMENT_MANAGER: "Procurement Manager",
    OPERATIONS_MANAGER: "Operations Manager",
    VIEWER: "Viewer",
    SELLER: "Seller",

    // Excel Specific Role Groups
    OPERATIONS: "Operations",
    INVENTORY: "Inventory",
    PURCHASE: "Purchase",
    LOGISTICS_DELIVERY: "Logistics & Delivery",
    CUSTOMER_SUPPORT: "Customer Support",
    SALES_BUSINESS: "Sales & Business",
    MARKETING: "Marketing",
    FINANCE_ACCOUNTS: "Finance & Accounts",
    HUMAN_RESOURCES: "Human Resources",
    INFORMATION_TECHNOLOGY: "Information Technology",
    ADMINISTRATION: "Administration"
};

/** All enterprise roles that have access to the main dashboard layout */
export const ALL_ENTERPRISE_ROLES = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMINISTRATOR,
    ROLES.WAREHOUSE_MANAGER,
    ROLES.INVENTORY_MANAGER,
    ROLES.ORDER_MANAGER,
    ROLES.SUPPORT_REPRESENTATIVE,
    ROLES.DELIVERY_COORDINATOR,
    ROLES.FINANCE_MANAGER,
    ROLES.READ_ONLY_USER,
    ROLES.STORE_MANAGER,
    ROLES.OPERATION_HEAD,
    
    // Phase 6 Mapped Roles
    ROLES.DARK_HOUSE_MANAGER,
    ROLES.PROCUREMENT_MANAGER,
    ROLES.OPERATIONS_MANAGER,
    ROLES.VIEWER,
    ROLES.SELLER,

    // Excel Specific Role Groups
    ROLES.OPERATIONS,
    ROLES.INVENTORY,
    ROLES.PURCHASE,
    ROLES.LOGISTICS_DELIVERY,
    ROLES.CUSTOMER_SUPPORT,
    ROLES.SALES_BUSINESS,
    ROLES.MARKETING,
    ROLES.FINANCE_ACCOUNTS,
    ROLES.HUMAN_RESOURCES,
    ROLES.INFORMATION_TECHNOLOGY,
    ROLES.ADMINISTRATION
];

/** Roles with access to admin-only operations (orders, inventory, analytics, etc.) */
export const ADMIN_ONLY_ROLES = [ROLES.ADMINISTRATOR, ROLES.SUPER_ADMIN];

