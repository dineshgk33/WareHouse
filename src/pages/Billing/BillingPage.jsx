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
    ExternalLink,
    HelpCircle,
    MapPin,
    Phone
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
    { 
        id: "RFD-88210", 
        customer: "Sophia Ramirez", 
        email: "sophia.ramirez@email.com", 
        phone: "+1 (415) 823-9201",
        amount: 1250, 
        reason: "Product damaged during delivery transit", 
        shortReason: "Product Damage",
        status: "Pending",
        date: "02 Jun 2026",
        avatarColor: "avatar-indigo",
        productName: "Ergonomic Mechanical Keyboard (Black)",
        price: 1250,
        qty: 1,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&q=80",
        supportingImages: [
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=80&q=80",
            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=80&q=80"
        ],
        timeline: [
            { event: "Refund request initiated by customer", date: "02 Jun 2026 11:24" },
            { event: "Auto gate audit complete: pass", date: "02 Jun 2026 11:25" },
            { event: "Agent Rajesh K. assigned to case", date: "02 Jun 2026 13:40" }
        ],
        address: "450 Mission St, San Francisco, CA 94105"
    },
    { 
        id: "RFD-88209", 
        customer: "James Okafor", 
        email: "james.okafor@mail.com", 
        phone: "+1 (212) 554-7734",
        amount: 460, 
        reason: "Wrong color variant delivered", 
        shortReason: "Wrong Variant",
        status: "Approved",
        date: "01 Jun 2026",
        avatarColor: "avatar-teal",
        productName: "Wireless Office Mouse",
        price: 230,
        qty: 2,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&q=80",
        supportingImages: [
            "https://images.unsplash.com/photo-1625805510665-de0f63b27b3d?w=80&q=80"
        ],
        timeline: [
            { event: "Refund Link Generated", date: "01 Jun 2026 09:12" },
            { event: "Visual evidence reviewed & approved", date: "01 Jun 2026 14:30" }
        ],
        address: "72 Grand St, New York, NY 10013"
    },
    { 
        id: "RFD-88208", 
        customer: "David Park", 
        email: "david.park@kmail.kr", 
        phone: "+82 10-4455-7812",
        amount: 2100, 
        reason: "Order canceled by customer before dispatch", 
        shortReason: "Order Cancellation",
        status: "Processed",
        date: "30 May 2026",
        avatarColor: "avatar-orange",
        productName: "Premium USB-C Docking Station",
        price: 2100,
        qty: 1,
        image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=150&q=80",
        supportingImages: [],
        timeline: [
            { event: "Cancellation triggered in dashboard", date: "30 May 2026 18:02" },
            { event: "Bank ledger transaction reversed", date: "31 May 2026 10:15" }
        ],
        address: "12 Garosu-gil, Gangnam-gu, Seoul, Korea"
    },
    { 
        id: "RFD-88207", 
        customer: "Elena Petrov", 
        email: "e.petrov@euronet.eu", 
        phone: "+44 7911 123456",
        amount: 890, 
        reason: "Duplicate billing transaction error", 
        shortReason: "Duplicate Billing",
        status: "Rejected",
        date: "29 May 2026",
        avatarColor: "avatar-rose",
        productName: "Wired USB Type-C Earphones",
        price: 890,
        qty: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80",
        supportingImages: [],
        timeline: [
            { event: "Duplicate checkout reported", date: "29 May 2026 08:30" },
            { event: "Rejected: Verified single capture settlement", date: "29 May 2026 16:45" }
        ],
        address: "24 Park Ln, London W1K 1PR, UK"
    }
];

