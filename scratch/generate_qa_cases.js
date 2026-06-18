// generate_qa_cases.js - Generates QA test cases for all pages and roles
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFallbackAccessiblePages } from "../src/utils/rbacFallback.js";
import { ROLES, ALL_ENTERPRISE_ROLES } from "../src/constants/roles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");
const brainDir = "C:/Users/HP/.gemini/antigravity/brain/ef5a2737-1bf8-4510-a62e-4e3a3de83979";

const moduleMapping = {
    "OPERATIONS_ORDER_PICKING": { name: "Order Picking", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Order Picking.\n3. Verify picked items status, active pickers count, and table entries.", expected: "Order Picking page loads with active picker statistics and zone-wise pick list." },
    "OPERATIONS_ORDER_PACKING": { name: "Order Packing", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Order Packing.\n3. Verify station count, packing weight indicators, and packed list.", expected: "Order Packing page loads with station-wise weights and packing statuses." },
    "OPERATIONS_STORE_OPERATIONS": { name: "Store Operations", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Store Operations.\n3. Verify store statistics and active logs.", expected: "Store Operations dashboard loads with operational KPIs." },
    "OPERATIONS_SHIFT_MANAGEMENT": { name: "Shift Management", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Shift Management.\n3. Verify shift timings, active personnel, and schedules.", expected: "Shift Management page loads with shift timelines and lists." },
    "OPERATIONS_WORKFORCE_MANAGEMENT": { name: "Workforce Management", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Workforce Management.\n3. Verify employee assignments and task statuses.", expected: "Workforce Management dashboard loads successfully." },
    "OPERATIONS_PERFORMANCE_REPORTS": { name: "Performance Reports", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Performance Reports.\n3. Verify timeline line chart showing productivity.", expected: "Operations performance report is rendered with interactive chart." },
    "OPERATIONS_SUPPORT": { name: "Support", module: "Operations", steps: "1. Log in as Operations Manager.\n2. Navigate to Operations -> Support.\n3. Verify contact forms or ticket reference log.", expected: "Operations support portal loads successfully." },
    "INVENTORY_STOCK_INWARD": { name: "Stock Inward", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Stock Inward.\n3. Verify stock receipt ledger and pending inward receipts.", expected: "Stock Inward ledger loads showing items received in warehouse." },
    "INVENTORY_STOCK_ADJUSTMENT": { name: "Stock Adjustment", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Stock Adjustment.\n3. Verify adjustment reasons, SKUs, and discrepancy counts.", expected: "Stock Adjustment console displays recent inventory adjustment records." },
    "INVENTORY_INVENTORY_AUDIT": { name: "Inventory Audit", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Inventory Audit.\n3. Verify stock count sheets and variance percentages.", expected: "Inventory Audit log sheet loads correctly." },
    "INVENTORY_BIN_LOCATION_MANAGEMENT": { name: "Bin Location Management", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Bin Location Management.\n3. Verify bin codes, shelf locations, and capacity stats.", expected: "Bin location matrix loads with allocated bin metrics." },
    "INVENTORY_EXPIRY_MANAGEMENT": { name: "Expiry Management", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Expiry Management.\n3. Verify short-expiry items list and discard logs.", expected: "Expiry management panel flags near-expiry products clearly." },
    "INVENTORY_LOW_STOCK_ALERTS": { name: "Low Stock Alerts", icon: "AlertCircle", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Low Stock Alerts.\n3. Verify items below reorder points.", expected: "Low Stock Alerts panel shows products requiring immediate replenishment." },
    "INVENTORY_SUPPORT": { name: "Support", module: "Inventory", steps: "1. Log in as Inventory Manager.\n2. Navigate to Inventory -> Support.\n3. Verify ticketing contact interface.", expected: "Inventory Support page loads." },
    "PURCHASE_VENDOR_PAYMENTS_STATUS": { name: "Vendor Payments Status", module: "Purchase", steps: "1. Log in as Procurement Manager.\n2. Navigate to Purchase -> Vendor Payments Status.\n3. Verify disbursed amounts, pending approvals, and transaction tables.", expected: "Vendor payments summary dashboard shows accurate financial details." },
    "PURCHASE_REPORTS": { name: "Purchase Reports", module: "Purchase", steps: "1. Log in as Procurement Manager.\n2. Navigate to Purchase -> Purchase Reports.\n3. Verify report timeline and export option.", expected: "Purchase reports console renders with options to download XLS/CSV." },
    "PURCHASE_SUPPORT": { name: "Support", module: "Purchase", steps: "1. Log in as Procurement Manager.\n2. Navigate to Purchase -> Support.\n3. Verify contact info and feedback panel.", expected: "Purchase support dashboard renders correctly." },
    "LOGISTICS_DELIVERY_ASSIGNMENT": { name: "Delivery Assignment", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Delivery Assignment.\n3. Verify assignable rider lists and pending orders.", expected: "Delivery Assignment portal allows mapping riders to orders." },
    "LOGISTICS_DELIVERY_TRACKING": { name: "Delivery Tracking", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Delivery Tracking.\n3. Verify active delivery map coordinates and statuses.", expected: "Live Delivery Tracking screen displays delivery transit times." },
    "LOGISTICS_RIDER_MANAGEMENT": { name: "Rider Management", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Rider Management.\n3. Verify rider profile metrics, vehicle numbers, and statuses.", expected: "Rider database records display details of present and off-duty riders." },
    "LOGISTICS_ROUTE_MANAGEMENT": { name: "Route Management", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Route Management.\n3. Verify optimized routes and geofences.", expected: "Route Management console shows route definitions." },
    "LOGISTICS_DELIVERY_REPORTS": { name: "Delivery Reports", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Delivery Reports.\n3. Verify daily delivery SLA charts.", expected: "Delivery performance reports timeline chart renders correctly." },
    "LOGISTICS_RETURN_PICKUP_MANAGEMENT": { name: "Return Pickup Management", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Return Pickup Management.\n3. Verify reverse logistics requests.", expected: "Return Pickups log list loads correctly." },
    "LOGISTICS_SUPPORT": { name: "Support", module: "Logistics & Delivery", steps: "1. Log in as Logistics role.\n2. Navigate to Logistics & Delivery -> Support.\n3. Verify support form.", expected: "Logistics Support page loads." },
    "CUSTOMER_SUPPORT_CUSTOMER_TICKETS": { name: "Customer Tickets", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Customer Tickets.\n3. Verify ticket ID status, customer names, and priorities.", expected: "Customer support tickets display properly." },
    "CUSTOMER_SUPPORT_ORDER_LOOKUP": { name: "Order Lookup", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Order Lookup.\n3. Verify search box and order query options.", expected: "Order lookup portal allows searching order logs." },
    "CUSTOMER_SUPPORT_REFUND_REQUESTS": { name: "Refund Requests", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Refund Requests.\n3. Verify refund status and refund amounts.", expected: "Refund requests ledger loads successfully." },
    "CUSTOMER_SUPPORT_RETURN_REQUESTS": { name: "Return Requests", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Return Requests.\n3. Verify return reasons and verification items.", expected: "Return requests ledger loads successfully." },
    "CUSTOMER_SUPPORT_COMPLAINT_MANAGEMENT": { name: "Complaint Management", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Complaint Management.\n3. Verify grievance records.", expected: "Complaint logs display correctly." },
    "CUSTOMER_SUPPORT_CUSTOMER_CHAT": { name: "Customer Chat", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Customer Chat.\n3. Verify customer chat windows and active threads.", expected: "Live chat panel displays correctly." },
    "CUSTOMER_SUPPORT_CUSTOMER_FEEDBACK": { name: "Customer Feedback", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Customer Feedback.\n3. Verify average rating stats.", expected: "Feedback summary loads successfully." },
    "CUSTOMER_SUPPORT_SUPPORT": { name: "Support", module: "Customer Support", steps: "1. Log in as Customer Support.\n2. Navigate to Customer Support -> Support.\n3. Verify support desk contact.", expected: "Support helpdesk interface loads." },
    "SALES_BUSINESS_MERCHANT_MANAGEMENT": { name: "Merchant Management", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Merchant Management.\n3. Verify verified merchant counts and transaction tables.", expected: "Merchant list loads successfully." },
    "SALES_BUSINESS_PARTNER_MANAGEMENT": { name: "Partner Management", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Partner Management.\n3. Verify onboarded retail partners and region tags.", expected: "Partner directory loads successfully." },
    "SALES_BUSINESS_LEADS_MANAGEMENT": { name: "Leads Management", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Leads Management.\n3. Verify leads pipeline table.", expected: "Sales leads database records render correctly." },
    "SALES_BUSINESS_BUSINESS_OPPORTUNITIES": { name: "Business Opportunities", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Business Opportunities.\n3. Verify active contracts.", expected: "Business opportunities board displays correctly." },
    "SALES_BUSINESS_SALES_REPORTS": { name: "Sales Reports", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Sales Reports.\n3. Verify line chart.", expected: "Sales performance reports load successfully." },
    "SALES_BUSINESS_EXPANSION_PLANNING": { name: "Expansion Planning", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Expansion Planning.\n3. Verify target warehouses.", expected: "Expansion planner dashboard loads correctly." },
    "SALES_BUSINESS_SUPPORT": { name: "Support", module: "Sales & Business", steps: "1. Log in as Sales role.\n2. Navigate to Sales & Business -> Support.\n3. Verify support form.", expected: "Sales & Business support portal loads." },
    "MARKETING_CAMPAIGN_MANAGEMENT": { name: "Campaign Management", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Campaign Management.\n3. Verify active marketing campaigns and CTR stats.", expected: "Campaign manager loads successfully." },
    "MARKETING_COUPONS_OFFERS": { name: "Coupons & Offers", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Coupons & Offers.\n3. Verify active promo codes and discount parameters.", expected: "Promo codes database displays successfully." },
    "MARKETING_BANNER_MANAGEMENT": { name: "Banner Management", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Banner Management.\n3. Verify active banners and impressions.", expected: "Banner placement dashboard loads correctly." },
    "MARKETING_PUSH_NOTIFICATIONS": { name: "Push Notifications", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Push Notifications.\n3. Verify sent push alerts and CTR logs.", expected: "Push notification dashboard displays successfully." },
    "MARKETING_CUSTOMER_SEGMENTATION": { name: "Customer Segmentation", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Customer Segmentation.\n3. Verify segment rules.", expected: "Customer cohorts dashboard loads correctly." },
    "MARKETING_MARKETING_ANALYTICS": { name: "Marketing Analytics", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Marketing Analytics.\n3. Verify campaign chart.", expected: "Marketing Analytics page loads successfully." },
    "MARKETING_SUPPORT": { name: "Support", module: "Marketing", steps: "1. Log in as Marketing role.\n2. Navigate to Marketing -> Support.\n3. Verify support form.", expected: "Marketing support portal loads." },
    "FINANCE_ACCOUNTS_VENDOR_PAYMENTS": { name: "Vendor Payments", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Vendor Payments.\n3. Verify payments grid.", expected: "Vendor accounts and transaction table loads." },
    "FINANCE_ACCOUNTS_CUSTOMER_REFUNDS": { name: "Customer Refunds", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Customer Refunds.\n3. Verify refund ledger.", expected: "Customer refund requests and approval queues render." },
    "FINANCE_ACCOUNTS_SETTLEMENTS": { name: "Settlements", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Settlements.\n3. Verify active settlements.", expected: "Daily ledger settlements display correctly." },
    "FINANCE_ACCOUNTS_REVENUE_REPORTS": { name: "Revenue Reports", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Revenue Reports.\n3. Verify revenue timeline.", expected: "Revenue report timeline renders correctly." },
    "FINANCE_ACCOUNTS_EXPENSE_MANAGEMENT": { name: "Expense Management", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Expense Management.\n3. Verify expenses logs.", expected: "Expense tracker dashboard loads correctly." },
    "FINANCE_ACCOUNTS_GST_REPORTS": { name: "GST Reports", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> GST Reports.\n3. Verify GST tax logs.", expected: "Tax filing details load successfully." },
    "FINANCE_ACCOUNTS_PROFIT_LOSS_REPORTS": { name: "Profit & Loss Reports", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Profit & Loss Reports.\n3. Verify monthly margins.", expected: "Profit & Loss dashboard renders." },
    "FINANCE_ACCOUNTS_WALLET_MANAGEMENT": { name: "Wallet Management", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Wallet Management.\n3. Verify user wallet balances.", expected: "Digital wallets list displays correctly." },
    "FINANCE_ACCOUNTS_SUPPORT": { name: "Support", module: "Finance & Accounts", steps: "1. Log in as Finance role.\n2. Navigate to Finance & Accounts -> Support.\n3. Verify support form.", expected: "Finance support page loads." },
    "HR_ATTENDANCE": { name: "Attendance", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Attendance.\n3. Verify clock-in metrics.", expected: "Attendance roster loads successfully." },
    "HR_LEAVE_MANAGEMENT": { name: "Leave Management", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Leave Management.\n3. Verify employee leave logs.", expected: "Leave application queue displays correctly." },
    "HR_PAYROLL": { name: "Payroll", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Payroll.\n3. Verify salary disbursement.", expected: "Payroll summaries register successfully." },
    "HR_RECRUITMENT": { name: "Recruitment", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Recruitment.\n3. Verify open roles.", expected: "Recruitment candidates pipeline loads." },
    "HR_PERFORMANCE_REVIEWS": { name: "Performance Reviews", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Performance Reviews.\n3. Verify scores.", expected: "Employee reviews board loads correctly." },
    "HR_OFFER_LETTERS": { name: "Offer Letters", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Offer Letters.\n3. Verify generated offers.", expected: "Offer letters directory renders correctly." },
    "HR_SUPPORT": { name: "Support", module: "Human Resources", steps: "1. Log in as Human Resources.\n2. Navigate to Human Resources -> Support.\n3. Verify support form.", expected: "HR support desk portal displays." },
    "IT_USER_MANAGEMENT": { name: "User Management", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> User Management.\n3. Verify active user accounts.", expected: "Active user registry displays correctly." },
    "IT_ROLE_PERMISSIONS": { name: "Role & Permissions", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> Role & Permissions.\n3. Verify permissions matrix.", expected: "Permissions mapping panel loads." },
    "IT_API_LOGS": { name: "API Logs", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> API Logs.\n3. Verify system request logs.", expected: "Live API logging dashboard renders successfully." },
    "IT_SYSTEM_LOGS": { name: "System Logs", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> System Logs.\n3. Verify server logs.", expected: "Server system logs displays successfully." },
    "IT_DEVICE_MANAGEMENT": { name: "Device Management", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> Device Management.\n3. Verify device status.", expected: "Device metrics console loads successfully." },
    "IT_SECURITY_SETTINGS": { name: "Security Settings", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> Security Settings.\n3. Verify active firewalls.", expected: "Security console displays correctly." },
    "IT_APPLICATION_SETTINGS": { name: "Application Settings", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> Application Settings.\n3. Verify configuration values.", expected: "Application parameters load." },
    "IT_SUPPORT": { name: "Support", module: "Information Technology", steps: "1. Log in as Information Technology.\n2. Navigate to Information Technology -> Support.\n3. Verify support form.", expected: "IT support desk renders successfully." },
    "ADMINISTRATION_ASSET_MANAGEMENT": { name: "Asset Management", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> Asset Management.\n3. Verify assets inventory.", expected: "Asset records table loads." },
    "ADMINISTRATION_FACILITY_MANAGEMENT": { name: "Facility Management", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> Facility Management.\n3. Verify store cleaning tasks.", expected: "Facility tracker dashboard loads." },
    "ADMINISTRATION_OFFICE_SUPPLIES": { name: "Office Supplies", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> Office Supplies.\n3. Verify supplies count.", expected: "Office stationery tracker displays." },
    "ADMINISTRATION_VEHICLE_MANAGEMENT": { name: "Vehicle Management", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> Vehicle Management.\n3. Verify vehicle logs.", expected: "Fleet maintenance dashboard renders." },
    "ADMINISTRATION_GENERAL_ADMINISTRATION": { name: "General Administration", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> General Administration.\n3. Verify logs.", expected: "General administration dashboard loads." },
    "ADMINISTRATION_SUPPORT": { name: "Support", module: "Administration", steps: "1. Log in as Administration.\n2. Navigate to Administration -> Support.\n3. Verify support form.", expected: "Admin support page loads." }
};

let mdContent = `# HAATZA Enterprise Portal - QA Test Cases Inventory

This document lists comprehensive test cases for functional and role-based page permission validations, covering the 11 modules and 9 role definitions defined in the master Excel source of truth.

## Section 1: Functional Page Test Cases

| TC ID | Module | Sub Module | Scenario | Steps | Expected Result | Priority | Status |
|---|---|---|---|---|---|---|---|
`;

let tcCounter = 1;

for (const key of Object.keys(moduleMapping)) {
    const item = moduleMapping[key];
    const tcId = `TC-FN-${String(tcCounter++).padStart(3, "0")}`;
    mdContent += `| ${tcId} | ${item.module} | ${item.name} | Initial Load and Statistics Display | ${item.steps.replace(/\n/g, "<br>")} | ${item.expected} | High | Ready |\n`;
}

mdContent += `\n## Section 2: Role-Based Access Control (RBAC) Permission Test Cases\n\n`;
mdContent += `| TC ID | Role under Test | Scenario | Steps | Expected Result | Priority | Status |\n`;
mdContent += `|---|---|---|---|---|---|---|\n`;

let rbacCounter = 1;

for (const roleVal of ALL_ENTERPRISE_ROLES) {
    const rbacId = `TC-RBAC-${String(rbacCounter++).padStart(3, "0")}`;
    const pages = getFallbackAccessiblePages(roleVal);
    const pageNames = pages.map(p => p.pageName).join(", ");
    
    mdContent += `| ${rbacId} | ${roleVal} | Verify Allowed Sidebar Menus and Access | 1. Log in to the application as "${roleVal}" using simulated login bypass.<br>2. Inspect the sidebar menus.<br>3. Verify allowed submenus are present.<br>4. Attempt to access a random restricted route. | Allowed pages are rendered in sidebar navigation:<br>[${pageNames.substring(0, 100)}...].<br>Attempting to access unauthorized route redirects to \`/unauthorized\`. | Critical | Ready |\n`;
}

// Write the file to artifacts directory
const outputPath = path.join(brainDir, "test_cases_inventory.md");
fs.writeFileSync(outputPath, mdContent, "utf-8");
console.log(`Successfully generated QA test cases inventory artifact at: ${outputPath}`);
