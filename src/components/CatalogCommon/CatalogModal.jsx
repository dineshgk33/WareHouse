import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./CatalogCommon.css";

function CatalogModal({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    icon: Icon, 
    children, 
    footer,
    sizeClass = "" // can be "large" or "medium"
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="cat-modal-backdrop fade-in" onClick={onClose}>
            <div 
                className={`cat-modal-container ${sizeClass}`} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="cat-modal-header">
                    <div className="cat-modal-header-title">
                        {Icon && (
                            <div className="cat-modal-icon-badge">
                                <Icon size={18} />
                            </div>
                        )}
                        <div>
                            <h2>{title}</h2>
                            {description && <p>{description}</p>}
                        </div>
                    </div>
                    
                    <button 
                        className="cat-modal-close" 
                        onClick={onClose} 
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="cat-modal-body">
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                    <div className="cat-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export default CatalogModal;