function statusClass(status) {
    switch (status) {
        case "Paid":
        case "Approved":  return "status-pill status-paid";
        case "Pending":   return "status-pill status-pending";
        case "Failed":
        case "Rejected":  return "status-pill status-failed";
        case "Refunded":
        case "Processed": return "status-pill status-refunded";
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

function methodBadge(method) {
    let emoji, bg, color;
    switch (method) {
        case "Card":
            emoji = "💳";
            bg = "#EEF2FF";
            color = "#4F46E5";
            break;
        case "Bank":
            emoji = "🏦";
            bg = "#F0FDF4";
            color = "#16A34A";
            break;
        case "UPI":
            emoji = "📱";
            bg = "#ECFDF5";
            color = "#059669";
            break;
        case "COD":
            emoji = "💰";
            bg = "#FEF3C7";
            color = "#D97706";
            break;
        case "Wallet":
            emoji = "👛";
            bg = "#FDF2F8";
            color = "#DB2777";
            break;
        default:
            emoji = "💳";
            bg = "#F1F5F9";
            color = "#334155";
    }
    return (
        <span className="billing-method-badge" style={{ backgroundColor: bg, color: color }}>
            <span style={{ marginRight: "4px" }}>{emoji}</span> {method}
        </span>
    );
}


function BillingPage() {
    const [chartHeight, setChartHeight] = useState(320);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setChartHeight(220); // Mobile: 220px
            } else if (width >= 768 && width < 1024) {
                setChartHeight(280); // Tablet: 280px
            } else {
                setChartHeight(320); // Desktop: 320px
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
    const [selectedRefundForDrawer, setSelectedRefundForDrawer] = useState(null);
    const [refundNotes, setRefundNotes] = useState({
        "RFD-88210": "Packaging damage verified by carrier transit logs."
    });

    // Active tab in Refunds Management
    const [activeRefundTab, setActiveRefundTab] = useState("Pending");
    const [refundsList, setRefundsList] = useState(mockRefunds);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [refundSearch, setRefundSearch] = useState("");
    const [refundActiveDropdownId, setRefundActiveDropdownId] = useState(null);
    const [billingChatHistory, setBillingChatHistory] = useState([
        { sender: "ai", text: "Welcome to Haatza AI Finance Assistant. Ask me about billing trends, GST sync, refund spikes, or gateway timeouts." }
    ]);
    const [billingChatInput, setBillingChatInput] = useState("");

    // Refresh animation simulation
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState(() => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        return new Date().toLocaleDateString("en-US", options);
    });

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
        return refundsList.filter(r => {
            const matchesTab = r.status === activeRefundTab;
            const matchesSearch = 
                r.id.toLowerCase().includes(refundSearch.toLowerCase()) ||
                r.customer.toLowerCase().includes(refundSearch.toLowerCase()) ||
                r.email.toLowerCase().includes(refundSearch.toLowerCase()) ||
                r.reason.toLowerCase().includes(refundSearch.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [refundsList, activeRefundTab, refundSearch]);

    const handleRefundAction = (id, statusChange) => {
        setRefundsList(prev => 
            prev.map(r => r.id === id ? { ...r, status: statusChange } : r)
        );
        alert(`Refund record ${id} status updated to ${statusChange}!`);
    };

    const handleBillingChatSubmit = (e) => {
        if (e) e.preventDefault();
        if (!billingChatInput.trim()) return;

        const userMsg = billingChatInput.trim();
        const updatedHistory = [...billingChatHistory, { sender: "user", text: userMsg }];
        setBillingChatHistory(updatedHistory);
        setBillingChatInput("");

        // Simulated AI NLP delay
        setTimeout(() => {
            const query = userMsg.toLowerCase();
            let aiText = "I have analyzed your query. To help you better, ask me about 'refund spikes', 'payment success rates', 'GST filing integration', or 'card gateway failures'.";

            if (query.includes("refund") || query.includes("spike") || query.includes("dispute")) {
                aiText = "Haatza AI Finance Radar: I have identified a refund request spike (+8.2%) primarily centered in the Koramangala Hub related to mechanical keyboards. All other hubs remain well within the healthy 1.5% threshold. I recommend optimizing the packing material and audit logs.";
            } else if (query.includes("gst") || query.includes("tax") || query.includes("filing")) {
                aiText = "Haatza AI Tax Desk: Your GST filing synchronization is fully operational. Ledger reconciliation for Q1/Q2 has achieved 100% accuracy across UPI and Card gateways. You can click 'Export GST' to download the reconciled tax statement.";
            } else if (query.includes("fail") || query.includes("success") || query.includes("timeout") || query.includes("stripe")) {
                aiText = "Haatza AI Gateway Intelligence: Payment Success Rate is currently at 98.6% (Optimal). However, Stripe Card gateway timeout failures rose slightly to 1.8% over the last 24 hours. COD and UPI gateways are performing at 99.9% uptime.";
            } else if (query.includes("revenue") || query.includes("sales") || query.includes("volume")) {
                aiText = "Haatza AI Performance Summary: Gross revenue is up 14.2% MoM. Digital invoices represent ₹93,200 of processed settlements. UPI continues to dominate with a 54% transaction volume share, leading to zero-chargeback clearances.";
            }

            setBillingChatHistory(prev => [...prev, { sender: "ai", text: aiText }]);
        }, 500);
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
        alert("Haatza AI Engine has completed a deep operational audit of your billing gateways: Digital invoicing success rate is at 98.6%, UPI volume represents 54% of transaction share, and invoice settlements are processed under 1.2s. Q1/Q2 Ledger reconciled successfully!");
    };

    const formatLegendText = (value, entry) => {
        const percentVal = entry.payload?.value;
        return (
            <span style={{ color: "var(--text-main)", fontWeight: "600", marginLeft: "6px", fontSize: "12px" }}>
                {value} <span style={{ color: "var(--text-muted)", fontWeight: "500", marginLeft: "4px" }}>{percentVal}%</span>
            </span>
        );
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

            {/* 2. HAATZA AI BILLING INSIGHTS SECTION */}
            <div className="billing-ai-command-center dashboard-card">
                {/* Command Center Title Header */}
                <div className="command-center-header">
                    <div className="card-title-block">
                        <div className="ai-title-wrap">
                            <Sparkles size={20} className="ai-sparkles-icon" />
                            <h2>Haatza AI Finance Assistant</h2>
                        </div>
                        <p>AI powered monitoring of billing, payments, refunds and gateway health.</p>
                    </div>
                    <div className="ai-action-btn-group">
                        <button className="ai-analyse-btn" onClick={triggerAiAnalysis}>
                            <Sparkles size={14} />
                            <span>Analyse Finance</span>
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

                {/* SECTION 1: Finance Health Cards */}
                <div className="ai-finance-health-grid">
                    {/* Revenue Health */}
                    <div className="ai-health-card">
                        <div className="h-card-top">
                            <span className="h-card-lbl">Revenue Health</span>
                            <span className="h-card-status healthy">Healthy</span>
                        </div>
                        <div className="h-card-mid">
                            <span className="h-card-score">₹93.2k</span>
                            <span className="h-card-trend trend-up">
                                <TrendingUp size={11} /> +14.2% MoM
                            </span>
                        </div>
                        <div className="h-card-sparkline">
                            <ResponsiveContainer width="100%" height={24}>
                                <AreaChart data={[{val: 1200}, {val: 1900}, {val: 800}, {val: 1500}, {val: 3200}, {val: 2100}]}>
                                    <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={1.5} fillOpacity={0.05} fill="#10B981" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payment Success Rate */}
                    <div className="ai-health-card">
                        <div className="h-card-top">
                            <span className="h-card-lbl">Payment Success</span>
                            <span className="h-card-status optimal">Optimal</span>
                        </div>
                        <div className="h-card-mid">
                            <span className="h-card-score">98.6%</span>
                            <span className="h-card-trend trend-up">
                                <TrendingUp size={11} /> +0.2% MoM
                            </span>
                        </div>
                        <div className="h-card-sparkline">
                            <ResponsiveContainer width="100%" height={24}>
                                <AreaChart data={[{val: 97.2}, {val: 97.8}, {val: 98.1}, {val: 98.4}, {val: 98.6}, {val: 98.6}]}>
                                    <Area type="monotone" dataKey="val" stroke="#2563EB" strokeWidth={1.5} fillOpacity={0.05} fill="#2563EB" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Refund Risk */}
                    <div className="ai-health-card">
                        <div className="h-card-top">
                            <span className="h-card-lbl">Refund Risk</span>
                            <span className="h-card-status alert">Alert</span>
                        </div>
                        <div className="h-card-mid">
                            <span className="h-card-score">2.4%</span>
                            <span className="h-card-trend trend-down">
                                <TrendingUp size={11} /> +8% MoM
                            </span>
                        </div>
                        <div className="h-card-sparkline">
                            <ResponsiveContainer width="100%" height={24}>
                                <AreaChart data={[{val: 1.5}, {val: 1.8}, {val: 1.4}, {val: 2.1}, {val: 2.3}, {val: 2.4}]}>
                                    <Area type="monotone" dataKey="val" stroke="#EF4444" strokeWidth={1.5} fillOpacity={0.05} fill="#EF4444" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gateway Uptime */}
                    <div className="ai-health-card">
                        <div className="h-card-top">
                            <span className="h-card-lbl">Gateway Health</span>
                            <span className="h-card-status healthy">Stable</span>
                        </div>
                        <div className="h-card-mid">
                            <span className="h-card-score">99.9%</span>
                            <span className="h-card-trend stable">Stable</span>
                        </div>
                        <div className="h-card-sparkline">
                            <ResponsiveContainer width="100%" height={24}>
                                <AreaChart data={[{val: 99.9}, {val: 99.8}, {val: 99.9}, {val: 99.9}, {val: 99.9}, {val: 99.9}]}>
                                    <Area type="monotone" dataKey="val" stroke="#6366F1" strokeWidth={1.5} fillOpacity={0.05} fill="#6366F1" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Middle Grid containing SECTION 2 (Summary) and SECTION 3 (Actions) */}
                <div className="ai-middle-analytics-grid">
                    {/* SECTION 2: AI Executive Summary */}
                    <div className="ai-executive-summary-panel">
                        <div className="panel-title-block-light">
                            <Activity size={15} className="text-primary" />
                            <h3>AI Executive Summary</h3>
                        </div>
                        <div className="ai-summary-bullets">
                            <div className="ai-summary-bullet-item">
                                <span className="bullet-pulse-green"></span>
                                <span className="bullet-desc"><strong>Revenue Health</strong>: Monthly gross billing volume increased by <strong>14.2% MoM</strong>, driven by corporate checkout volumes.</span>
                            </div>
                            <div className="ai-summary-bullet-item">
                                <span className="bullet-pulse-blue"></span>
                                <span className="bullet-desc"><strong>Transaction Share</strong>: UPI continues to dominate your gateway settlements contributing <strong>54% of payments</strong>, followed by Cards at 28%.</span>
                            </div>
                            <div className="ai-summary-bullet-item">
                                <span className="bullet-pulse-red"></span>
                                <span className="bullet-desc"><strong>Dispute Center Warning</strong>: Refund requests increased by <strong>8% MoM</strong>, with Koramangala packages logging keyboard shipping damages.</span>
                            </div>
                            <div className="ai-summary-bullet-item">
                                <span className="bullet-pulse-orange"></span>
                                <span className="bullet-desc"><strong>Gateway Monitoring</strong>: Stripe Card credit card authentication drops are placing failures slightly <strong>above the normal threshold (1.8%)</strong>.</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Recommended Actions */}
                    <div className="ai-recommended-actions-panel">
                        <div className="panel-title-block-light">
                            <Settings size={15} className="text-primary" />
                            <h3>Recommended Actions</h3>
                        </div>
                        <div className="ai-action-cards-list">
                            {/* Action 1 */}
                            <div className="ai-action-card">
                                <div className="act-card-icon-circle bg-red-light">
                                    <RotateCcw size={14} className="text-danger" />
                                </div>
                                <div className="act-card-text">
                                    <h4>Investigate refund spike</h4>
                                    <p>Freshness audits and box damage checks for Koramangala Hub keyboard deliveries.</p>
                                </div>
                                <button className="act-card-btn" onClick={() => alert("Opening Refund Dispute audits inside drawer...")}>Investigate</button>
                            </div>

                            {/* Action 2 */}
                            <div className="ai-action-card">
                                <div className="act-card-icon-circle bg-blue-light">
                                    <Activity size={14} className="text-primary" />
                                </div>
                                <div className="act-card-text">
                                    <h4>Review failed payment routes</h4>
                                    <p>Stripe timeout warning is rising. Toggle back up to secondary Razorpay routes.</p>
                                </div>
                                <button className="act-card-btn" onClick={() => alert("Re-routing secondary payment gateways...")}>Review</button>
                            </div>

                            {/* Action 3 */}
                            <div className="ai-action-card">
                                <div className="act-card-icon-circle bg-green-light">
                                    <Layers size={14} className="text-success" />
                                </div>
                                <div className="act-card-text">
                                    <h4>Optimize COD zones</h4>
                                    <p>Limit high return-rate COD areas to UPI payment pre-requisites.</p>
                                </div>
                                <button className="act-card-btn" onClick={() => alert("Applying COD checkout limits...")}>Optimize</button>
                            </div>

                            {/* Action 4 */}
                            <div className="ai-action-card">
                                <div className="act-card-icon-circle bg-indigo-light">
                                    <FileSpreadsheet size={14} className="text-indigo" />
                                </div>
                                <div className="act-card-text">
                                    <h4>Generate audit report</h4>
                                    <p>Compile a dynamic, ledger-reconciled tax breakdown statement for Q1/Q2.</p>
                                </div>
                                <button className="act-card-btn" onClick={() => alert("Generating audit logs...")}>Generate</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: Gateway Intelligence Comparison */}
                <div className="ai-gateway-intelligence-panel">
                    <div className="panel-title-block-light">
                        <Layers size={15} className="text-primary" />
                        <h3>Gateway Intelligence Index</h3>
                    </div>
                    <div className="gateway-comparison-table-wrapper">
                        <table className="gateway-comparison-table">
                            <thead>
                                <tr>
                                    <th>Gateway Method</th>
                                    <th>Volume Share</th>
                                    <th>Net Revenue</th>
                                    <th>Success Rate</th>
                                    <th>Refund Rate</th>
                                    <th style={{ width: "120px" }}>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold">📱 UPI</td>
                                    <td>54%</td>
                                    <td className="font-bold">₹78,420</td>
                                    <td className="text-success font-bold">99.9%</td>
                                    <td>0.8%</td>
                                    <td>
                                        <div style={{ width: "80px" }}>
                                            <ResponsiveContainer width="100%" height={16}>
                                                <AreaChart data={[{val: 50}, {val: 52}, {val: 53}, {val: 54}]}>
                                                    <Area type="monotone" dataKey="val" stroke="#16a34a" strokeWidth={1} fillOpacity={0} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">💳 Cards</td>
                                    <td>28%</td>
                                    <td className="font-bold">₹41,200</td>
                                    <td className="text-warning font-bold">98.2%</td>
                                    <td>1.2%</td>
                                    <td>
                                        <div style={{ width: "80px" }}>
                                            <ResponsiveContainer width="100%" height={16}>
                                                <AreaChart data={[{val: 30}, {val: 29}, {val: 28}, {val: 28}]}>
                                                    <Area type="monotone" dataKey="val" stroke="#d97706" strokeWidth={1} fillOpacity={0} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">💼 Wallets</td>
                                    <td>12%</td>
                                    <td className="font-bold">₹18,540</td>
                                    <td className="text-success font-bold">99.5%</td>
                                    <td>2.1%</td>
                                    <td>
                                        <div style={{ width: "80px" }}>
                                            <ResponsiveContainer width="100%" height={16}>
                                                <AreaChart data={[{val: 10}, {val: 11}, {val: 11}, {val: 12}]}>
                                                    <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={1} fillOpacity={0} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="font-bold">💵 Cash on Delivery (COD)</td>
                                    <td>6%</td>
                                    <td className="font-bold">₹9,840</td>
                                    <td className="text-success font-bold">99.9%</td>
                                    <td>5.4%</td>
                                    <td>
                                        <div style={{ width: "80px" }}>
                                            <ResponsiveContainer width="100%" height={16}>
                                                <AreaChart data={[{val: 8}, {val: 7}, {val: 6}, {val: 6}]}>
                                                    <Area type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={1} fillOpacity={0} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SECTION 5: AI Chat Assistant */}
                <div className="ai-chat-assistant-panel">
                    <div className="panel-title-block-light">
                        <HelpCircle size={15} className="text-primary" />
                        <h3>AI Chat Assistant</h3>
                    </div>
                    <p className="chat-subtitle">Ask about billing trends, GST reports, refund spikes, payment failures, or gateway performance.</p>

                    <div className="chat-box-area">
                        <div className="chat-messages-container">
                            {billingChatHistory.map((chat, idx) => (
                                <div key={idx} className={`chat-msg-bubble ${chat.sender}`}>
                                    <div className="msg-avatar-icon">
                                        {chat.sender === "ai" ? <Sparkles size={11} /> : "U"}
                                    </div>
                                    <div className="msg-text-content">
                                        {chat.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className="chat-input-wrapper-dock" onSubmit={handleBillingChatSubmit}>
                            <input
                                type="text"
                                className="chat-dock-input"
                                placeholder="Ask AI about billing trends, success rates, or refund spikes..."
                                value={billingChatInput}
                                onChange={(e) => setBillingChatInput(e.target.value)}
                            />
                            <button type="submit" className="chat-dock-send-btn">
                                <Send size={12} />
                                <span>Ask AI</span>
                            </button>
                        </form>
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
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <PieChart>
                                        <Pie
                                            data={paymentMethodBreakdown}
                                            innerRadius="55%"
                                            outerRadius="80%"
                                            paddingAngle={3}
                                            dataKey="value"
                                            isAnimationActive={true}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        >
                                            {paymentMethodBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            align="center" 
                                            iconType="circle" 
                                            iconSize={8} 
                                            formatter={formatLegendText}
                                            wrapperStyle={{ paddingTop: "20px" }}
                                        />
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
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <PieChart>
                                        <Pie
                                            data={invoiceStatusDistribution}
                                            outerRadius="80%"
                                            dataKey="value"
                                            isAnimationActive={true}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        >
                                            {invoiceStatusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomChartTooltip />} />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            align="center" 
                                            iconType="circle" 
                                            iconSize={8} 
                                            formatter={formatLegendText}
                                            wrapperStyle={{ paddingTop: "20px" }}
                                        />
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

                {/* FINANCE SUMMARY BAR */}
                <div className="finance-summary-bar">
                    <div className="fin-summary-chip">
                        <span className="fin-chip-lbl">Invoices:</span>
                        <span className="fin-chip-val">245</span>
                    </div>
                    <div className="fin-summary-chip fin-chip-paid">
                        <span className="fin-chip-lbl">Paid:</span>
                        <span className="fin-chip-val">₹1,58,400</span>
                    </div>
                    <div className="fin-summary-chip fin-chip-pending">
                        <span className="fin-chip-lbl">Pending:</span>
                        <span className="fin-chip-val">₹12,450</span>
                    </div>
                    <div className="fin-summary-chip fin-chip-refunded">
                        <span className="fin-chip-lbl">Refunded:</span>
                        <span className="fin-chip-val">₹3,200</span>
                    </div>
                    <div className="fin-summary-chip fin-chip-failed">
                        <span className="fin-chip-lbl">Failed:</span>
                        <span className="fin-chip-val">₹2,100</span>
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
                                <th style={{ width: "4%" }} className="align-center-cell">
                                    <input 
                                        type="checkbox"
                                        className="cust-checkbox"
                                        checked={displayedInvoices.length > 0 && displayedInvoices.every(i => selectedInvoices.includes(i.id))}
                                        onChange={() => handleSelectAllRows(displayedInvoices)}
                                        aria-label="Select all invoices on page"
                                    />
                                </th>
                                <th style={{ width: "14%" }}>Invoice ID</th>
                                <th style={{ width: "24%" }}>Customer</th>
                                <th style={{ width: "14%" }}>Billing Date</th>
                                <th style={{ width: "14%" }}>Total Amount</th>
                                <th style={{ width: "14%" }}>Payment Method</th>
                                <th style={{ width: "120px" }} className="align-center-header">Status</th>
                                <th style={{ width: "60px" }} className="align-center-header col-download">Download</th>
                                <th style={{ width: "60px" }} className="align-center-header col-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="billing-empty-row-premium">
                                        <div className="billing-empty-state-container">
                                            <div className="billing-empty-illustration">
                                                <FileSpreadsheet size={32} className="empty-state-icon" />
                                            </div>
                                            <h3>No invoices found</h3>
                                            <p>Your search or filters did not yield any invoice entries.</p>
                                            <button 
                                                className="billing-create-invoice-btn"
                                                onClick={() => {
                                                    const newId = `#INV-00${invoicesList.length + 415}`;
                                                    const newInv = {
                                                        id: newId,
                                                        customer: "Priya Sharma",
                                                        email: "priya.sharma@gmail.com",
                                                        phone: "+91 98452 90123",
                                                        date: "28 May 2026",
                                                        amount: 18400,
                                                        method: "Card",
                                                        status: "Paid",
                                                        txnId: "TXN8283921045",
                                                        billingAddress: "Flat 402, Prestige Shantiniketan, Whitefield, Bangalore",
                                                        items: [{ name: "Quick Reconciled Invoice", qty: 1, price: 18400 }],
                                                        subtotal: 15593,
                                                        gst: 2807,
                                                        deliveryFee: 0,
                                                        paymentHistory: [{ event: "Invoice Created", time: "28 May 2026" }],
                                                        refundReason: ""
                                                    };
                                                    setInvoicesList(prev => [newInv, ...prev]);
                                                    alert("New mock invoice created and added successfully!");
                                                }}
                                            >
                                                Create Invoice
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedInvoices.map((inv, index) => (
                                    <tr 
                                        key={inv.id} 
                                        className={`interactive-table-row ${selectedInvoices.includes(inv.id) ? "row-checked" : ""}`}
                                        onClick={() => handleOpenDrawer(inv)}
                                    >
                                        <td data-label="Select" className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox"
                                                className="cust-checkbox"
                                                checked={selectedInvoices.includes(inv.id)}
                                                onChange={(e) => handleSelectRow(inv.id, e)}
                                                aria-label={`Select ${inv.id}`}
                                            />
                                        </td>
                                        <td data-label="Invoice ID" className="col-inv-id">
                                            <span className="billing-inv-id">{inv.id}</span>
                                        </td>
                                        <td data-label="Customer">
                                            <div className="billing-customer-cell">
                                                <div className="billing-avatar">
                                                    {getInitials(inv.customer)}
                                                </div>
                                                <div className="billing-customer-info">
                                                    <span className="billing-customer-name" title={inv.customer}>{inv.customer}</span>
                                                    <span className="billing-customer-email" title={inv.email}>{inv.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Billing Date" className="billing-date">{inv.date}</td>
                                        <td data-label="Total Amount" className="billing-amount">{formatCurrency(inv.amount)}</td>
                                        <td data-label="Payment Method">
                                            {methodBadge(inv.method)}
                                        </td>
                                        <td data-label="Status" className="align-center-cell col-status">
                                            <span className={statusClass(inv.status)}>{inv.status}</span>
                                        </td>
                                        <td data-label="Download" className="align-center-cell col-download" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="billing-download-btn-icon-only" 
                                                onClick={() => alert(`Downloading PDF Invoice for ${inv.id}...`)}
                                                title="Download Invoice"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </td>
                                        <td data-label="Actions" style={{ position: "relative" }} className="align-center-cell col-actions" onClick={(e) => e.stopPropagation()}>
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
                                                    <div 
                                                        className="global-action-dropdown"
                                                        style={index >= displayedInvoices.length - 2 && displayedInvoices.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                    >
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => {
                                                                handleOpenDrawer(inv);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Layers size={13} />
                                                            <span>View Invoice</span>
                                                        </button>
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => {
                                                                alert(`Downloading PDF Invoice for ${inv.id}...`);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Download size={13} />
                                                            <span>Download PDF</span>
                                                        </button>
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => {
                                                                alert(`Invoice sent successfully to ${inv.email}!`);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Send size={13} />
                                                            <span>Send Invoice</span>
                                                        </button>
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={(e) => {
                                                                handleChangeStatus(inv.id, "Refunded", e);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <RotateCcw size={13} />
                                                            <span>Refund Payment</span>
                                                        </button>
                                                        <div className="global-dropdown-divider"></div>
                                                        <button 
                                                            className="global-dropdown-item global-dropdown-item-danger"
                                                            onClick={(e) => {
                                                                handleRemoveInvoice(inv.id, e);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete Invoice</span>
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

            {/* 5b. REFUND DETAIL SLIDING DESK DRAWER */}
            {selectedRefundForDrawer && (
                <div className="cust-drawer-overlay-backdrop" onClick={() => setSelectedRefundForDrawer(null)}>
                    <div className="cust-drawer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header-row">
                            <div className="drawer-title-block">
                                <span className="drawer-subtitle" style={{ color: "#dc2626" }}>Disputes Center</span>
                                <div className="drawer-title-badge-group">
                                    <h2>Refund Request</h2>
                                    <span className={statusClass(selectedRefundForDrawer.status)}>
                                        {selectedRefundForDrawer.status}
                                    </span>
                                </div>
                                <span className="drawer-cust-id">{selectedRefundForDrawer.id}</span>
                            </div>
                            <button className="drawer-close-btn" onClick={() => setSelectedRefundForDrawer(null)}>✕</button>
                        </div>

                        <div className="drawer-scrollable-body">
                            {/* Refund Visual Overview */}
                            <div className="drawer-visual-section" style={{ backgroundColor: "#FEF2F2", borderColor: "rgba(239, 68, 68, 0.15)" }}>
                                <div className="visual-stat-item">
                                    <span className="v-stat-val" style={{ color: "#b91c1c" }}>{formatCurrency(selectedRefundForDrawer.amount)}</span>
                                    <span className="v-stat-lbl" style={{ color: "#ef4444" }}>Claimed Amount</span>
                                </div>
                                <div className="visual-stat-item">
                                    <span className="v-stat-val" style={{ color: "#334155" }}>Rajesh K.</span>
                                    <span className="v-stat-lbl">Assigned Agent</span>
                                </div>
                            </div>

                            {/* Customer Profile Info card */}
                            <div className="drawer-info-group">
                                <h3>Customer details</h3>
                                <div className="drawer-info-card">
                                    <div className="info-row font-bold">
                                        <span>{selectedRefundForDrawer.customer}</span>
                                    </div>
                                    <div className="info-row">
                                        <Mail size={13} className="info-icon" />
                                        <span>{selectedRefundForDrawer.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <Phone size={13} className="info-icon" />
                                        <span>{selectedRefundForDrawer.phone || "+1 (415) 823-9201"}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPin size={13} className="info-icon" />
                                        <span className="info-address">{selectedRefundForDrawer.address || "450 Mission St, San Francisco, CA 94105"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details with Product Image */}
                            <div className="drawer-info-group">
                                <h3>Order details</h3>
                                <div className="drawer-product-layout">
                                    <img src={selectedRefundForDrawer.image} alt="Product" className="drawer-product-img" />
                                    <div className="drawer-product-details">
                                        <span className="drawer-product-name">{selectedRefundForDrawer.productName}</span>
                                        <span className="drawer-product-price">Qty: {selectedRefundForDrawer.qty} × {formatCurrency(selectedRefundForDrawer.price)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Reason Description */}
                            <div className="drawer-info-group">
                                <h3>Refund Reason</h3>
                                <div className="drawer-refund-alert-card" style={{ padding: "14px", borderRadius: "12px", border: "1px solid var(--border-color)", backgroundColor: "#ffffff" }}>
                                    <span style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>{selectedRefundForDrawer.reason}</span>
                                </div>
                            </div>

                            {/* Supporting Visual Evidence */}
                            {selectedRefundForDrawer.supportingImages && selectedRefundForDrawer.supportingImages.length > 0 && (
                                <div className="drawer-info-group">
                                    <h3>Supporting Images</h3>
                                    <div className="drawer-photos-grid">
                                        {selectedRefundForDrawer.supportingImages.map((imgUrl, idx) => (
                                            <img key={idx} src={imgUrl} alt="Evidence" className="drawer-supporting-photo" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes Section */}
                            <div className="drawer-info-group">
                                <h3>Admin Notes</h3>
                                <textarea
                                    className="drawer-admin-notes-textarea"
                                    placeholder="Add internal verification notes, carrier reports, or resolution logs..."
                                    value={refundNotes[selectedRefundForDrawer.id] || ""}
                                    onChange={(e) => setRefundNotes(prev => ({
                                        ...prev,
                                        [selectedRefundForDrawer.id]: e.target.value
                                    }))}
                                />
                            </div>

                            {/* Operational Event Timeline */}
                            <div className="drawer-info-group">
                                <h3>Timeline</h3>
                                <div className="payment-history-timeline">
                                    {selectedRefundForDrawer.timeline?.map((hist, idx) => (
                                        <div key={idx} className="timeline-node">
                                            <span className="timeline-dot" style={{ backgroundColor: "#dc2626" }}></span>
                                            <div className="timeline-content">
                                                <span className="t-event">{hist.event}</span>
                                                <span className="t-time">{hist.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Bottom Controls Panel */}
                        <div className="drawer-footer-actions">
                            <button 
                                className="drawer-footer-btn outline-btn"
                                onClick={() => alert(`Downloading full refund audit report for ${selectedRefundForDrawer.id}...`)}
                            >
                                <Download size={13} />
                                <span>Audit Report</span>
                            </button>
                            {selectedRefundForDrawer.status === "Pending" ? (
                                <>
                                    <button 
                                        className="drawer-footer-btn"
                                        style={{ backgroundColor: "var(--color-success)", color: "#ffffff" }}
                                        onClick={() => {
                                            handleRefundAction(selectedRefundForDrawer.id, "Approved");
                                            setSelectedRefundForDrawer(null);
                                        }}
                                    >
                                        Approve Refund
                                    </button>
                                    <button 
                                        className="drawer-footer-btn block-btn"
                                        onClick={() => {
                                            handleRefundAction(selectedRefundForDrawer.id, "Rejected");
                                            setSelectedRefundForDrawer(null);
                                        }}
                                    >
                                        Reject Request
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="drawer-footer-btn outline-btn" 
                                    disabled 
                                    style={{ gridColumn: "span 2", cursor: "not-allowed" }}
                                >
                                    Settled as {selectedRefundForDrawer.status}
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

            {/* 7. REFUND REQUEST TRACKING DESK SUB-PANEL */}
            <div className="billing-refunds-section-wrapper">
                <div className="refunds-panel-card dashboard-card">
                    <div className="refunds-panel-header">
                        <div className="panel-title-block">
                            <div className="refunds-section-title">
                                <RotateCcw size={16} className="text-danger" />
                                <h2>Refund Requests</h2>
                            </div>
                            <p>Manage customer return and refund cases</p>
                        </div>

                        {/* Search, Filter tabs and Export controls */}
                        <div className="refunds-controls-row">
                            <div className="billing-search-wrap">
                                <Search size={14} className="billing-search-icon" />
                                <input
                                    type="text"
                                    className="billing-search-input"
                                    placeholder="Search ID, customer..."
                                    value={refundSearch}
                                    onChange={(e) => setRefundSearch(e.target.value)}
                                />
                            </div>

                            <div className="refund-tabs-pills">
                                {["Pending", "Approved", "Processed", "Rejected"].map(tab => {
                                    const baseCounts = {
                                        Pending: refundsList.filter(r => r.status === "Pending").length + 23,
                                        Approved: refundsList.filter(r => r.status === "Approved").length + 55,
                                        Processed: refundsList.filter(r => r.status === "Processed").length + 17,
                                        Rejected: refundsList.filter(r => r.status === "Rejected").length + 4,
                                    };
                                    return (
                                        <button
                                            key={tab}
                                            className={`refund-tab-pill-premium ${activeRefundTab === tab ? "active" : ""}`}
                                            onClick={() => setActiveRefundTab(tab)}
                                        >
                                            <span>{tab}</span>
                                            <span className="tab-count-badge">{baseCounts[tab]}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button className="cust-btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={() => alert("Exporting refund statements as CSV...")}>
                                <Download size={13} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="refund-cards-grid">
                        {displayedRefunds.length === 0 ? (
                            <div className="billing-empty-state-container" style={{ gridColumn: "1 / -1", padding: "40px 20px" }}>
                                <RotateCcw size={32} className="empty-state-icon text-muted" style={{ marginBottom: "12px" }} />
                                <h3>No refunds found</h3>
                                <p>Your search did not yield any refund request entries in {activeRefundTab}.</p>
                            </div>
                        ) : (
                            displayedRefunds.map(ref => (
                                <div key={ref.id} className="refund-card" onClick={() => setSelectedRefundForDrawer(ref)}>
                                    <div className="refund-card-header">
                                        <span className="refund-card-id">{ref.id}</span>
                                        <span className={statusClass(ref.status)}>{ref.status}</span>
                                    </div>
                                    
                                    <div className="refund-card-customer">
                                        <div className={`billing-avatar ${ref.avatarColor || "avatar-indigo"}`}>
                                            {getInitials(ref.customer)}
                                        </div>
                                        <div className="refund-card-cust-info">
                                            <span className="refund-card-cust-name">{ref.customer}</span>
                                            <span className="refund-card-cust-email">{ref.email}</span>
                                        </div>
                                    </div>

                                    <div className="refund-card-body">
                                        <div className="refund-card-reason">
                                            <span className="reason-label">Reason:</span>
                                            <span className="reason-value">{ref.shortReason || ref.reason}</span>
                                        </div>
                                        <div className="refund-card-amount">
                                            <span className="amount-label">Claimed Amount:</span>
                                            <span className="amount-value">{formatCurrency(ref.amount)}</span>
                                        </div>
                                    </div>

                                    <div className="refund-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="ref-card-btn view-details" onClick={() => setSelectedRefundForDrawer(ref)}>
                                            View Details
                                        </button>
                                        {ref.status === "Pending" && (
                                            <>
                                                <button className="ref-card-btn approve" onClick={() => handleRefundAction(ref.id, "Approved")}>
                                                    Approve
                                                </button>
                                                <button className="ref-card-btn reject" onClick={() => handleRefundAction(ref.id, "Rejected")}>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {ref.status === "Approved" && (
                                            <button className="ref-card-btn process" onClick={() => handleRefundAction(ref.id, "Processed")}>
                                                Process payout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
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

const CustomChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                fontSize: "12px",
                fontWeight: "600"
            }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: data.color || payload[0].color, marginRight: "8px" }}></span>
                {data.name}: <span style={{ color: "#38bdf8", marginLeft: "4px" }}>{data.value}%</span>
            </div>
        );
    }
    return null;
};

export default BillingPage;
