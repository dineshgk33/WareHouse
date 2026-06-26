# HAATZA Enterprise Warehouse Management - All Modules QA Test Cases

This catalog details the comprehensive QA test cases (functional, integration, UAT, and security access control) for all 11 enterprise modules in the HAATZA Warehouse Management System.

---

## 1. Operations Module (OP)

### TC-OP-01: Order Picking Workspace Validation
- **Objective:** Verify picker can access and progress a picklist.
- **Pre-conditions:** Logged in as Operations role. Active orders in "Pending Picking" state.
- **Steps:**
  1. Navigate to **Operations $\rightarrow$ Order Picking**.
  2. Select picklist #PK-102.
  3. Scan product barcode and input bin locator code.
  4. Confirm pick quantity.
- **Expected Result:** Pick status changes to "Picked", item moves to packing bay in ledger, and picker productivity is logged.

### TC-OP-02: Generate Shift Assignment
- **Objective:** Verify shift allocations are successfully generated and displayed.
- **Pre-conditions:** Employees registered in the database.
- **Steps:**
  1. Navigate to **Operations $\rightarrow$ Shift Management**.
  2. In the "Generate Shift Assignment" form, enter worker name "Pooja Roy".
  3. Select role "Admin" and allocation "General".
  4. Click **Generate Shift Slot**.
- **Expected Result:** Pooja Roy is added to the Daily Shift Board with status "Present" and correct shift duration.

---

## 2. Inventory Module (INV)

### TC-INV-01: Stock Inward & Putaway Flow
- **Objective:** Verify stock putaway increases SKU count in the catalog.
- **Pre-conditions:** Logged in as Inventory role.
- **Steps:**
  1. Navigate to **Inventory $\rightarrow$ Stock Inward**.
  2. Input product barcode, received quantity (100 units), and warehouse bin ID "BIN-B03".
  3. Click **Submit Putaway**.
- **Expected Result:** Stock level for specified SKU increments by 100 units in the Inventory Management table.

### TC-INV-02: Expiry Tracker Alerts
- **Objective:** Verify system flags batch close to expiry.
- **Steps:**
  1. Navigate to **Inventory $\rightarrow$ Expiry Management**.
  2. Set expiry threshold warning to "30 Days".
- **Expected Result:** System lists batch numbers expiring within 30 days in red, blocking them from order picklists.

---

## 3. Purchase Module (PUR)

### TC-PUR-01: Auto Requisition Generation
- **Objective:** Verify low-stock threshold triggers auto-requisitions.
- **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Purchase Dashboard**.
  2. Click **Run Auto-Replenish Engine**.
- **Expected Result:** System scans inventory levels and auto-generates a Purchase Request for items below threshold.

### TC-PUR-02: Goods Receipt (GRN) Temperature Control
- **Objective:** Verify temperature warnings block GRN posting for cold chain items.
- **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Goods Receipt (GRN)**.
  2. Attempt to register a Dairy shipment with Probe Temp `5.5°C`.
- **Expected Result:** Submission blocks with warning: "Dairy temperature cannot exceed 4.5°C".

---

## 4. Logistics & Delivery Module (LOG)

### TC-LOG-01: Delivery Rider Assignment
- **Objective:** Bind a rider to an outbound dispatch manifest.
- **Pre-conditions:** Logged in as Logistics role. Rider status is "Active".
- **Steps:**
  1. Navigate to **Logistics & Delivery $\rightarrow$ Delivery Assignment**.
  2. Select dispatch manifest #DSP-904.
  3. Choose Rider "Ramesh Singh" from dropdown.
  4. Click **Assign & Notify**.
- **Expected Result:** Manifest transitions to "Assigned", SMS/App notification sent to rider, and order status is updated.

### TC-LOG-02: Route Optimization Check
- **Objective:** Verify distance and transit time calculations are rendered.
- **Steps:**
  1. Navigate to **Logistics & Delivery $\rightarrow$ Route Management**.
  2. Input 5 destination drop-points and click **Generate Route**.
- **Expected Result:** Google Maps API/Mock router plots the shortest path, listing total route distance and expected travel duration.

---

## 5. Customer Support Module (CS)

### TC-CS-01: Customer Ticket Creation
- **Objective:** Log customer issue and route to appropriate department.
- **Steps:**
  1. Navigate to **Customer Support $\rightarrow$ Customer Tickets**.
  2. Click **Create Ticket**, enter order number #ORD-775, select category "Missing Item", and type description.
  3. Click **Submit Ticket**.
- **Expected Result:** Ticket is created with status "Open" and assigned to Customer Support Representative.

### TC-CS-02: Order Lookup & Refund Request
- **Objective:** Verify support agent can query order details and trigger refund.
- **Steps:**
  1. Navigate to **Customer Support $\rightarrow$ Order Lookup**.
  2. Search for Customer Email "customer@test.com".
  3. Select order #ORD-775 and click **Initiate Refund**.
- **Expected Result:** Order details are loaded. Refund request is submitted to Finance with status "Pending Approval".

---

## 6. Sales & Business Module (SB)

