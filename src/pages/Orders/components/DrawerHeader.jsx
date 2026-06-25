import React from "react";
import { X } from "lucide-react";

function DrawerHeader({ title, subtitle, onClose }) {
    return (
        <div className="drawer-header-sticky">
            <div className="drawer-header-main">
                <h3 className="drawer-header-title">{title}</h3>
                {subtitle && <p className="drawer-header-subtitle">{subtitle}</p>}
            </div>
            <button 
                type="button" 
                className="drawer-header-close-btn" 
                onClick={onClose}
                aria-label="Close panel"
            >
                <X size={18} />
            </button>
        </div>
    );
}

export default React.memo(DrawerHeader);
