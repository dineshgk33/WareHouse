import React from "react";
import { Store, User, Printer } from "lucide-react";

function PackingQueueView({
    packs,
    orders,
    getStatusClass,
    handleStartPacking,
    handlePrintLabel,
    handleCompletePack
}) {
    return (
        <>
            <thead>
                <tr>
                    <th>Pack ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Packed By</th>
                    <th>Items Count</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {packs.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="odt-empty">
                            No packing boxes found matching filters.
                        </td>
                    </tr>
                ) : (
                    packs.map(item => {
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
                                    <span className={`picker-assigned-pill ${item.packedBy === "Unassigned" ? "unassigned" : ""}`}>
                                        <User size={12} />
                                        {item.packedBy}
                                    </span>
                                </td>
                                <td className="odt-items">{item.items} items</td>
                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                <td>
                                    <div className="orders-actions-cell">
                                        {item.status === "Waiting" && (
                                            <button className="orders-inline-btn" onClick={() => handleStartPacking(item.id)}>
                                                Start Packing
                                            </button>
                                        )}
                                        {item.status === "Packing" && (
                                            <>
                                                <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => handlePrintLabel(item.id)}>
                                                    <Printer size={12} />
                                                    <span>Print Label</span>
                                                </button>
                                                <button className="orders-inline-btn orders-inline-btn--success" onClick={() => handleCompletePack(item.id)}>
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                        {item.status === "Packed" && (
                                            <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => handlePrintLabel(item.id)}>
                                                <Printer size={12} />
                                                <span>Reprint Tag</span>
                                            </button>
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

export default PackingQueueView;