### TC-SB-01: Merchant Partner Onboarding
- **Objective:** Register a new wholesale/seller account.
- **Steps:**
  1. Navigate to **Sales & Business $\rightarrow$ Merchant Management**.
  2. Click **Register Merchant**, enter business name, contact details, and Tax/PAN card details.
  3. Click **Onboard**.
- **Expected Result:** Merchant account is created and visible in the Partner Management database.

### TC-SB-02: Expansion Planning Opportunity Tracker
- **Objective:** Log new darkhouse location proposals.
- **Steps:**
  1. Navigate to **Sales & Business $\rightarrow$ Expansion Planning**.
  2. Click **Add Proposal**, specify location "Sector 62, Noida", estimated demand tier "High", and launch cost.
- **Expected Result:** Proposal is listed in active opportunities list for management review.

---

## 7. Marketing Module (MKT)

### TC-MKT-01: Create Coupon Code Promotion
- **Objective:** Configure discount rule for marketing campaigns.
- **Steps:**
  1. Navigate to **Marketing $\rightarrow$ Coupons & Offers**.
  2. Click **Create Coupon**, enter code "HAATZA50", discount percentage "50%", max cap "₹200", and expiry date.
  3. Click **Save Rule**.
- **Expected Result:** Coupon is registered in promotion catalog and is active for checkout validations.

### TC-MKT-02: Push Notification Campaign Segment
- **Objective:** Send targeting messages to specific customer cohort.
- **Steps:**
  1. Navigate to **Marketing $\rightarrow$ Push Notifications**.
  2. Choose Audience Segment "Inactive Users (30d)".
  3. Input Title "We Miss You!" and body text. Click **Send Blast**.
- **Expected Result:** System dispatches push notification to all matched customer profile tokens.

---

## 8. Finance & Accounts Module (FIN)

### TC-FIN-01: Vendor Payments Settlements
- **Objective:** Verify accounts reconciliation for completed GRNs.
- **Steps:**
  1. Navigate to **Finance & Accounts $\rightarrow$ Vendor Payments**.
  2. Select invoice INV-2026-904 from "Unsettled" table.
  3. Confirm matching GRN details, input payment reference code, and click **Settle Payment**.
- **Expected Result:** Invoice status shifts to "Paid", and ledger entry balances out.

### TC-FIN-02: GST Audit Report Generation
- **Objective:** Generate monthly GST liability sheet.
- **Steps:**
  1. Navigate to **Finance & Accounts $\rightarrow$ GST Reports**.
  2. Select Month "June 2026" and click **Generate Report**.
- **Expected Result:** CGST, SGST, and IGST breakdowns are computed and available for PDF/Excel download.

---

## 9. Human Resources Module (HR)

### TC-HR-01: Employee Attendance Verification
- **Objective:** Verify check-in and check-out logs register attendance.
- **Steps:**
  1. Navigate to **Human Resources $\rightarrow$ Attendance**.
  2. Select Employee ID "EMP-102" and input Check-in time "06:02 AM".
- **Expected Result:** Employee status updates to "Present" on the shift board, and total hours are recalculated.

### TC-HR-02: Leave Request Submission
- **Objective:** Verify employee can submit leave requests.
- **Steps:**
  1. Navigate to **Human Resources $\rightarrow$ Leave Management**.
  2. Click **Request Leave**, select date range, specify type "Casual Leave", and enter reason.
  3. Submit.
- **Expected Result:** Leave request is logged with status "Pending Manager Approval".

---

## 10. Information Technology Module (IT)

### TC-IT-01: Modify User Role Permissions
- **Objective:** Grant/Revoke access rights for a user account.
- **Pre-conditions:** Logged in as IT Administrator.
- **Steps:**
  1. Navigate to **Information Technology $\rightarrow$ Role & Permissions**.
  2. Select user "Rahul Kumar".
  3. Toggle "Warehouse Catalogue" permission from Enabled to Disabled.
  4. Click **Save Settings**.
- **Expected Result:** User permissions list is updated in local state and localStorage, blocking user on next page access.

### TC-IT-02: API Log Traversal
- **Objective:** Inspect audit logs for system API calls.
- **Steps:**
  1. Navigate to **Information Technology $\rightarrow$ API Logs**.
  2. Search for status code "500" or resource path "/loginEmployee".
- **Expected Result:** Matching API logs are filtered, displaying payload structure and response latency details.

---

## 11. Administration Module (ADM)

### TC-ADM-01: Asset Allocation Log
- **Objective:** Register warehouse asset assignment.
- **Steps:**
  1. Navigate to **Administration $\rightarrow$ Asset Management**.
  2. Click **Allocate Asset**, select Barcode Scanner "SCN-902", select Assignee "Amit Kumar", and submit.
- **Expected Result:** Scanner status changes to "Allocated", and custody audit record is saved.

### TC-ADM-02: Facility Maintenance Request
- **Objective:** Log issues with warehouse physical infrastructure.
- **Steps:**
  1. Navigate to **Administration $\rightarrow$ Facility Management**.
  2. Click **Log Maintenance Job**, select area "Cold Storage Unit 3", priority "Urgent", and enter description.
- **Expected Result:** Ticket is registered, and email trigger notification is sent to facility repair vendor.
