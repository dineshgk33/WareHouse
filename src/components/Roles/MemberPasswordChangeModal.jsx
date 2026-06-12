import React, { useEffect, useState } from "react";
import { Loader2, Check, Key, Eye, EyeOff } from "lucide-react";
import Modal from "./Modal";
import "./roles.css";

function MemberPasswordChangeModal({
    isOpen,
    employee,
    onClose,
    onSave
}) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [sendEmail, setSendEmail] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Initialize/Reset state
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setNewPassword("");
                setConfirmPassword("");
                setSendEmail(false);
                setShowPassword(false);
                setError("");
            }, 0);
        }
    }, [isOpen]);

    if (!employee) return null;

    const generatePassword = () => {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%&*";
        const allChars = uppercase + lowercase + numbers + symbols;
        
        let password = "";
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
        
        for (let i = 0; i < 6; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        const shuffled = password.split('').sort(() => 0.5 - Math.random()).join('');
        setNewPassword(shuffled);
        setConfirmPassword(shuffled);
        setError("");
    };

    const handleSave = () => {
        if (!newPassword.trim()) {
            setError("Password cannot be empty.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsSaving(true);
        onSave(newPassword, sendEmail, () => {
            setIsSaving(false);
        });
    };

    const header = (
        <div className="role-viewer-header__info">
            <h2 id="role-password-title">Change Password - {employee.name}</h2>
            <p className="role-viewer-header__desc">{employee.email} • ID: {employee.employeeId}</p>
        </div>
    );

    const headerActions = (
        <>
            <button
                type="button"
                className="role-btn role-btn--primary"
                onClick={handleSave}
                disabled={isSaving || !newPassword}
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={onClose}
                disabled={isSaving}
            >
                Cancel
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="role-password-title"
            header={header}
            headerActions={headerActions}
            showClose={!isSaving}
            size="compact"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px' }}>
                {error && (
                    <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* Password field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>New Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError("");
                            }}
                            placeholder="Enter new password"
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                height: '42px',
                                borderRadius: '10px',
                                border: '1.5px solid #cbd5e1',
                                paddingLeft: '12px',
                                paddingRight: '76px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirm Password field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Confirm New Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                        }}
                        placeholder="Confirm new password"
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            height: '42px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            padding: '0 12px',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Auto-generate password action */}
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                        type="button"
                        onClick={generatePassword}
                        disabled={isSaving}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            cursor: 'pointer'
                        }}
                    >
                        <Key size={14} />
                        <span>Generate Random Password</span>
                    </button>
                </div>

                {/* Send Credentials via Email Checkbox */}
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <input
                        type="checkbox"
                        id="send-password-email"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        disabled={isSaving}
                        style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#2563eb',
                            cursor: 'pointer',
                            marginTop: '2px'
                        }}
                    />
                    <label htmlFor="send-password-email" style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                            Send password update via email
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '400', lineHeight: '1.4' }}>
                            Automatically send the new password to the employee's email address.
                        </span>
                    </label>
                </div>
            </div>
        </Modal>
    );
}

export default MemberPasswordChangeModal;
