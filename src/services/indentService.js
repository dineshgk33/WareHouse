import { 
    getProducts, 
    getCategories, 
    getDarkhouses, 
    getMappings, 
    getInventory, 
    saveInventory, 
    addAuditLog, 
    adjustStock 
} from "./dbService";

// Define mock data for UOM, Average Daily Sales (ADS), and Barcodes for auto-replenishment suggested quantity engine
export const PRODUCT_REPLENISHMENT_META = {
    "FRT-MNG-ALP": { ads: 12, uom: "Units", minStock: 20, maxStock: 200, reorderPoint: 40, barcode: "8901030753012" },
    "DRY-MLK-TAZ": { ads: 45, uom: "Units", minStock: 50, maxStock: 500, reorderPoint: 100, barcode: "8901262010125" },
    "SNK-LYS-CLT": { ads: 25, uom: "Cases", minStock: 15, maxStock: 150, reorderPoint: 30, barcode: "8901491101831" },
    "DRK-COK-ZER": { ads: 18, uom: "Cases", minStock: 10, maxStock: 120, reorderPoint: 25, barcode: "8901764032258" },
    "FZN-MCN-FRS": { ads: 15, uom: "Packs", minStock: 10, maxStock: 100, reorderPoint: 20, barcode: "8901993411030" },
    "PSC-DTL-HDW": { ads: 8,  uom: "Packs", minStock: 5,  maxStock: 80,  reorderPoint: 15, barcode: "8902041285090" },
    "HSE-SRF-EXC": { ads: 10, uom: "Packs", minStock: 8,  maxStock: 80,  reorderPoint: 18, barcode: "8902235490102" },
    "BBY-JHN-POW": { ads: 6,  uom: "Packs", minStock: 5,  maxStock: 50,  reorderPoint: 10, barcode: "8902511003422" }
};

const INITIAL_INDENTS = [
    {
        id: "IND-90001",
        indentType: "Regular Replenishment",
        requestedBy: "HAATZA GK-1 Warehouse",
        requestedTo: "HAATZA Central Warehouse",
        sku: "FZN-MCN-FRS",
        productName: "McCain French Fries",
        uom: "Packs",
        requestedQty: 50,
        suggestedQty: 48,
        approvedQty: 0,
        receivedQty: 0,
        shortQty: 0,
        damagedQty: 0,
        rejectedQty: 0,
        status: "Pending",
        priority: "High",
        requestedDate: "2026-06-16T10:00:00Z",
        requiredDate: "2026-06-18T10:00:00Z",
        expectedDeliveryDate: "2026-06-17T18:00:00Z",
        reason: "Low stock, high demand expected for the weekend.",
        remarks: "Stock depletion risk.",
        vehicleNumber: "",
        driverName: "",
        dispatchStatus: "Ready To Pick",
        dispatchRemarks: "",
        receiveRemarks: "",
        history: [
            { date: "2026-06-16T10:00:00Z", status: "Pending", user: "Store Manager (GK-1)", remarks: "Request created." }
        ]
    },
    {
        id: "IND-90002",
        indentType: "Emergency Replenishment",
        requestedBy: "HAATZA Koramangala Hub",
        requestedTo: "HAATZA Central Warehouse",
        sku: "PSC-DTL-HDW",
        productName: "Dettol Liquid Handwash",
        uom: "Packs",
        requestedQty: 40,
        suggestedQty: 38,
        approvedQty: 40,
        receivedQty: 0,
        shortQty: 0,
        damagedQty: 0,
        rejectedQty: 0,
        status: "Dispatched",
        priority: "Critical",
        requestedDate: "2026-06-15T14:30:00Z",
        requiredDate: "2026-06-16T14:30:00Z",
        expectedDeliveryDate: "2026-06-16T09:00:00Z",
        reason: "Currently out of stock.",
        remarks: "Critical item stockout.",
        vehicleNumber: "KA-03-HA-8821",
        driverName: "Ramesh Kumar",
        dispatchStatus: "Dispatched",
        dispatchRemarks: "Dispatched via Delivery Truck-04.",
        receiveRemarks: "",
        history: [
            { date: "2026-06-15T14:30:00Z", status: "Pending", user: "Store Manager (Koramangala)", remarks: "Request created." },
            { date: "2026-06-15T16:00:00Z", status: "Approved", user: "Warehouse Manager (Central)", remarks: "Approved full quantity." },
            { date: "2026-06-16T09:00:00Z", status: "Dispatched", user: "Warehouse Manager (Central)", remarks: "Dispatched via Delivery Truck-04." }
        ]
    },
    {
        id: "IND-90003",
        indentType: "Promotional Demand",
        requestedBy: "HAATZA Powai Depot",
        requestedTo: "HAATZA Central Warehouse",
        sku: "DRY-MLK-TAZ",
        productName: "Amul Taaza Toned Milk",
        uom: "Units",
        requestedQty: 100,
        suggestedQty: 120,
        approvedQty: 100,
        receivedQty: 100,
        shortQty: 0,
        damagedQty: 0,
        rejectedQty: 0,
        status: "Closed",
        priority: "Urgent",
        requestedDate: "2026-06-14T09:15:00Z",
        requiredDate: "2026-06-15T09:15:00Z",
        expectedDeliveryDate: "2026-06-14T18:00:00Z",
        reason: "Urgent stock replenishment requested.",
        remarks: "High demand promo campaign active.",
        vehicleNumber: "MH-02-ZZ-5501",
        driverName: "Sanjay Patil",
        dispatchStatus: "Delivered",
        dispatchRemarks: "Dispatched via Van-02.",
        receiveRemarks: "Stock received in good condition, cold chain verified.",
        history: [
            { date: "2026-06-14T09:15:00Z", status: "Pending", user: "Store Manager (Powai)", remarks: "Request created." },
            { date: "2026-06-14T10:30:00Z", status: "Approved", user: "Warehouse Manager (Central)", remarks: "Approved full quantity." },
            { date: "2026-06-14T14:00:00Z", status: "Dispatched", user: "Warehouse Manager (Central)", remarks: "Dispatched via Van-02." },
            { date: "2026-06-15T10:00:00Z", status: "Closed", user: "Store Manager (Powai)", remarks: "Stock received and verified." }
        ]
    }
];

