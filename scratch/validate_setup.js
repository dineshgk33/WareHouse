// validate_setup.js - Automated validation script for HAATZA Role and Route configuration
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getFallbackAccessiblePages } from "../src/utils/rbacFallback.js";
import { ROLES, ALL_ENTERPRISE_ROLES } from "../src/constants/roles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

console.log(blue("\n========================================================"));
console.log(blue("         HAATZA RBAC & Route Setup Validator            "));
console.log(blue("========================================================\n"));

let failures = 0;

function assertCondition(condition, message) {
    if (condition) {
        console.log(`${green("✓ PASS")} : ${message}`);
    } else {
        console.error(`${red("✗ FAIL")} : ${message}`);
        failures++;
    }
}

// 1. Validate Roles Configuration
console.log(yellow("--- 1. Validating Role Constants ---"));
const expectedRoles = [
    "SUPER_ADMIN", "ADMINISTRATOR", "WAREHOUSE_MANAGER", "INVENTORY_MANAGER",
    "DARK_HOUSE_MANAGER", "PROCUREMENT_MANAGER", "OPERATIONS_MANAGER", "VIEWER", "SELLER",
    "OPERATIONS", "INVENTORY", "PURCHASE", "LOGISTICS_DELIVERY", "CUSTOMER_SUPPORT",
    "SALES_BUSINESS", "MARKETING", "FINANCE_ACCOUNTS", "HUMAN_RESOURCES",
    "INFORMATION_TECHNOLOGY", "ADMINISTRATION"
];

for (const roleKey of expectedRoles) {
    assertCondition(ROLES[roleKey] !== undefined, `Role constant ROLES.${roleKey} is defined`);
}

// Verify all roles are in ALL_ENTERPRISE_ROLES
for (const key of Object.keys(ROLES)) {
    const val = ROLES[key];
    assertCondition(ALL_ENTERPRISE_ROLES.includes(val), `ALL_ENTERPRISE_ROLES includes "${val}"`);
}

// 2. Validate RBAC Fallback mappings
console.log(yellow("\n--- 2. Validating RBAC Fallback Matrix ---"));
const allUniquePageIds = new Set();

for (const roleVal of ALL_ENTERPRISE_ROLES) {
    const pages = getFallbackAccessiblePages(roleVal);
    assertCondition(Array.isArray(pages) && pages.length > 0, `getFallbackAccessiblePages returns pages for role "${roleVal}"`);
    
    // Check that each page returned has valid structure
    let validStructure = true;
    for (const p of pages) {
        if (!p.pageId || !p.pageName || !p.moduleName || p.canView === undefined) {
            validStructure = false;
        }
        allUniquePageIds.add(p.pageId);
    }
    assertCondition(validStructure, `All pages for role "${roleVal}" have correct schema keys`);
}

// 3. Parse App.jsx to find pageId references
console.log(yellow("\n--- 3. Verifying Routes exist for Page IDs ---"));
const appJsxPath = path.join(rootDir, "src", "App.jsx");
const appJsxContent = fs.readFileSync(appJsxPath, "utf-8");

// We check if all page IDs in our fallback matrix are protected or defined in App.jsx
// pageId can be checked in App.jsx as: pageId="PAGE_ID" or pageId={["PAGE_ID", ...]} or similar.
for (const pageId of allUniquePageIds) {
    // Exception: DASHBOARD is the root route, which is checked
    if (pageId === "DASHBOARD") {
        assertCondition(appJsxContent.includes('pageId="DASHBOARD"'), `App.jsx guards DASHBOARD page`);
        continue;
    }
    
    // Verify if pageId is present in App.jsx (guarded by ProtectedRoute)
    const isGuarded = appJsxContent.includes(pageId);
    assertCondition(isGuarded, `App.jsx registers route/guard for Page ID: "${pageId}"`);
}

// 4. Verify Sidebar Mappings
console.log(yellow("\n--- 4. Validating Sidebar Mappings ---"));
const sidebarPath = path.join(rootDir, "src", "components", "Sidebar", "Sidebar.jsx");
const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");

// Ensure getRouteForPage handles our custom module prefixes
assertCondition(sidebarContent.includes('id.startsWith("OPERATIONS_")'), "Sidebar resolves OPERATIONS_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("INVENTORY_")'), "Sidebar resolves INVENTORY_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("PURCHASE_")'), "Sidebar resolves PURCHASE_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("LOGISTICS_")'), "Sidebar resolves LOGISTICS_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("CUSTOMER_SUPPORT_")'), "Sidebar resolves CUSTOMER_SUPPORT_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("SALES_BUSINESS_")'), "Sidebar resolves SALES_BUSINESS_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("MARKETING_")'), "Sidebar resolves MARKETING_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("FINANCE_ACCOUNTS_")'), "Sidebar resolves FINANCE_ACCOUNTS_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("HR_")'), "Sidebar resolves HR_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("IT_")'), "Sidebar resolves IT_ prefix");
assertCondition(sidebarContent.includes('id.startsWith("ADMINISTRATION_")'), "Sidebar resolves ADMINISTRATION_ prefix");

console.log(blue("\n========================================================"));
if (failures === 0) {
    console.log(green("SUCCESS: All system validation checks passed! 100% operational."));
    console.log(blue("========================================================\n"));
    process.exit(0);
} else {
    console.error(red(`FAILURE: ${failures} checks failed. Please review errors above.`));
    console.log(blue("========================================================\n"));
    process.exit(1);
}
