import { getInventory, saveInventory, addAuditLog, adjustStock, getProducts } from "./dbService.js";

// --- Seed Data definitions ---
const INITIAL_VENDORS = [
    {
        vendorCode: "VEN-001",
        vendorName: "Zepto-Direct Fresh Farms",
        gstNumber: "27AAAAA1111A1Z1",
        fssaiNumber: "12345678901234",
        contactPerson: "Rajesh Sharma",
        phone: "9876543210",
        email: "rajesh@directfresh.com",
        address: "Gat No 231, Manchar, Pune - 410503",
        bankDetails: { accountNumber: "50200012345678", bankName: "HDFC Bank", ifscCode: "HDFC0000104" },
        categories: ["Fruits", "Vegetables"],
        leadTime: 1, // in days
        serviceAreas: ["Mumbai", "Bangalore"],
        status: "ACTIVE"
    },
    {
        vendorCode: "VEN-002",
        vendorName: "Mother Dairy Logistics",
        gstNumber: "27BBBBB2222B2Z2",
        fssaiNumber: "10012011000120",
        contactPerson: "Amrita Patel",
        phone: "9123456789",
        email: "logistics@motherdairy.com",
        address: "Patparganj Industrial Area, Delhi - 110092",
        bankDetails: { accountNumber: "001205001928", bankName: "ICICI Bank", ifscCode: "ICIC0000012" },
        categories: ["Dairy"],
        leadTime: 1,
        serviceAreas: ["Delhi", "Mumbai"],
        status: "ACTIVE"
    },
    {
        vendorCode: "VEN-003",
        vendorName: "ColdChain Foods Inc.",
        gstNumber: "27CCCCC3333C3Z3",
        fssaiNumber: "10014022000540",
        contactPerson: "Vikram Malhotra",
        phone: "8888888888",
        email: "deliveries@coldchain.com",
        address: "Plot 45, Taloja MIDC, Navi Mumbai - 410208",
        bankDetails: { accountNumber: "91802005432190", bankName: "Axis Bank", ifscCode: "UTIB0000274" },
        categories: ["Frozen"],
        leadTime: 2,
        serviceAreas: ["Mumbai", "Bangalore", "Delhi"],
        status: "ACTIVE"
    },
    {
        vendorCode: "VEN-004",
        vendorName: "Apollo Pharma Distributors",
        gstNumber: "27DDDDD4444D4Z4",
        fssaiNumber: "20015099000110",
        contactPerson: "Dr. K. Srinivas",
        phone: "7777777777",
        email: "procure@apollopharma.com",
        address: "Balanagar, Hyderabad - 500037",
        bankDetails: { accountNumber: "30192837465", bankName: "State Bank of India", ifscCode: "SBIN0003254" },
        categories: ["Medicines"],
        leadTime: 3,
        serviceAreas: ["Mumbai", "Bangalore", "Delhi"],
        status: "ACTIVE"
    }
];

const INITIAL_REQUISITIONS = [
    {
        prNumber: "PR-10001",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        requestedBy: "Dinesh G.K",
        requestDate: "2026-06-16T10:00:00Z",
        priority: "High",
        requiredDate: "2026-06-19T00:00:00Z",
        remarks: "Stock replenishment due to upcoming weekend sales spikes.",
        status: "Converted To PO",
        items: [
            {
                sku: "FRT-MNG-ORG-0001",
                productName: "Fresh Alphonso Mangoes",
                currentStock: 12,
                reorderPoint: 30,
                suggestedQty: 100,
                requestedQty: 100,
                uom: "1 kg"
            },
            {
                sku: "DRY-MLK-AMU-0002",
                productName: "Amul Taaza Toned Milk",
                currentStock: 45,
                reorderPoint: 80,
                suggestedQty: 250,
                requestedQty: 250,
                uom: "1 L"
            }
        ]
    },
    {
        prNumber: "PR-10002",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        requestedBy: "Amit Sharma",
        requestDate: "2026-06-17T14:30:00Z",
        priority: "Critical",
        requiredDate: "2026-06-18T18:00:00Z",
        remarks: "Urgent medicine and frozen items shortfalls.",
        status: "Approved",
        items: [
            {
                sku: "FZN-MCN-NES-0005",
                productName: "McCain French Fries",
                currentStock: 15,
                reorderPoint: 20,
                suggestedQty: 50,
                requestedQty: 50,
                uom: "450g"
            },
            {
                sku: "MED-PCM-500",
                productName: "Paracetamol 500mg Tablets",
                currentStock: 4,
                reorderPoint: 20,
                suggestedQty: 100,
                requestedQty: 100,
                uom: "Pack of 10"
            }
        ]
    },
    {
        prNumber: "PR-10003",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        requestedBy: "System",
        requestDate: "2026-06-18T06:00:00Z",
        priority: "Medium",
        requiredDate: "2026-06-22T00:00:00Z",
        remarks: "Auto-triggered replenishment requisition for low stock items.",
        status: "Submitted",
        items: [
            {
                sku: "PSC-DTL-CAD-0006",
                productName: "Dettol Liquid Handwash",
                currentStock: 0,
                reorderPoint: 25,
                suggestedQty: 120,
                requestedQty: 120,
                uom: "200ml Refill"
            }
        ]
    }
];

