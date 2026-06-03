import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import "./roles.css";

/**
 * Centered SaaS modal — single scroll container in body only.
 * Desktop: max 900px | Laptop: 80vw | Tablet: 90vw | Mobile: full-screen drawer
 */
function Modal({
    isOpen,
    onClose,
    ariaLabelledBy,
    size = "default",
    mobileDrawer = true,
    showClose = true,
    elevated = false,
    header,
    headerActions,
    footer,
    children,
}) {
    const dialogRef = useRef(null);
    const handleClose = useCallback(() => onClose?.(), [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, handleClose]);

    if (!isOpen) return null;

    const sizeClass = size === "compact" ? "role-modal--compact" : "";

    return createPortal(
        <div
            className={`role-modal-portal ${elevated ? "role-modal-portal--elevated" : ""}`}
            role="presentation"
        >
            <div
                className="role-modal-backdrop"
                onClick={handleClose}
                aria-hidden="true"
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
                className={`role-modal ${sizeClass} ${mobileDrawer ? "role-modal--drawer-mobile" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {header && (
                    <div className="role-modal__header">
                        <div className="role-modal__header-main">{header}</div>
                        {headerActions && (
                            <div className="role-modal__header-actions">{headerActions}</div>
                        )}
                        {showClose && (
                            <button
                                type="button"
                                className="role-modal__close"
                                onClick={handleClose}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
                <div className="role-modal__body">{children}</div>
                {footer && <div className="role-modal__footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
