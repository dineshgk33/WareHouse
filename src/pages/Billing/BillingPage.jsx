import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    CreditCard,
    Search,
    ChevronDown,
    MoreVertical,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    FileText,
    Trash2,
    Mail,
    Percent,
    CheckCircle2,
    Wallet,
    Send,
    Settings,
    ShieldAlert,
    DollarSign,
    Activity,
    FileSpreadsheet,
    Layers,
    Lock,
    Unlock,
    Sparkles,
    Calendar,
    RefreshCw,
    Info,
    ExternalLink
} from "lucide-react";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import "./Billing.css";

// ─── Extended Mock Invoice Data ──────────────────────────────────────────────
const INITIAL_INVOICES = [
    {
        id: "#INV-00421",
        customer: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        phone: "+91 98452 90123",
        date: "28 May 2026",
        amount: 18400,
        method: "Card",
        status: "Paid",
        txnId: "TXN8283921045",
        billingAddress: "Flat 402, Prestige Shantiniketan, Whitefield, Bangalore 560048",
        items: [
            { name: "Electronics Bundle (Keyboard + Mouse)", qty: 2, price: 8200 },
            { name: "Premium USB Hub", qty: 2, price: 1000 }
        ],
        subtotal: 15593,
        gst: 2807,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Payment Initiated", time: "28 May 2026 14:32" },
            { event: "Stripe Authentication Passed", time: "28 May 2026 14:33" },
            { event: "Paid Successfully", time: "28 May 2026 14:34" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00420",
        customer: "Liam Fitzgerald",
        email: "liam.fitz@outlook.com",
        phone: "+1 (212) 678-9012",
        date: "27 May 2026",
        amount: 5200,
        method: "UPI",
        status: "Pending",
        txnId: "TXN7762512984",
        billingAddress: "24 East 12th St, New York, NY 10003",
        items: [
            { name: "Ergonomic Office Mousepad", qty: 4, price: 1300 }
        ],
        subtotal: 4407,
        gst: 793,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Payment Link Created", time: "27 May 2026 10:15" },
            { event: "UPI Intent Sent to Client App", time: "27 May 2026 10:18" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00419",
        customer: "Amara Osei",
        email: "amara.osei@proton.me",
        phone: "+44 7911 882739",
        date: "25 May 2026",
        amount: 9900,
        method: "Wallet",
        status: "Paid",
        txnId: "TXN9218274615",
        billingAddress: "12 Finchley Rd, London NW3 6HP, UK",
        items: [
            { name: "Wireless Mechanical Keyboard", qty: 1, price: 9900 }
        ],
        subtotal: 8390,
        gst: 1510,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Wallet Authorized", time: "25 May 2026 18:02" },
            { event: "Paid Successfully via Paytm", time: "25 May 2026 18:03" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00418",
        customer: "Carlos Mendez",
        email: "cmendez@corp.io",
        phone: "+34 612 345 678",
        date: "24 May 2026",
        amount: 3200,
        method: "Card",
        status: "Refunded",
        txnId: "TXN1029384756",
        billingAddress: "Paseo de la Castellana 110, Madrid, Spain",
        items: [
            { name: "Multi-device Charging Cable", qty: 2, price: 1600 }
        ],
        subtotal: 2712,
        gst: 488,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Paid Successfully", time: "24 May 2026 11:22" },
            { event: "Refund Request Initiated", time: "26 May 2026 09:15" },
            { event: "Refund Credited Successfully", time: "26 May 2026 16:40" }
        ],
        refundReason: "Customer canceled order before dispatch"
    },
    {
        id: "#INV-00417",
        customer: "Yuki Tanaka",
        email: "yuki.t@shopzone.jp",
        phone: "+81 90-8812-4421",
        date: "23 May 2026",
        amount: 14750,
        method: "COD",
        status: "Paid",
        txnId: "COD1827461928",
        billingAddress: "5-chome Roppongi, Minato-ku, Tokyo, Japan",
        items: [
            { name: "Mechanical Gaming Keyboard", qty: 1, price: 12000 },
            { name: "Premium Keyboard Keycap Remover", qty: 1, price: 2750 }
        ],
        subtotal: 12500,
        gst: 2250,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Cash On Delivery Ordered", time: "23 May 2026 17:40" },
            { event: "Cash Collected by Agent", time: "25 May 2026 12:10" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00416",
        customer: "Fatima Al-Rashid",
        email: "fatima.ar@haatza.ae",
        phone: "+971 50 123 4567",
        date: "22 May 2026",
        amount: 7300,
        method: "UPI",
        status: "Failed",
        txnId: "TXN6652410982",
        billingAddress: "Marina Heights, Dubai Marina, Dubai, UAE",
        items: [
            { name: "Ergonomic Wrist Rest pad", qty: 2, price: 3650 }
        ],
        subtotal: 6186,
        gst: 1114,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Payment Triggered", time: "22 May 2026 19:22" },
            { event: "UPI Gateway Timeout Failure", time: "22 May 2026 19:25" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00415",
        customer: "Noah Bennett",
        email: "noah.b@enterprise.com",
        phone: "+1 (415) 304-2192",
        date: "20 May 2026",
        amount: 22100,
        method: "UPI",
        status: "Paid",
        txnId: "TXN1029837461",
        billingAddress: "85 2nd St, San Francisco, CA 94105",
        items: [
            { name: "Super UltraWide Monitor", qty: 1, price: 22100 }
        ],
        subtotal: 18729,
        gst: 3371,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Direct Bank Transfer Passed", time: "20 May 2026 11:32" },
            { event: "Paid Successfully", time: "20 May 2026 11:33" }
        ],
        refundReason: ""
    },
    {
        id: "#INV-00414",
        customer: "Mei-Ling Chen",
        email: "meiling@techhive.sg",
        phone: "+65 8122 3456",
        date: "18 May 2026",
        amount: 4150,
        method: "Card",
        status: "Pending",
        txnId: "TXN0987654321",
        billingAddress: "Marina Boulevard, Marina Bay Sands, Singapore 018956",
        items: [
            { name: "Wired USB Type-C Earphones", qty: 2, price: 2075 }
        ],
        subtotal: 3517,
        gst: 633,
        deliveryFee: 0,
        paymentHistory: [
            { event: "Payment Initiated", time: "18 May 2026 16:50" }
        ],
        refundReason: ""
    }
];

// Sparkline datasets for 8 KPI Cards
const sparklineData = {
    "Total Revenue": [{ val: 82000 }, { val: 85000 }, { val: 89000 }, { val: 91000 }, { val: 93000 }, { val: 95000 }, { val: 99400 }],
    "Pending Payments": [{ val: 1800 }, { val: 1900 }, { val: 2400 }, { val: 2200 }, { val: 2100 }, { val: 2300 }, { val: 2700 }],
    "Refunds Issued": [{ val: 450 }, { val: 500 }, { val: 400 }, { val: 650 }, { val: 500 }, { val: 400 }, { val: 320 }],
    "Successful Transactions": [{ val: 1200 }, { val: 1300 }, { val: 1350 }, { val: 1410 }, { val: 1460 }, { val: 1510 }, { val: 1605 }],
    "Net Profit": [{ val: 34000 }, { val: 36000 }, { val: 39000 }, { val: 41000 }, { val: 43000 }, { val: 44000 }, { val: 47200 }],
    "Failed Transactions": [{ val: 24 }, { val: 18 }, { val: 21 }, { val: 15 }, { val: 20 }, { val: 14 }, { val: 8 }],
    "Avg Order Value": [{ val: 1150 }, { val: 1200 }, { val: 1230 }, { val: 1210 }, { val: 1250 }, { val: 1290 }, { val: 1315 }],
    "Payment Success Rate": [{ val: 96.5 }, { val: 97.2 }, { val: 96.8 }, { val: 97.4 }, { val: 97.9 }, { val: 98.2 }, { val: 98.6 }]
};

// Recharts Analytics Datasets
const revenueChartData = {
    "7D": [
        { label: "Mon", Current: 12000, Previous: 10500 },
        { label: "Tue", Current: 15000, Previous: 11000 },
        { label: "Wed", Current: 11000, Previous: 13000 },
        { label: "Thu", Current: 18000, Previous: 14500 },
        { label: "Fri", Current: 22000, Previous: 19000 },
        { label: "Sat", Current: 25000, Previous: 21000 },
        { label: "Sun", Current: 20000, Previous: 18000 }
    ],
    "30D": [
        { label: "W1", Current: 78000, Previous: 72000 },
        { label: "W2", Current: 91000, Previous: 85000 },
        { label: "W3", Current: 108000, Previous: 98000 },
        { label: "W4", Current: 115000, Previous: 105000 }
    ],
    "90D": [
        { label: "May", Current: 1100000, Previous: 950000 },
        { label: "Jun", Current: 900000, Previous: 1150000 },
        { label: "Jul", Current: 1350000, Previous: 1080000 }
    ]
};

const paymentMethodBreakdown = [
    { name: "UPI", value: 54, color: "#2563EB" },
    { name: "Card", value: 28, color: "#10B981" },
    { name: "Wallet", value: 12, color: "#8B5CF6" },
    { name: "COD", value: 6, color: "#F59E0B" }
];

const refundTrendData = [
    { label: "Jan", Refunds: 1200 },
    { label: "Feb", Refunds: 1900 },
    { label: "Mar", Refunds: 800 },
    { label: "Apr", Refunds: 1500 },
    { label: "May", Refunds: 3200 },
    { label: "Jun", Refunds: 2100 }
];

const invoiceStatusDistribution = [
    { name: "Paid", value: 72, color: "#10B981" },
    { name: "Pending", value: 16, color: "#F59E0B" },
    { name: "Failed", value: 8, color: "#EF4444" },
    { name: "Refunded", value: 4, color: "#3B82F6" }
];

const mockRefunds = [
    { id: "RFD-88210", customer: "Sophia Ramirez", email: "sophia.ramirez@email.com", amount: 1250, reason: "Product damaged during delivery transit", status: "Pending" },
    { id: "RFD-88209", customer: "James Okafor", email: "james.okafor@mail.com", amount: 460, reason: "Wrong color variant delivered", status: "Approved" },
    { id: "RFD-88208", customer: "David Park", email: "david.park@kmail.kr", amount: 2100, reason: "Order canceled by customer before dispatch", status: "Processed" },
    { id: "RFD-88207", customer: "Elena Petrov", email: "e.petrov@euronet.eu", amount: 890, reason: "Duplicate billing transaction error", status: "Rejected" }
];

function statusClass(status) {
    switch (status) {
        case "Paid":      return "status-pill status-paid";
        case "Pending":   return "status-pill status-pending";
        case "Failed":    return "status-pill status-failed";
        case "Refunded":  return "status-pill status-refunded";
        default:          return "status-pill";
    }
}

function getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function methodIcon(method) {
    switch (method) {
        case "Card": return <CreditCard size={13} className="method-icon" />;
        case "UPI":  return <TrendingUp  size={13} className="method-icon" />;
        case "COD":  return <FileText    size={13} className="method-icon" />;
        case "Wallet": return <Wallet    size={13} className="method-icon" />;
        case "Bank": return <Download    size={13} className="method-icon" />;
        default:     return null;
    }
}

function BillingPage() {
    const [invoicesList, setInvoicesList] = useState(INITIAL_INVOICES);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    
    // Automation States
    const [autoInvoice, setAutoInvoice] = useState(true);
    const [gstExportStatus, setGstExportStatus] = useState(true);
    const [reminders, setReminders] = useState(false);
    const [financeReports, setFinanceReports] = useState(true);

    // Dynamic Lists & Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest"); // "newest", "highest-amount", "lowest-amount"
    const [chartTimeframe, setChartTimeframe] = useState("30D");

    // Drawer States
    const [selectedInvoiceForDrawer, setSelectedInvoiceForDrawer] = useState(null);

    // Active tab in Refunds Management
    const [activeRefundTab, setActiveRefundTab] = useState("Pending");
    const [refundsList, setRefundsList] = useState(mockRefunds);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    // Refresh animation simulation
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        setCurrentDate(new Date().toLocaleDateString("en-US", options));
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveInvoice = (id, e) => {
        if (e) e.stopPropagation();
        setInvoicesList((prev) => prev.filter((i) => i.id !== id));
        setSelectedInvoices((prev) => prev.filter((item) => item !== id));
        if (selectedInvoiceForDrawer?.id === id) {
            setSelectedInvoiceForDrawer(null);
        }
        setActiveDropdownId(null);
    };

    const handleChangeStatus = (id, newStatus, e) => {
        if (e) e.stopPropagation();
        setInvoicesList((prev) =>
            prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
        );
        if (selectedInvoiceForDrawer?.id === id) {
            setSelectedInvoiceForDrawer(prev => ({ ...prev, status: newStatus }));
        }
        setActiveDropdownId(null);
    };

    // Open sliding profile details drawer
    const handleOpenDrawer = (invoice) => {
        setSelectedInvoiceForDrawer(invoice);
    };

    // Trigger refund action inside drawer
    const handleIssueRefundFromDrawer = () => {
        if (!selectedInvoiceForDrawer) return;
        setInvoicesList(prev => 
            prev.map(inv => inv.id === selectedInvoiceForDrawer.id ? { ...inv, status: "Refunded", refundReason: "Initiated via payments desk" } : inv)
        );
        setSelectedInvoiceForDrawer(prev => ({ ...prev, status: "Refunded", refundReason: "Initiated via payments desk" }));
        alert(`Refund processed successfully for ${selectedInvoiceForDrawer.id}!`);
    };

    // Select row checkbox
    const handleSelectRow = (id, e) => {
        e.stopPropagation();
        setSelectedInvoices(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Select all rows checkbox
    const handleSelectAllRows = (displayedOnPage) => {
        const allIds = displayedOnPage.map(i => i.id);
        const isAllSelected = allIds.every(id => selectedInvoices.includes(id));
        
        if (isAllSelected) {
            setSelectedInvoices(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedInvoices(prev => Array.from(new Set([...prev, ...allIds])));
        }
    };

    // Bulk actions
    const handleBulkExport = () => {
        alert(`Exporting billing summaries of ${selectedInvoices.length} selected invoices as CSV...`);
        setSelectedInvoices([]);
    };

    const handleBulkSendReminders = () => {
        alert(`Payment collection reminders sent to clients for ${selectedInvoices.length} invoices.`);
        setSelectedInvoices([]);
    };

    // Filtered invoices
    const displayedInvoices = useMemo(() => {
        let result = invoicesList.filter((inv) => {
            const matchesSearch =
                inv.customer.toLowerCase().includes(search.toLowerCase()) ||
                inv.email.toLowerCase().includes(search.toLowerCase()) ||
                inv.id.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        result = [...result].sort((a, b) => {
            if (sortBy === "highest-amount") return b.amount - a.amount;
            if (sortBy === "lowest-amount") return a.amount - b.amount;
            if (sortBy === "newest") return b.id.localeCompare(a.id);
            return 0;
        });

        return result;
    }, [invoicesList, search, statusFilter, sortBy]);

    // Active Refund records based on active refund tab selection
    const displayedRefunds = useMemo(() => {
        return refundsList.filter(r => r.status === activeRefundTab);
    }, [refundsList, activeRefundTab]);

    const handleRefundAction = (id, statusChange) => {
        setRefundsList(prev => 
            prev.map(r => r.id === id ? { ...r, status: statusChange } : r)
        );
        alert(`Refund record ${id} status updated to ${statusChange}!`);
    };

    const formatCurrency = (val) => {
        return "₹" + val.toLocaleString("en-IN");
    };

    // Dynamic metrics configurations for the 8 fintech KPI cards
    const kpiCardsConfigs = [
        {
            title: "Total Revenue",
            value: formatCurrency(93250 + invoicesList.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0)),
            trend: "+8.23%",
            isUp: true,
            sparkData: sparklineData["Total Revenue"],
            color: "#2563EB",
            fill: "#DBEAFE"
        },
        {
            title: "Pending Payments",
            value: formatCurrency(3100 + invoicesList.filter(i => i.status === "Pending").reduce((sum, i) => sum + i.amount, 0)),
            trend: "+3.10%",
            isUp: false,
            sparkData: sparklineData["Pending Payments"],
            color: "#F59E0B",
            fill: "#FEF3C7"
        },
        {
            title: "Refunds Issued",
            value: formatCurrency(invoicesList.filter(i => i.status === "Refunded").reduce((sum, i) => sum + i.amount, 0)),
            trend: "-12.5%",
            isUp: true, // Lower refunds is good
            sparkData: sparklineData["Refunds Issued"],
            color: "#EF4444",
            fill: "#FEE2E2"
        },
        {
            title: "Successful Transactions",
            value: (1600 + invoicesList.filter(i => i.status === "Paid").length).toLocaleString(),
            trend: "+12.5%",
            isUp: true,
            sparkData: sparklineData["Successful Transactions"],
            color: "#10B981",
            fill: "#D1FAE5"
        },
        {
            title: "Net Profit",
            value: formatCurrency(47200),
            trend: "+10.4%",
            isUp: true,
            sparkData: sparklineData["Net Profit"],
            color: "#8B5CF6",
            fill: "#EDE9FE"
        },
        {
            title: "Failed Transactions",
            value: invoicesList.filter(i => i.status === "Failed").length.toString(),
            trend: "-24.1%",
            isUp: true, // Less failures is good
            sparkData: sparklineData["Failed Transactions"],
            color: "#DC2626",
            fill: "#FEE2E2"
        },
        {
            title: "Avg Order Value",
            value: formatCurrency(1315),
            trend: "+4.2%",
            isUp: true,
            sparkData: sparklineData["Avg Order Value"],
            color: "#EC4899",
            fill: "#FCE7F3"
        },
        {
            title: "Payment Success Rate",
            value: "98.6%",
            trend: "+0.8%",
            isUp: true,
            sparkData: sparklineData["Payment Success Rate"],
            color: "#06B6D4",
            fill: "#CFFAFE"
        }
    ];

    // Trigger generic AI insights analyse
    const triggerAiAnalysis = () => {
        alert("Google Gemini is executing a deep operational SWOT analysis of your billing gateways & ledger trends...");
    };

    return (
        <div className="billing-view fade-in">
            {/* Top Premium Page Header */}
            <div className="billing-top-header">
                <div className="billing-header-left">
                    <h1 className="billing-title">Billing &amp; Payments</h1>
                    <p className="welcome-sub">Fintech desk covering regional digital ledger statements and refunds automation</p>
                </div>
                <div className="billing-header-right">
                    <div className="date-badge">
                        <Calendar size={14} />
                        <span>{currentDate}</span>
                    </div>
                    <button 
                        className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`} 
                        onClick={handleRefresh}
                        aria-label="Refresh Payments desk"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "spin-animation" : ""} />
                        <span>{isRefreshing ? "Syncing" : "Sync Ledger"}</span>
                    </button>
                </div>
            </div>

            {/* 1. UPGRADED 8 KPI STATS CARDS WITH SPARKLINES */}
            <div className="billing-cards-grid-8">
                {kpiCardsConfigs.map((card, index) => (
                    <div key={index} className="fintech-kpi-card">
                        <div className="kpi-card-left">
                            <span className="kpi-lbl">{card.title}</span>
                            <span className="kpi-val">{card.value}</span>
                            <div className="kpi-trend-row">
                                <span className={`trend-badge ${card.isUp ? "trend-up" : "trend-down"}`}>
                                    {card.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                    {card.trend}
                                </span>
                                <span className="vs-lbl">vs last month</span>
                            </div>
                        </div>
                        <div className="kpi-card-sparkline">
                            <ResponsiveContainer width="100%" height={30}>
                                <AreaChart data={card.sparkData}>
                                    <Area type="monotone" dataKey="val" stroke={card.color} strokeWidth={1.8} fillOpacity={0.08} fill={card.color} dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. GEMINI AI BILLING INSIGHTS SECTION */}
            <div className="dashboard-card billing-ai-insights-card">
                <div className="card-header">
                    <div className="card-title-block">
                        <div className="ai-title-wrap">
                            <Sparkles size={16} className="ai-sparkles-icon" />
                            <h2>Gemini AI Billing Insights</h2>
                        </div>
                        <p>Google Gemini automated audit of gateways, chargeback risks, and invoice distributions</p>
                    </div>
                    <div className="ai-action-btn-group">
                        <button className="ai-analyse-btn" onClick={triggerAiAnalysis}>
                            <Sparkles size={14} />
                            <span>Analyse Payments</span>
                        </button>
                        <button className="ai-btn-outline" onClick={() => alert("Generating full executive financial report PDF...")}>
                            <FileText size={13} />
                            <span>Generate Report</span>
                        </button>
                        <button className="ai-btn-outline" onClick={() => alert("Exporting GST filing sheet (Q1/Q2) as Excel...")}>
                            <FileSpreadsheet size={13} />
                            <span>Export GST</span>
                        </button>
                    </div>
                </div>

                <div className="billing-insights-grid">
                    <div className="billing-insight-card border-success">
                        <div className="insight-card-header">
                            <span className="ins-badge badge-success">Revenue Spike</span>
                            <TrendingUp size={14} className="ins-icon text-success" />
                        </div>
                        <p className="insight-text">Revenue increased by **14.2% MoM** this week, driven by bulk wholesale orders in corporate zones.</p>
                    </div>

                    <div className="billing-insight-card border-warning">
                        <div className="insight-card-header">
                            <span className="ins-badge badge-warning">Refund Alert</span>
                            <RotateCcw size={14} className="ins-icon text-warning" />
                        </div>
                        <p className="insight-text">Refunds spike in Koramangala Hub detected (**+8.2% vs last month**). Investigate product freshness logs.</p>
                    </div>

                    <div className="billing-insight-card border-blue">
                        <div className="insight-card-header">
                            <span className="ins-badge badge-blue">UPI Volume Leader</span>
                            <CreditCard size={14} className="ins-icon text-blue" />
                        </div>
                        <p className="insight-text">UPI payments represent **54% of total ledger transactions**. Payment settlement time is 1.2s.</p>
                    </div>

                    <div className="billing-insight-card border-danger">
                        <div className="insight-card-header">
                            <span className="ins-badge badge-danger">Gateway Warning</span>
                            <ShieldAlert size={14} className="ins-icon text-danger" />
                        </div>
                        <p className="insight-text">Failed transactions rose to **1.8% in Card payments** due to Stripe gateway bank timeout drops.</p>
                    </div>
                </div>
            </div>

            {/* 3. ANALYTICS CHARTS SECTION WITH TIMEFRAMES */}
            <div className="billing-charts-layout-section">
                <div className="charts-card-panel">
                    <div className="charts-panel-header">
                        <div className="panel-title-block">
                            <h2>Ledger &amp; Settlements Analytics</h2>
                            <p>Real-time visual monitoring of digital invoicing performance</p>
                        </div>
                        <div className="charts-timeframe-controls">
                            {["7D", "30D", "90D"].map((time) => (
                                <button
                                    key={time}
                                    className={`timeframe-btn ${chartTimeframe === time ? "active" : ""}`}
                                    onClick={() => setChartTimeframe(time)}
                                >
                                    {time === "90D" ? "3M" : time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="charts-visual-grid">
                        {/* Chart 1: Revenue Over Time */}
                        <div className="recharts-visual-item-card">
                            <div className="chart-item-header">
                                <h3>Revenue Over Time</h3>
                                <span className="chart-item-sub">Comparative periods</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={revenueChartData[chartTimeframe] || revenueChartData["30D"]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="chartRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                                        <Tooltip />
                                        <Area type="monotone" name="Current Period" dataKey="Current" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#chartRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Payment Method Breakdown */}
                        <div className="recharts-visual-item-card">
                            <div className="chart-item-header">
                                <h3>Payment Method Breakdown</h3>
                                <span className="chart-item-sub">Transaction volume share (%)</span>
                            </div>
                            <div className="chart-wrapper flex-center-chart">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={paymentMethodBreakdown}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {paymentMethodBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 3: Refund Trends */}
                        <div className="recharts-visual-item-card">
                            <div className="chart-item-header">
                                <h3>Refund Trends</h3>
                                <span className="chart-item-sub">Monthly payouts (INR)</span>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={refundTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748B" }} />
                                        <Tooltip />
                                        <Bar dataKey="Refunds" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 4: Invoice Status Distribution */}
                        <div className="recharts-visual-item-card">
                            <div className="chart-item-header">
                                <h3>Invoice Status Distribution</h3>
                                <span className="chart-item-sub">Settlement states ratio (%)</span>
                            </div>
                            <div className="chart-wrapper flex-center-chart">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={invoiceStatusDistribution}
                                            outerRadius={75}
                                            dataKey="value"
                                        >
                                            {invoiceStatusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. INVOICES TABLE WITH ADVANCED SEARCH/SORT & STICKY HEADERS */}
            <div className="billing-table-card">
                <div className="billing-table-card-header table-header-controls-row">
                    <div className="billing-table-title-block">
                        <h2>Invoices Register</h2>
                        <p>Search, cycle statuses, and verify transactional payouts</p>
                    </div>

                    <div className="invoice-filters-container">
                        {/* Search */}
                        <div className="billing-search-wrap">
                            <Search size={14} className="billing-search-icon" />
                            <input
                                type="text"
                                className="billing-search-input"
                                placeholder="Search ID, customer, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="filter-dropdown-pill-wrapper">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="billing-select-pill"
                                aria-label="Status filter"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                            <ChevronDown size={13} className="select-pill-arrow" />
                        </div>

                        {/* Sorting */}
                        <div className="filter-dropdown-pill-wrapper">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="billing-select-pill"
                                aria-label="Sort order"
                            >
                                <option value="newest">Newest Invoices</option>
                                <option value="highest-amount">Highest Spent</option>
                                <option value="lowest-amount">Lowest Spent</option>
                            </select>
                            <ChevronDown size={13} className="select-pill-arrow" />
                        </div>

                        {/* Bulk actions */}
                        <button 
                            className="cust-btn-outline"
                            onClick={handleBulkExport}
                            disabled={selectedInvoices.length === 0}
                        >
                            <Download size={13} />
                            <span>Export Selected</span>
                        </button>
                    </div>
                </div>

                {/* FLOATING BULK DESK */}
                {selectedInvoices.length > 0 && (
                    <div className="floating-bulk-actions-desk fade-in-up">
                        <div className="bulk-desk-content">
                            <div className="bulk-desk-count">
                                <span className="bulk-circle-badge">{selectedInvoices.length}</span>
                                <span>Selected Invoices</span>
                            </div>
                            <div className="bulk-desk-divider"></div>
                            <div className="bulk-desk-action-buttons">
                                <button className="bulk-desk-action-btn" onClick={handleBulkExport}>
                                    <Download size={13} />
                                    <span>Export CSV</span>
                                </button>
                                <button className="bulk-desk-action-btn" onClick={handleBulkSendReminders}>
                                    <Send size={13} />
                                    <span>Send Reminders</span>
                                </button>
                            </div>
                            <button 
                                className="bulk-desk-clear-btn"
                                onClick={() => setSelectedInvoices([])}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Invoices table register */}
                <div className="billing-table-responsive">
                    <table className="billing-table">
                        <thead>
                            <tr>
                                <th style={{ width: "40px" }} className="align-center-cell">
                                    <input 
                                        type="checkbox"
                                        className="cust-checkbox"
                                        checked={displayedInvoices.length > 0 && displayedInvoices.every(i => selectedInvoices.includes(i.id))}
                                        onChange={() => handleSelectAllRows(displayedInvoices)}
                                        aria-label="Select all invoices on page"
                                    />
                                </th>
                                <th>Invoice ID</th>
                                <th>Customer</th>
                                <th>Billing Date</th>
                                <th>Total Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th className="align-center-header">Download</th>
                                <th className="align-center-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="billing-empty-row no-records-cell">
                                        <Info size={16} />
                                        <span>No matching invoices found.</span>
                                    </td>
                                </tr>
                            ) : (
                                displayedInvoices.map((inv) => (
                                    <tr 
                                        key={inv.id} 
                                        className={`interactive-table-row ${selectedInvoices.includes(inv.id) ? "row-checked" : ""}`}
                                        onClick={() => handleOpenDrawer(inv)}
                                    >
                                        <td className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox"
                                                className="cust-checkbox"
                                                checked={selectedInvoices.includes(inv.id)}
                                                onChange={(e) => handleSelectRow(inv.id, e)}
                                                aria-label={`Select ${inv.id}`}
                                            />
                                        </td>
                                        <td className="billing-inv-id">{inv.id}</td>
                                        <td>
                                            <div className="billing-customer-cell">
                                                <div className="billing-avatar">
                                                    {getInitials(inv.customer)}
                                                </div>
                                                <div className="billing-customer-info">
                                                    <span className="billing-customer-name">{inv.customer}</span>
                                                    <span className="billing-customer-email">{inv.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="billing-date">{inv.date}</td>
                                        <td className="billing-amount">{formatCurrency(inv.amount)}</td>
                                        <td>
                                            <div className="billing-method-cell">
                                                {methodIcon(inv.method)}
                                                <span className="billing-method-label">{inv.method}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={statusClass(inv.status)}>{inv.status}</span>
                                        </td>
                                        <td className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="billing-download-btn" 
                                                onClick={() => alert(`Downloading PDF Invoice for ${inv.id}...`)}
                                                aria-label={`Download PDF invoice ${inv.id}`}
                                            >
                                                <Download size={14} />
                                            </button>
                                        </td>
                                        <td style={{ position: "relative" }} className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="billing-action-btn" 
                                                onClick={(e) => toggleDropdown(inv.id, e)}
                                                aria-label="More actions"
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {activeDropdownId === inv.id && (
                                                <>
                                                    <div className="global-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                                                    <div className="global-action-dropdown">
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => {
                                                                handleOpenDrawer(inv);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Layers size={13} />
                                                            <span>Preview Drawer</span>
                                                        </button>
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={(e) => handleChangeStatus(inv.id, inv.status === "Paid" ? "Pending" : "Paid", e)}
                                                        >
                                                            <CheckCircle2 size={13} />
                                                            <span>Toggle Status</span>
                                                        </button>
                                                        <div className="global-dropdown-divider"></div>
                                                        <button 
                                                            className="global-dropdown-item global-dropdown-item-danger"
                                                            onClick={(e) => handleRemoveInvoice(inv.id, e)}
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete Ledger</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 5. INVOICE DETAIL SLIDING DESK DRAWER */}
            {selectedInvoiceForDrawer && (
                <div className="cust-drawer-overlay-backdrop" onClick={() => setSelectedInvoiceForDrawer(null)}>
                    <div className="cust-drawer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header-row">
                            <div className="drawer-title-block">
                                <span className="drawer-subtitle">Ledger Desk</span>
                                <div className="drawer-title-badge-group">
                                    <h2>Invoice Details</h2>
                                    <span className={statusClass(selectedInvoiceForDrawer.status)}>
                                        {selectedInvoiceForDrawer.status}
                                    </span>
                                </div>
                                <span className="drawer-cust-id">{selectedInvoiceForDrawer.id}</span>
                            </div>
                            <button 
                                className="drawer-close-btn"
                                onClick={() => setSelectedInvoiceForDrawer(null)}
                                aria-label="Close drawer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="drawer-scrollable-body">
                            {/* Invoice Visual Overview */}
                            <div className="drawer-visual-section">
                                <div className="visual-stat-item">
                                    <span className="v-stat-val">{formatCurrency(selectedInvoiceForDrawer.amount)}</span>
                                    <span className="v-stat-lbl">Total Amount</span>
                                </div>
                                <div className="visual-stat-item">
                                    <span className="v-stat-val">{selectedInvoiceForDrawer.method}</span>
                                    <span className="v-stat-lbl">Gateway Method</span>
                                </div>
                            </div>

                            {/* Customer Profile Info card */}
                            <div className="drawer-info-group">
                                <h3>Customer details</h3>
                                <div className="drawer-info-card">
                                    <div className="info-row font-bold">
                                        <span>{selectedInvoiceForDrawer.customer}</span>
                                    </div>
                                    <div className="info-row">
                                        <Mail size={13} className="info-icon" />
                                        <span>{selectedInvoiceForDrawer.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <Phone size={13} className="info-icon" />
                                        <span>{selectedInvoiceForDrawer.phone}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPin size={13} className="info-icon" />
                                        <span className="info-address">{selectedInvoiceForDrawer.billingAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Order list */}
                            <div className="drawer-info-group">
                                <h3>Order items</h3>
                                <div className="drawer-itemized-invoice-list">
                                    {selectedInvoiceForDrawer.items.map((item, idx) => (
                                        <div key={idx} className="invoice-item-row">
                                            <div className="item-name-block">
                                                <span className="i-name">{item.name}</span>
                                                <span className="i-qty">Qty: {item.qty}</span>
                                            </div>
                                            <span className="i-price">{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Finance Tax Breakdown */}
                            <div className="drawer-info-group">
                                <h3>Tax breakdown</h3>
                                <div className="drawer-tax-card">
                                    <div className="tax-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(selectedInvoiceForDrawer.subtotal)}</span>
                                    </div>
                                    <div className="tax-row">
                                        <span>CGST + SGST (18%)</span>
                                        <span>{formatCurrency(selectedInvoiceForDrawer.gst)}</span>
                                    </div>
                                    <div className="tax-row">
                                        <span>Delivery Fee</span>
                                        <span>{formatCurrency(selectedInvoiceForDrawer.deliveryFee)}</span>
                                    </div>
                                    <div className="tax-row total-row">
                                        <span>Total Spent</span>
                                        <span>{formatCurrency(selectedInvoiceForDrawer.amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Reference details */}
                            <div className="drawer-info-group">
                                <h3>Payment details</h3>
                                <div className="drawer-segments-grid">
                                    <div className="segment-indicator">
                                        <span className="seg-lbl">Transaction ID:</span>
                                        <span className="seg-val font-mono">{selectedInvoiceForDrawer.txnId}</span>
                                    </div>
                                    <div className="segment-indicator">
                                        <span className="seg-lbl">Gateway Method:</span>
                                        <span className="seg-val">{selectedInvoiceForDrawer.method}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Event History */}
                            <div className="drawer-info-group">
                                <h3>Payment event history</h3>
                                <div className="payment-history-timeline">
                                    {selectedInvoiceForDrawer.paymentHistory.map((hist, idx) => (
                                        <div key={idx} className="timeline-node">
                                            <span className="timeline-dot"></span>
                                            <div className="timeline-content">
                                                <span className="t-event">{hist.event}</span>
                                                <span className="t-time">{hist.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Refund Details if refunded */}
                            {selectedInvoiceForDrawer.status === "Refunded" && (
                                <div className="drawer-info-group">
                                    <h3>Refund Information</h3>
                                    <div className="drawer-refund-alert-card">
                                        <RotateCcw size={14} className="text-danger" />
                                        <span>Reason: <strong>{selectedInvoiceForDrawer.refundReason || "Initiated via customer desk"}</strong></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Bottom Controls Panel */}
                        <div className="drawer-footer-actions">
                            <button 
                                className="drawer-footer-btn outline-btn"
                                onClick={() => alert(`Downloading PDF Invoice for ${selectedInvoiceForDrawer.id}...`)}
                            >
                                <Download size={13} />
                                <span>Download PDF</span>
                            </button>
                            <button 
                                className="drawer-footer-btn outline-btn"
                                onClick={() => alert(`Invoices dispatched successfully to ${selectedInvoiceForDrawer.email}!`)}
                            >
                                <Send size={13} />
                                <span>Resend Invoice</span>
                            </button>
                            {selectedInvoiceForDrawer.status !== "Refunded" && (
                                <button 
                                    className="drawer-footer-btn block-btn"
                                    onClick={handleIssueRefundFromDrawer}
                                >
                                    <RotateCcw size={13} />
                                    <span>Issue Refund</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. PAYMENT METHOD DESK CARDS SECTION */}
            <div className="billing-payment-methods-panel">
                <div className="panel-title-row">
                    <CreditCard size={16} className="text-blue" />
                    <h2>Gateway share breakdown</h2>
                </div>

                <div className="gateway-cards-grid">
                    {/* UPI */}
                    <div className="gateway-analytics-card">
                        <div className="gw-card-header">
                            <div className="gw-icon-circle bg-blue">
                                <TrendingUp size={16} />
                            </div>
                            <span className="gw-tag font-bold">UPI Payments</span>
                            <span className="gw-share-pill bg-blue-pill">54% Share</span>
                        </div>
                        <div className="gw-card-body">
                            <span className="gw-revenue">₹78,420 spent</span>
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +14.2% MoM
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="gateway-analytics-card">
                        <div className="gw-card-header">
                            <div className="gw-icon-circle bg-teal">
                                <CreditCard size={16} />
                            </div>
                            <span className="gw-tag font-bold">Card Payments</span>
                            <span className="gw-share-pill bg-teal-pill">28% Share</span>
                        </div>
                        <div className="gw-card-body">
                            <span className="gw-revenue">₹41,200 spent</span>
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +4.8% MoM
                            </span>
                        </div>
                    </div>

                    {/* Wallet */}
                    <div className="gateway-analytics-card">
                        <div className="gw-card-header">
                            <div className="gw-icon-circle bg-purple">
                                <Wallet size={16} />
                            </div>
                            <span className="gw-tag font-bold">Wallets Desk</span>
                            <span className="gw-share-pill bg-purple-pill">12% Share</span>
                        </div>
                        <div className="gw-card-body">
                            <span className="gw-revenue">₹18,540 spent</span>
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +8.3% MoM
                            </span>
                        </div>
                    </div>

                    {/* COD */}
                    <div className="gateway-analytics-card">
                        <div className="gw-card-header">
                            <div className="gw-icon-circle bg-yellow">
                                <FileText size={16} />
                            </div>
                            <span className="gw-tag font-bold">COD Register</span>
                            <span className="gw-share-pill bg-yellow-pill">6% Share</span>
                        </div>
                        <div className="gw-card-body">
                            <span className="gw-revenue">₹9,840 spent</span>
                            <span className="trend-badge trend-down">
                                <TrendingDown size={11} /> -12.4% MoM
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7. REFUND MANAGEMENT DESK SUB-PANEL */}
            <div className="billing-refunds-section-wrapper">
                <div className="refunds-panel-card dashboard-card">
                    <div className="refunds-panel-header">
                        <div className="panel-title-block">
                            <div className="refunds-section-title">
                                <RotateCcw size={16} className="text-danger" />
                                <h2>Refund request tracking</h2>
                            </div>
                            <p>Verify customer chargebacks, damaged packages, or checkout double billing triggers</p>
                        </div>

                        {/* Refund Tabs */}
                        <div className="refund-tabs-pills">
                            {["Pending", "Approved", "Processed", "Rejected"].map(tab => (
                                <button
                                    key={tab}
                                    className={`refund-tab-pill ${activeRefundTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveRefundTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="refunds- desk-table">
                            <thead>
                                <tr>
                                    <th>Refund ID</th>
                                    <th>Customer</th>
                                    <th>Claim Amount</th>
                                    <th>Return Reason Details</th>
                                    <th>Request State</th>
                                    <th className="align-center-header">Action Desk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRefunds.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="billing-empty-row no-records-cell">
                                            <Info size={15} />
                                            <span>No refund requests found in {activeRefundTab}.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedRefunds.map(ref => (
                                        <tr key={ref.id} className="interactive-table-row">
                                            <td className="refund-id-cell">{ref.id}</td>
                                            <td>
                                                <div className="refund-customer-block">
                                                    <span className="r-c-name">{ref.customer}</span>
                                                    <span className="r-c-email">{ref.email}</span>
                                                </div>
                                            </td>
                                            <td className="refund-amount-cell font-bold">{formatCurrency(ref.amount)}</td>
                                            <td className="refund-reason-cell">{ref.reason}</td>
                                            <td>
                                                <span className={`status-pill status-${ref.status.toLowerCase()}`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="align-center-cell">
                                                {ref.status === "Pending" && (
                                                    <div className="refund-action-desk-group">
                                                        <button 
                                                            className="refund-act-btn approve" 
                                                            onClick={() => handleRefundAction(ref.id, "Approved")}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            className="refund-act-btn reject" 
                                                            onClick={() => handleRefundAction(ref.id, "Rejected")}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {ref.status === "Approved" && (
                                                    <button 
                                                        className="refund-act-btn process" 
                                                        onClick={() => handleRefundAction(ref.id, "Processed")}
                                                    >
                                                        Process payout
                                                    </button>
                                                )}
                                                {ref.status === "Processed" && (
                                                    <span className="ledger-logged-success">✓ Logged in bank ledger</span>
                                                )}
                                                {ref.status === "Rejected" && (
                                                    <span className="ledger-logged-rejected">✕ Claim rejected</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 8. BILLING AUTOMATION SECTION WITH TOGGLE CONTROL SWITCHES */}
            <div className="billing-automation-panel">
                <div className="panel-title-row">
                    <Settings size={16} className="text-blue" />
                    <h2>Billing automation dashboard</h2>
                </div>

                <div className="automation-cards-grid">
                    {/* Auto Invoicing */}
                    <div className="automation-toggle-card">
                        <div className="aut-card-top">
                            <div className="aut-icon-circle">
                                <FileText size={16} />
                            </div>
                            <div className="aut-text-block">
                                <span className="aut-title font-bold">Auto invoice dispatch</span>
                                <span className="aut-sub">Email invoice instantly on checkout</span>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={autoInvoice}
                                    onChange={(e) => {
                                        setAutoInvoice(e.target.checked);
                                        alert(`Auto Invoice dispatch has been ${e.target.checked ? "ENABLED" : "DISABLED"}.`);
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button className="aut-action-btn" onClick={() => alert("Auto invoicing templates configurator desk...")}>Configure Templates</button>
                    </div>

                    {/* GST Export */}
                    <div className="automation-toggle-card">
                        <div className="aut-card-top">
                            <div className="aut-icon-circle">
                                <FileSpreadsheet size={16} />
                            </div>
                            <div className="aut-text-block">
                                <span className="aut-title font-bold">GST tax filing sync</span>
                                <span className="aut-sub">Quarterly GST tax ledger integration</span>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={gstExportStatus}
                                    onChange={(e) => {
                                        setGstExportStatus(e.target.checked);
                                        alert(`GST sync automation has been ${e.target.checked ? "ENABLED" : "DISABLED"}.`);
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button className="aut-action-btn" onClick={() => alert("Exporting quarterly finance report sheet (GSTIN) as CSV...")}>Export GST Logs</button>
                    </div>

                    {/* Reminders */}
                    <div className="automation-toggle-card">
                        <div className="aut-card-top">
                            <div className="aut-icon-circle">
                                <Send size={16} />
                            </div>
                            <div className="aut-text-block">
                                <span className="aut-title font-bold">Payment reminders</span>
                                <span className="aut-sub">Remind pending buyers at T+2 days</span>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={reminders}
                                    onChange={(e) => {
                                        setReminders(e.target.checked);
                                        alert(`Client payment reminders have been ${e.target.checked ? "ENABLED" : "DISABLED"}.`);
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button className="aut-action-btn" onClick={() => alert("Configure SMS & email reminder delays...")}>Schedule delays</button>
                    </div>

                    {/* Reports */}
                    <div className="automation-toggle-card">
                        <div className="aut-card-top">
                            <div className="aut-icon-circle">
                                <Activity size={16} />
                            </div>
                            <div className="aut-text-block">
                                <span className="aut-title font-bold">Monthly finance audits</span>
                                <span className="aut-sub">Dispatched to admin on 1st of month</span>
                            </div>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={financeReports}
                                    onChange={(e) => {
                                        setFinanceReports(e.target.checked);
                                        alert(`Automated Monthly financial audits have been ${e.target.checked ? "ENABLED" : "DISABLED"}.`);
                                    }}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button className="aut-action-btn" onClick={() => alert("Configuring financial auditing target emails...")}>Audits target list</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillingPage;
