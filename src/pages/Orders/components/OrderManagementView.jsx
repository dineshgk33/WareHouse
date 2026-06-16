import React from "react";
import { Search, RefreshCw } from "lucide-react";

function OrderManagementView({
    managementSearch,
    setManagementSearch,
    filteredManagementOrders,
    selectedManagementIds,
    handleToggleAllManagementSelect,
    handleToggleManagementSelect,
    getStatusClass,
    handleTogglePriority,
    bulkActionType,
    setBulkActionType,
    handleExecuteBulkAction
}) {
    return (
        <div className="management-control-dashboard fade-in">
            {/* Priority Overrides Table */}
            <div className="management-table-container">
                <div className="management-table-header-row">
                    <h3 className="section-title">Priority Overrides & Routing Control</h3>
                    <div className="management-search-box">
                        <Search size={14} className="orders-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Quick filter priority orders..." 
                            className="orders-search-input"
                            value={managementSearch}
                            onChange={(e) => setManagementSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="orders-table-responsive">
                    <table className="orders-data-table">
                        <thead>
                            <tr>
                                <th style={{ width: "40px", textAlign: "center" }}>
                                    <input 
                                        type="checkbox"
                                        checked={filteredManagementOrders.length > 0 && selectedManagementIds.length === filteredManagementOrders.length}
                                        onChange={handleToggleAllManagementSelect}
                                    />
                                </th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Stage</th>
                                <th>Current Priority</th>
                                <th className="text-right">Action Overrides</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredManagementOrders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ textAlign: "center" }}>
                                        <input 
                                            type="checkbox"
                                            checked={selectedManagementIds.includes(order.id)}
                                            onChange={() => handleToggleManagementSelect(order.id)}
                                        />
                                    </td>
                                    <td className="font-mono font-bold">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.date}</td>
                                    <td>
                                        <span className={`orders-status-badge ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`priority-badge priority-${(order.priority || "Normal").toLowerCase()}`}>
                                            {order.priority || "Normal"}
                                        </span>
                                    </td>
                                    <td className="text-right actions-cell">
                                        <button 
                                            onClick={() => handleTogglePriority(order.id)}
                                            className="orders-inline-btn orders-inline-btn--secondary"
                                            style={{ fontSize: "11px", padding: "4px 10px" }}
                                        >
                                            <RefreshCw size={10} style={{ marginRight: "4px" }} />
                                            Toggle Priority
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredManagementOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center" style={{ padding: "40px 10px", color: "var(--text-muted)" }}>
                                        No orders match the filter search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Console */}
            <div className="management-bulk-panel">
                <h3 className="section-title">Bulk Lifecycle Controls</h3>
                <div className="bulk-controls-row">
                    <span className="bulk-selection-count">
                        <strong>{selectedManagementIds.length}</strong> orders selected
                    </span>
                    <select 
                        className="orders-toolbar-select"
                        value={bulkActionType}
                        onChange={(e) => setBulkActionType(e.target.value)}
                        style={{ width: "220px" }}
                    >
                        <option value="">Choose bulk action...</option>
                        <option value="high-priority">Set Priority to High</option>
                        <option value="critical-priority">Set Priority to Critical</option>
                        <option value="release-picking">Release to Picking Queue</option>
                        <option value="cancel">Cancel Orders</option>
                    </select>
                    <button 
                        className="orders-inline-btn orders-inline-btn--primary"
                        onClick={handleExecuteBulkAction}
                        disabled={selectedManagementIds.length === 0 || !bulkActionType}
                        style={{ height: "36px", fontSize: "13px" }}
                    >
                        Execute Action
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderManagementView;
