import React, { useState } from "react";
import { Printer, FileText, Edit2, Truck, RotateCcw, MoreHorizontal } from "lucide-react";

export default function ActionToolbar({
    selectedOrder,
    handleGenerateInvoice,
    openOrdEdit,
    handleReadyToDispatch,
    handlePrintLabel, // optional fallback
}) {
    const [showMore, setShowMore] = useState(false);
    const [tooltipText, setTooltipText] = useState("");

    const isReadyOrLater = selectedOrder.status === "Ready To Dispatch" || 
                           selectedOrder.status === "Ready to Dispatch" || 
                           selectedOrder.status === "Shipped" || 
                           selectedOrder.status === "Delivered" || 
                           selectedOrder.status === "Cancelled";

    const canGenerateInvoice = selectedOrder.status !== "Cancelled";
    const canReadyToDispatch = !isReadyOrLater;

    // Simulate refund action
    const triggerRefund = () => {
        alert(`Refund request initiated for order ${selectedOrder.id}`);
    };

    const triggerPrint = () => {
        if (handlePrintLabel) {
            handlePrintLabel(selectedOrder.id);
        } else {
            window.print();
        }
    };

    const btnStyle = {
        background: "none",
        border: "1px solid #E5E7EB",
        borderRadius: "6px",
        padding: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4B5563",
        transition: "all 0.15s ease",
        position: "relative",
        backgroundColor: "#ffffff"
    };

    const activeBtnHoverStyle = (e) => {
        e.currentTarget.style.backgroundColor = "#F3F4F6";
        e.currentTarget.style.borderColor = "#D1D5DB";
        e.currentTarget.style.color = "#111827";
    };

    const activeBtnLeaveStyle = (e) => {
        e.currentTarget.style.backgroundColor = "#ffffff";
        e.currentTarget.style.borderColor = "#E5E7EB";
        e.currentTarget.style.color = "#4B5563";
    };

    const disabledBtnStyle = {
        ...btnStyle,
        color: "#D1D5DB",
        borderColor: "#F3F4F6",
        cursor: "not-allowed",
        backgroundColor: "#F9FAFB"
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
            {/* Tooltip display */}
            {tooltipText && (
                <div style={{
                    position: "absolute",
                    bottom: "-32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#1F2937",
                    color: "#ffffff",
                    fontSize: "10px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    pointerEvents: "none"
                }}>
                    {tooltipText}
                </div>
            )}

            {/* Print Tag Button */}
            <button 
                style={btnStyle}
                onMouseEnter={(e) => { activeBtnHoverStyle(e); setTooltipText("Print Tag"); }}
                onMouseLeave={(e) => { activeBtnLeaveStyle(e); setTooltipText(""); }}
                onClick={triggerPrint}
            >
                <Printer size={15} />
            </button>

            {/* Generate Invoice Button */}
            {handleGenerateInvoice && (
                <button 
                    disabled={!canGenerateInvoice}
                    style={canGenerateInvoice ? btnStyle : disabledBtnStyle}
                    onMouseEnter={(e) => {
                        if (canGenerateInvoice) activeBtnHoverStyle(e);
                        setTooltipText(canGenerateInvoice ? "Generate Invoice" : "Invoice Disabled");
                    }}
                    onMouseLeave={(e) => {
                        if (canGenerateInvoice) activeBtnLeaveStyle(e);
                        setTooltipText("");
                    }}
                    onClick={() => handleGenerateInvoice(selectedOrder)}
                >
                    <FileText size={15} />
                </button>
            )}

            {/* Ready to Dispatch Button */}
            {handleReadyToDispatch && (
                <button 
                    disabled={!canReadyToDispatch}
                    style={canReadyToDispatch ? btnStyle : disabledBtnStyle}
                    onMouseEnter={(e) => {
                        if (canReadyToDispatch) activeBtnHoverStyle(e);
                        setTooltipText(canReadyToDispatch ? "Mark Ready To Dispatch" : "Already Dispatched/Cancelled");
                    }}
                    onMouseLeave={(e) => {
                        if (canReadyToDispatch) activeBtnLeaveStyle(e);
                        setTooltipText("");
                    }}
                    onClick={() => handleReadyToDispatch(selectedOrder)}
                >
                    <Truck size={15} />
                </button>
            )}

            {/* Edit Button */}
            {openOrdEdit && (
                <button 
                    style={btnStyle}
                    onMouseEnter={(e) => { activeBtnHoverStyle(e); setTooltipText("Edit Order"); }}
                    onMouseLeave={(e) => { activeBtnLeaveStyle(e); setTooltipText(""); }}
                    onClick={() => openOrdEdit(selectedOrder)}
                >
                    <Edit2 size={15} />
                </button>
            )}

            {/* Refund Button */}
            <button 
                style={selectedOrder.status === "Cancelled" ? btnStyle : disabledBtnStyle}
                disabled={selectedOrder.status !== "Cancelled"}
                onMouseEnter={(e) => {
                    if (selectedOrder.status === "Cancelled") activeBtnHoverStyle(e);
                    setTooltipText(selectedOrder.status === "Cancelled" ? "Trigger Refund" : "Refund Only For Cancelled Orders");
                }}
                onMouseLeave={(e) => {
                    if (selectedOrder.status === "Cancelled") activeBtnLeaveStyle(e);
                    setTooltipText("");
                }}
                onClick={triggerRefund}
            >
                <RotateCcw size={15} />
            </button>

            {/* More actions */}
            <div style={{ position: "relative" }}>
                <button 
                    style={btnStyle}
                    onMouseEnter={(e) => { activeBtnHoverStyle(e); setTooltipText("More Actions"); }}
                    onMouseLeave={(e) => { activeBtnLeaveStyle(e); setTooltipText(""); }}
                    onClick={() => setShowMore(!showMore)}
                >
                    <MoreHorizontal size={15} />
                </button>

                {showMore && (
                    <>
                        <div 
                            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                            onClick={() => setShowMore(false)}
                        />
                        <div style={{
                            position: "absolute",
                            top: "36px",
                            right: 0,
                            backgroundColor: "#ffffff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "6px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            zIndex: 100,
                            width: "140px",
                            padding: "4px 0"
                        }}>
                            <button 
                                onClick={() => { setShowMore(false); alert("Order logged to console"); console.log(selectedOrder); }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "12px",
                                    textAlign: "left",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#374151"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Log Details
                            </button>
                            <button 
                                onClick={() => { setShowMore(false); alert("Audit report exported"); }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "12px",
                                    textAlign: "left",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    color: "#374151"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                Export Audit PDF
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
