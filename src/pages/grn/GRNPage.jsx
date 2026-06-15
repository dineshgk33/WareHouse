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
import "./GRN.css";

const MOCK_PENDING_POS = [
    {
        id: "PO-2026-9801",
        supplier: "Harvest Fresh Farms Ltd.",
        origin: "Pune Agro Hub",
        expectedDate: "15 Jun 2026",
        itemsCount: 3,
        totalQty: 250,
        items: [
            { id: "itm-1", productName: "Farm Fresh Milk 1L", expectedQty: 100 },
            { id: "itm-2", productName: "Whole Wheat Bread 400g", expectedQty: 80 },
            { id: "itm-3", productName: "Organic Eggs 12pk", expectedQty: 70 }
        ]
    },
    {
        id: "PO-2026-9802",
        supplier: "Metro Beverage Distributors",
        origin: "Koramangala Bottling Plant",
        expectedDate: "16 Jun 2026",
        itemsCount: 2,
        totalQty: 200,
        items: [
            { id: "itm-4", productName: "Sparkling Cola Can 330ml", expectedQty: 100 },
            { id: "itm-5", productName: "Lemon Soda Can 330ml", expectedQty: 100 }
        ]
    },
    {
        id: "PO-2026-9803",
        supplier: "Apple Distribution Hub",
        origin: "Mumbai Customs Depot",
        expectedDate: "17 Jun 2026",
        itemsCount: 2,
        totalQty: 50,
        items: [
            { id: "itm-6", productName: "iPhone 15 Pro Max 256GB", expectedQty: 20 },
            { id: "itm-7", productName: "USB-C Charger Adapter 20W", expectedQty: 30 }
        ]
    }
];

const MOCK_GRNS = [
    {
        id: "GRN-2026-8542",
        poNumber: "PO-2026-9790",
        supplier: "Ingram Micro India Ltd.",
        origin: "Delhi Hub Warehouse",
        receivedDate: "15 Jun 2026",
        receivedBy: "Ramesh Lal",
        unloadingBay: "BAY-1",
        vehicleNo: "DL-01-GB-2291",
        tempReading: "4.5",
        status: "Verified",
        itemsCount: 3,
        totalQty: 240,
        checkpoints: [
            { name: "Purchase Order Released", time: "10 Jun, 09:00 AM", done: true },
            { name: "Gate Entry & Temp Logged", time: "15 Jun, 08:30 AM", done: true },
            { name: "Unloaded & Count Checked", time: "15 Jun, 09:15 AM", done: true },
            { name: "QC Verdict Passed", time: "15 Jun, 10:00 AM", done: true },
            { name: "Stock Allocated to Bins (Completed)", time: "15 Jun, 10:30 AM", done: true }
        ],
        items: [
            { productName: "Wireless Mouse M220", expectedQty: 100, receivedQty: 100, qc: "Pass", bin: "BIN-A12", batch: "BAT-9082", expiry: "2030-12-01" },
            { productName: "Mechanical Keyboard K84", expectedQty: 80, receivedQty: 80, qc: "Pass", bin: "BIN-A15", batch: "BAT-9083", expiry: "2030-12-01" },
            { productName: "Noise Cancelling Headphones", expectedQty: 60, receivedQty: 60, qc: "Pass", bin: "BIN-B02", batch: "BAT-9084", expiry: "2030-12-01" }
        ]
    },
    {
        id: "GRN-2026-8540",
        poNumber: "PO-2026-9788",
        supplier: "Samsung India Pvt. Ltd.",
        origin: "Noida Production Plant",
        receivedDate: "14 Jun 2026",
        receivedBy: "Suresh Kumar",
        unloadingBay: "BAY-3",
        vehicleNo: "UP-16-AM-4091",
        tempReading: "6.2",
        status: "Verified",
        itemsCount: 1,
        totalQty: 85,
        checkpoints: [
            { name: "Purchase Order Released", time: "08 Jun, 11:00 AM", done: true },
            { name: "Gate Entry & Temp Logged", time: "14 Jun, 01:00 PM", done: true },
            { name: "Unloaded & Count Checked", time: "14 Jun, 01:45 PM", done: true },
            { name: "QC Verdict Passed", time: "14 Jun, 02:15 PM", done: true },
            { name: "Stock Allocated to Bins (Completed)", time: "14 Jun, 03:00 PM", done: true }
        ],
        items: [
            { productName: "Samsung Galaxy Tab S9", expectedQty: 85, receivedQty: 85, qc: "Pass", bin: "BIN-B09", batch: "BAT-1109", expiry: "2029-06-01" }
        ]
    },
    {
        id: "GRN-2026-8538",
        poNumber: "PO-2026-9785",
        supplier: "Redington Logistics Ltd.",
        origin: "Chennai Main Depot",
        receivedDate: "13 Jun 2026",
        receivedBy: "Suresh Kumar",
        unloadingBay: "BAY-2",
        vehicleNo: "TN-02-ZZ-8891",
        tempReading: "4.8",
        status: "Damages Found",
        itemsCount: 2,
        totalQty: 300,
        checkpoints: [
            { name: "Purchase Order Released", time: "05 Jun, 02:00 PM", done: true },
            { name: "Gate Entry & Temp Logged", time: "13 Jun, 10:00 AM", done: true },
            { name: "Unloaded & Count Checked", time: "13 Jun, 11:00 AM", done: true },
            { name: "QC Verdict Passed (Damages Tagged)", time: "13 Jun, 11:30 AM", done: true },
            { name: "Stock Allocated to Bins (Completed)", time: "13 Jun, 12:15 PM", done: true }
        ],
        items: [
            { productName: "External Hard Drive 2TB", expectedQty: 200, receivedQty: 200, qc: "Pass", bin: "BIN-C01", batch: "BAT-3091", expiry: "2031-01-01" },
            { productName: "Foil Protected HDMI Cable", expectedQty: 110, receivedQty: 100, qc: "Failed (Damaged)", bin: "BIN-C02", batch: "BAT-3092", expiry: "2031-01-01" }
        ]
    }
];

