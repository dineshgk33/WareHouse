import React from "react";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import CustomerDetailsDrawer from "./CustomerDetailsDrawer";

function DrawerContent({
    selectedType,
    selectedOrder,
    selectedCustomer,
    getItemsForOrder,
    getStatusClass,
    handleGenerateInvoice,
    openOrdEdit,
    handleReadyToDispatch,
    onClose,
}) {
    if (selectedType === "order" && selectedOrder) {
        return (
            <OrderDetailsDrawer
                selectedOrder={selectedOrder}
                getItemsForOrder={getItemsForOrder}
                getStatusClass={getStatusClass}
                handleGenerateInvoice={handleGenerateInvoice}
                openOrdEdit={openOrdEdit}
                handleReadyToDispatch={handleReadyToDispatch}
                onClose={onClose}
            />
        );
    }
    
    if (selectedType === "customer" && selectedCustomer) {
        return (
            <CustomerDetailsDrawer
                selectedCustomer={selectedCustomer}
            />
        );
    }

    return null;
}

export default React.memo(DrawerContent);
