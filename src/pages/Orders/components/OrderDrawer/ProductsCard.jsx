import React from "react";

const getProductEmoji = (sku) => {
    switch (sku) {
        case "FRT-ANG-01": return "🥭";
        case "DRY-MILK-02": return "🥛";
        case "FZN-FRIES-03": return "🍟";
        case "FRT-AAPL-04": return "🍎";
        case "DRY-PANR-05": return "🧀";
        default: return "📦";
    }
};

const getCategoryForProduct = (sku) => {
    if (sku.startsWith("FRT")) return "Fruits & Veggies";
    if (sku.startsWith("DRY")) return "Groceries / Dry";
    if (sku.startsWith("FZN")) return "Frozen Foods";
    return "Others";
};

export default function ProductsCard({ selectedOrder, getItemsForOrder }) {
    const items = getItemsForOrder(selectedOrder);

    // Calculate sum of total prices
    const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    // Simulate discount
    const discount = subtotal > 300 ? 30 : 0;
    const tax = subtotal * 0.05; // 5% GST
    const delivery = 25; // Delivery charge
    const grandTotal = subtotal - discount + tax + delivery;

    return (
        <div className="order-drawer-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: 0 }}>
                Products Breakdown ({items.length})
            </h3>

            <div style={{ overflowX: "auto", border: "1px solid #F3F4F6", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            <th style={{ padding: "10px 12px", fontWeight: "600", color: "#4B5563" }}>Item</th>
                            <th style={{ padding: "10px 12px", fontWeight: "600", color: "#4B5563" }}>SKU</th>
                            <th style={{ padding: "10px 12px", fontWeight: "600", color: "#4B5563", textAlign: "center" }}>Qty</th>
                            <th style={{ padding: "10px 12px", fontWeight: "600", color: "#4B5563", textAlign: "right" }}>Price</th>
                            <th style={{ padding: "10px 12px", fontWeight: "600", color: "#4B5563", textAlign: "right" }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <tr 
                                    key={idx}
                                    style={{ 
                                        backgroundColor: isEven ? "#ffffff" : "#F9FAFB",
                                        borderBottom: "1px solid #F3F4F6",
                                        transition: "background-color 0.15s ease"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isEven ? "#ffffff" : "#F9FAFB"}
                                >
                                    {/* Thumbnail and Name */}
                                    <td style={{ padding: "10px 12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "6px",
                                                backgroundColor: "#F3F4F6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "20px",
                                                flexShrink: 0
                                            }}>
                                                {getProductEmoji(item.sku)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "600", color: "#111827" }}>{item.name}</div>
                                                <div style={{ fontSize: "10px", color: "#6B7280" }}>{getCategoryForProduct(item.sku)}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* SKU */}
                                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono, monospace)", fontSize: "11px", color: "#4B5563" }}>
                                        {item.sku}
                                    </td>

                                    {/* Qty */}
                                    <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "600", color: "#111827" }}>
                                        {item.qty}
                                    </td>

                                    {/* Price */}
                                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#4B5563" }}>
                                        ₹{item.price.toFixed(2)}
                                    </td>

                                    {/* Total */}
                                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600", color: "#111827" }}>
                                        ₹{(item.qty * item.price).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Calculations Breakdown */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#4B5563",
                alignSelf: "flex-end",
                width: "200px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Items Subtotal</span>
                    <span style={{ fontWeight: "600", color: "#111827" }}>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Discount</span>
                    <span style={{ fontWeight: "600", color: "#10B981" }}>-₹{discount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GST (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Delivery Charge</span>
                    <span>₹{delivery.toFixed(2)}</span>
                </div>
                <div style={{
                    borderTop: "1px dashed #E5E7EB",
                    paddingTop: "6px",
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#1E60FF"
                }}>
                    <span>Total Amount</span>
                    <span>{selectedOrder.amount}</span>
                </div>
            </div>
        </div>
    );
}
