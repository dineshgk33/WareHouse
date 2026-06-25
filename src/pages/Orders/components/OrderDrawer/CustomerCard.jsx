import React from "react";
import { User, Mail, Phone, MapPin, Store, Calendar, CreditCard, ShieldAlert } from "lucide-react";

export default function CustomerCard({ selectedOrder }) {
    const getInitials = (name) => {
        if (!name) return "👤";
        return name.split(" ").map(n => n[0]).join("").toUpperCase();
    };

    const detailsGridStyle = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
        marginTop: "12px"
    };

    const itemStyle = {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px"
    };

    const labelStyle = {
        fontSize: "10px",
        color: "#6B7280",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    };

    const valStyle = {
        fontSize: "13px",
        color: "#111827",
        fontWeight: "500",
        marginTop: "2px"
    };

    const email = `${selectedOrder.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const phone = selectedOrder.mobile || "+91 99880 12345";
    const address = "Sector 4, Dwarka, New Delhi - 110075";

    return (
        <div className="order-drawer-card">
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F3F4F6", paddingBottom: "12px" }}>
                <div className={`odt-avatar ${selectedOrder.color || "avatar-indigo"}`} style={{
                    width: "44px",
                    height: "44px",
                    fontSize: "16px",
                    margin: 0
                }}>
                    {getInitials(selectedOrder.customer)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{selectedOrder.customer}</span>
                    <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: "500" }}>Loyal Customer (VIP Segment)</span>
                </div>
            </div>

            {/* Grid of details */}
            <div style={detailsGridStyle}>
                {/* Item 1: Phone */}
                <div style={itemStyle}>
                    <Phone size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Phone Number</span>
                        <div style={valStyle}>
                            <a href={`tel:${phone}`} style={{ color: "#1E60FF", textDecoration: "none" }}>{phone}</a>
                        </div>
                    </div>
                </div>

                {/* Item 2: Email */}
                <div style={itemStyle}>
                    <Mail size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Email ID</span>
                        <div style={valStyle}>
                            <a href={`mailto:${email}`} style={{ color: "#1E60FF", textDecoration: "none" }}>{email}</a>
                        </div>
                    </div>
                </div>

                {/* Item 3: Order Date */}
                <div style={itemStyle}>
                    <Calendar size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Order Date</span>
                        <div style={valStyle}>{selectedOrder.date}</div>
                    </div>
                </div>

                {/* Item 4: Warehouse */}
                <div style={itemStyle}>
                    <Store size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Fulfillment Hub</span>
                        <div style={valStyle}>{selectedOrder.warehouse || "Central Hub Alpha"}</div>
                    </div>
                </div>

                {/* Item 5: Payment */}
                <div style={itemStyle}>
                    <CreditCard size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Payment Method</span>
                        <div style={valStyle}>{selectedOrder.payment || "UPI"}</div>
                    </div>
                </div>

                {/* Item 6: Priority */}
                <div style={itemStyle}>
                    <ShieldAlert size={14} style={{ color: "#6B7280", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Priority tier</span>
                        <div style={valStyle}>{selectedOrder.priority || "Normal"}</div>
                    </div>
                </div>

                {/* Item 7: Address (Span 2) */}
                <div style={{ ...itemStyle, gridColumn: "span 2", borderTop: "1px solid #F3F4F6", paddingTop: "12px", marginTop: "4px" }}>
                    <MapPin size={14} style={{ color: "#EF4444", marginTop: "2px" }} />
                    <div>
                        <span style={labelStyle}>Delivery Address</span>
                        <div style={{ ...valStyle, lineHeight: "1.4", color: "#374151" }}>{address}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
