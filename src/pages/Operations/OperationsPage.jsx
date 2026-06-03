import React from "react";
import { Activity, ShieldCheck, Truck, Clock, AlertCircle, RefreshCw } from "lucide-react";
import "./OperationsPage.css";

function OperationsPage() {
    const liveMetrics = [
        { label: "Active Pickers", value: "24", icon: Clock, color: "#2563eb", bg: "#eff6ff" },
        { label: "Bays Occupied", value: "8 / 10", icon: Truck, color: "#10b981", bg: "#ecfdf5" },
        { label: "Safety Rating", value: "99.8%", icon: ShieldCheck, color: "#8b5cf6", bg: "#f5f3ff" },
        { label: "Pending Shipments", value: "14", icon: AlertCircle, color: "#ef4444", bg: "#fef2f2" }
    ];

    const operationLogs = [
        { id: "op-1", action: "Bay 4 Dispatch", detail: "Truck MH-12-QQ-4022 loaded and dispatched.", time: "4 mins ago", status: "Completed" },
        { id: "op-2", action: "Inventory Restock", detail: "Bulk dairy products restocked at Shelf Row B.", time: "18 mins ago", status: "In Progress" },
        { id: "op-3", action: "Barcode Scan Sync", detail: "Handheld scanners updated to system v4.2.1.", time: "45 mins ago", status: "Completed" },
        { id: "op-4", action: "Fulfillment SLA Warning", detail: "Order #T9918 is taking longer than 15 mins to pick.", time: "1 hour ago", status: "Flagged" }
    ];

    return (
        <div className="operations-page fade-in">
            <div className="operations-header-row">
                <div>
                    <h1 className="operations-title">Operations Console</h1>
                    <p className="operations-subtitle">Real-time status updates and execution metrics for active warehouses.</p>
                </div>
                <button className="btn-refresh" onClick={() => alert("Operations metrics updated!")}>
                    <RefreshCw size={14} />
                    <span>Sync Console</span>
                </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="operations-kpi-grid">
                {liveMetrics.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <div key={idx} className="op-kpi-card">
                            <div className="op-kpi-header">
                                <span className="op-kpi-label">{m.label}</span>
                                <div className="op-kpi-icon-wrap" style={{ backgroundColor: m.bg, color: m.color }}>
                                    <Icon size={16} />
                                </div>
                            </div>
                            <span className="op-kpi-value">{m.value}</span>
                        </div>
                    );
                })}
            </div>

            {/* Live Logs */}
            <div className="operations-logs-container">
                <div className="logs-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Activity size={18} style={{ color: "#2563eb" }} />
                        <h2>Real-Time Operations Logs</h2>
                    </div>
                    <span className="live-badge">● LIVE STREAM</span>
                </div>

                <div className="logs-table-wrapper">
                    <table className="logs-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Details</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operationLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="log-action">{log.action}</td>
                                    <td className="log-detail">{log.detail}</td>
                                    <td className="log-time">{log.time}</td>
                                    <td>
                                        <span className={`log-status-badge ${log.status.toLowerCase()}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default OperationsPage;
