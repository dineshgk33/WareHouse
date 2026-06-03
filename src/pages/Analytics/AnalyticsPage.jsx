import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Activity,
    Send,
    Loader2,
    AlertTriangle,
    History,
    ChevronDown,
    Download,
    ChevronRight,
    ShoppingBag,
    Warehouse,
    PlusCircle,
    X
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartPie,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import "./Analytics.css";

/* ─── Mock Data ───────────────────────────────────────────────── */
const chartDataSets = {
    "7D": [
        { label: "Mon", revenue: 12000, orders: 95, profit: 4800 },
        { label: "Tue", revenue: 15000, orders: 110, profit: 6000 },
        { label: "Wed", revenue: 11000, orders: 85, profit: 4400 },
        { label: "Thu", revenue: 18000, orders: 130, profit: 7200 },
        { label: "Fri", revenue: 22000, orders: 165, profit: 8800 },
        { label: "Sat", revenue: 25000, orders: 190, profit: 10000 },
        { label: "Sun", revenue: 20000, orders: 150, profit: 8000 }
    ],
    "30D": [
        { label: "W1", revenue: 78000, orders: 610, profit: 31200 },
        { label: "W2", revenue: 91000, orders: 710, profit: 36400 },
        { label: "W3", revenue: 108000, orders: 840, profit: 43200 },
        { label: "W4", revenue: 115000, orders: 920, profit: 46000 }
    ],
    "3M": [
        { label: "May", revenue: 78000, orders: 612, profit: 31200 },
        { label: "Jun", revenue: 91000, orders: 710, profit: 36400 },
        { label: "Jul", revenue: 108000, orders: 842, profit: 43200 }
    ],
    "1Y": [
        { label: "Jan", revenue: 42000, orders: 320, profit: 16800 },
        { label: "Feb", revenue: 55000, orders: 410, profit: 22000 },
        { label: "Mar", revenue: 47000, orders: 380, profit: 18800 },
        { label: "Apr", revenue: 63000, orders: 490, profit: 25200 },
        { label: "May", revenue: 78000, orders: 612, profit: 31200 },
        { label: "Jun", revenue: 91000, orders: 710, profit: 36400 },
        { label: "Jul", revenue: 108000, orders: 842, profit: 43200 },
        { label: "Aug", revenue: 112000, orders: 890, profit: 44800 },
        { label: "Sep", revenue: 125000, orders: 980, profit: 50000 },
        { label: "Oct", revenue: 130000, orders: 1020, profit: 52000 },
        { label: "Nov", revenue: 145000, orders: 1150, profit: 58000 },
        { label: "Dec", revenue: 160000, orders: 1280, profit: 64000 }
    ]
};

const sparklineData = {
    "Total Revenue": [
        { val: 40000 }, { val: 52000 }, { val: 45000 }, { val: 61000 }, { val: 75000 }, { val: 89000 }, { val: 108000 }
    ],
    "Conversion Rate": [
        { val: 3.1 }, { val: 3.4 }, { val: 3.2 }, { val: 3.5 }, { val: 3.7 }, { val: 3.6 }, { val: 3.82 }
    ],
    "Avg Order Value": [
        { val: 132 }, { val: 130 }, { val: 129 }, { val: 131 }, { val: 127 }, { val: 126 }, { val: 128.30 }
    ],
    "Return Rate": [
        { val: 3.2 }, { val: 2.9 }, { val: 2.8 }, { val: 2.6 }, { val: 2.5 }, { val: 2.3 }, { val: 2.4 }
    ]
};

const categoryData = [
    { name: "Electronics", value: 38 },
    { name: "Fashion", value: 24 },
    { name: "Home", value: 18 },
    { name: "Groceries", value: 12 },
    { name: "Sports", value: 8 },
];

