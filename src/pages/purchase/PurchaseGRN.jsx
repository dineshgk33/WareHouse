import React, { useState, useEffect } from "react";
import { 
    getPurchaseGRNs, 
    postPurchaseGRN,
    getPurchaseOrders,
    getInboundDeliveries,
    resolveWarehouseName
} from "../../services/purchaseService";
import { getProducts } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    Plus, 
    Check, 
    FileText, 
    Eye, 
    Upload, 
    Thermometer,
    Award,
    AlertTriangle,
    ShieldAlert,
    Calendar,
    Inbox
} from "lucide-react";
import "./PurchaseStyles.css";

function PurchaseGRN() {
    const { userName, selectedWarehouseName } = useAuth();
    const { showToast } = useToast();

    const [grnsList, setGrnsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedGRN, setSelectedGRN] = useState(null);

    // Form state
    const [selectedPONumber, setSelectedPONumber] = useState("");
    const [selectedShipmentNumber, setSelectedShipmentNumber] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState("");
    const [invoiceImage, setInvoiceImage] = useState(""); // Base64 mock
    const [formItems, setFormItems] = useState({});

    const loadData = () => {
        setGrnsList(getPurchaseGRNs());
    };

    useEffect(() => {
        loadData();
    }, []);

    const inboundDeliveries = getInboundDeliveries().filter(d => d.status === "Unloaded");
    const purchaseOrders = getPurchaseOrders();

    // Set form items list when PO is selected
    const handlePoChange = (poNum) => {
        setSelectedPONumber(poNum);
        const po = purchaseOrders.find(p => p.poNumber === poNum);
        const del = inboundDeliveries.find(d => d.poNumber === poNum);
        if (del) {
            setSelectedShipmentNumber(del.shipmentNumber);
        } else {
            setSelectedShipmentNumber("");
        }

        if (po) {
            const initialItems = {};
            po.items.forEach(itm => {
                // Determine category to show specific fields
                const catalogProd = getProducts().find(p => p.sku === itm.sku) || {};
                const category = catalogProd.category || "General";

                initialItems[itm.sku] = {
                    sku: itm.sku,
                    productName: itm.productName,
                    category,
                    expectedQty: itm.quantity,
                    receivedQty: itm.quantity,
                    shortQty: 0,
                    damagedQty: 0,
                    rejectedQty: 0,
                    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    batchNumber: "BAT-" + Math.floor(1000 + Math.random() * 9000),
                    manufacturingDate: new Date().toISOString().split("T")[0],
                    binAllocation: "BIN-A01",
                    qcVerdict: "Pass",
                    qcMetrics: {
                        // Fruits
                        ripenessIndex: "Fully Ripe",
                        weight: `${itm.quantity} kg`,
                        qualityGrade: "Grade A",
                        // Veg
                        freshnessScale: "Fresh",
                        damagePercent: 0,
                        // Dairy & Frozen
                        tempCompliance: true,
                        tempReading: 4.0,
                        fssaiValidated: true,
                        // Medicines
                        licenseVerified: true,
                        manufacturer: "Generic Labs"
                    }
                };
            });
            setFormItems(initialItems);
        } else {
            setFormItems({});
        }
    };

    const handleItemFieldChange = (sku, field, value) => {
        setFormItems(prev => {
            const updatedItem = { ...prev[sku] };
            
            if (field.startsWith("qcMetrics.")) {
                const metricKey = field.split(".")[1];
                updatedItem.qcMetrics = {
                    ...updatedItem.qcMetrics,
                    [metricKey]: value
                };
            } else {
                updatedItem[field] = value;
            }

            // Automatically compute short quantity if received changes
            if (field === "receivedQty") {
                const rec = parseInt(value) || 0;
                updatedItem.shortQty = Math.max(0, updatedItem.expectedQty - rec);
            }

            return {
                ...prev,
                [sku]: updatedItem
            };
        });
    };

    const handleInvoiceUploadMock = (e) => {
        showToast("Invoice document uploaded successfully!", "success");
        setInvoiceImage("BASE64_INVOICE_IMAGE_MOCK");
    };

    const handleSubmitGRN = (e) => {
        e.preventDefault();
        if (!selectedPONumber) {
            showToast("Please select a Purchase Order.", "error");
            return;
        }
        if (!invoiceNumber) {
            showToast("Please enter the invoice number.", "error");
            return;
        }

        // Run validation rules
        let validationError = "";
        Object.keys(formItems).forEach(sku => {
            const item = formItems[sku];
            
            // Negative value validation
            if (item.receivedQty < 0 || item.damagedQty < 0 || item.rejectedQty < 0) {
                validationError = "Quantities cannot be negative.";
            }

            // Expiry Date validation
            if (new Date(item.expiryDate) <= new Date()) {
                validationError = `Expiry date for ${item.productName} must be in the future.`;
            }

            // Category Specific Compliance Validation Rules:
            if (item.category === "Fruits & Vegetables") {
                // Fruits/Veg specific checks
                if (item.qcMetrics.damagePercent > 10) {
                    validationError = `${item.productName} exceeds maximum fresh damage tolerance (10%).`;
                }
            } else if (item.category === "Dairy & Bread") {
                // Dairy temperature limit: 4.5°C
                if (item.qcMetrics.tempReading > 4.5) {
                    validationError = `${item.productName} cold chain violated! Dairy temp cannot exceed 4.5°C (Current: ${item.qcMetrics.tempReading}°C).`;
                }
                if (!item.qcMetrics.fssaiValidated) {
                    validationError = `${item.productName} rejected: FSSAI validation failed.`;
                }
            } else if (item.category === "Instant & Frozen Food") {
                // Frozen temperature limit: -15°C
                if (item.qcMetrics.tempReading > -15) {
                    validationError = `${item.productName} cold chain violated! Frozen temp cannot exceed -15°C (Current: ${item.qcMetrics.tempReading}°C).`;
                }
            } else if (item.category === "Medicines") {
                // Medicine drug license verification
                if (!item.qcMetrics.licenseVerified) {
                    validationError = `${item.productName} rejected: Manufacturer License check failed.`;
                }
            }
        });

        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        const list = getPurchaseGRNs();
        const code = `PGRN-${40000 + list.length + 1}`;
        const warehouse = selectedWarehouseName || "HAATZA Koramangala Hub";
        const resolvedWarehouse = resolveWarehouseName(warehouse);
        const po = purchaseOrders.find(p => p.poNumber === selectedPONumber);

        const newGRN = {
            grnNumber: code,
            poNumber: selectedPONumber,
            shipmentNumber: selectedShipmentNumber || "Direct PO GRN",
            vendorCode: po ? po.vendorCode : "Unknown",
            vendorName: po ? po.vendorName : "Unknown Vendor",
            warehouseId: "DKH-001",
            warehouseName: resolvedWarehouse,
            receivedDate: new Date().toISOString(),
            verifiedBy: userName || "Receiving Clerk",
            invoiceNumber,
            invoiceDate,
            invoiceImage,
            items: Object.values(formItems)
        };

        try {
            postPurchaseGRN(newGRN, userName);
            showToast(`Purchase GRN ${code} posted successfully! Warehouse inventory levels increased.`, "success");
            setIsCreateModalOpen(false);
            
            // Reset form
            setSelectedPONumber("");
            setSelectedShipmentNumber("");
            setInvoiceNumber("");
            setInvoiceDate("");
            setInvoiceImage("");
            setFormItems({});
            loadData();
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const filteredGRNs = grnsList.filter(g => 
        g.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Purchase GRN (Inbound)</h1>
                    <p className="purchase-header-subtitle">
                        Goods Receipt Notes for Vendor $\rightarrow$ Warehouse inbound shipments with category quality validation controls.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Perform Inbound Receiving (GRN)</span>
                    </button>
                </div>
            </div>

            {/* List and Details section */}
            <div className="purchase-card">
                <div className="purchase-table-filters">
                    <input 
                        type="text" 
                        placeholder="Search by GRN, PO, Vendor, Invoice..."
                        className="purchase-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>GRN Number</th>
                                <th>PO Reference</th>
                                <th>Vendor</th>
                                <th>Warehouse</th>
                                <th>Received Date</th>
                                <th>Invoice Details</th>
                                <th>Verified By</th>
                                <th>Items</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGRNs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                                        No purchase Goods Receipt Notes found. Click "Perform Inbound Receiving" to post one.
                                    </td>
                                </tr>
                            ) : (
                                filteredGRNs.map((grn) => (
                                    <tr key={grn.grnNumber}>
                                        <td className="font-mono font-bold text-success" onClick={() => setSelectedGRN(grn)} style={{ cursor: "pointer" }}>
                                            {grn.grnNumber}
                                        </td>
                                        <td className="font-mono font-bold text-blue">{grn.poNumber}</td>
                                        <td style={{ fontWeight: 600 }}>{grn.vendorName}</td>
                                        <td>{grn.warehouseName}</td>
                                        <td>{new Date(grn.receivedDate).toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
                                                <span>No: <strong>{grn.invoiceNumber}</strong></span>
                                                <span className="text-muted">Date: {grn.invoiceDate}</span>
                                            </div>
                                        </td>
                                        <td>{grn.verifiedBy}</td>
                                        <td>{grn.items.length} lines</td>
                                        <td style={{ textAlign: "right" }}>
                                            <button 
                                                className="purchase-action-btn-sm"
                                                onClick={() => setSelectedGRN(grn)}
                                            >
                                                <Eye size={12} />
                                                <span>View details</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View GRN Details Modal */}
            {selectedGRN && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "800px" }}>
                        <div className="purchase-modal-header">
                            <h3 className="purchase-modal-title">Purchase GRN details: {selectedGRN.grnNumber}</h3>
                            <button className="purchase-modal-close" onClick={() => setSelectedGRN(null)}>×</button>
                        </div>
                        <div className="purchase-modal-body">
                            <div className="purchase-detail-meta" style={{ marginBottom: "20px" }}>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">PO Ref</span>
                                    <span className="purchase-detail-value font-mono text-blue">{selectedGRN.poNumber}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Vendor</span>
                                    <span className="purchase-detail-value">{selectedGRN.vendorName}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Invoice Number</span>
                                    <span className="purchase-detail-value font-mono">{selectedGRN.invoiceNumber}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Warehouse</span>
                                    <span className="purchase-detail-value">{selectedGRN.warehouseName}</span>
                                </div>
                            </div>

                            <h4 className="purchase-detail-title">Received Item Audits</h4>
                            <div className="purchase-table-container">
                                <table className="purchase-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Expected</th>
                                            <th>Received</th>
                                            <th>Short</th>
                                            <th>Damaged</th>
                                            <th>Rejected</th>
                                            <th>Batch / Expiry</th>
                                            <th>Bin</th>
                                            <th>QC Metrics</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedGRN.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono">{item.sku}</td>
                                                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                <td>{item.expectedQty}</td>
                                                <td style={{ fontWeight: 700, color: "var(--color-success)" }}>{item.receivedQty}</td>
                                                <td style={{ color: item.shortQty > 0 ? "var(--color-warning)" : "inherit" }}>{item.shortQty}</td>
                                                <td style={{ color: item.damagedQty > 0 ? "var(--color-danger)" : "inherit" }}>{item.damagedQty}</td>
                                                <td style={{ color: item.rejectedQty > 0 ? "var(--color-danger)" : "inherit" }}>{item.rejectedQty}</td>
                                                <td>
                                                    <div style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
                                                        <span>Batch: {item.batchNumber}</span>
                                                        <span className="text-muted">Exp: {item.expiryDate}</span>
                                                    </div>
                                                </td>
                                                <td className="font-mono">{item.binAllocation}</td>
                                                <td>
                                                    {item.category === "Dairy & Bread" && (
                                                        <span className="purchase-badge approved" style={{ fontSize: "10px" }}>
                                                            {item.qcMetrics.tempReading}°C • FSSAI ✓
                                                        </span>
                                                    )}
                                                    {item.category === "Fruits & Vegetables" && (
                                                        <span className="purchase-badge approved" style={{ fontSize: "10px" }}>
                                                            {item.qcMetrics.ripenessIndex || item.qcMetrics.freshnessScale}
                                                        </span>
                                                    )}
                                                    {item.category === "Instant & Frozen Food" && (
                                                        <span className="purchase-badge approved" style={{ fontSize: "10px" }}>
                                                            Temp: {item.qcMetrics.tempReading}°C
                                                        </span>
                                                    )}
                                                    {item.category === "Medicines" && (
                                                        <span className="purchase-badge approved" style={{ fontSize: "10px" }}>
                                                            Lic ✓
                                                        </span>
                                                    )}
                                                    {item.category !== "Dairy & Bread" && item.category !== "Fruits & Vegetables" && item.category !== "Instant & Frozen Food" && item.category !== "Medicines" && (
                                                        <span className="purchase-badge draft" style={{ fontSize: "10px" }}>
                                                            QC Pass
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="purchase-modal-footer">
                            <button className="purchase-btn secondary" onClick={() => setSelectedGRN(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post GRN Modal */}
            {isCreateModalOpen && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "850px" }}>
                        <form onSubmit={handleSubmitGRN}>
                            <div className="purchase-modal-header">
                                <h3 className="purchase-modal-title">Vendor Inbound Quality Check & GRN</h3>
                                <button type="button" className="purchase-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                            </div>
                            <div className="purchase-modal-body">
                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="grnPO">Select Purchase Order to Verify</label>
                                        <select 
                                            id="grnPO"
                                            value={selectedPONumber}
                                            onChange={(e) => handlePoChange(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose PO --</option>
                                            {purchaseOrders.filter(p => ["Sent To Vendor", "Accepted", "Partially Delivered"].includes(p.status)).map(po => (
                                                <option key={po.poNumber} value={po.poNumber}>{po.poNumber} • {po.vendorName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="grnInvoiceNo">Invoice Number</label>
                                        <input 
                                            type="text" 
                                            id="grnInvoiceNo"
                                            value={invoiceNumber}
                                            onChange={(e) => setInvoiceNumber(e.target.value)}
                                            placeholder="e.g. INV-2026-908"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="grnInvoiceDate">Invoice Date</label>
                                        <input 
                                            type="date" 
                                            id="grnInvoiceDate"
                                            value={invoiceDate}
                                            onChange={(e) => setInvoiceDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label>Invoice Upload</label>
                                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                            <button 
                                                type="button" 
                                                className="purchase-btn secondary"
                                                onClick={handleInvoiceUploadMock}
                                            >
                                                <Upload size={14} />
                                                <span>Upload PDF / Image</span>
                                            </button>
                                            {invoiceImage && <span className="purchase-badge approved">Uploaded ✓</span>}
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(formItems).length > 0 ? (
                                    <div style={{ marginTop: "16px" }}>
                                        <h4 className="purchase-detail-title">Verify Item Counts & QC parameters</h4>
                                        <div style={{ overflowX: "auto" }}>
                                            {Object.keys(formItems).map(sku => {
                                                const item = formItems[sku];
                                                return (
                                                    <div key={sku} className="purchase-card" style={{ padding: "16px", marginBottom: "12px", backgroundColor: "#f8fafc" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                                            <strong>{item.productName} ({sku})</strong>
                                                            <span className="purchase-badge draft">{item.category}</span>
                                                        </div>

                                                        <div className="purchase-form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                                                            <div className="purchase-form-field">
                                                                <label>Expected Qty</label>
                                                                <input type="number" value={item.expectedQty} disabled />
                                                            </div>
                                                            <div className="purchase-form-field">
                                                                <label>Received Qty</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={item.receivedQty} 
                                                                    min="0"
                                                                    onChange={(e) => handleItemFieldChange(sku, "receivedQty", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="purchase-form-field">
                                                                <label>Damaged Qty</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={item.damagedQty} 
                                                                    min="0"
                                                                    onChange={(e) => handleItemFieldChange(sku, "damagedQty", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="purchase-form-field">
                                                                <label>Rejected Qty</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={item.rejectedQty} 
                                                                    min="0"
                                                                    onChange={(e) => handleItemFieldChange(sku, "rejectedQty", e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="purchase-form-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: "12px" }}>
                                                            <div className="purchase-form-field">
                                                                <label>Batch Code</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.batchNumber} 
                                                                    onChange={(e) => handleItemFieldChange(sku, "batchNumber", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="purchase-form-field">
                                                                <label>Expiry Date</label>
                                                                <input 
                                                                    type="date" 
                                                                    value={item.expiryDate} 
                                                                    onChange={(e) => handleItemFieldChange(sku, "expiryDate", e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="purchase-form-field">
                                                                <label>Bin Allocation</label>
                                                                <select 
                                                                    value={item.binAllocation} 
                                                                    onChange={(e) => handleItemFieldChange(sku, "binAllocation", e.target.value)}
                                                                >
                                                                    <option value="BIN-A01">BIN-A01 (General)</option>
                                                                    <option value="BIN-A02">BIN-A02 (General)</option>
                                                                    <option value="BIN-C01">BIN-C01 (Cold Storage)</option>
                                                                    <option value="BIN-M01">BIN-M01 (Pharma)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Category specific compliance panel */}
                                                        {item.category === "Fruits & Vegetables" && (
                                                            <div className="qc-category-box">
                                                                <div className="qc-category-title">
                                                                    <Award size={14} />
                                                                    <span>Fruits & Vegetables Quality Checks</span>
                                                                </div>
                                                                <div className="qc-category-fields">
                                                                    <div className="purchase-form-field">
                                                                        <label>Ripeness Scale</label>
                                                                        <select 
                                                                            value={item.qcMetrics.ripenessIndex} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.ripenessIndex", e.target.value)}
                                                                        >
                                                                            <option value="Raw">Raw</option>
                                                                            <option value="Semi-Ripe">Semi-Ripe</option>
                                                                            <option value="Fully Ripe">Fully Ripe (Optimal)</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="purchase-form-field">
                                                                        <label>Quality Grade</label>
                                                                        <select 
                                                                            value={item.qcMetrics.qualityGrade} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.qualityGrade", e.target.value)}
                                                                        >
                                                                            <option value="Grade A">Grade A (Premium)</option>
                                                                            <option value="Grade B">Grade B (Standard)</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="purchase-form-field">
                                                                        <label>Fresh Damage %</label>
                                                                        <input 
                                                                            type="number" 
                                                                            value={item.qcMetrics.damagePercent} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.damagePercent", parseInt(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.category === "Dairy & Bread" && (
                                                            <div className="qc-category-box" style={{ borderColor: "var(--color-info)" }}>
                                                                <div className="qc-category-title" style={{ color: "var(--color-info)" }}>
                                                                    <Thermometer size={14} />
                                                                    <span>Dairy Cold Chain Compliance Check (Threshold: $\le$ 4.5°C)</span>
                                                                </div>
                                                                <div className="qc-category-fields">
                                                                    <div className="purchase-form-field">
                                                                        <label>Probe Temperature Reading (°C)</label>
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.1"
                                                                            value={item.qcMetrics.tempReading} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.tempReading", parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                    <div className="purchase-form-field">
                                                                        <label>FSSAI License validation</label>
                                                                        <select 
                                                                            value={item.qcMetrics.fssaiValidated ? "Yes" : "No"} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.fssaiValidated", e.target.value === "Yes")}
                                                                        >
                                                                            <option value="Yes">License Verified ✓</option>
                                                                            <option value="No">No License Present ✗</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.category === "Instant & Frozen Food" && (
                                                            <div className="qc-category-box" style={{ borderColor: "var(--color-info)" }}>
                                                                <div className="qc-category-title" style={{ color: "var(--color-info)" }}>
                                                                    <Thermometer size={14} />
                                                                    <span>Frozen Cargo Cold Chain Check (Threshold: $\le$ -15°C)</span>
                                                                </div>
                                                                <div className="qc-category-fields">
                                                                    <div className="purchase-form-field">
                                                                        <label>Temperature Compliance (°C)</label>
                                                                        <input 
                                                                            type="number" 
                                                                            step="0.1"
                                                                            value={item.qcMetrics.tempReading} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.tempReading", parseFloat(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {item.category === "Medicines" && (
                                                            <div className="qc-category-box" style={{ borderColor: "var(--color-danger)" }}>
                                                                <div className="qc-category-title" style={{ color: "var(--color-danger)" }}>
                                                                    <ShieldAlert size={14} />
                                                                    <span>Medicines Regulatory and License checks</span>
                                                                </div>
                                                                <div className="qc-category-fields">
                                                                    <div className="purchase-form-field">
                                                                        <label>Manufacturer Drug License</label>
                                                                        <select 
                                                                            value={item.qcMetrics.licenseVerified ? "Yes" : "No"} 
                                                                            onChange={(e) => handleItemFieldChange(sku, "qcMetrics.licenseVerified", e.target.value === "Yes")}
                                                                        >
                                                                            <option value="Yes">Drug License Verified ✓</option>
                                                                            <option value="No">Verification Fail ✗</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                                        <Inbox size={32} style={{ margin: "0 auto 8px" }} />
                                        <p>Select an expected purchase order above to load inbound verification manifest.</p>
                                    </div>
                                )}
                            </div>
                            <div className="purchase-modal-footer">
                                <button type="button" className="purchase-btn secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="purchase-btn primary" disabled={Object.keys(formItems).length === 0}>
                                    Verify Quality & Post GRN
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PurchaseGRN;