const INITIAL_TRANSACTIONS = [
    {
        transactionId: "TXN-80001",
        indentId: "IND-90001",
        type: "Request Created",
        warehouse: "HAATZA GK-1 Warehouse",
        productName: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        quantity: 50,
        prevStock: 3,
        newStock: 3,
        user: "Store Manager (GK-1)",
        timestamp: "2026-06-16T10:00:00Z"
    },
    {
        transactionId: "TXN-80002",
        indentId: "IND-90002",
        type: "Request Created",
        warehouse: "HAATZA Koramangala Hub",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 0,
        newStock: 0,
        user: "Store Manager (Koramangala)",
        timestamp: "2026-06-15T14:30:00Z"
    },
    {
        transactionId: "TXN-80003",
        indentId: "IND-90002",
        type: "Approved",
        warehouse: "HAATZA Central Warehouse",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 0,
        newStock: 0,
        user: "Warehouse Manager (Central)",
        timestamp: "2026-06-15T16:00:00Z"
    },
    {
        transactionId: "TXN-80004",
        indentId: "IND-90002",
        type: "Dispatched",
        warehouse: "HAATZA Central Warehouse",
        productName: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        quantity: 40,
        prevStock: 40,
        newStock: 0,
        user: "Warehouse Manager (Central)",
        timestamp: "2026-06-16T09:00:00Z"
    }
];

const formatCurrentDateTime = () => {
    return new Date().toISOString();
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
    const ledger = getInventory();
    return ledger
        .filter(l => l.location === "HAATZA Central Warehouse")
        .map(l => ({
            sku: l.sku,
            product: l.productName,
            category: l.category,
            stock: l.available,
            reorderPoint: l.reorderPoint,
            status: l.status,
            lastUpdated: l.lastUpdated
        }));
};

export const getDarkhouseStock = () => {
    const ledger = getInventory();
    return ledger
        .filter(l => l.location !== "HAATZA Central Warehouse")
        .map(l => ({
            darkhouse: l.location,
            product: l.productName,
            sku: l.sku,
            available: l.available,
            reserved: l.allocated || 0,
            reorder: l.reorderPoint,
            status: l.status
        }));
};