const INITIAL_PURCHASE_ORDERS = [
    {
        poNumber: "PO-20001",
        prNumber: "PR-10001",
        vendorCode: "VEN-001",
        vendorName: "Zepto-Direct Fresh Farms",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        orderDate: "2026-06-16T12:00:00Z",
        expectedDeliveryDate: "2026-06-17T18:00:00Z",
        paymentTerms: "Net 30",
        taxPercent: 5,
        freightCharges: 1500,
        subTotal: 29900, // 100 * 299
        taxAmount: 1495,
        totalCost: 32895,
        status: "Delivered",
        items: [
            {
                sku: "FRT-MNG-ORG-0001",
                productName: "Fresh Alphonso Mangoes",
                quantity: 100,
                receivedQty: 95,
                unitCost: 299,
                totalCost: 29900
            }
        ]
    },
    {
        poNumber: "PO-20002",
        prNumber: "PR-10001",
        vendorCode: "VEN-002",
        vendorName: "Mother Dairy Logistics",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        orderDate: "2026-06-16T12:30:00Z",
        expectedDeliveryDate: "2026-06-17T10:00:00Z",
        paymentTerms: "Net 15",
        taxPercent: 0,
        freightCharges: 500,
        subTotal: 13500, // 250 * 54
        taxAmount: 0,
        totalCost: 14000,
        status: "Sent To Vendor",
        items: [
            {
                sku: "DRY-MLK-AMU-0002",
                productName: "Amul Taaza Toned Milk",
                quantity: 250,
                receivedQty: 0,
                unitCost: 54,
                totalCost: 13500
            }
        ]
    },
    {
        poNumber: "PO-20003",
        prNumber: "PR-10002",
        vendorCode: "VEN-003",
        vendorName: "ColdChain Foods Inc.",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        orderDate: "2026-06-17T16:00:00Z",
        expectedDeliveryDate: "2026-06-19T10:00:00Z",
        paymentTerms: "Net 30",
        taxPercent: 12,
        freightCharges: 1000,
        subTotal: 6250, // 50 * 125
        taxAmount: 750,
        totalCost: 8000,
        status: "Approved",
        items: [
            {
                sku: "FZN-MCN-NES-0005",
                productName: "McCain French Fries",
                quantity: 50,
                receivedQty: 0,
                unitCost: 125,
                totalCost: 6250
            }
        ]
    }
];

const INITIAL_INBOUND_DELIVERIES = [
    {
        shipmentNumber: "IBD-30001",
        poNumber: "PO-20001",
        vendorCode: "VEN-001",
        vendorName: "Zepto-Direct Fresh Farms",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        vehicleNumber: "MH-12-SF-8890",
        driverName: "Ram Singh",
        driverPhone: "9000100020",
        eta: "2026-06-17T16:00:00Z",
        status: "Verified",
        items: [
            {
                sku: "FRT-MNG-ORG-0001",
                productName: "Fresh Alphonso Mangoes",
                expectedQty: 100
            }
        ]
    },
    {
        shipmentNumber: "IBD-30002",
        poNumber: "PO-20002",
        vendorCode: "VEN-002",
        vendorName: "Mother Dairy Logistics",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        vehicleNumber: "DL-01-M-4423",
        driverName: "Kuldeep Yadav",
        driverPhone: "8111222333",
        eta: "2026-06-18T10:00:00Z",
        status: "In Transit",
        items: [
            {
                sku: "DRY-MLK-AMU-0002",
                productName: "Amul Taaza Toned Milk",
                expectedQty: 250
            }
        ]
    }
];

