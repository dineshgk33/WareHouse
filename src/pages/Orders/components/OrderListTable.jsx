import React from "react";
import { Store, MoreVertical, Eye, Edit2, FileText, Trash2 } from "lucide-react";

function OrderListTable({
    orders,
    isPendingOnly,
    selectedOrderIds,
    toggleSelectAll,
    toggleSelectOrder,
    getStatusClass,
    toggleRowMenu,
    activeRowMenuId,
    setActiveRowMenuId,
    openOrdView,
    openOrdEdit,
    handleGenerateInvoice,
    handleCancelOrder
}) {
    const isAllChecked = isPendingOnly
        ? orders.length > 0 && orders.every(o => selectedOrderIds.includes(o.id))
        : orders.length > 0 &&
          orders.filter(o => o.status === "Pending").length > 0 &&
          orders.filter(o => o.status === "Pending").every(o => selectedOrderIds.includes(o.id));

    return (
        <>
            <thead>
                <tr>
                    <th style={{ width: "40px", paddingRight: "10px", textAlign: "center" }}>
                        <input 
                            type="checkbox"
                            className="orders-checkbox-main"
                            checked={isAllChecked}
                            onChange={toggleSelectAll}
                            title={isPendingOnly ? "Select all Pending orders on this page" : "Select all Pending orders on this page"}
                        />
                    </th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="odt-empty">
                            No customer orders found matching filters.
                        </td>
                    </tr>
                ) : (
                    orders.map((order, index) => (
                        <tr key={order.id} className="orders-row-hover">
                            <td style={{ textAlign: "center", paddingRight: "10px" }}>
                                <input 
                                    type="checkbox"
                                    className="orders-checkbox-row"
                                    checked={selectedOrderIds.includes(order.id)}
                                    onChange={() => toggleSelectOrder(order.id)}
                                    disabled={!isPendingOnly && order.status !== "Pending" && order.status !== "Label Generated"}
                                    title={(!isPendingOnly && order.status !== "Pending" && order.status !== "Label Generated") ? "Only Pending or Label Generated orders can be selected" : ""}
                                />
                            </td>
                            <td className="odt-id">{order.id}</td>
                            <td>
                                <div className="odt-customer">
                                    <span className={`odt-avatar ${order.color || "avatar-indigo"}`}>
                                        {order.initials}
                                    </span>
                                    <div className="odt-customer-name">
                                        <div>{order.customer}</div>
                                        <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                            <Store size={10} style={{ display: "inline-block" }} /> {order.warehouse || "Koramangala Hub"}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="odt-date">{order.date}</td>
                            <td className="odt-items">{order.items} items</td>
                            <td className="odt-amount">{order.amount}</td>
                            <td className="odt-payment">{order.payment}</td>
                            <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                            <td style={{ position: "relative" }}>
                                <button className="odt-action-btn" onClick={(e) => toggleRowMenu(order.id, e)}>
                                    <MoreVertical size={14} />
                                </button>
                                {activeRowMenuId === order.id && (
                                    <>
                                        <div className="global-dropdown-overlay" onClick={() => setActiveRowMenuId(null)} />
                                        <div 
                                            className="global-action-dropdown"
                                            style={index >= orders.length - 2 && orders.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                        >
                                            <button className="global-dropdown-item" onClick={() => openOrdView(order)}>
                                                <Eye size={13} />
                                                <span>View Details</span>
                                            </button>
                                            <button className="global-dropdown-item" onClick={() => openOrdEdit(order)}>
                                                <Edit2 size={13} />
                                                <span>Edit Order</span>
                                            </button>
                                            <button className="global-dropdown-item" onClick={() => handleGenerateInvoice(order)}>
                                                <FileText size={13} />
                                                <span>Generate Invoice</span>
                                            </button>
                                            <div className="global-dropdown-divider"></div>
                                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleCancelOrder(order.id)}>
                                                <Trash2 size={13} />
                                                <span>Cancel Order</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </>
    );
}

export default OrderListTable;
