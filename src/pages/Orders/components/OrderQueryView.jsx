import React from "react";
import { Search, Store, Truck, MapPin } from "lucide-react";

function OrderQueryView({
    queryIdInput,
    setQueryIdInput,
    handleRunQuery,
    orders,
    queryResult,
    getStatusClass,
    getItemsForOrder
}) {
    return (
        <div className="new-order-query-container fade-in">
            <div className="query-search-panel">
                <h3 className="section-title">Real-time Order Query & Stock Checker</h3>
                <p className="panel-desc">Query any active Order ID to inspect stock verification status and route milestones mapping.</p>
                <div className="query-input-row">
                    <div className="query-search-wrap">
                        <Search size={16} className="orders-search-icon" />
                        <input 
                            type="text"
                            placeholder="Enter Order ID (e.g. #ORD-8818, #ORD-8812...)"
                            className="orders-search-input query-input"
                            value={queryIdInput}
                            onChange={(e) => setQueryIdInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleRunQuery(); }}
                            style={{ width: "100%", fontSize: "14px", paddingLeft: "36px" }}
                        />
                    </div>
                    <button 
                        className="orders-inline-btn orders-inline-btn--primary"
                        onClick={() => handleRunQuery()}
                        style={{ height: "42px", padding: "0 24px", fontSize: "13px" }}
                    >
                        Run Query
                    </button>
                </div>
                <div className="suggestion-chips">
                    <span className="chip-label">Suggestions:</span>
                    {orders.slice(0, 5).map(o => (
                        <button 
                            key={o.id}
                            className="suggestion-chip"
                            onClick={() => { setQueryIdInput(o.id); handleRunQuery(o.id); }}
                        >
                            {o.id}
                        </button>
                    ))}
                </div>
            </div>

            {queryResult ? (
                <div className="query-results-grid">
                    {/* Stock Verification */}
                    <div className="query-stock-card">
                        <h4 className="card-title">Darkhouse Allocation Check</h4>
                        <div className="order-info-strip">
                            <span>Order: <strong className="font-mono">{queryResult.id}</strong></span>
                            <span>Customer: <strong>{queryResult.customer}</strong></span>
                            <span>Darkhouse: <strong>{queryResult.warehouse || "HAATZA Koramangala Hub"}</strong></span>
                            <span>Stage: <span className={`orders-status-badge ${getStatusClass(queryResult.status)}`}>{queryResult.status}</span></span>
                        </div>
                        <table className="query-stock-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>SKU Code</th>
                                    <th>Qty</th>
                                    <th>Allocated Bin</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getItemsForOrder(queryResult).map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td className="font-mono">{item.sku}</td>
                                        <td>{item.qty} units</td>
                                        <td className="font-mono">BIN-{(idx * 3) + 12}-A</td>
                                        <td>
                                            <span className="stock-badge in-stock" style={{ color: "#10b981", fontWeight: "700" }}>✓ In Stock</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Dispatch Route */}
                    <div className="query-route-card">
                        <h4 className="card-title">Simulated Dispatch Route Mapped</h4>
                        <p className="card-subtitle">Milestones from origin Darkhouse to shipping destination.</p>
                        
                        <div className="route-flowchart">
                            <div className="route-node origin">
                                <div className="node-icon" style={{ backgroundColor: "#3b82f6", color: "white" }}><Store size={14} /></div>
                                <div className="node-info">
                                    <span className="node-label">Origin Hub</span>
                                    <strong className="node-value">{queryResult.warehouse || "HAATZA Koramangala Hub"}</strong>
                                </div>
                            </div>
                            <div className="route-line-connector">
                                <div className="route-line-pulse"></div>
                            </div>
                            <div className="route-node transit">
                                <div className="node-icon" style={{ backgroundColor: "#f59e0b", color: "white" }}><Truck size={14} /></div>
                                <div className="node-info">
                                    <span className="node-label">Dispatch Courier</span>
                                    <strong className="node-value">{["Shipped", "Delivered"].includes(queryResult.status) ? "Amit Patel (Rider #882)" : "Awaiting Picker Handoff"}</strong>
                                </div>
                            </div>
                            <div className="route-line-connector"></div>
                            <div className="route-node destination">
                                <div className="node-icon" style={{ backgroundColor: "#10b981", color: "white" }}><MapPin size={14} /></div>
                                <div className="node-info">
                                    <span className="node-label">Destination Address</span>
                                    <strong className="node-value">Dwarka Sector-4, New Delhi - 110075</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="query-empty-state">
                    Enter an active Order ID above to check inventory allocations and courier progress.
                </div>
            )}
        </div>
    );
}

export default OrderQueryView;
