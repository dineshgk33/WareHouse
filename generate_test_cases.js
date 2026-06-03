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
