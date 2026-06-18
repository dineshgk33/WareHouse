import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { getFallbackAccessiblePages } from '../src/utils/rbacFallback.js';

// Color logging helpers
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;

console.log(blue("\n========================================================"));
console.log(blue("   HAATZA RBAC Module-by-Module Integration Tests      "));
console.log(blue("========================================================\n"));

// Read App.jsx to extract all registered routes
const appJsxContent = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8');

// Simple helper to check if a route is registered in App.jsx
function hasRouteInApp(targetPath) {
    // Normalize targetPath (e.g. "/operations/order-picking" -> "operations/order-picking")
    const cleanPath = targetPath.startsWith('/') ? targetPath.substring(1) : targetPath;
    
    // Look for exact matches in route declaration like: path="operations/order-picking"
    // Handle tab query parameters by stripping them for base route check
    const basePath = cleanPath.split('?')[0];
    const pathRegexp = new RegExp(`path=["']${basePath}["']`, 'i');
    
    // Special exceptions where Route index is used for "/"
    if (basePath === "") {
        return appJsxContent.includes('path="dashboard"') || appJsxContent.includes('Route index');
    }
    
    return pathRegexp.test(appJsxContent);
}

// Emulate Sidebar routing logic inside test
function getRouteForPage(pageId, pageName, moduleName, roleName) {
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
    if (id === "DASHBOARD") return "/";
    return `/${id.toLowerCase().replace(/_/g, "-")}`;
}

