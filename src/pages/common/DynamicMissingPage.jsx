import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
    Activity, Clock, FileText, CheckCircle, AlertCircle, Plus, 
    Download, Search, Filter, RefreshCw, BarChart2, Shield, 
    User, Truck, CreditCard, ShoppingBag, Settings, HelpCircle 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "./DynamicMissingPage.css";

// Helper to convert route to Page Details
const getPageMetadata = (pathname) => {
    const cleanPath = pathname.replace(/^\//, "").split("/");
    const modulePart = cleanPath[0] || "";
    const pagePart = cleanPath[1] || "";
    
    // Format helper: "order-picking" -> "Order Picking"
    const formatName = (str) => {
        return str
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };
    
    const pageName = pagePart ? formatName(pagePart) : (modulePart ? formatName(modulePart) : "Dashboard");
    const moduleName = formatName(modulePart);

    // Dynamic stats and table contents based on the module and page name
    let stats;
    let headers;
    let data;
    let chartData;

    // Fallback default configurations
    stats = [
        { label: "Total Records", value: "124", icon: FileText, color: "#2563eb", bg: "#eff6ff" },
        { label: "Active Entries", value: "88", icon: Activity, color: "#10b981", bg: "#ecfdf5" },
        { label: "Pending Approvals", value: "12", icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" },
        { label: "System Status", value: "Optimal", icon: Shield, color: "#0f766e", bg: "#ccfbf1" }
    ];

    headers = ["ID", "Name", "Created Date", "Status", "Remarks"];
    data = [
        { id: "TX-901", name: `${pageName} Transaction A`, date: "2026-06-15", status: "Active", remarks: "System verified." },
        { id: "TX-902", name: `${pageName} Transaction B`, date: "2026-06-16", status: "Pending", remarks: "Awaiting approval." },
        { id: "TX-903", name: `${pageName} Transaction C`, date: "2026-06-17", status: "Active", remarks: "Auto-synced." },
        { id: "TX-904", name: `${pageName} Transaction D`, date: "2026-06-18", status: "Closed", remarks: "Archived." }
    ];

    chartData = [
        { name: "Mon", value: 30 },
        { name: "Tue", value: 45 },
        { name: "Wed", value: 60 },
        { name: "Thu", value: 55 },
        { name: "Fri", value: 70 },
        { name: "Sat", value: 40 },
        { name: "Sun", value: 50 }
    ];

    // Customized data based on module name
    const lowerPage = pageName.toLowerCase();
    
    if (lowerPage.includes("picking")) {
        stats = [
            { label: "Assigned Orders", value: "32", icon: ShoppingBag, color: "#2563eb", bg: "#eff6ff" },
            { label: "Items Picked", value: "148 / 180", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "SLA Warning", value: "2", icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" },
            { label: "Active Pickers", value: "8", icon: User, color: "#8b5cf6", bg: "#f5f3ff" }
        ];
        headers = ["Order ID", "Zone ID", "Picker Name", "Items count", "Status"];
        data = [
            { id: "ORD-9021", name: "Zone A-Row 3", date: "Rahul Kumar", status: "In Progress", remarks: "12 / 15 items" },
            { id: "ORD-9022", name: "Zone B-Row 1", date: "Anita Singh", status: "Completed", remarks: "8 / 8 items" },
            { id: "ORD-9023", name: "Zone C-Row 4", date: "Devendra P.", status: "Pending", remarks: "22 items" },
            { id: "ORD-9024", name: "Zone A-Row 2", date: "Amit Shah", status: "In Progress", remarks: "3 / 10 items" }
        ];
    } else if (lowerPage.includes("packing")) {
        stats = [
            { label: "Orders in Queue", value: "18", icon: ShoppingBag, color: "#2563eb", bg: "#eff6ff" },
            { label: "Packed Today", value: "112", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "Material Stock", value: "Good", icon: Shield, color: "#0f766e", bg: "#ccfbf1" },
            { label: "Packing Stations", value: "4 Active", icon: Activity, color: "#8b5cf6", bg: "#f5f3ff" }
        ];
        headers = ["Order ID", "Station", "Packer Name", "Weight (kg)", "Status"];
        data = [
            { id: "ORD-9011", name: "Station-01", date: "Subhash G.", status: "Packed", remarks: "2.4 kg" },
            { id: "ORD-9012", name: "Station-02", date: "Pooja Roy", status: "Packing", remarks: "1.8 kg" },
            { id: "ORD-9013", name: "Station-01", date: "Subhash G.", status: "Pending", remarks: "5.0 kg" },
            { id: "ORD-9014", name: "Station-04", date: "Karan Johar", status: "Packing", remarks: "0.9 kg" }
        ];
    } else if (lowerPage.includes("rider") || lowerPage.includes("vehicle")) {
        stats = [
            { label: "Total Fleet Size", value: "45", icon: Truck, color: "#2563eb", bg: "#eff6ff" },
            { label: "On Duty", value: "32", icon: Activity, color: "#10b981", bg: "#ecfdf5" },
            { label: "In Maintenance", value: "3", icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" },
            { label: "Avg Delivery Time", value: "18 mins", icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" }
        ];
        headers = ["Rider ID", "Rider Name", "Vehicle Number", "Contact", "Status"];
        data = [
            { id: "RD-201", name: "Ramesh Sharma", date: "MH-12-QQ-4022", status: "Delivering", remarks: "+91 9823348122" },
            { id: "RD-202", name: "Suresh Patil", date: "MH-12-WX-9912", status: "Available", remarks: "+91 9822314545" },
            { id: "RD-203", name: "Vikram Jadhav", date: "MH-12-PP-1021", status: "Off Duty", remarks: "+91 7712398450" },
            { id: "RD-204", name: "Anil K.", date: "MH-12-LK-5561", status: "Delivering", remarks: "+91 9012384501" }
        ];
    } else if (lowerPage.includes("payment") || lowerPage.includes("billing") || lowerPage.includes("wallet")) {
        stats = [
            { label: "Disbursed Today", value: "₹4,82,900", icon: CreditCard, color: "#2563eb", bg: "#eff6ff" },
            { label: "Pending Approvals", value: "₹1,24,000", icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Failed Transfers", value: "0", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "Gateway Status", value: "Online", icon: Shield, color: "#0f766e", bg: "#ccfbf1" }
        ];
        headers = ["Transaction ID", "Recipient", "Amount", "Initiated Date", "Status"];
        data = [
            { id: "TXN-88121", name: "Mother Dairy Pvt Ltd", date: "₹1,85,000", status: "Completed", remarks: "UTR: HDFC88219" },
            { id: "TXN-88122", name: "Amul Fresh Logistics", date: "₹2,50,000", status: "Completed", remarks: "UTR: ICICI99102" },
            { id: "TXN-88123", name: "Heritage Foods Ltd", date: "₹85,000", status: "Pending", remarks: "Pending Finance sign" },
            { id: "TXN-88124", name: "Balaji Wafers Co.", date: "₹39,000", status: "Processing", remarks: "Initiated" }
        ];
    } else if (lowerPage.includes("lead") || lowerPage.includes("merchant") || lowerPage.includes("partner")) {
        stats = [
            { label: "Total Leads", value: "524", icon: User, color: "#2563eb", bg: "#eff6ff" },
            { label: "Onboarded", value: "185", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "Conversion Rate", value: "35.2%", icon: Activity, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "In Pipeline", value: "48", icon: Clock, color: "#eab308", bg: "#fef9c3" }
        ];
        headers = ["Partner ID", "Business Name", "Owner Name", "Region", "Status"];
        data = [
            { id: "PT-091", name: "Apna Bazaar Mart", date: "Sanjay Gupta", status: "Verified", remarks: "Mumbai West" },
            { id: "PT-092", name: "Fresh N Fast Retail", date: "Kirti Roy", status: "Negotiation", remarks: "Pune Central" },
            { id: "PT-093", name: "Daily Needs Supermarket", date: "Ganesh Naik", status: "Verified", remarks: "Thane East" },
            { id: "PT-094", name: "Kisan Direct Outlet", date: "Sandeep Patil", status: "New Lead", remarks: "Satara Rural" }
        ];
    } else if (lowerPage.includes("report") || lowerPage.includes("analytics")) {
        stats = [
            { label: "Total Reports Generated", value: "1,248", icon: FileText, color: "#2563eb", bg: "#eff6ff" },
            { label: "Export Completed", value: "1,240", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "Failed Exports", value: "8", icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" },
            { label: "Data Latency", value: "<1 min", icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" }
        ];
        headers = ["Report Name", "Format", "Created By", "Date Generated", "Status"];
        data = [
            { id: "GST Quarterly Summary", name: "PDF / XLSX", date: "Finance Team", status: "Generated", remarks: "12.4 MB" },
            { id: "Rider Performance SLA", name: "CSV", date: "Operations Manager", status: "Generated", remarks: "4.8 MB" },
            { id: "Inventory Shrinkage Log", name: "PDF", date: "Inventory Head", status: "Processing", remarks: "Estimating..." },
            { id: "Low Stock Purchase Alert", name: "XLSX", date: "Procurement Agent", status: "Generated", remarks: "1.2 MB" }
        ];
    } else if (lowerPage.includes("campaign") || lowerPage.includes("coupon") || lowerPage.includes("banner") || lowerPage.includes("notification")) {
        stats = [
            { label: "Active Campaigns", value: "4", icon: Activity, color: "#2563eb", bg: "#eff6ff" },
            { label: "Total Reach", value: "48.2k Users", icon: User, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Click Through Rate", value: "8.4%", icon: BarChart2, color: "#10b981", bg: "#ecfdf5" },
            { label: "Promo Codes Used", value: "412", icon: ShoppingBag, color: "#eab308", bg: "#fef9c3" }
        ];
        headers = ["Campaign/Promo ID", "Title / Code", "Discount / Reach", "Expiry Date", "Status"];
        data = [
            { id: "HAATZA-50", name: "Monsoon Offer 50% Off", date: "50% Max ₹100", status: "Active", remarks: "Valid till 2026-07-31" },
            { id: "FESTIVE-10", name: "Dairy Fest Cashback", date: "10% cashback", status: "Active", remarks: "Valid till 2026-06-30" },
            { id: "BANNER-HERO-02", name: "Weekend Fruits Promo", date: "12,500 impressions", status: "Paused", remarks: "Awaiting next weekend" },
            { id: "PUSH-MON-EVNG", name: "Dinner Specials Alert", date: "18,400 sent", status: "Sent", remarks: "CTR: 9.2%" }
        ];
    } else if (lowerPage.includes("employee") || lowerPage.includes("attendance") || lowerPage.includes("leave") || lowerPage.includes("payroll") || lowerPage.includes("recruitment") || lowerPage.includes("performance") || lowerPage.includes("offer")) {
        stats = [
            { label: "Total Employee Count", value: "84", icon: User, color: "#2563eb", bg: "#eff6ff" },
            { label: "Present Today", value: "76", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" },
            { label: "On Leave", value: "4", icon: Clock, color: "#8b5cf6", bg: "#f5f3ff" },
            { label: "Open Positions", value: "6", icon: Plus, color: "#eab308", bg: "#fef9c3" }
        ];
        headers = ["Emp Code", "Employee Name", "Department", "Designation", "Status"];
        data = [
            { id: "EMP-102", name: "Aarav Sharma", date: "Operations", status: "Present", remarks: "In Time: 09:12 AM" },
            { id: "EMP-105", name: "Nehal Gupta", date: "Inventory", status: "On Leave", remarks: "Sick Leave" },
            { id: "EMP-112", name: "Priya Menon", date: "Finance", status: "Present", remarks: "In Time: 08:55 AM" },
            { id: "EMP-120", name: "Varun Nair", date: "Human Resources", status: "Present", remarks: "In Time: 09:30 AM" }
        ];
    } else if (lowerPage.includes("log") || lowerPage.includes("security") || lowerPage.includes("setting") || lowerPage.includes("device")) {
        stats = [
            { label: "CPU Usage", value: "14%", icon: Activity, color: "#10b981", bg: "#ecfdf5" },
            { label: "Active Sessions", value: "24", icon: User, color: "#2563eb", bg: "#eff6ff" },
            { label: "API Success Rate", value: "99.98%", icon: Shield, color: "#0f766e", bg: "#ccfbf1" },
            { label: "System Alerts", value: "0", icon: CheckCircle, color: "#10b981", bg: "#ecfdf5" }
        ];
        headers = ["Timestamp", "Service", "Event / Message", "IP Address", "Status"];
        data = [
            { id: "11:21:04", name: "Auth Service", date: "User admin@haatza.com login success", status: "Success", remarks: "192.168.1.45" },
            { id: "11:20:18", name: "Inventory Controller", date: "Stock adjustment sync completed", status: "Success", remarks: "Internal Gateway" },
            { id: "11:18:45", name: "Wix Integration Hook", date: "Webhook delivery for Order #9910", status: "Success", remarks: "185.230.61.12" },
            { id: "11:15:30", name: "Database Service", date: "Auto partition clean-up finished", status: "Success", remarks: "System Agent" }
        ];
    }

    return { pageName, moduleName, stats, headers, data, chartData };
};

// ==========================================
// 1. ORDER PICKING CONSOLE
// ==========================================
function OrderPickingConsole() {
    const [secondsLeft, setSecondsLeft] = React.useState(120);
    const [pickedItems, setPickedItems] = React.useState(new Set());
    const [isDone, setIsDone] = React.useState(false);

    React.useEffect(() => {
        if (secondsLeft <= 0 || isDone) return;
        const timer = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft, isDone]);

    const items = [
        { id: "item-1", name: "Premium Gala Apples 1kg", loc: "Zone A-Row 3-Shelf 2", qty: 1 },
        { id: "item-2", name: "Amul Salted Butter 500g", loc: "Zone B-Row 1-Chiller 1", qty: 1 },
        { id: "item-3", name: "Mother Dairy Toned Milk 1L", loc: "Zone B-Row 1-Chiller 2", qty: 2 },
        { id: "item-4", name: "Organic Tomatoes 500g", loc: "Zone A-Row 2-Shelf 4", qty: 1 }
    ];

    const toggleItem = (id) => {
        setPickedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleComplete = () => {
        setIsDone(true);
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const progress = (pickedItems.size / items.length) * 100;

    return (
        <div className="wms-container">
            <div className="wms-card">
                <div className="picker-timer-header">
                    <div>
                        <span className="status-pill pending">Active Picking Job</span>
                        <h2 style={{ marginTop: "4px", fontSize: "16px", fontWeight: "700" }}>Order ID: ORD-9021</h2>
                    </div>
                    <div className={`picker-timer ${secondsLeft < 30 ? "warning" : "normal"}`}>
                        <Clock size={16} />
                        <span>{secondsLeft > 0 ? formatTime(secondsLeft) : "SLA BREACHED"}</span>
                    </div>
                </div>

                <div style={{ margin: "8px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                        <span>Picking Progress</span>
                        <span>{pickedItems.size} of {items.length} items</span>
                    </div>
                    <div style={{ height: "6px", backgroundColor: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "#10b981", transition: "width 0.3s ease" }}></div>
                    </div>
                </div>

                {isDone ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "32px", textAlign: "center" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckCircle size={28} />
                        </div>
                        <h3 style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)" }}>Pick Completed Successfully!</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Order ORD-9021 has been marked ready for packing. Handed over to Handoff Zone C.</p>
                        <button className="btn-primary" onClick={() => {
                            setPickedItems(new Set());
                            setIsDone(false);
                            setSecondsLeft(120);
                        }}>Pick Next Order</button>
                    </div>
                ) : (
                    <div className="picking-list">
                        {items.map(item => {
                            const isPicked = pickedItems.has(item.id);
                            return (
                                <div key={item.id} className={`picking-item-row ${isPicked ? "picked" : ""}`}>
                                    <div className="picking-item-info">
                                        <span className="picking-item-name">{item.name}</span>
                                        <span className="picking-item-details">Loc: {item.loc} • Qty: {item.qty}</span>
                                    </div>
                                    <button 
                                        className={`btn-pick-action ${isPicked ? "picked" : ""}`}
                                        onClick={() => toggleItem(item.id)}
                                    >
                                        {isPicked ? "Picked" : "Pick"}
                                    </button>
                                </div>
                            );
                        })}

                        <button 
                            className="btn-primary" 
                            disabled={pickedItems.size < items.length}
                            onClick={handleComplete}
                            style={{ 
                                marginTop: "12px", 
                                width: "100%", 
                                justifyContent: "center", 
                                opacity: pickedItems.size < items.length ? 0.6 : 1, 
                                cursor: pickedItems.size < items.length ? "not-allowed" : "pointer" 
                            }}
                        >
                            Complete Pick & Handover
                        </button>
                    </div>
                )}
            </div>
            
            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)" }}>Picker Statistics</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Avg Pick Speed</span>
                        <span style={{ fontWeight: "600", fontSize: "13px" }}>24 sec/item</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Accuracy Rate</span>
                        <span style={{ fontWeight: "600", fontSize: "13px", color: "#10b981" }}>99.8%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Active SLA Alert</span>
                        <span style={{ fontWeight: "600", fontSize: "13px", color: secondsLeft < 30 ? "#ef4444" : "var(--text-main)" }}>
                            {secondsLeft < 30 ? "Warning (Low SLA)" : "Good"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 2. ORDER PACKING CONSOLE
// ==========================================
function OrderPackingStation() {
    const [activeOrderId, setActiveOrderId] = React.useState("ORD-9012");
    const [checkedItems, setCheckedItems] = React.useState({
        "ORD-9012": new Set(),
        "ORD-9013": new Set(),
        "ORD-9014": new Set()
    });
    const [printedOrders, setPrintedOrders] = React.useState(new Set());
    const [dispatchedOrders, setDispatchedOrders] = React.useState(new Set());

    const orders = [
        { id: "ORD-9012", station: "Station-02", packer: "Pooja Roy", weight: "1.8 kg", checklist: ["Verify Polybag Size (Medium)", "Apply Cold Insulation Wrap on Butter", "Scan Invoice Barcode", "Seal Security Tape"] },
        { id: "ORD-9013", station: "Station-01", packer: "Subhash G.", weight: "5.0 kg", checklist: ["Verify Heavy Box Size", "Check Eggs Bubble Cushion Wrap", "Scan Invoice Barcode", "Apply Fragile Label"] },
        { id: "ORD-9014", station: "Station-04", packer: "Karan Johar", weight: "0.9 kg", checklist: ["Verify Polybag Size (Small)", "Scan Invoice Barcode", "Seal Security Tape"] }
    ];

    const currentOrder = orders.find(o => o.id === activeOrderId) || orders[0];

    const toggleCheckItem = (orderId, idx) => {
        setCheckedItems(prev => {
            const nextSet = new Set(prev[orderId]);
            if (nextSet.has(idx)) {
                nextSet.delete(idx);
            } else {
                nextSet.add(idx);
            }
            return { ...prev, [orderId]: nextSet };
        });
    };

    const handlePrintBarcode = (orderId) => {
        setPrintedOrders(prev => {
            const next = new Set(prev);
            next.add(orderId);
            return next;
        });
        alert(`Thermal Printer Alert: Simulated Invoice label printed for ${orderId}. Barcode: *${orderId}*`);
    };

    const handleDispatch = (orderId) => {
        setDispatchedOrders(prev => {
            const next = new Set(prev);
            next.add(orderId);
            return next;
        });
        alert(`Dispatched: Order ${orderId} has been sent to Rider Handoff area.`);
    };

    const activeOrderCheckedCount = checkedItems[currentOrder.id]?.size || 0;
    const isCompleted = activeOrderCheckedCount === currentOrder.checklist.length;
    const isPrinted = printedOrders.has(currentOrder.id);
    const isDispatched = dispatchedOrders.has(currentOrder.id);

    return (
        <div className="wms-container chat-layout">
            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "12px" }}>Packing Queue</h3>
                <div className="packer-orders-sidebar">
                    {orders.map(order => {
                        const orderChecked = checkedItems[order.id]?.size || 0;
                        const orderTotal = order.checklist.length;
                        const isOrderDispatched = dispatchedOrders.has(order.id);
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`packer-order-card ${activeOrderId === order.id ? "active" : ""}`}
                                onClick={() => setActiveOrderId(order.id)}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontWeight: "700", fontSize: "13px" }}>{order.id}</span>
                                    <span style={{ fontSize: "11px" }} className={`status-pill ${isOrderDispatched ? "completed" : "pending"}`}>
                                        {isOrderDispatched ? "Dispatched" : `${orderChecked}/${orderTotal}`}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                                    <span>{order.station}</span>
                                    <span>{order.weight}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="wms-card">
                {isDispatched ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "48px", textAlign: "center" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckCircle size={28} />
                        </div>
                        <h3 style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)" }}>Order Dispatched</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Order {currentOrder.id} has been securely sealed, barcode affixed, and handed off to delivery riders.</p>
                        <button className="btn-secondary" onClick={() => {
                            setDispatchedOrders(prev => {
                                const next = new Set(prev);
                                next.delete(currentOrder.id);
                                return next;
                            });
                            setPrintedOrders(prev => {
                                const next = new Set(prev);
                                next.delete(currentOrder.id);
                                return next;
                            });
                            setCheckedItems(prev => ({ ...prev, [currentOrder.id]: new Set() }));
                        }}>Pack Again (Reset Demo)</button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <div>
                                <span className="status-pill packing">Packing Station 2</span>
                                <h2 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px" }}>Verification: {currentOrder.id}</h2>
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "right" }}>
                                <div>Packer: {currentOrder.packer}</div>
                                <div>Weight: {currentOrder.weight}</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px 0" }}>
                            {currentOrder.checklist.map((item, idx) => {
                                const checked = checkedItems[currentOrder.id]?.has(idx) || false;
                                return (
                                    <div 
                                        key={idx} 
                                        className={`pack-checklist-item ${checked ? "verified" : ""}`}
                                        onClick={() => toggleCheckItem(currentOrder.id, idx)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={checked} 
                                            readOnly
                                            style={{ cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-main)" }}>{item}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                            <button 
                                className="btn-secondary" 
                                disabled={!isCompleted}
                                onClick={() => handlePrintBarcode(currentOrder.id)}
                                style={{ flex: 1, justifyContent: "center", opacity: isCompleted ? 1 : 0.6, cursor: isCompleted ? "pointer" : "not-allowed" }}
                            >
                                <Plus size={14} />
                                <span>Print Invoice Tag</span>
                            </button>
                            <button 
                                className="btn-primary" 
                                disabled={!isCompleted || !isPrinted}
                                onClick={() => handleDispatch(currentOrder.id)}
                                style={{ flex: 1, justifyContent: "center", opacity: (isCompleted && isPrinted) ? 1 : 0.6, cursor: (isCompleted && isPrinted) ? "pointer" : "not-allowed" }}
                            >
                                <span>Dispatch to Rider</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ==========================================
// 3. CUSTOMER CHAT CONSOLE
// ==========================================
function CustomerChatConsole() {
    const [activeUserId, setActiveUserId] = React.useState("user-1");
    const [inputText, setInputText] = React.useState("");
    const [chatLogs, setChatLogs] = React.useState({
        "user-1": [
            { sender: "customer", text: "Hi, I just received my order. The milk pack is completely leaked in the bag.", time: "12:40 PM" },
            { sender: "agent", text: "Apologies for the inconvenience, Rahul. Can you share a photo of the leaked milk package?", time: "12:41 PM" },
            { sender: "customer", text: "Yes, here it is. It ruined the outer bag and some biscuit packs.", time: "12:42 PM" }
        ],
        "user-2": [
            { sender: "customer", text: "Why is my order delayed? The app shows 10 mins SLA but it is 25 mins now.", time: "12:35 PM" },
            { sender: "agent", text: "Hello Amit, I am checking with the delivery partner right away.", time: "12:36 PM" },
            { sender: "customer", text: "Please expedite. I have a meeting starting soon.", time: "12:37 PM" }
        ],
        "user-3": [
            { sender: "customer", text: "I ordered organic apples but received regular ones instead.", time: "12:20 PM" },
            { sender: "agent", text: "Hello Neha, I am sorry about this picking error. I can process a refund for the price difference or initiate a redelivery.", time: "12:22 PM" }
        ]
    });

    const customers = [
        { id: "user-1", name: "Rahul Sharma", issue: "Milk package leaked", avatar: "RS", orderId: "ORD-8821" },
        { id: "user-2", name: "Amit Patel", issue: "Delivery SLA delay", avatar: "AP", orderId: "ORD-9912" },
        { id: "user-3", name: "Neha Gupta", issue: "Wrong item picked", avatar: "NG", orderId: "ORD-5541" }
    ];

    const currentCustomer = customers.find(c => c.id === activeUserId) || customers[0];
    const messages = chatLogs[activeUserId] || [];

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const newMsg = { sender: "agent", text: inputText.trim(), time: timeString };

        setChatLogs(prev => ({
            ...prev,
            [activeUserId]: [...prev[activeUserId], newMsg]
        }));
        
        setInputText("");

        // Simulate auto response
        setTimeout(() => {
            let autoReplyText = "Thank you. I am looking forward to getting this sorted.";
            if (activeUserId === "user-1") {
                autoReplyText = "Thanks, I appreciate the prompt refund. I have checked my wallet and received it.";
            } else if (activeUserId === "user-2") {
                autoReplyText = "Sure, I see the rider is just 2 mins away now. Thank you.";
            } else if (activeUserId === "user-3") {
                autoReplyText = "Okay, please process the refund of the difference. That works for me.";
            }
            
            const replyMsg = { sender: "customer", text: autoReplyText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
            setChatLogs(prev => ({
                ...prev,
                [activeUserId]: [...(prev[activeUserId] || []), replyMsg]
            }));
        }, 1500);
    };

    return (
        <div className="wms-container chat-layout">
            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "12px" }}>Active Customers</h3>
                <div className="chat-sidebar-list">
                    {customers.map(c => (
                        <div 
                            key={c.id} 
                            className={`chat-user-item ${activeUserId === c.id ? "active" : ""}`}
                            onClick={() => setActiveUserId(c.id)}
                        >
                            <div className="chat-avatar">{c.avatar}</div>
                            <div className="chat-user-text">
                                <span className="chat-user-name">{c.name}</span>
                                <span className="chat-user-issue">{c.issue}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wms-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "8px" }}>
                    <div>
                        <h2 style={{ fontSize: "15px", fontWeight: "700" }}>Chatting with {currentCustomer.name}</h2>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Order ID: {currentCustomer.orderId}</span>
                    </div>
                    <span className="live-pill">● AGENT ASSIGNED</span>
                </div>

                <div className="chat-window">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`chat-bubble ${m.sender}`}>
                            <div>{m.text}</div>
                            <span className="chat-timestamp">{m.time}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-bar">
                    <input 
                        type="text" 
                        placeholder="Type a message to customer..." 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="chat-input"
                    />
                    <button type="submit" className="btn-primary" style={{ padding: "10px 20px" }}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 4. DISPATCH RIDER TRACKING MAP
// ==========================================
function RiderTrackingConsole() {
    const [activeRiderId, setActiveRiderId] = React.useState("RD-201");
    const [riders, setRiders] = React.useState([
        { id: "RD-201", name: "Ramesh Sharma", vehicle: "MH-12-QQ-4022", battery: "85%", cash: "₹1,200", status: "Delivering", targetPin: "pin-1" },
        { id: "RD-202", name: "Suresh Patil", vehicle: "MH-12-WX-9912", battery: "42%", cash: "₹450", status: "Available", targetPin: "pin-2" },
        { id: "RD-203", name: "Vikram Jadhav", vehicle: "MH-12-PP-1021", battery: "98%", cash: "₹0", status: "Available", targetPin: "pin-3" },
        { id: "RD-204", name: "Anil Kumar", vehicle: "MH-12-LK-5561", battery: "15%", cash: "₹3,100", status: "Low Battery", targetPin: "pin-4" }
    ]);

    const activeRider = riders.find(r => r.id === activeRiderId) || riders[0];

    const hub = { x: 200, y: 150 };
    const pins = {
        "pin-1": { x: 70, y: 80, name: "Customer 1 (Kothrud)" },
        "pin-2": { x: 330, y: 90, name: "Customer 2 (Erandwane)" },
        "pin-3": { x: 280, y: 250, name: "Customer 3 (Deccan)" },
        "pin-4": { x: 90, y: 230, name: "Customer 4 (Karve Nagar)" }
    };

    const toggleStatus = (riderId) => {
        setRiders(prev => prev.map(r => {
            if (r.id === riderId) {
                const nextStatus = r.status === "Off-Duty" ? "Available" : "Off-Duty";
                return { ...r, status: nextStatus };
            }
            return r;
        }));
    };

    return (
        <div className="wms-container tracking-layout">
            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "12px" }}>Delivery Fleet</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {riders.map(rider => (
                        <div 
                            key={rider.id}
                            className={`rider-tracking-card ${activeRiderId === rider.id ? "active" : ""}`}
                            onClick={() => setActiveRiderId(rider.id)}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <span style={{ fontWeight: "700", fontSize: "13px" }}>{rider.name}</span>
                                    <span className={`status-pill ${rider.status === "Delivering" || rider.status === "Available" ? "success" : rider.status === "Low Battery" ? "flagged" : "closed"}`}>
                                        {rider.status}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                                    <span>Batt: {rider.battery}</span>
                                    <span>Cash: {rider.cash}</span>
                                    <span>{rider.vehicle}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wms-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: "15px", fontWeight: "700" }}>Live Dispatch Map</h2>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Selected: {activeRider.name} ({activeRider.status})</p>
                    </div>
                    <button 
                        className="btn-secondary" 
                        onClick={() => toggleStatus(activeRider.id)}
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                        Toggle Off/On Duty
                    </button>
                </div>

                <div className="svg-map-wrapper">
                    <svg width="100%" height="100%" viewBox="0 0 400 300" style={{ backgroundColor: "#f8fafc" }}>
                        <line x1="20" y1="0" x2="20" y2="300" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="100" y1="0" x2="100" y2="300" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="200" y1="0" x2="200" y2="300" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="300" y1="0" x2="300" y2="300" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeWidth="2" />
                        <line x1="0" y1="250" x2="400" y2="250" stroke="#f1f5f9" strokeWidth="2" />

                        <circle cx={hub.x} cy={hub.y} r="18" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3" className="map-pulsing-node" />
                        <circle cx={hub.x} cy={hub.y} r="8" fill="#0284c7" />
                        <text x={hub.x} y={hub.y - 12} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#0369a1">DARK HUB-01</text>

                        {Object.entries(pins).map(([pinKey, pin]) => {
                            const isTarget = activeRider.targetPin === pinKey;
                            return (
                                <g key={pinKey}>
                                    <path 
                                        d={`M ${hub.x} ${hub.y} L ${pin.x} ${pin.y}`} 
                                        stroke={isTarget ? "#3b82f6" : "#cbd5e1"} 
                                        strokeWidth={isTarget ? "3" : "1.5"} 
                                        strokeDasharray={isTarget ? "5 5" : "none"}
                                        fill="none" 
                                        className={isTarget ? "svg-animated-path" : ""}
                                    />
                                    <circle 
                                        cx={pin.x} 
                                        cy={pin.y} 
                                        r={isTarget ? "10" : "6"} 
                                        fill={isTarget ? "#ef4444" : "#64748b"} 
                                        className={isTarget ? "map-pulsing-node" : ""} 
                                    />
                                    <circle cx={pin.x} cy={pin.y} r="2" fill="#ffffff" />
                                    {isTarget && (
                                        <text x={pin.x} y={pin.y - 14} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#b91c1c">
                                            {pin.name}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {Object.entries(pins).map(([pinKey, pin]) => {
                            const isTarget = activeRider.targetPin === pinKey;
                            if (!isTarget || activeRider.status !== "Delivering") return null;
                            const midX = (hub.x + pin.x) / 2;
                            const midY = (hub.y + pin.y) / 2;
                            return (
                                <g key={`rider-${pinKey}`}>
                                    <circle cx={midX} cy={midY} r="7" fill="#10b981" />
                                    <text x={midX} y={midY + 3} fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ffffff">🚴</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 5. INVENTORY AUDIT & ADJUSTMENT
// ==========================================
function InventoryAuditConsole() {
    const [stockList, setStockList] = React.useState([
        { sku: "MILK-AMUL-01", name: "Amul Gold Milk 1L", systemQty: 45, physicalQty: 45, expiry: "2026-06-25", location: "Bin A-04" },
        { sku: "BISC-BRIT-02", name: "Britannia Marie Gold 250g", systemQty: 80, physicalQty: 78, expiry: "2026-09-12", location: "Bin C-12" },
        { sku: "FRUT-APPL-03", name: "Premium Fuji Apples 1kg", systemQty: 15, physicalQty: 12, expiry: "2026-06-22", location: "Bin A-08" },
        { sku: "DAIR-CURD-04", name: "Mother Dairy Curd 400g", systemQty: 30, physicalQty: 30, expiry: "2026-06-24", location: "Bin B-02" }
    ]);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleAdjust = (sku, delta) => {
        setStockList(prev => prev.map(item => {
            if (item.sku === sku) {
                const newPhysical = Math.max(0, item.physicalQty + delta);
                return { ...item, physicalQty: newPhysical };
            }
            return item;
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 4000);
    };

    const isNearingExpiry = (dateStr) => {
        const expDate = new Date(dateStr);
        const currentDate = new Date("2026-06-20");
        const diffTime = expDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 5;
    };

    return (
        <div className="wms-card" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
                <div>
                    <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Physical Audit Panel</h2>
                    <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Compare system numbers with physical shelf inventory and log discrepancies.</p>
                </div>
                <button className="btn-primary" onClick={handleSubmit}>
                    Batch Submit Stock Corrections
                </button>
            </div>

            {isSubmitted && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "8px", color: "#065f46", marginBottom: "16px", fontSize: "13px" }}>
                    <CheckCircle size={16} />
                    <span>Success: Stock adjustment logs generated. System inventory updated with verified physical counts.</span>
                </div>
            )}

            <div className="dynamic-table-wrapper">
                <table className="dynamic-records-table">
                    <thead>
                        <tr>
                            <th>SKU / Product</th>
                            <th>Location</th>
                            <th>System Qty</th>
                            <th>Physical Qty</th>
                            <th>Discrepancy (Delta)</th>
                            <th>Expiry Check</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockList.map(item => {
                            const delta = item.physicalQty - item.systemQty;
                            const nearExpiry = isNearingExpiry(item.expiry);
                            return (
                                <tr key={item.sku}>
                                    <td>
                                        <div style={{ fontWeight: "600" }}>{item.name}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>SKU: {item.sku}</div>
                                    </td>
                                    <td>{item.location}</td>
                                    <td>{item.systemQty}</td>
                                    <td>
                                        <div className="adjuster-row-input">
                                            <button className="btn-adjust-qty" onClick={() => handleAdjust(item.sku, -1)}>-</button>
                                            <span style={{ minWidth: "24px", textAlign: "center", fontWeight: "600" }}>{item.physicalQty}</span>
                                            <button className="btn-adjust-qty" onClick={() => handleAdjust(item.sku, 1)}>+</button>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: "700", color: delta === 0 ? "var(--text-muted)" : delta < 0 ? "#ef4444" : "#10b981" }}>
                                            {delta === 0 ? "0 (Match)" : delta > 0 ? `+${delta}` : delta}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${nearExpiry ? "flagged" : "success"}`}>
                                            {nearExpiry ? "Expiry Warning" : "Good"} ({item.expiry})
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==========================================
// 6. SHIFT & CALENDAR PLANNERS
// ==========================================
function ShiftRosterConsole() {
    const [workers, setWorkers] = React.useState([
        { id: "EMP-102", name: "Amit Kumar", shift: "Morning (06:00 - 14:00)", role: "Picker", status: "Present" },
        { id: "EMP-105", name: "Anita Singh", shift: "Evening (14:00 - 22:00)", role: "Picker", status: "Scheduled" },
        { id: "EMP-109", name: "Subhash G.", shift: "Morning (06:00 - 14:00)", role: "Packer", status: "Present" },
        { id: "EMP-112", name: "Pooja Roy", shift: "General (09:00 - 18:00)", role: "Admin", status: "Present" }
    ]);

    const [formName, setFormName] = React.useState("");
    const [formRole, setFormRole] = React.useState("Picker");
    const [formShift, setFormShift] = React.useState("Morning (06:00 - 14:00)");

    const handleCreateShift = (e) => {
        if (e) e.preventDefault();
        if (!formName.trim()) return;

        const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
        const newWorker = {
            id: newId,
            name: formName.trim(),
            role: formRole,
            shift: formShift,
            status: "Scheduled"
        };

        setWorkers(prev => [...prev, newWorker]);
        setFormName("");
    };

    return (
        <div className="wms-container">
            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "12px" }}>Daily Shift Board</h3>
                <div className="roster-grid">
                    {workers.map(w => (
                        <div key={w.id} className="roster-worker-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: "700", fontSize: "13px" }}>{w.name}</span>
                                <span className={`status-pill ${w.status === "Present" ? "success" : "closed"}`}>
                                    {w.status}
                                </span>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                <div>ID: {w.id}</div>
                                <div style={{ marginTop: "4px", color: "#1e60ff", fontWeight: "600" }}>Role: {w.role}</div>
                                <div style={{ marginTop: "2px" }}>{w.shift}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wms-card">
                <h3 style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-main)", marginBottom: "12px" }}>Generate Shift Assignment</h3>
                <form onSubmit={handleCreateShift} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Worker Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter worker's name..." 
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "13px" }}
                            required
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Operational Role</label>
                            <select 
                                value={formRole} 
                                onChange={(e) => setFormRole(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "13px" }}
                            >
                                <option value="Picker">Picker</option>
                                <option value="Packer">Packer</option>
                                <option value="Rider">Rider</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Shift Allocation</label>
                            <select 
                                value={formShift} 
                                onChange={(e) => setFormShift(e.target.value)}
                                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "13px" }}
                            >
                                <option value="Morning (06:00 - 14:00)">Morning</option>
                                <option value="Evening (14:00 - 22:00)">Evening</option>
                                <option value="Night (22:00 - 06:00)">Night</option>
                                <option value="General (09:00 - 18:00)">General</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "8px" }}>
                        Generate Shift Slot
                    </button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// MAIN DYNAMIC MISSING PAGE COMPONENT
// ==========================================
function DynamicMissingPage() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    
    const meta = useMemo(() => {
        return getPageMetadata(location.pathname);
    }, [location.pathname]);

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return meta.data;
        return meta.data.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [meta.data, searchQuery]);

    const handleCreateClick = () => {
        alert(`Raising creation modal for ${meta.pageName}. Under local mock simulation.`);
    };

    const handleExportClick = () => {
        alert(`Exporting ${meta.pageName} details to Excel/CSV.`);
    };

    const renderContent = () => {
        const lowerPage = meta.pageName.toLowerCase();
        
        if (lowerPage.includes("picking")) {
            return <OrderPickingConsole />;
        } else if (lowerPage.includes("packing")) {
            return <OrderPackingStation />;
        } else if (lowerPage.includes("chat")) {
            return <CustomerChatConsole />;
        } else if (lowerPage.includes("tracking")) {
            return <RiderTrackingConsole />;
        } else if (lowerPage.includes("audit") || lowerPage.includes("adjustment")) {
            return <InventoryAuditConsole />;
        } else if (lowerPage.includes("shift")) {
            return <ShiftRosterConsole />;
        }
        
        // Fallback default generic analytics + records layout
        return (
            <div className="dynamic-data-panel">
                {/* Recharts Analytics Visualization */}
                <div className="dynamic-chart-card">
                    <div className="card-header-row">
                        <h2>{meta.pageName} Activity Timeline</h2>
                        <span className="live-pill">● LIVE UPDATES</span>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={meta.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations & Records Table */}
                <div className="dynamic-table-card">
                    <div className="card-header-row table-actions-bar">
                        <h2>Active Records</h2>
                        <div className="search-filter-controls">
                            <div className="search-box-wrapper">
                                <Search size={14} className="search-box-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search records..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input-box"
                                />
                            </div>
                            <button className="btn-filter-refresh" onClick={() => alert("Refreshed records list.")}>
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="dynamic-table-wrapper">
                        <table className="dynamic-records-table">
                            <thead>
                                <tr>
                                    {meta.headers.map((h, i) => <th key={i}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="cell-bold">{row.id}</td>
                                            <td>{row.name}</td>
                                            <td>{row.date}</td>
                                            <td>
                                                <span className={`status-pill ${String(row.status).toLowerCase()}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="cell-muted">{row.remarks}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={meta.headers.length} className="empty-table-cell">
                                            No records found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dynamic-page fade-in">
            {/* Header */}
            <div className="dynamic-page-header">
                <div>
                    <span className="dynamic-module-tag">{meta.moduleName} Module</span>
                    <h1 className="dynamic-page-title">{meta.pageName}</h1>
                    <p className="dynamic-page-subtitle">
                        Comprehensive management dashboard, real-time analytics, and status consoles for {meta.pageName.toLowerCase()}.
                    </p>
                </div>
                <div className="dynamic-header-actions">
                    <button className="btn-secondary" onClick={handleExportClick}>
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <Plus size={14} />
                        <span>Create New</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="dynamic-kpi-grid">
                {meta.stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="dynamic-kpi-card">
                            <div className="dynamic-kpi-info">
                                <span className="dynamic-kpi-label">{stat.label}</span>
                                <span className="dynamic-kpi-value">{stat.value}</span>
                            </div>
                            <div className="dynamic-kpi-icon-wrapper" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                <Icon size={18} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Render specialized or generic content */}
            {renderContent()}
        </div>
    );
}

export default DynamicMissingPage;
