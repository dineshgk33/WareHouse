export const PERMISSION_CATEGORIES = [
    "Inventory Management",
    "Orders Management",
    "Customers",
    "Darkhouses",
    "Analytics",
    "Billing",
    "Settings",
    "User Management",
];

/** Categories shown in read-only View Permissions modal */
export const VIEW_PERMISSION_CATEGORIES = [
    "Inventory Management",
    "Orders Management",
    "Customers",
    "Darkhouses",
    "Analytics",
    "Billing",
    "Settings",
];

const withCategory = (category, permissions) =>
    permissions.map((permission) => ({ category, permission }));

const INVENTORY = withCategory("Inventory Management", [
    "View Inventory",
    "Manage Inventory",
    "Delete Inventory",
    "Adjust Stock Levels",
]);

const ORDERS = withCategory("Orders Management", [
    "View Orders",
    "Update Order Status",
    "Generate Labels",
    "Print Labels",
    "Delete Orders",
]);

const CUSTOMERS = withCategory("Customers", [
    "View Customers",
    "Edit Customer Profiles",
    "Verify Customers",
]);

const DARKHOUSES = withCategory("Darkhouses", [
    "View Darkhouses",
    "Manage Darkhouses",
]);

const ANALYTICS = withCategory("Analytics", [
    "View Analytics",
    "Export Analytics Reports",
]);

const BILLING = withCategory("Billing", [
    "View Billing",
    "Manage Billing Plans",
    "View Invoices",
]);

const SETTINGS = withCategory("Settings", [
    "View Settings",
    "Edit Role",
    "Create Role",
    "Delete Role",
]);

const USER_MANAGEMENT = withCategory("User Management", [
    "View Users",
    "Manage Users",
    "Assign User Roles",
]);

const ALL = [
    ...INVENTORY,
    ...ORDERS,
    ...CUSTOMERS,
    ...DARKHOUSES,
    ...ANALYTICS,
    ...BILLING,
    ...SETTINGS,
    ...USER_MANAGEMENT,
].map(({ permission }) => permission);

export const DEFAULT_ROLES = [
    {
        id: "super-admin",
        name: "Super Admin",
        description: "Full platform ownership with unrestricted access across all modules.",
        badge: "SA",
        badgeClass: "super-admin",
        permissions: ALL,
    },
    {
        id: "warehouse-manager",
        name: "Warehouse Manager",
        description: "Oversees stock movement, darkhouse operations, and order fulfillment.",
        badge: "WM",
        badgeClass: "admin",
        permissions: [
            "View Inventory",
            "Manage Inventory",
            "Adjust Stock Levels",
            "View Orders",
            "Update Order Status",
            "Generate Labels",
            "Print Labels",
            "View Darkhouses",
            "Manage Darkhouses",
            "View Customers",
            "View Analytics",
            "View Settings",
        ],
    },
    {
        id: "inventory-manager",
        name: "Inventory Manager",
        description: "Maintains inventory records, stock adjustments, and shelf-level accuracy.",
        badge: "IM",
        badgeClass: "admin",
        permissions: [
            "View Inventory",
            "Manage Inventory",
            "Adjust Stock Levels",
            "View Orders",
            "View Darkhouses",
            "View Analytics",
        ],
    },
    {
        id: "order-manager",
        name: "Order Manager",
        description: "Handles order processing, shipping labels, and fulfillment status updates.",
        badge: "OM",
        badgeClass: "admin",
        permissions: [
            "View Orders",
            "Update Order Status",
            "Generate Labels",
            "Print Labels",
            "View Customers",
            "View Inventory",
            "View Analytics",
        ],
    },
    {
        id: "support-representative",
        name: "Support Representative",
        description: "Read-focused access to customer and order workflows for daily support.",
        badge: "SR",
        badgeClass: "support",
        permissions: [
            "View Orders",
            "View Customers",
            "Verify Customers",
            "View Billing",
            "View Invoices",
            "View Analytics",
            "View Settings",
        ],
    },
    {
        id: "delivery-coordinator",
        name: "Delivery Coordinator",
        description: "Coordinates dispatch operations, shipment tracking, and delivery handoffs.",
        badge: "DC",
        badgeClass: "support",
        permissions: [
            "View Orders",
            "Update Order Status",
            "Generate Labels",
            "Print Labels",
            "View Customers",
        ],
    },
    {
        id: "finance-manager",
        name: "Finance Manager",
        description: "Owns billing, invoicing, and financial visibility across warehouse operations.",
        badge: "FM",
        badgeClass: "admin",
        permissions: [
            "View Billing",
            "Manage Billing Plans",
            "View Invoices",
            "View Analytics",
            "Export Analytics Reports",
            "View Orders",
            "View Settings",
        ],
    },
    {
        id: "read-only-user",
        name: "Read Only User",
        description: "Observation-only role for stakeholders who need visibility without control.",
        badge: "RO",
        badgeClass: "support",
        permissions: [
            "View Inventory",
            "View Orders",
            "View Customers",
            "View Darkhouses",
            "View Analytics",
            "View Billing",
            "View Settings",
        ],
    },
];

export const getPermissionsByCategory = (permissions = []) =>
    PERMISSION_CATEGORIES.reduce((acc, category) => {
        acc[category] = [];
        return acc;
    }, {});

export const ALL_PERMISSION_ENTRIES = [
    ...INVENTORY,
    ...ORDERS,
    ...CUSTOMERS,
    ...DARKHOUSES,
    ...ANALYTICS,
    ...BILLING,
    ...SETTINGS,
    ...USER_MANAGEMENT,
];
