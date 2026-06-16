import React from "react";
import { XCircle, Check } from "lucide-react";

function CancelledOrdersView({
    filteredCancelledOrders,
    processedRefunds,
    handleTriggerRefund
}) {
    return (
        <div className="cancelled-orders-container fade-in">
            {filteredCancelledOrders.length === 0 ? (
                <div className="orders-empty-state-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 20px",
                    textAlign: "center"
                }}>
                    <XCircle size={48} style={{ color: "var(--brand-danger)", marginBottom: "16px" }} />
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                        No Cancelled Orders
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
                        There are currently no orders flagged as cancelled.
                    </p>
                </div>
            ) : (
                <div className="orders-table-responsive">
                    <table className="orders-data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Cancelled Value</th>
                                <th>Cancellation Reason</th>
                                <th>Refund Stage</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCancelledOrders.map(order => {
                                const isRefunded = processedRefunds.includes(order.id);
                                return (
                                    <tr key={order.id}>
                                        <td className="font-mono font-bold">{order.id}</td>
                                        <td>{order.customer}</td>
                                        <td>{order.date}</td>
                                        <td>{order.amount}</td>
                                        <td>{order.items > 2 ? "Out of Stock Allocation" : "Customer Cancellation"}</td>
                                        <td>
                                            <span className={`refund-badge ${isRefunded ? "refunded" : "pending"}`}>
                                                {isRefunded ? "Refunded" : "Awaiting Refund"}
                                            </span>
                                        </td>
                                        <td className="text-right actions-cell">
                                            {!isRefunded ? (
                                                <button 
                                                    className="orders-inline-btn orders-inline-btn--primary refund-action-btn"
                                                    onClick={() => handleTriggerRefund(order.id)}
                                                    style={{ fontSize: "11px", padding: "4px 12px" }}
                                                >
                                                    <Check size={10} style={{ marginRight: "4px" }} />
                                                    Process Refund
                                                </button>
                                            ) : (
                                                <span className="refunded-check" style={{ color: "#10b981", fontWeight: "700", fontSize: "12px" }}>✓ Refunded</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CancelledOrdersView;
