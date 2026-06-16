import React from "react";
import { Store, User } from "lucide-react";

function PickingQueueView({
    picks,
    orders,
    getStatusClass,
    openPickAssign,
    handleCompletePick
}) {
    return (
        <>
            <thead>
                <tr>
                    <th>Pick ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Picker Assigned</th>
                    <th>Products Count</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {picks.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="odt-empty">
                            No pick lists found matching filters.
                        </td>
                    </tr>
                ) : (
                    picks.map(item => {
                        const assocOrder = orders.find(o => o.id === item.orderId);
                        return (
                            <tr key={item.id} className="orders-row-hover">
                                <td className="odt-id">{item.id}</td>
                                <td className="odt-id">{item.orderId}</td>
                                <td className="odt-customer-name">
                                    <div>{item.customer}</div>
                                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                        <Store size={10} /> {assocOrder?.warehouse || "Koramangala Hub"}
                                    </span>
                                </td>
                                <td>
                                    <span className={`picker-assigned-pill ${item.picker === "Unassigned" ? "unassigned" : ""}`}>
                                        <User size={12} />
                                        {item.picker}
                                    </span>
                                </td>
                                <td className="odt-items">{item.productsCount} SKUs</td>
                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                <td>
                                    <div className="orders-actions-cell">
                                        {item.status === "Pending" && (
                                            <button className="orders-inline-btn" onClick={() => openPickAssign(item)}>
                                                Assign Picker
                                            </button>
                                        )}
                                        {item.status === "Assigned" && (
                                            <>
                                                <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => openPickAssign(item)}>
                                                    Reassign
                                                </button>
                                                <button className="orders-inline-btn orders-inline-btn--success" onClick={() => handleCompletePick(item.id)}>
                                                    Complete Pick
                                                </button>
                                            </>
                                        )}
                                        {item.status === "Completed" && (
                                            <span className="orders-inline-completed">Completed</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </>
    );
}

export default PickingQueueView;
