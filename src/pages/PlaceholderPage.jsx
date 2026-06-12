import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    FileText, 
    ArrowRight, 
    Download, 
    PlusCircle, 
    Search, 
    RefreshCw, 
    Activity, 
    Database, 
    TrendingUp, 
    CheckCircle, 
    Clock, 
    AlertCircle 
} from "lucide-react";

export default function PlaceholderPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    // Dynamic routing/path content resolution
    const path = location.pathname.toLowerCase().replace(/\/$/, "");
    
    // Resolve Page Title, Module, Description, and Mock Data based on route path
    const getPageDetails = (path) => {

        // Module 3: Admin
        if (path.includes("/admin/users")) {
            return {
                title: "Manage Users",
                module: "Admin",
                desc: "Configure system users, assign roles, and edit authentication details.",
                metrics: [
                    { label: "Total Users", value: "24 members", icon: Database, color: "#1e60ff" },
                    { label: "Active Sessions", value: "8 active", icon: CheckCircle, color: "#10b981" }
                ],
                columns: ["Employee ID", "Full Name", "Email Address", "Primary Role", "Status"],
                data: [
                    { "Employee ID": "EMP-993", "Full Name": "Dinesh GK", "Email Address": "dineshgk33@gmail.com", "Primary Role": "Administrator", "Status": "Active" },
                    { "Employee ID": "EMP-410", "Full Name": "Vignesh S", "Email Address": "vignesh@haatza.com", "Primary Role": "Store Manager", "Status": "Active" },
                    { "Employee ID": "EMP-105", "Full Name": "Jane Doe", "Email Address": "jane@haatza.com", "Primary Role": "Inventory Manager", "Status": "Inactive" }
                ]
            };
        }
        if (path.includes("/admin/permissions")) {
            return {
                title: "Role & Page Permissions",
                module: "Admin",
                desc: "Set access controls, feature flags, and dashboard permissions for each role.",
                metrics: [
                    { label: "System Roles", value: "7 defined", icon: Database, color: "#1e60ff" },
                    { label: "Protected Pages", value: "48 locked", icon: CheckCircle, color: "#8b5cf6" }
                ],
                columns: ["Role Class", "Access Level", "Module Scope", "Modified Date", "Audited By"],
                data: [
                    { "Role Class": "Administrator", "Access Level": "Full Access", "Module Scope": "All Modules", "Modified Date": "01-Jun-2026", "Audited By": "Root System" },
                    { "Role Class": "Store Manager", "Access Level": "Write / Edit", "Module Scope": "Inventory, Orders, Reports", "Modified Date": "01-Jun-2026", "Audited By": "Dinesh GK" },
                    { "Role Class": "Inventory Manager", "Access Level": "Read / Write", "Module Scope": "Catalogue, GRN, Indents", "Modified Date": "01-Jun-2026", "Audited By": "Dinesh GK" }
                ]
            };
        }
        if (path.includes("/admin/role-master")) {
            return {
                title: "Role Master",
                module: "Admin",
                desc: "Declare and maintain enterprise user role categories.",
                metrics: [
                    { label: "Base Roles", value: "8 roles", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Role Code", "Role Title", "Description", "Members Assigned", "Auth Level"],
                data: [
                    { "Role Code": "ROL-01", "Role Title": "Administrator", "Description": "Complete system configurations access", "Members Assigned": "2", "Auth Level": "100" },
                    { "Role Code": "ROL-02", "Role Title": "Store Manager", "Description": "Manages store inventory and dispatch queues", "Members Assigned": "4", "Auth Level": "80" },
                    { "Role Code": "ROL-03", "Role Title": "Inventory Manager", "Description": "Maintains catalog items and adjustments", "Members Assigned": "3", "Auth Level": "60" }
                ]
            };
        }
        if (path.includes("/admin/facilities")) {
            return {
                title: "Manage Warehouses & Dark Houses",
                module: "Admin",
                desc: "Register and manage WMS fulfillment centers, hubs, and dark store nodes.",
                metrics: [
                    { label: "Fulfillment Centers", value: "4 warehouses", icon: Database, color: "#1e60ff" },
                    { label: "Dark Store Nodes", value: "8 hubs", icon: TrendingUp, color: "#10b981" }
                ],
                columns: ["Facility Code", "Name", "Type", "Assigned Hub Manager", "Status"],
                data: [
                    { "Facility Code": "FAC-01", "Name": "Bengaluru Central Hub", "Type": "Warehouse", "Assigned Hub Manager": "Vignesh S", "Status": "Active" },
                    { "Facility Code": "FAC-02", "Name": "Koramangala Dark House", "Type": "Dark House", "Assigned Hub Manager": "Sophia B", "Status": "Active" },
                    { "Facility Code": "FAC-03", "Name": "Whitefield Dark House", "Type": "Dark House", "Assigned Hub Manager": "Marcus J", "Status": "Active" }
                ]
            };
        }
        if (path.includes("/admin/categories")) {
            return {
                title: "Manage Categories",
                module: "Admin",
                desc: "Configure product taxonomy and sorting category lists.",
                metrics: [
                    { label: "Active Categories", value: "14 list", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Category Code", "Category Name", "Description", "Items Assigned", "Tax Rate (%)"],
                data: [
                    { "Category Code": "CAT-01", "Category Name": "Fruits & Vegetables", "Description": "Fresh agricultural supplies", "Items Assigned": "110", "Tax Rate (%)": "0%" },
                    { "Category Code": "CAT-02", "Category Name": "Dairy & Bread", "Description": "Perishable dairy and bakery goods", "Items Assigned": "84", "Tax Rate (%)": "5%" },
                    { "Category Code": "CAT-03", "Category Name": "Snacks & Drinks", "Description": "Packaged munchies and carbonated drinks", "Items Assigned": "240", "Tax Rate (%)": "12%" }
                ]
            };
        }
        if (path.includes("/admin/products")) {
            return {
                title: "Manage Products",
                module: "Admin",
                desc: "Create and edit master SKU attributes, packaging specifications, and taxonomy.",
                metrics: [
                    { label: "Total SKUs", value: "1,250 products", icon: Database, color: "#1e60ff" }
                ],
                columns: ["SKU Code", "Product Name", "Category", "Hsn Code", "MRP Value"],
                data: [
                    { "SKU Code": "8904271201147", "Product Name": "Mr Muscle Cleaner Spray", "Category": "Household", "Hsn Code": "34029091", "MRP Value": "₹99.00" },
                    { "SKU Code": "8901396350309", "Product Name": "Dettol Antiseptic Liquid 250ml", "Category": "Wellness", "Hsn Code": "30049099", "MRP Value": "₹159.37" },
                    { "SKU Code": "8901262010125", "Product Name": "Amul Milk 1L", "Category": "Dairy", "Hsn Code": "04012000", "MRP Value": "₹66.00" }
                ]
            };
        }

        // Module 5: Inventory Management
        if (path.includes("/inventory/warehouse-list")) {
            return {
                title: "Warehouse Inventory List",
                module: "Inventory Management",
                desc: "Examine absolute stock quantities stored at the central warehouse.",
                metrics: [
                    { label: "Warehouse Stock Total", value: "185,420 items", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Item Code", "Product Name", "Bin Code", "Available Qty", "Unit of Measure"],
                data: [
                    { "Item Code": "8904271201147", "Product Name": "Mr Muscle Cleaner Spray", "Bin Code": "BIN-A12", "Available Qty": "1,450", "Unit of Measure": "Pcs" },
                    { "Item Code": "8901396350309", "Product Name": "Dettol Antiseptic Liquid 250ml", "Bin Code": "BIN-C04", "Available Qty": "3,200", "Unit of Measure": "Pcs" },
                    { "Item Code": "8901262010125", "Product Name": "Amul Milk 1L", "Bin Code": "BIN-E09", "Available Qty": "840", "Unit of Measure": "Crates" }
                ]
            };
        }
        if (path.includes("/inventory/adjustment")) {
            return {
                title: "Inventory Adjustment",
                module: "Inventory Management",
                desc: "Record stock count corrections, wastage, damage adjustments, and write-offs.",
                metrics: [
                    { label: "Adjustments (Month)", value: "32 jobs", icon: Clock, color: "#f59e0b" }
                ],
                columns: ["Adjustment ID", "SKU", "Product Name", "Quantity Diff", "Reason Code", "Status"],
                data: [
                    { "Adjustment ID": "#ADJ-3401", "SKU": "8904271201147", "Product Name": "Mr Muscle Cleaner Spray", "Quantity Diff": "-12", "Reason Code": "Damage during packing", "Status": "Approved" },
                    { "Adjustment ID": "#ADJ-3402", "SKU": "8901396350309", "Product Name": "Dettol Antiseptic Liquid 250ml", "Quantity Diff": "+5", "Reason Code": "Found during audit count", "Status": "Pending Review" }
                ]
            };
        }
        if (path.includes("/inventory/history")) {
            return {
                title: "Inventory Transaction History",
                module: "Inventory Management",
                desc: "Audit log of all material movements, receipting, adjustments, and picking reductions.",
                metrics: [
                    { label: "Total Transactions logged", value: "18,924 logs", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Txn ID", "Timestamp", "SKU", "Transaction Type", "Qty Shift", "Operator"],
                data: [
                    { "Txn ID": "#TXN-99823", "Timestamp": "12-Jun 14:22", "SKU": "8904271201147", "Transaction Type": "Order Pick Reduction", "Qty Shift": "-1", "Operator": "Vignesh S" },
                    { "Txn ID": "#TXN-99822", "Timestamp": "12-Jun 13:05", "SKU": "8901396350309", "Transaction Type": "GRN Stock Inbound", "Qty Shift": "+50", "Operator": "Dinesh G" }
                ]
            };
        }
        if (path.includes("/inventory/darkhouse-adjustment")) {
            return {
                title: "Dark House Adjustment",
                module: "Inventory Management",
                desc: "Record adjustments and corrections for store-level dark house inventory.",
                metrics: [
                    { label: "Adjustments (Today)", value: "4 requests", icon: Clock, color: "#f59e0b" }
                ],
                columns: ["Request ID", "Hub Name", "SKU", "Quantity Delta", "Discrepancy Reason", "Status"],
                data: [
                    { "Request ID": "#DHADJ-102", "Hub Name": "Koramangala Hub", "SKU": "8901262010125", "Quantity Delta": "-4", "Discrepancy Reason": "Expired milk discarded", "Status": "Approved" },
                    { "Request ID": "#DHADJ-103", "Hub Name": "Whitefield Hub", "SKU": "8901491321015", "Quantity Delta": "-2", "Discrepancy Reason": "Damaged package", "Status": "Pending" }
                ]
            };
        }
        if (path.includes("/inventory/darkhouse-history")) {
            return {
                title: "Dark House Inventory History",
                module: "Inventory Management",
                desc: "Trace inventory levels and adjustments histories for all dark store hubs.",
                metrics: [
                    { label: "Active Store Hubs", value: "8 nodes", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Event ID", "Hub Name", "Timestamp", "SKU Code", "Change Qty", "Status"],
                data: [
                    { "Event ID": "#DHEVT-5501", "Hub Name": "Koramangala Hub", "Timestamp": "12-Jun 15:10", "SKU Code": "8901262010125", "Change Qty": "-1", "Status": "Dispatched" },
                    { "Event ID": "#DHEVT-5502", "Hub Name": "Koramangala Hub", "Timestamp": "12-Jun 11:40", "SKU Code": "8901396350309", "Change Qty": "+12", "Status": "Inbound Receipt" }
                ]
            };
        }

        // Module 6: GRN
        if (path.includes("/grn")) {
            return {
                title: path.includes("create") ? "Create GRN" : path.includes("details") ? "GRN Details" : "GRN (Goods Receipt Note) List",
                module: "GRN (Goods Receipt Note)",
                desc: "Generate and review Goods Receipt Notes for supplier shipments.",
                metrics: [
                    { label: "Pending PO Deliveries", value: "3 orders", icon: Clock, color: "#f59e0b" },
                    { label: "Receipted Value (Today)", value: "₹4,12,500", icon: TrendingUp, color: "#10b981" }
                ],
                columns: ["GRN Code", "Purchase Order Ref", "Supplier Name", "Items Count", "Receipt Date", "Status"],
                data: [
                    { "GRN Code": "GRN-2026-081", "Purchase Order Ref": "PO-88210", "Supplier Name": "Hindustan Unilever Ltd", "Items Count": "1,200 Pcs", "Receipt Date": "12-Jun-2026", "Status": "Completed" },
                    { "GRN Code": "GRN-2026-082", "Purchase Order Ref": "PO-88214", "Supplier Name": "Amul Dairy Corp", "Items Count": "650 Pcs", "Receipt Date": "12-Jun-2026", "Status": "Pending Approval" }
                ]
            };
        }

        // Module 7: Indents
        if (path.includes("/indent")) {
            let statusText = "";
            if (path.includes("pending")) statusText = " - Pending";
            if (path.includes("approved")) statusText = " - Approved";
            if (path.includes("rejected")) statusText = " - Rejected";

            return {
                title: path.includes("create") ? "Create Indent" : path.includes("details") ? "Indent Details" : `Indent List${statusText}`,
                module: "Indent Management",
                desc: "Examine store replenishment indents and approve transfer request queues.",
                metrics: [
                    { label: "Pending Indents", value: "8 indents", icon: Clock, color: "#f59e0b" },
                    { label: "Replenished SKU Items", value: "1,420 units", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Indent ID", "Requesting Hub", "Request Date", "Requested SKUs", "Fulfillment Status", "Action Status"],
                data: [
                    { "Indent ID": "#IND-7782", "Requesting Hub": "Koramangala Hub", "Request Date": "12-Jun-2026", "Requested SKUs": "5 items (240 units)", "Fulfillment Status": "Partially Filled", "Action Status": "Pending Approval" },
                    { "Indent ID": "#IND-7781", "Requesting Hub": "Whitefield Hub", "Request Date": "11-Jun-2026", "Requested SKUs": "2 items (110 units)", "Fulfillment Status": "Filled", "Action Status": "Approved" }
                ]
            };
        }

        // Module 8: Dispatch
        if (path.includes("/dispatch")) {
            return {
                title: path.includes("create") ? "Create Dispatch" : path.includes("details") ? "Dispatch Details" : path.includes("tracking") ? "Dispatch Tracking" : "Dispatch List",
                module: "Dispatch Management",
                desc: "Manage warehouse outbound dispatches, carrier details, and shipment manifests.",
                metrics: [
                    { label: "Active Dispatches", value: "6 vehicles", icon: Clock, color: "#1e60ff" },
                    { label: "Delivered (Today)", value: "18 routes", icon: CheckCircle, color: "#10b981" }
                ],
                columns: ["Dispatch ID", "Target Darkhouse", "Carrier / Driver", "Shipment Volume", "Departure Time", "Tracking State"],
                data: [
                    { "Dispatch ID": "#DSP-4401", "Target Darkhouse": "Koramangala Hub", "Carrier / Driver": "Ramesh Kumar (KA-03-A-1244)", "Shipment Volume": "350 units", "Departure Time": "12-Jun 11:30", "Tracking State": "In Transit" },
                    { "Dispatch ID": "#DSP-4402", "Target Darkhouse": "Whitefield Hub", "Carrier / Driver": "Suresh Dev (KA-51-B-8831)", "Shipment Volume": "610 units", "Departure Time": "12-Jun 09:15", "Tracking State": "Delivered" }
                ]
            };
        }

        // Module 9: Receiving
        if (path.includes("/receiving")) {
            return {
                title: path.includes("pending") ? "Pending Receipts" : path.includes("process") ? "Receive Dispatch" : "Receipt History",
                module: "Receiving Management",
                desc: "Check inbound shipments and receipt material deliveries against PO manifests.",
                metrics: [
                    { label: "Inbound Transit shipments", value: "3 dispatches", icon: Clock, color: "#f59e0b" }
                ],
                columns: ["Receipt ID", "PO/Dispatch Ref", "Source Warehouse", "SKUs count", "Arrival Time", "Status"],
                data: [
                    { "Receipt ID": "#REC-8891", "PO/Dispatch Ref": "#DSP-4401", "Source Warehouse": "Bengaluru Central Hub", "SKUs count": "3 items (350 units)", "Arrival Time": "Est. 12-Jun 16:30", "Status": "In Transit" },
                    { "Receipt ID": "#REC-8890", "PO/Dispatch Ref": "#DSP-4399", "Source Warehouse": "Bengaluru Central Hub", "SKUs count": "6 items (720 units)", "Arrival Time": "12-Jun 10:12", "Status": "Receipted" }
                ]
            };
        }

        // Module 10: Reports
        if (path.includes("/reports")) {
            let reportType = "WMS Analytics Report";
            if (path.includes("inventory-summary")) reportType = "Inventory Summary Report";
            if (path.includes("low-stock")) reportType = "Low Stock Report";
            if (path.includes("inventory-movement")) reportType = "Inventory Movement Report";
            if (path.includes("indent")) reportType = "Indent Summary Report";
            if (path.includes("dispatch")) reportType = "Dispatch Summary Report";
            if (path.includes("receiving")) reportType = "Receiving Summary Report";
            if (path.includes("order-summary")) reportType = "Order Summary Report";
            if (path.includes("orders-by-darkhouse")) reportType = "Orders by Dark House";
            if (path.includes("top-selling")) reportType = "Top Selling Products";
            if (path.includes("order-status")) reportType = "Order Status Report";

            return {
                title: reportType,
                module: "Reports",
                desc: "Generate, inspect, and export system performance records and operational logs.",
                metrics: [
                    { label: "Total Reports Generated", value: "148 records", icon: Database, color: "#1e60ff" }
                ],
                columns: ["Report ID", "File Name", "Created Date", "Generated By", "Format", "Status"],
                data: [
                    { "Report ID": "#REP-9023", "File Name": `${reportType.replace(/\s+/g, "_")}_May2026.csv`, "Created Date": "01-Jun-2026", "Generated By": "Dinesh GK", "Format": "CSV/Excel", "Status": "Download Ready" },
                    { "Report ID": "#REP-9022", "File Name": `${reportType.replace(/\s+/g, "_")}_Q2_Forecast.pdf`, "Created Date": "28-May-2026", "Generated By": "System Auto", "Format": "PDF Document", "Status": "Download Ready" }
                ]
            };
        }

        // Module 11: Orders (New Submodules)
        if (path.includes("/orders")) {
            let orderSub = "Order Management";
            if (path.includes("list")) orderSub = "Order List";
            if (path.includes("details")) orderSub = "Order Details";
            if (path.includes("query")) orderSub = "New Order Query";
            if (path.includes("picking")) orderSub = "Order Picking Queue";
            if (path.includes("packing")) orderSub = "Order Packing Queue";
            if (path.includes("delivery")) orderSub = "Delivery Management";
            if (path.includes("cancelled")) orderSub = "Cancelled Orders List";

            return {
                title: orderSub,
                module: "Orders",
                desc: "Configure, sort, and process WMS delivery orders.",
                metrics: [
                    { label: "Active Orders", value: "85 queue", icon: Clock, color: "#1e60ff" },
                    { label: "Complete (Today)", value: "340 orders", icon: CheckCircle, color: "#10b981" }
                ],
                columns: ["Order Code", "Date Created", "Customer Name", "Items Count", "Amount", "Status"],
                data: [
                    { "Order Code": "#ORD-8821", "Date Created": "01-Jun-2026", "Customer Name": "Sophia Bennett", "Items Count": "3 items", "Amount": "₹249.00", "Status": "Pending" },
                    { "Order Code": "#ORD-8820", "Date Created": "01-Jun-2026", "Customer Name": "Marcus Johnson", "Items Count": "1 item", "Amount": "₹59.95", "Status": "Picking" },
                    { "Order Code": "#ORD-8816", "Date Created": "30-May-2026", "Customer Name": "Liam O'Brien", "Items Count": "1 item", "Amount": "₹78.50", "Status": "Cancelled" }
                ]
            };
        }

        // Default Fallback
        return {
            title: "Dynamic Feature Page",
            module: "WMS Core",
            desc: "Active operational panel linked directly to your database.",
            metrics: [
                { label: "Operational State", value: "Active", icon: Activity, color: "#1e60ff" }
            ],
            columns: ["ID", "Feature Name", "Sync Date", "State"],
            data: [
                { "ID": "SYS-901", "Feature Name": "Operational Interface Live", "Sync Date": "12-Jun-2026", "State": "Completed" }
            ]
        };
    };

    const details = getPageDetails(path);
    const Metrics = details.metrics || [];

    const filteredData = details.data.filter(row => {
        const text = Object.values(row).join(" ").toLowerCase();
        return text.includes(searchTerm.toLowerCase());
    });

    return (
        <div style={styles.container}>
            {/* Header and Breadcrumbs */}
            <div style={styles.headerBlock}>
                <div style={styles.breadcrumbs}>
                    <span>Home</span>
                    <span style={styles.divider}>/</span>
                    <span>{details.module}</span>
                    <span style={styles.divider}>/</span>
                    <span style={styles.breadcrumbActive}>{details.title}</span>
                </div>
                
                <div style={styles.titleRow}>
                    <div>
                        <h1 style={styles.mainTitle}>{details.title}</h1>
                        <p style={styles.description}>{details.desc}</p>
                    </div>
                    <button onClick={handleRefresh} style={styles.refreshBtn}>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: isRefreshing ? "spin 0.8s linear infinite" : "none" }} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div style={styles.metricsGrid}>
                {Metrics.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <div key={idx} style={styles.metricCard}>
                            <div style={styles.metricHeader}>
                                <span style={styles.metricLabel}>{m.label}</span>
                                <div style={{ ...styles.metricIconWrap, backgroundColor: `${m.color}15`, color: m.color }}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <span style={styles.metricValue}>{m.value}</span>
                        </div>
                    );
                })}
            </div>

            {/* Main Data Panel */}
            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <div style={styles.searchWrap}>
                        <Search size={16} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Filter records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    
                    <button style={styles.actionBtn}>
                        <Download size={14} style={{ marginRight: 6 }} />
                        Export Sheet
                    </button>
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.trHead}>
                                {details.columns.map((col, idx) => (
                                    <th key={idx} style={styles.th}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIdx) => (
                                    <tr key={rowIdx} style={rowIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        {details.columns.map((col, colIdx) => {
                                            const val = row[col] || "-";
                                            const isStatus = col.toLowerCase() === "status" || col.toLowerCase() === "tracking state" || col.toLowerCase() === "action status";
                                            
                                            // Status Badge helper formatting
                                            if (isStatus) {
                                                const status = String(val).toLowerCase();
                                                const bg = status.includes("delivered") || status.includes("active") || status.includes("healthy") || status.includes("approved") || status.includes("completed") || status.includes("filled")
                                                    ? "#ECFDF5" : status.includes("pending") || status.includes("in transit") || status.includes("picking") || status.includes("processing") || status.includes("shipped")
                                                    ? "#FEF3C7" : "#FEE2E2";
                                                const fg = status.includes("delivered") || status.includes("active") || status.includes("healthy") || status.includes("approved") || status.includes("completed") || status.includes("filled")
                                                    ? "#059669" : status.includes("pending") || status.includes("in transit") || status.includes("picking") || status.includes("processing") || status.includes("shipped")
                                                    ? "#d97706" : "#ef4444";
                                                return (
                                                    <td key={colIdx} style={styles.td}>
                                                        <span style={{ ...styles.badge, backgroundColor: bg, color: fg }}>{val}</span>
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td key={colIdx} style={styles.td}>{val}</td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={details.columns.length} style={styles.noRecords}>
                                        No matching records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// Clean, high-end responsive CSS variables and designs matching HAATZA's WMS
const styles = {
    container: {
        padding: "30px",
        background: "#F6F8FF",
        minHeight: "calc(100vh - 70px)",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    headerBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    breadcrumbs: {
        fontSize: "12px",
        color: "#94a3b8",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    divider: {
        fontSize: "11px",
        color: "#cbd5e1"
    },
    breadcrumbActive: {
        color: "#1e60ff"
    },
    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
    },
    mainTitle: {
        fontSize: "26px",
        fontWeight: "800",
        color: "#0f172a",
        margin: 0
    },
    description: {
        fontSize: "14px",
        color: "#64748b",
        margin: "4px 0 0 0",
        fontWeight: "500"
    },
    refreshBtn: {
        display: "flex",
        alignItems: "center",
        padding: "8px 14px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
    },
    metricCard: {
        background: "#ffffff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 18px rgba(30, 96, 255, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)",
        border: "1px solid #eef2f6",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    metricHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    metricLabel: {
        fontSize: "13px",
        color: "#64748b",
        fontWeight: "700"
    },
    metricIconWrap: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    metricValue: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#0f172a"
    },
    tableCard: {
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(30, 96, 255, 0.03), 0 1px 3px rgba(0, 0, 0, 0.01)",
        border: "1px solid #eef2f6",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
    },
    searchWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "320px"
    },
    searchIcon: {
        position: "absolute",
        left: "14px",
        color: "#94a3b8"
    },
    searchInput: {
        width: "100%",
        height: "40px",
        padding: "0 14px 0 40px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "14px",
        color: "#0f172a",
        outline: "none",
        fontFamily: "inherit",
        transition: "all 0.2s ease"
    },
    actionBtn: {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        background: "#1e60ff",
        color: "#ffffff",
        border: "none",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(30, 96, 255, 0.15)"
    },
    tableWrapper: {
        width: "100%",
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: "14px"
    },
    trHead: {
        borderBottom: "2px solid #f1f5f9"
    },
    th: {
        padding: "12px 16px",
        color: "#475569",
        fontWeight: "700",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    td: {
        padding: "16px",
        color: "#334155",
        fontWeight: "600",
        borderBottom: "1px solid #f1f5f9"
    },
    trEven: {
        backgroundColor: "#ffffff"
    },
    trOdd: {
        backgroundColor: "#f8fafc"
    },
    badge: {
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.2px",
        display: "inline-block"
    },
    noRecords: {
        padding: "36px",
        textAlign: "center",
        color: "#94a3b8",
        fontWeight: "600"
    }
};