const saveIndents = (data) => localStorage.setItem("haatza_indent_requests", JSON.stringify(data));
const saveTransactions = (data) => localStorage.setItem("haatza_inventory_transactions", JSON.stringify(data));

const saveWarehouseStock = (list) => {
    const ledger = getInventory().filter(l => l.location !== "HAATZA Central Warehouse");
    list.forEach(w => {
        ledger.push({
            location: "HAATZA Central Warehouse",
            sku: w.sku,
            productName: w.product,
            category: w.category,
            available: w.stock,
            allocated: 0,
            in_transit: 0,
            damaged: 0,
            rejected: 0,
            reorderPoint: w.reorderPoint,
            maxStock: w.maxStock || 300,
            status: w.status,
            lastUpdated: new Date().toISOString()
        });
    });
    saveInventory(ledger);
};

const saveDarkhouseStock = (list) => {
    const ledger = getInventory().filter(l => l.location === "HAATZA Central Warehouse");
    list.forEach(d => {
        ledger.push({
            location: d.darkhouse,
            sku: d.sku,
            productName: d.product,
            category: d.category || "Uncategorized",
            available: d.available,
            allocated: d.reserved || 0,
            in_transit: 0,
            damaged: 0,
            rejected: 0,
            reorderPoint: d.reorder || 15,
            maxStock: 300,
            status: d.status,
            lastUpdated: new Date().toISOString()
        });
    });
    saveInventory(ledger);
};

// Write transaction log helper
const addTransaction = (type, indentId, warehouse, productName, sku, qty, prevStock, newStock, user) => {
    const txns = getTransactions();
    const newTxn = {
        transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        indentId,
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

// --- Auto-Suggestion Replenishment Engine ---
export const getAutoSuggestedQuantity = (sku, currentStock, coverDays = 7, leadTime = 2, seasonality = 1.1, promotion = 1.0) => {
    const meta = PRODUCT_REPLENISHMENT_META[sku];
    if (!meta) return 0;
    const ads = meta.ads;
    const grossDemand = ads * (Number(coverDays) + Number(leadTime)) * Number(seasonality) * Number(promotion);
    const suggested = Math.max(0, Math.ceil(grossDemand - Number(currentStock)));
    return suggested;
};

// Helper to check duplicate active indents to prevent double-ordering
export const checkDuplicateActiveIndent = (darkhouseName, sku) => {
    const indents = getIndents();
    return indents.some(i => i.requestedBy === darkhouseName && i.sku === sku && ["Pending", "Submitted", "Approved", "Partially Approved", "Dispatched"].includes(i.status));
};

// Helper to get stock of any warehouse (simulated for fallbacks, actual for Central/Primary)
export const getWarehouseStockForLocation = (warehouseName, sku) => {
    const ledger = getInventory();
    const item = ledger.find(l => l.location === warehouseName && l.sku === sku);
    return item ? item.available : 0;
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
            message: `Primary warehouse "${primaryWh}" has sufficient stock (${primaryStock} units available).`,
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
        message: `Insufficient stock in primary (${primaryStock} units) and all fallbacks.`,
        sourceWarehouse: primaryWh,
        availableStock: primaryStock
    };
};

// 1. Create Multi-Product Batch Stock Requests
export const createReplenishmentIndentBatch = ({
    items,
    indentType,
    requestedBy,
    priority,
    requiredDate,
    expectedDeliveryDate,
    reason,
    remarks,
    userName,
    isDraft = false
}) => {
    const indents = getIndents();
    const darkhouseStock = getDarkhouseStock();
    const timestamp = formatCurrentDateTime();
    const batchId = `IND-${Math.floor(10000 + Math.random() * 90000)}`;
    const initialStatus = isDraft ? "Draft" : "Submitted";

    // Resolve dynamic primary warehouse
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
            console.error("Failed to resolve mapping in createReplenishmentIndentBatch:", e);
        }
    }

    const createdIndents = [];

    items.forEach((item, idx) => {
        const id = items.length === 1 ? batchId : `${batchId}-${idx + 1}`;
        const localEntry = darkhouseStock.find(stock => stock.darkhouse === requestedBy && stock.sku === item.sku);
        const prevStock = localEntry ? localEntry.available : 0;

        const newIndent = {
            id,
            indentType,
            requestedBy,
            requestedTo,
            sku: item.sku,
            productName: item.productName,
            uom: item.uom || "Units",
            requestedQty: Number(item.requestedQty),
            suggestedQty: Number(item.suggestedQty || 0),
            approvedQty: 0,
            receivedQty: 0,
            shortQty: 0,
            damagedQty: 0,
            rejectedQty: 0,
            status: initialStatus,
            priority,
            requestedDate: timestamp,
            requiredDate: requiredDate || new Date(Date.now() + 48*60*60*1000).toISOString(),
            expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 24*60*60*1000).toISOString(),
            reason: reason || "Regular replenishment",
            remarks: remarks || "",
            vehicleNumber: "",
            driverName: "",
            dispatchStatus: "Ready To Pick",
            dispatchRemarks: "",
            receiveRemarks: "",
            history: [
                {
                    date: timestamp,
                    status: initialStatus,
                    user: userName,
                    remarks: isDraft ? "Saved as Draft" : "Replenishment request submitted for approval."
                }
            ]
        };

        createdIndents.push(newIndent);
        addTransaction(isDraft ? "Draft Created" : "Request Created", id, requestedBy, item.productName, item.sku, Number(item.requestedQty), prevStock, prevStock, userName);
    });

    saveIndents([...createdIndents, ...indents]);
    return createdIndents;
};

