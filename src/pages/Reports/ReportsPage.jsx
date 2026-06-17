import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Download, 
    FileText, 
    RefreshCw, 
    AlertCircle, 
    Loader2, 
    Calendar, 
    HardDrive, 
    Clock, 
    Search,
    ChevronRight,
    TrendingUp,
    ShieldAlert,
    Activity,
    Layers,
    Truck,
    PackageCheck,
    CheckCircle
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import "./ReportsPage.css";

// ─── 10 Report Templates Configuration with Mock Data ──────────────────────────────────────
const REPORT_TEMPLATES = [
    {
        id: "inventory-summary",
        title: "Inventory Summary Report",
        description: "Summary of total stock, valuation, and SKU counts across all warehouses.",
        icon: FileText,
        stats: [
            { label: "Total SKUs", value: "4,218", badge: "+12% MoM", color: "blue" },
            { label: "Total Valuation", value: "₹4,12,80,000", badge: "Live Value", color: "green" },
            { label: "Average Turnover", value: "18.4 days", badge: "Optimal", color: "purple" }
        ],
        headers: ["SKU Code", "Product Name", "Category", "In-Stock", "Avg Cost", "Stock Value", "Status"],
        data: [
            { col1: "SKU-IPH15-PRO", col2: "iPhone 15 Pro Max", col3: "Electronics", col4: "450 units", col5: "₹1,15,000", col6: "₹5,17,50,000", col7: "In Stock", col7Class: "status-active" },
            { col1: "SKU-SNY-WH1000", col2: "Sony WH-1000XM5 Headphones", col3: "Accessories", col4: "180 units", col5: "₹24,999", col6: "₹44,99,820", col7: "In Stock", col7Class: "status-active" },
            { col1: "SKU-SAM-S24U", col2: "Samsung Galaxy S24 Ultra", col3: "Electronics", col4: "12 units", col5: "₹1,24,999", col6: "₹14,99,988", col7: "Critical Low", col7Class: "status-suspended" },
            { col1: "SKU-APP-WCH9", col2: "Apple Watch Series 9", col3: "Electronics", col4: "320 units", col5: "₹41,900", col6: "₹1,34,08,000", col7: "In Stock", col7Class: "status-active" },
            { col1: "SKU-LOG-MXM3", col2: "Logitech MX Master 3S Mouse", col3: "Accessories", col4: "650 units", col5: "₹9,495", col6: "₹61,71,750", col7: "In Stock", col7Class: "status-active" }
        ]
    },
    {
        id: "low-stock",
        title: "Low Stock Report",
        description: "Identifies items currently below safety stock thresholds.",
        icon: ShieldAlert,
        stats: [
            { label: "Low Stock SKUs", value: "28 SKUs", badge: "Action Needed", color: "red" },
            { label: "Critical Alerts", value: "6 SKUs", badge: "Depleted", color: "red" },
            { label: "Reorder Estimate", value: "₹18,40,000", badge: "Estimated Cost", color: "blue" }
        ],
        headers: ["SKU Code", "Product Name", "Current Stock", "Safety Stock", "Reorder Point", "Supplier Name", "Action Required"],
        data: [
            { col1: "SKU-SAM-S24U", col2: "Samsung Galaxy S24 Ultra", col3: "12 units", col4: "30 units", col5: "15 units", col6: "Samsung India Ltd.", col7: "Order Now", col7Class: "status-suspended" },
            { col1: "SKU-APP-WCH9", col2: "Apple Watch Series 9", col3: "18 units", col4: "40 units", col5: "20 units", col6: "Apple Distribution", col7: "Reorder Alert", col7Class: "status-pending" },
            { col1: "SKU-SNY-WH1000", col2: "Sony WH-1000XM5", col3: "8 units", col4: "25 units", col5: "10 units", col6: "Sony Electronics", col7: "Critical Alert", col7Class: "status-suspended" },
            { col1: "SKU-HP-VIC16", col2: "HP Victus 16 Laptop", col3: "4 units", col4: "10 units", col5: "5 units", col6: "HP Enterprise", col7: "Order Now", col7Class: "status-suspended" },
            { col1: "SKU-MNT-DELL27", col2: "Dell 27\" 4K Monitor", col3: "9 units", col4: "20 units", col5: "10 units", col6: "Dell India Pvt Ltd", col7: "Reorder Alert", col7Class: "status-pending" }
        ]
    },
    {
        id: "inventory-movement",
        title: "Inventory Movement Report",
        description: "Chronological stock transfers, adjustments, and velocity.",
        icon: Activity,
        stats: [
            { label: "Inward Txns", value: "840 logs", badge: "+15% WoW", color: "green" },
            { label: "Outward Txns", value: "712 logs", badge: "Fulfillment", color: "blue" },
            { label: "Transfers Count", value: "288 transfers", badge: "Hub Movements", color: "purple" }
        ],
        headers: ["Txn ID", "SKU Code", "Product Name", "Movement Type", "Qty Shifted", "Date & Time", "Authorized By"],
        data: [
            { col1: "TXN-98421", col2: "SKU-IPH15-PRO", col3: "iPhone 15 Pro Max", col4: "Inward (Supplier)", col5: "+150 units", col6: "2026-06-15 10:14", col7: "Dinesh Kumar", col7Class: "status-active" },
            { col1: "TXN-98420", col2: "SKU-LOG-MXM3", col3: "Logitech MX Master 3S", col4: "Outward (Sales)", col5: "-12 units", col6: "2026-06-15 09:45", col7: "Rakesh Sharma", col7Class: "status-inactive" },
            { col1: "TXN-98419", col2: "SKU-SNY-WH1000", col3: "Sony WH-1000XM5", col4: "Transfer (Hub East)", col5: "-30 units", col6: "2026-06-15 08:30", col7: "Pooja Patel", col7Class: "status-pending" },
            { col1: "TXN-98418", col2: "SKU-SAM-S24U", col3: "Samsung Galaxy S24 Ultra", col4: "Stock Adjustment", col5: "+2 units", col6: "2026-06-14 17:10", col7: "Amit Singh", col7Class: "status-active" },
            { col1: "TXN-98417", col2: "SKU-APP-WCH9", col3: "Apple Watch Series 9", col4: "Inward (Supplier)", col5: "+80 units", col6: "2026-06-14 15:30", col7: "Dinesh Kumar", col7Class: "status-active" }
        ]
    },
    {
        id: "indent",
        title: "Indent Report",
        description: "Requests and fulfillment status for darkhouses and hubs.",
        icon: Layers,
        stats: [
            { label: "Pending Indents", value: "8 requests", badge: "Review Pending", color: "red" },
            { label: "Approved Today", value: "24 indents", badge: "Dispatched", color: "green" },
            { label: "Avg Fulfillment", value: "1.8 hours", badge: "High Velocity", color: "purple" }
        ],
        headers: ["Indent No.", "Source Hub", "Destination Hub", "Total Items", "Created Date", "Priority", "Status"],
        data: [
            { col1: "IND-0085", col2: "Darkhouse Hub East", col3: "Central Hub Alpha", col4: "14 SKUs (140 units)", col5: "2026-06-15", col6: "High", col7: "Approved", col7Class: "status-active" },
            { col1: "IND-0084", col2: "Darkhouse Hub South", col3: "Central Hub Alpha", col4: "8 SKUs (45 units)", col5: "2026-06-15", col6: "Medium", col7: "Pending", col7Class: "status-pending" },
            { col1: "IND-0083", col2: "Darkhouse Hub North", col3: "Central Hub Alpha", col4: "22 SKUs (260 units)", col5: "2026-06-14", col6: "Critical", col7: "In Transit", col7Class: "status-pending" },
            { col1: "IND-0082", col2: "Darkhouse Hub West", col3: "Central Hub Alpha", col4: "5 SKUs (18 units)", col5: "2026-06-14", col6: "Low", col7: "Fulfilled", col7Class: "status-inactive" },
            { col1: "IND-0081", col2: "Darkhouse Hub East", col3: "Central Hub Alpha", col4: "12 SKUs (80 units)", col5: "2026-06-13", col6: "High", col7: "Fulfilled", col7Class: "status-inactive" }
        ]
    },
    {
        id: "dispatch",
        title: "Dispatch Report",
        description: "Outgoing shipping orders and courier dispatches.",
        icon: Truck,
        stats: [
            { label: "Total Dispatched", value: "1,840 pkgs", badge: "Today", color: "green" },
            { label: "On-Time Dispatch", value: "98.2%", badge: "High SLA", color: "green" },
            { label: "Pending Pickup", value: "34 pkgs", badge: "Courier Queue", color: "blue" }
        ],
        headers: ["AWB Number", "Order ID", "Logistic Partner", "Destination City", "Dispatch Weight", "Departure Time", "Tracking Status"],
        data: [
            { col1: "AWB-482910", col2: "ORD-98124", col3: "Blue Dart", col4: "Mumbai Hub", col5: "1.8 kg", col6: "10:45 AM", col7: "Dispatched", col7Class: "status-active" },
            { col1: "AWB-482909", col2: "ORD-98123", col3: "Delhivery", col4: "Delhi NCR", col5: "0.5 kg", col6: "10:30 AM", col7: "In Transit", col7Class: "status-pending" },
            { col1: "AWB-482908", col2: "ORD-98122", col3: "FedEx India", col4: "Bangalore", col5: "4.2 kg", col6: "09:15 AM", col7: "Delivered", col7Class: "status-active" },
            { col1: "AWB-482907", col2: "ORD-98121", col3: "Blue Dart", col4: "Pune City", col5: "2.1 kg", col6: "08:45 AM", col7: "Delivered", col7Class: "status-active" },
            { col1: "AWB-482906", col2: "ORD-98120", col3: "Delhivery", col4: "Hyderabad", col5: "1.1 kg", col6: "08:00 AM", col7: "Returned", col7Class: "status-suspended" }
        ]
    },
    {
        id: "receiving",
        title: "Receiving Report",
        description: "Inward GRNs (Goods Received Notes) and supplier shipments.",
        icon: PackageCheck,
        stats: [
            { label: "PO Received", value: "48 POs", badge: "Verified", color: "green" },
            { label: "Quality Pass Rate", value: "99.4%", badge: "Excellent", color: "green" },
            { label: "Received Value", value: "₹89,50,000", badge: "Cost Basis", color: "blue" }
        ],
        headers: ["GRN Code", "PO Number", "Supplier Name", "Items Received", "Received Date", "QC Officer", "Verification Status"],
        data: [
            { col1: "GRN-8542", col2: "PO-2026-091", col3: "Ingram Micro India", col4: "240 units", col5: "2026-06-15", col6: "Ramesh Lal", col7: "Verified", col7Class: "status-active" },
            { col1: "GRN-8541", col2: "PO-2026-090", col3: "Apple Distribution", col4: "120 units", col5: "2026-06-15", col6: "Ramesh Lal", col7: "QC Check", col7Class: "status-pending" },
            { col1: "GRN-8540", col2: "PO-2026-089", col3: "Samsung India Pvt", col4: "85 units", col5: "2026-06-14", col6: "Suresh Kumar", col7: "Verified", col7Class: "status-active" },
            { col1: "GRN-8539", col2: "PO-2026-088", col3: "Sony Logistics", col4: "50 units", col5: "2026-06-14", col6: "Ramesh Lal", col7: "Verified", col7Class: "status-active" },
            { col1: "GRN-8538", col2: "PO-2026-087", col3: "Redington Ltd", col4: "310 units", col5: "2026-06-13", col6: "Suresh Kumar", col7: "Damages Found", col7Class: "status-suspended" }
        ]
    },
    {
        id: "order-summary",
        title: "Order Summary Report",
        description: "Daily/weekly sales order volume and fulfillment rates.",
        icon: CheckCircle,
        stats: [
            { label: "Total Orders", value: "3,412 orders", badge: "Live Pipeline", color: "blue" },
            { label: "Fulfillment Rate", value: "98.4%", badge: "Optimal", color: "green" },
            { label: "Revenue Total", value: "₹1,24,18,000", badge: "Net Sales", color: "green" }
        ],
        headers: ["Order ID", "Customer Name", "Destination Hub", "Items Count", "Total Amount", "Order Date", "Fulfillment Status"],
        data: [
            { col1: "ORD-98124", col2: "Rohan Sharma", col3: "Mumbai Central", col4: "4 items", col5: "₹1,24,500", col6: "2026-06-15", col7: "Processing", col7Class: "status-pending" },
            { col1: "ORD-98123", col2: "Neha Gupta", col3: "Delhi Hub", col4: "2 items", col5: "₹26,500", col6: "2026-06-15", col7: "Shipped", col7Class: "status-active" },
            { col1: "ORD-98122", col2: "Vikram Singh", col3: "Bangalore Hub", col4: "1 item", col5: "₹1,15,000", col6: "2026-06-15", col7: "Delivered", col7Class: "status-active" },
            { col1: "ORD-98121", col2: "Priya Patel", col3: "Ahmedabad Hub", col4: "5 items", col5: "₹14,200", col6: "2026-06-14", col7: "Delivered", col7Class: "status-active" },
            { col1: "ORD-98120", col2: "Abhijit Sen", col3: "Kolkata Hub", col4: "3 items", col5: "₹48,900", col6: "2026-06-14", col7: "Cancelled", col7Class: "status-suspended" }
        ]
    },
    {
        id: "orders-by-darkhouse",
        title: "Orders by Dark House",
        description: "Breakdown of customer orders fulfilled by each darkhouse.",
        icon: Calendar,
        stats: [
            { label: "Active Darkhouses", value: "8 Hubs", badge: "Fully Online", color: "blue" },
            { label: "Top Volume Hub", value: "DH North Hub", badge: "840 orders", color: "green" },
            { label: "Average Volume", value: "245 orders/hub", badge: "Optimal Load", color: "purple" }
        ],
        headers: ["Darkhouse ID", "Hub Name", "Total Orders", "Fulfilled Orders", "Pending Orders", "Sales Contribution", "Load Status"],
        data: [
            { col1: "DH-NORTH", col2: "Darkhouse North Hub", col3: "840 orders", col4: "812 orders", col5: "28 orders", col6: "34.5%", col7: "High Load", col7Class: "status-pending" },
            { col1: "DH-EAST", col2: "Darkhouse East Hub", col3: "620 orders", col4: "598 orders", col5: "22 orders", col6: "25.1%", col7: "Normal", col7Class: "status-active" },
            { col1: "DH-SOUTH", col2: "Darkhouse South Hub", col3: "480 orders", col4: "465 orders", col5: "15 orders", col6: "18.2%", col7: "Normal", col7Class: "status-active" },
            { col1: "DH-WEST", col2: "Darkhouse West Hub", col3: "310 orders", col4: "290 orders", col5: "20 orders", col6: "12.8%", col7: "Underloaded", col7Class: "status-inactive" },
            { col1: "DH-CENTRAL", col2: "Darkhouse Central Hub", col3: "162 orders", col4: "160 orders", col5: "2 orders", col6: "9.4%", col7: "Underloaded", col7Class: "status-inactive" }
        ]
    },
    {
        id: "top-selling",
        title: "Top Selling Products",
        description: "Bestselling inventory items by quantity and revenue.",
        icon: TrendingUp,
        stats: [
            { label: "Top SKU Sales", value: "₹5,17,50,000", badge: "iPhone 15 Pro", color: "green" },
            { label: "Category Share", value: "Electronics (68%)", badge: "Dominant", color: "blue" },
            { label: "Low-Stock Risks", value: "1 Critical", badge: "SAM-S24U", color: "red" }
        ],
        headers: ["Rank", "SKU Code", "Product Name", "Category", "Units Sold", "Sales Revenue", "Stock Status"],
        data: [
            { col1: "#1", col2: "SKU-IPH15-PRO", col3: "iPhone 15 Pro Max", col4: "Electronics", col5: "450 units", col6: "₹5,17,50,000", col7: "In Stock", col7Class: "status-active" },
            { col1: "#2", col2: "SKU-LOG-MXM3", col3: "Logitech MX Master 3S", col4: "Accessories", col5: "650 units", col6: "₹61,71,750", col7: "In Stock", col7Class: "status-active" },
            { col1: "#3", col2: "SKU-SAM-S24U", col3: "Samsung Galaxy S24 Ultra", col4: "Electronics", col5: "45 units", col6: "₹56,24,955", col7: "Critical Low", col7Class: "status-suspended" },
            { col1: "#4", col2: "SKU-SNY-WH1000", col3: "Sony WH-1000XM5", col4: "Accessories", col5: "180 units", col6: "₹44,99,820", col7: "In Stock", col7Class: "status-active" },
            { col1: "#5", col2: "SKU-APP-WCH9", col3: "Apple Watch Series 9", col4: "Electronics", col5: "80 units", col6: "₹33,52,000", col7: "Low Stock", col7Class: "status-pending" }
        ]
    },
    {
        id: "order-status",
        title: "Order Status Report",
        description: "Status tracking (pending, picking, packing, shipped, delivered) breakdown.",
        icon: Clock,
        stats: [
            { label: "Picking Pipeline", value: "45 orders", badge: "Critical Priority", color: "blue" },
            { label: "Packing Table", value: "28 orders", badge: "In Progress", color: "purple" },
            { label: "Transit / Shipped", value: "312 orders", badge: "Dispatched", color: "green" }
        ],
        headers: ["Order ID", "Customer Email", "Pipeline Phase", "Assigned Operator", "Duration in Phase", "Updated Time", "Priority Level"],
        data: [
            { col1: "ORD-98124", col2: "rohan.sharma@gmail.com", col3: "Picking Stage", col4: "Manoj Kumar", col5: "12 mins", col6: "10:35 AM", col7: "High Priority", col7Class: "status-suspended" },
            { col1: "ORD-98123", col2: "neha.g@yahoo.com", col3: "Packing Stage", col4: "Sunita Rao", col5: "8 mins", col6: "10:20 AM", col7: "Normal", col7Class: "status-pending" },
            { col1: "ORD-98122", col2: "vikram.s@outlook.com", col3: "Shipped / In Transit", col4: "Auto-Assign", col5: "1.5 hours", col6: "09:15 AM", col7: "High Priority", col7Class: "status-active" },
            { col1: "ORD-98121", col2: "priya.patel@gmail.com", col3: "Delivered", col4: "Auto-Assign", col5: "3.2 hours", col6: "08:45 AM", col7: "Normal", col7Class: "status-active" },
            { col1: "ORD-98120", col2: "abhijit.sen@live.com", col3: "Cancelled", col4: "System Auto", col5: "—", col6: "08:00 AM", col7: "Low Priority", col7Class: "status-inactive" }
        ]
    }
];

