import React, { useState } from "react";
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
    ChevronDown
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
const revenueData = [
    { month: "Jan", revenue: 42000, orders: 320 },
    { month: "Feb", revenue: 55000, orders: 410 },
    { month: "Mar", revenue: 47000, orders: 380 },
    { month: "Apr", revenue: 63000, orders: 490 },
    { month: "May", revenue: 78000, orders: 612 },
    { month: "Jun", revenue: 91000, orders: 710 },
    { month: "Jul", revenue: 108000, orders: 842 },
];

const categoryData = [
    { name: "Electronics", value: 38 },
    { name: "Fashion", value: 24 },
    { name: "Home", value: 18 },
    { name: "Groceries", value: 12 },
    { name: "Sports", value: 8 },
];

const PIE_COLORS = ["#1e60ff", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];

const topProducts = [
    { name: "iPhone 15 Pro", sales: 412, revenue: "₹206,000", trend: "+18%" },
    { name: "MacBook Air M3", sales: 287, revenue: "₹143,500", trend: "+12%" },
    { name: "Sony WH-1000XM5", sales: 341, revenue: "₹85,250", trend: "+24%" },
    { name: "Samsung Galaxy S24", sales: 298, revenue: "₹74,500", trend: "+9%" },
    { name: "Nike Air Max 270", sales: 512, revenue: "₹61,440", trend: "+31%" },
];

const summaryCards = [
    { label: "Total Revenue", value: "₹108,000", change: "+18.4%", up: true, icon: TrendingUp },
    { label: "Conversion Rate", value: "3.82%", change: "+0.6%", up: true, icon: Activity },
    { label: "Avg Order Value", value: "₹128.30", change: "-2.1%", up: false, icon: BarChart3 },
    { label: "Return Rate", value: "2.4%", change: "-0.8%", up: true, icon: PieChart },
];

/* ─── AI Chat Component ───────────────────────────────────────── */
function AIChatPanel() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hello! I'm your Haatza AI Analytics assistant powered by Google Gemini. Ask me anything about your store performance, trends, or recommendations."
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

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
            setError("API key not configured. Add VITE_GEMINI_API_KEY to your .env file and restart the server.");
            setLoading(false);
            return;
        }

        try {
            const contextPrompt = `You are an AI analytics assistant for Haatza, an Indian ecommerce admin dashboard. 
The store data context: Total Revenue ₹108,000 (July 2025), 1,742 orders, 1,182 customers, 23 low-stock items.
Top categories: Electronics 38%, Fashion 24%, Home 18%, Groceries 12%, Sports 8%.
Revenue grew from ₹42k (Jan) to ₹108k (Jul). Conversion rate: 3.82%.
Answer in 2-4 short sentences. Be concise and actionable.

User question: ${userMsg}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: contextPrompt }] }]
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err?.error?.message || "API request failed");
            }

            const data = await response.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            setMessages(prev => [...prev, { role: "assistant", text: aiText }]);
        } catch (err) {
            setError(err.message || "Failed to get response. Check your API key.");
        } finally {
            setLoading(false);
        }
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
                    <p>Powered by Google Gemini</p>
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

            <div className="ai-suggestions">
                {["Top selling products?", "Revenue forecast for next month?", "Which category needs attention?"].map((s) => (
                    <button
                        key={s}
                        className="ai-suggestion-chip"
                        onClick={() => { setInput(s); }}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Analytics Dashboard ─────────────────────────────────── */
function AnalyticsDashboard() {
    const [period, setPeriod] = useState("Last 7 months");
    const [customStart, setCustomStart] = useState("2026-01-01");
    const [customEnd, setCustomEnd] = useState("2026-06-01");
    const [customApplied, setCustomApplied] = useState(false);

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
- Revenue: ₹108,000 (July 2025)
- Conversion Rate: 3.82%
- Avg Order Value: ₹128.30
- Return Rate: 2.4%

Perform a concise SWOT and actionable recommendation review.
You MUST format your output exactly as follows:
### OUTSTANDING ACHIEVEMENTS
- Write 3 high-impact success bullets based on these strong metrics.
### AREAS OF ATTENTION
- Write 2 warnings about items needing prompt action (such as return rate or average order value improvements).
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
                        <div className="analytics-summary-card" key={card.label}>
                            <div className="analytics-card-icon-wrap">
                                <Icon size={18} />
                            </div>
                            <div className="analytics-card-body">
                                <span className="analytics-card-label">{card.label}</span>
                                <span className="analytics-card-value">{card.value}</span>
                            </div>
                            <span className={`analytics-card-change ${card.up ? "change-up" : "change-down"}`}>
                                {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {card.change}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* AI Store Insights SWOT Widget */}
            <div className="ai-insights-card">
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

            {/* Middle: Revenue Chart + AI Chat */}
            <div className="analytics-middle-grid">
                {/* Revenue Over Time */}
                <div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h3>Revenue Over Time</h3>
                            <p>Monthly revenue vs order volume</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e60ff" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#1e60ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                            <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                            <Tooltip formatter={(val, name) => [name === "revenue" ? `₹${val.toLocaleString()}` : val, name === "revenue" ? "Revenue" : "Orders"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                            <Area type="monotone" dataKey="revenue" stroke="#1e60ff" strokeWidth={2} fill="url(#analyticsRevGrad)" activeDot={{ r: 5, fill: "#1e60ff", stroke: "#fff", strokeWidth: 2 }} />
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
                            <h3>Monthly Orders</h3>
                            <p>Order volume per month</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
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
                            <h3>Sales by Category</h3>
                            <p>Category revenue breakdown</p>
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
                <div className="analytics-chart-card analytics-top-products-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h3>Top Products</h3>
                            <p>Best performing by revenue</p>
                        </div>
                    </div>
                    <div className="top-products-list">
                        {topProducts.map((p, i) => (
                            <div key={p.name} className="top-product-row">
                                <span className="top-product-rank">{i + 1}</span>
                                <div className="top-product-info">
                                    <span className="top-product-name">{p.name}</span>
                                    <span className="top-product-sales">{p.sales} sold</span>
                                </div>
                                <div className="top-product-right">
                                    <span className="top-product-revenue">{p.revenue}</span>
                                    <span className="top-product-trend">{p.trend}</span>
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
