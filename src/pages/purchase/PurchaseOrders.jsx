import React, { useState, useEffect } from "react";
import { 
    getPurchaseOrders, 
    savePurchaseOrders,
    getVendors,
    getRequisitions,
    saveRequisitions,
    resolveWarehouseName
} from "../../services/purchaseService";
import { getProducts, addAuditLog } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    Plus, 
    Check, 
    X, 
    Eye, 
    FileText, 
    ShoppingCart, 
    Calendar,
    User,
    ArrowRight
} from "lucide-react";
import "./PurchaseStyles.css";

function PurchaseOrders() {
    const { selectedWarehouseName, userName } = useAuth();
    const { showToast } = useToast();

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);

    // Form State
    const [selectedVendorCode, setSelectedVendorCode] = useState("");
    const [selectedPRNumber, setSelectedPRNumber] = useState("");
    const [expectedDate, setExpectedDate] = useState("");
    const [paymentTerms, setPaymentTerms] = useState("Net 30");
    const [taxPercent, setTaxPercent] = useState(5);
    const [freightCharges, setFreightCharges] = useState(500);
    const [poItems, setPoItems] = useState([]);

    const loadData = () => {
        setPurchaseOrders(getPurchaseOrders());
    };

    useEffect(() => {
        loadData();
    }, []);

    const vendors = getVendors();
    const approvedPRs = getRequisitions().filter(r => r.status === "Approved");
    const allProducts = getProducts();

    // Auto-populate items when PR is selected
    useEffect(() => {
        if (selectedPRNumber) {
            const pr = approvedPRs.find(r => r.prNumber === selectedPRNumber);
            if (pr) {
                const items = pr.items.map(itm => {
                    const prod = allProducts.find(p => p.sku === itm.sku) || {};
                    const unitCost = prod.sellingPrice || 100;
                    return {
                        sku: itm.sku,
                        productName: itm.productName,
                        quantity: itm.requestedQty,
                        receivedQty: 0,
                        unitCost,
                        totalCost: itm.requestedQty * unitCost
                    };
                });
                setPoItems(items);
            }
        }
    }, [selectedPRNumber]);

    // Handle individual item cost changes
    const handleCostQtyChange = (sku, field, value) => {
        const val = parseFloat(value) || 0;
        setPoItems(prev => prev.map(item => {
            if (item.sku === sku) {
                const qty = field === "quantity" ? val : item.quantity;
                const cost = field === "unitCost" ? val : item.unitCost;
                return {
                    ...item,
                    quantity: field === "quantity" ? parseInt(value) || 0 : item.quantity,
                    unitCost: field === "unitCost" ? parseFloat(value) || 0 : item.unitCost,
                    totalCost: qty * cost
                };
            }
            return item;
        }));
    };

    // Calculate dynamic totals
    const subTotal = poItems.reduce((sum, item) => sum + item.totalCost, 0);
    const taxAmount = Math.round(subTotal * (taxPercent / 100));
    const totalCost = subTotal + taxAmount + parseFloat(freightCharges || 0);

    const handleCreatePO = (e, isDraft = false) => {
        e.preventDefault();
        if (poItems.length === 0) {
            showToast("Please add at least one product to the purchase order.", "error");
            return;
        }
        if (!selectedVendorCode) {
            showToast("Please select a vendor.", "error");
            return;
        }

        const vendor = vendors.find(v => v.vendorCode === selectedVendorCode);
        const warehouse = selectedWarehouseName || "HAATZA Koramangala Hub";
        const resolvedWarehouse = resolveWarehouseName(warehouse);
        const pos = getPurchaseOrders();
        const nextPoNo = `PO-${20000 + pos.length + 1}`;

        const newPO = {
            poNumber: nextPoNo,
            prNumber: selectedPRNumber || undefined,
            vendorCode: selectedVendorCode,
            vendorName: vendor ? vendor.vendorName : "Unknown Vendor",
            warehouseId: "DKH-001",
            warehouseName: resolvedWarehouse,
            orderDate: new Date().toISOString(),
            expectedDeliveryDate: expectedDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            paymentTerms,
            taxPercent: parseFloat(taxPercent),
            freightCharges: parseFloat(freightCharges),
            subTotal,
            taxAmount,
            totalCost,
            status: isDraft ? "Draft" : "Approved",
            items: poItems
        };

        pos.unshift(newPO);
        savePurchaseOrders(pos);

        // Update Requisition status to "Converted To PO" if linked
        if (selectedPRNumber) {
            const prs = getRequisitions();
            const prIndex = prs.findIndex(r => r.prNumber === selectedPRNumber);
            if (prIndex !== -1) {
                prs[prIndex].status = "Converted To PO";
                saveRequisitions(prs);
            }
        }

        addAuditLog(
            userName,
            isDraft ? "Create PO Draft" : "Create PO Approved",
            "Purchase Order",
            null,
            newPO,
            `Created Purchase Order ${nextPoNo}`
        );

        showToast(`Purchase Order ${nextPoNo} created successfully!`, "success");
        setIsCreateModalOpen(false);
        // Reset states
        setSelectedVendorCode("");
        setSelectedPRNumber("");
        setExpectedDate("");
        setPoItems([]);
        loadData();
    };

    const handlePOAction = (poNumber, nextStatus, logMsg) => {
        const pos = getPurchaseOrders();
        const index = pos.findIndex(p => p.poNumber === poNumber);
        if (index !== -1) {
            pos[index].status = nextStatus;
            savePurchaseOrders(pos);
            addAuditLog(userName, logMsg, "Purchase Order", null, pos[index], `${logMsg} PO ${poNumber}`);
            showToast(`Purchase Order ${poNumber} updated to ${nextStatus}.`, "success");
            loadData();
            if (selectedPO && selectedPO.poNumber === poNumber) {
                setSelectedPO(pos[index]);
            }
        }
    };

    const filteredPOs = purchaseOrders.filter(p => 
        p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Purchase Orders (PO)</h1>
                    <p className="purchase-header-subtitle">
                        Create, dispatch, and track inbound vendor purchase orders and contract costs.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Create Purchase Order</span>
                    </button>
                </div>
            </div>

            {/* List and Details section */}
            <div className="purchase-card">
                <div className="purchase-table-filters">
                    <input 
                        type="text" 
                        placeholder="Search by PO Number, Vendor, Status..."
                        className="purchase-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>PR Ref</th>
                                <th>Vendor</th>
                                <th>Order Date</th>
                                <th>Expected ETA</th>
                                <th>Total Cost</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                                        No purchase orders found. Click "Create Purchase Order" to raise one.
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => (
                                    <tr key={po.poNumber}>
                                        <td className="font-mono font-bold text-success" onClick={() => setSelectedPO(po)} style={{ cursor: "pointer" }}>
                                            {po.poNumber}
                                        </td>
                                        <td className="font-mono">{po.prNumber || "Direct PO"}</td>
                                        <td style={{ fontWeight: 600 }}>{po.vendorName}</td>
                                        <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                                        <td>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 700 }}>₹{po.totalCost.toLocaleString()}</td>
                                        <td>
                                            <span className={`purchase-badge ${po.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button 
                                                    className="purchase-action-btn-sm"
                                                    onClick={() => setSelectedPO(po)}
                                                >
                                                    <Eye size={12} />
                                                    <span>View</span>
                                                </button>
                                                {po.status === "Approved" && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                                                        onClick={() => handlePOAction(po.poNumber, "Sent To Vendor", "Send to Vendor")}
                                                    >
                                                        <ArrowRight size={12} />
                                                        <span>Send To Vendor</span>
                                                    </button>
                                                )}
                                                {po.status === "Sent To Vendor" && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--color-success)", color: "var(--color-success)" }}
                                                        onClick={() => handlePOAction(po.poNumber, "Accepted", "Accept PO")}
                                                    >
                                                        <Check size={12} />
                                                        <span>Accept</span>
                                                    </button>
                                                )}
                                                {["Draft", "Approved", "Sent To Vendor"].includes(po.status) && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
                                                        onClick={() => handlePOAction(po.poNumber, "Cancelled", "Cancel PO")}
                                                    >
                                                        <X size={12} />
                                                        <span>Cancel</span>
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
            </div>

            {/* View PO Details Modal */}
            {selectedPO && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "700px" }}>
                        <div className="purchase-modal-header">
                            <h3 className="purchase-modal-title">Purchase Order Details: {selectedPO.poNumber}</h3>
                            <button className="purchase-modal-close" onClick={() => setSelectedPO(null)}>×</button>
                        </div>
                        <div className="purchase-modal-body">
                            <div className="purchase-detail-meta" style={{ marginBottom: "20px" }}>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Vendor</span>
                                    <span className="purchase-detail-value">{selectedPO.vendorName}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Order Date</span>
                                    <span className="purchase-detail-value">{new Date(selectedPO.orderDate).toLocaleDateString()}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Expected Delivery</span>
                                    <span className="purchase-detail-value">{new Date(selectedPO.expectedDeliveryDate).toLocaleDateString()}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Payment Terms</span>
                                    <span className="purchase-detail-value">{selectedPO.paymentTerms}</span>
                                </div>
                            </div>

                            <h4 className="purchase-detail-title">PO Products List</h4>
                            <div className="purchase-table-container" style={{ marginBottom: "20px" }}>
                                <table className="purchase-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Ordered Qty</th>
                                            <th>Received Qty</th>
                                            <th>Unit Cost</th>
                                            <th>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPO.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono">{item.sku}</td>
                                                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                <td>{item.quantity} units</td>
                                                <td style={{ fontWeight: 700, color: "var(--color-success)" }}>{item.receivedQty || 0}</td>
                                                <td>₹{item.unitCost}</td>
                                                <td style={{ fontWeight: 700 }}>₹{item.totalCost.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Summary */}
                            <div style={{ display: "flex", justifyContent: "flex-end", textAlign: "right" }}>
                                <div style={{ width: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="purchase-detail-label">Subtotal</span>
                                        <span style={{ fontWeight: 600 }}>₹{selectedPO.subTotal.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="purchase-detail-label">Tax ({selectedPO.taxPercent}%)</span>
                                        <span style={{ fontWeight: 600 }}>₹{selectedPO.taxAmount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="purchase-detail-label">Freight</span>
                                        <span style={{ fontWeight: 600 }}>₹{selectedPO.freightCharges.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
                                        <span style={{ fontWeight: 800, fontSize: "14px" }}>Total Cost</span>
                                        <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--primary)" }}>
                                            ₹{selectedPO.totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="purchase-modal-footer">
                            <button className="purchase-btn secondary" onClick={() => setSelectedPO(null)}>Close</button>
                            {selectedPO.status === "Approved" && (
                                <button 
                                    className="purchase-btn primary"
                                    onClick={() => handlePOAction(selectedPO.poNumber, "Sent To Vendor", "Send to Vendor")}
                                >
                                    Send to Vendor
                                </button>
                            )}
                            {selectedPO.status === "Sent To Vendor" && (
                                <button 
                                    className="purchase-btn primary"
                                    onClick={() => handlePOAction(selectedPO.poNumber, "Accepted", "Accept PO")}
                                >
                                    Accept PO Contract
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create PO Modal */}
            {isCreateModalOpen && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "800px" }}>
                        <form onSubmit={(e) => handleCreatePO(e, false)}>
                            <div className="purchase-modal-header">
                                <h3 className="purchase-modal-title">Formulate Inbound Purchase Order</h3>
                                <button type="button" className="purchase-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                            </div>
                            <div className="purchase-modal-body">
                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="poVendor">Select Target Vendor</label>
                                        <select 
                                            id="poVendor"
                                            value={selectedVendorCode}
                                            onChange={(e) => setSelectedVendorCode(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose Vendor --</option>
                                            {vendors.map(v => (
                                                <option key={v.vendorCode} value={v.vendorCode}>{v.vendorName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="poPR">Link Approved Requisition (Optional)</label>
                                        <select 
                                            id="poPR"
                                            value={selectedPRNumber}
                                            onChange={(e) => setSelectedPRNumber(e.target.value)}
                                        >
                                            <option value="">-- Direct PO (No PR) --</option>
                                            {approvedPRs.map(r => (
                                                <option key={r.prNumber} value={r.prNumber}>{r.prNumber} • {r.requestedBy} ({r.items.length} lines)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="poExpectedDate">Expected Delivery Date</label>
                                        <input 
                                            type="date" 
                                            id="poExpectedDate"
                                            value={expectedDate}
                                            onChange={(e) => setExpectedDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="poPayment">Payment Terms</label>
                                        <select 
                                            id="poPayment"
                                            value={paymentTerms}
                                            onChange={(e) => setPaymentTerms(e.target.value)}
                                        >
                                            <option value="Net 15">Net 15 Days</option>
                                            <option value="Net 30">Net 30 Days</option>
                                            <option value="Net 45">Net 45 Days</option>
                                            <option value="Cash on Delivery">Cash on Delivery</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="poTax">GST Tax Percent (%)</label>
                                        <input 
                                            type="number" 
                                            id="poTax"
                                            value={taxPercent}
                                            min="0"
                                            max="100"
                                            onChange={(e) => setTaxPercent(e.target.value)}
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="poFreight">Freight Charges (₹)</label>
                                        <input 
                                            type="number" 
                                            id="poFreight"
                                            value={freightCharges}
                                            min="0"
                                            onChange={(e) => setFreightCharges(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {poItems.length > 0 ? (
                                    <div className="purchase-table-container" style={{ marginTop: "16px" }}>
                                        <table className="purchase-table">
                                            <thead>
                                                <tr>
                                                    <th>SKU</th>
                                                    <th>Product</th>
                                                    <th>Quantity</th>
                                                    <th>Unit Cost (₹)</th>
                                                    <th>Total Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {poItems.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="font-mono">{item.sku}</td>
                                                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                value={item.quantity}
                                                                min="1"
                                                                onChange={(e) => handleCostQtyChange(item.sku, "quantity", e.target.value)}
                                                                style={{ width: "70px" }}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                value={item.unitCost}
                                                                min="0.1"
                                                                step="0.01"
                                                                onChange={(e) => handleCostQtyChange(item.sku, "unitCost", e.target.value)}
                                                                style={{ width: "90px" }}
                                                                required
                                                            />
                                                        </td>
                                                        <td style={{ fontWeight: 700 }}>₹{item.totalCost.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)", border: "1px dashed var(--border-color)" }}>
                                        No products loaded yet. Select a linked requisition or add direct products.
                                    </div>
                                )}
                            </div>
                            <div className="purchase-modal-footer">
                                <button type="button" className="purchase-btn secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="button" className="purchase-btn secondary" onClick={(e) => handleCreatePO(e, true)}>Save as Draft</button>
                                <button type="submit" className="purchase-btn primary">Approve & Generate PO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PurchaseOrders;
