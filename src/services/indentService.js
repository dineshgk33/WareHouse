import { MOCK_WAREHOUSE_STOCK, MOCK_DARKHOUSE_STOCK } from "../data/inventoryData";

// Default Initial Indents (from implementation plan)
const INITIAL_INDENTS = [
    {
        id: "IND-90001",
        productName: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        requestedBy: "HAATZA GK-1 Warehouse",
        requestedTo: "HAATZA Central Warehouse",
        requestedQty: 50,
        approvedQty: 0,
        status: "Pending",
        requestedDate: "10 Jun 2026, 10:00 AM",
        priority: "High",
        remarks: "Low stock, high demand expected for the weekend.",
        history: [
            { date: "10 Jun 2026, 10:00 AM", status: "Pending", user: "Store Manager (GK-1)", remarks: "Request created." }
        ]
    },
    {
        id: "IND-90002",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        requestedBy: "HAATZA Koramangala Hub",
        requestedTo: "HAATZA Central Warehouse",
        requestedQty: 40,
        approvedQty: 40,
        status: "Dispatched",
        requestedDate: "09 Jun 2026, 02:30 PM",
        priority: "Medium",
        remarks: "Currently out of stock.",
        vehicleNumber: "KA-03-HA-8821",
        driverName: "Ramesh Kumar",
        dispatchRemarks: "Dispatched via Delivery Truck-04.",
        history: [
            { date: "09 Jun 2026, 02:30 PM", status: "Pending", user: "Store Manager (Koramangala)", remarks: "Request created." },
            { date: "09 Jun 2026, 04:00 PM", status: "Approved", user: "Warehouse Manager (Central)", remarks: "Approved full quantity." },
            { date: "10 Jun 2026, 09:00 AM", status: "Dispatched", user: "Warehouse Manager (Central)", remarks: "Dispatched via Delivery Truck-04." }
        ]
    },
    {
        id: "IND-90003",
        productName: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        requestedBy: "HAATZA Powai Depot",
        requestedTo: "HAATZA Central Warehouse",
        requestedQty: 100,
        approvedQty: 100,
        status: "Completed",
        requestedDate: "08 Jun 2026, 09:15 AM",
        priority: "Urgent",
        remarks: "Urgent stock replenishment requested.",
        vehicleNumber: "MH-02-ZZ-5501",
        driverName: "Sanjay Patil",
        dispatchRemarks: "Dispatched via Van-02.",
        receivedQty: 100,
        damagedQty: 0,
        receiveRemarks: "Stock received in good condition, cold chain verified.",
        history: [
            { date: "08 Jun 2026, 09:15 AM", status: "Pending", user: "Store Manager (Powai)", remarks: "Request created." },
            { date: "08 Jun 2026, 10:30 AM", status: "Approved", user: "Warehouse Manager (Central)", remarks: "Approved full quantity." },
            { date: "08 Jun 2026, 02:00 PM", status: "Dispatched", user: "Warehouse Manager (Central)", remarks: "Dispatched via Van-02." },
            { date: "09 Jun 2026, 10:00 AM", status: "Completed", user: "Store Manager (Powai)", remarks: "Stock received and verified." }
        ]
    }
];

