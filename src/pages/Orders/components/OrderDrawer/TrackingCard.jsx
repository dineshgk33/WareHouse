import React, { useState } from "react";
import { Barcode, Clipboard, Check, Printer, QrCode } from "lucide-react";
import { Barcode128Svg } from "../../../../utils/barcode";

// Simple QR code simulation SVG
const QRISvg = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" style={{ width: "64px", height: "64px", display: "block" }}>
            <rect x="0" y="0" width="7" height="7" fill="#111827" />
            <rect x="1" y="1" width="5" height="5" fill="white" />
            <rect x="2" y="2" width="3" height="3" fill="#111827" />
            
            <rect x="22" y="0" width="7" height="7" fill="#111827" />
            <rect x="23" y="1" width="5" height="5" fill="white" />
            <rect x="24" y="2" width="3" height="3" fill="#111827" />
            
            <rect x="0" y="22" width="7" height="7" fill="#111827" />
            <rect x="1" y="23" width="5" height="5" fill="white" />
            <rect x="2" y="24" width="3" height="3" fill="#111827" />
            
            <rect x="18" y="18" width="5" height="5" fill="#111827" />
            <rect x="19" y="19" width="3" height="3" fill="white" />
            <rect x="20" y="20" width="1" height="1" fill="#111827" />
            
            <rect x="8" y="2" width="1" height="1" fill="#111827" />
            <rect x="10" y="0" width="2" height="1" fill="#111827" />
            <rect x="13" y="1" width="1" height="3" fill="#111827" />
            <rect x="15" y="0" width="3" height="1" fill="#111827" />
            
            <rect x="8" y="4" width="3" height="1" fill="#111827" />
            <rect x="12" y="5" width="2" height="1" fill="#111827" />
            
            <rect x="2" y="8" width="1" height="3" fill="#111827" />
            <rect x="4" y="9" width="3" height="1" fill="#111827" />
            <rect x="9" y="8" width="1" height="2" fill="#111827" />
            <rect x="14" y="8" width="4" height="1" fill="#111827" />
            
            <rect x="0" y="13" width="4" height="1" fill="#111827" />
            <rect x="5" y="14" width="1" height="2" fill="#111827" />
            <rect x="12" y="12" width="1" height="4" fill="#111827" />
            <rect x="19" y="13" width="2" height="2" fill="#111827" />
            
            <rect x="2" y="18" width="2" height="2" fill="#111827" />
            <rect x="9" y="18" width="1" height="1" fill="#111827" />
            <rect x="14" y="19" width="2" height="1" fill="#111827" />
            
            <rect x="9" y="22" width="2" height="1" fill="#111827" />
            <rect x="12" y="24" width="3" height="1" fill="#111827" />
            <rect x="16" y="23" width="1" height="3" fill="#111827" />
        </svg>
    );
};

export default function TrackingCard({ selectedOrder }) {
    const [copied, setCopied] = useState(false);

    const trackingNum = `TRK-${selectedOrder.id.replace("#", "")}-77A9`;

    const copyTracking = () => {
        navigator.clipboard.writeText(trackingNum);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="order-drawer-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: 0 }}>
                    Logistics Tracking & Barcodes
                </h3>
            </div>

            {/* Content layout */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                {/* Barcode section */}
                <div style={{
                    flex: "1",
                    minWidth: "220px",
                    border: "1px solid #F3F4F6",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "#FAFAFA",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <div 
                        style={{ width: "100%", display: "flex", justifyContent: "center" }}
                        dangerouslySetInnerHTML={{
                            __html: (() => {
                                const barcode = new Barcode128Svg(selectedOrder.id);
                                barcode.height = 36;
                                barcode.factor = 1.3;
                                return barcode.toString();
                            })()
                        }}
                    />
                    <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "var(--font-mono, monospace)" }}>
                        {selectedOrder.id}
                    </span>
                </div>

                {/* QR Code section */}
                <div style={{
                    border: "1px solid #F3F4F6",
                    borderRadius: "8px",
                    padding: "10px",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <QRISvg />
                </div>
            </div>

            {/* Tracking ID and details */}
            <div style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <span style={{ color: "#6B7280", fontWeight: "500" }}>Tracking ID: </span>
                        <strong style={{ fontFamily: "var(--font-mono, monospace)", color: "#111827" }}>{trackingNum}</strong>
                    </div>
                    <button 
                        onClick={copyTracking}
                        style={{
                            background: "none",
                            border: "1px solid #E5E7EB",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            color: "#4B5563",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "#ffffff"
                        }}
                    >
                        {copied ? <Check size={11} style={{ color: "#10B981" }} /> : <Clipboard size={11} />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>

                <div style={{ borderTop: "1px solid #E5E7EB", margin: "2px 0" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "#6B7280" }}>
                    <div>
                        <span>Fulfillment: </span>
                        <strong style={{ color: "#374151" }}>{selectedOrder.warehouse || "Central Hub"}</strong>
                    </div>
                    <div>
                        <span>Courier Partner: </span>
                        <strong style={{ color: "#374151" }}>Zepto Express</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
