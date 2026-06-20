import React, { useState, useEffect } from "react";
import { 
    getRequisitions, 
    saveRequisitions,
    autoTriggerPurchaseRequisition,
    resolveWarehouseName
} from "../../services/purchaseService";
import { getInventory, addAuditLog, getProducts } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    Plus, 
    Check, 
    X, 
    Eye, 
    Trash, 
    ExternalLink, 
    FileText, 
    User,
    Calendar,
    AlertTriangle
} from "lucide-react";
import "./PurchaseStyles.css";

function PurchaseRequisition() {
    const { selectedWarehouseName, userName } = useAuth();
    const { showToast } = useToast();
    
    const [requisitions, setRequisitions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPR, setSelectedPR] = useState(null);

    // New Requisition Form State
    const [priority, setPriority] = useState("Medium");
    const [requiredDate, setRequiredDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);

    const loadData = () => {
        setRequisitions(getRequisitions());
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            loadData();
        });
    }, []);

    // Handle single item quantity request
    const handleQtyChange = (sku, val) => {
        setSelectedItems(prev => prev.map(item => 
            item.sku === sku ? { ...item, requestedQty: parseInt(val) || 0 } : item
        ));
    };

    const handleToggleProductSelection = (prod) => {
        const warehouse = selectedWarehouseName || "HAATZA Koramangala Hub";
        const resolvedWarehouse = resolveWarehouseName(warehouse);
        const ledger = getInventory().find(l => l.location === resolvedWarehouse && l.sku === prod.sku);
        const currentStock = ledger ? ledger.available : 0;
        const reorderPoint = ledger ? ledger.reorderPoint : prod.reorderLevel || 20;

        setSelectedItems(prev => {
            const exists = prev.some(item => item.sku === prod.sku);
            if (exists) {
                return prev.filter(item => item.sku !== prod.sku);
            } else {
                return [...prev, {
                    sku: prod.sku,
                    productName: prod.name,
                    currentStock,
                    reorderPoint,
                    suggestedQty: Math.max(10, reorderPoint * 3),
                    requestedQty: Math.max(10, reorderPoint * 3),
                    uom: prod.unit || "Units"
                }];
            }
        });
    };

    const handleCreatePR = (e, isDraft = false) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            showToast("Please select at least one product for this requisition.", "error");
            return;
        }

        const warehouse = selectedWarehouseName || "HAATZA Koramangala Hub";
        const resolvedWarehouse = resolveWarehouseName(warehouse);
        const prs = getRequisitions();
        const nextPrNo = `PR-${10000 + prs.length + 1}`;
        
        const newPR = {
            prNumber: nextPrNo,
            warehouseId: "DKH-001",
            warehouseName: resolvedWarehouse,
            requestedBy: userName || "Warehouse Store Manager",
            requestDate: new Date().toISOString(),
            priority,
            requiredDate: requiredDate || (() => {
                const d = new Date();
                d.setDate(d.getDate() + 3);
                return d.toISOString().split("T")[0];
            })(),
            remarks,
            status: isDraft ? "Draft" : "Submitted",
            items: selectedItems
        };

        prs.unshift(newPR);
        saveRequisitions(prs);

        addAuditLog(
            userName,
            isDraft ? "Create PR Draft" : "Submit PR",
            "Purchase Requisition",
            null,
            newPR,
            `Created requisition ${nextPrNo}`
        );

        showToast(`Purchase Requisition ${nextPrNo} created successfully!`, "success");
        setIsCreateModalOpen(false);
        // Reset states
        setPriority("Medium");
        setRequiredDate("");
        setRemarks("");
        setSelectedItems([]);
        loadData();
    };

    const handleApprovePR = (prNumber) => {
        const prs = getRequisitions();
        const index = prs.findIndex(p => p.prNumber === prNumber);
        if (index !== -1) {
            prs[index].status = "Approved";
            saveRequisitions(prs);
            addAuditLog(userName, "Approve PR", "Purchase Requisition", null, prs[index], `Approved Requisition ${prNumber}`);
            showToast(`Requisition ${prNumber} approved successfully.`, "success");
            loadData();
            if (selectedPR && selectedPR.prNumber === prNumber) {
                setSelectedPR(prs[index]);
            }
        }
    };

    const handleRejectPR = (prNumber) => {
        const prs = getRequisitions();
        const index = prs.findIndex(p => p.prNumber === prNumber);
        if (index !== -1) {
            prs[index].status = "Rejected";
            saveRequisitions(prs);
            addAuditLog(userName, "Reject PR", "Purchase Requisition", null, prs[index], `Rejected Requisition ${prNumber}`);
            showToast(`Requisition ${prNumber} rejected.`, "info");
            loadData();
            if (selectedPR && selectedPR.prNumber === prNumber) {
                setSelectedPR(prs[index]);
            }
        }
    };

    const filteredPRs = requisitions.filter(p => 
        p.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const products = getProducts();

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Purchase Requisitions</h1>
                    <p className="purchase-header-subtitle">
                        Initiate, approve, and track purchase requisitions for central warehouse replenishments.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Raise New Requisition</span>
                    </button>
                </div>
            </div>

            {/* List and Details section */}
            <div className="purchase-card">
                <div className="purchase-table-filters">
                    <input 
                        type="text" 
                        placeholder="Search by PR Number, Requestor, Warehouse..."
                        className="purchase-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>PR Number</th>
                                <th>Warehouse</th>
                                <th>Requested By</th>
                                <th>Request Date</th>
                                <th>Priority</th>
                                <th>Required Date</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPRs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                                        No purchase requisitions found. Click "Raise New Requisition" to create one.
                                    </td>
                                </tr>
                            ) : (
                                filteredPRs.map((pr) => (
                                    <tr key={pr.prNumber}>
                                        <td className="font-mono font-bold text-success" onClick={() => setSelectedPR(pr)} style={{ cursor: "pointer" }}>
                                            {pr.prNumber}
                                        </td>
                                        <td>{pr.warehouseName}</td>
                                        <td>{pr.requestedBy}</td>
                                        <td>{new Date(pr.requestDate).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`purchase-badge ${pr.priority === "Critical" ? "rejected" : pr.priority === "High" ? "intransit" : "draft"}`}>
                                                {pr.priority}
                                            </span>
                                        </td>
                                        <td>{new Date(pr.requiredDate).toLocaleDateString()}</td>
                                        <td>{pr.items.length} items</td>
                                        <td>
                                            <span className={`purchase-badge ${pr.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                                {pr.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button 
                                                    className="purchase-action-btn-sm"
                                                    onClick={() => setSelectedPR(pr)}
                                                >
                                                    <Eye size={12} />
                                                    <span>View</span>
                                                </button>
                                                {pr.status === "Submitted" && (
                                                    <>
                                                        <button 
                                                            className="purchase-action-btn-sm"
                                                            style={{ borderColor: "var(--color-success)", color: "var(--color-success)" }}
                                                            onClick={() => handleApprovePR(pr.prNumber)}
                                                        >
                                                            <Check size={12} />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button 
                                                            className="purchase-action-btn-sm"
                                                            style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
                                                            onClick={() => handleRejectPR(pr.prNumber)}
                                                        >
                                                            <X size={12} />
                                                            <span>Reject</span>
                                                        </button>
                                                    </>
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

            {/* View PR Details Modal */}
            {selectedPR && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "700px" }}>
                        <div className="purchase-modal-header">
                            <h3 className="purchase-modal-title">Requisition Details: {selectedPR.prNumber}</h3>
                            <button className="purchase-modal-close" onClick={() => setSelectedPR(null)}>×</button>
                        </div>
                        <div className="purchase-modal-body">
                            <div className="purchase-detail-meta" style={{ marginBottom: "20px" }}>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Warehouse</span>
                                    <span className="purchase-detail-value">{selectedPR.warehouseName}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Requested By</span>
                                    <span className="purchase-detail-value">{selectedPR.requestedBy}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Request Date</span>
                                    <span className="purchase-detail-value">{new Date(selectedPR.requestDate).toLocaleDateString()}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Required Date</span>
                                    <span className="purchase-detail-value">{new Date(selectedPR.requiredDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="purchase-detail-item" style={{ marginBottom: "20px" }}>
                                <span className="purchase-detail-label">Remarks</span>
                                <span className="purchase-detail-value" style={{ fontWeight: 400 }}>{selectedPR.remarks || "No remarks provided."}</span>
                            </div>

                            <h4 className="purchase-detail-title">Requested Products</h4>
                            <div className="purchase-table-container">
                                <table className="purchase-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Current Stock</th>
                                            <th>Reorder Point</th>
                                            <th>Suggested Qty</th>
                                            <th>Requested Qty</th>
                                            <th>UOM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPR.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono">{item.sku}</td>
                                                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                <td>{item.currentStock}</td>
                                                <td>{item.reorderPoint}</td>
                                                <td>{item.suggestedQty}</td>
                                                <td style={{ fontWeight: 700 }}>{item.requestedQty}</td>
                                                <td>{item.uom}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="purchase-modal-footer">
                            <button className="purchase-btn secondary" onClick={() => setSelectedPR(null)}>Close</button>
                            {selectedPR.status === "Submitted" && (
                                <>
                                    <button 
                                        className="purchase-btn danger" 
                                        onClick={() => { handleRejectPR(selectedPR.prNumber); }}
                                    >
                                        Reject Requisition
                                    </button>
                                    <button 
                                        className="purchase-btn primary" 
                                        onClick={() => { handleApprovePR(selectedPR.prNumber); }}
                                    >
                                        Approve Requisition
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create PR Modal */}
            {isCreateModalOpen && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "800px" }}>
                        <form onSubmit={(e) => handleCreatePR(e, false)}>
                            <div className="purchase-modal-header">
                                <h3 className="purchase-modal-title">Raise Procurement Requisition</h3>
                                <button type="button" className="purchase-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                            </div>
                            <div className="purchase-modal-body">
                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="prPriority">Requisition Priority</label>
                                        <select 
                                            id="prPriority"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="prRequiredDate">Required Date</label>
                                        <input 
                                            type="date" 
                                            id="prRequiredDate"
                                            value={requiredDate}
                                            onChange={(e) => setRequiredDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-field" style={{ marginBottom: "20px" }}>
                                    <label htmlFor="prRemarks">Remarks / Reason</label>
                                    <textarea 
                                        id="prRemarks" 
                                        rows="2"
                                        placeholder="Enter the justification for this purchase requisition..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    ></textarea>
                                </div>

                                <h4 className="purchase-detail-title">Select Products to Add</h4>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                                    {products.map(prod => {
                                        const isSelected = selectedItems.some(item => item.sku === prod.sku);
                                        return (
                                            <button
                                                type="button"
                                                key={prod.sku}
                                                className={`purchase-action-btn-sm ${isSelected ? "active" : ""}`}
                                                style={{ 
                                                    borderColor: isSelected ? "var(--primary)" : "var(--border-color)", 
                                                    backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-card)"
                                                }}
                                                onClick={() => handleToggleProductSelection(prod)}
                                            >
                                                <span>{prod.image} {prod.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedItems.length > 0 && (
                                    <div className="purchase-table-container">
                                        <table className="purchase-table">
                                            <thead>
                                                <tr>
                                                    <th>SKU</th>
                                                    <th>Product</th>
                                                    <th>Current Stock</th>
                                                    <th>Suggested Qty</th>
                                                    <th>Requested Qty</th>
                                                    <th>UOM</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItems.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="font-mono">{item.sku}</td>
                                                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                        <td>{item.currentStock} units</td>
                                                        <td>{item.suggestedQty}</td>
                                                        <td>
                                                            <input 
                                                                type="number" 
                                                                value={item.requestedQty}
                                                                min="1"
                                                                onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td>{item.uom}</td>
                                                        <td>
                                                            <button 
                                                                type="button"
                                                                style={{ border: "none", background: "none", color: "var(--color-danger)", cursor: "pointer" }}
                                                                onClick={() => setSelectedItems(prev => prev.filter(p => p.sku !== item.sku))}
                                                            >
                                                                <Trash size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="purchase-modal-footer">
                                <button type="button" className="purchase-btn secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="button" className="purchase-btn secondary" onClick={(e) => handleCreatePR(e, true)}>Save as Draft</button>
                                <button type="submit" className="purchase-btn primary">Submit Requisition</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PurchaseRequisition;
