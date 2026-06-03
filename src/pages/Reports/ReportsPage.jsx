import React from "react";
import { Download, BarChart2, Calendar, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import "./ReportsPage.css";

function ReportsPage() {
    const reportCards = [
        { title: "Inventory Turnover Report", desc: "Detailed stock consumption and shelf lifetime ratios.", format: "PDF/CSV", date: "May 2026", size: "1.4 MB" },
        { title: "Darkhouse Fulfillment Summary", desc: "SLA delivery success metrics across urban darkhouses.", format: "PDF", date: "Q2 2026", size: "4.8 MB" },
        { title: "Operator Efficiency Audit", desc: "Picking, packing, and dispatch times sorted by team member.", format: "CSV", date: "June 2026", size: "850 KB" },
        { title: "Weekly Financial Reconciliation", desc: "Invoice status, payment gateway logs, and refunds summary.", format: "PDF/XLSX", date: "Week 22", size: "2.1 MB" }
    ];

    const handleDownload = (title) => {
        alert(`Downloading ${title}...`);
    };

    return (
        <div className="reports-page fade-in">
            <div className="reports-header-row">
                <div>
                    <h1 className="reports-title">Operational Reports</h1>
                    <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                </div>
                <div className="reports-actions">
                    <button className="btn-refresh" onClick={() => alert("Reports synced!")}>
                        <RefreshCw size={14} />
                        <span>Sync Reports</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="reports-stats-grid">
                <div className="reports-stat-card">
                    <span className="stat-label">Scheduled Reports</span>
                    <span className="stat-value">12 / Week</span>
                    <span className="stat-badge green">● Active</span>
                </div>
                <div className="reports-stat-card">
                    <span className="stat-label">Last Generated</span>
                    <span className="stat-value">10 Mins Ago</span>
                    <span className="stat-badge blue">Turnover Summary</span>
                </div>
                <div className="reports-stat-card">
                    <span className="stat-label">System Storage</span>
                    <span className="stat-value">94.2 GB</span>
                    <span className="stat-badge grey">Cloud Vault</span>
                </div>
            </div>

            {/* Reports List */}
            <div className="reports-list-container">
                <div className="list-header">
                    <h2>Available Reports</h2>
                    <span className="reports-count">{reportCards.length} documents found</span>
                </div>
                
                <div className="reports-grid">
                    {reportCards.map((report, idx) => (
                        <div key={idx} className="report-card">
                            <div className="report-card-top">
                                <div className="report-icon-wrapper">
                                    <FileText size={20} className="report-icon" />
                                </div>
                                <div className="report-info">
                                    <h3>{report.title}</h3>
                                    <p>{report.desc}</p>
                                </div>
                            </div>
                            
                            <div className="report-card-footer">
                                <div className="report-meta">
                                    <span className="meta-tag format">{report.format}</span>
                                    <span className="meta-tag date">{report.date}</span>
                                    <span className="meta-tag size">{report.size}</span>
                                </div>
                                <button className="btn-download-report" onClick={() => handleDownload(report.title)}>
                                    <Download size={14} />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ReportsPage;
