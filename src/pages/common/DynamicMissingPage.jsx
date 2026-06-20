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

            {/* Visual Analytics & Data Panel */}
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
        </div>
    );
}

export default DynamicMissingPage;
