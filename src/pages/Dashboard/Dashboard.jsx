import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    ShoppingCart,
    IndianRupee,
    Users,
    AlertTriangle,
    MoreVertical,
    Check,
    UserPlus,
    CreditCard,
    RotateCcw,
    ChevronDown,
    ArrowUpDown,
    Sparkles,
    Loader2,
    History,
    Trash2,
    Mail,
    Search,
    Warehouse,
    TrendingUp,
    TrendingDown,
    Download,
    Activity,
    PlusCircle,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import "./Dashboard.css";
import phoneImg from "../../assets/phone.png";
import keyboardImg from "../../assets/keyboard.png";

// Dynamic chart datasets for Current vs Previous periods
const dashboardChartData = {
    "7D": [
        { label: "Mon", revenueCurrent: 12000, revenuePrevious: 10500, ordersCurrent: 95, ordersPrevious: 82, profitCurrent: 4800, profitPrevious: 4200 },
        { label: "Tue", revenueCurrent: 15000, revenuePrevious: 11000, ordersCurrent: 110, ordersPrevious: 88, profitCurrent: 6000, profitPrevious: 4400 },
        { label: "Wed", revenueCurrent: 11000, revenuePrevious: 13000, ordersCurrent: 85, ordersPrevious: 104, profitCurrent: 4400, profitPrevious: 5200 },
        { label: "Thu", revenueCurrent: 18000, revenuePrevious: 14500, ordersCurrent: 130, ordersPrevious: 112, profitCurrent: 7200, profitPrevious: 5800 },
        { label: "Fri", revenueCurrent: 22000, revenuePrevious: 19000, ordersCurrent: 165, ordersPrevious: 140, profitCurrent: 8800, profitPrevious: 7600 },
        { label: "Sat", revenueCurrent: 25000, revenuePrevious: 21000, ordersCurrent: 190, ordersPrevious: 160, profitCurrent: 10000, profitPrevious: 8400 },
        { label: "Sun", revenueCurrent: 20000, revenuePrevious: 18000, ordersCurrent: 150, ordersPrevious: 135, profitCurrent: 8000, profitPrevious: 7200 }
    ],
    "30D": [
        { label: "W1", revenueCurrent: 78000, revenuePrevious: 72000, ordersCurrent: 610, ordersPrevious: 580, profitCurrent: 31200, profitPrevious: 28800 },
        { label: "W2", revenueCurrent: 91000, revenuePrevious: 85000, ordersCurrent: 710, ordersPrevious: 670, profitCurrent: 36400, profitPrevious: 34000 },
        { label: "W3", revenueCurrent: 108000, revenuePrevious: 98000, ordersCurrent: 840, ordersPrevious: 790, profitCurrent: 43200, profitPrevious: 39200 },
        { label: "W4", revenueCurrent: 115000, revenuePrevious: 105000, ordersCurrent: 920, ordersPrevious: 840, profitCurrent: 46000, profitPrevious: 42000 }
    ],
    "90D": [
        { label: "May", revenueCurrent: 1100000, revenuePrevious: 950000, ordersCurrent: 8400, ordersPrevious: 7200, profitCurrent: 440000, profitPrevious: 380000 },
        { label: "Jun", revenueCurrent: 900000, revenuePrevious: 1150000, ordersCurrent: 6800, ordersPrevious: 8800, profitCurrent: 360000, profitPrevious: 460000 },
        { label: "Jul", revenueCurrent: 1350000, revenuePrevious: 1080000, ordersCurrent: 9900, ordersPrevious: 8100, profitCurrent: 540000, profitPrevious: 432000 }
    ],
    "1Y": [
        { label: "Q1", revenueCurrent: 3200000, revenuePrevious: 2800000, ordersCurrent: 24000, ordersPrevious: 21000, profitCurrent: 1280000, profitPrevious: 1120000 },
        { label: "Q2", revenueCurrent: 3800000, revenuePrevious: 3100000, ordersCurrent: 29000, ordersPrevious: 23500, profitCurrent: 1520000, profitPrevious: 1240000 },
        { label: "Q3", revenueCurrent: 4100000, revenuePrevious: 3600000, ordersCurrent: 31000, ordersPrevious: 27000, profitCurrent: 1640000, profitPrevious: 1440000 },
        { label: "Q4", revenueCurrent: 4900000, revenuePrevious: 4200000, ordersCurrent: 37000, ordersPrevious: 31500, profitCurrent: 1960000, profitPrevious: 1680000 }
    ]
};

const statSparklineData = {
    "Total Orders": [
        { val: 120 }, { val: 145 }, { val: 130 }, { val: 155 }, { val: 170 }, { val: 165 }, { val: 185 }
    ],
    "Revenue": [
        { val: 8200 }, { val: 9500 }, { val: 8900 }, { val: 9900 }, { val: 10400 }, { val: 10100 }, { val: 10800 }
    ],
    "New Customers": [
        { val: 85 }, { val: 92 }, { val: 88 }, { val: 96 }, { val: 105 }, { val: 101 }, { val: 118 }
    ],
    "Low Stock Items": [
        { val: 28 }, { val: 25 }, { val: 26 }, { val: 24 }, { val: 25 }, { val: 22 }, { val: 23 }
    ]
};

