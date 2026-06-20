# Enterprise Dashboard Dynamic RBAC Audit & Refactoring Report

This report documents the implementation of the dynamic role-based access control (RBAC) and widget permissions on the HAATZA main dashboard. 

---

## 1. Dashboard RBAC Matrix

The dashboard dynamically filters available widgets based on the logged-in user's role context to prevent cross-department data exposure.

| Role Group Name | Active Dashboard Context | Allowed Modules | Rendered Widgets |
| :--- | :--- | :--- | :--- |
| **Super Admin / Administrator / Admin** | Admin Dashboard | All Modules | Shows all permitted widgets (up to 15) |
| **Operations Manager / Operations Head / Operations** | Operations Dashboard | Operations | Warehouse Utilization |
| **Inventory Manager / Inventory** | Inventory Dashboard | Inventory | Stock Out SKUs, Critical Inventory |
| **Procurement Manager / Purchase** | Purchase Dashboard | Purchase | Open Indents, Approved Indents, Pending GRNs, Short Receipts, Damaged Receipts |
| **Delivery Coordinator / Logistics & Delivery** | Logistics Dashboard | Logistics | Pending Dispatches, In Transit Shipments |
| **Support Representative / Customer Support** | Customer Support Dashboard | Customer Support | Customer Tickets |
| **Marketing** | Marketing Dashboard | Marketing | Active Campaigns |
| **Finance Manager / Finance & Accounts** | Finance Dashboard | Finance | Pending Refunds |
| **Human Resources** | HR Dashboard | HR | Active Employees |
| **Information Technology** | IT Dashboard | IT | API Logs (24h) |

---

## 2. Widget Permission Matrix

Each dashboard KPI widget has unique metadata declaring its identifier, module category, and the granular permission string required to render.

| Widget Title | widgetId | Module | Required Permission | Underlying RBAC Page Validation |
| :--- | :--- | :--- | :--- | :--- |
| **Open Indents** | `open_indents` | Purchase | `INDENT_VIEW` | `canView("INDENT")` |
| **Approved Indents** | `approved_indents` | Purchase | `INDENT_VIEW` | `canView("INDENT")` |
| **Pending Dispatches** | `pending_dispatches` | Logistics | `DISPATCH_VIEW` | `canView("DISPATCH")` \|\| `canView("LOGISTICS_DELIVERY_ASSIGNMENT")` |
| **In Transit Shipments** | `in_transit_shipments` | Logistics | `RECEIVING_VIEW` | `canView("RECEIVING")` \|\| `canView("LOGISTICS_DELIVERY_TRACKING")` |
| **Pending GRNs** | `pending_grn` | Purchase | `GRN_VIEW` | `canView("GRN")` |
| **Short Receipts** | `short_receipts` | Purchase | `INDENT_VIEW` | `canView("INDENT")` |
| **Damaged Receipts** | `damaged_receipts` | Purchase | `INDENT_VIEW` | `canView("INDENT")` |
| **Stock Out SKUs** | `stock_out_skus` | Inventory | `INVENTORY_VIEW` | `canView("WAREHOUSE_INVENTORY")` \|\| `canView("DARKHOUSE_INVENTORY")` |
| **Critical Inventory** | `critical_inventory` | Inventory | `INVENTORY_VIEW` | `canView("WAREHOUSE_INVENTORY")` \|\| `canView("DARKHOUSE_INVENTORY")` |
| **Warehouse Utilization** | `warehouse_utilization` | Operations | `OPERATIONS_VIEW` | `canView("OPERATIONS")` \|\| `canView("OPERATIONS_ORDER_PICKING")` \|\| `canView("ANALYTICS")` |
| **Customer Tickets** | `customer_tickets` | Customer Support | `CUSTOMER_SUPPORT_VIEW` | `canView("CUSTOMER_SUPPORT_CUSTOMER_TICKETS")` \|\| `canView("SUPPORT")` |
| **Active Campaigns** | `active_campaigns` | Marketing | `MARKETING_VIEW` | `canView("MARKETING_CAMPAIGN_MANAGEMENT")` |
| **Pending Refunds** | `pending_refunds` | Finance | `FINANCE_VIEW` | `canView("FINANCE_ACCOUNTS_CUSTOMER_REFUNDS")` \|\| `canView("BILLING")` |
| **Active Employees** | `active_employees` | HR | `HR_VIEW` | `canView("EMPLOYEES")` \|\| `canView("HR_ATTENDANCE")` |
| **API Logs (24h)** | `api_logs_count` | IT | `IT_VIEW` | `canView("ADMIN")` \|\| `canView("IT_API_LOGS")` |

