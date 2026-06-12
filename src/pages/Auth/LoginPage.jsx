import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, Globe, ChevronDown, ArrowRight, Key, User } from "lucide-react";
import loginAssetImg from "../../assets/login.png";
import logoImg from "../../assets/logo.jpeg";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import "./LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // UI View State
    const [viewMode, setViewMode] = useState("login"); // login, forgot, reset

    // Login Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Forgot Password State
    const [forgotIdentifier, setForgotIdentifier] = useState("");
    
    // Reset Password State
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    // Common UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSignIn = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const data = await authService.login(email, password);
            if (data.status === "success" && data.message && data.message.loginEnabled !== false) {
                login(data, password);
                navigate("/connect");
            } else {
                setError(data && typeof data.message === "string" ? data.message : (data.message?.error || "Login failed. Please check your credentials."));
            }
        } catch (err) {
            setError("An error occurred during authentication. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateOTP = async (e) => {
        e.preventDefault();
        if (!forgotIdentifier.trim()) {
            setError("Please enter your Employee ID, Email or Phone Number.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Simulate API request for generating OTP
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setSuccessMessage("OTP generated and sent to your registered contact info.");
            setViewMode("reset");
        } catch (err) {
            setError("Failed to generate OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!otp.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Simulate updating password via masters or database reset
            await new Promise((resolve) => setTimeout(resolve, 1500));
            
            // Prefill email if they reset using their email
            if (forgotIdentifier.includes("@")) {
                setEmail(forgotIdentifier);
            }
            
            setSuccessMessage("Password reset successfully! You can now sign in with your new password.");
            setViewMode("login");
            setOtp("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setError("Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchMode = (mode) => {
        setViewMode(mode);
        setError("");
        setSuccessMessage("");
    };

    const handleFormSubmit = (e) => {
        if (viewMode === "login") {
            handleSignIn(e);
        } else if (viewMode === "forgot") {
            handleGenerateOTP(e);
        } else if (viewMode === "reset") {
            handleResetPassword(e);
        }
    };

    return (
        <div className="login-viewport-wrapper">
            <div className="login-page-container">
                {/* Left Side: Raw Clean Asset Showcase */}
                <div className="login-image-pane">
                    <img src={loginAssetImg} alt="Haatza Platform Interface" className="login-asset-image" />
                </div>

                {/* Right Side: Authentication Form */}
                <div className="login-form-pane">
                    <div className="login-form-header">
                        <div className="login-brand">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="login-logo-svg">
                                <path d="M4 19L11 12L4 5H9L16 12L9 19H4Z" fill="#0020E6" />
                                <path d="M11 19L18 12L11 5H16L23 12L16 19H11Z" fill="#0020E6" />
                            </svg>
                            <span className="login-logo-text">HAATZA</span>
                        </div>

                        <div className="login-lang-selector">
                            <Globe size={15} className="lang-icon" />
                            <span>EN</span>
                            <ChevronDown size={13} className="lang-arrow" />
                        </div>
                    </div>

                    <div className="login-form-container">
                        <div className="login-form-welcome">
                            <h1>
                                {viewMode === "login" 
                                    ? "Welcome back" 
                                    : viewMode === "forgot" 
                                        ? "Forgot password" 
                                        : "Reset password"}
                            </h1>
                            <p>
                                {viewMode === "login" 
                                    ? "Sign in to continue to your dashboard." 
                                    : viewMode === "forgot" 
                                        ? "Enter your Employee ID, email or phone number to verify your identity." 
                                        : "Please enter the 6-digit OTP code sent to your device and set your new password."}
                            </p>
                        </div>

                        {error && <div className="login-error-alert">{error}</div>}
                        {successMessage && <div className="login-success-alert">{successMessage}</div>}

                        <form onSubmit={handleFormSubmit} className="login-form">
                            {viewMode === "login" && (
                                <>
                                    <div className="login-input-group">
                                        <label htmlFor="email">Email</label>
                                        <div className="login-input-wrapper">
                                            <Mail className="login-field-icon" size={18} />
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="login-input-group">
                                        <label htmlFor="password">Password</label>
                                        <div className="login-input-wrapper">
                                            <Lock className="login-field-icon" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login-form-actions">
                                        <label className="login-remember-me">
                                            <input
                                                type="checkbox"
                                                aria-label="Remember me on this device"
                                            />
                                            <span>Remember me</span>
                                        </label>
                                        <a 
                                            href="#forgot" 
                                            onClick={(e) => { e.preventDefault(); handleSwitchMode("forgot"); }} 
                                            className="forgot-password-link"
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                </>
                            )}

                            {viewMode === "forgot" && (
                                <>
                                    <div className="login-input-group">
                                        <label htmlFor="forgotIdentifier">Employee ID or Email or Phone Number</label>
                                        <div className="login-input-wrapper">
                                            <User className="login-field-icon" size={18} />
                                            <input
                                                type="text"
                                                id="forgotIdentifier"
                                                value={forgotIdentifier}
                                                onChange={(e) => setForgotIdentifier(e.target.value)}
                                                placeholder="Enter Employee ID, email, or phone"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="login-form-actions" style={{ justifyContent: "flex-end" }}>
                                        <a 
                                            href="#login" 
                                            onClick={(e) => { e.preventDefault(); handleSwitchMode("login"); }} 
                                            className="forgot-password-link"
                                        >
                                            Back to Login
                                        </a>
                                    </div>
                                </>
                            )}

                            {viewMode === "reset" && (
                                <>
                                    <div className="login-input-group">
                                        <label htmlFor="otp">OTP Code</label>
                                        <div className="login-input-wrapper">
                                            <Key className="login-field-icon" size={18} />
                                            <input
                                                type="text"
                                                id="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="login-input-group">
                                        <label htmlFor="newPassword">New Password</label>
                                        <div className="login-input-wrapper">
                                            <Lock className="login-field-icon" size={18} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login-input-group">
                                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                                        <div className="login-input-wrapper">
                                            <Lock className="login-field-icon" size={18} />
                                            <input
                                                type={showConfirmNewPassword ? "text" : "password"}
                                                id="confirmNewPassword"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            >
                                                {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="login-form-actions" style={{ justifyContent: "flex-end" }}>
                                        <a 
                                            href="#login" 
                                            onClick={(e) => { e.preventDefault(); handleSwitchMode("login"); }} 
                                            className="forgot-password-link"
                                        >
                                            Back to Login
                                        </a>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="login-submit-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="login-spinner"></span>
                                ) : (
                                    <>
                                        <span>
                                            {viewMode === "login" 
                                                ? "Sign in" 
                                                : viewMode === "forgot" 
                                                    ? "Generate OTP" 
                                                    : "Reset Password"}
                                        </span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="login-footer-security">
                        <Shield size={16} className="security-shield" />
                        <span>Secure access to your warehouse management account</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

