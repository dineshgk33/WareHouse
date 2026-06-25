import React from "react";
import { CreditCard, ShoppingBag, ClipboardList, Landmark } from "lucide-react";

export default function QuickStats({ selectedOrder }) {
    const cardStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)"
    };

    const labelStyle = {
        fontSize: "10px",
        fontWeight: "600",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const valueStyle = {
        fontSize: "16px",
        fontWeight: "700",
        color: "#111827"
    };

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            width: "100%"
        }}>
            {/* Stat 1: Total Amount */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={labelStyle}>Order Total</span>
                    <Landmark size={12} style={{ color: "#6B7280" }} />
                </div>
                <span style={{ ...valueStyle, color: "#1E60FF" }}>{selectedOrder.amount}</span>
            </div>

            {/* Stat 2: Items Count */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={labelStyle}>Products</span>
                    <ShoppingBag size={12} style={{ color: "#6B7280" }} />
                </div>
                <span style={valueStyle}>{selectedOrder.items} units</span>
            </div>

            {/* Stat 3: Status */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={labelStyle}>Current Stage</span>
                    <ClipboardList size={12} style={{ color: "#6B7280" }} />
                </div>
                <span style={{
                    ...valueStyle,
                    fontSize: "13px",
                    fontWeight: "600"
                }}>
                    {selectedOrder.status}
                </span>
            </div>

            {/* Stat 4: Payment */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={labelStyle}>Payment Channel</span>
                    <CreditCard size={12} style={{ color: "#6B7280" }} />
                </div>
                <span style={{ ...valueStyle, fontSize: "13px" }}>
                    {selectedOrder.payment || "UPI"}
                </span>
            </div>
        </div>
    );
}
