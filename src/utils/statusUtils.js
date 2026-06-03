/**
 * statusUtils.js — Shared status → CSS class mapper
 *
 * Consolidates the duplicated getStatusClass() function that previously
 * existed independently in OrdersPage.jsx, InventoryPage.jsx, etc.
 * Import this utility wherever status badge styling is needed.
 */

/**
 * Maps an order or delivery status string to its CSS pill class.
 * @param {string} status
 * @returns {string} CSS class string
 */
export function getOrderStatusClass(status) {
    switch (status) {
        case "Delivered":
        case "Completed":
        case "Packed":
        case "Label Generated":
            return "orders-pill orders-pill--success";
        case "Shipped":
        case "Processing":
        case "Assigned":
        case "Packing":
        case "Out for Delivery":
            return "orders-pill orders-pill--warning";
        case "Pending":
        case "Waiting":
            return "orders-pill orders-pill--info";
        case "Cancelled":
        case "Failed":
            return "orders-pill orders-pill--danger";
        default:
            return "orders-pill";
    }
}

/**
 * Maps an inventory status string to its CSS pill class.
 * @param {string} status
 * @returns {string} CSS class string
 */
export function getInventoryStatusClass(status) {
    switch (status) {
        case "In Stock":
        case "Received":
            return "inv-pill inv-pill--success";
        case "Low Stock":
        case "Dispatched":
            return "inv-pill inv-pill--warning";
        case "Out of Stock":
        case "Pending":
            return "inv-pill inv-pill--danger";
        default:
            return "inv-pill";
    }
}
