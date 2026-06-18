import React, { useState, useEffect } from "react";
import { 
    getDashboardMetrics, 
    autoTriggerPurchaseRequisition,
    resolveWarehouseName
} from "../../services/purchaseService";
import { getInventory } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    ShoppingBag, 
    FileText, 
    CheckCircle, 
    Truck, 
    AlertTriangle, 
    TrendingUp, 
    Clock, 
    Package, 
    Zap 
} from "lucide-react";
import "./PurchaseStyles.css";

function PurchaseDashboard() {
    const { selectedWarehouseName } = useAuth();
    const { showToast } = useToast();
    const [metrics, setMetrics] = useState({});
    const [lowStockItems, setLowStockItems] = useState([]);
    const [criticalStockItems, setCriticalStockItems] = useState([]);

    const loadData = () => {
        const warehouse = selectedWarehouseName || "HAATZA Koramangala Hub";
        const resolvedWarehouse = resolveWarehouseName(warehouse);
        const dashboardMetrics = getDashboardMetrics(warehouse);
        setMetrics(dashboardMetrics);

        // Fetch low & critical items
        const ledger = getInventory().filter(l => l.location === resolvedWarehouse);
        setLowStockItems(ledger.filter(l => l.status === "Low Stock"));
        setCriticalStockItems(ledger.filter(l => l.available === 0 || l.status === "Out of Stock"));
    };

    useEffect(() => {
        loadData();
    }, [selectedWarehouseName]);

    const handleAutoReplenish = () => {
        const warehouseName = selectedWarehouseName || "HAATZA Koramangala Hub";
        try {
            const result = autoTriggerPurchaseRequisition(
                "DKH-001", 
                warehouseName, 
                "System Auto"
            );
            if (result) {
                showToast(`Auto-Replenish triggered! Requisition ${result.prNumber} raised for approval.`, "success");
                loadData();
            } else {
                showToast("All items have sufficient stock levels. No auto-requisitions needed.", "info");
            }
        } catch (e) {
            showToast(e.message, "error");
        }
    };

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Purchase Dashboard</h1>
                    <p className="purchase-header-subtitle">
                        Monitoring procurement requisitions, pending deliveries, vendor performance, and critical stock coverages.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={handleAutoReplenish}
                    >
                        <Zap size={16} />
                        <span>Run Auto-Replenish Engine</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="purchase-grid-4">
                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon primary">
                        <FileText size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.openPRCount || 0}</span>
                        <span className="purchase-stat-label">Open Requisitions</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon warning">
                        <Clock size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.pendingApprovalPRCount || 0}</span>
                        <span className="purchase-stat-label">Pending Approvals</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon info">
                        <ShoppingBag size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.openPOCount || 0}</span>
                        <span className="purchase-stat-label">Open Purchase Orders</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon success">
                        <Truck size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.pendingDelCount || 0}</span>
                        <span className="purchase-stat-label">Pending Deliveries</span>
                    </div>
                </div>
            </div>

            <div className="purchase-grid-4">
                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon primary">
                        <TrendingUp size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.vendorFillRate || 95}%</span>
                        <span className="purchase-stat-label">Vendor Fill Rate</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon success">
                        <span style={{ fontSize: "16px", fontWeight: "bold" }}>₹</span>
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">₹{(metrics.purchaseValue || 0).toLocaleString()}</span>
                        <span className="purchase-stat-label">Purchase Value</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon info">
                        <Package size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.inventoryCoverageDays || 8} Days</span>
                        <span className="purchase-stat-label">Inventory Coverage</span>
                    </div>
                </div>

                <div className="purchase-stat-card">
                    <div className="purchase-stat-icon danger">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="purchase-stat-info">
                        <span className="purchase-stat-value">{metrics.lowStockCount || 0}</span>
                        <span className="purchase-stat-label">Low Stock Items</span>
                    </div>
                </div>
            </div>

            {/* Split screen: Critical and Low Stock Products */}
            <div className="purchase-detail-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="purchase-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 className="purchase-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                            <AlertTriangle size={18} />
                            <span>Out of Stock / Critical Products</span>
                        </h3>
                        <span className="purchase-badge rejected" style={{ borderRadius: "6px" }}>
                            {criticalStockItems.length} Products
                        </span>
                    </div>
                    <div className="purchase-table-container">
                        <table className="purchase-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product</th>
                                    <th>Reorder Point</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {criticalStockItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)" }}>
                                            No critical out-of-stock products detected.
                                        </td>
                                    </tr>
                                ) : (
                                    criticalStockItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="font-mono">{item.sku}</td>
                                            <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                            <td>{item.reorderPoint} units</td>
                                            <td>
                                                <span className="purchase-badge rejected">Out of Stock</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="purchase-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 className="purchase-modal-title" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)" }}>
                            <AlertTriangle size={18} />
                            <span>Low Stock Products</span>
                        </h3>
                        <span className="purchase-badge intransit" style={{ borderRadius: "6px", color: "var(--color-warning)" }}>
                            {lowStockItems.length} Products
                        </span>
                    </div>
                    <div className="purchase-table-container">
                        <table className="purchase-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product</th>
                                    <th>Stock</th>
                                    <th>Reorder Point</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)" }}>
                                            No low stock products detected.
                                        </td>
                                    </tr>
                                ) : (
                                    lowStockItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="font-mono">{item.sku}</td>
                                            <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                            <td style={{ fontWeight: 700, color: "var(--color-warning)" }}>{item.available} units</td>
                                            <td>{item.reorderPoint} units</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PurchaseDashboard;
