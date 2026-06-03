import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, Globe, ChevronDown, ArrowRight } from "lucide-react";
import loginAssetImg from "../../assets/login.png";
import logoImg from "../../assets/logo.jpeg";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import "./LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignIn = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const data = await authService.login(email, password);
            if (data.status === "success" && data.message.loginEnabled) {
                login(data);
                navigate("/connect");
            } else {
                setError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("An error occurred during authentication. Please try again.");
        } finally {
            setIsLoading(false);
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
                            <h1>Welcome back</h1>
                            <p>Sign in to continue to your dashboard.</p>
                        </div>

                        {error && <div className="login-error-alert">{error}</div>}

                        <form onSubmit={handleSignIn} className="login-form">
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
                                <a href="#forgot" className="forgot-password-link">Forgot Password?</a>
                            </div>

                            <button type="submit" className="login-submit-btn" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="login-spinner"></span>
                                ) : (
                                    <>
                                        <span>Sign in</span>
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
