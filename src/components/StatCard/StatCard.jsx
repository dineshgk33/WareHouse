import React, { useState } from "react";
import { ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "./StatCard.css";

function StatCard({ title, value, icon: Icon, trend, trendType = "success", defaultPeriod = "Last 30 days" }) {
    const isNegative = trendType === "danger";
    const [period, setPeriod] = useState(defaultPeriod);
    
    // Custom date states for inline card picker
    const [customStart, setCustomStart] = useState("2026-05-25");
    const [customEnd, setCustomEnd] = useState("2026-06-01");
    const [customApplied, setCustomApplied] = useState(false);
    
    // Simulate dynamic data updates when period changes for high-fidelity interactive experience
    const getDynamicValue = () => {
        const numericStr = value.replace(/[^0-9.]/g, "");
        const num = parseFloat(numericStr);
        if (isNaN(num)) return value;
        
        let multiplier = 1;
        if (period === "Last 7 days") multiplier = 0.23;
        else if (period === "Last 12 months") multiplier = 11.4;
        else if (period === "Today") multiplier = 0.035;
        else if (period === "Custom Range") multiplier = 0.65;
        
        const finalVal = Math.round(num * multiplier);
        const hasDollar = value.startsWith("$");
        const hasRupee = value.startsWith("₹");
        const formatted = finalVal.toLocaleString("en-IN");
        
        if (hasRupee) return `₹${formatted}`;
        return hasDollar ? `$${formatted}` : formatted;
    };
    
    const getDynamicTrend = () => {
        const numTrend = parseFloat(trend.replace(/[^0-9.]/g, ""));
        if (isNaN(numTrend)) return trend;
        
        let multiplier = 1;
        if (period === "Last 7 days") multiplier = 0.8;
        else if (period === "Last 12 months") multiplier = 2.4;
        else if (period === "Today") multiplier = 0.15;
        else if (period === "Custom Range") multiplier = 0.72;
        
        const finalTrend = (numTrend * multiplier).toFixed(2);
        return `+${finalTrend}%`;
    };

    const dynamicValue = getDynamicValue();
    const dynamicTrend = getDynamicTrend();

    return (
        <div className="stat-card">
            {/* Top row: Title and Icon */}
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                <div className="stat-card-icon-wrapper">
                    <Icon size={18} className="stat-card-icon" />
                </div>
            </div>

            {/* Middle row: Numeric value */}
            <div className="stat-card-body">
                <span className="stat-card-value">{dynamicValue}</span>
            </div>

            {/* Bottom row: Trend badge and period selector dropdown */}
            <div className="stat-card-footer">
                <div className={`trend-badge ${isNegative ? "trend-negative" : "trend-positive"}`}>
                    <span className="trend-text">{dynamicTrend}</span>
                    {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                </div>
                
                <div className="period-dropdown-container">
                    <select 
                        value={period} 
                        onChange={(e) => {
                            setPeriod(e.target.value);
                            if (e.target.value !== "Custom Range") {
                                setCustomApplied(false);
                            }
                        }} 
                        className="period-select"
                        aria-label="Filter timeframe"
                    >
                        <option value="Last 30 days">Last 30 days</option>
                        <option value="Last 7 days">Last 7 days</option>
                        <option value="Last 12 months">Last 12 months</option>
                        <option value="Today">Today</option>
                        <option value="Custom Range">Custom Range</option>
                    </select>
                    <ChevronDown size={11} className="period-arrow-icon" />
                </div>
            </div>

            {/* Custom Date Range Picker Widget directly inside Card */}
            {period === "Custom Range" && (
                <div className="stat-card-custom-date fade-in" style={{ marginTop: "12px", borderTop: "1px dashed var(--border-color)", paddingTop: "10px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                            <label style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }} htmlFor={`stat-start-${title.replace(/\s+/g, '-')}`}>From</label>
                            <input 
                                id={`stat-start-${title.replace(/\s+/g, '-')}`}
                                type="date" 
                                value={customStart} 
                                onChange={(e) => setCustomStart(e.target.value)} 
                                style={{ padding: "5px", fontSize: "10px", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", width: "100%", fontFamily: "var(--font-sans)", color: "var(--text-main)", backgroundColor: "var(--bg-card)" }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                            <label style={{ fontSize: "9px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "3px" }} htmlFor={`stat-end-${title.replace(/\s+/g, '-')}`}>To</label>
                            <input 
                                id={`stat-end-${title.replace(/\s+/g, '-')}`}
                                type="date" 
                                value={customEnd} 
                                onChange={(e) => setCustomEnd(e.target.value)} 
                                style={{ padding: "5px", fontSize: "10px", border: "1px solid var(--border-color)", borderRadius: "4px", outline: "none", width: "100%", fontFamily: "var(--font-sans)", color: "var(--text-main)", backgroundColor: "var(--bg-card)" }}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button 
                            onClick={() => setCustomApplied(true)} 
                            style={{ backgroundColor: "var(--primary)", color: "#fff", border: "none", padding: "5px 10px", fontSize: "10px", fontWeight: "700", borderRadius: "3px", cursor: "pointer", transition: "background-color var(--transition-fast)" }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "var(--primary-hover)"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "var(--primary)"}
                        >
                            Apply
                        </button>
                        {customApplied && (
                            <span style={{ fontSize: "10px", color: "var(--color-success)", fontWeight: "600" }}>
                                ✓ Applied
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatCard;
