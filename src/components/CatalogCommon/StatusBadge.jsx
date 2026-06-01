import React from "react";
import "./CatalogCommon.css";

function StatusBadge({ status }) {
    const getBadgeClass = (s) => {
        const clean = String(s).toLowerCase();
        if (clean === "active" || clean === "in stock" || clean === "operational") {
            return "cat-badge-success";
        }
        if (clean === "inactive" || clean === "out of stock" || clean === "disabled") {
            return "cat-badge-danger";
        }
        if (clean === "low stock" || clean === "draft" || clean === "pending") {
            return "cat-badge-warning";
        }
        return "cat-badge-info";
    };

    return (
        <span className={`cat-status-pill ${getBadgeClass(status)}`}>
            <span className="cat-status-dot"></span>
            <span>{status}</span>
        </span>
    );
}

export default StatusBadge;
