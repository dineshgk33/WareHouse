import React from "react";
import { Search, Printer } from "lucide-react";
import { Barcode128Svg } from "../../../utils/barcode";

function OrderDetailInspector({
    selectedInspectorOrder,
    filteredInspectorOrders,
    inspectorSearch,
    setInspectorSearch,
    setSelectedInspectorOrderId,
    handlePrintLabel,
    setOrders,
    setPicks,
    setPacks,
    setDeliveries,
    picks,
    packs,
    deliveries,
    openPickAssign,
    handleCompletePick,
    handleStartPacking,
    handleCompletePack,
    openDlvUpdate,
    showToast,
    getItemsForOrder,
    getCategoryForProduct,
    getStatusClass
}) {
    return (
        <div className="details-inspector-container fade-in">
            {/* Left Column: List selector */}
            <div className="details-inspector-left">
                <div className="inspector-search-box">
                    <Search size={14} className="orders-search-icon" />
                    <input 
                        type="text"
                        placeholder="Search ID or customer..."
                        className="orders-search-input"
                        value={inspectorSearch}
                        onChange={(e) => setInspectorSearch(e.target.value)}
                        style={{ width: "100%" }}
                    />
                </div>
                <div className="inspector-orders-list">
                    {filteredInspectorOrders.map(o => (
                        <div 
                            key={o.id}
                            className={`inspector-order-row ${selectedInspectorOrder?.id === o.id ? "active" : ""}`}
                            onClick={() => setSelectedInspectorOrderId(o.id)}
                        >
                            <div className="inspector-row-top">
                                <span className="order-id font-mono">{o.id}</span>
                                <span className="order-date">{o.date}</span>
                            </div>
                            <div className="inspector-row-bottom">
                                <span className="customer-name">{o.customer}</span>
                                <span className={`orders-status-badge ${getStatusClass(o.status)}`}>
                                    {o.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredInspectorOrders.length === 0 && (
                        <div className="inspector-empty">No matching orders found.</div>
                    )}
                </div>
            </div>

            {/* Right Column: Detailed inspect panel */}
            <div className="details-inspector-right">
                {selectedInspectorOrder ? (
                    <div className="inspector-details-card">
                        <div className="details-card-header">
                            <div>
                                <h3 className="inspector-card-title">Order {selectedInspectorOrder.id} Inspector</h3>
                                <p className="customer-info">Customer: <strong>{selectedInspectorOrder.customer}</strong> | Mobile: <strong>{selectedInspectorOrder.mobile || "+91 99880 12345"}</strong></p>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button 
                                    className="orders-inline-btn orders-inline-btn--secondary"
                                    onClick={() => handlePrintLabel(selectedInspectorOrder.id)}
                                >
                                    <Printer size={14} style={{ marginRight: "4px" }} />
                                    <span>Print Tag</span>
                                </button>
                                {(() => {
                                    const status = selectedInspectorOrder.status;
                                    if (status === "Pending") {
                                        return (
                                            <button 
                                                className="orders-inline-btn orders-inline-btn--success"
                                                onClick={() => {
                                                    setOrders(prev => prev.map(o => o.id === selectedInspectorOrder.id ? { ...o, status: "Picking" } : o));
                                                    setPicks(prev => {
                                                        if (prev.some(p => p.orderId === selectedInspectorOrder.id)) return prev;
                                                        return [...prev, {
                                                            id: `PCK-${Math.floor(4000 + Math.random() * 1000)}`,
                                                            orderId: selectedInspectorOrder.id,
                                                            customer: selectedInspectorOrder.customer,
                                                            picker: "Unassigned",
                                                            productsCount: selectedInspectorOrder.items || 1,
                                                            status: "Pending"
                                                        }];
                                                    });
                                                    showToast(`Released order ${selectedInspectorOrder.id} to picking queue`);
                                                }}
                                            >
                                                <span>⚡ Release to Picking</span>
                                            </button>
                                        );
                                    }
                                    if (status === "Picking") {
                                        const pick = picks.find(p => p.orderId === selectedInspectorOrder.id);
                                        if (!pick || pick.status === "Pending") {
                                            return (
                                                <button 
                                                    className="orders-inline-btn"
                                                    onClick={() => openPickAssign(pick || {
                                                        id: `PCK-TEMP`,
                                                        orderId: selectedInspectorOrder.id,
                                                        customer: selectedInspectorOrder.customer,
                                                        picker: "Unassigned",
                                                        productsCount: selectedInspectorOrder.items || 1
                                                    })}
                                                >
                                                    <span>👤 Assign Picker</span>
                                                </button>
                                            );
                                        }
                                        if (pick.status === "Assigned") {
                                            return (
                                                <button 
                                                    className="orders-inline-btn orders-inline-btn--success"
                                                    onClick={() => handleCompletePick(pick.id)}
                                                >
                                                    <span>✓ Complete Picking</span>
                                                </button>
                                            );
                                        }
                                    }
                                    if (status === "Packing") {
                                        const pack = packs.find(p => p.orderId === selectedInspectorOrder.id);
                                        if (pack) {
                                            if (pack.status === "Waiting") {
                                                return (
                                                    <button 
                                                        className="orders-inline-btn"
                                                        onClick={() => handleStartPacking(pack.id)}
                                                    >
                                                        <span>📦 Start Packing</span>
                                                    </button>
                                                );
                                            }
                                            if (pack.status === "Packing") {
                                                return (
                                                    <button 
                                                        className="orders-inline-btn orders-inline-btn--success"
                                                        onClick={() => handleCompletePack(pack.id)}
                                                    >
                                                        <span>✓ Complete Packing</span>
                                                    </button>
                                                );
                                            }
                                        } else {
                                            // Fallback pick completion check
                                            return (
                                                <button 
                                                    className="orders-inline-btn"
                                                    onClick={() => {
                                                        setPacks(prev => {
                                                            if (prev.some(p => p.orderId === selectedInspectorOrder.id)) return prev;
                                                            return [...prev, {
                                                                id: `PAK-${Math.floor(5000 + Math.random() * 1000)}`,
                                                                orderId: selectedInspectorOrder.id,
                                                                customer: selectedInspectorOrder.customer,
                                                                packedBy: "Unassigned",
                                                                items: selectedInspectorOrder.items || 1,
                                                                status: "Waiting"
                                                            }];
                                                        });
                                                        showToast(`Initialized packing ticket for ${selectedInspectorOrder.id}`);
                                                    }}
                                                >
                                                    <span>📦 Start packing ticket</span>
                                                </button>
                                            );
                                        }
                                    }
                                    if (status === "Ready for Dispatch" || status === "Packed") {
                                        const dlv = deliveries.find(d => d.orderId === selectedInspectorOrder.id);
                                        return (
                                            <button 
                                                className="orders-inline-btn"
                                                onClick={() => openDlvUpdate(dlv || {
                                                    id: `DLV-TEMP`,
                                                    orderId: selectedInspectorOrder.id,
                                                    customer: selectedInspectorOrder.customer,
                                                    rider: "Unassigned",
                                                    status: "Assigned",
                                                    location: selectedInspectorOrder.warehouse || "Warehouse Hub",
                                                    eta: "Pending Assignment"
                                                })}
                                            >
                                                <span>🚚 Assign Rider & Ship</span>
                                            </button>
                                        );
                                    }
                                    if (status === "Shipped" || status === "Out for Delivery") {
                                        const dlv = deliveries.find(d => d.orderId === selectedInspectorOrder.id);
                                        return (
                                            <button 
                                                className="orders-inline-btn orders-inline-btn--success"
                                                onClick={() => {
                                                    if (dlv) {
                                                        setDeliveries(prev => prev.map(d => d.id === dlv.id ? { ...d, status: "Delivered", eta: "Completed" } : d));
                                                    }
                                                    setOrders(prev => prev.map(o => o.id === selectedInspectorOrder.id ? { ...o, status: "Delivered" } : o));
                                                    showToast(`Marked order ${selectedInspectorOrder.id} as Delivered`);
                                                }}
                                            >
                                                <span>✓ Mark Delivered</span>
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>

                        {/* Items Mapped */}
                        <div className="inspector-section">
                            <h4 className="inspector-section-title">Ordered Items Allocation</h4>
                            <table className="inspector-items-table">
                                <thead>
                                    <tr>
                                        <th>Item Description</th>
                                        <th>Category</th>
                                        <th>SKU Code</th>
                                        <th className="text-center">Qty Requested</th>
                                        <th className="text-right">Unit Rate</th>
                                        <th className="text-right">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getItemsForOrder(selectedInspectorOrder).map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td>
                                                <span className="category-tag">{getCategoryForProduct(item.name, item.sku)}</span>
                                            </td>
                                            <td className="font-mono">{item.sku}</td>
                                            <td className="text-center font-bold">{item.qty}</td>
                                            <td className="text-right">₹{item.price.toFixed(2)}</td>
                                            <td className="text-right font-bold">₹{(item.qty * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Progress Timeline */}
                        <div className="inspector-section">
                            <h4 className="inspector-section-title">Progress Execution Timeline</h4>
                            <div className="execution-timeline">
                                {(() => {
                                    const stages = ["Pending", "Picking", "Packing", "Ready To Dispatch", "Shipped", "Delivered"];
                                    const normalizeStatus = (st) => {
                                        switch (st) {
                                            case "Pending": return "Pending";
                                            case "Picking": return "Picking";
                                            case "Packing":
                                            case "Processing": return "Packing";
                                            case "Label Generated":
                                            case "Ready for Dispatch":
                                            case "Ready To Dispatch":
                                            case "Packed": return "Ready To Dispatch";
                                            case "Shipped":
                                            case "Out for Delivery": return "Shipped";
                                            case "Delivered": return "Delivered";
                                            default: return "Pending";
                                        }
                                    };
                                    const normalizedStatus = normalizeStatus(selectedInspectorOrder.status);
                                    const currentStageIdx = stages.indexOf(normalizedStatus);
                                    return stages.map((stage, idx) => {
                                        let isDone = idx <= currentStageIdx;
                                        let isCurrent = idx === currentStageIdx;
                                        
                                        // Handle cancelled state override
                                        if (selectedInspectorOrder.status === "Cancelled") {
                                            isDone = false;
                                            isCurrent = false;
                                        }
                                        
                                        return (
                                            <div key={idx} className={`timeline-step ${isDone ? "step-done" : ""} ${isCurrent ? "step-current" : ""} ${selectedInspectorOrder.status === "Cancelled" ? "step-cancelled" : ""}`}>
                                                <div className="step-marker">
                                                    {selectedInspectorOrder.status === "Cancelled" ? "✗" : (isDone ? "✓" : idx + 1)}
                                                </div>
                                                <div className="step-label-wrap">
                                                    <span className="step-label">{stage}</span>
                                                    {isDone && <span className="step-time">{idx === 0 ? "10:15 AM" : idx === 1 ? "10:30 AM" : idx === 2 ? "11:00 AM" : idx === 3 ? "11:15 AM" : idx === 4 ? "11:45 AM" : "12:10 PM"}</span>}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Label Preview */}
                        <div className="inspector-section">
                            <h4 className="inspector-section-title">Shipping Barcode Tag Sheet</h4>
                            <div className="shipping-label-card">
                                <div className="label-logo-row">
                                    <span className="label-logo">HAATZA</span>
                                    <span className="label-method">EXPRESS WAREHOUSE LOGISTICS</span>
                                </div>
                                <div className="label-main-grid">
                                    <div className="label-address">
                                        <span className="label-title">SHIP TO:</span>
                                        <strong>{selectedInspectorOrder.customer}</strong>
                                        <span>{selectedInspectorOrder.mobile || "+91 99880 12345"}</span>
                                        <span>Sector 4, Dwarka, New Delhi - 110075</span>
                                    </div>
                                    <div className="label-meta-details">
                                        <div><span className="meta-label">ORDER REFERENCE:</span> <span className="meta-val font-mono font-bold">{selectedInspectorOrder.id}</span></div>
                                        <div><span className="meta-label">DISPATCH DATE:</span> <span className="meta-val">{selectedInspectorOrder.date}</span></div>
                                        <div><span className="meta-label">PAYMENT CHANNEL:</span> <span className="meta-val font-bold">{selectedInspectorOrder.payment}</span></div>
                                    </div>
                                </div>
                                <div className="label-barcode-section">
                                    <div 
                                        className="barcode-container" 
                                        style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}
                                        dangerouslySetInnerHTML={{
                                            __html: (() => {
                                                const barcode = new Barcode128Svg(selectedInspectorOrder.id);
                                                barcode.height = 50;
                                                barcode.factor = 1.8;
                                                return barcode.toString();
                                            })()
                                        }}
                                    />
                                    <span className="barcode-text font-mono">{selectedInspectorOrder.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="inspector-empty-state">
                        Select an order from the list on the left to inspect detailed properties.
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetailInspector;