// 2. Approve / Reject Indent (Multi-tier Gateways)
export const approveReplenishmentIndent = ({
    indentId,
    approvedQty,
    remarks,
    userName,
    sourceWarehouse = null,
    createBackorder = false
}) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();
    const qtyApproved = Number(approvedQty);
    const finalRequestedTo = sourceWarehouse || indent.requestedTo;
    
    let nextStatus = "Approved";
    if (qtyApproved < indent.requestedQty) {
        nextStatus = "Partially Approved";
    }

    indents[indentIndex] = {
        ...indent,
        approvedQty: qtyApproved,
        requestedTo: finalRequestedTo,
        status: nextStatus,
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: nextStatus,
                user: userName,
                remarks: remarks || `Approved ${qtyApproved} out of ${indent.requestedQty} units.${sourceWarehouse ? ' Sourced from ' + sourceWarehouse + '.' : ''}`
            }
        ]
    };

    let backorderRef = null;

    if (createBackorder && qtyApproved < indent.requestedQty) {
        const boQty = indent.requestedQty - qtyApproved;
        const boId = `${indent.id}-BO`;
        backorderRef = boId;
        
        const existingBo = indents.find(i => i.id === boId);
        if (!existingBo) {
            const boIndent = {
                ...indent,
                id: boId,
                requestedQty: boQty,
                suggestedQty: 0,
                approvedQty: 0,
                status: "Pending",
                requestedDate: timestamp,
                reason: "Backorder from " + indent.id,
                remarks: `Automated backorder split of ${boQty} units.`,
                history: [
                    {
                        date: timestamp,
                        status: "Pending",
                        user: userName,
                        remarks: `Backorder spawned from partial approval of ${indent.id}.`
                    }
                ]
            };
            indents.unshift(boIndent);
            addTransaction("Backorder Spawned", boId, indent.requestedBy, indent.productName, indent.sku, boQty, 0, 0, userName);
        }
    }

    if (backorderRef) {
        indents[indentIndex].backorderRef = backorderRef;
    }

    saveIndents(indents);
    addTransaction("Approved & Reserved", indentId, finalRequestedTo, indent.productName, indent.sku, qtyApproved, 0, 0, userName);
    return true;
};

// Reject indent request
export const rejectReplenishmentIndent = (indentId, remarks, userName) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();

    indents[indentIndex] = {
        ...indent,
        status: "Rejected",
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: "Rejected",
                user: userName,
                remarks: remarks || "Replenishment request rejected."
            }
        ]
    };

    saveIndents(indents);
    addTransaction("Rejected", indentId, indent.requestedTo, indent.productName, indent.sku, 0, 0, 0, userName);
    return true;
};

// Cancel indent request (only from Draft / Pending status)
export const cancelReplenishmentIndent = (indentId, remarks, userName) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();

    indents[indentIndex] = {
        ...indent,
        status: "Cancelled",
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: "Cancelled",
                user: userName,
                remarks: remarks || "Replenishment request cancelled."
            }
        ]
    };

    saveIndents(indents);
    addTransaction("Cancelled", indentId, indent.requestedBy, indent.productName, indent.sku, 0, 0, 0, userName);
    return true;
};