// Initial Transaction Logs corresponding to the indents above
const INITIAL_TRANSACTIONS = [
    {
        transactionId: "TXN-80001",
        type: "Request Created",
        warehouse: "HAATZA GK-1 Warehouse",
        productName: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        quantity: 50,
        prevStock: 3,
        newStock: 3,
        user: "Store Manager (GK-1)",
        timestamp: "10 Jun 2026, 10:00 AM"
    },
    {
        transactionId: "TXN-80002",
        type: "Request Created",
        warehouse: "HAATZA Koramangala Hub",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 0,
        newStock: 0,
        user: "Store Manager (Koramangala)",
        timestamp: "09 Jun 2026, 02:30 PM"
    },
    {
        transactionId: "TXN-80003",
        type: "Approved",
        warehouse: "HAATZA Central Warehouse",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 0,
        newStock: 0,
        user: "Warehouse Manager (Central)",
        timestamp: "09 Jun 2026, 04:00 PM"
    },
    {
        transactionId: "TXN-80004",
        type: "Dispatched",
        warehouse: "HAATZA Central Warehouse",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 40, // assume central had 40 handwashes
        newStock: 0,
        user: "Warehouse Manager (Central)",
        timestamp: "10 Jun 2026, 09:00 AM"
    },
    {
        transactionId: "TXN-80005",
        type: "Request Created",
        warehouse: "HAATZA Powai Depot",
        productName: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        quantity: 100,
        prevStock: 8,
        newStock: 8,
        user: "Store Manager (Powai)",
        timestamp: "08 Jun 2026, 09:15 AM"
    },
    {
        transactionId: "TXN-80006",
        type: "Approved",
        warehouse: "HAATZA Central Warehouse",
        productName: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        quantity: 100,
        prevStock: 8,
        newStock: 8,
        user: "Warehouse Manager (Central)",
        timestamp: "08 Jun 2026, 10:30 AM"
    },
    {
        transactionId: "TXN-80007",
        type: "Dispatched",
        warehouse: "HAATZA Central Warehouse",
        productName: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        quantity: 100,
        prevStock: 450,
        newStock: 350,
        user: "Warehouse Manager (Central)",
        timestamp: "08 Jun 2026, 02:00 PM"
    },
    {
        transactionId: "TXN-80008",
        type: "Received",
        warehouse: "HAATZA Powai Depot",
        productName: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        quantity: 100,
        prevStock: 8,
        newStock: 108,
        user: "Store Manager (Powai)",
        timestamp: "09 Jun 2026, 10:00 AM"
    }
];

const formatCurrentDateTime = () => {
    const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
    return new Date().toLocaleString("en-US", options).replace(",", "");
};

// --- Storage Access Helpers ---
export const getIndents = () => {
    const saved = localStorage.getItem("haatza_indent_requests");
    if (!saved) {
        localStorage.setItem("haatza_indent_requests", JSON.stringify(INITIAL_INDENTS));
        return INITIAL_INDENTS;
    }
    return JSON.parse(saved);
};

