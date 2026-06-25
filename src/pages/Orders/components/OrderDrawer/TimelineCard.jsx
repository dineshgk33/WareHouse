import React from "react";
import { Check, Clock, PackageSearch, Package, PackageCheck, Truck, CheckCircle2 } from "lucide-react";

export default function TimelineCard({ selectedOrder }) {
    const stages = ["Pending", "Picking", "Packing", "Ready To Dispatch", "Shipped", "Delivered"];

    const normalizeStatus = (st) => {
        switch (st) {
            case "Pending": return "Pending";
            case "Picking": return "Picking";
            case "Packing":
            case "Processing": return "Packing";
            case "Label Generated":
            case "Ready for Dispatch":
            case "Ready To Dispatch":
            case "Packed": return "Ready To Dispatch";
            case "Shipped":
            case "Out for Delivery": return "Shipped";
            case "Delivered": return "Delivered";
            default: return "Pending";
        }
    };

    const getStageIcon = (stage, size = 12) => {
        switch (stage) {
            case "Pending": return <Clock size={size} />;
            case "Picking": return <PackageSearch size={size} />;
            case "Packing": return <Package size={size} />;
            case "Ready To Dispatch": return <PackageCheck size={size} />;
            case "Shipped": return <Truck size={size} />;
            case "Delivered": return <CheckCircle2 size={size} />;
            default: return <Clock size={size} />;
        }
    };

    const getStageDescription = (stage) => {
        switch (stage) {
            case "Pending": return "Order submitted by customer and waiting in allocation queue.";
            case "Picking": return "Picker routing items from shelf bins using digital terminal checklist.";
            case "Packing": return "Packing station bagger boxing and sealing order contents.";
            case "Ready To Dispatch": return "Invoice generated, barcode shipping label attached, awaiting carrier pickup.";
            case "Shipped": return "Package in transit, dispatch logs mapped to courier partner.";
            case "Delivered": return "Rider arrived at customer destination, delivery authenticated successfully.";
            default: return "";
        }
    };

    const normalizedStatus = normalizeStatus(selectedOrder.status);
    const currentStageIdx = stages.indexOf(normalizedStatus);

    return (
        <div className="order-drawer-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: 0 }}>
                Operations Lifecycle Timeline
            </h3>

            <div style={{ position: "relative", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Timeline vertical connecting line */}
                <div style={{
                    position: "absolute",
                    top: "12px",
                    bottom: "12px",
                    left: "14px",
                    width: "2px",
                    backgroundColor: "#E5E7EB",
                    zIndex: 1
                }} />

                {stages.map((stage, idx) => {
                    let isCompleted = idx < currentStageIdx;
                    let isCurrent = idx === currentStageIdx;
                    let isPending = idx > currentStageIdx;

                    if (selectedOrder.status === "Cancelled") {
                        isCompleted = false;
                        isCurrent = false;
                        isPending = true;
                    }

                    // Define node styles
                    let nodeColor = "#9CA3AF"; // Gray
                    let nodeBg = "#F3F4F6";
                    let textColor = "#6B7280";
                    let labelWeight = "500";
                    let dotClasses = "timeline-dot-static";

                    if (isCompleted) {
                        nodeColor = "#10B981"; // Green
                        nodeBg = "#D1FAE5";
                        textColor = "#374151";
                    } else if (isCurrent) {
                        nodeColor = "#1E60FF"; // Blue
                        nodeBg = "#E0F2FE";
                        textColor = "#111827";
                        labelWeight = "700";
                        dotClasses = "timeline-dot-active";
                    }

                    return (
                        <div key={idx} style={{
                            display: "flex",
                            alignItems: "flex-start",
                            position: "relative",
                            zIndex: 2
                        }}>
                            {/* Circle Node */}
                            <div 
                                className={dotClasses}
                                style={{
                                    position: "absolute",
                                    left: "-32px",
                                    top: "0px",
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: nodeBg,
                                    border: `2px solid ${nodeColor}`,
                                    color: nodeColor,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: isCurrent ? "0 0 0 4px rgba(30, 96, 255, 0.15)" : "none",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : getStageIcon(stage, 13)}
                            </div>

                            {/* Node Content */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "13px", fontWeight: labelWeight, color: textColor }}>
                                        {stage}
                                    </span>
                                    {isCompleted && (
                                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                                            {idx === 0 ? "10:15 AM" : idx === 1 ? "10:30 AM" : idx === 2 ? "11:00 AM" : idx === 3 ? "11:15 AM" : idx === 4 ? "11:45 AM" : "12:10 PM"}
                                        </span>
                                    )}
                                    {isCurrent && (
                                        <span style={{
                                            fontSize: "9px",
                                            fontWeight: "700",
                                            padding: "2px 6px",
                                            borderRadius: "10px",
                                            backgroundColor: "#E0F2FE",
                                            color: "#1E60FF",
                                            textTransform: "uppercase"
                                        }}>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: "11px", color: "#6B7280", lineHeight: "1.4" }}>
                                    {getStageDescription(stage)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
