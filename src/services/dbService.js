// dbService.js - Central database persistence layer for HAATZA PIM & Replenishment
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../data/catalogData";
import { INITIAL_DARKHOUSES } from "../data/darkhouses";
import { MOCK_WAREHOUSE_STOCK, MOCK_DARKHOUSE_STOCK } from "../data/inventoryData";

// Seed Database helper
export const seedDatabase = () => {
    // 1. Categories
    if (!localStorage.getItem("haatza_categories")) {
        localStorage.setItem("haatza_categories", JSON.stringify(MOCK_CATEGORIES));
    }
    // 2. Products
    if (!localStorage.getItem("haatza_products")) {
        localStorage.setItem("haatza_products", JSON.stringify(MOCK_PRODUCTS));
    }
    // 3. Facilities (Warehouses & Dark Houses)
    if (!localStorage.getItem("haatza_darkhouses")) {
        localStorage.setItem("haatza_darkhouses", JSON.stringify(INITIAL_DARKHOUSES));
    }
    // 4. Inventory Ledger
    if (!localStorage.getItem("haatza_inventory_ledger")) {
        const ledger = [];
        // Seed warehouse stock
        MOCK_WAREHOUSE_STOCK.forEach(w => {
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
                maxStock: w.maxStock,
                status: w.status,
                lastUpdated: new Date().toISOString()
            });
        });
        // Seed darkhouse stock
        MOCK_DARKHOUSE_STOCK.forEach(d => {
            const existing = ledger.find(l => l.location === d.darkhouse && l.sku === d.sku);
            if (!existing) {
                ledger.push({
                    location: d.darkhouse,
                    sku: d.sku,
                    productName: d.product,
                    category: d.category || "Uncategorized",
                    available: d.available,
                    allocated: 0,
                    in_transit: 0,
                    damaged: 0,
                    rejected: 0,
                    reorderPoint: d.reorder || 15,
                    maxStock: 300,
                    status: d.status,
                    lastUpdated: new Date().toISOString()
                });
            }
        });
        localStorage.setItem("haatza_inventory_ledger", JSON.stringify(ledger));
    }
    // 5. Mappings (Darkhouse replenishment config)
    if (!localStorage.getItem("haatza_warehouse_mappings")) {
        const initialMappings = [
            {
                darkhouseId: "DKH-002",
                darkhouseName: "HAATZA Powai Depot",
                warehouseId: "DKH-001",
                warehouseName: "HAATZA Koramangala Hub",
                fallback1: "DKH-004",
                fallback1Name: "HAATZA GK-1 Warehouse",
                fallback2: "",
                fallback2Name: "",
                fallback3: "",
                fallback3Name: "",
                distance: "12 km",
                sla: "2 hours",
                region: "West",
                status: "ACTIVE"
            },
            {
                darkhouseId: "DKH-003",
                darkhouseName: "HAATZA Indiranagar Hub",
                warehouseId: "DKH-001",
                warehouseName: "HAATZA Koramangala Hub",
                fallback1: "",
                fallback1Name: "",
                fallback2: "",
                fallback2Name: "",
                fallback3: "",
                fallback3Name: "",
                distance: "5 km",
                sla: "45 mins",
                region: "South",
                status: "ACTIVE"
            }
        ];
        localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(initialMappings));
    }
    // 6. Audit Trail Logs
    if (!localStorage.getItem("haatza_audit_logs")) {
        localStorage.setItem("haatza_audit_logs", JSON.stringify([]));
    }
};

// Auto-seed database when dbService is imported
seedDatabase();

// --- Storage Retrieval & Save Core Helpers ---
export const getProducts = () => JSON.parse(localStorage.getItem("haatza_products") || "[]");
export const saveProducts = (list) => localStorage.setItem("haatza_products", JSON.stringify(list));

export const getCategories = () => JSON.parse(localStorage.getItem("haatza_categories") || "[]");
export const saveCategories = (list) => localStorage.setItem("haatza_categories", JSON.stringify(list));

export const getDarkhouses = () => JSON.parse(localStorage.getItem("haatza_darkhouses") || "[]");
export const saveDarkhouses = (list) => localStorage.setItem("haatza_darkhouses", JSON.stringify(list));

export const getMappings = () => JSON.parse(localStorage.getItem("haatza_warehouse_mappings") || "[]");
export const saveMappings = (list) => localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(list));

export const getInventory = () => JSON.parse(localStorage.getItem("haatza_inventory_ledger") || "[]");
export const saveInventory = (list) => localStorage.setItem("haatza_inventory_ledger", JSON.stringify(list));

export const getAuditLogs = () => JSON.parse(localStorage.getItem("haatza_audit_logs") || "[]");
export const saveAuditLogs = (list) => localStorage.setItem("haatza_audit_logs", JSON.stringify(list));

// --- Audit Logger ---
export const addAuditLog = (user, action, module, oldValue, newValue, reason = "") => {
    const logs = getAuditLogs();
    const logEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: user || "System",
        timestamp: new Date().toISOString(),
        action,
        module,
        oldValue: oldValue ? JSON.stringify(oldValue) : "",
        newValue: newValue ? JSON.stringify(newValue) : "",
        ip: "127.0.0.1",
        reason
    };
    logs.unshift(logEntry);
    saveAuditLogs(logs);
};

// --- Central Double-Entry Stock Movement Ledger ---
export const adjustStock = (locationName, sku, bucket, delta, userName = "System", remark = "") => {
    const ledger = getInventory();
    let index = ledger.findIndex(l => l.location === locationName && l.sku === sku);
    
    const products = getProducts();
    const product = products.find(p => p.sku === sku);
    const productName = product ? product.name : sku;
    const category = product ? product.category : "Uncategorized";

    const timestamp = new Date().toISOString();
    let oldRecord = null;

    if (index === -1) {
        // Create new record
        const newRecord = {
            location: locationName,
            sku,
            productName,
            category,
            available: 0,
            allocated: 0,
            in_transit: 0,
            damaged: 0,
            rejected: 0,
            reorderPoint: product ? product.reorderLevel : 15,
            maxStock: 300,
            status: "Out of Stock",
            lastUpdated: timestamp
        };
        ledger.push(newRecord);
        index = ledger.length - 1;
    } else {
        oldRecord = { ...ledger[index] };
    }

    const item = ledger[index];
    const originalVal = item[bucket] || 0;
    const newVal = Math.max(0, originalVal + delta);
    item[bucket] = newVal;

    // Recalculate status
    const totalAvailable = item.available;
    if (totalAvailable === 0) {
        item.status = "Out of Stock";
    } else if (totalAvailable <= item.reorderPoint) {
        item.status = "Low Stock";
    } else {
        item.status = "In Stock";
    }
    item.lastUpdated = timestamp;

    saveInventory(ledger);

    // Write audit log
    addAuditLog(
        userName,
        "Stock Adjustment",
        "Inventory",
        oldRecord,
        item,
        remark || `Adjusted ${bucket} stock level of ${sku} at ${locationName} by ${delta}.`
    );

    return item;
};
