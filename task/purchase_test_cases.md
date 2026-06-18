# HAATZA Purchase Management - QA Test Cases & Production Readiness Review

This catalog lists the exhaustive, step-by-step test cases (functional, integration, UAT) and the production readiness review for the Purchase Management module.

---

## 1. Purchase Requisition (PR) Test Cases

### TC-PR-01: Manual PR Creation
* **Objective:** Verify user can raise a new manual Purchase Requisition.
* **Pre-conditions:** Logged in as Warehouse Manager/Admin.
* **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Purchase Requisition**.
  2. Click **Raise New Requisition**.
  3. Select **Required Date**, select priority as "High", and enter remarks "Manual stock up".
  4. Select products: Alphonso Mangoes, Amul Milk. Enter quantities (50, 100).
  5. Click **Submit Requisition**.
* **Expected Result:** PR is successfully generated with status "Submitted", visible in the PR List.

### TC-PR-02: Auto-Replenish Trigger
* **Objective:** Verify low-stock threshold triggers auto-requisitions.
* **Pre-conditions:** Some catalog items have stock level below their reorder point in `localStorage`.
* **Steps:**
  1. Open **Purchase Dashboard**.
  2. Click **Run Auto-Replenish Engine**.
* **Expected Result:** System scans the inventory ledger, detects low-stock items, and automatically creates a PR with status "Submitted" containing these items with calculated suggested quantities.

### TC-PR-03: Approve & Reject Workflows
* **Objective:** Verify PR approval and rejection updates state correctly.
* **Pre-conditions:** A PR exists with status "Submitted".
* **Steps:**
  1. Select the PR in the PR list.
  2. Click **Approve**. Verify status changes to "Approved".
  3. Create another PR and click **Reject**. Verify status changes to "Rejected".
* **Expected Result:** Statuses update instantly and log in audit trails.

---

## 2. Purchase Order (PO) Test Cases

### TC-PO-01: Create PO from Approved PR
* **Objective:** Verify converting an approved PR to a PO.
* **Pre-conditions:** An approved PR exists.
* **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Purchase Orders**.
  2. Click **Create Purchase Order**.
  3. Select the approved PR from the dropdown.
  4. Select **Vendor** (e.g. Zepto-Direct Fresh Farms).
  5. Observe auto-populated items, quantities, and prices.
  6. Click **Approve & Generate PO**.
* **Expected Result:** PO is generated with status "Approved", and the source PR status is set to "Converted To PO".

### TC-PO-02: Cost & Tax Calculations
* **Objective:** Verify subtotal, tax amount, freight, and total cost are calculated correctly.
* **Steps:**
  1. During PO creation, set tax percentage to `10%`, freight charges to `₹500`, and add items of value `₹10,000`.
  2. Check the calculations pane.
* **Expected Result:** Subtotal is `₹10,000`, Tax is `₹1,000`, Freight is `₹500`, and Total is `₹11,500`.

### TC-PO-03: Cancel PO
* **Objective:** Verify a PO can be cancelled prior to receipt.
* **Steps:**
  1. Open a PO with status "Approved" or "Sent To Vendor".
  2. Click **Cancel**.
* **Expected Result:** Status transitions to "Cancelled", and audit log entries are saved.

---

## 3. Vendor Compliance Test Cases

### TC-VEN-01: Master Creation & GST Validation
* **Objective:** Verify vendor registration checks GST structure.
* **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Vendors**.
  2. Click **Register New Vendor**.
  3. Enter an invalid GST number (e.g. 10 characters).
  4. Submit.
* **Expected Result:** Submission blocks with error: "GST Number must be precisely 15 alphanumeric characters."

### TC-VEN-02: FSSAI Validation
* **Objective:** Verify FSSAI license compliance checks.
* **Steps:**
  1. Enter a 10-digit FSSAI code.
  2. Submit.
* **Expected Result:** Submission blocks with error: "FSSAI license number must be exactly 14 numeric digits."

---