// 3. Dispatch Management & Transit Tracking
export const dispatchReplenishmentIndent = ({
    indentId,
    vehicleNumber,
    driverName,
    remarks,
    userName
}) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();
    
    const prevStock = getWarehouseStockForLocation(indent.requestedTo, indent.sku);
    if (prevStock < indent.approvedQty) {
        throw new Error(`Insufficient stock in ${indent.requestedTo}. Available: ${prevStock}, Approved Qty: ${indent.approvedQty}`);
    }

    // Deduct stock from source warehouse and add to in_transit
    adjustStock(indent.requestedTo, indent.sku, "available", -indent.approvedQty, userName, "Deducting stock for dispatch");
    adjustStock(indent.requestedTo, indent.sku, "in_transit", indent.approvedQty, userName, "Moving stock to transit pool");
    const newStock = prevStock - indent.approvedQty;

    indents[indentIndex] = {
        ...indent,
        status: "Dispatched",
        vehicleNumber,
        driverName,
        dispatchStatus: "Dispatched",
        dispatchRemarks: remarks,
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: "Dispatched",
                user: userName,
                remarks: remarks || `Dispatched from ${indent.requestedTo} via vehicle ${vehicleNumber} (Driver: ${driverName}).`
            }
        ]
    };

    saveIndents(indents);
    addTransaction("Dispatched", indentId, indent.requestedTo, indent.productName, indent.sku, indent.approvedQty, prevStock, newStock, userName);
    return true;
};

// Dispatch Transit Update helper
export const updateDispatchStatus = (indentId, nextDispatchStatus, userName) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) return false;

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();

    indents[indentIndex] = {
        ...indent,
        dispatchStatus: nextDispatchStatus,
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: "Dispatch Update",
                user: userName,
                remarks: `Shipment transit status updated to: ${nextDispatchStatus}.`
            }
        ]
    };

    saveIndents(indents);
    return true;
};

// 4. Goods Receipt Confirmation (GRN Verification)
export const processReceivingVerification = ({
    indentId,
    receivedQty,
    shortQty,
    damagedQty,
    rejectedQty,
    remarks,
    userName,
    attachments = [],
    isOverReceiptApproved = false
}) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const rec = Number(receivedQty) || 0;
    const sh = Number(shortQty) || 0;
    const dmg = Number(damagedQty) || 0;
    const rej = Number(rejectedQty) || 0;

    if (rec < 0 || sh < 0 || dmg < 0 || rej < 0) {
        throw new Error("Quantities cannot be negative.");
    }

    if (rec > indent.approvedQty && !isOverReceiptApproved) {
        throw new Error("Over-receipt requires manager approval.");
    }

    const timestamp = formatCurrentDateTime();
    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Update stock levels in ledger
    // Reduce in_transit stock at source warehouse
    adjustStock(indent.requestedTo, indent.sku, "in_transit", -indent.approvedQty, userName, "Deducting from transit pool upon receipt");
    
    // Add to receiving darkhouse available, damaged, and rejected
    const prevStock = getWarehouseStockForLocation(indent.requestedBy, indent.sku);
    adjustStock(indent.requestedBy, indent.sku, "available", rec, userName, "Adding received stock to dark store available pool");
    if (dmg > 0) {
        adjustStock(indent.requestedBy, indent.sku, "damaged", dmg, userName, "Adding damaged stock to dark store damaged pool");
    }
    if (rej > 0) {
        adjustStock(indent.requestedBy, indent.sku, "rejected", rej, userName, "Adding QA rejected stock to dark store rejected pool");
    }
    const newStock = prevStock + rec;

    // Resolve final status
    let nextStatus = "Closed";
    if (rec === indent.approvedQty && dmg === 0 && sh === 0 && rej === 0) {
        nextStatus = "Closed";
    } else if (dmg > 0) {
        nextStatus = "Damaged"; // pending resolution
    } else if (sh > 0 || rec < indent.approvedQty) {
        nextStatus = "Short Received"; // Exception closure
    }

    // If there is any over-receipt
    if (rec > indent.approvedQty) {
        nextStatus = "Closed"; // approved over receipt
    }

    indents[indentIndex] = {
        ...indent,
        status: nextStatus,
        receivedQty: rec,
        shortQty: sh,
        damagedQty: dmg,
        rejectedQty: rej,
        grnNumber,
        grnDate: timestamp,
        receivedBy: userName,
        verifiedBy: `${userName} (Auditor)`,
        remarks: remarks || "",
        attachments,
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: nextStatus === "Closed" ? "Closed" : "Exception Closure",
                user: userName,
                remarks: remarks || `GRN Verified. Received: ${rec}, Short: ${sh}, Damaged: ${dmg}, Rejected: ${rej}. GRN generated: ${grnNumber}.`
            }
        ]
    };

    saveIndents(indents);
    addTransaction("Received & GRN Confirmed", indentId, indent.requestedBy, indent.productName, indent.sku, rec, prevStock, newStock, userName);
    return indents[indentIndex];
};