const INITIAL_PURCHASE_GRN = [
    {
        grnNumber: "PGRN-40001",
        poNumber: "PO-20001",
        shipmentNumber: "IBD-30001",
        vendorCode: "VEN-001",
        vendorName: "Zepto-Direct Fresh Farms",
        warehouseId: "DKH-001",
        warehouseName: "HAATZA Koramangala Hub",
        receivedDate: "2026-06-17T17:30:00Z",
        verifiedBy: "Dinesh G.K",
        invoiceNumber: "INV-990812",
        invoiceDate: "2026-06-17",
        items: [
            {
                sku: "FRT-MNG-ORG-0001",
                productName: "Fresh Alphonso Mangoes",
                expectedQty: 100,
                receivedQty: 95,
                shortQty: 3,
                damagedQty: 2,
                rejectedQty: 0,
                expiryDate: "2026-06-25",
                batchNumber: "BAT-MNG-009A",
                manufacturingDate: "2026-06-15",
                binAllocation: "BIN-A01",
                qcVerdict: "Pass",
                qcMetrics: {
                    ripenessIndex: "Fully Ripe",
                    weight: "95 kg",
                    qualityGrade: "Grade A"
                }
            }
        ]
    }
];

// --- Mock Medicine Product ---
const SEED_MEDICINE = {
    id: "PRD-107",
    name: "Paracetamol 500mg Tablets",
    sku: "MED-PCM-500",
    barcode: "8902512345678",
    category: "Medicines",
    subcategory: "General OTC",
    brand: "Apollo",
    mrp: 40,
    sellingPrice: 35,
    discount: 12.5,
    tax: 12,
    stock: 4,
    reorderLevel: 20,
    unit: "Pack of 10",
    status: "Published",
    image: "💊",
    description: "Analgesic and antipyretic tablets for fever and pain relief.",
    attributes: {
        batch: "PCM-2291",
        expiry: "2028-12-01",
        manufacturer: "GlaxoSmithKline",
        license: "DL-20-4491-A"
    }
};

// --- Seed database for Purchase Module ---
export const seedPurchaseDatabase = () => {
    // Inject Medicine product if missing
    const products = getProducts();
    if (!products.some(p => p.sku === "MED-PCM-500")) {
        products.push(SEED_MEDICINE);
        localStorage.setItem("haatza_products", JSON.stringify(products));
        
        // Also inject medicine inventory ledger entry
        const ledger = getInventory();
        if (!ledger.some(l => l.sku === "MED-PCM-500" && l.location === "HAATZA Koramangala Hub")) {
            ledger.push({
                location: "HAATZA Koramangala Hub",
                sku: "MED-PCM-500",
                productName: "Paracetamol 500mg Tablets",
                category: "Medicines",
                available: 4,
                allocated: 0,
                in_transit: 0,
                damaged: 0,
                rejected: 0,
                reorderPoint: 20,
                maxStock: 200,
                status: "Low Stock",
                lastUpdated: new Date().toISOString()
            });
            localStorage.setItem("haatza_inventory_ledger", JSON.stringify(ledger));
        }
    }

    if (!localStorage.getItem("haatza_vendors")) {
        localStorage.setItem("haatza_vendors", JSON.stringify(INITIAL_VENDORS));
    }
    if (!localStorage.getItem("haatza_purchase_requisitions")) {
        localStorage.setItem("haatza_purchase_requisitions", JSON.stringify(INITIAL_REQUISITIONS));
    }
    if (!localStorage.getItem("haatza_purchase_orders")) {
        localStorage.setItem("haatza_purchase_orders", JSON.stringify(INITIAL_PURCHASE_ORDERS));
    }
    if (!localStorage.getItem("haatza_inbound_deliveries")) {
        localStorage.setItem("haatza_inbound_deliveries", JSON.stringify(INITIAL_INBOUND_DELIVERIES));
    }
    if (!localStorage.getItem("haatza_purchase_grn")) {
        localStorage.setItem("haatza_purchase_grn", JSON.stringify(INITIAL_PURCHASE_GRN));
    }
};

