import React from "react";
import "./CatalogCommon.css";

function PageHeader({ title, description, primaryAction, secondaryAction }) {
    return (
        <div className="cat-header fade-in">
            <div className="cat-header-title">
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            
            <div className="cat-header-actions">
                {secondaryAction && (
                    <button 
                        className="cat-btn-secondary" 
                        onClick={secondaryAction.onClick}
                        aria-label={secondaryAction.label}
                    >
                        {secondaryAction.icon && <secondaryAction.icon size={15} strokeWidth={2.2} />}
                        <span>{secondaryAction.label}</span>
                    </button>
                )}
                
                {primaryAction && (
                    <button 
                        className="cat-btn-primary" 
                        onClick={primaryAction.onClick}
                        aria-label={primaryAction.label}
                    >
                        {primaryAction.icon && <primaryAction.icon size={15} strokeWidth={2.5} />}
                        <span>{primaryAction.label}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default PageHeader;