function ReportsPage() {
    const { reportType } = useParams();
    const navigate = useNavigate();

    const activeReportId = reportType || "inventory-summary";

    const templates = useMemo(() => {
        const list = [...REPORT_TEMPLATES];
        
        // Load live data
        const indents = JSON.parse(localStorage.getItem("haatza_indent_requests") || "[]");
        const ledger = JSON.parse(localStorage.getItem("haatza_inventory_ledger") || "[]");
        const products = JSON.parse(localStorage.getItem("haatza_products") || "[]");
        const transactions = JSON.parse(localStorage.getItem("haatza_inventory_transactions") || "[]");

        // 1. Inventory Summary Report
        const invSummaryIdx = list.findIndex(r => r.id === "inventory-summary");
        if (invSummaryIdx !== -1) {
            const totalSKUs = ledger.length;
            const totalValuation = ledger.reduce((acc, item) => {
                const prod = products.find(p => p.sku === item.sku);
                const price = prod ? prod.sellingPrice : 50;
                return acc + (item.available * price);
            }, 0);
            
            const dataRows = ledger.map(l => ({
                col1: l.sku,
                col2: l.productName,
                col3: l.category,
                col4: `${l.available} units`,
                col5: `₹${products.find(p => p.sku === l.sku)?.sellingPrice || 50}`,
                col6: `₹${l.available * (products.find(p => p.sku === l.sku)?.sellingPrice || 50)}`,
                col7: l.status,
                col7Class: l.status === "In Stock" ? "status-active" : "status-suspended"
            }));

            list[invSummaryIdx] = {
                ...list[invSummaryIdx],
                stats: [
                    { label: "Total SKUs", value: totalSKUs.toString(), badge: "Active Master", color: "blue" },
                    { label: "Total Valuation", value: `₹${totalValuation.toLocaleString("en-IN")}`, badge: "Live Ledger", color: "green" },
                    { label: "Ledger Entries", value: ledger.length.toString(), badge: "Optimal", color: "purple" }
                ],
                data: dataRows
            };
        }

        // 2. Low Stock Report
        const lowStockIdx = list.findIndex(r => r.id === "low-stock");
        if (lowStockIdx !== -1) {
            const lowItems = ledger.filter(l => l.available <= l.reorderPoint);
            const dataRows = lowItems.map(l => ({
                col1: l.sku,
                col2: l.productName,
                col3: `${l.available} units`,
                col4: `${l.reorderPoint} units`,
                col5: `${l.reorderPoint} units`,
                col6: "Primary Mother Hub",
                col7: l.available === 0 ? "Depleted" : "Low Stock",
                col7Class: l.available === 0 ? "status-suspended" : "status-pending"
            }));

            list[lowStockIdx] = {
                ...list[lowStockIdx],
                stats: [
                    { label: "Low Stock SKUs", value: `${lowItems.length} SKUs`, badge: "Alert Active", color: "red" },
                    { label: "Critical Alerts", value: `${lowItems.filter(l => l.available === 0).length} SKUs`, badge: "Out of Stock", color: "red" },
                    { label: "Safety Level", value: "85%", badge: "Safety Buffer", color: "blue" }
                ],
                data: dataRows
            };
        }

        // 3. Inventory Movement Report
        const movementIdx = list.findIndex(r => r.id === "inventory-movement");
        if (movementIdx !== -1) {
            const dataRows = transactions.map(t => ({
                col1: t.transactionId,
                col2: t.sku,
                col3: t.productName,
                col4: t.type,
                col5: `${t.quantity > 0 ? "+" : ""}${t.quantity} units`,
                col6: new Date(t.timestamp).toLocaleDateString(),
                col7: t.user,
                col7Class: "status-active"
            }));

            list[movementIdx] = {
                ...list[movementIdx],
                stats: [
                    { label: "Total Transactions", value: `${transactions.length} logs`, badge: "Audit Trail", color: "green" },
                    { label: "Inward Actions", value: `${transactions.filter(t => t.type.includes("Received")).length} logs`, color: "blue" },
                    { label: "Outward Actions", value: `${transactions.filter(t => t.type.includes("Dispatched")).length} logs`, color: "purple" }
                ],
                data: dataRows
            };
        }

        // 4. Indent Report
        const indentIdx = list.findIndex(r => r.id === "indent");
        if (indentIdx !== -1) {
            const dataRows = indents.map(i => ({
                col1: i.id,
                col2: i.requestedBy.replace("HAATZA ", ""),
                col3: i.requestedTo.replace("HAATZA ", ""),
                col4: `${i.requestedQty} units`,
                col5: new Date(i.requestedDate).toLocaleDateString(),
                col6: i.priority,
                col7: i.status,
                col7Class: ["Closed", "Exception Closed"].includes(i.status) ? "status-inactive" : "status-active"
            }));

            list[indentIdx] = {
                ...list[indentIdx],
                stats: [
                    { label: "Total Indents", value: indents.length.toString(), badge: "All Requests", color: "blue" },
                    { label: "Pending Review", value: indents.filter(i => i.status === "Pending" || i.status === "Submitted").length.toString(), color: "red" },
                    { label: "Closed Indents", value: indents.filter(i => ["Closed", "Exception Closed"].includes(i.status)).length.toString(), color: "green" }
                ],
                data: dataRows
            };
        }

        // 5. Dispatch Report
        const dispatchIdx = list.findIndex(r => r.id === "dispatch");
        if (dispatchIdx !== -1) {
            const dispatches = indents.filter(i => ["Dispatched", "In Transit", "Closed", "Exception Closed", "Damaged", "Short Received"].includes(i.status));
            const dataRows = dispatches.map(d => ({
                col1: d.dispatchNumber || `DSP-${d.id.replace("IND-", "")}`,
                col2: d.id,
                col3: d.vehicleNumber || "KA-03-HA-8821",
                col4: d.requestedBy.replace("HAATZA ", ""),
                col5: `${d.approvedQty} units`,
                col6: d.driverName || "Ramesh Kumar",
                col7: d.status === "Closed" ? "Delivered" : d.status,
                col7Class: "status-active"
            }));

            list[dispatchIdx] = {
                ...list[dispatchIdx],
                stats: [
                    { label: "Total Dispatches", value: dispatches.length.toString(), badge: "Outbound", color: "green" },
                    { label: "In Transit", value: indents.filter(i => i.status === "In Transit").length.toString(), color: "blue" },
                    { label: "Delivered", value: indents.filter(i => ["Closed", "Exception Closed"].includes(i.status)).length.toString(), color: "green" }
                ],
                data: dataRows
            };
        }

        // 6. Receiving Report (GRN)
        const receivingIdx = list.findIndex(r => r.id === "receiving");
        if (receivingIdx !== -1) {
            const grns = indents.filter(i => i.grnNumber);
            const dataRows = grns.map(g => ({
                col1: g.grnNumber,
                col2: g.id,
                col3: g.requestedTo.replace("HAATZA ", ""),
                col4: `${g.receivedQty} units`,
                col5: new Date(g.grnDate).toLocaleDateString(),
                col6: g.verifiedBy || "Auditor",
                col7: g.status,
                col7Class: g.status === "Closed" ? "status-active" : "status-suspended"
            }));

            list[receivingIdx] = {
                ...list[receivingIdx],
                stats: [
                    { label: "Total GRNs Posted", value: grns.length.toString(), badge: "Verified", color: "green" },
                    { label: "Full Clearances", value: grns.filter(g => g.status === "Closed").length.toString(), color: "green" },
                    { label: "Exceptions Recorded", value: grns.filter(g => g.status !== "Closed").length.toString(), color: "red" }
                ],
                data: dataRows
            };
        }

        // 7. Orders by Dark House Report
        const darkhouseIndex = list.findIndex(r => r.id === "orders-by-darkhouse");
        if (darkhouseIndex !== -1) {
            const dhRows = INITIAL_DARKHOUSES.map((dh, idx) => {
                const total = dh.todayOrders || (100 + (idx * 50));
                const fulfilled = Math.floor(total * 0.95);
                const pending = total - fulfilled;
                const contribution = ((total / INITIAL_DARKHOUSES.reduce((acc, d) => acc + (d.todayOrders || 100), 0)) * 100).toFixed(1) + "%";
                const loadStatus = total > 200 ? "High Load" : total > 100 ? "Normal" : "Underloaded";
                const loadClass = total > 200 ? "status-pending" : total > 100 ? "status-active" : "status-inactive";
                return {
                    col1: dh.id,
                    col2: dh.name,
                    col3: `${total} orders`,
                    col4: `${fulfilled} orders`,
                    col5: `${pending} orders`,
                    col6: contribution,
                    col7: loadStatus,
                    col7Class: loadClass
                };
            });
            list[darkhouseIndex] = {
                ...list[darkhouseIndex],
                stats: [
                    { label: "Active Darkhouses", value: `${INITIAL_DARKHOUSES.filter(d => d.status === "Active").length} Hubs`, badge: "Fully Online", color: "blue" },
                    { label: "Top Volume Hub", value: INITIAL_DARKHOUSES.reduce((max, d) => (d.todayOrders > max.todayOrders ? d : max), INITIAL_DARKHOUSES[0]).name, badge: `${Math.max(...INITIAL_DARKHOUSES.map(d => d.todayOrders))} orders`, color: "green" },
                    { label: "Average Volume", value: `${Math.floor(INITIAL_DARKHOUSES.reduce((acc, d) => acc + d.todayOrders, 0) / INITIAL_DARKHOUSES.length)} orders/hub`, badge: "Optimal Load", color: "purple" }
                ],
                data: dhRows
            };
        }

        return list;
    }, []);

    const activeReport = useMemo(() => {
        return templates.find(r => r.id === activeReportId) || templates[0];
    }, [templates, activeReportId]);

    const [searchTerm, setSearchTerm] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [isSyncing, setIsSyncing] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const showLocalToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // Sync active report selection back to URL path if direct navigation was done
    useEffect(() => {
        if (!reportType) {
            navigate("/reports/inventory-summary", { replace: true });
        }
    }, [reportType, navigate]);

    const handleSelectReport = (reportId) => {
        setSearchTerm("");
        setWarehouseFilter("all");
        navigate(`/reports/${reportId}`);
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            showLocalToast("Report data synced successfully with WMS database.");
        }, 800);
    };

    const handleDownload = (format) => {
        showLocalToast(`Preparing download in ${format.toUpperCase()} format...`);
        setTimeout(() => {
            showLocalToast(`${activeReport.title} downloaded successfully!`);
        }, 1200);
    };

    // Filter table content based on search term
    const filteredTableData = useMemo(() => {
        if (!searchTerm.trim()) return activeReport.data;
        const query = searchTerm.toLowerCase();
        return activeReport.data.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(query)
            )
        );
    }, [activeReport, searchTerm]);

    return (
        <div className="reports-page fade-in">
            {/* Custom local Toast alert */}
            {toastMessage && (
                <div style={{
                    position: "fixed",
                    top: "24px",
                    right: "24px",
                    background: "#1e293b",
                    color: "#ffffff",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    zIndex: 2500,
                    fontSize: "13.5px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <CheckCircle size={15} style={{ color: "#10b981" }} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header section */}
            <div className="reports-header-row">
                <div>
                    <h1 className="reports-title">Operational Reports</h1>
                    <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                </div>
                <div className="reports-actions">
                    <button className="btn-refresh" onClick={handleSync} disabled={isSyncing}>
                        <RefreshCw size={14} className={isSyncing ? "spin-icon" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync Database"}</span>
                    </button>
                </div>
            </div>

            {/* Layout container */}
            <div className="reports-layout-container">
                {/* Left navigation sidebar */}
                <aside className="reports-sidebar">
                    <div className="reports-sidebar-title">Available Templates</div>
                    {templates.map((tpl) => {
                        const IconComponent = tpl.icon;
                        const isActive = tpl.id === activeReport.id;
                        return (
                            <button
                                key={tpl.id}
                                className={`reports-menu-btn ${isActive ? "active" : ""}`}
                                onClick={() => handleSelectReport(tpl.id)}
                            >
                                <IconComponent size={16} />
                                <span style={{ flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                    {tpl.title}
                                </span>
                                <ChevronRight size={14} className="submenu-arrow-indicator" />
                            </button>
                        );
                    })}
                </aside>

                {/* Right content panel */}
                <main className="reports-main-content">
                    {/* Active report header summary */}
                    <div className="reports-stat-card" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "250px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#eff6ff",
                                    color: "#2563eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <activeReport.icon size={18} />
                                </div>
                                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>{activeReport.title}</h2>
                            </div>
                            <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>{activeReport.description}</p>
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                            <button className="btn-refresh" onClick={() => handleDownload("csv")} style={{ height: "36px", fontSize: "12.5px" }}>
                                <Download size={13} />
                                <span>CSV</span>
                            </button>
                            <button className="btn-refresh" onClick={() => handleDownload("pdf")} style={{ height: "36px", fontSize: "12.5px", backgroundColor: "#ef4444", color: "#ffffff", borderColor: "#ef4444" }}>
                                <Download size={13} />
                                <span>PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Stats Grid */}
                    <div className="reports-stats-grid">
                        {activeReport.stats.map((stat, sIdx) => {
                            const badgeClass = stat.color === "green" ? "green" : stat.color === "red" ? "red" : stat.color === "purple" ? "purple" : "blue";
                            return (
                                <div key={sIdx} className="reports-stat-card" style={{ padding: "18px" }}>
                                    <span className="stat-label">{stat.label}</span>
                                    <span className="stat-value" style={{ margin: "6px 0" }}>{stat.value}</span>
                                    <span className={`stat-badge ${badgeClass}`}>{stat.badge}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Data Table Card */}
                    <div className="report-data-table-card">
                        <div className="report-table-actions">
                            <div className="report-search-input-wrapper">
                                <Search size={15} />
                                <input
                                    type="text"
                                    placeholder="Search report records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="report-search-input"
                                />
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Hub Location:</label>
                                <select 
                                    value={warehouseFilter} 
                                    onChange={(e) => setWarehouseFilter(e.target.value)}
                                    className="report-filter-select"
                                >
                                    <option value="all">All Hubs (Central + Darkhouses)</option>
                                    <option value="central">Central Hub Alpha</option>
                                    <option value="east">DH East Hub</option>
                                    <option value="north">DH North Hub</option>
                                </select>
                            </div>
                        </div>

                        {/* Responsive Table grid */}
                        <div className="report-table-wrapper">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {activeReport.headers.map((h, hIdx) => (
                                            <th key={hIdx}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTableData.length > 0 ? (
                                        filteredTableData.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {row.col1 !== undefined && <td>{row.col1}</td>}
                                                {row.col2 !== undefined && <td>{row.col2}</td>}
                                                {row.col3 !== undefined && <td>{row.col3}</td>}
                                                {row.col4 !== undefined && <td>{row.col4}</td>}
                                                {row.col5 !== undefined && <td>{row.col5}</td>}
                                                {row.col6 !== undefined && <td>{row.col6}</td>}
                                                {row.col7 !== undefined && (
                                                    <td>
                                                        <span className={row.col7Class || ""}>{row.col7}</span>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={activeReport.headers.length} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                                                No records match your search criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer details */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
                            <span>Showing {filteredTableData.length} of {activeReport.data.length} records</span>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <Clock size={12} />
                                <span>Report generated on: 2026-06-15 11:24 (Live)</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ReportsPage;