// Seed immediately
seedPurchaseDatabase();

// --- Getters & Setters ---
export const getVendors = () => JSON.parse(localStorage.getItem("haatza_vendors") || "[]");
export const saveVendors = (list) => localStorage.setItem("haatza_vendors", JSON.stringify(list));

export const getRequisitions = () => JSON.parse(localStorage.getItem("haatza_purchase_requisitions") || "[]");
export const saveRequisitions = (list) => localStorage.setItem("haatza_purchase_requisitions", JSON.stringify(list));

export const getPurchaseOrders = () => JSON.parse(localStorage.getItem("haatza_purchase_orders") || "[]");
export const savePurchaseOrders = (list) => localStorage.setItem("haatza_purchase_orders", JSON.stringify(list));

export const getInboundDeliveries = () => JSON.parse(localStorage.getItem("haatza_inbound_deliveries") || "[]");
export const saveInboundDeliveries = (list) => localStorage.setItem("haatza_inbound_deliveries", JSON.stringify(list));

export const getPurchaseGRNs = () => JSON.parse(localStorage.getItem("haatza_purchase_grn") || "[]");
export const savePurchaseGRNs = (list) => localStorage.setItem("haatza_purchase_grn", JSON.stringify(list));

// Helper to resolve warehouse name aliases to standard seeded storage locations
export const resolveWarehouseName = (name) => {
    if (!name) return "HAATZA Central Warehouse";
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName === "central hub alpha" || lowercaseName.includes("central")) {
        return "HAATZA Central Warehouse";
    }
    if (lowercaseName.includes("koramangala")) {
        return "HAATZA Koramangala Hub";
    }
    
    const seededLocations = [
        "HAATZA Central Warehouse",
        "HAATZA Koramangala Hub",
        "HAATZA Powai Depot",
        "HAATZA Indiranagar Hub",
        "HAATZA GK-1 Warehouse",
        "HAATZA HSR Layout Depot"
    ];
    
    const match = seededLocations.find(loc => loc.toLowerCase() === lowercaseName || loc.toLowerCase().includes(lowercaseName));
    if (match) {
        return match;
    }
    
    return name;
};

// --- Business Logic Functions ---

// 1. Dashboard Metrics
export const getDashboardMetrics = (warehouseName) => {
    const prs = getRequisitions();
    const pos = getPurchaseOrders();
    const deliveries = getInboundDeliveries();
    const grns = getPurchaseGRNs();
    const ledger = getInventory();

    const resolvedName = resolveWarehouseName(warehouseName);
    const whLedger = resolvedName 
        ? ledger.filter(l => l.location === resolvedName) 
        : ledger;

    // Open Requisitions
    const openPRCount = prs.filter(p => ["Draft", "Submitted", "Approved"].includes(p.status)).length;
    // Pending Approvals
    const pendingApprovalPRCount = prs.filter(p => p.status === "Submitted").length;
    // Open POs
    const openPOCount = pos.filter(p => ["Approved", "Sent To Vendor", "Accepted", "Partially Delivered"].includes(p.status)).length;
    // Pending Deliveries
    const pendingDelCount = deliveries.filter(d => ["Created", "In Transit", "Arrived", "Unloaded"].includes(d.status)).length;
    // Pending GRNs
    const pendingGRNCount = pos.filter(p => ["Sent To Vendor", "Accepted", "Partially Delivered"].includes(p.status)).length;

    // Total Purchase Value (only Approved or Completed POs)
    const purchaseValue = pos
        .filter(p => p.status !== "Cancelled" && p.status !== "Draft")
        .reduce((sum, p) => sum + p.totalCost, 0);

    // Scorecard parameters computed dynamically
    let totalExpected = 0;
    let totalReceived = 0;
    grns.forEach(g => {
        g.items.forEach(itm => {
            totalExpected += itm.expectedQty;
            totalReceived += itm.receivedQty;
        });
    });
    const vendorFillRate = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 95;

    // Inventory Coverage Days (Average Daily Sales simulation)
    // Assume average daily sales of 15 units per product
    const totalStock = whLedger.reduce((sum, l) => sum + l.available, 0);
    const uniqueProducts = whLedger.length;
    const inventoryCoverageDays = uniqueProducts > 0 ? Math.round(totalStock / (uniqueProducts * 15)) : 8;

    // Stock levels
    const lowStockCount = whLedger.filter(l => l.status === "Low Stock").length;
    const criticalStockCount = whLedger.filter(l => l.available === 0 || l.status === "Out of Stock").length;

    return {
        openPRCount,
        pendingApprovalPRCount,
        openPOCount,
        pendingDelCount,
        pendingGRNCount,
        vendorFillRate,
        purchaseValue,
        inventoryCoverageDays,
        lowStockCount,
        criticalStockCount
    };
};

