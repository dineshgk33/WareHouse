import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Download,
    AlertTriangle,
    Package,
    Search,
    ChevronLeft,
    ChevronRight,
    Store,
    XCircle,
    Plus,
    CheckCircle,
    Clock,
    Check,
    Eye,
    Truck,
    ClipboardList,
    TrendingUp,
    Shield,
    Calendar,
    ArrowRightLeft,
    SlidersHorizontal,
    CornerDownRight,
    HelpCircle,
    User,
    Info
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import {
    getIndents,
    getTransactions,
    getWarehouseStock,
    getDarkhouseStock,
    createIndent,
    approveIndent,
    rejectIndent,
    dispatchIndent,
    receiveIndent,
    getLowStockAlerts,
    getWarehouseStockForLocation,
    getFulfillmentRecommendation
} from "../../../services/indentService";
import "../Catalogue.css";

const ROWS_PER_PAGE = 6;

function IndentPage() {
    const { userRole, selectedWarehouseName, userName } = useAuth();

    // ─── Determine Role Access ───────────────────────────────────────────────
    const isMainWarehouse = useMemo(() => {
        const warehouse = (selectedWarehouseName || "").toLowerCase();
        const role = (userRole || "").toLowerCase();
        return warehouse.includes("central") || role.includes("admin") || role.includes("warehouse manager");
    }, [selectedWarehouseName, userRole]);

    // ─── States ───────────────────────────────────────────────────────────────
    const [indents, setIndents] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [darkhouseStock, setDarkhouseStock] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "list";
    const statusParam = searchParams.get("status") || "";

    // Refresh state from localStorage database
    const refreshData = () => {
        setIndents(getIndents());
        setTransactions(getTransactions());
        setWarehouseStock(getWarehouseStock());
        setDarkhouseStock(getDarkhouseStock());
        if (selectedWarehouseName) {
            setLowStockAlerts(getLowStockAlerts(selectedWarehouseName));
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => refreshData());
    }, [selectedWarehouseName]);

    // ─── Toast Notification State ──────────────────────────────────────────────
    const [toast, setToast] = useState({ show: false, message: "" });
    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    // ─── Filter & Search States ────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [warehouseFilter, setWarehouseFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (statusParam) {
            Promise.resolve().then(() => setStatusFilter(statusParam));
        } else {
            Promise.resolve().then(() => setStatusFilter("All"));
        }
    }, [statusParam]);

    // Timeline tracker selection
    const [trackedIndentId, setTrackedIndentId] = useState("");
    const trackedIndent = useMemo(() => {
        if (!trackedIndentId) return indents[0] || null;
        return indents.find(i => i.id === trackedIndentId) || indents[0] || null;
    }, [trackedIndentId, indents]);

    // Set initial tracked indent on load
    useEffect(() => {
        if (indents.length > 0 && !trackedIndentId) {
            Promise.resolve().then(() => setTrackedIndentId(indents[0].id));
        }
    }, [indents, trackedIndentId]);

    // ─── Modals State ─────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'create' | 'approve' | 'dispatch' | 'receive' | 'view'
    const [selectedIndent, setSelectedIndent] = useState(null);

    // Create Form State
    const [selectedProductSku, setSelectedProductSku] = useState("");
    const [requestedQty, setRequestedQty] = useState("");
    const [requestPriority, setRequestPriority] = useState("Medium");
    const [requestRemarks, setRequestRemarks] = useState("");

    // Look up product available stocks
    const selectedProduct = useMemo(() => {
        return warehouseStock.find(item => item.sku === selectedProductSku);
    }, [selectedProductSku, warehouseStock]);

    const currentHubQty = useMemo(() => {
        if (!selectedProductSku) return 0;
        const entry = darkhouseStock.find(
            item => item.darkhouse === selectedWarehouseName && item.sku === selectedProductSku
        );
        return entry ? entry.available : 0;
    }, [selectedProductSku, darkhouseStock, selectedWarehouseName]);

    // Auto load first product in creation form
    useEffect(() => {
        if (modalType === "create" && warehouseStock.length > 0) {
            Promise.resolve().then(() => {
                setSelectedProductSku(warehouseStock[0]?.sku || "");
                setRequestedQty("");
                setRequestPriority("Medium");
                setRequestRemarks("");
            });
        }
    }, [modalType, warehouseStock]);

    // Approve Form State
    const [approvedQty, setApprovedQty] = useState("");
    const [approvalRemarks, setApprovalRemarks] = useState("");
    const [sourcedFrom, setSourcedFrom] = useState(null);

    const availableMainStock = useMemo(() => {
        if (!selectedIndent) return 0;
        return getWarehouseStockForLocation(selectedIndent.requestedTo, selectedIndent.sku);
    }, [selectedIndent]);

    const recommendation = useMemo(() => {
        if (!selectedIndent || modalType !== "approve") return null;
        return getFulfillmentRecommendation(selectedIndent.id);
    }, [selectedIndent, modalType]);

    useEffect(() => {
        if (modalType === "approve" && selectedIndent) {
            Promise.resolve().then(() => {
                setApprovedQty(selectedIndent.requestedQty);
                setApprovalRemarks("");
                setSourcedFrom(null);
            });
        }
    }, [modalType, selectedIndent]);

    // Dispatch Form State
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [driverName, setDriverName] = useState("");
    const [dispatchRemarks, setDispatchRemarks] = useState("");

    useEffect(() => {
        if (modalType === "dispatch" && selectedIndent) {
            Promise.resolve().then(() => {
                setVehicleNumber("");
                setDriverName("");
                setDispatchRemarks("");
            });
        }
    }, [modalType, selectedIndent]);

    // Receive Form State
    const [receivedQty, setReceivedQty] = useState("");
    const [damagedQty, setDamagedQty] = useState("0");
    const [receiveRemarks, setReceiveRemarks] = useState("");

    useEffect(() => {
        if (modalType === "receive" && selectedIndent) {
            Promise.resolve().then(() => {
                setReceivedQty(selectedIndent.approvedQty);
                setDamagedQty("0");
                setReceiveRemarks("");
            });
        }
    }, [modalType, selectedIndent]);

    // ─── Filter Logic ─────────────────────────────────────────────────────────
    const filteredIndents = useMemo(() => {
        return indents.filter(indent => {
            const matchesSearch =
                indent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                indent.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                indent.sku.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || indent.status === statusFilter;
            const matchesPriority = priorityFilter === "All" || indent.priority === priorityFilter;
            
            // Dark House / regional hubs only see their own requests
            const isWarehouseAllowed = isMainWarehouse 
                ? (warehouseFilter === "All" || indent.requestedBy === warehouseFilter)
                : (indent.requestedBy === selectedWarehouseName);
            
            return matchesSearch && matchesStatus && matchesPriority && isWarehouseAllowed;
        });
    }, [indents, searchTerm, statusFilter, priorityFilter, warehouseFilter, isMainWarehouse, selectedWarehouseName]);

    const paginatedIndents = useMemo(() => {
        const start = (currentPage - 1) * ROWS_PER_PAGE;
        return filteredIndents.slice(start, start + ROWS_PER_PAGE);
    }, [filteredIndents, currentPage]);

    const uniqueWarehouses = useMemo(() => {
        const set = new Set(indents.map(i => i.requestedBy));
        return ["All", ...Array.from(set)];
    }, [indents]);

    // ─── Summary Analytics Stats ─────────────────────────────────────────────
    const analytics = useMemo(() => {
        const visibleIndents = indents.filter(indent => 
            isMainWarehouse ? true : indent.requestedBy === selectedWarehouseName
        );

        const total = visibleIndents.length;
        const pending = visibleIndents.filter(i => i.status === "Pending").length;
        const approved = visibleIndents.filter(i => i.status === "Approved" || i.status === "Partially Approved").length;
        const dispatched = visibleIndents.filter(i => i.status === "Dispatched").length;
        const completed = visibleIndents.filter(i => i.status === "Completed").length;
        const rejected = visibleIndents.filter(i => i.status === "Rejected").length;

        // Sum quantities
        const requestedQtyTotal = visibleIndents.reduce((sum, i) => sum + i.requestedQty, 0);
        const dispatchedQtyTotal = visibleIndents
            .filter(i => i.status === "Dispatched" || i.status === "Completed")
            .reduce((sum, i) => sum + i.approvedQty, 0);
        const receivedQtyTotal = visibleIndents
            .filter(i => i.status === "Completed")
            .reduce((sum, i) => sum + (i.receivedQty || 0), 0);

        return { 
            total, pending, approved, dispatched, completed, rejected,
            requestedQtyTotal, dispatchedQtyTotal, receivedQtyTotal
        };
    }, [indents, isMainWarehouse, selectedWarehouseName]);

    // ─── Quick Alerts Trigger ────────────────────────────────────────────────
    const handleQuickRequest = (alertItem) => {
        try {
            const qty = alertItem.reorderLevel * 3; // Replenish standard box volume
            createIndent(
                alertItem.sku,
                alertItem.productName,
                alertItem.warehouse,
                qty,
                "High",
                "Automated low stock trigger replenishment request.",
                `${userName} (${selectedWarehouseName.replace("HAATZA ", "")})`
            );
            refreshData();
            showToast(`Stock request generated for ${alertItem.productName} (${qty} units)!`);
        } catch (e) {
            alert(e.message);
        }
    };

    // ─── Modal Actions Handlers ───────────────────────────────────────────────
    const handleCreateRequestSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(requestedQty);
        if (!selectedProductSku || isNaN(qty) || qty <= 0) {
            alert("Please enter a valid requested quantity.");
            return;
        }

        try {
            createIndent(
                selectedProductSku,
                selectedProduct.product,
                selectedWarehouseName || "HAATZA Koramangala Hub",
                qty,
                requestPriority,
                requestRemarks,
                `${userName} (${selectedWarehouseName.replace("HAATZA ", "")})`
            );
            setIsModalOpen(false);
            refreshData();
            setSearchParams({ tab: "list" });
            showToast("Replenishment stock request created successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleApproveSubmit = (e) => {
        e.preventDefault();
        const qty = parseInt(approvedQty);
        const maxQty = sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock;
        if (isNaN(qty) || qty <= 0) {
            alert("Please enter a valid approved quantity.");
            return;
        }

        if (qty > maxQty) {
            alert(`Insufficient stock. Available: ${maxQty}`);
            return;
        }

        try {
            approveIndent(selectedIndent.id, qty, approvalRemarks, `${userName} (Central)`, sourcedFrom);
            setIsModalOpen(false);
            refreshData();
            showToast(`Request approved for ${qty} units.`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRejectClick = () => {
        const reason = prompt("Enter reason for rejection:") || "Request rejected by administrator.";
        try {
            rejectIndent(selectedIndent.id, reason, `${userName} (Central)`);
            setIsModalOpen(false);
            refreshData();
            showToast("Stock request rejected.");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDispatchSubmit = (e) => {
        e.preventDefault();
        if (!vehicleNumber.trim() || !driverName.trim()) {
            alert("Vehicle Number and Driver Name are mandatory.");
            return;
        }

        try {
            dispatchIndent(selectedIndent.id, vehicleNumber, driverName, dispatchRemarks, `${userName} (Central)`);
            setIsModalOpen(false);
            refreshData();
            showToast(`Stock request ${selectedIndent.id} successfully dispatched!`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleReceiveSubmit = (e) => {
        e.preventDefault();
        const recQty = parseInt(receivedQty);
        const dmgQty = parseInt(damagedQty);

        if (isNaN(recQty) || recQty < 0 || isNaN(dmgQty) || dmgQty < 0) {
            alert("Please provide valid quantity numbers.");
            return;
        }

        if (recQty + dmgQty !== selectedIndent.approvedQty) {
            if (!confirm(`Total received (${recQty}) + damaged (${dmgQty}) does not equal approved quantity (${selectedIndent.approvedQty}). Proceed?`)) {
                return;
            }
        }

        try {
            receiveIndent(
                selectedIndent.id,
                recQty,
                dmgQty,
                receiveRemarks,
                `${userName} (${selectedWarehouseName.replace("HAATZA ", "")})`
            );
            setIsModalOpen(false);
            refreshData();
            showToast("Stock received and local warehouse inventory updated!");
        } catch (error) {
            alert(error.message);
        }
    };

    const openViewDetails = (indent) => {
        setSelectedIndent(indent);
        setTrackedIndentId(indent.id);
        setSearchParams({ tab: "details" });
    };

    const openApproveModal = (indent) => {
        setSelectedIndent(indent);
        setModalType("approve");
        setIsModalOpen(true);
    };

    const openDispatchModal = (indent) => {
        setSelectedIndent(indent);
        setModalType("dispatch");
        setIsModalOpen(true);
    };

    const openReceiveModal = (indent) => {
        setSelectedIndent(indent);
        setModalType("receive");
        setIsModalOpen(true);
    };

    // CSV Export
    const handleExportCSV = () => {
        const headers = ["Request ID", "Product", "SKU", "Requested By", "Requested To", "Requested Qty", "Approved Qty", "Status", "Priority", "Requested Date"];
        const rows = filteredIndents.map(i => [
            i.id,
            `"${i.productName}"`,
            i.sku,
            `"${i.requestedBy}"`,
            `"${i.requestedTo}"`,
            i.requestedQty,
            i.approvedQty,
            i.status,
            i.priority,
            `"${i.requestedDate}"`
        ]);
        const filename = "haatza_stock_requests.csv";

        const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Styling helpers
    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Urgent": return "inv-pill--danger";
            case "High": return "inv-pill--warning";
            case "Medium": return "inv-pill--info";
            default: return "inv-pill--success";
        }
    };

    const getStatusPillClass = (status) => {
        switch (status) {
            case "Completed": return "inv-pill--success";
            case "Dispatched": return "inv-pill--info";
            case "Approved":
            case "Partially Approved": return "inv-action-inline-btn--success";
            case "Rejected": return "inv-pill--danger";
            default: return "inv-pill--warning"; // Pending
        }
    };

    const getTimelineStepIndex = (status) => {
        switch (status) {
            case "Pending": return 0;
            case "Approved":
            case "Partially Approved": return 1;
            case "Dispatched": return 2;
            case "Completed": return 4; // completed represents received stock loaded
            default: return -1; // Rejected
        }
    };

    return (
        <div className="inv-root fade-in">
            {/* Page Header */}
            <div className="inv-header">
                <div className="inv-header__title-block">
                    <h1 className="inv-header__title">Stock Request (Indent) Management</h1>
                    <p className="inv-header__subtitle">
                        Enterprise inventory replenishment pipeline linking Dark House hubs to HAATZA Central Warehouse.
                    </p>
                </div>
                <div className="inv-header-actions-group">
                    {!isMainWarehouse && (
                        <button className="inv-action-btn-primary" onClick={() => { setModalType("create"); setIsModalOpen(true); }}>
                            <Plus size={15} />
                            <span>Create Stock Request</span>
                        </button>
                    )}
                    <button className="inv-export-btn" onClick={handleExportCSV}>
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Tab Selectors */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", paddingBottom: 1, gap: 24, marginTop: 4, flexWrap: "wrap" }}>
                <button 
                    onClick={() => setSearchParams({ tab: "list" })}
                    style={{
                        padding: "10px 4px",
                        fontSize: 14,
                        fontWeight: (activeTab === "list" || activeTab === "registry") ? "700" : "500",
                        color: (activeTab === "list" || activeTab === "registry") ? "var(--primary)" : "var(--text-muted)",
                        border: "none",
                        backgroundColor: "transparent",
                        borderBottom: (activeTab === "list" || activeTab === "registry") ? "2px solid var(--primary)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                    }}
                >
                    Indent List
                </button>
                {!isMainWarehouse && (
                    <button 
                        onClick={() => setSearchParams({ tab: "create" })}
                        style={{
                            padding: "10px 4px",
                            fontSize: 14,
                            fontWeight: activeTab === "create" ? "700" : "500",
                            color: activeTab === "create" ? "var(--primary)" : "var(--text-muted)",
                            border: "none",
                            backgroundColor: "transparent",
                            borderBottom: activeTab === "create" ? "2px solid var(--primary)" : "none",
                            cursor: "pointer",
                            transition: "all var(--transition-fast)"
                        }}
                    >
                        Create Indent
                    </button>
                )}
                <button 
                    onClick={() => setSearchParams({ tab: "details" })}
                    style={{
                        padding: "10px 4px",
                        fontSize: 14,
                        fontWeight: activeTab === "details" ? "700" : "500",
                        color: activeTab === "details" ? "var(--primary)" : "var(--text-muted)",
                        border: "none",
                        backgroundColor: "transparent",
                        borderBottom: activeTab === "details" ? "2px solid var(--primary)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                    }}
                >
                    Indent Details
                </button>
                <button 
                    onClick={() => setSearchParams({ tab: "dashboard" })}
                    style={{
                        padding: "10px 4px",
                        fontSize: 14,
                        fontWeight: activeTab === "dashboard" ? "700" : "500",
                        color: activeTab === "dashboard" ? "var(--primary)" : "var(--text-muted)",
                        border: "none",
                        backgroundColor: "transparent",
                        borderBottom: activeTab === "dashboard" ? "2px solid var(--primary)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                    }}
                >
                    Dashboard Overview
                </button>
                <button 
                    onClick={() => setSearchParams({ tab: "ledger" })}
                    style={{
                        padding: "10px 4px",
                        fontSize: 14,
                        fontWeight: activeTab === "ledger" ? "700" : "500",
                        color: activeTab === "ledger" ? "var(--primary)" : "var(--text-muted)",
                        border: "none",
                        backgroundColor: "transparent",
                        borderBottom: activeTab === "ledger" ? "2px solid var(--primary)" : "none",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)"
                    }}
                >
                    Transaction Ledger
                </button>
            </div>

            {/* ─── TAB 1: DASHBOARD OVERVIEW ────────────────────────────────── */}
            {activeTab === "dashboard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 12 }}>
                    
                    {/* 9 Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                        {/* Status Cards */}
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <ClipboardList className="inv-summary-card__icon" />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{analytics.total}</span>
                                <span className="inv-summary-card__label">Total Requests</span>
                            </div>
                        </div>

                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <Clock className="inv-summary-card__icon" />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{analytics.pending}</span>
                                <span className="inv-summary-card__label">Pending</span>
                            </div>
                        </div>

                        <div className="inv-summary-card" style={{ borderLeft: "4px solid var(--primary)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(30, 96, 255, 0.08)" }}>
                                <Check className="inv-summary-card__icon" style={{ color: "var(--primary)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{analytics.approved}</span>
                                <span className="inv-summary-card__label">Approved</span>
                            </div>
                        </div>

                        <div className="inv-summary-card" style={{ borderLeft: "4px solid rgb(139, 92, 246)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(139, 92, 246, 0.08)" }}>
                                <Truck className="inv-summary-card__icon" style={{ color: "rgb(139, 92, 246)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value" style={{ color: "rgb(139, 92, 246)" }}>{analytics.dispatched}</span>
                                <span className="inv-summary-card__label">Dispatched</span>
                            </div>
                        </div>

                        <div className="inv-summary-card" style={{ borderLeft: "4px solid rgb(16, 185, 129)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}>
                                <CheckCircle className="inv-summary-card__icon" style={{ color: "rgb(16, 185, 129)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value" style={{ color: "rgb(16, 185, 129)" }}>{analytics.completed}</span>
                                <span className="inv-summary-card__label">Completed</span>
                            </div>
                        </div>

                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <XCircle className="inv-summary-card__icon" />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{analytics.rejected}</span>
                                <span className="inv-summary-card__label">Rejected</span>
                            </div>
                        </div>

                        {/* Additional Volume Cards */}
                        <div className="inv-summary-card" style={{ backgroundColor: "var(--bg-app)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}>
                                <TrendingUp className="inv-summary-card__icon" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{analytics.requestedQtyTotal}</span>
                                <span className="inv-summary-card__label">Qty Requested</span>
                            </div>
                        </div>

                        <div className="inv-summary-card" style={{ backgroundColor: "var(--bg-app)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}>
                                <Truck className="inv-summary-card__icon" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{analytics.dispatchedQtyTotal}</span>
                                <span className="inv-summary-card__label">Qty Dispatched</span>
                            </div>
                        </div>

                        <div className="inv-summary-card" style={{ backgroundColor: "var(--bg-app)" }}>
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info" style={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}>
                                <CheckCircle className="inv-summary-card__icon" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{analytics.receivedQtyTotal}</span>
                                <span className="inv-summary-card__label">Qty Received</span>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts & Timeline split layout */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24, alignItems: "start" }}>
                        
                        {/* 1. Low Stock Alerts Panel */}
                        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-card)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                <AlertTriangle style={{ color: "var(--color-warning)" }} size={20} />
                                <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Low Stock replenishment Alerts</h2>
                            </div>
                            
                            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 0, marginBottom: 16, lineHeight: 1.4 }}>
                                Below are catalogue items currently below the safety reorder point in <strong>{selectedWarehouseName}</strong>. Generate instant replacement requests.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {lowStockAlerts.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "24px 12px", border: "1.5px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
                                        <CheckCircle style={{ color: "rgb(16, 185, 129)", margin: "0 auto 8px" }} size={24} />
                                        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>All products stocked above reorder limits.</span>
                                    </div>
                                ) : (
                                    lowStockAlerts.map(alertItem => (
                                        <div 
                                            key={alertItem.sku}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "12px 14px",
                                                borderRadius: "var(--radius-md)",
                                                border: "1px solid var(--border-color)",
                                                backgroundColor: "var(--bg-app)"
                                            }}
                                        >
                                            <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {alertItem.productName}
                                                </div>
                                                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                                    <span style={{ fontFamily: "monospace" }}>{alertItem.sku}</span>
                                                    <span>Stock: <strong style={{ color: "var(--color-danger)" }}>{alertItem.currentStock}</strong> / {alertItem.reorderLevel}</span>
                                                </div>
                                            </div>
                                            
                                            {!isMainWarehouse && (
                                                <button 
                                                    className="inv-action-btn-primary" 
                                                    style={{ padding: "6px 12px", fontSize: 11, borderRadius: "var(--radius-sm)" }}
                                                    onClick={() => handleQuickRequest(alertItem)}
                                                >
                                                    Quick Request
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 2. Visual Timeline Tracker Panel */}
                        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-card)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Clock style={{ color: "var(--primary)" }} size={20} />
                                    <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Visual Request timeline</h2>
                                </div>
                                {indents.length > 0 && (
                                    <select 
                                        className="inv-toolbar-select" 
                                        style={{ padding: "4px 8px", fontSize: 12, height: "auto" }}
                                        value={trackedIndentId}
                                        onChange={(e) => setTrackedIndentId(e.target.value)}
                                    >
                                        {indents.map(i => (
                                            <option key={i.id} value={i.id}>{i.id} - {i.productName.substring(0, 15)}...</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {trackedIndent ? (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: 12, marginBottom: 16 }}>
                                        <div>
                                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Target Product</span>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{trackedIndent.productName}</div>
                                            <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--primary)", marginTop: 2 }}>{trackedIndent.sku}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Hub Route</span>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginTop: 2 }}>{trackedIndent.requestedBy.replace("HAATZA ", "")}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>➔ {trackedIndent.requestedTo?.replace("HAATZA ", "") || "Central Warehouse"}</div>
                                        </div>
                                    </div>

                                    {/* Visual timeline nodes */}
                                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative", padding: "0 10px", marginBottom: 24 }}>
                                        {/* Connector Line */}
                                        <div style={{ position: "absolute", left: 20, right: 20, top: 12, height: 4, backgroundColor: "var(--border-color)", zIndex: 0 }} />
                                        <div 
                                            style={{ 
                                                position: "absolute", 
                                                left: 20, 
                                                top: 12, 
                                                height: 4, 
                                                backgroundColor: trackedIndent.status === "Rejected" ? "var(--color-danger)" : "var(--primary)", 
                                                width: `${Math.min(100, (getTimelineStepIndex(trackedIndent.status) / 4) * 100)}%`, 
                                                zIndex: 0,
                                                transition: "width 0.4s ease"
                                            }} 
                                        />

                                        {/* Timeline steps */}
                                        {[
                                            { label: "Created", statuses: ["Pending", "Approved", "Partially Approved", "Dispatched", "Completed"] },
                                            { label: "Approved", statuses: ["Approved", "Partially Approved", "Dispatched", "Completed"] },
                                            { label: "Dispatched", statuses: ["Dispatched", "Completed"] },
                                            { label: "Received", statuses: ["Completed"] }
                                        ].map((step, idx) => {
                                            const isDone = step.statuses.includes(trackedIndent.status) && trackedIndent.status !== "Rejected";
                                            const isCurrent = trackedIndent.status === "Pending" && idx === 0 || 
                                                              (trackedIndent.status === "Approved" || trackedIndent.status === "Partially Approved") && idx === 1 ||
                                                              trackedIndent.status === "Dispatched" && idx === 2 ||
                                                              trackedIndent.status === "Completed" && idx === 3;
                                            
                                            return (
                                                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                                                    <div 
                                                        style={{ 
                                                            width: 26, 
                                                            height: 26, 
                                                            borderRadius: "50%", 
                                                            backgroundColor: isDone ? "var(--primary)" : isCurrent ? "var(--color-warning)" : "var(--bg-card)",
                                                            border: `3px solid ${isDone ? "var(--primary-light)" : isCurrent ? "var(--color-warning-light)" : "var(--border-color)"}`,
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            justifyContent: "center",
                                                            color: isDone ? "var(--text-inverse)" : "var(--text-muted)",
                                                            fontWeight: "bold",
                                                            fontSize: 10,
                                                            boxShadow: isCurrent ? "0 0 10px rgba(245, 158, 11, 0.4)" : "none"
                                                        }}
                                                    >
                                                        {isDone ? "✓" : idx + 1}
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: isCurrent || isDone ? "700" : "500", color: isDone ? "var(--text-main)" : isCurrent ? "var(--color-warning)" : "var(--text-muted)", marginTop: 8 }}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* timeline status alert if rejected */}
                                    {trackedIndent.status === "Rejected" && (
                                        <div style={{ backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", padding: 12, borderRadius: "var(--radius-md)", display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                                            <XCircle size={16} />
                                            <span style={{ fontSize: 12, fontWeight: 700 }}>This stock request was REJECTED by the central warehouse.</span>
                                        </div>
                                    )}

                                    {/* Timeline Details audit feed */}
                                    <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, border: "1px solid var(--border-color)", padding: 12, borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-app)" }}>
                                        {trackedIndent.history.slice().reverse().map((h, i) => (
                                            <div key={i} style={{ borderBottom: i < trackedIndent.history.length - 1 ? "1px solid var(--border-color)" : "none", paddingBottom: 8, lastChild: { borderBottom: "none", paddingBottom: 0 } }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                                                    <strong style={{ color: "var(--text-main)" }}>{h.status}</strong>
                                                    <span style={{ color: "var(--text-muted)" }}>{h.date}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Action by: {h.user}</div>
                                                {h.remarks && (
                                                    <div style={{ fontSize: 11.5, color: "var(--text-main)", marginTop: 4, fontStyle: "italic" }}>
                                                        "{h.remarks}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "48px 12px" }}>
                                    <ClipboardList style={{ color: "var(--border-color)", margin: "0 auto 12px" }} size={32} />
                                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No stock requests available for tracking.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TAB 2: STOCK REQUESTS REGISTRY ────────────────────────────── */}
            {(activeTab === "registry" || activeTab === "list") && (
                <div className="inv-table-card" style={{ marginTop: 12 }}>
                    
                    {/* Search & Filter Toolbar */}
                    <div className="inv-toolbar">
                        <div className="inv-tabs">
                            {["All", "Pending", "Approved", "Dispatched", "Completed", "Rejected"].map(status => (
                                <button
                                    key={status}
                                    className={`inv-tab ${statusFilter === status ? "inv-tab--active" : ""}`}
                                    onClick={() => {
                                        if (status === "All") {
                                            setSearchParams({ tab: activeTab });
                                        } else {
                                            setSearchParams({ tab: activeTab, status });
                                        }
                                        setCurrentPage(1);
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <div className="inv-toolbar__actions">
                            <div className="inv-search-wrap">
                                <Search size={14} className="inv-search-icon" />
                                <input 
                                    type="text" 
                                    className="inv-search" 
                                    placeholder="Search request ID, product, SKU..." 
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>

                            {/* Priority Select */}
                            <select 
                                className="inv-toolbar-select" 
                                value={priorityFilter}
                                onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="All">All Priorities</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>

                            {/* Warehouse Select (Main Warehouse users only) */}
                            {isMainWarehouse && (
                                <select 
                                    className="inv-toolbar-select" 
                                    value={warehouseFilter}
                                    onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All Warehouses</option>
                                    {uniqueWarehouses.filter(w => w !== "All").map(w => (
                                        <option key={w} value={w}>{w.replace("HAATZA ", "")}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Registry Table */}
                    <div className="inv-table-responsive">
                        <table className="inv-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Product Details</th>
                                    <th>Hub / Warehouse</th>
                                    <th style={{ textAlign: "center" }}>Qty (Req / App)</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Requested Date</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedIndents.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="inv-empty">
                                            <Package size={36} className="inv-empty__icon" />
                                            <p>No indent stock requests found matching search filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedIndents.map(indent => (
                                        <tr key={indent.id}>
                                            <td className="inv-td--sku" style={{ color: "var(--text-main)", cursor: "pointer" }} onClick={() => openViewDetails(indent)}>
                                                {indent.id}
                                            </td>
                                            <td>
                                                <div className="inv-td--name">{indent.productName}</div>
                                                <div className="inv-td--sku">{indent.sku}</div>
                                            </td>
                                            <td className="inv-td--warehouse">{indent.requestedBy}</td>
                                            <td style={{ textAlign: "center", fontWeight: "700" }}>
                                                <span>{indent.requestedQty}</span>
                                                <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>/</span>
                                                <span style={{ color: indent.approvedQty > 0 ? "var(--primary)" : "var(--text-muted)" }}>
                                                    {indent.approvedQty || "-"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`inv-pill ${getStatusPillClass(indent.status)}`}>
                                                    {indent.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`inv-pill ${getPriorityClass(indent.priority)}`}>
                                                    {indent.priority}
                                                </span>
                                            </td>
                                            <td className="inv-td--date">{indent.requestedDate}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div className="inv-actions-cell">
                                                    <button 
                                                        className="inv-row-action-btn" 
                                                        title="Track Timeline"
                                                        onClick={() => {
                                                            setTrackedIndentId(indent.id);
                                                            setSearchParams({ tab: "dashboard" });
                                                        }}
                                                    >
                                                        <Clock size={13} />
                                                    </button>
                                                    <button 
                                                        className="inv-row-action-btn" 
                                                        title="View Details"
                                                        onClick={() => openViewDetails(indent)}
                                                    >
                                                        <Eye size={13} />
                                                    </button>

                                                    {/* Approve/Reject triggers (Main Warehouse / Admin only) */}
                                                    {isMainWarehouse && indent.status === "Pending" && (
                                                        <button 
                                                            className="inv-action-inline-btn inv-action-inline-btn--success"
                                                            onClick={() => openApproveModal(indent)}
                                                        >
                                                            Approve
                                                        </button>
                                                    )}

                                                    {/* Dispatch trigger (Main Warehouse / Admin only) */}
                                                    {isMainWarehouse && (indent.status === "Approved" || indent.status === "Partially Approved") && (
                                                        <button 
                                                            className="inv-action-inline-btn inv-action-inline-btn--warning"
                                                            onClick={() => openDispatchModal(indent)}
                                                        >
                                                            <Truck size={12} style={{ marginRight: 4, display: "inline" }} />
                                                            Dispatch
                                                        </button>
                                                    )}

                                                    {/* Receive trigger (Dark House / regional hub users only, matches own hub) */}
                                                    {!isMainWarehouse && indent.status === "Dispatched" && indent.requestedBy === selectedWarehouseName && (
                                                        <button 
                                                            className="inv-action-inline-btn inv-action-inline-btn--success"
                                                            onClick={() => openReceiveModal(indent)}
                                                        >
                                                            Receive Stock
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredIndents.length > ROWS_PER_PAGE && (
                        <div className="inv-pagination">
                            <span className="inv-pagination__info">
                                Showing <strong>{Math.min(filteredIndents.length, (currentPage - 1) * ROWS_PER_PAGE + 1)}</strong> to <strong>{Math.min(filteredIndents.length, currentPage * ROWS_PER_PAGE)}</strong> of <strong>{filteredIndents.length}</strong> entries
                            </span>
                            <div className="inv-pagination__controls">
                                <button 
                                    className="inv-page-btn" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: Math.ceil(filteredIndents.length / ROWS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page} 
                                        className={`inv-page-btn ${currentPage === page ? "inv-page-num--active" : ""}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button 
                                    className="inv-page-btn" 
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredIndents.length / ROWS_PER_PAGE), p + 1))}
                                    disabled={currentPage === Math.ceil(filteredIndents.length / ROWS_PER_PAGE)}
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── TAB: CREATE INDENT (INLINE VIEW) ────────────────────────── */}
            {activeTab === "create" && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 28, boxShadow: "var(--shadow-card)", width: "100%", maxWidth: "680px" }}>
                        <form onSubmit={handleCreateRequestSubmit}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px 0" }}>Create Replacement Indent</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px 0" }}>Replenish local inventory by requesting stock from HAATZA Central Warehouse.</p>
                            
                            <div className="inv-modal-form" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label htmlFor="productSelect" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Select Product</label>
                                    <select 
                                        id="productSelect" 
                                        value={selectedProductSku}
                                        onChange={(e) => setSelectedProductSku(e.target.value)}
                                        required
                                        className="styled-select"
                                        style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: 14 }}
                                    >
                                        {warehouseStock.map(p => (
                                            <option key={p.sku} value={p.sku}>{p.product}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Product SKU</label>
                                        <input type="text" value={selectedProductSku} disabled style={{ backgroundColor: "var(--bg-app)", fontFamily: "monospace", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", width: "100%", boxSizing: "border-box" }} />
                                    </div>
                                    <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Your Hub Available Stock</label>
                                        <input 
                                            type="text" 
                                            value={`${currentHubQty} units`} 
                                            disabled 
                                            style={{ 
                                                backgroundColor: "var(--bg-app)", 
                                                fontWeight: "600",
                                                color: currentHubQty <= 15 ? "var(--color-danger)" : "var(--text-main)",
                                                padding: "10px 14px",
                                                border: "1px solid var(--border-color)",
                                                borderRadius: "var(--radius-md)",
                                                width: "100%",
                                                boxSizing: "border-box"
                                            }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
                                    <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <label htmlFor="reqQty" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Required Quantity</label>
                                        <div className="adjust-number-input" style={{ position: "relative" }}>
                                            <input 
                                                type="number" 
                                                id="reqQty" 
                                                value={requestedQty}
                                                onChange={(e) => setRequestedQty(e.target.value)}
                                                placeholder="Enter quantity"
                                                required 
                                                min="1" 
                                                style={{ padding: "10px 60px 10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", width: "100%", boxSizing: "border-box", fontSize: 13 }}
                                            />
                                            <span className="unit-label" style={{ position: "absolute", right: 14, top: 12, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>units</span>
                                        </div>
                                    </div>
                                    <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <label htmlFor="prioritySelect" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Priority Level</label>
                                        <select 
                                            id="prioritySelect" 
                                            value={requestPriority} 
                                            onChange={(e) => setRequestPriority(e.target.value)}
                                            className="styled-select"
                                            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-main)", fontSize: 14 }}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="inv-form-group" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <label htmlFor="reqRemarks" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Remarks / Notes</label>
                                    <textarea 
                                        id="reqRemarks"
                                        style={{ height: 80, padding: "10px 14px", resize: "none", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 13 }}
                                        placeholder="Add reasons or special instructions..."
                                        value={requestRemarks}
                                        onChange={(e) => setRequestRemarks(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                                <button type="button" className="inv-modal-cancel-btn" onClick={() => setSearchParams({ tab: "list" })} style={{ padding: "10px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "transparent", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" className="inv-action-btn-primary" style={{ padding: "10px 18px", borderRadius: "var(--radius-md)", border: "none", background: "var(--primary)", color: "var(--text-inverse)", fontWeight: 700, cursor: "pointer" }}>Create Indent</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── TAB: INDENT DETAILS (INLINE VIEW) ────────────────────────── */}
            {activeTab === "details" && (
                <div style={{ marginTop: 12 }}>
                    {trackedIndent ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 24, alignItems: "start" }}>
                            {/* Left Side: General details */}
                            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 16 }}>
                                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Indent Details</h2>
                                        <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--primary)", fontWeight: 700 }}>{trackedIndent.id}</span>
                                    </div>
                                    <span className={`inv-pill ${getStatusPillClass(trackedIndent.status)}`} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                        {trackedIndent.status}
                                    </span>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Product Name</span>
                                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{trackedIndent.productName}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>SKU</span>
                                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--text-main)" }}>{trackedIndent.sku}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Requested By</span>
                                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{trackedIndent.requestedBy}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Priority</span>
                                        <span className={`inv-pill ${getPriorityClass(trackedIndent.priority)}`} style={{ display: "inline-block", marginTop: 4 }}>
                                            {trackedIndent.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Requested Qty</span>
                                        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>{trackedIndent.requestedQty} units</span>
                                    </div>
                                    <div>
                                        <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>Approved Qty</span>
                                        <span style={{ fontWeight: 700, color: "var(--primary)" }}>{trackedIndent.approvedQty || "-"} units</span>
                                    </div>
                                </div>

                                {trackedIndent.vehicleNumber && (
                                    <div style={{ backgroundColor: "var(--bg-app)", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 8 }}>
                                        <h4 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Logistics Dispatch Handoff</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                                            <div>
                                                <span style={{ display: "block", color: "var(--text-muted)", fontSize: 11 }}>Vehicle</span>
                                                <strong style={{ fontFamily: "monospace" }}>{trackedIndent.vehicleNumber}</strong>
                                            </div>
                                            <div>
                                                <span style={{ display: "block", color: "var(--text-muted)", fontSize: 11 }}>Driver Name</span>
                                                <strong>{trackedIndent.driverName}</strong>
                                            </div>
                                        </div>
                                        {trackedIndent.dispatchRemarks && (
                                            <div style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--text-main)", borderTop: "1px dashed var(--border-color)", paddingTop: 6, marginTop: 4 }}>
                                                "{trackedIndent.dispatchRemarks}"
                                            </div>
                                        )}
                                    </div>
                                )}

                                {trackedIndent.status === "Completed" && (
                                    <div style={{ backgroundColor: "#ecfdf5", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid #a7f3d0", display: "flex", flexDirection: "column", gap: 8 }}>
                                        <h4 style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#065f46", textTransform: "uppercase" }}>Reception Verification</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                                            <div>
                                                <span style={{ display: "block", color: "#047857", fontSize: 11 }}>Received Qty</span>
                                                <strong style={{ color: "#065f46" }}>{trackedIndent.receivedQty} units</strong>
                                            </div>
                                            <div>
                                                <span style={{ display: "block", color: "#047857", fontSize: 11 }}>Damaged Qty</span>
                                                <strong style={{ color: trackedIndent.damagedQty > 0 ? "var(--color-danger)" : "#065f46" }}>{trackedIndent.damagedQty || 0} units</strong>
                                            </div>
                                        </div>
                                        {trackedIndent.receiveRemarks && (
                                            <div style={{ fontSize: 11.5, fontStyle: "italic", color: "#065f46", borderTop: "1px dashed #a7f3d0", paddingTop: 6, marginTop: 4 }}>
                                                "{trackedIndent.receiveRemarks}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Timeline audit */}
                            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-card)" }}>
                                <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border-color)", paddingBottom: 10 }}>
                                    Audit History Pipeline
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingLeft: 6 }}>
                                    {trackedIndent.history.map((h, i) => (
                                        <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                                            {i < trackedIndent.history.length - 1 && (
                                                <div style={{ position: "absolute", left: 7, top: 16, bottom: -12, width: 2, backgroundColor: "var(--border-color)" }} />
                                            )}
                                            <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "var(--primary-light)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginTop: 2 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>{h.status}</span>
                                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{h.date}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>By: {h.user}</div>
                                                {h.remarks && (
                                                    <div style={{ fontSize: 12, color: "var(--text-main)", backgroundColor: "var(--bg-app)", padding: "8px 12px", borderRadius: 8, marginTop: 6, fontStyle: "italic", border: "1px solid var(--border-color)" }}>
                                                        "{h.remarks}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "48px 12px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                            <ClipboardList style={{ color: "var(--border-color)", margin: "0 auto 12px" }} size={40} />
                            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>No stock requests selected. Please select a request from the List tab to inspect its details.</span>
                            <div style={{ marginTop: 16 }}>
                                <button className="inv-action-btn-primary" onClick={() => setSearchParams({ tab: "list" })}>Go to Indent List</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── TAB 3: TRANSACTION LEDGER ───────────────────────────────── */}
            {activeTab === "ledger" && (
                <div className="inv-table-card" style={{ marginTop: 12 }}>
                    <div style={{ padding: "18px 24px 0 24px" }}>
                        <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>Inventory transaction history ledger</h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
                            Comprehensive logs recording atomic stock transfers, approvals, dispatches, and receptions across the HAATZA system.
                        </p>
                    </div>

                    <div className="inv-table-responsive" style={{ marginTop: 12 }}>
                        <table className="inv-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Event Type</th>
                                    <th>Location / Hub</th>
                                    <th>Product Details</th>
                                    <th style={{ textAlign: "center" }}>Qty Moved</th>
                                    <th>Stock Delta</th>
                                    <th>Logged By</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="inv-empty">
                                            <Package size={36} className="inv-empty__icon" />
                                            <p>No transaction log records found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(txn => {
                                        const isAddition = txn.type === "Received";
                                        const isSubduction = txn.type === "Dispatched";
                                        
                                        return (
                                            <tr key={txn.transactionId}>
                                                <td className="inv-td--sku" style={{ color: "var(--text-main)" }}>
                                                    {txn.transactionId}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {isAddition && <Plus size={12} style={{ color: "var(--color-success)" }} />}
                                                        {isSubduction && <XCircle size={12} style={{ color: "var(--color-danger)" }} />}
                                                        {!isAddition && !isSubduction && <Info size={12} style={{ color: "var(--color-info)" }} />}
                                                        <span style={{ fontSize: 12, fontWeight: "600" }}>{txn.type}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: 12.5 }}>{txn.warehouse}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{txn.productName}</div>
                                                    <div className="inv-td--sku">{txn.sku}</div>
                                                </td>
                                                <td style={{ textAlign: "center", fontWeight: 700, color: isAddition ? "var(--color-success)" : isSubduction ? "var(--color-danger)" : "var(--text-main)" }}>
                                                    {txn.quantity > 0 ? (isAddition ? `+${txn.quantity}` : isSubduction ? `-${txn.quantity}` : txn.quantity) : "-"}
                                                </td>
                                                <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                                                    {isAddition || isSubduction ? (
                                                        <span>{txn.prevStock} ➔ <strong style={{ color: "var(--primary)" }}>{txn.newStock}</strong></span>
                                                    ) : (
                                                        <span style={{ color: "var(--text-muted)" }}>No stock change</span>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{txn.user}</td>
                                                <td className="inv-td--date">{txn.timestamp}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── TRANSACTION MODAL REGISTRY ────────────────────────────────── */}
            {isModalOpen && (
                <div className="inv-modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="inv-modal-container" onClick={(e) => e.stopPropagation()}>
                        
                        {/* A. Create Request Modal */}
                        {modalType === "create" && (
                            <form onSubmit={handleCreateRequestSubmit}>
                                <div className="inv-modal-header">
                                    <div className="inv-modal-header__icon-wrap">
                                        <Plus size={18} />
                                    </div>
                                    <div className="inv-modal-header__text-block">
                                        <span className="inv-modal-title">Create Replacement Indent</span>
                                        <span className="inv-modal-subtitle">Replenish Local Inventory</span>
                                    </div>
                                </div>
                                <div className="inv-modal-body">
                                    <div className="inv-modal-form">
                                        
                                        <div className="inv-form-group">
                                            <label htmlFor="productSelect">Select Product</label>
                                            <select 
                                                id="productSelect" 
                                                value={selectedProductSku}
                                                onChange={(e) => setSelectedProductSku(e.target.value)}
                                                required
                                            >
                                                {warehouseStock.map(p => (
                                                    <option key={p.sku} value={p.sku}>{p.product}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label>Product SKU</label>
                                                <input type="text" value={selectedProductSku} disabled style={{ backgroundColor: "var(--bg-app)", fontFamily: "monospace" }} />
                                            </div>
                                            <div className="inv-form-group">
                                                <label>Your Hub Available Stock</label>
                                                <input 
                                                    type="text" 
                                                    value={`${currentHubQty} units`} 
                                                    disabled 
                                                    style={{ 
                                                        backgroundColor: "var(--bg-app)", 
                                                        fontWeight: "600",
                                                        color: currentHubQty <= 15 ? "var(--color-warning)" : "var(--text-main)" 
                                                    }} 
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label htmlFor="reqQty">Required Quantity</label>
                                                <div className="adjust-number-input">
                                                    <input 
                                                        type="number" 
                                                        id="reqQty" 
                                                        value={requestedQty}
                                                        onChange={(e) => setRequestedQty(e.target.value)}
                                                        placeholder="Enter quantity"
                                                        required 
                                                        min="1" 
                                                    />
                                                    <span className="unit-label">units</span>
                                                </div>
                                            </div>
                                            <div className="inv-form-group">
                                                <label htmlFor="prioritySelect">Priority Level</label>
                                                <select 
                                                    id="prioritySelect" 
                                                    value={requestPriority} 
                                                    onChange={(e) => setRequestPriority(e.target.value)}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                    <option value="Urgent">Urgent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="inv-form-group">
                                            <label htmlFor="reqRemarks">Remarks / Notes</label>
                                            <textarea 
                                                id="reqRemarks"
                                                className="inv-form-group select"
                                                style={{ height: 60, padding: "10px 14px", resize: "none" }}
                                                placeholder="Add reasons or special instructions..."
                                                value={requestRemarks}
                                                onChange={(e) => setRequestRemarks(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="inv-modal-footer">
                                    <button type="button" className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="inv-modal-submit-btn">Create Indent</button>
                                </div>
                            </form>
                        )}

                        {/* B. View Details Modal */}
                        {modalType === "view" && selectedIndent && (
                            <>
                                <div className="inv-modal-header">
                                    <div className="inv-modal-header__icon-wrap">
                                        <ClipboardList size={18} />
                                    </div>
                                    <div className="inv-modal-header__text-block">
                                        <span className="inv-modal-title">Stock Request Details</span>
                                        <span className="inv-modal-subtitle">{selectedIndent.id}</span>
                                    </div>
                                </div>
                                <div className="inv-modal-body">
                                    <div className="inv-details-sheet" style={{ marginBottom: 20 }}>
                                        <div className="details-row">
                                            <span className="details-label">Product Name</span>
                                            <span className="details-val">{selectedIndent.productName}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">SKU</span>
                                            <span className="details-val" style={{ fontFamily: "monospace" }}>{selectedIndent.sku}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Requesting Warehouse</span>
                                            <span className="details-val">{selectedIndent.requestedBy}</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Requested Qty</span>
                                            <span className="details-val bold">{selectedIndent.requestedQty} units</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Approved Qty</span>
                                            <span className="details-val">{selectedIndent.approvedQty || "-"} units</span>
                                        </div>
                                        <div className="details-row">
                                            <span className="details-label">Status</span>
                                            <span className="details-val">
                                                <span className={`inv-pill ${getStatusPillClass(selectedIndent.status)}`}>
                                                    {selectedIndent.status}
                                                </span>
                                            </span>
                                        </div>
                                        
                                        {/* Dispatch and Receive additions */}
                                        {selectedIndent.vehicleNumber && (
                                            <>
                                                <div className="details-row">
                                                    <span className="details-label">Vehicle & Driver</span>
                                                    <span className="details-val">{selectedIndent.vehicleNumber} ({selectedIndent.driverName})</span>
                                                </div>
                                                <div className="details-row">
                                                    <span className="details-label">Dispatch Notes</span>
                                                    <span className="details-val" style={{ fontSize: 12 }}>"{selectedIndent.dispatchRemarks || "-"}"</span>
                                                </div>
                                            </>
                                        )}

                                        {selectedIndent.status === "Completed" && (
                                            <>
                                                <div className="details-row">
                                                    <span className="details-label">Received vs Damaged</span>
                                                    <span className="details-val" style={{ color: "var(--color-success)" }}>
                                                        {selectedIndent.receivedQty} received
                                                        {selectedIndent.damagedQty > 0 && <span style={{ color: "var(--color-danger)", marginLeft: 6 }}>({selectedIndent.damagedQty} damaged)</span>}
                                                    </span>
                                                </div>
                                                <div className="details-row">
                                                    <span className="details-label">Reception Notes</span>
                                                    <span className="details-val" style={{ fontSize: 12 }}>"{selectedIndent.receiveRemarks || "-"}"</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Timeline */}
                                    <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Audit History Pipeline
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        {selectedIndent.history.map((h, i) => (
                                            <div key={i} style={{ display: "flex", gap: 10, position: "relative" }}>
                                                {i < selectedIndent.history.length - 1 && (
                                                    <div style={{ position: "absolute", left: 7, top: 16, bottom: -12, width: 2, backgroundColor: "var(--border-color)" }} />
                                                )}
                                                <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "var(--primary-light)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, marginTop: 2 }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-main)" }}>{h.status}</span>
                                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{h.date}</span>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>By: {h.user}</div>
                                                    {h.remarks && (
                                                        <div style={{ fontSize: 12, color: "var(--text-main)", backgroundColor: "var(--bg-app)", padding: "6px 10px", borderRadius: 6, marginTop: 4, fontStyle: "italic" }}>
                                                            "{h.remarks}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="inv-modal-footer">
                                    <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Close Details</button>
                                </div>
                            </>
                        )}

                        {/* C. Approve Request Modal */}
                        {modalType === "approve" && selectedIndent && (
                            <form onSubmit={handleApproveSubmit}>
                                <div className="inv-modal-header">
                                    <div className="inv-modal-header__icon-wrap" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" }}>
                                        <Check size={18} />
                                    </div>
                                    <div className="inv-modal-header__text-block">
                                        <span className="inv-modal-title">Approve Replacement Indent</span>
                                        <span className="inv-modal-subtitle">{selectedIndent.id}</span>
                                    </div>
                                </div>
                                <div className="inv-modal-body">
                                    <div className="inv-modal-form">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label>Product</label>
                                                <input type="text" value={selectedIndent.productName} disabled style={{ backgroundColor: "var(--bg-app)" }} />
                                            </div>
                                            <div className="inv-form-group">
                                                <label>SKU</label>
                                                <input type="text" value={selectedIndent.sku} disabled style={{ backgroundColor: "var(--bg-app)" }} />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label>Requested Qty</label>
                                                <input type="text" value={`${selectedIndent.requestedQty} units`} disabled style={{ backgroundColor: "var(--bg-app)" }} />
                                            </div>
                                            <div className="inv-form-group">
                                                <label>Warehouse Sourced Stock</label>
                                                <input 
                                                    type="text" 
                                                    value={`${sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock} units${sourcedFrom ? ' (Sourced: ' + sourcedFrom.replace("HAATZA ", "") + ')' : ' (' + selectedIndent.requestedTo.replace("HAATZA ", "") + ')'}`} 
                                                    disabled 
                                                    style={{ 
                                                        backgroundColor: "var(--bg-app)",
                                                        fontWeight: "bold",
                                                        color: (sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock) === 0 ? "var(--color-danger)" : (sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock) < selectedIndent.requestedQty ? "var(--color-warning)" : "var(--color-success)"
                                                    }} 
                                                />
                                            </div>
                                        </div>

                                        <div className="inv-form-group">
                                            <label htmlFor="approvedQty">Approved Quantity</label>
                                            <div className="adjust-number-input">
                                                <input 
                                                    type="number" 
                                                    id="approvedQty" 
                                                    value={approvedQty}
                                                    onChange={(e) => setApprovedQty(parseInt(e.target.value) || "")}
                                                    required 
                                                    min="1" 
                                                    max={sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock}
                                                />
                                                <span className="unit-label">units</span>
                                            </div>
                                            {(sourcedFrom ? (recommendation?.availableStock ?? 0) : availableMainStock) < selectedIndent.requestedQty && (
                                                <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--color-warning)", marginTop: 4 }}>
                                                    <AlertTriangle size={12} />
                                                    <span style={{ fontSize: 11, fontWeight: 600 }}>Warehouse stock is lower than requested quantity!</span>
                                                </div>
                                            )}
                                        </div>

                                        {recommendation && (recommendation.status === "recommend_fallback" || recommendation.status === "insufficient_but_better") && (
                                            <div style={{ 
                                                gridColumn: "span 2",
                                                backgroundColor: "rgba(59, 130, 246, 0.05)", 
                                                border: "1.5px dashed var(--primary)", 
                                                borderRadius: "var(--radius-md)", 
                                                padding: 12, 
                                                marginTop: 4,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 6,
                                                textAlign: "left"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--primary)", fontWeight: "bold", fontSize: 12 }}>
                                                    <TrendingUp size={14} />
                                                    <span>Fulfillment Recommendation:</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-main)", lineHeight: 1.4 }}>
                                                     {recommendation.message}
                                                </p>
                                                {sourcedFrom !== recommendation.sourceWarehouse && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSourcedFrom(recommendation.sourceWarehouse);
                                                            setApprovedQty(Math.min(selectedIndent.requestedQty, recommendation.availableStock));
                                                            showToast(`Applied: Source from fallback ${recommendation.sourceWarehouse}`);
                                                        }}
                                                        className="inv-action-btn-primary"
                                                        style={{ 
                                                            padding: "6px 10px", 
                                                            fontSize: 11, 
                                                            borderRadius: "4px", 
                                                            alignSelf: "flex-start", 
                                                            marginTop: 4,
                                                            background: "var(--primary)",
                                                            color: "#fff",
                                                            border: "none",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        Reroute to Fallback Warehouse
                                                    </button>
                                                )}
                                                {sourcedFrom === recommendation.sourceWarehouse && (
                                                    <div style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--color-success)", fontSize: 11.5, fontWeight: "bold", marginTop: 4 }}>
                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                        <span>Sourcing set to: {recommendation.sourceWarehouse}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="inv-form-group">
                                            <label htmlFor="approvalRemarks">Remarks (Optional)</label>
                                            <textarea 
                                                id="approvalRemarks"
                                                className="inv-form-group select"
                                                style={{ height: 60, padding: "10px 14px", resize: "none" }}
                                                placeholder="Enter comments or adjustment remarks..."
                                                value={approvalRemarks}
                                                onChange={(e) => setApprovalRemarks(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="inv-modal-footer">
                                    <button 
                                        type="button" 
                                        className="inv-modal-cancel-btn" 
                                        style={{ marginRight: "auto", border: "1px solid var(--color-danger)", color: "var(--color-danger)" }}
                                        onClick={handleRejectClick}
                                    >
                                        Reject Request
                                    </button>
                                    <button type="button" className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="inv-modal-submit-btn">Submit Approval</button>
                                </div>
                            </form>
                        )}

                        {/* D. Dispatch Request Modal */}
                        {modalType === "dispatch" && selectedIndent && (
                            <form onSubmit={handleDispatchSubmit}>
                                <div className="inv-modal-header">
                                    <div className="inv-modal-header__icon-wrap" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", color: "rgb(139, 92, 246)" }}>
                                        <Truck size={18} />
                                    </div>
                                    <div className="inv-modal-header__text-block">
                                        <span className="inv-modal-title">Dispatch Stock Allocation</span>
                                        <span className="inv-modal-subtitle">{selectedIndent.id}</span>
                                    </div>
                                </div>
                                <div className="inv-modal-body">
                                    <div className="inv-modal-form">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label>Product</label>
                                                <input type="text" value={selectedIndent.productName} disabled style={{ backgroundColor: "var(--bg-app)" }} />
                                            </div>
                                            <div className="inv-form-group">
                                                <label>Approved Qty</label>
                                                <input type="text" value={`${selectedIndent.approvedQty} units`} disabled style={{ backgroundColor: "var(--bg-app)", fontWeight: "bold" }} />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label htmlFor="vehicleNumber">Vehicle Number</label>
                                                <input 
                                                    type="text" 
                                                    id="vehicleNumber" 
                                                    placeholder="e.g. KA-03-HA-8821" 
                                                    value={vehicleNumber}
                                                    onChange={(e) => setVehicleNumber(e.target.value)}
                                                    required 
                                                />
                                            </div>
                                            <div className="inv-form-group">
                                                <label htmlFor="driverName">Driver Name</label>
                                                <input 
                                                    type="text" 
                                                    id="driverName" 
                                                    placeholder="e.g. Ramesh Kumar" 
                                                    value={driverName}
                                                    onChange={(e) => setDriverName(e.target.value)}
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div className="inv-form-group">
                                            <label htmlFor="dispatchRemarks">Dispatch Notes</label>
                                            <textarea 
                                                id="dispatchRemarks"
                                                className="inv-form-group select"
                                                style={{ height: 60, padding: "10px 14px", resize: "none" }}
                                                placeholder="Remarks on vehicle route or details..."
                                                value={dispatchRemarks}
                                                onChange={(e) => setDispatchRemarks(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="inv-modal-footer">
                                    <button type="button" className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="inv-modal-submit-btn" style={{ backgroundColor: "rgb(139, 92, 246)" }}>Dispatch Stock</button>
                                </div>
                            </form>
                        )}

                        {/* E. Receive Request Modal */}
                        {modalType === "receive" && selectedIndent && (
                            <form onSubmit={handleReceiveSubmit}>
                                <div className="inv-modal-header">
                                    <div className="inv-modal-header__icon-wrap" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "rgb(16, 185, 129)" }}>
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="inv-modal-header__text-block">
                                        <span className="inv-modal-title">Receive Stock replenishment</span>
                                        <span className="inv-modal-subtitle">{selectedIndent.id}</span>
                                    </div>
                                </div>
                                <div className="inv-modal-body">
                                    <div className="inv-modal-form">
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label>Product</label>
                                                <input type="text" value={selectedIndent.productName} disabled style={{ backgroundColor: "var(--bg-app)" }} />
                                            </div>
                                            <div className="inv-form-group">
                                                <label>Dispatched Qty</label>
                                                <input type="text" value={`${selectedIndent.approvedQty} units`} disabled style={{ backgroundColor: "var(--bg-app)", fontWeight: "bold" }} />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            <div className="inv-form-group">
                                                <label htmlFor="receivedQty">Received Quantity</label>
                                                <div className="adjust-number-input">
                                                    <input 
                                                        type="number" 
                                                        id="receivedQty" 
                                                        value={receivedQty}
                                                        onChange={(e) => setReceivedQty(parseInt(e.target.value) || "")}
                                                        required 
                                                        min="0" 
                                                    />
                                                    <span className="unit-label">units</span>
                                                </div>
                                            </div>
                                            <div className="inv-form-group">
                                                <label htmlFor="damagedQty">Damaged Quantity</label>
                                                <div className="adjust-number-input">
                                                    <input 
                                                        type="number" 
                                                        id="damagedQty" 
                                                        value={damagedQty}
                                                        onChange={(e) => setDamagedQty(e.target.value)}
                                                        required 
                                                        min="0" 
                                                    />
                                                    <span className="unit-label" style={{ color: "var(--color-danger)" }}>units</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="inv-form-group">
                                            <label htmlFor="receiveRemarks">Receive Remarks</label>
                                            <textarea 
                                                id="receiveRemarks"
                                                className="inv-form-group select"
                                                style={{ height: 60, padding: "10px 14px", resize: "none" }}
                                                placeholder="Verification comments (temp records, damages comments)..."
                                                value={receiveRemarks}
                                                onChange={(e) => setReceiveRemarks(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="inv-modal-footer">
                                    <button type="button" className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="inv-modal-submit-btn" style={{ backgroundColor: "rgb(16, 185, 129)" }}>Confirm Receipt</button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}

            {/* Success Toast */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
                    <CheckCircle className="text-emerald-400" size={18} />
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

export default IndentPage;
