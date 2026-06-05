import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AccessDeniedPage() {
    const navigate = useNavigate();
    const { accessiblePages } = useAuth();

    const handleReturn = () => {
        if (!accessiblePages || accessiblePages.length === 0) {
            navigate("/connect");
            return;
        }
        
        const hasDashboard = accessiblePages.some(p => p.pageId && p.pageId.toUpperCase() === "DASHBOARD" && p.canView);
        if (hasDashboard) {
            navigate("/dashboard");
        } else {
            const firstPage = accessiblePages.find(p => p.canView);
            const firstPageId = firstPage ? (firstPage.pageId ? firstPage.pageId.toUpperCase() : "") : "";
            switch (firstPageId) {
                case "ORDERS": navigate("/orders"); break;
                case "INVENTORY":
                case "WAREHOUSE_INVENTORY":
                    navigate("/inventory");
                    break;
                case "DARKHOUSE_INVENTORY":
                    navigate("/inventory?tab=darkhouse");
                    break;
                case "STOCK_TRANSFERS":
                    navigate("/inventory?tab=transfers");
                    break;
                case "CATALOG": navigate("/catalog/products"); break;
                case "CUSTOMERS": navigate("/customers"); break;
                case "BILLING": navigate("/billing"); break;
                case "SETTINGS": navigate("/settings"); break;
                case "ANALYTICS": navigate("/analytics"); break;
                case "REPORTS": navigate("/reports"); break;
                case "OPERATIONS": navigate("/operations"); break;
                case "DARKHOUSES": navigate("/darkhouses"); break;
                case "EMPLOYEES": navigate("/employees"); break;
                case "ADMIN": navigate("/admin/members"); break;
                default: navigate("/connect"); break;
            }
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: 16,
            fontFamily: "var(--font-sans, sans-serif)",
            background: "var(--bg-app, #F6F8FF)",
        }}>
            <ShieldAlert size={72} color="#EF4444" />
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>403 Access Denied</h1>
            <p style={{ color: "#6B7280", fontSize: 16, textAlign: "center", maxWidth: 400 }}>
                You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
            </p>
            <button
                onClick={handleReturn}
                style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    background: "#1e60ff",
                    color: "#fff",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                }}
            >
                Return to Home
            </button>
        </div>
    );
}

export default AccessDeniedPage;
