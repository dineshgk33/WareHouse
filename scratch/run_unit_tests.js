// run_unit_tests.js - Automated unit tests for HAATZA Purchase Management Service
import assert from 'assert';

// 1. Mock LocalStorage globally before importing any services
const storage = new Map();
global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
};

// 2. Dynamically import services to ensure localStorage mock is in place during execution
const { 
    resolveWarehouseName, 
    getDashboardMetrics,
    autoTriggerPurchaseRequisition,
    postPurchaseGRN,
    getVendorScorecard,
    seedPurchaseDatabase
} = await import('../src/services/purchaseService.js');

const { getInventory } = await import('../src/services/dbService.js');

// Color logging helpers
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;

console.log(blue("\n========================================================"));
console.log(blue("  HAATZA Purchase Management Module Unit Test Suite  "));
console.log(blue("========================================================\n"));

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`${green("✓ PASS")} : ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`${red("✗ FAIL")} : ${name}`);
        console.error(err);
    }
}

// Ensure database is seeded
seedPurchaseDatabase();

// --- Test Cases ---

// Test 1: Warehouse Name Resolution
runTest("Warehouse Name Resolution Alises", () => {
    assert.strictEqual(resolveWarehouseName("Central Hub Alpha"), "HAATZA Central Warehouse");
    assert.strictEqual(resolveWarehouseName("central"), "HAATZA Central Warehouse");
    assert.strictEqual(resolveWarehouseName("HAATZA Koramangala Hub"), "HAATZA Koramangala Hub");
    assert.strictEqual(resolveWarehouseName("koramangala"), "HAATZA Koramangala Hub");
    assert.strictEqual(resolveWarehouseName(null), "HAATZA Central Warehouse");
    assert.strictEqual(resolveWarehouseName(undefined), "HAATZA Central Warehouse");
});

// Test 2: Auto Replenish Requisition Trigger
runTest("Auto Replenish Requisition Trigger", () => {
    // Let's modify the inventory in localStorage to have low stock for some items
    const ledger = getInventory();
    
    // Set a product's available stock to below its reorder point in Central Warehouse
    const testSku = "FRT-MNG-ALP";
    const resolvedCentral = resolveWarehouseName("Central Hub Alpha");
    const testItem = ledger.find(l => l.location === resolvedCentral && l.sku === testSku);
    
    if (testItem) {
        testItem.available = 2; // below reorder point (30)
        testItem.status = "Low Stock";
        localStorage.setItem("haatza_inventory_ledger", JSON.stringify(ledger));
    }

    // Trigger auto requisition
    const pr = autoTriggerPurchaseRequisition("DKH-001", "Central Hub Alpha", "Test Runner User");
    
    assert.ok(pr, "PR should be created when low stock items are present");
    assert.strictEqual(pr.status, "Submitted", "Auto-created PR status should be Submitted");
    assert.ok(pr.items.length > 0, "PR should contain items");
    
    const prItem = pr.items.find(i => i.sku === testSku);
    assert.ok(prItem, "Auto-created PR should include the low stock product");
    assert.ok(prItem.requestedQty > 0, "Requested quantity must be positive");
});

// Test 3: Dashboard Metrics Calculations
runTest("Dashboard Metrics Calculations", () => {
    const metrics = getDashboardMetrics("Central Hub Alpha");
    assert.ok(typeof metrics.openPRCount === 'number');
    assert.ok(typeof metrics.pendingApprovalPRCount === 'number');
    assert.ok(typeof metrics.openPOCount === 'number');
    assert.ok(typeof metrics.vendorFillRate === 'number');
    assert.ok(typeof metrics.purchaseValue === 'number');
    assert.ok(typeof metrics.lowStockCount === 'number');
});

// Test 4: Goods Receipt Note (GRN) posting and Stock Updates
runTest("Goods Receipt Note Posting and Stock ledger increments", () => {
    const ledgerBefore = getInventory();
    const testSku = "DRY-MLK-TAZ";
    const resolvedCentral = resolveWarehouseName("Central Hub Alpha");
    const stockBefore = ledgerBefore.find(l => l.location === resolvedCentral && l.sku === testSku)?.available || 0;

    const dummyGRN = {
        grnNumber: "PGRN-TEST-101",
        poNumber: "PO-20002",
        shipmentNumber: "IBD-30002",
        vendorCode: "VEN-002",
        vendorName: "Mother Dairy Logistics",
        warehouseId: "DKH-001",
        warehouseName: "Central Hub Alpha", // Should be resolved inside postPurchaseGRN
        receivedDate: new Date().toISOString(),
        verifiedBy: "Test QA Manager",
        invoiceNumber: "INV-TEST-12345",
        invoiceDate: "2026-06-18",
        items: [
            {
                sku: testSku,
                productName: "Amul Taaza Toned Milk",
                expectedQty: 50,
                receivedQty: 50,
                shortQty: 0,
                damagedQty: 0,
                rejectedQty: 0,
                expiryDate: "2026-07-20",
                batchNumber: "BAT-AMU-99",
                binAllocation: "BIN-C01",
                qcVerdict: "Pass",
                qcMetrics: {
                    tempCompliance: true,
                    tempReading: 3.5,
                    fssaiValidated: true
                }
            }
        ]
    };

    // Post GRN
    postPurchaseGRN(dummyGRN, "Test QA Manager");

    // Check if inventory has increased
    const ledgerAfter = getInventory();
    const stockAfter = ledgerAfter.find(l => l.location === resolvedCentral && l.sku === testSku)?.available || 0;
    
    assert.strictEqual(stockAfter, stockBefore + 50, "Stock available should increase by 50 units");

    // Test duplicate invoice block
    assert.throws(() => {
        postPurchaseGRN(dummyGRN, "Test QA Manager");
    }, /Duplicate/i, "Posting the same GRN/invoice should throw a Duplicate exception");
});

// Test 5: Vendor scorecards and OTIF evaluation
runTest("Vendor Scorecard Calculation", () => {
    const score = getVendorScorecard("VEN-001");
    assert.ok(score.fillRate >= 0 && score.fillRate <= 100);
    assert.ok(score.onTimeDelivery >= 0 && score.onTimeDelivery <= 100);
    assert.ok(score.rejectionRate >= 0);
    assert.ok(score.damageRate >= 0);
    assert.ok(score.avgLeadTime > 0);
    assert.ok(["A+", "A", "B", "C"].includes(score.ranking));
});

console.log(blue("\n========================================================"));
console.log(`Test Execution Finished: ${passedTests}/${totalTests} tests passed.`);
console.log(blue("========================================================\n"));

if (passedTests === totalTests) {
    process.exit(0);
} else {
    process.exit(1);
}