export const receiveReplenishmentIndent = ({
    indentId,
    receivedQty,
    shortQty,
    damagedQty,
    rejectedQty,
    remarks,
    userName
}) => {
    processReceivingVerification({
        indentId,
        receivedQty,
        shortQty,
        damagedQty,
        rejectedQty,
        remarks,
        userName,
        attachments: [],
        isOverReceiptApproved: true
    });
    return true;
};

export const transitReplenishmentIndent = (indentId, userName) => {
    const indents = getIndents();
    const indentIndex = indents.findIndex(i => i.id === indentId);
    if (indentIndex === -1) throw new Error("Indent request not found.");

    const indent = indents[indentIndex];
    const timestamp = formatCurrentDateTime();

    indents[indentIndex] = {
        ...indent,
        status: "In Transit",
        dispatchStatus: "In Transit",
        history: [
            ...indent.history,
            {
                date: timestamp,
                status: "In Transit",
                user: userName,
                remarks: `Shipment transited to: In Transit.`
            }
        ]
    };

    saveIndents(indents);
    return true;
};

// 5. Get Low Stock Alerts
export const getLowStockAlerts = (warehouseName) => {
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

// Helper for Dashboard charts and trends calculations
export const getReplenishmentKPIs = () => {
    const indents = getIndents();
    const pending = indents.filter(i => i.status === "Pending" || i.status === "Submitted").length;
    const approved = indents.filter(i => i.status === "Approved" || i.status === "Partially Approved").length;
    const rejected = indents.filter(i => i.status === "Rejected").length;
    const emergency = indents.filter(i => i.priority === "Critical" && i.status !== "Closed" && i.status !== "Exception Closed").length;
    const openBackorders = indents.filter(i => i.id.includes("-BO") && i.status !== "Closed" && i.status !== "Exception Closed").length;

    const pendingReceipts = indents.filter(i => i.status === "Dispatched" || i.status === "In Transit").length;
    const pendingGRN = indents.filter(i => i.status === "Dispatched" || i.status === "In Transit").length;
    const shortReceipts = indents.filter(i => i.status === "Short Received" || (i.shortQty && i.shortQty > 0)).length;
    const damagedReceipts = indents.filter(i => i.status === "Damaged" || (i.damagedQty && i.damagedQty > 0)).length;
    const closedCount = indents.filter(i => i.status === "Closed" || i.status === "Exception Closed" || i.status === "Short Received" || i.status === "Damaged").length;
    const averageVerificationTime = 14.5; // minutes

    const closedIndents = indents.filter(i => i.status === "Closed" || i.status === "Exception Closed" || i.status === "Short Received" || i.status === "Damaged");
    let fulfillmentPercentage = 100;
    if (closedIndents.length > 0) {
        const totalRequested = closedIndents.reduce((acc, i) => acc + i.requestedQty, 0);
        const totalReceived = closedIndents.reduce((acc, i) => acc + i.receivedQty, 0);
        fulfillmentPercentage = totalRequested > 0 ? Math.round((totalReceived / totalRequested) * 100) : 100;
    }

    return {
        pending,
        approved,
        rejected,
        emergency,
        fulfillmentPercentage,
        averageApprovalTime: "1.2 hours",
        averageDeliveryTime: "4.5 hours",
        openBackorders,
        pendingReceipts,
        pendingGRN,
        shortReceipts,
        damagedReceipts,
        averageVerificationTime,
        closedCount
    };
};