const BINS_LIST = ["BIN-A01", "BIN-A02", "BIN-A12", "BIN-A15", "BIN-B02", "BIN-B03", "BIN-B09", "BIN-C01", "BIN-C02"];

function GRNPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    
    const activeTab = searchParams.get("tab") || "list";

    // Dynamic Database State
    const [grns, setGrns] = useState(MOCK_GRNS);
    const [pendingPOs, setPendingPOs] = useState(MOCK_PENDING_POS);

    // Selected GRN details state
    const [selectedGrnId, setSelectedGrnId] = useState(searchParams.get("id") || "");
    const selectedGrn = useMemo(() => {
        return grns.find(g => g.id === selectedGrnId) || grns[0];
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
            setFormItems(initialFormItems);
        }
    }, [selectedPO]);

    // Set initial active GRN details if missing
    useEffect(() => {
        if (!selectedGrnId && grns.length > 0) {
            setSelectedGrnId(grns[0].id);
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
        const mappedItems = selectedPO.items.map(itm => {
            const formVal = formItems[itm.id] || {};
            const rQty = parseInt(formVal.receivedQty);
            if (isNaN(rQty) || rQty < 0) {
                hasQuantityError = true;
            }
            return {
                productName: itm.productName,
                expectedQty: itm.expectedQty,
                receivedQty: rQty,
                qc: formVal.qc === "Pass" ? "Pass" : `Failed (${formVal.qc})`,
                bin: formVal.bin,
                batch: formVal.batch,
                expiry: formVal.expiry
            };
        });

        if (hasQuantityError) {
            showToast("Please check received quantities. Negative or empty inputs are invalid.", "error");
            return;
        }

        const newGrnId = "GRN-2026-" + Math.floor(8543 + Math.random() * 500);
        const totalReceived = mappedItems.reduce((sum, item) => sum + item.receivedQty, 0);
        const hasDamages = mappedItems.some(item => item.qc.includes("Failed"));

        const newGrn = {
            id: newGrnId,
            poNumber: selectedPO.id,
            supplier: selectedPO.supplier,
            origin: selectedPO.origin,
            receivedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            receivedBy: officerName,
            unloadingBay,
            vehicleNo,
            tempReading,
            status: hasDamages ? "Damages Found" : "Verified",
            itemsCount: selectedPO.itemsCount,
            totalQty: totalReceived,
            checkpoints: [
                { name: "Purchase Order Released", time: "12 Jun, 09:00 AM", done: true },
                { name: "Gate Entry & Temp Logged", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
                { name: "Unloaded & Count Checked", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
                { name: "QC Verdict Passed", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
                { name: "Stock Allocated to Bins (Completed)", time: "Pending", done: false }
            ],
            items: mappedItems
        };

        // Prepend GRN
        setGrns(prev => [newGrn, ...prev]);
        // Remove PO from pending list
        setPendingPOs(prev => prev.filter(po => po.id !== selectedPO.id));

        // Clean form states
        setSelectedPoId("");
        setVehicleNo("");

        // Switch to details of new GRN
        setSelectedGrnId(newGrnId);
        setSearchParams({ tab: "list" });
        showToast(`Goods Receipt Note ${newGrnId} posted successfully!`, "success");
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
