import React from "react";
import "./CatalogCommon.css";

function EmptyState({ icon: Icon, message = "No matching catalog elements found" }) {
    return (
        <div className="cat-empty-state">
            {Icon && <Icon size={40} className="cat-empty-icon" />}
            <span className="cat-empty-text">{message}</span>
        </div>
    );
}

export default EmptyState;
