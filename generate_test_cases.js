import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testCases = [
  // ----------------------------------------------------
  // LOGIN MODULE (Custom Test Cases provided by User)
  // ----------------------------------------------------
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-01",
    "Development Test Scenario": "Initial UI Load",
    "Test Steps": "Open the Login screen",
    "Expected Result": "Logo, welcome text, input label, text field, and button render correctly.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-02",
    "Development Test Scenario": "Validate empty email/mobile input",
    "Test Steps": "Tap Continue without entering data",
    "Expected Result": "Error message: “This field is required”.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-03",
    "Development Test Scenario": "Validate mobile number format",
    "Test Steps": "Enter less than 10 digits or more",
    "Expected Result": "Error: “Enter a valid 10-digit mobile number”.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-04",
    "Development Test Scenario": "Validate email format",
    "Test Steps": "Enter invalid email (ex: abc@)",
    "Expected Result": "Error: “Enter a valid email”.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-05",
    "Development Test Scenario": "Detect mobile input",
    "Test Steps": "Enter numbers only",
    "Expected Result": "UI switches to OTP mode after Continue.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-06",
    "Development Test Scenario": "Detect email input",
    "Test Steps": "Enter valid email",
    "Expected Result": "UI switches to Password mode after Continue.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-07",
    "Development Test Scenario": "Password validation",
    "Test Steps": "Enter short password (<6)",
    "Expected Result": "Error: “Password must be at least 6 characters”.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-08",
    "Development Test Scenario": "Password visibility toggle",
    "Test Steps": "Tap visibility icon",
    "Expected Result": "Password field toggles between hidden/visible.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-09",
    "Development Test Scenario": "Forgot Password navigation",
    "Test Steps": "Tap “Forgot Password?”",
    "Expected Result": "Navigates to Forgotpasswordview screen.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-10",
    "Development Test Scenario": "Change Email",
    "Test Steps": "Tap \"Change Email\"",
    "Expected Result": "Returns to Email/Mobile input mode and clears password.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-11",
    "Development Test Scenario": "OTP input validation",
    "Test Steps": "Leave OTP empty and tap Verify",
    "Expected Result": "Error: “Please Fill OTP”.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-12",
    "Development Test Scenario": "OTP entry",
    "Test Steps": "Enter valid 6-digit OTP",
    "Expected Result": "onCompleted triggers and validates OTP.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-13",
    "Development Test Scenario": "Resend OTP timer",
    "Test Steps": "Wait for countdown to finish",
    "Expected Result": "“Resend OTP” becomes clickable.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-14",
    "Development Test Scenario": "Register navigation",
    "Test Steps": "Tap “Register for New Account”",
    "Expected Result": "Navigates to Register view.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-15",
    "Development Test Scenario": "Login Function Trigger",
    "Test Steps": "Enter valid email + password, tap Login",
    "Expected Result": "Calls login(context) successfully.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Login",
    "Development Test Case ID": "TC-LG-16",
    "Development Test Scenario": "OTP Verification Trigger",
    "Test Steps": "Enter mobile + OTP, tap Verify",
    "Expected Result": "Triggers verifyotp() successfully.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },

  // ----------------------------------------------------
  // WAREHOUSE SELECTION MODULE
  // ----------------------------------------------------
  {
    "Module": "Warehouse Selection",
    "Development Test Case ID": "TC-WH-01",
    "Development Test Scenario": "Warehouse Dropdown Load",
    "Test Steps": "Open Connect Workspace page",
    "Expected Result": "Warehouse dropdown loads successfully.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Warehouse Selection",
    "Development Test Case ID": "TC-WH-02",
    "Development Test Scenario": "Warehouse Selection",
    "Test Steps": "Select a warehouse",
    "Expected Result": "Warehouse becomes selected.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Warehouse Selection",
    "Development Test Case ID": "TC-WH-03",
    "Development Test Scenario": "Warehouse Filtering",
    "Test Steps": "Select Central Hub Alpha",
    "Expected Result": "Only roles belonging to Central Hub Alpha are displayed.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },

  // ----------------------------------------------------
  // ROLE SELECTION MODULE
  // ----------------------------------------------------
  {
    "Module": "Role Selection",
    "Development Test Case ID": "TC-RL-01",
    "Development Test Scenario": "Role Dropdown Load",
    "Test Steps": "Open role dropdown",
    "Expected Result": "Available roles are displayed.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Role Selection",
    "Development Test Case ID": "TC-RL-02",
    "Development Test Scenario": "Role Filtering",
    "Test Steps": "Select warehouse",
    "Expected Result": "Only roles mapped to that warehouse appear.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },

  // ----------------------------------------------------
  // ORDERS MODULE
  // ----------------------------------------------------
  {
    "Module": "Orders",
    "Development Test Case ID": "TC-OR-01",
    "Development Test Scenario": "Orders Table Load",
    "Test Steps": "Open Orders page",
    "Expected Result": "Orders table loads successfully.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Orders",
    "Development Test Case ID": "TC-OR-02",
    "Development Test Scenario": "Pending Filter",
    "Test Steps": "Click Pending card",
    "Expected Result": "Only pending orders are displayed.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Orders",
    "Development Test Case ID": "TC-OR-03",
    "Development Test Scenario": "Search Order",
    "Test Steps": "Search Order ID",
    "Expected Result": "Matching orders appear.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },

  // ----------------------------------------------------
  // LABEL GENERATION MODULE
  // ----------------------------------------------------
  {
    "Module": "Label Generation",
    "Development Test Case ID": "TC-LB-01",
    "Development Test Scenario": "Generate Label",
    "Test Steps": "Select Pending Order\nClick Generate Label",
    "Expected Result": "Label generated successfully.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Label Generation",
    "Development Test Case ID": "TC-LB-02",
    "Development Test Scenario": "Bulk Label Generation",
    "Test Steps": "Select multiple orders\nClick Generate Labels",
    "Expected Result": "Labels generated for all selected orders.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Label Generation",
    "Development Test Case ID": "TC-LB-03",
    "Development Test Scenario": "Print Labels",
    "Test Steps": "Click Print Labels",
    "Expected Result": "Printable label sheet opens correctly.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // OPERATIONS MODULE
  // ----------------------------------------------------
  {
    "Module": "Operations",
    "Development Test Case ID": "TC-OP-01",
    "Development Test Scenario": "Order Picking Workspace Validation",
    "Test Steps": "Navigate to Operations -> Order Picking, select picklist #PK-102, scan barcode and enter bin locator code.",
    "Expected Result": "Pick status updates to Picked and item moves to packing bay in ledger.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Operations",
    "Development Test Case ID": "TC-OP-02",
    "Development Test Scenario": "Generate Shift Assignment",
    "Test Steps": "Open Shift Management, enter worker name, select role, select allocation, and click Generate Shift Slot.",
    "Expected Result": "Worker is added to Daily Shift Board with status Present.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // INVENTORY MODULE
  // ----------------------------------------------------
  {
    "Module": "Inventory",
    "Development Test Case ID": "TC-INV-01",
    "Development Test Scenario": "Stock Inward & Putaway Flow",
    "Test Steps": "Navigate to Inventory -> Stock Inward, enter product barcode, enter received quantity (100 units), bin ID, and click Submit Putaway.",
    "Expected Result": "Stock level for specified SKU increments by 100 units in the Inventory Management table.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Inventory",
    "Development Test Case ID": "TC-INV-02",
    "Development Test Scenario": "Expiry Tracker Alerts",
    "Test Steps": "Open Expiry Management, verify threshold warning display and expired batches highlighting.",
    "Expected Result": "System lists batches expiring within threshold in red, blocking them from picker lists.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // PURCHASE MODULE
  // ----------------------------------------------------
  {
    "Module": "Purchase",
    "Development Test Case ID": "TC-PUR-01",
    "Development Test Scenario": "Auto Requisition Generation",
    "Test Steps": "Navigate to Purchase Dashboard, click Run Auto-Replenish Engine.",
    "Expected Result": "System scans inventory and auto-generates Purchase Requests for low stock items.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Purchase",
    "Development Test Case ID": "TC-PUR-02",
    "Development Test Scenario": "Goods Receipt (GRN) Temperature Control",
    "Test Steps": "Attempt to register a Dairy shipment with Probe Temp 5.5°C (Limit <= 4.5°C).",
    "Expected Result": "Submission blocks with warning: 'Dairy temperature cannot exceed 4.5°C'.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // LOGISTICS & DELIVERY MODULE
  // ----------------------------------------------------
  {
    "Module": "Logistics & Delivery",
    "Development Test Case ID": "TC-LOG-01",
    "Development Test Scenario": "Delivery Rider Assignment",
    "Test Steps": "Navigate to Logistics & Delivery -> Delivery Assignment, select dispatch manifest, choose Rider, and click Assign & Notify.",
    "Expected Result": "Manifest transitions to Assigned and order status is updated.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Logistics & Delivery",
    "Development Test Case ID": "TC-LOG-02",
    "Development Test Scenario": "Route Optimization Check",
    "Test Steps": "Open Route Management, input multiple destination drops, and click Generate Route.",
    "Expected Result": "System plots the optimized route listing total distance and travel duration.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // CUSTOMER SUPPORT MODULE
  // ----------------------------------------------------
  {
    "Module": "Customer Support",
    "Development Test Case ID": "TC-CS-01",
    "Development Test Scenario": "Customer Ticket Creation",
    "Test Steps": "Open Customer Tickets, click Create Ticket, enter order #, select category, enter description, and submit.",
    "Expected Result": "Ticket is created with status Open and routed to support queue.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Customer Support",
    "Development Test Case ID": "TC-CS-02",
    "Development Test Scenario": "Order Lookup & Refund Request",
    "Test Steps": "Open Order Lookup, search by customer email, select order, and click Initiate Refund.",
    "Expected Result": "Order details load and refund request is submitted to Finance as Pending Approval.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // SALES & BUSINESS MODULE
  // ----------------------------------------------------
  {
    "Module": "Sales & Business",
    "Development Test Case ID": "TC-SB-01",
    "Development Test Scenario": "Merchant Partner Onboarding",
    "Test Steps": "Navigate to Sales & Business -> Merchant Management, click Register Merchant, enter business/tax details, and click Onboard.",
    "Expected Result": "Merchant account is created and visible in Partner Management.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Sales & Business",
    "Development Test Case ID": "TC-SB-02",
    "Development Test Scenario": "Expansion Planning Opportunity Tracker",
    "Test Steps": "Open Expansion Planning, click Add Proposal, specify location, estimated demand tier, and launch cost.",
    "Expected Result": "Proposal is listed in active opportunities list.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // MARKETING MODULE
  // ----------------------------------------------------
  {
    "Module": "Marketing",
    "Development Test Case ID": "TC-MKT-01",
    "Development Test Scenario": "Create Coupon Code Promotion",
    "Test Steps": "Navigate to Coupons & Offers, click Create Coupon, enter promo details, discount rules, and save.",
    "Expected Result": "Coupon is registered and active for checkout validations.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Marketing",
    "Development Test Case ID": "TC-MKT-02",
    "Development Test Scenario": "Push Notification Campaign Segment",
    "Test Steps": "Open Push Notifications, choose Audience Segment, enter Title/Body, and click Send Blast.",
    "Expected Result": "System dispatches push notification to matched customer profiles.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // FINANCE & ACCOUNTS MODULE
  // ----------------------------------------------------
  {
    "Module": "Finance & Accounts",
    "Development Test Case ID": "TC-FIN-01",
    "Development Test Scenario": "Vendor Payments Settlements",
    "Test Steps": "Navigate to Vendor Payments, select invoice, verify matched GRN, enter transaction reference, and click Settle Payment.",
    "Expected Result": "Invoice status shifts to Paid and ledger balances.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Finance & Accounts",
    "Development Test Case ID": "TC-FIN-02",
    "Development Test Scenario": "GST Audit Report Generation",
    "Test Steps": "Open GST Reports, select month, and click Generate Report.",
    "Expected Result": "GST liability is computed and available for Excel/PDF download.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // HUMAN RESOURCES MODULE
  // ----------------------------------------------------
  {
    "Module": "Human Resources",
    "Development Test Case ID": "TC-HR-01",
    "Development Test Scenario": "Employee Attendance Verification",
    "Test Steps": "Open Attendance, select Employee ID, enter check-in time, and confirm.",
    "Expected Result": "Employee status updates to Present and total working hours recalculate.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Human Resources",
    "Development Test Case ID": "TC-HR-02",
    "Development Test Scenario": "Leave Request Submission",
    "Test Steps": "Navigate to Leave Management, click Request Leave, specify dates/type, and submit.",
    "Expected Result": "Leave request is logged with status Pending Manager Approval.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // INFORMATION TECHNOLOGY MODULE
  // ----------------------------------------------------
  {
    "Module": "Information Technology",
    "Development Test Case ID": "TC-IT-01",
    "Development Test Scenario": "Modify User Role Permissions",
    "Test Steps": "Navigate to Role & Permissions, select user, toggle page permission, and click Save Settings.",
    "Expected Result": "User permissions list is updated, enforcing new access on next request.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Information Technology",
    "Development Test Case ID": "TC-IT-02",
    "Development Test Scenario": "API Log Traversal",
    "Test Steps": "Open API Logs, search for error status code 500, check details.",
    "Expected Result": "Logs are filtered displaying payload and response latency.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  // ----------------------------------------------------
  // ADMINISTRATION MODULE
  // ----------------------------------------------------
  {
    "Module": "Administration",
    "Development Test Case ID": "TC-ADM-01",
    "Development Test Scenario": "Asset Allocation Log",
    "Test Steps": "Navigate to Asset Management, click Allocate Asset, select asset scanner, select assignee, and submit.",
    "Expected Result": "Asset status changes to Allocated and custody record is saved.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  },
  {
    "Module": "Administration",
    "Development Test Case ID": "TC-ADM-02",
    "Development Test Scenario": "Facility Maintenance Request",
    "Test Steps": "Open Facility Management, click Log Maintenance Job, specify area/priority, enter description, and submit.",
    "Expected Result": "Maintenance ticket is registered and email alert sent to service provider.",
    "Development Status": "Pending",
    "QA Status": "Pending",
    "QA Remarks": ""
  }
];

const ws = xlsx.utils.json_to_sheet(testCases);

// Set column widths
ws['!cols'] = [
  { wch: 20 },  // Module
  { wch: 25 },  // Development Test Case ID
  { wch: 40 },  // Development Test Scenario
  { wch: 50 },  // Test Steps
  { wch: 55 },  // Expected Result
  { wch: 20 },  // Development Status
  { wch: 15 },  // QA Status
  { wch: 20 }   // QA Remarks
];

const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Development Test Cases');

const dir = path.join(__dirname, 'src', 'assets', 'project-tracker');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write the main file
const targetPath = path.join(dir, 'HAATZA_Test_Cases.xlsx');
xlsx.writeFile(wb, targetPath);

// Also generate the CSV just in case
const csvContent = xlsx.utils.sheet_to_csv(ws);
const csvPath = path.join(dir, 'HAATZA_Test_Cases.csv');
fs.writeFileSync(csvPath, csvContent);

console.log(`Successfully generated QA test cases at: ${targetPath} and CSV.`);