const MODULES_TO_TEST = [
    {
        role: "Operations",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Order Management", module: "Operations", id: "ORDERS" },
            { name: "Order Picking", module: "Operations", id: "OPERATIONS_ORDER_PICKING" },
            { name: "Order Packing", module: "Operations", id: "OPERATIONS_ORDER_PACKING" },
            { name: "Store Operations", module: "Operations", id: "OPERATIONS_STORE_OPERATIONS" },
            { name: "Shift Management", module: "Operations", id: "OPERATIONS_SHIFT_MANAGEMENT" },
            { name: "Workforce Management", module: "Operations", id: "OPERATIONS_WORKFORCE_MANAGEMENT" },
            { name: "Performance Reports", module: "Operations", id: "OPERATIONS_PERFORMANCE_REPORTS" },
            { name: "Support", module: "Operations", id: "OPERATIONS_SUPPORT" },
            { name: "Reports", module: "Operations", id: "REPORTS" }
        ]
    },
    {
        role: "Inventory",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Inventory Management", module: "Inventory", id: "WAREHOUSE_INVENTORY" },
            { name: "Stock Inward", module: "Inventory", id: "INVENTORY_STOCK_INWARD" },
            { name: "Stock Transfer", module: "Inventory", id: "STOCK_TRANSFERS" },
            { name: "Stock Adjustment", module: "Inventory", id: "INVENTORY_STOCK_ADJUSTMENT" },
            { name: "Inventory Audit", module: "Inventory", id: "INVENTORY_INVENTORY_AUDIT" },
            { name: "Bin Location Management", module: "Inventory", id: "INVENTORY_BIN_LOCATION_MANAGEMENT" },
            { name: "Expiry Management", module: "Inventory", id: "INVENTORY_EXPIRY_MANAGEMENT" },
            { name: "Low Stock Alerts", module: "Inventory", id: "INVENTORY_LOW_STOCK_ALERTS" },
            { name: "Support", module: "Inventory", id: "INVENTORY_SUPPORT" },
            { name: "Reports", module: "Inventory", id: "REPORTS" }
        ]
    },
    {
        role: "Purchase",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Vendor Management", module: "Purchase", id: "PURCHASE_VENDOR_PAYMENTS_STATUS" },
            { name: "Purchase Requests", module: "Purchase", id: "INDENT" },
            { name: "Purchase Orders", module: "Purchase", id: "PURCHASE" },
            { name: "Goods Receipt (GRN)", module: "Purchase", id: "GRN" },
            { name: "Vendor Payments Status", module: "Purchase", id: "PURCHASE_VENDOR_PAYMENTS_STATUS" },
            { name: "Purchase Reports", module: "Purchase", id: "PURCHASE_REPORTS" },
            { name: "Support", module: "Purchase", id: "PURCHASE_SUPPORT" },
            { name: "Reports", module: "Purchase", id: "REPORTS" }
        ]
    },
    {
        role: "Logistics & Delivery",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Delivery Assignment", module: "Logistics & Delivery", id: "LOGISTICS_DELIVERY_ASSIGNMENT" },
            { name: "Delivery Tracking", module: "Logistics & Delivery", id: "LOGISTICS_DELIVERY_TRACKING" },
            { name: "Rider Management", module: "Logistics & Delivery", id: "LOGISTICS_RIDER_MANAGEMENT" },
            { name: "Route Management", module: "Logistics & Delivery", id: "LOGISTICS_ROUTE_MANAGEMENT" },
            { name: "Delivery Reports", module: "Logistics & Delivery", id: "LOGISTICS_DELIVERY_REPORTS" },
            { name: "Return Pickup Management", module: "Logistics & Delivery", id: "LOGISTICS_RETURN_PICKUP_MANAGEMENT" },
            { name: "Support", module: "Logistics & Delivery", id: "LOGISTICS_SUPPORT" },
            { name: "Reports", module: "Logistics & Delivery", id: "REPORTS" }
        ]
    },
    {
        role: "Customer Support",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Customer Tickets", module: "Customer Support", id: "CUSTOMER_SUPPORT_CUSTOMER_TICKETS" },
            { name: "Order Lookup", module: "Customer Support", id: "ORDERS" },
            { name: "Refund Requests", module: "Customer Support", id: "CUSTOMER_SUPPORT_REFUND_REQUESTS" },
            { name: "Return Requests", module: "Customer Support", id: "CUSTOMER_SUPPORT_RETURN_REQUESTS" },
            { name: "Complaint Management", module: "Customer Support", id: "CUSTOMER_SUPPORT_COMPLAINT_MANAGEMENT" },
            { name: "Customer Chat", module: "Customer Support", id: "CUSTOMER_SUPPORT_CUSTOMER_CHAT" },
            { name: "Customer Feedback", module: "Customer Support", id: "CUSTOMER_SUPPORT_CUSTOMER_FEEDBACK" },
            { name: "Support", module: "Customer Support", id: "CUSTOMER_SUPPORT_SUPPORT" },
            { name: "Reports", module: "Customer Support", id: "REPORTS" }
        ]
    },
    {
        role: "Sales & Business",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Merchant Management", module: "Sales & Business", id: "SALES_BUSINESS_MERCHANT_MANAGEMENT" },
            { name: "Partner Management", module: "Sales & Business", id: "SALES_BUSINESS_PARTNER_MANAGEMENT" },
            { name: "Leads Management", module: "Sales & Business", id: "SALES_BUSINESS_LEADS_MANAGEMENT" },
            { name: "Business Opportunities", module: "Sales & Business", id: "SALES_BUSINESS_BUSINESS_OPPORTUNITIES" },
            { name: "Sales Reports", module: "Sales & Business", id: "SALES_BUSINESS_SALES_REPORTS" },
            { name: "Expansion Planning", module: "Sales & Business", id: "SALES_BUSINESS_EXPANSION_PLANNING" },
            { name: "Support", module: "Sales & Business", id: "SALES_BUSINESS_SUPPORT" },
            { name: "Reports", module: "Sales & Business", id: "REPORTS" }
        ]
    },
    {
        role: "Marketing",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Campaign Management", module: "Marketing", id: "MARKETING_CAMPAIGN_MANAGEMENT" },
            { name: "Coupons & Offers", module: "Marketing", id: "MARKETING_COUPONS_OFFERS" },
            { name: "Banner Management", module: "Marketing", id: "MARKETING_BANNER_MANAGEMENT" },
            { name: "Push Notifications", module: "Marketing", id: "MARKETING_PUSH_NOTIFICATIONS" },
            { name: "Customer Segmentation", module: "Marketing", id: "MARKETING_CUSTOMER_SEGMENTATION" },
            { name: "Marketing Analytics", module: "Marketing", id: "MARKETING_MARKETING_ANALYTICS" },
            { name: "Support", module: "Marketing", id: "MARKETING_SUPPORT" },
            { name: "Reports", module: "Marketing", id: "REPORTS" }
        ]
    },
    {
        role: "Finance & Accounts",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Vendor Payments", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_VENDOR_PAYMENTS" },
            { name: "Customer Refunds", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_CUSTOMER_REFUNDS" },
            { name: "Settlements", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_SETTLEMENTS" },
            { name: "Revenue Reports", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_REVENUE_REPORTS" },
            { name: "Expense Management", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_EXPENSE_MANAGEMENT" },
            { name: "GST Reports", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_GST_REPORTS" },
            { name: "Profit & Loss Reports", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_PROFIT_LOSS_REPORTS" },
            { name: "Wallet Management", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_WALLET_MANAGEMENT" },
            { name: "Support", module: "Finance & Accounts", id: "FINANCE_ACCOUNTS_SUPPORT" },
            { name: "Reports", module: "Finance & Accounts", id: "REPORTS" }
        ]
    },
    {
        role: "Human Resources",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Employee Management", module: "Human Resources", id: "EMPLOYEES" },
            { name: "Attendance", module: "Human Resources", id: "HR_ATTENDANCE" },
            { name: "Leave Management", module: "Human Resources", id: "HR_LEAVE_MANAGEMENT" },
            { name: "Payroll", module: "Human Resources", id: "HR_PAYROLL" },
            { name: "Recruitment", module: "Human Resources", id: "HR_RECRUITMENT" },
            { name: "Performance Reviews", module: "Human Resources", id: "HR_PERFORMANCE_REVIEWS" },
            { name: "Offer Letters", module: "Human Resources", id: "HR_OFFER_LETTERS" },
            { name: "Support", module: "Human Resources", id: "HR_SUPPORT" },
            { name: "Reports", module: "Human Resources", id: "REPORTS" }
        ]
    },
    {
        role: "Information Technology",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "User Management", module: "Information Technology", id: "ADMIN" },
            { name: "Role & Permissions", module: "Information Technology", id: "ADMIN" },
            { name: "API Logs", module: "Information Technology", id: "IT_API_LOGS" },
            { name: "System Logs", module: "Information Technology", id: "IT_SYSTEM_LOGS" },
            { name: "Device Management", module: "Information Technology", id: "IT_DEVICE_MANAGEMENT" },
            { name: "Security Settings", module: "Information Technology", id: "IT_SECURITY_SETTINGS" },
            { name: "Application Settings", module: "Information Technology", id: "IT_APPLICATION_SETTINGS" },
            { name: "Support", module: "Information Technology", id: "IT_SUPPORT" },
            { name: "Reports", module: "Information Technology", id: "REPORTS" }
        ]
    },
    {
        role: "Administration",
        pages: [
            { name: "Dashboard", module: "Dashboard", id: "DASHBOARD" },
            { name: "Asset Management", module: "Administration", id: "ADMINISTRATION_ASSET_MANAGEMENT" },
            { name: "Facility Management", module: "Administration", id: "ADMINISTRATION_FACILITY_MANAGEMENT" },
            { name: "Office Supplies", module: "Administration", id: "ADMINISTRATION_OFFICE_SUPPLIES" },
            { name: "Vehicle Management", module: "Administration", id: "ADMINISTRATION_VEHICLE_MANAGEMENT" },
            { name: "General Administration", module: "Administration", id: "ADMINISTRATION_GENERAL_ADMINISTRATION" },
            { name: "Support", module: "Administration", id: "ADMINISTRATION_SUPPORT" },
            { name: "Reports", module: "Administration", id: "REPORTS" }
        ]
    }
];

let failedTests = 0;
let totalTests = 0;

for (const mod of MODULES_TO_TEST) {
    console.log(blue(`--- Testing Role: "${mod.role}" ---`));
    
    // Retrievefallback accessible pages list
    const fallbackPages = getFallbackAccessiblePages(mod.role);
    
    // Test 1: Check that the exact page names and count match fallback mapping
    try {
        totalTests++;
        assert.ok(fallbackPages.length > 0, `Fallback pages for ${mod.role} must not be empty`);
        
        // Assert every page in expectation list exists in fallback list
        for (const expectedPage of mod.pages) {
            const match = fallbackPages.find(p => p.pageId === expectedPage.id && p.pageName === expectedPage.name);
            assert.ok(match, `Missing page permission: "${expectedPage.name}" (Page ID: "${expectedPage.id}") for role "${mod.role}"`);
        }
        console.log(`  ${green("✓ PASS")} : Fallback permission mapping contains all expected pages (${mod.pages.length} pages)`);
    } catch (err) {
        failedTests++;
        console.error(`  ${red("✗ FAIL")} : Fallback permission mapping verification failed`);
        console.error(`         ${err.message}`);
    }

    // Test 2: Check route generation and App.jsx matching
    for (const expectedPage of mod.pages) {
        totalTests++;
        try {
            const resolvedRoute = getRouteForPage(expectedPage.id, expectedPage.name, expectedPage.module, mod.role);
            assert.ok(resolvedRoute, `Sidebar path resolver returned empty path for: "${expectedPage.name}"`);
            
            const routeExists = hasRouteInApp(resolvedRoute);
            assert.ok(routeExists, `No route matching path: "${resolvedRoute}" found in App.jsx for "${expectedPage.name}"`);
            console.log(`  ${green("✓ PASS")} : Page "${expectedPage.name}" maps to route "${resolvedRoute}"`);
        } catch (err) {
            failedTests++;
            console.error(`  ${red("✗ FAIL")} : Route checking failed for page: "${expectedPage.name}"`);
            console.error(`         ${err.message}`);
        }
    }
    console.log();
}

console.log(blue("========================================================"));
console.log(`Test Execution Finished: ${totalTests - failedTests}/${totalTests} checks passed.`);
console.log(blue("========================================================\n"));

if (failedTests === 0) {
    process.exit(0);
} else {
    process.exit(1);
}
