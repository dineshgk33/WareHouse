import React from "react";
import { Store, User, PhoneCall, Navigation } from "lucide-react";

function DeliveryQueueView({
    deliveries,
    orders,
    getStatusClass,
    handleCallRider,
    openDlvTrack,
    openDlvUpdate
}) {
    return (
        <>
            <thead>
                <tr>
                    <th>Delivery ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Rider Assigned</th>
                    <th>ETA</th>
                    <th>Current Location</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {deliveries.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="odt-empty">
                            No delivery riders found matching filters.
                        </td>
                    </tr>
                ) : (
                    deliveries.map(item => {
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
                                    <span className={`picker-assigned-pill ${item.rider === "Unassigned" ? "unassigned" : ""}`}>
                                        <User size={12} />
                                        {item.rider}
                                    </span>
                                </td>
                                <td className="odt-items">{item.eta}</td>
                                <td className="odt-warehouse">{item.location}</td>
                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                <td>
                                    <div className="orders-actions-cell">
                                        <button className="orders-inline-btn orders-inline-btn--secondary" title="Call rider" onClick={() => handleCallRider(item.rider)} disabled={item.rider === "Unassigned"}>
                                            <PhoneCall size={12} />
                                        </button>
                                        <button className="orders-inline-btn orders-inline-btn--secondary" title="Track on map" onClick={() => openDlvTrack(item)} disabled={item.status === "Delivered" || item.status === "Failed"}>
                                            <Navigation size={12} />
                                        </button>
                                        <button className="orders-inline-btn" title="Update status" onClick={() => openDlvUpdate(item)}>
                                            Update
                                        </button>
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

export default DeliveryQueueView;
