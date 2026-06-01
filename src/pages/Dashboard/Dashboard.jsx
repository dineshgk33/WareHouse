import React, { useState } from "react";
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
    Mail
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
import StatCard from "../../components/StatCard/StatCard";
import "./Dashboard.css";
import phoneImg from "../../assets/phone.png";
import keyboardImg from "../../assets/keyboard.png";

// Dynamic chart datasets based on selected time period
const chartDataSets = {
    "Last 7 days": [
        { name: "Jul 01", 2024: 70000, 2025: 90000 },
        { name: "Jul 02", 2024: 40000, 2025: 100000 },
        { name: "Jul 03", 2024: 90000, 2025: 50000 },
        { name: "Jul 04", 2024: 75000, 2025: 75000 },
        { name: "Jul 05", 2024: 45000, 2025: 93000 },
        { name: "Jul 06", 2024: 100000, 2025: 45000 },
        { name: "Jul 07", 2024: 60000, 2025: 105000 }
    ],
    "Last 30 days": [
        { name: "Week 1", 2024: 280000, 2025: 360000 },
        { name: "Week 2", 2024: 180000, 2025: 410000 },
        { name: "Week 3", 2024: 310000, 2025: 290000 },
        { name: "Week 4", 2024: 290000, 2025: 430000 }
    ],
    "Last 3 months": [
        { name: "May", 2024: 1100000, 2025: 1400000 },
        { name: "Jun", 2024: 900000, 2025: 1580000 },
        { name: "Jul", 2024: 1350000, 2025: 1250000 }
    ]
};

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
        status: "Delivered",
        hoursAgo: 96
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
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const val = payload.find(p => p.dataKey === 2025)?.value || 0;
        return (
            <div className="custom-chart-tooltip">
                <span className="tooltip-value">~₹{val.toLocaleString()}</span>
                <span className="tooltip-label">Sales</span>
            </div>
        );
    }
    return null;
};