const PIE_COLORS = ["#1e60ff", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

const topProducts = [
    {
        id: "1",
        name: "Fresh Alphonso Mangoes",
        category: "Fruits & Vegetables",
        sales: 412,
        stock: 45,
        revenue: "₹20,600",
        trend: "+18%",
        up: true,
        thumbnailColor: "avatar-amber",
        initials: "AM"
    },
    {
        id: "2",
        name: "Amul Butter 500g",
        category: "Dairy & Bread",
        sales: 287,
        stock: 82,
        revenue: "₹14,350",
        trend: "+12%",
        up: true,
        thumbnailColor: "avatar-indigo",
        initials: "AB"
    },
    {
        id: "3",
        name: "Coca Cola Zero 300ml",
        category: "Beverages",
        sales: 341,
        stock: 12,
        revenue: "₹8,525",
        trend: "-5%",
        up: false,
        thumbnailColor: "avatar-rose",
        initials: "CC"
    },
    {
        id: "4",
        name: "Aashirvaad Atta 5kg",
        category: "Atta, Rice & Dal",
        sales: 298,
        stock: 94,
        revenue: "₹74,500",
        trend: "+9%",
        up: true,
        thumbnailColor: "avatar-teal",
        initials: "AA"
    },
    {
        id: "5",
        name: "Surf Excel Liquid 1L",
        category: "Cleaning Essentials",
        sales: 512,
        stock: 3,
        revenue: "₹61,440",
        trend: "+31%",
        up: true,
        thumbnailColor: "avatar-purple",
        initials: "SE"
    }
];

const summaryCards = [
    { label: "Total Revenue", value: "₹108,000", change: "+18.4%", up: true, icon: TrendingUp, key: "total-revenue" },
    { label: "Conversion Rate", value: "3.82%", change: "+0.6%", up: true, icon: Activity, key: "conversion-rate" },
    { label: "Avg Order Value", value: "₹128.30", change: "-2.1%", up: false, icon: BarChart3, key: "avg-order-value" },
    { label: "Return Rate", value: "2.4%", change: "-0.8%", up: true, icon: PieChart, key: "return-rate" },
];

const darkhousePerformanceData = [
    {
        name: "HAATZA Koramangala Hub",
        orders: 512,
        revenue: "₹45,600",
        avgDeliveryTime: "12 mins",
        stockHealth: "94%",
        status: "Healthy",
        statusColor: "healthy"
    },
    {
        name: "HAATZA Indiranagar Hub",
        orders: 410,
        revenue: "₹38,200",
        avgDeliveryTime: "15 mins",
        stockHealth: "88%",
        status: "Warning",
        statusColor: "warning"
    },
    {
        name: "HAATZA HSR Layout Hub",
        orders: 380,
        revenue: "₹31,400",
        avgDeliveryTime: "24 mins",
        stockHealth: "65%",
        status: "Issue",
        statusColor: "issue"
    },
    {
        name: "HAATZA Jayanagar Hub",
        orders: 490,
        revenue: "₹41,800",
        avgDeliveryTime: "14 mins",
        stockHealth: "91%",
        status: "Healthy",
        statusColor: "healthy"
    }
];

/* ─── AI Chat Component ───────────────────────────────────────── */
function AIChatPanel() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I'm your Haatza AI Analytics assistant. Ask me anything about your store performance, trends, or recommendations."
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        setError(null);
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);

        // Simulate typing latency for premium SaaS UI experience
        setTimeout(() => {
            try {
                const lowerQuery = userMsg.toLowerCase();
                let reply = "";

                if (lowerQuery.includes("revenue") || lowerQuery.includes("sales") || lowerQuery.includes("profit") || lowerQuery.includes("earn")) {
                    reply = "Our total revenue stands at **₹108,000** for July 2025, demonstrating steady growth from ₹42,000 in January. Profit margins are tracking healthy at approximately **40%**, heavily bolstered by our market-leading Electronics segment.";
                } else if (lowerQuery.includes("order") || lowerQuery.includes("transaction")) {
                    reply = "We have processed **1,742 orders** this month with a conversion rate of **3.82%**. The Average Order Value (AOV) is **₹128.30**. We recommend cross-selling loyalty bundles to push the AOV past ₹140.";
                } else if (lowerQuery.includes("stock") || lowerQuery.includes("inventory") || lowerQuery.includes("warehouse") || lowerQuery.includes("darkhouse")) {
                    reply = "There are **23 low-stock items** requiring urgent attention. **Koramangala Hub** is currently running critically low on high-demand essentials. Indiranagar and Jayanagar remain highly healthy at over 90% stock health.";
                } else if (lowerQuery.includes("category") || lowerQuery.includes("electronics") || lowerQuery.includes("fashion") || lowerQuery.includes("groceries")) {
                    reply = "Our sales share by category is led by **Electronics at 38%**, followed by **Fashion at 24%**, **Home at 18%**, **Groceries at 12%**, and **Sports at 8%**. Electronics category performance is exceptionally strong, up 24% MoM.";
                } else if (lowerQuery.includes("customer") || lowerQuery.includes("retention") || lowerQuery.includes("user")) {
                    reply = "We acquired **1,182 new customers** this month. However, **retention repeat orders dropped 8%** in our Bangalore hubs this week. We recommend deploying a custom promo coupon to new signups immediately.";
                } else if (lowerQuery.includes("delivery") || lowerQuery.includes("time") || lowerQuery.includes("speed")) {
                    reply = "Average delivery times are led by **Koramangala at 12 mins** and **Jayanagar at 14 mins**. HSR Layout is currently averaging **24 mins** due to local courier constraints and requires routing optimization.";
                } else if (lowerQuery.includes("performance") || lowerQuery.includes("report") || lowerQuery.includes("swot") || lowerQuery.includes("summary")) {
                    reply = "Overall operational performance is **Strong (Grade A)**. Strengths include high electronics volume and solid new customer acquisition. Weaknesses are Koramangala's stock health and HSR Layout's delivery times.";
                } else if (lowerQuery.includes("hi") || lowerQuery.includes("hello") || lowerQuery.includes("hey")) {
                    reply = "Hello! I am your **Haatza AI Analytics Assistant**. Ask me about sales trends, top product performance, inventory restock recommendations, or hub operational logistics.";
                } else {
                    reply = "Our real-time database monitors ₹108,000 in revenue, 1,742 orders, and 23 low-stock items. We recommend restocking Koramangala essentials immediately, targeting Bangalore hubs with loyalty campaigns, and expanding the Electronics category catalog.";
                }

                setMessages(prev => [...prev, { role: "assistant", text: reply }]);
            } catch (err) {
                setError("An error occurred while communicating with the local AI engine.");
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="ai-chat-panel">
            <div className="ai-chat-header">
                <Sparkles size={18} className="ai-chat-icon" />
                <div>
                    <h3>AI Analytics Assistant</h3>
                    <p>Powered by Haatza AI Engine</p>
                </div>
                <span className="ai-status-badge">
                    <span className="ai-status-dot"></span>
                    Active
                </span>
            </div>

            <div className="ai-messages-list">
                {messages.map((msg, i) => (
                    <div key={i} className={`ai-message ai-message-${msg.role}`}>
                        {msg.role === "assistant" && (
                            <div className="ai-msg-avatar">
                                <Sparkles size={12} />
                            </div>
                        )}
                        <div className="ai-msg-bubble">
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="ai-message ai-message-assistant">
                        <div className="ai-msg-avatar">
                            <Sparkles size={12} />
                        </div>
                        <div className="ai-msg-bubble ai-typing">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="ai-error-banner">
                        <AlertTriangle size={14} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="ai-input-row">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about sales trends, top products, recommendations..."
                    className="ai-text-input"
                    disabled={loading}
                />
                <button
                    className="ai-send-btn"
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                >
                    {loading ? <Loader2 size={16} className="ai-spinner" /> : <Send size={16} />}
                </button>
            </div>
        </div>
    );
}

/* ─── Analytics Dashboard ─────────────────────────────────── */
function AnalyticsDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [period, setPeriod] = useState("Last 7 months");
    const [customStart, setCustomStart] = useState("2026-01-01");
    const [customEnd, setCustomEnd] = useState("2026-06-01");
    const [customApplied, setCustomApplied] = useState(false);

    // Dynamic Chart States
    const [chartMetric, setChartMetric] = useState("revenue"); // "revenue" | "orders" | "profit"
    const [chartTimeframe, setChartTimeframe] = useState("1Y"); // "7D" | "30D" | "3M" | "1Y"

    // ─── AI Store Insights (SWOT) States ──────────────────────────────────────────
    const [analyses, setAnalyses] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_analytics_analyses");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [selectedAnalysis, setSelectedAnalysis] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_analytics_analyses");
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

        // Professional offline SWOT scenarios using actual analytics metrics
        const scenarios = [
            `### OUTSTANDING ACHIEVEMENTS
- **Robust Conversion Rate at 3.82%**: Strongly exceeds industry benchmark averages for multi-category eCommerce platforms, driven by optimized checkout flows.
- **₹108,000 Monthly Revenue Milestone**: Strong upward trend showing positive brand reputation and organic scale.
- **Healthy 2.4% Return Rate**: Extremely low product return ratio indicates highly accurate descriptions and excellent shipping quality.
### AREAS OF ATTENTION
- **AOV Stagnation at ₹128.30**: Average order value is slightly suppressed. Suggests users are placing low-value orders without exploring high-ticket catalog lines.
- **Conversion funnel drops**: Small conversion dropoffs on mobile devices suggest a need for further mobile responsiveness checks.
### STRATEGIC ACTION ITEMS
- **Cross-category Bundling**: Bundle complimentary low-cost and high-margin products in Electronics and Fashion to boost the AOV to ₹150.00.
- **One-click checkout deployment**: Implement a simplified one-click payment method for recurring customers to capitalize on high conversion levels.`,

            `### OUTSTANDING ACHIEVEMENTS
- **Favorable Return Rate profile of 2.4%**: Minimizes refund-processing operational costs and confirms product reliability across all hubs.
- **Excellent AOV distribution**: ₹128.30 average basket size shows balanced consumption across both fresh produce and home categories.
- **Transaction volumes surge**: High-intensity transaction loops cleanly verified with 3.82% of unique visitors converting to purchasers.
### AREAS OF ATTENTION
- **Mobile performance friction**: Slow image load times on Indiranagar category banners are affecting repeat session conversion metrics.
- **Return rate risk in Fashion**: A slight return rise in apparel items warrants an inspection of vendor sizing charts.
### STRATEGIC ACTION ITEMS
- **Dynamic discount tiers**: Launch tiered checkout threshold promotions (e.g. "Get ₹15 off when spending ₹150") to organically pull the AOV upward.
- **AI-driven recommended products**: Place personalized recommendations on item detail pages to increase cart size dynamically.`,

            `### OUTSTANDING ACHIEVEMENTS
- **Stellar conversion efficiency**: 3.82% transaction checkout success signals high-intent shopping behavior and highly optimized pricing.
- **Sustained ₹108,000 monthly volume**: Validates localized marketing effectiveness and Darkhouse performance.
- **Stable customer return rate (2.4%)**: Validates catalog listing accuracy and robust shipping SLAs.
### AREAS OF ATTENTION
- **Checkout speed bottlenecks**: Minor credit card merchant processor delays are causing small cart dropoffs at peak hours.
- **Product detail page dropoffs**: Users viewing Electronics are dropping out before cart addition at a 15% rate.
### STRATEGIC ACTION ITEMS
- **Electronics variant expansion**: Introduce accessory variant recommendations on high-velocity electronics items to capture high customer intent.
- **UPI payment prioritizing**: Place UPI payment methods at the top of checkout options to bypass card gateway timeouts and elevate conversion past 4.0%.`
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
                    metrics: { revenue: "₹108,000", conversion: "3.82%", aov: "₹128.30" }
                };

                const updatedList = [newAnalysis, ...analyses].slice(0, 10);
                setAnalyses(updatedList);
                setSelectedAnalysis(newAnalysis);
                setAiError(null);
                localStorage.setItem("haatza_analytics_analyses", JSON.stringify(updatedList));
            } catch (err) {
                setAiError(err.message || "An unexpected error occurred during AI analysis.");
            } finally {
                setAiLoading(false);
            }
        }, 600);
    };

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

    return (
        <div className="analytics-view fade-in">
            {/* Header */}
            <div className="analytics-page-header">
                <div>
                    <h1 className="analytics-title">Analytics</h1>
                    <p className="analytics-subtitle">Revenue insights, trends & AI-powered recommendations</p>
                </div>
                <div className="analytics-period-selector">
                    <select
                        value={period}
                        onChange={(e) => {
                            setPeriod(e.target.value);
                            if (e.target.value !== "Custom Range") {
                                setCustomApplied(false);
                            }
                        }}
                        className="analytics-period-select"
                        aria-label="Select analytics timeframe"
                    >
                        <option value="Last 7 months">Last 7 months</option>
                        <option value="Last 3 months">Last 3 months</option>
                        <option value="This Year">This Year</option>
                        <option value="Custom Range">Custom Range</option>
                    </select>
                    <ChevronDown size={14} className="period-select-arrow" />
                </div>
            </div>

            {/* Custom Date Range Picker */}
            {period === "Custom Range" && (
                <div className="custom-date-range-bar fade-in" style={{ marginBottom: "20px" }}>
                    <div className="date-input-group">
                        <label htmlFor="analytics-start-date">From</label>
                        <input
                            id="analytics-start-date"
                            type="date"
                            className="custom-date-input"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                        />
                    </div>
                    <div className="date-input-group">
                        <label htmlFor="analytics-end-date">To</label>
                        <input
                            id="analytics-end-date"
                            type="date"
                            className="custom-date-input"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-apply-date"
                        onClick={() => setCustomApplied(true)}
                    >
                        Apply Range
                    </button>
                    {customApplied && (
                        <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginLeft: "8px" }}>
                            ✓ Range Applied
                        </span>
                    )}
                </div>
            )}

            {/* Summary Cards */}
            <div className="analytics-summary-grid">
                {summaryCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            className="analytics-summary-card"
                            key={card.label}
                            onClick={() => setSearchParams({ detail: card.key })}
                        >
                            <div className="analytics-card-left-block">
                                <div className="analytics-card-icon-wrap">
                                    <Icon size={18} />
                                </div>
                                <div className="analytics-card-body">
                                    <span className="analytics-card-label">{card.label}</span>
                                    <span className="analytics-card-value">{card.value}</span>
                                    <span className="analytics-card-subtext">vs previous month</span>
                                </div>
                            </div>
                            
                            <div className="analytics-card-right-block" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                                <span className={`analytics-card-change ${card.up ? "change-up" : "change-down"}`}>
                                    {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {card.change}
                                </span>
                                
                                {/* Sparkline Area Chart */}
                                <div className="analytics-card-sparkline" style={{ width: "70px", height: "30px" }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparklineData[card.label]} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                                            <defs>
                                                <linearGradient id={`grad-${card.key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={card.up ? "#10b981" : "#ef4444"} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={card.up ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="val"
                                                stroke={card.up ? "#10b981" : "#ef4444"}
                                                strokeWidth={1.5}
                                                fill={`url(#grad-${card.key})`}
                                                dot={false}
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI Recommendations section inside insights card */}
            <div className="analytics-grid-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* AI Recommendations */}
                <div className="analytics-chart-card ai-recommendations-section">
                    <div className="analytics-chart-header" style={{ marginBottom: "16px" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Sparkles size={16} className="toast-icon" style={{ color: "var(--primary)" }} />
                                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>AI Recommendations</h3>
                            </div>
                            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>Actionable inventory strategies and consumer demand optimizations</p>
                        </div>
                    </div>
                    
                    <div className="ai-rec-grid" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="ai-rec-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-card)", transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", justifyContent: "center" }}>
                                    <Warehouse size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>Koramangala darkhouse low stock</h4>
                                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-muted)" }}>5 high-demand items are running below reorder limit</p>
                                </div>
                            </div>
                            <button className="dkh-inline-btn" style={{ backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "8px", padding: "8px 14px", fontWeight: "700", cursor: "pointer" }} onClick={() => alert("Initiated restocking allocation order to Koramangala darkhouse.")}>
                                Restock
                            </button>
                        </div>

                        <div className="ai-rec-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-card)", transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)", display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", justifyContent: "center" }}>
                                    <TrendingDown size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>Customer repeat orders dropped 8%</h4>
                                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-muted)" }}>Retention rate showing signs of fatigue in Bangalore</p>
                                </div>
                            </div>
                            <button className="dkh-inline-btn" style={{ backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: "8px", padding: "8px 14px", fontWeight: "700", cursor: "pointer" }} onClick={() => alert("Navigating to retention optimization cohorts...")}>
                                View customer trends
                            </button>
                        </div>

                        <div className="ai-rec-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", border: "1px solid var(--border-color)", borderRadius: "12px", backgroundColor: "var(--bg-card)", transition: "all 0.2s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--color-success-light)", color: "var(--color-success)", display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", justifyContent: "center" }}>
                                    <PlusCircle size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>Electronics category performing strong</h4>
                                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-muted)" }}>Demand is up 34% this week. Consider stocking variants</p>
                                </div>
                            </div>
                            <button className="dkh-inline-btn" style={{ backgroundColor: "var(--color-success-light)", color: "var(--color-success)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "8px", padding: "8px 14px", fontWeight: "700", cursor: "pointer" }} onClick={() => alert("Loading dynamic electronics inventory expansion panel...")}>
                                Expand inventory
                            </button>
                        </div>
                    </div>
                    
                    {/* AI Recommendations Quick Action Buttons */}
                    <div className="ai-rec-quick-actions" style={{ display: "flex", gap: "10px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-color)" }}>
                        <button className="ai-rec-qa-btn" style={{ flex: 1, padding: "8px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" }} onClick={() => alert("Generating monthly store performance audit report...")}>Generate Report</button>
                        <button className="ai-rec-qa-btn" style={{ flex: 1, padding: "8px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-card)", color: "var(--text-main)", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease" }} onClick={() => alert("Downloading PDF summary...")}>Export PDF</button>
                        <button className="ai-rec-qa-btn" style={{ flex: 1, padding: "8px 14px", border: "1px solid var(--primary)", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease" }} onClick={() => alert("Opening deep analytics insights console...")}>View Insights</button>
                    </div>
                </div>

                {/* AI Store Insights SWOT Widget */}
                <div className="ai-insights-card" style={{ gap: "12px" }}>
                    <div className="card-header">
                        <div className="card-title-block">
                            <h2 style={{ fontSize: "16px", fontWeight: "700" }}>AI Store Insights</h2>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Analyze your store performance with Haatza AI Engine</p>
                        </div>
                        <button
                            onClick={runAiAnalysis}
                            disabled={aiLoading}
                            className="ai-analyse-btn"
                        >
                            {aiLoading ? (
                                <><Loader2 size={14} className="ai-spinner" /> Analyzing...</>
                            ) : (
                                <><Sparkles size={14} /> Analyze Data</>
                            )}
                        </button>
                    </div>

                    {/* Error state */}
                    {aiError && (
                        <div className="ai-error-bar">
                            <AlertTriangle size={14} />
                            <span>{aiError}</span>
                        </div>
                    )}

                    {/* Loading state */}
                    {aiLoading && (
                        <div className="ai-loading-state">
                            <Loader2 size={22} className="ai-spinner" />
                            <p>Haatza AI is analyzing your store metrics…</p>
                        </div>
                    )}

                    {/* Analysis result */}
                    {!aiLoading && selectedAnalysis && (
                        <div className="ai-result-section fade-in" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                            <div className="ai-result-meta">
                                <span className="ai-report-badge">Haatza AI Report</span>
                                <span className="ai-result-time">{selectedAnalysis.timestamp}</span>
                            </div>
                            <div className="ai-result-body">
                                {parseAnalysisContent(selectedAnalysis.text)}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!aiLoading && !selectedAnalysis && !aiError && (
                        <div className="ai-empty-state">
                            <Sparkles size={20} className="ai-sparkles-icon" />
                            <p>Click <strong>Analyze Data</strong> to generate an AI-powered analysis of your store metrics.</p>
                        </div>
                    )}

                    {/* Previous analyses history */}
                    {analyses.length > 1 && (
                        <div className="ai-history-section" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                            <div className="ai-history-title">
                                <History size={13} />
                                <h3>Previous Analyses</h3>
                            </div>
                            <div className="ai-history-list">
                                {analyses.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedAnalysis(item)}
                                        className={`ai-history-item ${selectedAnalysis?.id === item.id ? "active" : ""}`}
                                    >
                                        <span className="ai-hist-dot"></span>
                                        <span className="ai-hist-time">{item.timestamp}</span>
                                        <span className="ai-hist-revenue">{item.metrics.revenue}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle: Revenue Chart + AI Chat */}
            <div className="analytics-middle-grid">
                {/* Revenue Over Time */}
                <div className="analytics-chart-card">
                    <div className="analytics-chart-header" style={{ flexWrap: "wrap", gap: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Revenue & Volumes Analysis</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Interactive transactional metrics and volume filters</p>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            {/* Metric Toggles */}
                            <div className="chart-metric-toggles" style={{ display: "flex", background: "var(--bg-app)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                {["revenue", "orders", "profit"].map((m) => (
                                    <button
                                        key={m}
                                        className={`chart-metric-toggle-btn ${chartMetric === m ? "active" : ""}`}
                                        onClick={() => setChartMetric(m)}
                                        style={{
                                            padding: "6px 12px",
                                            borderRadius: "6px",
                                            border: "none",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            textTransform: "capitalize",
                                            cursor: "pointer",
                                            backgroundColor: chartMetric === m ? "var(--primary)" : "transparent",
                                            color: chartMetric === m ? "var(--text-inverse)" : "var(--text-muted)",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Time Filters */}
                            <div className="chart-time-filters" style={{ display: "flex", gap: "6px" }}>
                                {["7D", "30D", "3M", "1Y"].map((tf) => (
                                    <button
                                        key={tf}
                                        className={`chart-time-btn ${chartTimeframe === tf ? "active" : ""}`}
                                        onClick={() => setChartTimeframe(tf)}
                                        style={{
                                            padding: "6px 10px",
                                            borderRadius: "6px",
                                            border: "1px solid",
                                            borderColor: chartTimeframe === tf ? "var(--primary)" : "var(--border-color)",
                                            fontSize: "12px",
                                            fontWeight: "700",
                                            cursor: "pointer",
                                            backgroundColor: chartTimeframe === tf ? "var(--primary-light)" : "var(--bg-card)",
                                            color: chartTimeframe === tf ? "var(--primary)" : "var(--text-muted)",
                                            transition: "all 0.2s ease"
                                        }}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>

                            {/* Export Button */}
                            <button
                                className="analytics-chart-export-btn"
                                onClick={() => alert(`Exported ${chartMetric} data for ${chartTimeframe} timeframe successfully!`)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    backgroundColor: "var(--bg-card)",
                                    color: "var(--text-main)",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <Download size={14} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartDataSets[chartTimeframe]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e60ff" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#1e60ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                            <YAxis 
                                tickFormatter={(v) => chartMetric === "orders" ? v : `₹${v / 1000}k`} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} 
                            />
                            <Tooltip 
                                formatter={(val) => chartMetric === "orders" ? [val, "Orders"] : chartMetric === "profit" ? [`₹${val.toLocaleString()}`, "Profit"] : [`₹${val.toLocaleString()}`, "Revenue"]} 
                                contentStyle={{ borderRadius: "12px", border: "1px solid var(--border-color)", padding: "10px 14px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey={chartMetric} 
                                stroke="#1e60ff" 
                                strokeWidth={2.5} 
                                fill="url(#analyticsRevGrad)" 
                                isAnimationActive={true}
                                animationDuration={800}
                                activeDot={{ r: 6, fill: "#1e60ff", stroke: "#fff", strokeWidth: 2 }} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Chat */}
                <AIChatPanel />
            </div>

            {/* Bottom: Bar Chart + Pie + Top Products */}
            <div className="analytics-bottom-grid">
                {/* Orders Bar Chart */}
                <div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Monthly Orders</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Order volume per month</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartDataSets["1Y"]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                            <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                            <Bar dataKey="orders" fill="#1e60ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="analytics-chart-card analytics-pie-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Sales by Category</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Category revenue breakdown</p>
                        </div>
                    </div>
                    <div className="analytics-pie-layout">
                        <ResponsiveContainer width="55%" height={200}>
                            <RechartPie>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => [`${val}%`, "Share"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                            </RechartPie>
                        </ResponsiveContainer>
                        <div className="pie-legend-list">
                            {categoryData.map((item, i) => (
                                <div key={item.name} className="pie-legend-item">
                                    <span className="pie-legend-dot" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                                    <span className="pie-legend-name">{item.name}</span>
                                    <span className="pie-legend-val">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="analytics-chart-card analytics-top-products-card" style={{ padding: "20px" }}>
                    <div className="analytics-chart-header" style={{ marginBottom: "14px" }}>
                        <div>
                            <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Top Products</h3>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Best performing catalog lines by revenue</p>
                        </div>
                    </div>
                    <div className="top-products-list-new" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {topProducts.map((p) => (
                            <div key={p.id} className="top-product-row-new" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid var(--border-color)", borderRadius: "12px", transition: "all 0.2s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                                    <div className={`odt-avatar ${p.thumbnailColor}`} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", fontWeight: "700", fontSize: "11px", flexShrink: 0 }}>
                                        {p.initials}
                                    </div>
                                    <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                                        <span className="top-product-name" style={{ fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{p.name}</span>
                                        <span className="dkh-city-badge" style={{ fontSize: "9.5px", padding: "2px 6px", width: "fit-content" }}>{p.category}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                        <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>{p.sales} sold</span>
                                        <span style={{ fontSize: "10px", color: p.stock <= 15 ? "var(--color-danger)" : "var(--text-muted)", fontWeight: p.stock <= 15 ? "700" : "500" }}>{p.stock} left</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", minWidth: "60px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>{p.revenue}</span>
                                        <span className={`analytics-card-change ${p.up ? "change-up" : "change-down"}`} style={{ fontSize: "9.5px", padding: "2px 6px" }}>{p.trend}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Export ─────────────────────────────────────────────── */
function AnalyticsPage() {
    return <AnalyticsDashboard />;
}

export default AnalyticsPage;
