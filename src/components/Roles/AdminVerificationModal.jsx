import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "./roles.css";

function AdminVerificationModal({
    isOpen,
    administratorName,
    message,
    confirmLabel = "Verify & Save",
    onClose,
    onVerify,
    verifyPassword,
}) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setPassword("");
                setError("");
            }, 0);
        }
    }, [isOpen]);

    const handleVerify = () => {
        const result = verifyPassword(password);
        if (!result.ok) {
            setError(result.message || "Incorrect administrator password.");
            return;
        }
        onVerify();
        setPassword("");
        setError("");
    };

    const titleId = "admin-verify-title";

    const header = (
        <h2 id={titleId} className="role-admin-modal-title">
            Administrator Authentication Required
        </h2>
    );

    const footer = (
        <>
            <button type="button" className="role-btn role-btn--ghost" onClick={onClose}>
                Cancel
            </button>
            <button type="button" className="role-btn role-btn--primary" onClick={handleVerify}>
                {confirmLabel}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            size="compact"
            elevated
            header={header}
            footer={footer}
            showClose={false}
        >
            <p className="role-admin-modal-text">{message}</p>
            <div className="role-form-field">
                <label htmlFor="admin-name">Administrator Name</label>
                <input
                    id="admin-name"
                    type="text"
                    value={administratorName || "Administrator"}
                    readOnly
                />
            </div>
            <div className="role-form-field">
                <label htmlFor="admin-password">Password</label>
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    autoComplete="current-password"
                />
            </div>
            {error && <p className="role-admin-error" role="alert">{error}</p>}
        </Modal>
    );
}

export default AdminVerificationModal;
