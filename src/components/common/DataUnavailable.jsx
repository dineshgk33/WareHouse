import React from "react";
import { DatabaseZap, RefreshCw, ServerCrash } from "lucide-react";

/**
 * DataUnavailable
 * Shown when a page or section cannot load data from the database.
 * Replaces mock/hardcoded data with a clear, premium empty state.
 *
 * Props:
 *  - title       : string  — main heading (default: "No Data Available")
 *  - description : string  — sub-message (default: generic)
 *  - icon        : element — optional custom icon
 *  - onRetry     : func    — if provided, a "Retry" button is shown
 *  - compact     : bool    — smaller variant for inline sections
 */
function DataUnavailable({
    title = "No Data Available",
    description = "The database has not returned any data for this section. This may be because the data source is not connected or the requested records do not exist.",
    icon,
    onRetry,
    compact = false,
}) {
    return (
        <div
            className={`data-unavailable-root ${compact ? "data-unavailable-compact" : ""}`}
            role="status"
            aria-label="Data not available"
        >
            <style>{`
                .data-unavailable-root {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 320px;
                    padding: 48px 32px;
                    text-align: center;
                    background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
                    border: 1.5px dashed #c7d2fe;
                    border-radius: 16px;
                    gap: 16px;
                    animation: duFadeIn 0.35s ease;
                }
                .data-unavailable-compact {
                    min-height: 200px;
                    padding: 32px 24px;
                    border-radius: 12px;
                }
                @keyframes duFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .data-unavailable-icon-wrap {
                    width: 64px;
                    height: 64px;
                    border-radius: 18px;
                    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
                }
                .data-unavailable-compact .data-unavailable-icon-wrap {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                }
                .data-unavailable-icon-wrap svg {
                    color: #6366f1;
                }
                .data-unavailable-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    letter-spacing: -0.2px;
                }
                .data-unavailable-compact .data-unavailable-title {
                    font-size: 15px;
                }
                .data-unavailable-desc {
                    font-size: 14px;
                    color: #64748b;
                    margin: 0;
                    max-width: 400px;
                    line-height: 1.6;
                }
                .data-unavailable-compact .data-unavailable-desc {
                    font-size: 13px;
                    max-width: 320px;
                }
                .data-unavailable-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 12px;
                    background: #ede9fe;
                    color: #7c3aed;
                    border-radius: 9999px;
                    font-size: 11.5px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                .data-unavailable-badge-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #a78bfa;
                }
                .data-unavailable-retry-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 9px 20px;
                    background: #6366f1;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.15s;
                }
                .data-unavailable-retry-btn:hover {
                    background: #4f46e5;
                    transform: translateY(-1px);
                }
                .data-unavailable-retry-btn:active {
                    transform: translateY(0);
                }
            `}</style>

            {/* Icon */}
            <div className="data-unavailable-icon-wrap">
                {icon || <DatabaseZap size={compact ? 22 : 28} />}
            </div>

            {/* Status badge */}
            <span className="data-unavailable-badge">
                <span className="data-unavailable-badge-dot" />
                Not connected to database
            </span>

            {/* Text */}
            <h3 className="data-unavailable-title">{title}</h3>
            <p className="data-unavailable-desc">{description}</p>

            {/* Optional retry */}
            {onRetry && (
                <button className="data-unavailable-retry-btn" onClick={onRetry}>
                    <RefreshCw size={13} />
                    Retry
                </button>
            )}
        </div>
    );
}

export default DataUnavailable;