const darkhousePerformanceData = [
    {
        id: "dh-1",
        name: "HAATZA Koramangala Hub",
        orders: 512,
        revenue: "₹45,600",
        avgDeliveryTime: "12 mins",
        stockHealth: "94%",
        status: "Healthy",
        statusColor: "healthy"
    },
    {
        id: "dh-2",
        name: "HAATZA Indiranagar Hub",
        orders: 410,
        revenue: "₹38,200",
        avgDeliveryTime: "15 mins",
        stockHealth: "88%",
        status: "Warning",
        statusColor: "warning"
    },
    {
        id: "dh-3",
        name: "HAATZA HSR Layout Hub",
        orders: 380,
        revenue: "₹31,400",
        avgDeliveryTime: "24 mins",
        stockHealth: "65%",
        status: "Issue",
        statusColor: "issue"
    },
    {
        id: "dh-4",
        name: "HAATZA Jayanagar Hub",
        orders: 490,
        revenue: "₹41,800",
        avgDeliveryTime: "14 mins",
        stockHealth: "91%",
        status: "Healthy",
        statusColor: "healthy"
    }
];

// Dynamic table datasets
const allOrders = [
    {
        id: "#T30462",
        product: "Phone",
        image: phoneImg,
        fallback: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=50&q=80",
        customer: "Matt Dickerson",
        date: "13/05/2025",
        amount: "₹4.95",
        payment: "Transfer Bank",
        status: "Delivered",
        hoursAgo: 2
    },
    {
        id: "#Y18933",
        product: "Keyboard",
        image: keyboardImg,
        fallback: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=50&q=80",
        customer: "Wiktoria",
        date: "22/05/2025",
        amount: "₹8.95",
        payment: "COD",
        status: "Delivered",
        hoursAgo: 18
    },
    {
        id: "#A92837",
        product: "Mouse",
        image: "",
        fallback: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=50&q=80",
        customer: "Alex Smith",
        date: "04/05/2025",
        amount: "₹12.50",
        payment: "Transfer Bank",
        status: "Processing",
        hoursAgo: 22
    },
    {
        id: "#B82839",
        product: "USB Hub",
        image: "",
        fallback: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=50&q=80",
        customer: "Sarah Connor",
        date: "18/05/2025",
        amount: "₹19.99",
        payment: "COD",
        status: "Delivered",
        hoursAgo: 144
    }
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, selectedMetric }) => {
    if (active && payload && payload.length) {
        const currentVal = payload.find(p => p.name.includes("Current"))?.value || 0;
        const previousVal = payload.find(p => p.name.includes("Previous"))?.value || 0;
        const formatValue = (val) => {
            if (selectedMetric === "revenue" || selectedMetric === "profit") {
                return `₹${val.toLocaleString()}`;
            }
            return val.toLocaleString();
        };
        const metricName = selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1);
        return (
            <div className="custom-chart-tooltip">
                <div className="tooltip-header">{label}</div>
                <div className="tooltip-body">
                    <div className="tooltip-row current">
                        <span className="tooltip-dot current-dot"></span>
                        <span className="tooltip-row-label">Current {metricName}:</span>
                        <span className="tooltip-row-value">{formatValue(currentVal)}</span>
                    </div>
                    <div className="tooltip-row previous">
                        <span className="tooltip-dot previous-dot"></span>
                        <span className="tooltip-row-label">Previous {metricName}:</span>
                        <span className="tooltip-row-value">{formatValue(previousVal)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

function Dashboard() {
    const navigate = useNavigate();
    const { canView } = useAuth();

    // Chart States
    const [chartPeriod, setChartPeriod] = useState("30D"); // "7D", "30D", "90D", "1Y"
    const [selectedMetric, setSelectedMetric] = useState("revenue"); // "revenue", "orders", "profit"
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentDate, setCurrentDate] = useState("");

    // Live Simulated Metrics States
    const [totalOrders, setTotalOrders] = useState(1742);
    const [revenue, setRevenue] = useState(108000);
    const [newCustomers, setNewCustomers] = useState(1182);
    const [lowStockCount, setLowStockCount] = useState(23);

    // Table States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // "All", "Delivered", "Processing"
    const [ordersList, setOrdersList] = useState(allOrders);
    const [activeOrderDropdownId, setActiveOrderDropdownId] = useState(null);
    const [activeActivityDropdownOpen, setActiveActivityDropdownOpen] = useState(false);

    // Recent Activities State
    const [activities, setActivities] = useState([
        { id: "act-1", title: "Order Completed", desc: "Order #R823T809 has been successfully completed.", time: "2 mins ago", icon: Check, bgClass: "bg-success", iconClass: "icon-success", unread: true },
        { id: "act-2", title: "New User Registration", desc: "Emelia Charles registered as a new user for haatza.", time: "12 mins ago", icon: UserPlus, bgClass: "bg-warning", iconClass: "icon-warning", unread: true },
        { id: "act-3", title: "Payment Received", desc: "Payment of ₹1,299.99 received from David Walker.", time: "13 mins ago", icon: CreditCard, bgClass: "bg-info", iconClass: "icon-info", unread: false },
        { id: "act-4", title: "Refund Requested", desc: "Refund request of ₹120.00 submitted for Order #R92839.", time: "15 mins ago", icon: RotateCcw, bgClass: "bg-danger", iconClass: "icon-danger", unread: false }
    ]);

    // Initial Date Formatting
    useEffect(() => {
        const options = { month: "short", day: "numeric", year: "numeric" };
        setCurrentDate(new Date().toLocaleDateString("en-US", options));
    }, []);

    // Metric tick — used by both manual button and the auto-interval
    // Uses functional setState form to avoid stale closures.
    const tickMetrics = () => {
        setTotalOrders(prev => prev + Math.floor(Math.random() * 3));
        setRevenue(prev => prev + Math.floor(Math.random() * 150));
        if (Math.random() > 0.6) setNewCustomers(prev => prev + 1);
        if (Math.random() > 0.7) setLowStockCount(prev => Math.max(15, prev + (Math.random() > 0.5 ? 1 : -1)));
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            tickMetrics();
        }, 1000);
    };

    // Auto-refresh metrics every 5 seconds — safe: tickMetrics uses only functional setState
    useEffect(() => {
        const timer = setInterval(tickMetrics, 5000);
        return () => clearInterval(timer);
    }, []); // ✅ No stale closure — tickMetrics only calls functional setState

    const toggleOrderDropdown = (id) => {
        setActiveOrderDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveOrder = (id) => {
        setOrdersList((prev) => prev.filter((o) => o.id !== id));
        setActiveOrderDropdownId(null);
    };

    const handleToggleOrderStatus = (id) => {
        setOrdersList((prev) =>
            prev.map((o) => {
                if (o.id === id) {
                    const nextStatus = o.status === "Delivered" ? "Processing" : "Delivered";
                    return { ...o, status: nextStatus };
                }
                return o;
            })
        );
        setActiveOrderDropdownId(null);
    };

    const handleClearActivities = () => {
        setActivities([]);
        setActiveActivityDropdownOpen(false);
    };

    const handleResetActivities = () => {
        setActivities([
            { id: "act-1", title: "Order Completed", desc: "Order #R823T809 has been successfully completed.", time: "2 mins ago", icon: Check, bgClass: "bg-success", iconClass: "icon-success", unread: true },
            { id: "act-2", title: "New User Registration", desc: "Emelia Charles registered as a new user for haatza.", time: "12 mins ago", icon: UserPlus, bgClass: "bg-warning", iconClass: "icon-warning", unread: true },
            { id: "act-3", title: "Payment Received", desc: "Payment of ₹1,299.99 received from David Walker.", time: "13 mins ago", icon: CreditCard, bgClass: "bg-info", iconClass: "icon-info", unread: false },
            { id: "act-4", title: "Refund Requested", desc: "Refund request of ₹120.00 submitted for Order #R92839.", time: "15 mins ago", icon: RotateCcw, bgClass: "bg-danger", iconClass: "icon-danger", unread: false }
        ]);
        setActiveActivityDropdownOpen(false);
    };

    // ─── AI Analyser States ──────────────────────────────────────────
    const [analyses, setAnalyses] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_dashboard_analyses");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [selectedAnalysis, setSelectedAnalysis] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_dashboard_analyses");
            if (saved) {
                const list = JSON.parse(saved);
                return list.length > 0 ? list[0] : null;
            }
        } catch (e) {}
        return null;
    });
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const runAiAnalysis = async () => {
        setAiLoading(true);
        setAiError(null);

        // Professional offline SWOT scenarios using actual database metrics
        const scenarios = [
            `### OUTSTANDING ACHIEVEMENTS
- **Revenue peak at ₹108,000**: Exceptional growth demonstrating strong customer acquisition and successful marketing campaigns.
- **Order volume reaches 1,742**: Transaction speed and active basket fulfillment rates are at an all-time high, proving darkhouse operations are functioning efficiently.
- **1,182 New Customers gained**: Influx of new signups represents robust regional demand and strong brand resonance across urban clusters.
### AREAS OF ATTENTION
- **23 low stock items alert**: High-demand grocery and essential products in the Koramangala hub are critically low. Failure to replenish immediately will lead to high cart abandonment rates.
- **Refund Mitigation**: A recent refund request of ₹120.00 for Order #R92839 was submitted. Need to monitor quality control on dispatch packages to mitigate return risks.
### STRATEGIC ACTION ITEMS
- **Automated Restocking**: Integrate a real-time low-stock replenishment trigger with active suppliers for the Koramangala hub to guarantee 99% item availability.
- **AOV Optimization**: Implement localized cross-selling bundles (e.g. Pairing electronics accessories or dairy products) to boost the current Average Order Value by 15%.`,

            `### OUTSTANDING ACHIEVEMENTS
- **Robust transaction rate**: The dashboard shows a consistent stream of paid orders, led by David Walker's payment of ₹1,299.99, showing high cart conversion.
- **Solid customer retention growth**: New user registration (e.g. Emelia Charles) suggests a 15.2% monthly increase in user acquisition health.
- **Hub delivery success**: Operational efficiency has allowed 1,742 orders to proceed with minimal logistic delay.
### AREAS OF ATTENTION
- **Koramangala stock depletion**: The darkhouse is running low on essential commodities, risking stockout on high-demand essentials.
- **Refund volume increase**: Increased activity on refund requests signals potential carrier delays or packaging damages during transit.
### STRATEGIC ACTION ITEMS
- **Dynamic pricing strategies**: Leverage the high demand in Electronics to introduce volume discounts and bundle campaigns during peak conversion hours.
- **SLA optimization**: Restructure HSR Layout and Koramangala dispatch routes to reduce average delivery times down to 10 minutes.`,

            `### OUTSTANDING ACHIEVEMENTS
- **Outstanding ₹108,000 revenue target achieved**: Successfully exceeded quarterly operational forecasts by 18.4%.
- **Highly active customer database**: 1,182 new active users registered this month, driving organic referral loops and brand loyalty.
- **Seamless UPI & Card settlement**: Real-time payment verification processed cleanly with transaction success rate climbing to 98.6%.
### AREAS OF ATTENTION
- **Supplier lag warning**: The 23 low-stock alert count indicates supplier side supply-chain friction for fresh produce.
- **Peak hour bottleneck**: Rising order volumes are straining delivery partners during 7 PM - 9 PM periods.
### STRATEGIC ACTION ITEMS
- **Decentralized supply routing**: Distribute high-velocity items from Indiranagar hub to Koramangala hub to alleviate local stock stress.
- **Promotional retention campaign**: Roll out custom repeat-purchase coupons to the 1,182 new signups to lock in their second purchase within 14 days.`
        ];

        // Simulate network delay for highly realistic premium UX
        setTimeout(() => {
            try {
                // Select a random scenario
                const randomIndex = Math.floor(Math.random() * scenarios.length);
                const analysisText = scenarios[randomIndex];

                const newAnalysis = {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    text: analysisText,
                    metrics: { revenue: "₹108,000", orders: "1,742", customers: "1,182", lowStock: "23" }
                };

                const updatedList = [newAnalysis, ...analyses].slice(0, 10);
                setAnalyses(updatedList);
                setSelectedAnalysis(newAnalysis);
                setAiError(null);
                localStorage.setItem("haatza_dashboard_analyses", JSON.stringify(updatedList));
            } catch (err) {
                setAiError(err.message || "An unexpected error occurred during AI analysis.");
            } finally {
                setAiLoading(false);
            }
        }, 600);
    };

    // Parser helper for SWOT markdown output to premium custom HTML blocks
    const parseAnalysisContent = (text) => {
        if (!text) return null;
        const lines = text.split("\n");
        let currentSection = "general";
        const sections = {
            wins: [],
            warnings: [],
            actions: [],
            general: []
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const lower = trimmed.toLowerCase();
            if (lower.includes("achievement") || lower.includes("win") || lower.includes("outstanding")) {
                currentSection = "wins";
                return;
            }
            if (lower.includes("attention") || lower.includes("warning") || lower.includes("alert")) {
                currentSection = "warnings";
                return;
            }
            if (lower.includes("action") || lower.includes("recommendation") || lower.includes("strategic")) {
                currentSection = "actions";
                return;
            }

            const cleanText = trimmed.replace(/^[-*•\d.]+\s+/, "");
            if (cleanText) {
                sections[currentSection].push(cleanText);
            }
        });

        if (sections.wins.length === 0 && sections.warnings.length === 0 && sections.actions.length === 0) {
            return <div className="ai-raw-text">{text}</div>;
        }

        return (
            <div className="ai-parsed-sections">
                {sections.wins.length > 0 && (
                    <div className="ai-parsed-section sec-wins">
                        <div className="ai-section-title">
                            <span className="ai-sec-icon">🏆</span>
                            <h4>Outstanding Achievements</h4>
                        </div>
                        <ul className="ai-sec-list">
                            {sections.wins.map((item, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}></li>
                            ))}
                        </ul>
                    </div>
                )}
                {sections.warnings.length > 0 && (
                    <div className="ai-parsed-section sec-warnings">
                        <div className="ai-section-title">
                            <span className="ai-sec-icon">⚠️</span>
                            <h4>Areas of Attention</h4>
                        </div>
                        <ul className="ai-sec-list">
                            {sections.warnings.map((item, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}></li>
                            ))}
                        </ul>
                    </div>
                )}
                {sections.actions.length > 0 && (
                    <div className="ai-parsed-section sec-actions">
                        <div className="ai-section-title">
                            <span className="ai-sec-icon">💡</span>
                            <h4>Strategic Actions</h4>
                        </div>
                        <ul className="ai-sec-list">
                            {sections.actions.map((item, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // Filter table rows based on search and status
    const getFilteredOrders = () => {
        return ordersList.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.product.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    };

    const filteredOrders = getFilteredOrders();

    // Chart metric key helpers
    const activeChartData = dashboardChartData[chartPeriod] || dashboardChartData["30D"];
    const dataKeyCurrent = `${selectedMetric}Current`;
    const dataKeyPrevious = `${selectedMetric}Previous`;

    // Handle export chart mock action
    const handleExportChart = () => {
        alert(`Exporting Sales Chart Data (${selectedMetric.toUpperCase()} - ${chartPeriod}) as CSV...`);
    };

    // Helper for customer initial avatars
    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Card configurations mapping for responsive sparkline rendering
    // Each card also carries a pageId so we can gate navigation to pages the
    // current user does not have access to (prevents reaching /403 from the dashboard).
    const cardConfigs = [
        {
            title: "Total Orders",
            value: totalOrders.toLocaleString("en-US"),
            icon: ShoppingCart,
            trend: "+12.5%",
            isUp: true,
            route: "/orders",
            pageId: "ORDERS",
            sparkData: statSparklineData["Total Orders"],
            stroke: "#2563EB",
            fill: "#DBEAFE"
        },
        {
            title: "Revenue",
            value: "₹" + revenue.toLocaleString("en-IN"),
            icon: IndianRupee,
            trend: "+8.23%",
            isUp: true,
            route: "/analytics",
            pageId: "ANALYTICS",
            sparkData: statSparklineData["Revenue"],
            stroke: "#10B981",
            fill: "#D1FAE5"
        },
        {
            title: "New Customers",
            value: newCustomers.toLocaleString("en-US"),
            icon: Users,
            trend: "+15.21%",
            isUp: true,
            route: "/customers",
            pageId: "CUSTOMERS",
            sparkData: statSparklineData["New Customers"],
            stroke: "#8B5CF6",
            fill: "#EDE9FE"
        },
        {
            title: "Low Stock Items",
            value: lowStockCount.toString(),
            icon: AlertTriangle,
            trend: "+5.22%",
            isUp: false,
            route: "/catalogue/warehouse",
            pageId: "WAREHOUSE_INVENTORY",
            sparkData: statSparklineData["Low Stock Items"],
            stroke: "#EF4444",
            fill: "#FEE2E2"
        }
    ];

    const unreadCount = activities.filter(act => act.unread).length;

    return (
        <div className="dashboard-view fade-in">
            {/* Top Upgraded Header with Date & Refresh Button */}
            <div className="dashboard-top-header">
                <div className="dashboard-header-left">
                    <h1>Dashboard</h1>
                    <p className="welcome-sub">Overview of your store performance and hub analytics</p>
                </div>
                <div className="dashboard-header-right">
                    <div className="date-badge">
                        <Calendar size={14} />
                        <span>{currentDate}</span>
                    </div>
                    <button 
                        className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`} 
                        onClick={handleRefresh}
                        aria-label="Refresh Dashboard Metrics"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "spin-animation" : ""} />
                        <span>{isRefreshing ? "Refreshed" : "Refresh"}</span>
                    </button>
                </div>
            </div>

            {/* 1. UPGRADED KPI CARDS WITH SPARKLINES & PERMISSION-AWARE ROUTING */}
            <div className="dashboard-stats-grid">
                {cardConfigs.map((card, index) => {
                    const CardIcon = card.icon;
                    const hasAccess = card.pageId ? canView(card.pageId) : true;
                    return (
                        <div
                            key={index}
                            className={`dashboard-summary-card ${!hasAccess ? "dashboard-card-no-access" : ""}`}
                            onClick={() => hasAccess && navigate(card.route)}
                            style={{ cursor: hasAccess ? "pointer" : "default" }}
                            title={!hasAccess ? "You do not have access to this section" : undefined}
                        >
                            <div className="card-stat-info">
                                <div className="card-stat-header">
                                    <div className="card-stat-icon-wrapper" style={{ backgroundColor: `${card.fill}` }}>
                                        <CardIcon size={18} style={{ color: hasAccess ? `${card.stroke}` : "#94a3b8" }} />
                                    </div>
                                    <span className="card-stat-title">{card.title}</span>
                                    {!hasAccess && (
                                        <span style={{
                                            marginLeft: "auto",
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: "#94a3b8",
                                            background: "#f1f5f9",
                                            padding: "2px 7px",
                                            borderRadius: 9999,
                                            letterSpacing: "0.3px"
                                        }}>No access</span>
                                    )}
                                </div>
                                <div className="card-stat-body">
                                    <span className="card-stat-value" style={{ color: !hasAccess ? "#94a3b8" : undefined }}>{ hasAccess ? card.value : "—" }</span>
                                    {hasAccess && (
                                        <div className="card-stat-trend-wrapper">
                                            <span className={`trend-badge ${card.isUp ? "trend-up" : "trend-down"}`}>
                                                {card.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {card.trend}
                                            </span>
                                            <span className="comparison-label">vs last 30 days</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Responsive Recharts Sparkline AreaChart */}
                            <div className="card-sparkline-wrapper" style={{ opacity: hasAccess ? 1 : 0.25 }}>
                                <ResponsiveContainer width="100%" height={40}>
                                    <AreaChart data={card.sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                        <defs>
                                            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={card.stroke} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={card.stroke} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="val"
                                            stroke={hasAccess ? card.stroke : "#cbd5e1"}
                                            strokeWidth={1.8}
                                            fill={`url(#gradient-${index})`}
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI INSIGHTS WIDGET - STREAMLINED & STYLISH */}
            <div className="dashboard-card ai-insights-card">
                <div className="card-header">
                    <div className="card-title-block">
                        <div className="ai-title-wrap">
                            <Sparkles size={16} className="ai-sparkles-icon" />
                            <h2>AI Store Insights</h2>
                        </div>
                        <p>Analyze real-time metrics and hub operational recommendations</p>
                    </div>
                    <button
                        onClick={runAiAnalysis}
                        disabled={aiLoading}
                        className="ai-analyse-btn"
                    >
                        {aiLoading ? (
                            <><Loader2 size={14} className="ai-spinner" /> Analyzing...</>
                        ) : (
                            <><Sparkles size={14} /> AI Analyser</>
                        )}
                    </button>
                </div>

                {/* Grid of Compact Pre-Configured Recommendation Cards */}
                <div className="ai-recommendations-grid">
                    <div className="ai-rec-card border-warning">
                        <div className="ai-rec-card-header">
                            <span className="rec-badge badge-warning">Low Stock Alert</span>
                            <span className="rec-hub">Koramangala</span>
                        </div>
                        <p className="ai-rec-text">Koramangala darkhouse is running low on high-demand essentials. Restock recommended.</p>
                        <button 
                             className="ai-rec-action-btn btn-warning-outline"
                             onClick={() => navigate("/catalogue/warehouse")}
                        >
                            <span>Restock</span>
                            <ArrowUpRight size={12} />
                        </button>
                    </div>

                    <div className="ai-rec-card border-danger">
                        <div className="ai-rec-card-header">
                            <span className="rec-badge badge-danger">Retention Risk</span>
                            <span className="rec-hub">System</span>
                        </div>
                        <p className="ai-rec-text">Customer repeat orders dropped 8% this week. Verify promotional campaign engagement.</p>
                        <button 
                            className="ai-rec-action-btn btn-danger-outline"
                            onClick={() => navigate("/customers")}
                        >
                            <span>View customer trends</span>
                            <ArrowUpRight size={12} />
                        </button>
                    </div>

                    <div className="ai-rec-card border-success">
                        <div className="ai-rec-card-header">
                            <span className="rec-badge badge-success">Top Category</span>
                            <span className="rec-hub">Performance</span>
                        </div>
                        <p className="ai-rec-text">Electronics category performing extremely strong (+24% MoM growth in Indiranagar).</p>
                        <button 
                            className="ai-rec-action-btn btn-success-outline"
                            onClick={() => navigate("/analytics")}
                        >
                            <span>View Insights</span>
                            <ArrowUpRight size={12} />
                        </button>
                    </div>
                </div>

                {/* Haatza AI SWOT Result Panel */}
                {aiError && (
                    <div className="ai-error-bar">
                        <AlertTriangle size={14} />
                        <span>{aiError}</span>
                    </div>
                )}

                {aiLoading && (
                    <div className="ai-loading-state">
                        <Loader2 size={22} className="ai-spinner" />
                        <p>Haatza AI is performing an operational SWOT audit of your database metrics...</p>
                    </div>
                )}

                {!aiLoading && selectedAnalysis && (
                    <div className="ai-result-section fade-in">
                        <div className="ai-result-meta">
                            <span className="ai-report-badge">Haatza AI Operational SWOT Report</span>
                            <span className="ai-result-time">{selectedAnalysis.timestamp}</span>
                        </div>
                        <div className="ai-result-body">
                            {parseAnalysisContent(selectedAnalysis.text)}
                        </div>
                    </div>
                )}

                {/* AI Card Action Footer */}
                <div className="ai-card-footer">
                    <span className="ai-footer-link" onClick={() => navigate("/analytics")}>
                        <ExternalLink size={12} /> Generate Full Report
                    </span>
                    <span className="ai-footer-link" onClick={() => alert("Downloading PDF summary report...")}>
                        <Download size={12} /> Export Executive PDF
                    </span>
                    <span className="ai-footer-link" onClick={() => navigate("/analytics")}>
                        <Activity size={12} /> View Extended Analytics
                    </span>
                </div>
            </div>

            {/* 2. Middle Section: Chart & Activity Feed */}
            <div className="dashboard-middle-section">
                {/* UPGRADED SALES OVER TIME DUAL CHART */}
                <div className="chart-card dashboard-card">
                    <div className="card-header chart-header-row">
                        <div className="card-title-block">
                            <h2>Sales Over Time</h2>
                            <p>Seamlessly monitor multi-period hub performance</p>
                        </div>
                        
                        {/* Upper Metric Toggles */}
                        <div className="chart-controls-wrapper">
                            <div className="metric-toggle-group">
                                <button 
                                    className={`metric-toggle-btn ${selectedMetric === "revenue" ? "active" : ""}`}
                                    onClick={() => setSelectedMetric("revenue")}
                                >
                                    Revenue
                                </button>
                                <button 
                                    className={`metric-toggle-btn ${selectedMetric === "orders" ? "active" : ""}`}
                                    onClick={() => setSelectedMetric("orders")}
                                >
                                    Orders
                                </button>
                                <button 
                                    className={`metric-toggle-btn ${selectedMetric === "profit" ? "active" : ""}`}
                                    onClick={() => setSelectedMetric("profit")}
                                >
                                    Profit
                                </button>
                            </div>

                            {/* Time Filter Pills */}
                            <div className="timeframe-pill-group">
                                {["7D", "30D", "90D", "1Y"].map((period) => (
                                    <button
                                        key={period}
                                        className={`timeframe-pill ${chartPeriod === period ? "active" : ""}`}
                                        onClick={() => setChartPeriod(period)}
                                    >
                                        {period === "90D" ? "3M" : period}
                                    </button>
                                ))}
                            </div>

                            {/* Export Chart Button */}
                            <button 
                                className="chart-export-btn"
                                onClick={handleExportChart}
                                title="Export current dataset as CSV"
                            >
                                <Download size={14} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart
                                data={activeChartData}
                                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="label" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                                />
                                <YAxis 
                                    tickFormatter={(val) => {
                                        if (selectedMetric === "revenue" || selectedMetric === "profit") {
                                            if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
                                            if (val >= 1000) return `₹${val / 1000}k`;
                                            return `₹${val}`;
                                        }
                                        if (val >= 1000) return `${val / 1000}k`;
                                        return val;
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                                />
                                <Tooltip 
                                    content={<CustomTooltip selectedMetric={selectedMetric} />} 
                                    cursor={{ stroke: "#2563EB", strokeWidth: 1, strokeDasharray: "4 4" }} 
                                />
                                <Area
                                    type="monotone"
                                    name="Previous Period"
                                    dataKey={dataKeyPrevious}
                                    stroke="#94A3B8"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    fillOpacity={1}
                                    fill="url(#colorPrevious)"
                                />
                                <Area
                                    type="monotone"
                                    name="Current Period"
                                    dataKey={dataKeyCurrent}
                                    stroke="#2563EB"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorCurrent)"
                                    activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#2563EB" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Legend */}
                    <div className="chart-legend-container">
                        <div className="legend-item">
                            <span className="legend-dot current-dot"></span>
                            <span className="legend-text">Current Period</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot previous-dot-dash"></span>
                            <span className="legend-text">Previous Period</span>
                        </div>
                    </div>
                </div>

                {/* OVERHAULED RECENT ACTIVITY FEED */}
                <div className="activity-card dashboard-card">
                    <div className="card-header" style={{ position: "relative" }}>
                        <div className="activity-title-block">
                            <div className="activity-title-wrap">
                                <h2>Recent Activity</h2>
                                {unreadCount > 0 && (
                                    <span className="unread-badge">{unreadCount} new</span>
                                )}
                            </div>
                            <span className="view-all-link" onClick={() => navigate("/orders")}>
                                View All
                            </span>
                        </div>
                        <button className="action-dots-btn" onClick={() => setActiveActivityDropdownOpen(prev => !prev)}>
                            <MoreVertical size={16} />
                        </button>

                        {activeActivityDropdownOpen && (
                            <>
                                <div className="global-dropdown-overlay" onClick={() => setActiveActivityDropdownOpen(false)} />
                                <div className="global-action-dropdown">
                                    <button 
                                        className="global-dropdown-item"
                                        onClick={handleClearActivities}
                                    >
                                        <Trash2 size={13} />
                                        <span>Clear Feed</span>
                                    </button>
                                    <button 
                                        className="global-dropdown-item"
                                        onClick={handleResetActivities}
                                    >
                                        <RotateCcw size={13} />
                                        <span>Reset Feed</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="activity-list">
                        {activities.length === 0 ? (
                            <div className="ai-empty-state" style={{ padding: "32px 16px" }}>
                                <History size={20} className="ai-sparkles-icon" />
                                <p>No recent activity. Feed cleared.</p>
                            </div>
                        ) : (
                            activities.map((act) => {
                                const Icon = act.icon;
                                return (
                                    <div className={`activity-item ${act.unread ? "unread-activity" : ""}`} key={act.id}>
                                        <div className={`activity-icon-container ${act.bgClass}`}>
                                            <Icon size={14} className={act.iconClass} />
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-header">
                                                <h3>{act.title}</h3>
                                                {act.unread && <span className="activity-dot-unread"></span>}
                                            </div>
                                            <p>{act.desc}</p>
                                            <span className="activity-time">{act.time}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Section: Latest Orders Table */}
            <div className="dashboard-bottom-section">
                <div className="table-card dashboard-card">
                    <div className="card-header table-header-controls">
                        <div className="card-title-block">
                            <h2>Latest Orders</h2>
                            <p>Manage and filter recent regional customer purchases</p>
                        </div>
                        
                        {/* Table Controls (Search & Status Filter) */}
                        <div className="table-filters-container">
                            <div className="table-search-wrapper">
                                <Search size={14} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search tracking ID, customer, product..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="table-search-input"
                                />
                            </div>

                            <div className="status-select-wrapper">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="table-status-select"
                                    aria-label="Filter orders by status"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Processing">Processing</option>
                                </select>
                                <ChevronDown size={13} className="select-arrow" />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>Status</th>
                                    <th className="align-center-header">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="no-records-cell">
                                            No matching orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order, index) => (
                                        <tr key={order.id} className="interactive-table-row">
                                            <td className="tracking-id">{order.id}</td>
                                            <td>
                                                <div className="product-badge">
                                                    <img 
                                                        src={order.image || order.fallback} 
                                                        alt={`${order.product} product`} 
                                                        className="product-img"
                                                        onError={(e) => {
                                                            e.target.src = order.fallback;
                                                        }}
                                                    />
                                                    <span className="product-name">{order.product}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="customer-avatar-wrapper">
                                                    <div className="customer-initial-avatar">
                                                        {getInitials(order.customer)}
                                                    </div>
                                                    <span className="customer-name">{order.customer}</span>
                                                </div>
                                            </td>
                                            <td className="order-date">{order.date}</td>
                                            <td className="order-amount">{order.amount}</td>
                                            <td className="payment-mode">{order.payment}</td>
                                            <td>
                                                <span className={`status-pill status-${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ position: "relative" }} className="align-center-cell">
                                                <button 
                                                    className="table-action-btn"
                                                    onClick={() => toggleOrderDropdown(order.id)}
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {activeOrderDropdownId === order.id && (
                                                    <>
                                                        <div className="global-dropdown-overlay" onClick={() => setActiveOrderDropdownId(null)} />
                                                        <div 
                                                            className="global-action-dropdown"
                                                            style={index >= filteredOrders.length - 2 && filteredOrders.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                        >
                                                            <button 
                                                                className="global-dropdown-item"
                                                                onClick={() => handleToggleOrderStatus(order.id)}
                                                            >
                                                                <Check size={13} />
                                                                <span>Toggle Status</span>
                                                            </button>
                                                            <div className="global-dropdown-divider"></div>
                                                            <button 
                                                                className="global-dropdown-item global-dropdown-item-danger"
                                                                onClick={() => handleRemoveOrder(order.id)}
                                                            >
                                                                <Trash2 size={13} />
                                                                <span>Cancel Order</span>
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
            </div>

            {/* 4. DARKHOUSE PERFORMANCE GRID SECTION */}
            <div className="dashboard-bottom-section">
                <div className="table-card dashboard-card">
                    <div className="card-header">
                        <div className="card-title-block">
                            <div className="darkhouse-section-title">
                                <Warehouse size={16} className="dh-icon" />
                                <h2>Darkhouse Delivery Performance</h2>
                            </div>
                            <p>Real-time operational KPIs across active micro-fulfillment hubs</p>
                        </div>
                        <button 
                            className="view-darkhouse-link-btn" 
                            onClick={() => navigate("/darkhouses")}
                        >
                            <span>Manage Hubs</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="darkhouse-performance-table">
                            <thead>
                                <tr>
                                    <th>Hub Name</th>
                                    <th>Total Orders</th>
                                    <th>Estimated Revenue</th>
                                    <th>Avg Delivery Speed</th>
                                    <th>Stock Health</th>
                                    <th>Operating Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {darkhousePerformanceData.map((hub) => (
                                    <tr key={hub.id} className="interactive-table-row">
                                        <td className="hub-name-cell">
                                            <Warehouse size={14} className="cell-hub-icon" />
                                            <span>{hub.name}</span>
                                        </td>
                                        <td className="hub-orders-cell">{hub.orders}</td>
                                        <td className="hub-revenue-cell">{hub.revenue}</td>
                                        <td className="hub-delivery-cell font-highlight">{hub.avgDeliveryTime}</td>
                                        <td>
                                            <div className="stock-health-cell">
                                                <div className="progress-bar-bg">
                                                    <div 
                                                        className={`progress-bar-fill fill-${hub.statusColor}`}
                                                        style={{ width: hub.stockHealth }}
                                                    ></div>
                                                </div>
                                                <span className="stock-health-text">{hub.stockHealth}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill status-${hub.statusColor}`}>
                                                {hub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;