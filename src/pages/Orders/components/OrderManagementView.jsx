import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, RefreshCw, ClipboardList, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Barcode128Svg } from "../../../utils/barcode";

// Dynamic SLA Timer for Zepto operations dashboard
function SLATimer({ order }) {
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (order.status === "Delivered" || order.status === "Cancelled") {
            return 0;
        }

        const seedValue = order.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        if (order.priority === "Critical") {
            return -20 - (seedValue % 60); // Overdue by 20 to 80 seconds
        } else if (order.priority === "High") {
            return 30 + (seedValue % 90);  // 30 to 120 seconds remaining (Warning zone)
        } else {
            return 180 + (seedValue % 240); // 180 to 420 seconds remaining (Safe zone)
        }
    });

    useEffect(() => {
        if (order.status === "Delivered" || order.status === "Cancelled") {
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [order.status]);

    if (order.status === "Delivered") {
        const seedValue = order.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const mins = 6 + (seedValue % 3);
        const secs = 15 + (seedValue % 45);
        return (
            <div className="sla-container">
                <div className="sla-timer-row">
                    <span className="sla-badge sla-badge--delivered">
                        <CheckCircle2 size={11} />
                        <span>Delivered ({mins}m {secs}s)</span>
                    </span>
                    <span className="priority-badge-mini priority-normal">
                        {order.priority || "Normal"}
                    </span>
                </div>
                <div className="sla-progress-track">
                    <div className="sla-progress-bar bg-delivered" style={{ width: "100%" }}></div>
                </div>
            </div>
        );
    }

    if (order.status === "Cancelled") {
        return (
            <div className="sla-container">
                <div className="sla-timer-row">
                    <span className="sla-badge sla-badge--cancelled">
                        <XCircle size={11} />
                        <span>Cancelled</span>
                    </span>
                    <span className="priority-badge-mini priority-normal">
                        {order.priority || "Normal"}
                    </span>
                </div>
                <div className="sla-progress-track">
                    <div className="sla-progress-bar bg-cancelled" style={{ width: "0%" }}></div>
                </div>
            </div>
        );
    }

    const isOverdue = secondsLeft < 0;
    const absSeconds = Math.abs(secondsLeft);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const formattedTime = `${isOverdue ? "-" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    const maxSLA = order.priority === "Critical" ? 120 : order.priority === "High" ? 300 : 600;
    const pct = isOverdue ? 0 : Math.max(0, Math.min(100, (secondsLeft / maxSLA) * 100));

    let slaClass = "sla-badge--normal";
    let slaLabel = "SLA";
    let barColor = "bg-normal";
    let Icon = Clock;

    let stageLabel = "Pack SLA";
    if (order.status === "Pending") stageLabel = "Pick SLA";
    else if (order.status === "Processing") stageLabel = "Pack SLA";
    else if (order.status === "Shipped") stageLabel = "Transit SLA";

    if (isOverdue) {
        slaClass = "sla-badge--critical";
        slaLabel = "Overdue";
        barColor = "bg-critical";
        Icon = AlertTriangle;
    } else if (secondsLeft < 120) {
        slaClass = "sla-badge--warning";
        slaLabel = "Warning";
        barColor = "bg-warning";
        Icon = Clock;
    }

    return (
        <div className="sla-container">
            <div className="sla-timer-row">
                <span className={`sla-badge ${slaClass}`}>
                    <Icon size={11} className={isOverdue ? "blink-warning" : ""} />
                    <span>{formattedTime} {slaLabel} ({stageLabel})</span>
                </span>
                <span className={`priority-badge-mini priority-${(order.priority || "Normal").toLowerCase()}`}>
                    {order.priority || "Normal"}
                </span>
            </div>
            <div className="sla-progress-track">
                <div className={`sla-progress-bar ${barColor}`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}

import DrawerHeader from "./DrawerHeader";
import DrawerContent from "./DrawerContent";

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
    handleExecuteBulkAction,
    getItemsForOrder,
    handleGenerateInvoice,
    openOrdEdit,
    handleReadyToDispatch
}) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const activeOrder = selectedOrder ? (filteredManagementOrders.find(o => o.id === selectedOrder.id) || selectedOrder) : null;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("order"); // "order" or "customer"

    const openOrderDetails = useCallback((order) => {
        setSelectedOrder(order);
        setSelectedType("order");
        setDrawerOpen(true);
    }, []);

    const openCustomerDetails = useCallback((order) => {
        const custDetails = {
            name: order.customer,
            email: `${order.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: order.mobile || "+91 99880 12345",
            status: "Active",
            segment: order.priority === "Critical" ? "VIP Customer" : "Regular Customer",
            joinDate: "12 Jan 2025",
            totalOrders: order.items || 3,
            totalSpend: order.amount,
            address: "Sector 4, Dwarka, New Delhi - 110075",
            notes: "Prefers delivery in the evening hours. Very responsive to communications."
        };
        setSelectedCustomer(custDetails);
        setSelectedType("customer");
        setDrawerOpen(true);
    }, []);

    const closeDrawer = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    return (
        <div className="management-view-layout fade-in">
            <div className="management-left-content">
                <div className="management-control-dashboard">
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
                                <th>Fulfillment SLA</th>
                                <th className="text-right">Action Overrides</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredManagementOrders.map(order => {
                                const isSelected = selectedType === "order" && activeOrder?.id === order.id;
                                return (
                                    <tr 
                                        key={order.id}
                                        className={`orders-table-row-clickable ${isSelected ? "selected-row" : ""}`}
                                        onClick={() => openOrderDetails(order)}
                                    >
                                        <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox"
                                                checked={selectedManagementIds.includes(order.id)}
                                                onChange={() => handleToggleManagementSelect(order.id)}
                                            />
                                        </td>
                                        <td className="font-mono font-bold">
                                            <span 
                                                className="clickable-order-id" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openOrderDetails(order);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.stopPropagation();
                                                        openOrderDetails(order);
                                                    }
                                                }}
                                            >
                                                {order.id}
                                            </span>
                                        </td>
                                        <td>
                                            <span 
                                                className="clickable-customer-name" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openCustomerDetails(order);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.stopPropagation();
                                                        openCustomerDetails(order);
                                                    }
                                                }}
                                            >
                                                {order.customer}
                                            </span>
                                        </td>
                                        <td>{order.date}</td>
                                        <td>
                                            <span className={`orders-status-badge ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="table-text font-medium">
                                            <SLATimer key={`${order.id}-${order.priority}-${order.status}`} order={order} />
                                        </td>
                                        <td className="text-right actions-cell" onClick={(e) => e.stopPropagation()}>
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
                                );
                            })}
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
            </div>

            {/* Right Details Drawer Portal */}
            {createPortal(
                <>
                    {/* Drawer Backdrop Overlay */}
                    <div className={`drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={closeDrawer}></div>

                    {/* Right Details Drawer */}
                    <div className={`management-right-drawer ${drawerOpen ? "open" : "closed"}`}>
                        {activeOrder || selectedCustomer ? (
                            selectedType === "order" && activeOrder ? (
                                <>
                                    <div className="management-right-drawer-body" style={{ padding: 0 }}>
                                        <DrawerContent
                                            selectedType={selectedType}
                                            selectedOrder={activeOrder}
                                            selectedCustomer={selectedCustomer}
                                            getItemsForOrder={getItemsForOrder}
                                            getStatusClass={getStatusClass}
                                            handleGenerateInvoice={handleGenerateInvoice}
                                            openOrdEdit={openOrdEdit}
                                            handleReadyToDispatch={handleReadyToDispatch}
                                            onClose={closeDrawer}
                                        />
                                    </div>
                                </>
                            ) : selectedCustomer ? (
                                <>
                                    <DrawerHeader 
                                        title={selectedCustomer.name}
                                        subtitle="Review customer profile and CRM notes"
                                        onClose={closeDrawer}
                                    />
                                    <div className="management-right-drawer-body">
                                        <DrawerContent
                                            selectedType={selectedType}
                                            selectedOrder={activeOrder}
                                            selectedCustomer={selectedCustomer}
                                            getItemsForOrder={getItemsForOrder}
                                            getStatusClass={getStatusClass}
                                            handleGenerateInvoice={handleGenerateInvoice}
                                            openOrdEdit={openOrdEdit}
                                            handleReadyToDispatch={handleReadyToDispatch}
                                        />
                                    </div>
                                </>
                            ) : null
                        ) : (
                            <>
                                <DrawerHeader 
                                    title="Select an Order" 
                                    subtitle="Choose an order from the table to view details"
                                    onClose={closeDrawer}
                                />
                                <div className="management-right-drawer-body drawer-empty-body">
                                    <div className="drawer-empty-state">
                                        <div className="drawer-empty-icon-wrapper">
                                            <ClipboardList size={48} className="drawer-empty-icon" />
                                        </div>
                                        <h3 className="drawer-empty-title">Select an Order</h3>
                                        <p className="drawer-empty-subtitle">Choose an order from the table to view details.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

export default OrderManagementView;
