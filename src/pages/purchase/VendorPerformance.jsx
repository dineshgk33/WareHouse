import React, { useState, useEffect } from "react";
import { 
    getVendors, 
    getVendorScorecard,
    getPurchaseOrders
} from "../../services/purchaseService";
import { 
    Star, 
    TrendingUp, 
    AlertTriangle, 
    Clock, 
    BarChart3,
    ArrowUpRight,
    Award
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    LineChart,
    Line
} from "recharts";
import "./PurchaseStyles.css";

function VendorPerformance() {
    const [vendors, setVendors] = useState([]);
    const [scorecards, setScorecards] = useState({});
    const [poCostTrends, setPoCostTrends] = useState([]);

    const loadData = () => {
        const vendorList = getVendors();
        setVendors(vendorList);

        const cards = {};
        vendorList.forEach(v => {
            cards[v.vendorCode] = getVendorScorecard(v.vendorCode);
        });
        setScorecards(cards);

        // Build PO Cost trends
        const pos = getPurchaseOrders();
        const costData = pos
            .filter(p => p.status !== "Cancelled" && p.status !== "Draft")
            .map(p => ({
                name: p.poNumber,
                cost: p.totalCost,
                vendor: p.vendorName
            }))
            .reverse();
        setPoCostTrends(costData);
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            loadData();
        });
    }, []);

    // Prepare chart data for fill rates
    const chartData = vendors.map(v => {
        const card = scorecards[v.vendorCode] || {};
        return {
            name: v.vendorName.substring(0, 15),
            "Fill Rate (%)": card.fillRate || 95,
            "On-Time (%)": card.onTimeDelivery || 90,
            "Damage Rate (%)": card.damageRate || 0.8
        };
    });

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Vendor Performance Analytics</h1>
                    <p className="purchase-header-subtitle">
                        Inspect OTIF fill rates, contract price variances, damage metrics, and vendor ranking tables.
                    </p>
                </div>
            </div>

            {/* Top Cards grid for KPI overview */}
            <div className="purchase-grid-4">
                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon primary">
                        <Award size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">A+</span>
                        <span className="purchase-stat-label">Top Ranked Vendor</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon success">
                        <TrendingUp size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">96.8%</span>
                        <span className="purchase-stat-label">Average Fill Rate</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon warning">
                        <Clock size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">1.4 Days</span>
                        <span className="purchase-stat-label">Average Lead Time</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon danger">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">0.7%</span>
                        <span className="purchase-stat-label">Average Damage %</span>
                    </div>
                </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="purchase-detail-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
                <div className="purchase-card">
                    <h3 className="purchase-detail-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <BarChart3 size={18} className="text-primary" />
                        <span>Vendor Service Levels comparison (OTIF)</span>
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="Fill Rate (%)" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="On-Time (%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="purchase-card">
                    <h3 className="purchase-detail-title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                        <TrendingUp size={18} className="text-success" />
                        <span>Purchase Value cost trends</span>
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={poCostTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="cost" name="Order Cost (₹)" stroke="var(--color-success)" strokeWidth={2} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Vendor ranking leader board */}
            <div className="purchase-card">
                <h3 className="purchase-detail-title" style={{ marginBottom: "16px" }}>Vendor Leader Board Ranking</h3>
                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>Vendor Code</th>
                                <th>Vendor Name</th>
                                <th>Ranking Grade</th>
                                <th>OTIF Fill Rate</th>
                                <th>On-Time Ratio</th>
                                <th>Damage Rate</th>
                                <th>QA Rejections</th>
                                <th>Lead Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => {
                                const card = scorecards[v.vendorCode] || {};
                                return (
                                    <tr key={v.vendorCode}>
                                        <td className="font-mono font-bold">{v.vendorCode}</td>
                                        <td style={{ fontWeight: 600 }}>{v.vendorName}</td>
                                        <td>
                                            <span className={`purchase-badge ${card.ranking === "A+" || card.ranking === "A" ? "approved" : card.ranking === "B" ? "intransit" : "rejected"}`}>
                                                {card.ranking || "A+"}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{card.fillRate || 95}%</td>
                                        <td>{card.onTimeDelivery || 90}%</td>
                                        <td style={{ color: "var(--color-danger)" }}>{card.damageRate || 0.8}%</td>
                                        <td style={{ color: "var(--color-danger)" }}>{card.rejectionRate || 0.5}%</td>
                                        <td>{card.avgLeadTime || 1.2} Days</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default VendorPerformance;
