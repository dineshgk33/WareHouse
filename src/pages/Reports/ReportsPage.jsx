import React, { useState, useEffect, useCallback } from "react";
import { Download, FileText, RefreshCw, AlertCircle, Loader2, Calendar, HardDrive, Clock } from "lucide-react";
import DataUnavailable from "../../components/common/DataUnavailable";
import "./ReportsPage.css";

/**
 * ReportsPage
 * Fetches reports from the backend API.
 * If no data is returned (or API is not connected), shows DataUnavailable state.
 * Real API integration point: replace the REPORTS_API_URL with the actual endpoint.
 */

const REPORTS_API_URL = import.meta.env.VITE_REPORTS_API_URL || null;

function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchReports = useCallback(async () => {
        // If no API URL configured, immediately show unavailable state
        if (!REPORTS_API_URL) {
            setReports([]);
            setStats(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(REPORTS_API_URL, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status === "success") {
                setReports(data.message?.reports || []);
                setStats(data.message?.stats || null);
            } else {
                setReports([]);
                setStats(null);
            }
        } catch (err) {
            console.error("Failed to fetch reports:", err);
            setError(err.message || "Failed to connect to the reports service.");
            setReports([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSync = async () => {
        setIsSyncing(true);
        await fetchReports();
        setIsSyncing(false);
    };

    const handleDownload = (title) => {
        // TODO: Replace with real download API call
        alert(`Download request sent for: ${title}`);
    };

    // ─── Loading State ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="reports-page fade-in">
                <div className="reports-header-row">
                    <div>
                        <h1 className="reports-title">Operational Reports</h1>
                        <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 320,
                    gap: 16,
                    color: "#6366f1"
                }}>
                    <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                    <p style={{ color: "#64748b", fontSize: 14 }}>Loading reports from database...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    // ─── Error State ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="reports-page fade-in">
                <div className="reports-header-row">
                    <div>
                        <h1 className="reports-title">Operational Reports</h1>
                        <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                    </div>
                    <div className="reports-actions">
                        <button className="btn-refresh" onClick={handleSync} disabled={isSyncing}>
                            <RefreshCw size={14} className={isSyncing ? "spin-icon" : ""} />
                            <span>Retry</span>
                        </button>
                    </div>
                </div>
                <DataUnavailable
                    title="Reports Service Unavailable"
                    description={`Could not connect to the reports database. ${error}`}
                    icon={<AlertCircle size={28} />}
                    onRetry={handleSync}
                />
            </div>
        );
    }

    // ─── No Data State ────────────────────────────────────────────────────────
    if (!loading && reports.length === 0) {
        return (
            <div className="reports-page fade-in">
                <div className="reports-header-row">
                    <div>
                        <h1 className="reports-title">Operational Reports</h1>
                        <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                    </div>
                    <div className="reports-actions">
                        <button className="btn-refresh" onClick={handleSync} disabled={isSyncing}>
                            <RefreshCw size={14} className={isSyncing ? "spin-icon" : ""} />
                            <span>{isSyncing ? "Syncing..." : "Sync Reports"}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="reports-stats-grid">
                    <div className="reports-stat-card reports-stat-unavailable">
                        <Calendar size={16} style={{ color: "#94a3b8", marginBottom: 6 }} />
                        <span className="stat-label">Scheduled Reports</span>
                        <span className="stat-value" style={{ color: "#94a3b8" }}>—</span>
                        <span className="stat-badge grey">No data</span>
                    </div>
                    <div className="reports-stat-card reports-stat-unavailable">
                        <Clock size={16} style={{ color: "#94a3b8", marginBottom: 6 }} />
                        <span className="stat-label">Last Generated</span>
                        <span className="stat-value" style={{ color: "#94a3b8" }}>—</span>
                        <span className="stat-badge grey">No data</span>
                    </div>
                    <div className="reports-stat-card reports-stat-unavailable">
                        <HardDrive size={16} style={{ color: "#94a3b8", marginBottom: 6 }} />
                        <span className="stat-label">System Storage</span>
                        <span className="stat-value" style={{ color: "#94a3b8" }}>—</span>
                        <span className="stat-badge grey">No data</span>
                    </div>
                </div>

                {/* Main unavailable state */}
                <div className="reports-list-container">
                    <div className="list-header">
                        <h2>Available Reports</h2>
                        <span className="reports-count">0 documents found</span>
                    </div>
                    <DataUnavailable
                        title="No Reports in Database"
                        description="The reports module is accessible but no report records have been found in the database. Reports will appear here once they are generated by the system or imported from a data source."
                        onRetry={handleSync}
                    />
                </div>
            </div>
        );
    }

    // ─── Data Loaded ──────────────────────────────────────────────────────────
    return (
        <div className="reports-page fade-in">
            <div className="reports-header-row">
                <div>
                    <h1 className="reports-title">Operational Reports</h1>
                    <p className="reports-subtitle">Access real-time reports and audit logs generated across WMS hubs.</p>
                </div>
                <div className="reports-actions">
                    <button className="btn-refresh" onClick={handleSync} disabled={isSyncing}>
                        <RefreshCw size={14} className={isSyncing ? "spin-icon" : ""} />
                        <span>{isSyncing ? "Syncing..." : "Sync Reports"}</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            {stats && (
                <div className="reports-stats-grid">
                    <div className="reports-stat-card">
                        <span className="stat-label">Scheduled Reports</span>
                        <span className="stat-value">{stats.scheduled || "—"}</span>
                        <span className="stat-badge green">● Active</span>
                    </div>
                    <div className="reports-stat-card">
                        <span className="stat-label">Last Generated</span>
                        <span className="stat-value">{stats.lastGenerated || "—"}</span>
                        <span className="stat-badge blue">{stats.lastGeneratedLabel || ""}</span>
                    </div>
                    <div className="reports-stat-card">
                        <span className="stat-label">System Storage</span>
                        <span className="stat-value">{stats.storage || "—"}</span>
                        <span className="stat-badge grey">Cloud Vault</span>
                    </div>
                </div>
            )}

            {/* Reports List */}
            <div className="reports-list-container">
                <div className="list-header">
                    <h2>Available Reports</h2>
                    <span className="reports-count">{reports.length} document{reports.length !== 1 ? "s" : ""} found</span>
                </div>

                <div className="reports-grid">
                    {reports.map((report, idx) => (
                        <div key={report.id || idx} className="report-card">
                            <div className="report-card-top">
                                <div className="report-icon-wrapper">
                                    <FileText size={20} className="report-icon" />
                                </div>
                                <div className="report-info">
                                    <h3>{report.title}</h3>
                                    <p>{report.description || report.desc}</p>
                                </div>
                            </div>

                            <div className="report-card-footer">
                                <div className="report-meta">
                                    {report.format && <span className="meta-tag format">{report.format}</span>}
                                    {report.date && <span className="meta-tag date">{report.date}</span>}
                                    {report.size && <span className="meta-tag size">{report.size}</span>}
                                </div>
                                <button
                                    className="btn-download-report"
                                    onClick={() => handleDownload(report.title)}
                                >
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