## 4. Inbound Carrier Test Cases

### TC-IBD-01: Create & Track Shipment
* **Objective:** Verify logging and tracking inbound deliveries.
* **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Inbound Deliveries**.
  2. Click **Log Inbound Carrier Shipment**, bind to an active PO, and enter carrier vehicle, driver, and ETA.
  3. Click **Log Inbound Gate**.
  4. Verify shipment status is "Created". Click **Dispatch** (goes to "In Transit").
  5. Click **Gate Arrive** (goes to "Arrived").
  6. Click **Gate Unload** (goes to "Unloaded").
* **Expected Result:** The delivery progresses through state pipeline milestones successfully.

---

## 5. Purchase GRN & Category validations

### TC-GRN-01: Receive Full Quantity
* **Objective:** Verify receiving full ordered quantity updates PO status.
* **Steps:**
  1. Navigate to **Purchase $\rightarrow$ Purchase GRN**.
  2. Click **Perform Inbound Receiving**.
  3. Select the PO and input Invoice No and Date. Upload mock invoice.
  4. Keep received quantities equal to expected.
  5. Submit.
* **Expected Result:** GRN posted. PO status transitions to "Delivered".

### TC-GRN-02: Category Specific Quality Failures
* **Objective:** Verify category-specific quality and temperature thresholds block posting.
* **Steps:**
  1. Create a GRN for a **Dairy** item.
  2. Set the Probe Temperature to `5.2°C` (Limit $\le$ 4.5°C).
  3. Submit.
* **Expected Result:** Submission blocks with warning: "Dairy temp cannot exceed 4.5°C".

### TC-GRN-03: Duplicate Invoice Validation
* **Objective:** Verify duplicate invoice prevention checks.
* **Steps:**
  1. Post a GRN with Invoice number `INV-ABC-123`.
  2. Try posting another GRN with the same Invoice number.
* **Expected Result:** Blocks with duplicate error: "A GRN with invoice INV-ABC-123 has already been posted."

---

## 6. Inventory Ledger Updates

### TC-INV-01: Double-Entry Update
* **Objective:** Verify posting GRN increments warehouse inventory.
* **Pre-conditions:** Check current stock of "Fresh Alphonso Mangoes" in Central Warehouse catalogue (e.g. 120 units).
* **Steps:**
  1. Post a Purchase GRN of `50 units` of Alphonso Mangoes at the Central Warehouse.
  2. Return to Central Warehouse catalogue and inspect Alphonso Mangoes.
* **Expected Result:** Stock level is incremented to `170 units` (120 + 50). Ledger transaction log and audit logs are recorded.

---

## 7. Integration & UAT Test Cases

### TC-INT-01: End-to-End Procurement Lifecycle
* **Objective:** Test full lifecycle flow: Low Stock $\rightarrow$ Auto-PR $\rightarrow$ Approval $\rightarrow$ PO $\rightarrow$ Gate Shipment $\rightarrow$ GRN $\rightarrow$ Stock Update $\rightarrow$ Reports.
* **Steps:**
  1. Trigger Auto-PR for low stock item.
  2. Approve the PR.
  3. Convert the PR to PO and send it to the Vendor.
  4. Vendor accepts and logs an Inbound Delivery.
  5. Update delivery to "Unloaded" at the warehouse gate.
  6. Post Purchase GRN verifying quantity and batch.
  7. Check inventory catalog for the stock increment.
  8. Check Vendor Performance leaderboard metrics.
* **Expected Result:** Entire chain succeeds without break, and metrics update in real-time.

---

## 8. Production Readiness Review (PRR)

* **Data Integrity:** Real-time stock movement audits are enforced via double-entry transaction ledgers, ensuring zero discrepancy between GRN counts and catalog stock values.
* **Performance:** Real-time scorecard metrics are optimized through quick-lookup index keys in LocalStorage, preventing memory leaks during load.
* **Error Tolerances:** Enforced validations block invalid temperature logs, expired medicine batches, and duplicate invoices.
