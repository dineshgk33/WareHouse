import React from "react";
import { MessageSquare, ShieldAlert, Users } from "lucide-react";

export default function NotesCard({ selectedOrder }) {
    const cardHeaderStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #F3F4F6",
        paddingBottom: "10px",
        marginBottom: "10px"
    };

    return (
        <div className="order-drawer-card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={cardHeaderStyle}>
                <MessageSquare size={15} style={{ color: "#1E60FF" }} />
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: 0 }}>
                    Operational logs & CRM Notes
                </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                {/* Note 1 */}
                <div style={{
                    backgroundColor: "#EFF6FF",
                    borderLeft: "3px solid #1E60FF",
                    padding: "10px",
                    borderRadius: "4px",
                    color: "#1E40AF"
                }}>
                    <strong style={{ display: "block", marginBottom: "2px", fontSize: "11px", textTransform: "uppercase" }}>Customer Instruction</strong>
                    <span>Prefers contact-free delivery. Please ring doorbell twice and leave the bag on the doorstep package stand.</span>
                </div>

                {/* Note 2 */}
                <div style={{
                    backgroundColor: "#F9FAFB",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #E5E7EB",
                    color: "#4B5563"
                }}>
                    <strong style={{ display: "block", marginBottom: "2px", fontSize: "11px", textTransform: "uppercase", color: "#111827" }}>Internal Warehouse Log</strong>
                    <span style={{ display: "block", lineHeight: "1.4" }}>
                        • 10:15 AM - Order routed to <strong>{selectedOrder.warehouse || "Central Hub"}</strong>.
                    </span>
                    <span style={{ display: "block", lineHeight: "1.4", marginTop: "2px" }}>
                        • 10:30 AM - Picker assigned. Stock verified from Shelf Bin 12-A.
                    </span>
                </div>
            </div>
        </div>
    );
}