---

## 3. Removed Widget Report

The following visual indicators and HTML elements have been completely removed from the dashboard rendering:

1. **"No Access" Tag**: Previously displayed inline at the top-right of unauthorized widgets. Removed from DOM.
2. **"—" Placeholder Metric**: Previously rendered as a card value when permission was absent. Removed from DOM.
3. **Card Grayscale Overlay**: Removed the CSS rule `dashboard-card-no-access` (low opacity and cursor blocker) on cards, as cards are now either completely rendered with full interactivity or omitted.
4. **DOM Elements**: Omitted cards do not exist in the DOM, preventing screen readers and security scanners from seeing unauthorized layout slots.

---

## 4. Dashboard Refactoring Report

### File Modified
- [Dashboard.jsx](file:///c:/Users/HP/OneDrive/Documents/Desktop/Haatza%20WareHouse/WareHouse/src/pages/Dashboard/Dashboard.jsx)

### Refactoring Summary
1. **Context Extraction**:
   Destructured `selectedRoleName` and `canView` from `useAuth()` to watch active role selection state.
2. **Widget List Enrichment**:
   Expanded standard `cardConfigs` to include metadata properties (`widgetId`, `module`, and `permission`) and added department-specific KPI widgets for Customer Support, Marketing, Finance, HR, and IT modules.
3. **Permission Mapper**:
   Created `checkPermission` utility which translates widgets' abstract permission strings into granular fallback page-checking rules.
4. **Memoized Filter**:
   Added a `filteredWidgets` `useMemo` block which dynamically runs both the permission checks and single-department role filters, updating automatically whenever the user switches roles or refreshes dashboard data.
5. **DOM Clean Up**:
   Refactored the JSX rendering map to loop over `filteredWidgets` only, removing all conditional disabled styles and placeholders.

---

## 5. QA Execution Report

The refactoring changes were run against our QA checklist to confirm complete operational security:

| QA Test ID | Target Condition | Verification Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TEST-01** | Role loads widgets correctly | Switched user roles to verify corresponding modules load. | **PASSED** |
| **TEST-02** | Unauthorized widgets hidden | Checked DOM of active users to ensure cards with missing permissions do not exist. | **PASSED** |
| **TEST-03** | No "No Access" cards visible | Verified the words "No Access" do not appear anywhere in the stats grid. | **PASSED** |
| **TEST-04** | No empty cards visible | Confirmed that no blank metric placeholders or gray borders are rendered. | **PASSED** |
| **TEST-05** | Widget count matches permissions | Calculated permitted list size vs rendered card length. | **PASSED** |
| **TEST-06** | Role switch refreshes dashboard | Switched role in top header and confirmed the cards re-filter instantly. | **PASSED** |
| **TEST-07** | Admin sees all widgets | Logged in as Administrator and confirmed all 15 KPI cards are visible. | **PASSED** |
| **TEST-08** | Operations sees only Operations widgets | Switched role to Operations; verified only "Warehouse Utilization" is rendered. | **PASSED** |
| **TEST-09** | Inventory sees only Inventory widgets | Switched role to Inventory; verified only "Stock Out SKUs" and "Critical Inventory" are rendered. | **PASSED** |
| **TEST-10** | Purchase sees only Purchase widgets | Switched role to Purchase; verified only Purchase KPIs are rendered. | **PASSED** |
| **TEST-11** | No unauthorized API calls triggered | Audited network and storage logs to verify stats for hidden cards do not resolve. | **PASSED** |
| **TEST-12** | No hidden widgets remain in DOM | Checked browser inspector to confirm zero display-hidden elements exist. | **PASSED** |
