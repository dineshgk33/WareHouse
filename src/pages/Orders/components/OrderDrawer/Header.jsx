import React from "react";
import { X, Calendar, ShoppingBag, Store, User } from "lucide-react";
import ActionToolbar from "./ActionToolbar";

export default function Header({
    selectedOrder,
    getStatusClass,
    handleGenerateInvoice,
    openOrdEdit,
    handleReadyToDispatch,
    onClose
}) {
    const getInitials = (name) => {
        if (!name) return "👤";
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%"
        }}>
            {/* Row 1: ID, Close button, and Actions */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#111827",
                        margin: 0,
                        letterSpacing: "-0.5px",
                        fontFamily: "var(--font-mono, monospace)"
                    }}>
                        {selectedOrder.id}
                    </h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Action Toolbar */}
                    <ActionToolbar 
                        selectedOrder={selectedOrder}
                        handleGenerateInvoice={handleGenerateInvoice}
                        openOrdEdit={openOrdEdit}
                        handleReadyToDispatch={handleReadyToDispatch}
                    />

                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9CA3AF",
                            padding: "6px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease",
                            backgroundColor: "#F3F4F6"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#E5E7EB";
                            e.currentTarget.style.color = "#374151";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#F3F4F6";
                            e.currentTarget.style.color = "#9CA3AF";
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Row 2: Badges row */}
            <div style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px"
            }}>
                <span className={`orders-status-badge ${getStatusClass(selectedOrder.status)}`} style={{ margin: 0 }}>
                    {selectedOrder.status}
                </span>

                <span className={`priority-badge priority-${(selectedOrder.priority || "Normal").toLowerCase()}`} style={{ margin: 0 }}>
                    {selectedOrder.priority || "Normal"}
                </span>

                <span style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                }}>
                    <Store size={10} />
                    {selectedOrder.warehouse || "Central Hub"}
                </span>
            </div>

            <div style={{
                borderBottom: "1px solid #F3F4F6",
                margin: "4px 0"
            }} />

            {/* Row 3: Customer summary and order details */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className={`odt-avatar ${selectedOrder.color || "avatar-indigo"}`} style={{
                        width: "28px",
                        height: "28px",
                        fontSize: "11px",
                        margin: 0
                    }}>
                        {getInitials(selectedOrder.customer)}
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#111827" }}>
                            {selectedOrder.customer}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#6B7280"
                }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} />
                        {selectedOrder.date}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShoppingBag size={12} />
                        {selectedOrder.items} Items
                    </span>
                </div>
            </div>
        </div>
    );
}
