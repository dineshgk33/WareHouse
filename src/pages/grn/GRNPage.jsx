import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
    Search, 
    Filter, 
    FileText, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Calendar, 
    ClipboardList,
    Printer,
    Download,
    User,
    ArrowDownToLine,
    Plus,
    Eye,
    Check
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { getIndents, processReceivingVerification } from "../../services/indentService";
import "./GRN.css";

const BINS_LIST = ["BIN-A01", "BIN-A02", "BIN-A12", "BIN-A15", "BIN-B02", "BIN-B03", "BIN-B09", "BIN-C01", "BIN-C02"];

function GRNPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    
    const activeTab = searchParams.get("tab") || "list";

    // Core Databases States
    const [indentsList, setIndentsList] = useState(() => getIndents());

    const refreshData = () => {
        setIndentsList(getIndents());
    };

    const grns = useMemo(() => {
        return indentsList
            .filter(i => ["Closed", "Exception Closed", "Damaged", "Short Received", "GRN Completed"].includes(i.status))
            .map(i => {
                const totalReceived = i.receivedQty || 0;
                const checkpoints = i.history.map(h => ({
                    name: h.status + (h.remarks ? ` - ${h.remarks}` : ""),
                    time: new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + ", " + new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    done: true
                }));
                return {
                    id: i.grnNumber || `GRN-${i.id.replace("IND-", "")}`,
                    poNumber: i.id,
                    supplier: i.requestedTo,
                    origin: i.requestedTo,
                    receivedDate: i.grnDate ? new Date(i.grnDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
                    receivedBy: i.receivedBy || "System",
                    unloadingBay: "BAY-1",
                    vehicleNo: i.vehicleNumber || "N/A",
                    tempReading: "4.2",
                    status: i.status === "Closed" ? "Verified" : i.status === "Damaged" ? "Damages Found" : i.status,
                    itemsCount: 1,
                    totalQty: totalReceived,
                    checkpoints: checkpoints,
                    items: [
                        { productName: i.productName + ` (${i.sku})`, expectedQty: i.approvedQty, receivedQty: totalReceived, qc: i.shortQty > 0 ? "Shortage" : i.damagedQty > 0 ? "Damaged" : "Pass", bin: "BIN-A12", batch: "BAT-9082", expiry: "2030-12-01" }
                    ],
                    indent: i
                };
            });
    }, [indentsList]);

    const pendingPOs = useMemo(() => {
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

    // Selected GRN details state
    const [selectedGrnId, setSelectedGrnId] = useState(searchParams.get("id") || "");
    const selectedGrn = useMemo(() => {
        return grns.find(g => g.id === selectedGrnId) || grns[0] || null;
    }, [grns, selectedGrnId]);

    // Create GRN Form state
    const [selectedPoId, setSelectedPoId] = useState("");
    const selectedPO = useMemo(() => {
        return pendingPOs.find(po => po.id === selectedPoId) || null;
    }, [pendingPOs, selectedPoId]);

    const [unloadingBay, setUnloadingBay] = useState("BAY-1");
    const [vehicleNo, setVehicleNo] = useState("");
    const [tempReading, setTempReading] = useState("4.2");
    const [officerName, setOfficerName] = useState("Ramesh Lal");
    const [formItems, setFormItems] = useState({});

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Initialize/reset form when active PO changes
    useEffect(() => {
        if (selectedPO) {
            const initialFormItems = {};
            selectedPO.items.forEach(itm => {
                initialFormItems[itm.id] = {
                    receivedQty: itm.expectedQty,
                    qc: "Pass",
                    bin: BINS_LIST[Math.floor(Math.random() * BINS_LIST.length)],
                    batch: "BAT-" + Math.floor(1000 + Math.random() * 9000),
                    expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                };
            });
            setTimeout(() => {
                setFormItems(initialFormItems);
            }, 0);
        }
    }, [selectedPO]);

    // Set initial active GRN details if missing
    useEffect(() => {
        if (!selectedGrnId && grns.length > 0) {
            setTimeout(() => {
                setSelectedGrnId(grns[0].id);
            }, 0);
        }
    }, [grns, selectedGrnId]);

    const handleItemFormChange = (itemId, field, value) => {
        setFormItems(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value
            }
        }));
    };

    const handlePostGRN = (e) => {
        e.preventDefault();
        if (!selectedPO) {
            showToast("Please select a pending Purchase Order.", "error");
            return;
        }
        if (!vehicleNo.trim()) {
            showToast("Please enter the vehicle registration number.", "error");
            return;
        }

        // Quantities verification
        let hasQuantityError = false;
        selectedPO.items.forEach(itm => {
            const formVal = formItems[itm.id] || {};
            const rQty = parseInt(formVal.receivedQty);
            if (isNaN(rQty) || rQty < 0) {
                hasQuantityError = true;
            }
        });

        if (hasQuantityError) {
            showToast("Please check received quantities. Negative or empty inputs are invalid.", "error");
            return;
        }

        let recVal = 0;
        let shVal = 0;
        let dmgVal = 0;
        let rejVal = 0;

        selectedPO.items.forEach(itm => {
            const formVal = formItems[itm.id] || {};
            const rQty = parseInt(formVal.receivedQty) || 0;
            const expected = itm.expectedQty;

            recVal += rQty;
            if (formVal.qc === "Pass") {
                if (rQty < expected) {
                    shVal += (expected - rQty);
                }
            } else if (formVal.qc === "Damaged") {
                if (rQty < expected) {
                    dmgVal += (expected - rQty);
                }
            } else if (formVal.qc === "Expired" || formVal.qc === "Shortage") {
                if (rQty < expected) {
                    rejVal += (expected - rQty);
                }
            }
        });

        try {
            const res = processReceivingVerification({
                indentId: selectedPO.indent.id,
                receivedQty: recVal,
                shortQty: shVal,
                damagedQty: dmgVal,
                rejectedQty: rejVal,
                remarks: `Bay: ${unloadingBay}. Temp Logger: ${tempReading}°C. Verified by: ${officerName}.`,
                userName: officerName || "Ramesh Lal",
                attachments: [],
                isOverReceiptApproved: true
            });

            refreshData();

            // Clean form states
            setSelectedPoId("");
            setVehicleNo("");
            setSearchParams({ tab: "list", id: res.grnNumber || `GRN-${selectedPO.indent.id.replace("IND-", "")}` });

            showToast(`Goods Receipt Note posted successfully!`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const handleSelectDetails = (grnId) => {
        setSelectedGrnId(grnId);
        setSearchParams({ tab: "details", id: grnId });
    };

    // Filtered lists
    const filteredGrns = useMemo(() => {
        return grns.filter(g => 
            g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [grns, searchTerm]);

    return (
        <div className="grn-root fade-in">
            {/* Header Title Section */}
            <div className="grn-header-block">
                <div className="grn-header-left">
                    <h1 className="grn-header-title">GRN (Goods Receipt Note)</h1>
                    <p className="grn-header-subtitle">
                        {activeTab === "list" && "Inspect previously verified Goods Receipt Notes, invoice reference counts, and inbound quality checks."}
                        {activeTab === "create" && "Formulate new Goods Receipt Notes from incoming Purchase Orders and allocate shelf bins."}
                        {activeTab === "details" && "Audit the detailed QC records, driver logs, binned lots, and checkpoints for a specific GRN."}
                    </p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grn-stats-grid">
                <div className="grn-stat-card">
                    <span className="stat-dot dot-verified" style={{ backgroundColor: "#10b981" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {grns.filter(g => g.status === "Verified").length}
                        </span>
                        <span className="stat-card-label">Verified GRNs</span>
                    </div>
                </div>
                <div className="grn-stat-card">
                    <span className="stat-dot dot-damages" style={{ backgroundColor: "#ef4444" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {grns.filter(g => g.status === "Damages Found").length}
                        </span>
                        <span className="stat-card-label">Damages Flagged</span>
                    </div>
                </div>
                <div className="grn-stat-card">
                    <span className="stat-dot dot-pending-po" style={{ backgroundColor: "#f59e0b" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">{pendingPOs.length}</span>
                        <span className="stat-card-label">Awaiting GRNs</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs Panel */}
            <div className="grn-card">
                <div className="grn-toolbar">
                    <div className="grn-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "list"}
                            className={`grn-tab ${activeTab === "list" ? "grn-tab--active" : ""}`}
                            onClick={() => setSearchParams({ tab: "list" })}
                        >
                            GRN List
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "create"}
                            className={`grn-tab ${activeTab === "create" ? "grn-tab--active" : ""}`}
                            onClick={() => setSearchParams({ tab: "create" })}
                        >
                            Create GRN
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "details"}
                            className={`grn-tab ${activeTab === "details" ? "grn-tab--active" : ""}`}
                            onClick={() => {
                                if (selectedGrnId) {
                                    setSearchParams({ tab: "details", id: selectedGrnId });
                                } else {
                                    setSearchParams({ tab: "details" });
                                }
                            }}
                        >
                            GRN Details
                        </button>
                    </div>

                    <div className="grn-toolbar-actions">
                        {activeTab === "list" && (
                            <div className="search-bar-wrap">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search GRN, PO number, vendor..."
                                    className="toolbar-search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── TAB 1: GRN LIST ─── */}
                {activeTab === "list" && (
                    <div className="grn-table-responsive">
                        <table className="grn-data-table">
                            <thead>
                                <tr>
                                    <th>GRN ID</th>
                                    <th>PO Reference</th>
                                    <th>Supplier / Vendor</th>
                                    <th>Received Date</th>
                                    <th>QC Inspector</th>
                                    <th>Total Received</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrns.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="table-empty-state">No Goods Receipt Notes found.</td>
                                    </tr>
                                ) : (
                                    filteredGrns.map((grn) => (
                                        <tr key={grn.id}>
                                            <td className="font-mono font-bold text-success" style={{ cursor: "pointer" }} onClick={() => handleSelectDetails(grn.id)}>{grn.id}</td>
                                            <td className="font-mono text-blue">{grn.poNumber}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{grn.supplier}</div>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{grn.origin}</span>
                                            </td>
                                            <td>{grn.receivedDate}</td>
                                            <td>{grn.receivedBy}</td>
                                            <td>
                                                <strong>{grn.totalQty} units</strong>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>({grn.itemsCount} products)</div>
                                            </td>
                                            <td>
                                                <span className={`grn-status-badge ${grn.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                                    {grn.status === "Verified" ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                                                    <span>{grn.status}</span>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        className="grn-action-btn primary"
                                                        onClick={() => handleSelectDetails(grn.id)}
                                                    >
                                                        <Eye size={12} />
                                                        <span>View Details</span>
                                                    </button>
                                                    <button 
                                                        className="grn-inline-btn"
                                                        onClick={() => showToast(`Opening GRN print view sheet for ${grn.id}...`, "success")}
                                                    >
                                                        <Printer size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ─── TAB 2: CREATE GRN ─── */}
                {activeTab === "create" && (
                    <div className="create-grn-container">
                        <form onSubmit={handlePostGRN} className="create-grn-layout">
                            
                            {/* PO Selector row */}
                            <div className="po-selector-row">
                                <div className="form-field" style={{ flexGrow: 1 }}>
                                    <label htmlFor="poSelect">Select Pending Inbound Purchase Order</label>
                                    <select 
                                        id="poSelect" 
                                        value={selectedPoId} 
                                        onChange={(e) => setSelectedPoId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose PO --</option>
                                        {pendingPOs.map(po => (
                                            <option key={po.id} value={po.id}>{po.id} • {po.supplier} ({po.totalQty} units)</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedPO ? (
                                <div className="po-grn-form-wrapper">
                                    <div className="form-sections-wrapper">
                                        
                                        {/* Left Side: Unloading Details */}
                                        <div className="form-details-section">
                                            <h3 className="section-title">Logistics & Unloading Bay Information</h3>
                                            <div className="form-grid">
                                                <div className="form-field">
                                                    <label htmlFor="unloadingBay">Unloading Bay Gate</label>
                                                    <select 
                                                        id="unloadingBay" 
                                                        value={unloadingBay} 
                                                        onChange={(e) => setUnloadingBay(e.target.value)}
                                                    >
                                                        <option value="BAY-1">Bay Gate 1 (Heavy Load)</option>
                                                        <option value="BAY-2">Bay Gate 2 (Medium Load)</option>
                                                        <option value="BAY-3">Bay Gate 3 (Cold Chain/Dairy)</option>
                                                    </select>
                                                </div>
                                                <div className="form-field">
                                                    <label htmlFor="vehicleNo">Carrier Vehicle Number</label>
                                                    <input 
                                                        type="text" 
                                                        id="vehicleNo" 
                                                        placeholder="e.g. MH-12-PQ-4567"
                                                        value={vehicleNo}
                                                        onChange={(e) => setVehicleNo(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label htmlFor="tempReading">Temperature Reading (°C)</label>
                                                    <input 
                                                        type="text" 
                                                        id="tempReading" 
                                                        value={tempReading}
                                                        onChange={(e) => setTempReading(e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label htmlFor="officerName">QC Inspector Assigned</label>
                                                    <input 
                                                        type="text" 
                                                        id="officerName" 
                                                        value={officerName}
                                                        onChange={(e) => setOfficerName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
                                                Origin Hub: <strong>{selectedPO.origin}</strong> | Target: <strong>HAATZA Warehouse</strong>
                                            </div>
                                        </div>

                                        {/* Right Side: Items checklist summary */}
                                        <div className="form-checklist-section">
                                            <h3 className="section-title">Purchase Order Details</h3>
                                            <div className="po-summary-box">
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "6px" }}>
                                                    <strong>Expected Date</strong>
                                                    <span>{selectedPO.expectedDate}</span>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px dashed var(--border-color)", paddingBottom: "6px" }}>
                                                    <strong>Expected Total Qty</strong>
                                                    <span>{selectedPO.totalQty} units</span>
                                                </div>
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <strong>Total Products</strong>
                                                    <span>{selectedPO.itemsCount} lines</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Items Verification Checklist Table */}
                                    <h3 className="section-title" style={{ marginTop: "16px" }}>Inward Items Count & Bin Allocations</h3>
                                    <div className="grn-table-responsive">
                                        <table className="grn-data-table form-table">
                                            <thead>
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th style={{ width: "120px" }}>Expected Qty</th>
                                                    <th style={{ width: "130px" }}>Received Qty</th>
                                                    <th>QC Assessment</th>
                                                    <th>Shelf Bin Allocation</th>
                                                    <th>Batch Reference</th>
                                                    <th style={{ width: "160px" }}>Expiry Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedPO.items.map(itm => {
                                                    const itmForm = formItems[itm.id] || {};
                                                    return (
                                                        <tr key={itm.id}>
                                                            <td style={{ fontWeight: 600 }}>{itm.productName}</td>
                                                            <td><strong>{itm.expectedQty} units</strong></td>
                                                            <td>
                                                                <input 
                                                                    type="number"
                                                                    className="table-input-number"
                                                                    value={itmForm.receivedQty !== undefined ? itmForm.receivedQty : ""}
                                                                    onChange={(e) => handleItemFormChange(itm.id, "receivedQty", e.target.value)}
                                                                    required
                                                                    min="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <select 
                                                                    className="table-input-select"
                                                                    value={itmForm.qc || "Pass"}
                                                                    onChange={(e) => handleItemFormChange(itm.id, "qc", e.target.value)}
                                                                >
                                                                    <option value="Pass">Passed (No Defects)</option>
                                                                    <option value="Damaged">Failed (Damages)</option>
                                                                    <option value="Shortage">Failed (Shortage)</option>
                                                                    <option value="Expired">Failed (Expired)</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <select 
                                                                    className="table-input-select"
                                                                    value={itmForm.bin || ""}
                                                                    onChange={(e) => handleItemFormChange(itm.id, "bin", e.target.value)}
                                                                >
                                                                    {BINS_LIST.map(b => (
                                                                        <option key={b} value={b}>{b}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input 
                                                                    type="text"
                                                                    className="table-input-text font-mono"
                                                                    value={itmForm.batch || ""}
                                                                    onChange={(e) => handleItemFormChange(itm.id, "batch", e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input 
                                                                    type="date"
                                                                    className="table-input-date"
                                                                    value={itmForm.expiry || ""}
                                                                    onChange={(e) => handleItemFormChange(itm.id, "expiry", e.target.value)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action post buttons */}
                                    <div className="create-grn-footer">
                                        <button 
                                            type="button" 
                                            className="grn-btn secondary"
                                            onClick={() => setSelectedPoId("")}
                                        >
                                            Reset Selection
                                        </button>
                                        <button type="submit" className="grn-btn primary">
                                            <ArrowDownToLine size={16} />
                                            <span>Post Goods Receipt Note (GRN)</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-po-placeholder">
                                    <ClipboardList size={40} style={{ color: "var(--border-color)", marginBottom: "8px" }} />
                                    <h4>Awaiting Purchase Order Selection</h4>
                                    <p>Select an expected purchase order from the dropdown above to load items checklist.</p>
                                </div>
                            )}

                        </form>
                    </div>
                )}

                {/* ─── TAB 3: GRN DETAILS ─── */}
                {activeTab === "details" && selectedGrn && (
                    <div className="grn-details-container">
                        <div className="details-layout-split">
                            
                            {/* Left details pane */}
                            <div className="details-card-main">
                                <div className="details-header-band">
                                    <div>
                                        <h3 className="grn-main-id">Goods Receipt Note: {selectedGrn.id}</h3>
                                        <span className={`grn-status-badge ${selectedGrn.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                            {selectedGrn.status}
                                        </span>
                                    </div>
                                    <button 
                                        className="grn-inline-btn"
                                        onClick={() => showToast(`Opening printable document sheet...`, "success")}
                                    >
                                        <Printer size={13} />
                                        <span>Print Note</span>
                                    </button>
                                </div>

                                <div className="details-meta-grid">
                                    <div className="meta-item">
                                        <span className="label">Purchase Order Ref</span>
                                        <span className="val font-mono font-bold text-blue">{selectedGrn.poNumber}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Supplier / Vendor</span>
                                        <span className="val font-bold">{selectedGrn.supplier}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Unloaded Date</span>
                                        <span className="val">{selectedGrn.receivedDate}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Inbound Origin Hub</span>
                                        <span className="val">{selectedGrn.origin}</span>
                                    </div>
                                </div>

                                <div className="details-metadata-split border-top">
                                    <div className="sub-section">
                                        <h4 className="sub-title">Unloading Bay Logistics</h4>
                                        <div className="driver-details-wrap">
                                            <div className="avatar-wrap">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>QC Inspector: {selectedGrn.receivedBy}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                                    Bay: {selectedGrn.unloadingBay} | Vehicle: {selectedGrn.vehicleNo}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                    Arrival Temperature: <strong>{selectedGrn.tempReading} °C</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sub-section">
                                        <h4 className="sub-title">Signatures & Approvals</h4>
                                        <div className="signature-box">
                                            <div className="sig-line">
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Warehouse Manager</span>
                                                <span className="sig-stamp">Approved ✓</span>
                                            </div>
                                            <div className="sig-line" style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "6px" }}>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>QC Verdict</span>
                                                <span className="sig-stamp green">Verified ✓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Verification Detail Table */}
                                <h4 className="sub-title" style={{ marginTop: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>Received Items Audit Delta</h4>
                                <div className="grn-table-responsive">
                                    <table className="grn-data-table details-table">
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th style={{ textAlign: "center" }}>Expected</th>
                                                <th style={{ textAlign: "center" }}>Received</th>
                                                <th>QC Verdict</th>
                                                <th>Bin Allocated</th>
                                                <th>Batch Reference</th>
                                                <th>Expiry Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedGrn.items.map((itm, index) => {
                                                const delta = itm.expectedQty - itm.receivedQty;
                                                return (
                                                    <tr key={index}>
                                                        <td style={{ fontWeight: 600 }}>{itm.productName}</td>
                                                        <td style={{ textAlign: "center" }}>{itm.expectedQty} units</td>
                                                        <td style={{ textAlign: "center", fontWeight: 700, color: delta > 0 ? "var(--color-danger)" : "inherit" }}>
                                                            {itm.receivedQty} units
                                                        </td>
                                                        <td>
                                                            <span style={{ 
                                                                color: itm.qc.includes("Pass") ? "var(--color-success)" : "var(--color-danger)",
                                                                fontWeight: "bold",
                                                                fontSize: "12px"
                                                            }}>
                                                                {itm.qc}
                                                            </span>
                                                        </td>
                                                        <td className="font-mono">{itm.bin}</td>
                                                        <td className="font-mono">{itm.batch}</td>
                                                        <td>{itm.expiry}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right checkpoints timeline */}
                            <div className="details-route-milestones">
                                <h3 className="section-title">Inbound Handoff Milestones</h3>
                                <div className="milestones-vertical-timeline">
                                    {selectedGrn.checkpoints.map((cp, idx) => (
                                        <div key={idx} className={`timeline-checkpoint ${cp.done ? "completed" : ""}`}>
                                            <div className="checkpoint-marker">
                                                {cp.done ? "✓" : ""}
                                            </div>
                                            <div className="checkpoint-details">
                                                <div className="checkpoint-name font-bold">{cp.name}</div>
                                                <div className="checkpoint-time font-mono">{cp.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GRNPage;
