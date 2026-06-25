import React from "react";
import Header from "./OrderDrawer/Header";
import QuickStats from "./OrderDrawer/QuickStats";
import CustomerCard from "./OrderDrawer/CustomerCard";
import ProductsCard from "./OrderDrawer/ProductsCard";
import TimelineCard from "./OrderDrawer/TimelineCard";
import TrackingCard from "./OrderDrawer/TrackingCard";
import NotesCard from "./OrderDrawer/NotesCard";

function OrderDetailsDrawer({
    selectedOrder,
    getItemsForOrder,
    getStatusClass,
    handleGenerateInvoice,
    openOrdEdit,
    handleReadyToDispatch,
    onClose,
}) {
    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%", 
            backgroundColor: "#F9FAFB",
            position: "relative"
        }}>
            {/* Sticky Header Wrapper */}
            <div style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #E5E7EB",
                padding: "20px 24px",
                zIndex: 10,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)"
            }}>
                <Header 
                    selectedOrder={selectedOrder}
                    getStatusClass={getStatusClass}
                    handleGenerateInvoice={handleGenerateInvoice}
                    openOrdEdit={openOrdEdit}
                    handleReadyToDispatch={handleReadyToDispatch}
                    onClose={onClose}
                />
            </div>

            {/* Scrollable Content Body */}
            <div className="management-right-drawer-body" style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "24px"
            }}>
                {/* 1. Quick KPI Stats */}
                <QuickStats selectedOrder={selectedOrder} />

                {/* 2. Customer Profile Card */}
                <CustomerCard selectedOrder={selectedOrder} />

                {/* 3. Products Breakdown Table Card */}
                <ProductsCard selectedOrder={selectedOrder} getItemsForOrder={getItemsForOrder} />

                {/* 4. Operations Timeline Progress Card */}
                <TimelineCard selectedOrder={selectedOrder} />

                {/* 5. Logistics tracking and barcodes Card */}
                <TrackingCard selectedOrder={selectedOrder} />

                {/* 6. Operations Notes Card */}
                <NotesCard selectedOrder={selectedOrder} />
            </div>
        </div>
    );
}

export default React.memo(OrderDetailsDrawer);
