import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, CheckCircle, FileText, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { MOCK_ORDERS } from "../../data/ordersData";
import { downloadInvoicePDF, generateInvoiceBlobUrl } from "../../utils/invoiceGenerator";

export default function InvoiceDownloadPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("generating"); // generating, success, error
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!orderId) {
            setStatus("error");
            setErrorMessage("Invalid Order ID provided.");
            return;
        }

        // Search for order matching the scanned numeric ID
        const matchedOrder = MOCK_ORDERS.find(o => o.id.replace(/\D/g, "") === orderId);
        
        if (matchedOrder) {
            setOrder(matchedOrder);
        } else {
            // Fallback object to ensure user can still download/view a valid formatted invoice
            const fallbackOrder = {
                id: `#ORD-${orderId}`,
                customer: "Valued Customer",
                initials: "VC",
                date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                items: 1,
                amount: "₹100.00",
                payment: "UPI",
                status: "Delivered"
            };
            setOrder(fallbackOrder);
        }
    }, [orderId]);

    useEffect(() => {
        if (!order) return;

        // Auto trigger download
        const timer = setTimeout(() => {
            try {
                downloadInvoicePDF(order);
                setStatus("success");
            } catch (err) {
                console.error("PDF generation/download failed:", err);
                setStatus("error");
                setErrorMessage("Failed to generate invoice PDF. Please try again.");
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [order]);

    const handleManualDownload = () => {
        if (!order) return;
        try {
            downloadInvoicePDF(order);
        } catch (err) {
            console.error("Manual download error:", err);
        }
    };

    const handleViewInvoice = () => {
        if (!order) return;
        try {
            const blobUrl = generateInvoiceBlobUrl(order);
            window.open(blobUrl, "_blank");
        } catch (err) {
            console.error("Opening invoice blob failed:", err);
        }
    };

    return (
        <div style={styles.container}>
            <style>{keyframeStyles}</style>
            
            <div style={styles.card}>
                {/* Branding Header */}
                <div style={styles.header}>
                    <span style={styles.logo}>HAATZA</span>
                    <span style={styles.badge}>WMS Invoice Service</span>
                </div>

                {status === "generating" && (
                    <div style={styles.content}>
                        <div style={styles.spinnerContainer}>
                            <Loader2 size={48} style={styles.spinner} />
                        </div>
                        <h2 style={styles.title}>Generating Invoice</h2>
                        <p style={styles.subtitle}>
                            Please wait while we prepare your GST Tax Invoice for order <strong>#ORD-{orderId}</strong>...
                        </p>
                        <div style={styles.progressBarContainer}>
                            <div style={styles.progressBar} />
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div style={styles.content}>
                        <div style={styles.iconContainerSuccess}>
                            <CheckCircle size={44} style={styles.successIcon} />
                        </div>
                        <h2 style={styles.title}>Download Ready!</h2>
                        <p style={styles.subtitle}>
                            Your invoice for order <strong>{order?.id}</strong> is ready. The download should have started automatically.
                        </p>

                        <div style={styles.actionBlock}>
                            <button onClick={handleManualDownload} style={styles.primaryButton}>
                                <Download size={18} style={styles.buttonIcon} />
                                Download PDF Again
                            </button>
                            <button onClick={handleViewInvoice} style={styles.secondaryButton}>
                                <FileText size={18} style={styles.buttonIcon} />
                                View Invoice
                            </button>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div style={styles.content}>
                        <div style={styles.iconContainerError}>
                            <AlertTriangle size={44} style={styles.errorIcon} />
                        </div>
                        <h2 style={styles.title}>Generation Failed</h2>
                        <p style={styles.subtitle}>
                            {errorMessage || "An unexpected error occurred while preparing your download."}
                        </p>
                        <div style={styles.actionBlock}>
                            <button onClick={() => navigate("/")} style={styles.primaryButton}>
                                <ArrowLeft size={18} style={styles.buttonIcon} />
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer details */}
                <div style={styles.footer}>
                    <p>© {new Date().getFullYear()} HAATZA COMMERCE PRIVATE LIMITED</p>
                    <p style={styles.footerSub}>Bengaluru, Karnataka, India</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 20%, rgba(246, 248, 255, 1) 0%, rgba(230, 237, 255, 1) 90%)",
        fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "20px",
        boxSizing: "border-box"
    },
    card: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(30, 96, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        width: "100%",
        maxWidth: "460px",
        padding: "36px",
        boxSizing: "border-box",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    header: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px"
    },
    logo: {
        fontSize: "28px",
        fontWeight: "900",
        color: "#1e60ff",
        letterSpacing: "1px",
        fontFamily: "'Outfit', sans-serif"
    },
    badge: {
        fontSize: "11px",
        fontWeight: "600",
        background: "rgba(30, 96, 255, 0.08)",
        color: "#1e60ff",
        padding: "4px 12px",
        borderRadius: "100px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px"
    },
    spinnerContainer: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "rgba(30, 96, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px"
    },
    spinner: {
        color: "#1e60ff",
        animation: "spin 1.2s linear infinite"
    },
    iconContainerSuccess: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "rgba(16, 185, 129, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px"
    },
    successIcon: {
        color: "#10b981",
        animation: "scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    },
    iconContainerError: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "rgba(239, 68, 68, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px"
    },
    errorIcon: {
        color: "#ef4444",
        animation: "scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    },
    title: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1f2937",
        margin: 0
    },
    subtitle: {
        fontSize: "14px",
        color: "#6b7280",
        lineHeight: "1.6",
        margin: 0,
        padding: "0 10px"
    },
    progressBarContainer: {
        width: "100%",
        height: "6px",
        background: "#e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "8px"
    },
    progressBar: {
        height: "100%",
        background: "linear-gradient(90deg, #1e60ff, #5c8eff)",
        borderRadius: "10px",
        animation: "fillProgress 1.2s ease-out forwards"
    },
    actionBlock: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "12px",
        marginTop: "8px"
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "#1e60ff",
        color: "#ffffff",
        border: "none",
        borderRadius: "12px",
        padding: "14px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(30, 96, 255, 0.2)"
    },
    secondaryButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "#ffffff",
        color: "#4b5563",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        padding: "13px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    buttonIcon: {
        flexShrink: 0
    },
    footer: {
        borderTop: "1px solid #e5e7eb",
        paddingTop: "20px",
        fontSize: "11px",
        color: "#9ca3af",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    footerSub: {
        fontSize: "10px",
        margin: 0
    }
};

const keyframeStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
@keyframes scaleUp {
    0% { transform: scale(0.6); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes fillProgress {
    0% { width: 0%; }
    100% { width: 100%; }
}
button:hover {
    transform: translateY(-1px);
    opacity: 0.95;
}
button:active {
    transform: translateY(1px);
}
`;