export const getTransactions = () => {
    const saved = localStorage.getItem("haatza_inventory_transactions");
    if (!saved) {
        localStorage.setItem("haatza_inventory_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(saved);
};

export const getWarehouseStock = () => {
    const saved = localStorage.getItem("haatza_warehouse_stock");
    if (!saved) {
        localStorage.setItem("haatza_warehouse_stock", JSON.stringify(MOCK_WAREHOUSE_STOCK));
        return MOCK_WAREHOUSE_STOCK;
    }
    return JSON.parse(saved);
};

export const getDarkhouseStock = () => {
    const saved = localStorage.getItem("haatza_darkhouse_stock");
    if (!saved) {
        localStorage.setItem("haatza_darkhouse_stock", JSON.stringify(MOCK_DARKHOUSE_STOCK));
        return MOCK_DARKHOUSE_STOCK;
    }
    return JSON.parse(saved);
};

// Save utilities
const saveIndents = (data) => localStorage.setItem("haatza_indent_requests", JSON.stringify(data));
const saveTransactions = (data) => localStorage.setItem("haatza_inventory_transactions", JSON.stringify(data));
const saveWarehouseStock = (data) => localStorage.setItem("haatza_warehouse_stock", JSON.stringify(data));
const saveDarkhouseStock = (data) => localStorage.setItem("haatza_darkhouse_stock", JSON.stringify(data));

// Write transaction log helper
const addTransaction = (type, warehouse, productName, sku, qty, prevStock, newStock, user) => {
    const txns = getTransactions();
    const newTxn = {
        transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type,
        warehouse,
        productName,
        sku,
        quantity: qty,
        prevStock,
        newStock,
        user,
        timestamp: formatCurrentDateTime()
    };
    saveTransactions([newTxn, ...txns]);
    return newTxn;
};

// --- Transaction Actions ---

// Helper to get stock of any warehouse (simulated for fallbacks, actual for Central/Primary)
export const getWarehouseStockForLocation = (warehouseName, sku) => {
    const whStock = getWarehouseStock();
    const item = whStock.find(i => i.sku === sku);
    
    if (!warehouseName || warehouseName.toLowerCase().includes("central")) {
        return item ? item.stock : 0;
    }
    
    // For other warehouses, return a simulated deterministic stock
    if (!item) return 0;
    const hash = (warehouseName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + sku.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 150;
    return hash;
};

// Recommendation engine for fallback routing
export const getFulfillmentRecommendation = (indentId) => {
    const indents = getIndents();
    const indent = indents.find(i => i.id === indentId);
    if (!indent) return null;

    const primaryWh = indent.requestedTo;
    const sku = indent.sku;
    const reqQty = indent.requestedQty;

    // Check primary warehouse stock
    const primaryStock = getWarehouseStockForLocation(primaryWh, sku);
    if (primaryStock >= reqQty) {
        return {
            status: "sufficient",
            message: `Primary warehouse "${primaryWh}" has sufficient stock (${primaryStock} units).`,
            sourceWarehouse: primaryWh,
            availableStock: primaryStock
        };
    }

    // Inspect fallbacks in sequence from mapped darkhouses config
    const mappingsSaved = localStorage.getItem("haatza_warehouse_mappings");
    if (mappingsSaved) {
        try {
            const mappings = JSON.parse(mappingsSaved);
            const mapping = mappings.find(m => 
                (m.darkhouseName && m.darkhouseName.toLowerCase().trim() === indent.requestedBy.toLowerCase().trim()) ||
                (m.darkhouseId && m.darkhouseId.toLowerCase().trim() === indent.requestedBy.toLowerCase().trim())
            );

            if (mapping) {
                const fallbacks = [
                    { id: mapping.fallback1, name: mapping.fallback1Name },
                    { id: mapping.fallback2, name: mapping.fallback2Name },
                    { id: mapping.fallback3, name: mapping.fallback3Name }
                ].filter(f => f.id && f.name);

                for (let i = 0; i < fallbacks.length; i++) {
                    const fb = fallbacks[i];
                    const fbStock = getWarehouseStockForLocation(fb.name, sku);
                    if (fbStock >= reqQty) {
                        return {
                            status: "recommend_fallback",
                            message: `Sufficient stock found in Priority ${i + 1} Fallback: "${fb.name}" (${fbStock} units).`,
                            sourceWarehouse: fb.name,
                            fallbackPriority: i + 1,
                            availableStock: fbStock
                        };
                    }
                }
                
                // If none of the fallbacks have enough stock, find the one with the maximum stock
                let bestFb = null;
                let maxFbStock = -1;
                let bestFbPriority = -1;
                for (let i = 0; i < fallbacks.length; i++) {
                    const fb = fallbacks[i];
                    const fbStock = getWarehouseStockForLocation(fb.name, sku);
                    if (fbStock > maxFbStock) {
                        maxFbStock = fbStock;
                        bestFb = fb.name;
                        bestFbPriority = i + 1;
                    }
                }

                if (bestFb && maxFbStock > primaryStock) {
                    return {
                        status: "insufficient_but_better",
                        message: `Insufficient stock in primary. Priority ${bestFbPriority} Fallback "${bestFb}" has the most stock (${maxFbStock} units).`,
                        sourceWarehouse: bestFb,
                        fallbackPriority: bestFbPriority,
                        availableStock: maxFbStock
                    };
                }
            }
        } catch (e) {
            console.error("Error calculating recommendation:", e);
        }
    }

    return {
        status: "insufficient_all",
        message: `Insufficient stock in primary (${primaryStock} units) and all configured fallbacks.`,
        sourceWarehouse: primaryWh,
        availableStock: primaryStock
    };
};

// 1. Create Stock Request (Dark House / Main Warehouse)
export const createIndent = (sku, productName, requestedBy, requestedQty, priority, remarks, userName) => {
    const indents = getIndents();
    const darkhouseStock = getDarkhouseStock();
    
    // Look up local stock
    const localEntry = darkhouseStock.find(item => item.darkhouse === requestedBy && item.sku === sku);
    const prevStock = localEntry ? localEntry.available : 0;
    
    // Resolve dynamic primary warehouse instead of hardcoded central warehouse
    const mappingsSaved = localStorage.getItem("haatza_warehouse_mappings");
    let requestedTo = "HAATZA Central Warehouse";
    if (mappingsSaved) {
        try {
            const mappings = JSON.parse(mappingsSaved);
            const mapping = mappings.find(m => 
                (m.darkhouseName && m.darkhouseName.toLowerCase().trim() === requestedBy.toLowerCase().trim()) ||
                (m.darkhouseId && m.darkhouseId.toLowerCase().trim() === requestedBy.toLowerCase().trim())
            );
            if (mapping && mapping.warehouseName) {
                requestedTo = mapping.warehouseName;
            }
        } catch (e) {
            console.error("Failed to parse mappings in createIndent:", e);
        }
    }

    const timestamp = formatCurrentDateTime();
    const newIndent = {
        id: `IND-${Math.floor(10000 + Math.random() * 90000)}`,
        productName,
        sku,
        requestedBy,
        requestedTo,
        requestedQty,
        approvedQty: 0,
        status: "Pending",
        requestedDate: timestamp,
        priority,
        remarks,
        history: [
            {
                date: timestamp,
                status: "Pending",
                user: userName,
                remarks: remarks || "Replenishment indent created."
            }
        ]
    };

    saveIndents([newIndent, ...indents]);

    // Create transaction log
    addTransaction("Request Created", requestedBy, productName, sku, requestedQty, prevStock, prevStock, userName);

    return newIndent;
};

// 2. Approve / Reject Indent (Main Warehouse / Admin)
export const approveIndent = (indentId, approvedQty, remarks, userName, sourceWarehouse = null) => {
    const indents = getIndents();
    const indent = indents.find(i => i.id === indentId);
    if (!indent) throw new Error("Indent request not found.");

    const timestamp = formatCurrentDateTime();
    const isFullApproval = approvedQty === indent.requestedQty;
    const nextStatus = isFullApproval ? "Approved" : "Partially Approved";
    
    const finalRequestedTo = sourceWarehouse || indent.requestedTo;

    const updatedIndents = indents.map(item => {
        if (item.id === indentId) {
            return {
                ...item,
                approvedQty,
                requestedTo: finalRequestedTo,
                status: nextStatus,
                history: [
                    ...item.history,
                    {
                        date: timestamp,
                        status: nextStatus,
                        user: userName,
                        remarks: remarks || `Approved ${approvedQty} out of ${item.requestedQty} requested units.${sourceWarehouse ? ' Sourced from ' + sourceWarehouse + '.' : ''}`
                    }
                ]
            };
        }
        return item;
    });

    saveIndents(updatedIndents);

    // Create Transaction Log
    addTransaction("Approved", finalRequestedTo, indent.productName, indent.sku, approvedQty, 0, 0, userName);

    return true;
};

export const rejectIndent = (indentId, remarks, userName) => {
    const indents = getIndents();
    const indent = indents.find(i => i.id === indentId);
    if (!indent) throw new Error("Indent request not found.");

    const timestamp = formatCurrentDateTime();
    const updatedIndents = indents.map(item => {
        if (item.id === indentId) {
            return {
                ...item,
                status: "Rejected",
                history: [
                    ...item.history,
                    {
                        date: timestamp,
                        status: "Rejected",
                        user: userName,
                        remarks: remarks || "Indent request rejected."
                    }
                ]
            };
        }
        return item;
    });

    saveIndents(updatedIndents);

    // Create Transaction Log
    addTransaction("Rejected", indent.requestedTo, indent.productName, indent.sku, 0, 0, 0, userName);

    return true;
};

// 3. Dispatch Stock (Main Warehouse / Admin)
export const dispatchIndent = (indentId, vehicleNumber, driverName, remarks, userName) => {
    const indents = getIndents();
    const indent = indents.find(i => i.id === indentId);
    if (!indent) throw new Error("Indent request not found.");

    const isCentral = indent.requestedTo.toLowerCase().includes("central");
    const timestamp = formatCurrentDateTime();
    
    let prevStock;
    let newStock;

    if (isCentral) {
        const whStock = getWarehouseStock();
        const centralItemIndex = whStock.findIndex(item => item.sku === indent.sku);
        if (centralItemIndex === -1) throw new Error("Product SKU not found in Main Warehouse catalog.");

        const centralItem = whStock[centralItemIndex];
        if (centralItem.stock < indent.approvedQty) {
            throw new Error(`Insufficient stock in Main Warehouse. Available: ${centralItem.stock}, Approved Qty: ${indent.approvedQty}`);
        }

        prevStock = centralItem.stock;
        newStock = prevStock - indent.approvedQty;

        // Deduct from Main Warehouse stock
        whStock[centralItemIndex] = {
            ...centralItem,
            stock: newStock,
            status: newStock === 0 ? "Out of Stock" : newStock <= centralItem.reorderPoint ? "Low Stock" : "In Stock",
            lastUpdated: timestamp
        };
        saveWarehouseStock(whStock);
    } else {
        // Fallback warehouse stock: simulate deduction
        prevStock = getWarehouseStockForLocation(indent.requestedTo, indent.sku);
        newStock = Math.max(0, prevStock - indent.approvedQty);
    }

    // Update request status to Dispatched
    const updatedIndents = indents.map(item => {
        if (item.id === indentId) {
            return {
                ...item,
                status: "Dispatched",
                vehicleNumber,
                driverName,
                dispatchRemarks: remarks,
                history: [
                    ...item.history,
                    {
                        date: timestamp,
                        status: "Dispatched",
                        user: userName,
                        remarks: remarks || `Dispatched from ${indent.requestedTo} via vehicle ${vehicleNumber} (Driver: ${driverName}).`
                    }
                ]
            };
        }
        return item;
    });
    saveIndents(updatedIndents);

    // Create stock movement log
    addTransaction("Dispatched", indent.requestedTo, indent.productName, indent.sku, indent.approvedQty, prevStock, newStock, userName);

    return true;
};

// 4. Receive Stock (Dark House / Main Warehouse Hub User)
// Adds receivedQty to Darkhouse stock and transitions request to Completed
export const receiveIndent = (indentId, receivedQty, damagedQty, remarks, userName) => {
    const indents = getIndents();
    const indent = indents.find(i => i.id === indentId);
    if (!indent) throw new Error("Indent request not found.");

    const dhStock = getDarkhouseStock();
    const localEntryIndex = dhStock.findIndex(
        item => item.darkhouse === indent.requestedBy && item.sku === indent.sku
    );

    let prevStock = 0;
    let newStock = receivedQty;

    const timestamp = formatCurrentDateTime();

    // 1. Add stock to darkhouse inventory
    if (localEntryIndex !== -1) {
        const localItem = dhStock[localEntryIndex];
        prevStock = localItem.available;
        newStock = prevStock + receivedQty;
        
        dhStock[localEntryIndex] = {
            ...localItem,
            available: newStock,
            status: newStock === 0 ? "Out of Stock" : newStock <= localItem.reorder ? "Low Stock" : "In Stock"
        };
    } else {
        // If the hub didn't carry this SKU in their catalog yet, add it
        const newEntry = {
            id: `DHS-${Math.floor(10000 + Math.random() * 90000)}`,
            darkhouse: indent.requestedBy,
            product: indent.productName,
            sku: indent.sku,
            available: receivedQty,
            reserved: 0,
            reorder: 15,
            status: receivedQty === 0 ? "Out of Stock" : receivedQty <= 15 ? "Low Stock" : "In Stock"
        };
        dhStock.push(newEntry);
    }
    saveDarkhouseStock(dhStock);

    // 2. Update request status to Completed
    const updatedIndents = indents.map(item => {
        if (item.id === indentId) {
            return {
                ...item,
                status: "Completed",
                receivedQty,
                damagedQty,
                receiveRemarks: remarks,
                history: [
                    ...item.history,
                    {
                        date: timestamp,
                        status: "Completed",
                        user: userName,
                        remarks: remarks || `Stock received. Received Qty: ${receivedQty}, Damaged Qty: ${damagedQty}.`
                    }
                ]
            };
        }
        return item;
    });
    saveIndents(updatedIndents);

    // 3. Create stock movement log
    addTransaction("Received", indent.requestedBy, indent.productName, indent.sku, receivedQty, prevStock, newStock, userName);

    return true;
};

// 5. Get Low Stock Alerts
export const getLowStockAlerts = (warehouseName) => {
    // If it's central warehouse, look up low stock central items
    if (warehouseName.toLowerCase().includes("central")) {
        const whStock = getWarehouseStock();
        return whStock
            .filter(item => item.stock <= item.reorderPoint)
            .map(item => ({
                sku: item.sku,
                productName: item.product,
                currentStock: item.stock,
                reorderLevel: item.reorderPoint,
                warehouse: warehouseName
            }));
    } else {
        // Look up local hub stocks
        const dhStock = getDarkhouseStock();
        return dhStock
            .filter(item => item.darkhouse === warehouseName && item.available <= item.reorder)
            .map(item => ({
                sku: item.sku,
                productName: item.product,
                currentStock: item.available,
                reorderLevel: item.reorder,
                warehouse: warehouseName
            }));
    }
};