// 2. Auto Requisition Engine
export const autoTriggerPurchaseRequisition = (warehouseId, warehouseName, userName) => {
    const resolvedName = resolveWarehouseName(warehouseName);
    const ledger = getInventory().filter(l => l.location === resolvedName);
    const products = getProducts();
    const lowStockItems = ledger.filter(l => l.available <= l.reorderPoint);

    if (lowStockItems.length === 0) {
        return null;
    }

    const prItems = lowStockItems.map(item => {
        const prod = products.find(p => p.sku === item.sku) || {};
        const reorderLevel = item.reorderPoint || prod.reorderLevel || 20;
        const currentStock = item.available;
        
        // Suggested qty is calculated to reach 4x the reorder level to cover demand
        const suggestedQty = (reorderLevel * 4) - currentStock;
        
        return {
            sku: item.sku,
            productName: item.productName,
            currentStock,
            reorderPoint: reorderLevel,
            suggestedQty,
            requestedQty: suggestedQty,
            uom: prod.unit || "Units"
        };
    });

    const prs = getRequisitions();
    const nextPrNo = `PR-${10000 + prs.length + 1}`;
    
    const newPR = {
        prNumber: nextPrNo,
        warehouseId,
        warehouseName,
        requestedBy: userName || "System Auto",
        requestDate: new Date().toISOString(),
        priority: "High",
        requiredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        remarks: "Auto-generated PR due to stock drop below reorder thresholds.",
        status: "Submitted",
        items: prItems
    };

    prs.unshift(newPR);
    saveRequisitions(prs);

    addAuditLog(
        userName || "System Auto",
        "Auto PR Triggered",
        "Purchase Requisition",
        null,
        newPR,
        `Auto-created ${nextPrNo} with ${prItems.length} lines.`
    );

    return newPR;
};

// 3. Post GRN & Stock update
export const postPurchaseGRN = (grn, userName) => {
    const grns = getPurchaseGRNs();
    const pos = getPurchaseOrders();
    const deliveries = getInboundDeliveries();

    // Resolve warehouse name alias
    const resolvedName = resolveWarehouseName(grn.warehouseName);
    grn.warehouseName = resolvedName;

    // Prevent duplicate GRN posting
    if (grns.some(g => g.grnNumber === grn.grnNumber || (g.invoiceNumber && g.invoiceNumber === grn.invoiceNumber))) {
        throw new Error(`Duplicate entry blocked! A GRN with invoice ${grn.invoiceNumber} has already been posted.`);
    }

    // Update PO items received count
    const poIndex = pos.findIndex(p => p.poNumber === grn.poNumber);
    if (poIndex !== -1) {
        const po = pos[poIndex];
        let allCompleted = true;
        let anyCompleted = false;

        po.items.forEach(poItm => {
            const grnItm = grn.items.find(gi => gi.sku === poItm.sku);
            if (grnItm) {
                poItm.receivedQty = (poItm.receivedQty || 0) + grnItm.receivedQty;
            }
            if (poItm.receivedQty >= poItm.quantity) {
                anyCompleted = true;
            } else {
                allCompleted = false;
            }
        });

        po.status = allCompleted ? "Delivered" : anyCompleted ? "Partially Delivered" : "Accepted";
        pos[poIndex] = po;
        savePurchaseOrders(pos);
    }

    // Update Inbound Shipment status
    const delIndex = deliveries.findIndex(d => d.poNumber === grn.poNumber && d.shipmentNumber === grn.shipmentNumber);
    if (delIndex !== -1) {
        deliveries[delIndex].status = "Verified";
        saveInboundDeliveries(deliveries);
    }

    // Adjust physical stock in database ledger
    grn.items.forEach(item => {
        // Double-entry ledger updates:
        // 1. Add received quantity to Available stock
        adjustStock(grn.warehouseName, item.sku, "available", item.receivedQty, userName, `Vendor Inbound GRN - ${grn.grnNumber}`);
        // 2. If there are damaged items, log them in damaged bucket
        if (item.damagedQty > 0) {
            adjustStock(grn.warehouseName, item.sku, "damaged", item.damagedQty, userName, `Damaged stock verified from ${grn.grnNumber}`);
        }
        // 3. If there are QA rejected items, log them in rejected bucket
        if (item.rejectedQty > 0) {
            adjustStock(grn.warehouseName, item.sku, "rejected", item.rejectedQty, userName, `QA Rejected stock from ${grn.grnNumber}`);
        }
    });

    // Save GRN records
    grns.unshift(grn);
    savePurchaseGRNs(grns);

    addAuditLog(
        userName,
        "Post GRN",
        "Purchase GRN",
        null,
        grn,
        `Goods Receipt Note ${grn.grnNumber} posted for PO ${grn.poNumber}. Stock levels adjusted.`
    );
};

