import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    Search, 
    Filter, 
    ArrowDownToLine, 
    CheckCircle, 
    AlertCircle, 
    Clock, 
    Calendar, 
    ClipboardList,
    Printer,
    FileText,
    TrendingUp,
    ShieldAlert,
    History
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import "./Receiving.css";

import { getIndents, processReceivingVerification } from "../../services/indentService";
import "./Receiving.css";

const BINS_LIST = ["BIN-A01", "BIN-A02", "BIN-A03", "BIN-A04", "BIN-A12", "BIN-A15", "BIN-B01", "BIN-B02", "BIN-B03", "BIN-B09", "BIN-C01", "BIN-C02"];

function ReceivingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const activeTab = searchParams.get("tab") || "pending";
    
    // Core Databases States
    const [indentsList, setIndentsList] = useState(() => getIndents());

    const refreshData = () => {
        setIndentsList(getIndents());
    };

    const pendingReceipts = useMemo(() => {
        return indentsList
            .filter(i => i.status === "Dispatched" || i.status === "In Transit")
            .map(i => ({
                id: i.id,
                poNumber: i.grnNumber || `DSP-${i.id.replace("IND-", "")}`,
                supplier: i.requestedTo,
                origin: i.requestedTo,
                expectedDate: new Date(i.expectedDeliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                itemsCount: 1,
                totalQty: i.approvedQty,
                status: i.status,
                items: [
                    { id: i.id, productName: i.productName + ` (${i.sku})`, expectedQty: i.approvedQty, unit: i.uom }
                ],
                indent: i
            }));
    }, [indentsList]);

    const receiptHistory = useMemo(() => {
        return indentsList
            .filter(i => ["Closed", "Exception Closed", "Damaged", "Short Received", "GRN Completed"].includes(i.status))
            .map(i => {
                const totalReceived = i.receivedQty || 0;
                return {
                    grnNumber: i.grnNumber || `GRN-${i.id.replace("IND-", "")}`,
                    poNumber: `DSP-${i.id.replace("IND-", "")}`,
                    supplier: i.requestedTo,
                    origin: i.requestedTo,
                    receivedDate: i.grnDate ? new Date(i.grnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
                    receivedBy: i.receivedBy || "System",
                    itemsCount: 1,
                    totalQty: totalReceived,
                    status: "Posted",
                    items: [
                        { id: i.id, productName: i.productName + ` (${i.sku})`, expectedQty: i.approvedQty, receivedQty: totalReceived, qc: i.shortQty > 0 ? "Short Received" : i.damagedQty > 0 ? "Rejected (Damaged)" : "Pass", bin: "BIN-A01" }
                    ]
                };
            });
    }, [indentsList]);
    
    // Active Receiving PO State
    const [activePOId, setActivePOId] = useState(searchParams.get("po") || "");
    const selectedPO = useMemo(() => {
        return pendingReceipts.find(po => po.id === activePOId) || null;
    }, [pendingReceipts, activePOId]);

    // Receive Dispatch form states
    const [receiveItemsData, setReceiveItemsData] = useState({});
    const [unloadingBay, setUnloadingBay] = useState("BAY-1");
    const [vehicleNo, setVehicleNo] = useState("");
    const [tempLoggerReading, setTempLoggerReading] = useState("4.2");

    // Search and Filter states
    const [pendingSearch, setPendingSearch] = useState("");
    const [historySearch, setHistorySearch] = useState("");

    // Initialize/reset receive form when PO changes
    useEffect(() => {
        if (selectedPO) {
            const initialData = {};
            selectedPO.items.forEach(item => {
                initialData[item.id] = {
                    receivedQty: item.expectedQty,
                    bin: BINS_LIST[Math.floor(Math.random() * BINS_LIST.length)],
                    batchNo: "BAT-" + Math.floor(100000 + Math.random() * 900000),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    qc: "Pass"
                };
            });
            setReceiveItemsData(initialData);
            setSearchParams({ tab: "receive", po: selectedPO.id });
        }
    }, [selectedPO, setSearchParams]);

    const handleTabClick = (tab) => {
        if (tab === "receive" && !activePOId && pendingReceipts.length > 0) {
            setActivePOId(pendingReceipts[0].id);
            setSearchParams({ tab, po: pendingReceipts[0].id });
        } else if (tab === "receive" && activePOId) {
            setSearchParams({ tab, po: activePOId });
        } else {
            setSearchParams({ tab });
        }
    };

    const handleInitiateReceive = (poId) => {
        setActivePOId(poId);
    };

    const handleItemChange = (itemId, field, value) => {
        setReceiveItemsData(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const handlePostReceipt = () => {
        if (!selectedPO) return;

        // Perform basic validations
        let hasErrors = false;
        Object.keys(receiveItemsData).forEach(id => {
            const data = receiveItemsData[id];
            if (data.receivedQty === "" || parseInt(data.receivedQty) < 0) {
                showToast(`Please enter a valid quantity for all items.`, "error");
                hasErrors = true;
            }
        });

        if (hasErrors) return;

        let recVal = 0;
        let shVal = 0;
        let dmgVal = 0;
        let rejVal = 0;

        selectedPO.items.forEach(item => {
            const formData = receiveItemsData[item.id] || {};
            const rQty = parseInt(formData.receivedQty) || 0;
            const expected = item.expectedQty;
            
            recVal += rQty;
            if (formData.qc === "Pass") {
                if (rQty < expected) {
                    shVal += (expected - rQty);
                }
            } else if (formData.qc === "Rejected (Damaged)") {
                if (rQty < expected) {
                    dmgVal += (expected - rQty);
                }
            } else if (formData.qc === "Rejected (Expired)") {
                if (rQty < expected) {
                    rejVal += (expected - rQty);
                }
            }
        });

        try {
            processReceivingVerification({
                indentId: selectedPO.indent.id,
                receivedQty: recVal,
                shortQty: shVal,
                damagedQty: dmgVal,
                rejectedQty: rejVal,
                remarks: `Bay: ${unloadingBay}. Temp Logger: ${tempLoggerReading}°C. Checked in by Rahul Kumar.`,
                userName: sessionStorage.getItem("username") || "Rahul Kumar",
                attachments: [],
                isOverReceiptApproved: true
            });

            refreshData();

            // Clean active PO state
            setActivePOId("");
            setSearchParams({ tab: "history" });

            showToast(`Goods Receipt Note posted successfully! Inventory allocated to bins.`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    // Filtered Pools
    const filteredPending = useMemo(() => {
        return pendingReceipts.filter(po => 
            po.poNumber.toLowerCase().includes(pendingSearch.toLowerCase()) ||
            po.supplier.toLowerCase().includes(pendingSearch.toLowerCase()) ||
            po.origin.toLowerCase().includes(pendingSearch.toLowerCase())
        );
    }, [pendingReceipts, pendingSearch]);

    const filteredHistory = useMemo(() => {
        return receiptHistory.filter(grn => 
            grn.grnNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
            grn.poNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
            grn.supplier.toLowerCase().includes(historySearch.toLowerCase())
        );
    }, [receiptHistory, historySearch]);

    return (
        <div className="receiving-root fade-in">
            {/* Header section */}
            <div className="receiving-header-block">
                <div className="receiving-header-left">
                    <h1 className="receiving-header-title">Receiving Management</h1>
                    <p className="receiving-header-subtitle">
                        {activeTab === "pending" && "Manage incoming purchase orders and inbound transfers awaiting reception."}
                        {activeTab === "receive" && "Perform inventory unload, bin allocations, batch tagging, and quality checks."}
                        {activeTab === "history" && "Audit previously compiled Goods Receipt Notes (GRN) and inbound logs."}
                    </p>
                </div>
            </div>

            {/* Main stats counters */}
            <div className="receiving-stats-grid">
                <div className="receiving-stat-card">
                    <span className="stat-dot dot-pending" />
                    <div className="stat-card-body">
                        <span className="stat-card-value">{pendingReceipts.length}</span>
                        <span className="stat-card-label">Pending POs</span>
                    </div>
                </div>
                <div className="receiving-stat-card">
                    <span className="stat-dot dot-transit" style={{ backgroundColor: "#3b82f6" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {pendingReceipts.filter(po => po.status === "In Transit").length}
                        </span>
                        <span className="stat-card-label">In Transit</span>
                    </div>
                </div>
                <div className="receiving-stat-card">
                    <span className="stat-dot dot-posted" style={{ backgroundColor: "#10b981" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">{receiptHistory.length}</span>
                        <span className="stat-card-label">Completed Receipts</span>
                    </div>
                </div>
            </div>

            {/* Tabs & Table Panel */}
            <div className="receiving-card">
                <div className="receiving-toolbar">
                    <div className="receiving-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "pending"}
                            className={`receiving-tab ${activeTab === "pending" ? "receiving-tab--active" : ""}`}
                            onClick={() => handleTabClick("pending")}
                        >
                            Pending Receipts
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "receive"}
                            className={`receiving-tab ${activeTab === "receive" ? "receiving-tab--active" : ""}`}
                            onClick={() => handleTabClick("receive")}
                        >
                            Receive Dispatch
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "history"}
                            className={`receiving-tab ${activeTab === "history" ? "receiving-tab--active" : ""}`}
                            onClick={() => handleTabClick("history")}
                        >
                            Receipt History
                        </button>
                    </div>

                    <div className="receiving-toolbar-actions">
                        {activeTab === "pending" && (
                            <div className="search-bar-wrap">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search PO number, supplier..."
                                    className="toolbar-search"
                                    value={pendingSearch}
                                    onChange={(e) => setPendingSearch(e.target.value)}
                                />
                            </div>
                        )}
                        {activeTab === "history" && (
                            <div className="search-bar-wrap">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search GRN, PO number..."
                                    className="toolbar-search"
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── TAB 1: PENDING RECEIPTS ─── */}
                {activeTab === "pending" && (
                    <div className="receiving-table-responsive">
                        <table className="receiving-data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Supplier / Origin</th>
                                    <th>Expected Date</th>
                                    <th>Total Items</th>
                                    <th>Expected Quantity</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPending.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="table-empty-state">No pending receipts found.</td>
                                    </tr>
                                ) : (
                                    filteredPending.map((po) => (
                                        <tr key={po.id}>
                                            <td className="font-mono font-bold text-blue">{po.poNumber}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{po.supplier}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{po.origin}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                                                    <span>{po.expectedDate}</span>
                                                </div>
                                            </td>
                                            <td>{po.itemsCount} Products</td>
                                            <td>{po.totalQty} units</td>
                                            <td>
                                                <span className={`rcv-status-badge ${po.status === "In Transit" ? "transit" : "pending"}`}>
                                                    {po.status === "In Transit" ? <Clock size={11} /> : <ClipboardList size={11} />}
                                                    <span>{po.status}</span>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button 
                                                    className="rcv-action-btn primary"
                                                    onClick={() => handleInitiateReceive(po.id)}
                                                >
                                                    <ArrowDownToLine size={13} />
                                                    <span>Unload & Receive</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ─── TAB 2: RECEIVE DISPATCH SCAN-IN FORM ─── */}
                {activeTab === "receive" && (
                    <div className="receive-form-container">
                        {!selectedPO ? (
                            <div className="no-po-selected-state">
                                <ClipboardList size={48} className="no-po-icon" />
                                <h3>No Inbound Delivery Selected</h3>
                                <p>Select a pending purchase order or stock transfer to scan it into the warehouse.</p>
                                <button className="rcv-btn primary" onClick={() => handleTabClick("pending")}>
                                    View Pending Receipts
                                </button>
                            </div>
                        ) : (
                            <div className="receive-dispatch-layout">
                                {/* Top metadata panel */}
                                <div className="unload-metadata-panel">
                                    <div className="metadata-grid">
                                        <div className="meta-field">
                                            <label>Purchase Order Ref</label>
                                            <div className="meta-val font-mono text-blue font-bold">{selectedPO.poNumber}</div>
                                        </div>
                                        <div className="meta-field">
                                            <label>Supplier / Vendor</label>
                                            <div className="meta-val font-bold">{selectedPO.supplier}</div>
                                        </div>
                                        <div className="meta-field">
                                            <label>Origin Hub</label>
                                            <div className="meta-val">{selectedPO.origin}</div>
                                        </div>
                                        <div className="meta-field">
                                            <label>Expected Arrival</label>
                                            <div className="meta-val">{selectedPO.expectedDate}</div>
                                        </div>
                                    </div>

                                    <div className="metadata-grid border-top">
                                        <div className="meta-field">
                                            <label htmlFor="unloadingBay">Unloading Bay</label>
                                            <select 
                                                id="unloadingBay" 
                                                value={unloadingBay} 
                                                onChange={(e) => setUnloadingBay(e.target.value)}
                                            >
                                                <option value="BAY-1">Unloading Bay 1</option>
                                                <option value="BAY-2">Unloading Bay 2</option>
                                                <option value="BAY-3">Unloading Bay 3</option>
                                            </select>
                                        </div>
                                        <div className="meta-field">
                                            <label htmlFor="vehicleNo">Vehicle Number</label>
                                            <input 
                                                type="text" 
                                                id="vehicleNo" 
                                                placeholder="e.g. MH-12-PQ-4567" 
                                                value={vehicleNo}
                                                onChange={(e) => setVehicleNo(e.target.value)}
                                            />
                                        </div>
                                        <div className="meta-field">
                                            <label htmlFor="tempReading">Cold-chain Temperature Reading (°C)</label>
                                            <input 
                                                type="text" 
                                                id="tempReading" 
                                                value={tempLoggerReading}
                                                onChange={(e) => setTempLoggerReading(e.target.value)}
                                            />
                                        </div>
                                        <div className="meta-field flex-end">
                                            {parseFloat(tempLoggerReading) > 8 ? (
                                                <span className="temp-alert warning">
                                                    <ShieldAlert size={14} /> High Temp Alert
                                                </span>
                                            ) : (
                                                <span className="temp-alert normal">
                                                    ✓ Temp Normal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Verification Table */}
                                <h3 className="section-title">Verified Items Checklist</h3>
                                <div className="receiving-table-responsive">
                                    <table className="receiving-data-table form-table">
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th style={{ width: "110px" }}>Expected Qty</th>
                                                <th style={{ width: "125px" }}>Received Qty</th>
                                                <th>QC Assessment</th>
                                                <th>Shelf Bin Allocation</th>
                                                <th>Batch Code</th>
                                                <th style={{ width: "150px" }}>Expiry Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPO.items.map((item) => {
                                                const rowData = receiveItemsData[item.id] || {};
                                                return (
                                                    <tr key={item.id}>
                                                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                        <td><strong>{item.expectedQty}</strong> {item.unit}</td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                className="table-input-number"
                                                                value={rowData.receivedQty !== undefined ? rowData.receivedQty : ""}
                                                                onChange={(e) => handleItemChange(item.id, "receivedQty", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select 
                                                                className="table-input-select"
                                                                value={rowData.qc || "Pass"}
                                                                onChange={(e) => handleItemChange(item.id, "qc", e.target.value)}
                                                            >
                                                                <option value="Pass">Pass (Accept)</option>
                                                                <option value="Rejected (Damaged)">Reject (Damaged)</option>
                                                                <option value="Rejected (Expired)">Reject (Expired)</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select 
                                                                className="table-input-select"
                                                                value={rowData.bin || ""}
                                                                onChange={(e) => handleItemChange(item.id, "bin", e.target.value)}
                                                            >
                                                                {BINS_LIST.map(bin => (
                                                                    <option key={bin} value={bin}>{bin}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="text" 
                                                                className="table-input-text font-mono"
                                                                value={rowData.batchNo || ""}
                                                                onChange={(e) => handleItemChange(item.id, "batchNo", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="date" 
                                                                className="table-input-date"
                                                                value={rowData.expiryDate || ""}
                                                                onChange={(e) => handleItemChange(item.id, "expiryDate", e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Form Footer actions */}
                                <div className="receive-form-footer">
                                    <button 
                                        className="rcv-btn secondary"
                                        onClick={() => {
                                            setActivePOId("");
                                            setSearchParams({ tab: "pending" });
                                        }}
                                    >
                                        Cancel Unloading
                                    </button>
                                    <button 
                                        className="rcv-btn primary"
                                        onClick={handlePostReceipt}
                                    >
                                        <CheckCircle size={15} />
                                        <span>Post Goods Receipt Note (GRN)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── TAB 3: RECEIPT HISTORY ─── */}
                {activeTab === "history" && (
                    <div className="receiving-table-responsive">
                        <table className="receiving-data-table">
                            <thead>
                                <tr>
                                    <th>GRN Number</th>
                                    <th>PO Number</th>
                                    <th>Supplier / Origin</th>
                                    <th>Received Date</th>
                                    <th>Officer Assigned</th>
                                    <th>Items Received</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="table-empty-state">No receipt records found.</td>
                                    </tr>
                                ) : (
                                    filteredHistory.map((grn) => (
                                        <tr key={grn.grnNumber}>
                                            <td className="font-mono font-bold text-success">{grn.grnNumber}</td>
                                            <td className="font-mono text-blue">{grn.poNumber}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{grn.supplier}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{grn.origin}</div>
                                            </td>
                                            <td>{grn.receivedDate}</td>
                                            <td>{grn.receivedBy}</td>
                                            <td>
                                                <strong>{grn.totalQty} units</strong>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>
                                                    ({grn.itemsCount} products)
                                                </span>
                                            </td>
                                            <td>
                                                <span className="rcv-status-badge posted">
                                                    <CheckCircle size={11} />
                                                    <span>GRN Posted</span>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <button 
                                                    className="rcv-inline-btn"
                                                    onClick={() => showToast(`Generating Goods Receipt Note layout for print...`, "success")}
                                                >
                                                    <Printer size={13} />
                                                    <span>Print GRN</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReceivingPage;