function Dashboard() {
    const [chartPeriod, setChartPeriod] = useState("Last 7 days");
    const [tablePeriod, setTablePeriod] = useState("Last 7 days");

    // Custom date states for Sales Chart
    const [customChartStart, setCustomChartStart] = useState("2026-05-25");
    const [customChartEnd, setCustomChartEnd] = useState("2026-06-01");
    const [customChartApplied, setCustomChartApplied] = useState(false);

    // Custom date states for Latest Orders Table
    const [customTableStart, setCustomTableStart] = useState("2026-05-25");
    const [customTableEnd, setCustomTableEnd] = useState("2026-06-01");
    const [customTableApplied, setCustomTableApplied] = useState(false);

    const [ordersList, setOrdersList] = useState(allOrders);
    const [activeOrderDropdownId, setActiveOrderDropdownId] = useState(null);
    const [activeActivityDropdownOpen, setActiveActivityDropdownOpen] = useState(false);

    const [activities, setActivities] = useState([
        { id: "act-1", title: "Order Completed", desc: "Order #R823T809 has been successfully completed.", time: "2 minutes ago", icon: Check, bgClass: "bg-success", iconClass: "icon-success" },
        { id: "act-2", title: "New User Registration", desc: "Emelia Charles registered as a new user for haatza.", time: "12 minutes ago", icon: UserPlus, bgClass: "bg-warning", iconClass: "icon-warning" },
        { id: "act-3", title: "Payment Received", desc: "Payment of ₹1299.99 received from David Walker.", time: "13 minutes ago", icon: CreditCard, bgClass: "bg-info", iconClass: "icon-info" },
        { id: "act-4", title: "Refund Requested", desc: "Refund request of ₹120.00 submitted for Order #R92839.", time: "15 minutes ago", icon: RotateCcw, bgClass: "bg-danger", iconClass: "icon-danger" }
    ]);

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
            { id: "act-1", title: "Order Completed", desc: "Order #R823T809 has been successfully completed.", time: "2 minutes ago", icon: Check, bgClass: "bg-success", iconClass: "icon-success" },
            { id: "act-2", title: "New User Registration", desc: "Emelia Charles registered as a new user for haatza.", time: "12 minutes ago", icon: UserPlus, bgClass: "bg-warning", iconClass: "icon-warning" },
            { id: "act-3", title: "Payment Received", desc: "Payment of ₹1299.99 received from David Walker.", time: "13 minutes ago", icon: CreditCard, bgClass: "bg-info", iconClass: "icon-info" },
            { id: "act-4", title: "Refund Requested", desc: "Refund request of ₹120.00 submitted for Order #R92839.", time: "15 minutes ago", icon: RotateCcw, bgClass: "bg-danger", iconClass: "icon-danger" }
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
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
            setAiError("API key not configured. Add your key to VITE_GEMINI_API_KEY in the .env file and restart the dev server.");
            return;
        }

        setAiLoading(true);
        setAiError(null);

        try {
            const prompt = `You are a high-level eCommerce business SWOT auditor for the Haatza dashboard.
Review the following store stats:
- Revenue: ₹108,000
- Total Orders: 1,742
- New Customers: 1,182
- Low Stock Items Alert Count: 23

Perform a concise SWOT and actionable recommendation review.
You MUST format your output exactly as follows:
### OUTSTANDING ACHIEVEMENTS
- Write 3 high-impact success bullets based on these strong metrics.
### AREAS OF ATTENTION
- Write 2 warnings about items needing prompt action (such as the 23 low-stock items or refund mitigation).
### STRATEGIC ACTION ITEMS
- Write 2 high-leverage growth actions that can boost Average Order Value (AOV) or conversions.

Be concise. Keep it under 200 words total. Bold crucial words. Keep it professional.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData?.error?.message || "Failed to connect to Google AI. Check if your API key is valid.";
                throw new Error(`Google AI: ${errMsg}`);
            }

            const data = await response.json();
            const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights returned.";

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
    };

    // Parser helper for Gemini SWOT markdown output to premium custom HTML blocks
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


    // Filter table rows based on selected period
    const getFilteredOrders = () => {
        if (tablePeriod === "Last 24 hours") {
            return ordersList.filter(order => order.hoursAgo <= 24);
        }
        if (tablePeriod === "Last 7 days") {
            return ordersList.filter(order => order.hoursAgo <= 48);
        }
        return ordersList; // Last 30 days
    };

    const filteredOrders = getFilteredOrders();
    const activeChartData = chartDataSets[chartPeriod] || chartDataSets["Last 7 days"];

    // Dynamic chart parameters depending on scale chosen
    const getYAxisDomainAndTicks = () => {
        if (chartPeriod === "Last 3 months") {
            return {
                domain: [500000, 2000000],
                ticks: [500000, 1000000, 1500000, 2000000],
                formatter: (val) => `${val / 1000000}M`
            };
        }
        if (chartPeriod === "Last 30 days") {
            return {
                domain: [100000, 500000],
                ticks: [100000, 200000, 300000, 400000, 500000],
                formatter: (val) => `${val / 1000}k`
            };
        }
        return {
            domain: [20000, 120000],
            ticks: [20000, 40000, 60000, 80000, 100000, 120000],
            formatter: (val) => `${val / 1000}k`
        };
    };

    const yAxisConfig = getYAxisDomainAndTicks();

    return (
        <div className="dashboard-view fade-in">
            {/* 1. Stat Cards Row */}
            <div className="dashboard-stats-grid">
                <StatCard 
                    title="Total Orders"
                    value="1742"
                    icon={ShoppingCart}
                    trend="+12.5%"
                    trendType="success"
                />
                <StatCard 
                    title="Revenue"
                    value="₹108,000"
                    icon={IndianRupee}
                    trend="+8.23%"
                    trendType="success"
                />
                <StatCard 
                    title="New Customers"
                    value="1182"
                    icon={Users}
                    trend="+15.21%"
                    trendType="success"
                />
                <StatCard 
                    title="Low Stock Items"
                    value="23"
                    icon={AlertTriangle}
                    trend="+5.22%"
                    trendType="danger"
                />
            </div>

            {/* AI Insights Widget */}
            <div className="dashboard-card ai-insights-card">
                <div className="card-header">
                    <div className="card-title-block">
                        <h2>AI Store Insights</h2>
                        <p>Analyse your store performance with Google Gemini</p>
                    </div>
                    <button
                        onClick={runAiAnalysis}
                        disabled={aiLoading}
                        className="ai-analyse-btn"
                    >
                        {aiLoading ? (
                            <><Loader2 size={14} className="ai-spinner" /> Analysing...</>
                        ) : (
                            <><Sparkles size={14} /> Analyse Data</>
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
                        <p>Gemini is analysing your store metrics…</p>
                    </div>
                )}

                {/* Analysis result */}
                {!aiLoading && selectedAnalysis && (
                    <div className="ai-result-section fade-in">
                        <div className="ai-result-meta">
                            <span className="ai-report-badge">Gemini AI Report</span>
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
                        <p>Click <strong>Analyse Data</strong> to generate an AI-powered analysis of your store metrics.</p>
                    </div>
                )}

                {/* Previous analyses history */}
                {analyses.length > 1 && (
                    <div className="ai-history-section">
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

            {/* 2. Middle Section: Chart & Activity Feed */}
            <div className="dashboard-middle-section">
                {/* Sales Over Time Chart */}
                <div className="chart-card dashboard-card">
                    <div className="card-header">
                        <div className="card-title-block">
                            <h2>Sales Over Time</h2>
                            <p>Revenue comparison with previous period</p>
                        </div>
                        <div className="dropdown-button-container">
                            <select 
                                value={chartPeriod} 
                                onChange={(e) => {
                                    setChartPeriod(e.target.value);
                                    if (e.target.value !== "Custom Range") {
                                        setCustomChartApplied(false);
                                    }
                                }} 
                                className="dropdown-select"
                                aria-label="Select sales timeframe"
                            >
                                <option value="Last 7 days">Last 7 days</option>
                                <option value="Last 30 days">Last 30 days</option>
                                <option value="Last 3 months">Last 3 months</option>
                                <option value="Custom Range">Custom Range</option>
                            </select>
                            <ChevronDown size={13} className="dropdown-select-arrow" />
                        </div>
                    </div>

                    {chartPeriod === "Custom Range" && (
                        <div className="custom-date-range-bar fade-in" style={{ margin: "0 24px 16px 24px" }}>
                            <div className="date-input-group">
                                <label htmlFor="chart-start-date">From</label>
                                <input
                                    id="chart-start-date"
                                    type="date"
                                    className="custom-date-input"
                                    value={customChartStart}
                                    onChange={(e) => setCustomChartStart(e.target.value)}
                                />
                            </div>
                            <div className="date-input-group">
                                <label htmlFor="chart-end-date">To</label>
                                <input
                                    id="chart-end-date"
                                    type="date"
                                    className="custom-date-input"
                                    value={customChartEnd}
                                    onChange={(e) => setCustomChartEnd(e.target.value)}
                                />
                            </div>
                            <button
                                className="btn-apply-date"
                                onClick={() => setCustomChartApplied(true)}
                            >
                                Apply Range
                            </button>
                            {customChartApplied && (
                                <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginLeft: "8px" }}>
                                    ✓ Range Applied
                                </span>
                            )}
                        </div>
                    )}

                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart
                                data={activeChartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="color2025" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e60ff" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#1e60ff" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                                />
                                <YAxis 
                                    tickFormatter={yAxisConfig.formatter}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                                    domain={yAxisConfig.domain}
                                    ticks={yAxisConfig.ticks}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1e60ff", strokeWidth: 1, strokeDasharray: "4 4" }} />
                                <Area
                                    type="monotone"
                                    dataKey={2024}
                                    stroke="#eab308"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#color2024)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey={2025}
                                    stroke="#1e60ff"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#color2025)"
                                    activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2, fill: "#1e60ff" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Legend */}
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-dot dot-2024"></span>
                            <span className="legend-text">2024</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot dot-2025"></span>
                            <span className="legend-text">2025</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="activity-card dashboard-card">
                    <div className="card-header" style={{ position: "relative" }}>
                        <h2>Recent Activity</h2>
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
                                    <div className="activity-item" key={act.id}>
                                        <div className={`activity-icon-container ${act.bgClass}`}>
                                            <Icon size={14} className={act.iconClass} />
                                        </div>
                                        <div className="activity-content">
                                            <div className="activity-header">
                                                <h3>{act.title}</h3>
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
                    <div className="card-header">
                        <div className="card-title-block">
                            <h2>Latest Orders</h2>
                            <p>Recent customer orders and their status</p>
                        </div>
                        <div className="dropdown-button-container">
                            <select 
                                value={tablePeriod} 
                                onChange={(e) => {
                                    setTablePeriod(e.target.value);
                                    if (e.target.value !== "Custom Range") {
                                        setCustomTableApplied(false);
                                    }
                                }} 
                                className="dropdown-select"
                                aria-label="Select orders timeframe"
                            >
                                <option value="Last 7 days">Last 7 days</option>
                                <option value="Last 30 days">Last 30 days</option>
                                <option value="Last 24 hours">Last 24 hours</option>
                                <option value="Custom Range">Custom Range</option>
                            </select>
                            <ChevronDown size={13} className="dropdown-select-arrow" />
                        </div>
                    </div>

                    {tablePeriod === "Custom Range" && (
                        <div className="custom-date-range-bar fade-in" style={{ margin: "0 24px 16px 24px" }}>
                            <div className="date-input-group">
                                <label htmlFor="table-start-date">From</label>
                                <input
                                    id="table-start-date"
                                    type="date"
                                    className="custom-date-input"
                                    value={customTableStart}
                                    onChange={(e) => setCustomTableStart(e.target.value)}
                                />
                            </div>
                            <div className="date-input-group">
                                <label htmlFor="table-end-date">To</label>
                                <input
                                    id="table-end-date"
                                    type="date"
                                    className="custom-date-input"
                                    value={customTableEnd}
                                    onChange={(e) => setCustomTableEnd(e.target.value)}
                                />
                            </div>
                            <button
                                className="btn-apply-date"
                                onClick={() => setCustomTableApplied(true)}
                            >
                                Apply Range
                            </button>
                            {customTableApplied && (
                                <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginLeft: "8px" }}>
                                    ✓ Range Applied
                                </span>
                            )}
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Product</th>
                                    <th>
                                        <div className="table-header-sort">
                                            <span>Customer</span>
                                            <ArrowUpDown size={12} />
                                        </div>
                                    </th>
                                    <th>
                                        <div className="table-header-sort">
                                            <span>Date</span>
                                            <ArrowUpDown size={12} />
                                        </div>
                                    </th>
                                    <th>Amount</th>
                                    <th>Payment Mode</th>
                                    <th>
                                        <div className="table-header-sort">
                                            <span>Status</span>
                                            <ArrowUpDown size={12} />
                                        </div>
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
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
                                        <td className="customer-name">{order.customer}</td>
                                        <td className="order-date">{order.date}</td>
                                        <td className="order-amount">{order.amount}</td>
                                        <td className="payment-mode">{order.payment}</td>
                                        <td>
                                            <span className="status-pill status-delivered">{order.status}</span>
                                        </td>
                                        <td style={{ position: "relative" }}>
                                            <button 
                                                className="table-action-btn"
                                                onClick={() => toggleOrderDropdown(order.id)}
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {activeOrderDropdownId === order.id && (
                                                <>
                                                    <div className="global-dropdown-overlay" onClick={() => setActiveOrderDropdownId(null)} />
                                                    <div className="global-action-dropdown">
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