// 4. Calculate Vendor Scorecard metrics
export const getVendorScorecard = (vendorCode) => {
    const pos = getPurchaseOrders().filter(p => p.vendorCode === vendorCode);
    const grns = getPurchaseGRNs().filter(g => g.vendorCode === vendorCode);

    if (pos.length === 0) {
        return {
            fillRate: 100,
            onTimeDelivery: 100,
            rejectionRate: 0,
            damageRate: 0,
            avgLeadTime: 1,
            ranking: "A+"
        };
    }

    let totalOrdered = 0;
    let totalReceived = 0;
    let totalDamaged = 0;
    let totalRejected = 0;

    grns.forEach(g => {
        g.items.forEach(itm => {
            totalOrdered += itm.expectedQty;
            totalReceived += itm.receivedQty;
            totalDamaged += itm.damagedQty;
            totalRejected += itm.rejectedQty;
        });
    });

    // Fill Rate: items received vs items ordered
    const fillRate = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 98;
    // Rejection Rate: items QA rejected vs items received
    const rejectionRate = totalReceived > 0 ? Number(((totalRejected / totalReceived) * 100).toFixed(1)) : 0.5;
    // Damage Rate: items damaged vs items received
    const damageRate = totalReceived > 0 ? Number(((totalDamaged / totalReceived) * 100).toFixed(1)) : 0.8;

    // On-Time Delivery: count of GRNs created before PO Expected delivery date
    let onTimeCount = 0;
    grns.forEach(g => {
        const po = pos.find(p => p.poNumber === g.poNumber);
        if (po) {
            const expected = new Date(po.expectedDeliveryDate);
            const actual = new Date(g.receivedDate);
            if (actual <= expected) {
                onTimeCount++;
            }
        } else {
            onTimeCount++;
        }
    });
    const onTimeDelivery = grns.length > 0 ? Math.round((onTimeCount / grns.length) * 100) : 95;

    // Average Lead Time calculation (days)
    let totalLeadTime = 0;
    let leadTimeCount = 0;
    grns.forEach(g => {
        const po = pos.find(p => p.poNumber === g.poNumber);
        if (po) {
            const start = new Date(po.orderDate);
            const end = new Date(g.receivedDate);
            const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
            totalLeadTime += diffDays;
            leadTimeCount++;
        }
    });
    const avgLeadTime = leadTimeCount > 0 ? Number((totalLeadTime / leadTimeCount).toFixed(1)) : 1.2;

    // Scorecard grade assignment
    let ranking = "A+";
    if (fillRate < 80 || onTimeDelivery < 80) ranking = "C";
    else if (fillRate < 90 || onTimeDelivery < 90) ranking = "B";
    else if (fillRate < 95 || onTimeDelivery < 95) ranking = "A";

    return {
        fillRate,
        onTimeDelivery,
        rejectionRate,
        damageRate,
        avgLeadTime,
        ranking
    };
};
