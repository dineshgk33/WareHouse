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
];

/** Roles with access to admin-only operations (orders, inventory, analytics, etc.) */
export const ADMIN_ONLY_ROLES = [ROLES.ADMINISTRATOR];
