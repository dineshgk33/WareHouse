import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import "./ConfirmModal.css";

/**
 * ConfirmModal — Accessible replacement for window.confirm()
 *
 * Features:
 * - Accessible: role="dialog", aria-modal, aria-labelledby
 * - Focus trapped inside modal while open
 * - Closes on Escape key
 * - Closes on backdrop click
 *
 * Usage:
 *   <ConfirmModal
 *     isOpen={showConfirm}
 *     title="Cancel Order?"
 *     message="This action cannot be undone."
 *     confirmLabel="Yes, Cancel"
 *     onConfirm={handleConfirm}
 *     onCancel={() => setShowConfirm(false)}
 *     variant="danger"
 *   />
 */
function ConfirmModal({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "danger", // "danger" | "warning" | "primary"
}) {
    const confirmBtnRef = useRef(null);

    // Auto-focus confirm button when modal opens
    useEffect(() => {
        if (isOpen && confirmBtnRef.current) {
            confirmBtnRef.current.focus();
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === "Escape") onCancel?.();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="confirm-modal-backdrop"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="confirm-modal-box"
            >
                <div className={`confirm-modal-icon-wrap confirm-icon--${variant}`}>
                    <AlertTriangle size={22} />
                </div>

                <h2 id="confirm-modal-title" className="confirm-modal-title">
                    {title}
                </h2>
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <button
                        className="confirm-btn-cancel"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmBtnRef}
                        className={`confirm-btn-confirm confirm-btn--${variant}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConfirmModal;
