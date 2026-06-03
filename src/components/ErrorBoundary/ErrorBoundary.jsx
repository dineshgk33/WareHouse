import React from "react";
import "./ErrorBoundary.css";

/**
 * ErrorBoundary — Global crash shield
 *
 * Wraps the router tree so a render error in any page does NOT
 * blank-screen the entire application. Shows a branded recovery UI instead.
 *
 * Usage in App.jsx:
 *   <ErrorBoundary>
 *     <Routes>...</Routes>
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production, replace with a real error logging service (e.g., Sentry)
        console.error("[HAATZA ErrorBoundary] Caught render error:", error, info);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-screen">
                    <div className="error-boundary-card">
                        <div className="error-boundary-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                    stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h1 className="error-boundary-title">Something went wrong</h1>
                        <p className="error-boundary-desc">
                            An unexpected error occurred while rendering this page.
                            Your data is safe — this is a display error only.
                        </p>
                        {this.state.error && (
                            <code className="error-boundary-code">
                                {this.state.error.message}
                            </code>
                        )}
                        <div className="error-boundary-actions">
                            <button className="error-btn-primary" onClick={this.handleGoHome}>
                                Go to Dashboard
                            </button>
                            <button className="error-btn-secondary" onClick={this.handleReload}>
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
