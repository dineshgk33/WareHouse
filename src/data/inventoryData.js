// inventoryData.js - Mock data for HAATZA Warehouse Stock, Darkhouse Stock, and Stock Transfers

export const MOCK_WAREHOUSE_STOCK = [
    {
        sku: "FRT-MNG-ALP",
        product: "Fresh Alphonso Mangoes",
        category: "Fruits & Vegetables",
        location: "Aisle 2 / Bin C-12",
        stock: 120,
        maxStock: 300,
        reorderPoint: 30,
        status: "In Stock",
        lastUpdated: "01 Jun 2026, 09:30 AM"
    },
    {
        sku: "DRY-MLK-TAZ",
        product: "Amul Taaza Toned Milk",
        category: "Dairy & Bread",
        location: "Cold Room 1 / Shelf A-03",
        stock: 350,
        maxStock: 500,
        reorderPoint: 80,
        status: "In Stock",
        lastUpdated: "01 Jun 2026, 11:15 AM"
    },
    {
        sku: "SNK-LYS-CLT",
        product: "Lay's Classic Salted Chips",
        category: "Munchies & Snacks",
        location: "Aisle 5 / Bin A-08",
        stock: 450,
        maxStock: 600,
        reorderPoint: 50,
        status: "In Stock",
        lastUpdated: "31 May 2026, 04:20 PM"
    },
    {
        sku: "DRK-COK-ZER",
        product: "Coca-Cola Zero Sugar",
        category: "Cold Drinks & Juices",
        location: "Cold Room 2 / Shelf B-05",
        stock: 280,
        maxStock: 400,
        reorderPoint: 40,
        status: "In Stock",
        lastUpdated: "01 Jun 2026, 08:45 AM"
    },
    {
        sku: "FZN-MCN-FRS",
        product: "McCain French Fries",
        category: "Instant & Frozen Food",
        location: "Deep Freezer 3 / Bay 02",
        stock: 15,
        maxStock: 150,
        reorderPoint: 20,
        status: "Low Stock",
        lastUpdated: "01 Jun 2026, 10:00 AM"
    },
    {
        sku: "PSC-DTL-HDW",
        product: "Dettol Liquid Handwash",
        category: "Personal Care",
        location: "Aisle 8 / Shelf D-04",
        stock: 0,
        maxStock: 200,
        reorderPoint: 25,
        status: "Out of Stock",
        lastUpdated: "30 May 2026, 02:30 PM"
    },
    {
        sku: "HSE-SRF-EXC",
        product: "Surf Excel Easy Wash",
        category: "Household Essentials",
        location: "Aisle 9 / Bin F-11",
        stock: 180,
        maxStock: 250,
        reorderPoint: 35,
        status: "In Stock",
        lastUpdated: "01 Jun 2026, 11:45 AM"
    },
    {
        sku: "BBY-JHN-POW",
        product: "Johnson's Baby Powder",
        category: "Baby Care",
        location: "Aisle 7 / Shelf C-02",
        stock: 8,
        maxStock: 80,
        reorderPoint: 15,
        status: "Low Stock",
        lastUpdated: "31 May 2026, 01:10 PM"
    }
];

export const MOCK_DARKHOUSE_STOCK = [
    {
        id: "DHS-101",
        darkhouse: "HAATZA Koramangala Hub",
        product: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ALP",
        available: 45,
        reserved: 12,
        reorder: 15,
        status: "In Stock"
    },
    {
        id: "DHS-102",
        darkhouse: "HAATZA Koramangala Hub",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        available: 120,
        reserved: 24,
        reorder: 30,
        status: "In Stock"
    },
    {
        id: "DHS-103",
        darkhouse: "HAATZA Powai Depot",
        product: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ALP",
        available: 30,
        reserved: 8,
        reorder: 15,
        status: "In Stock"
    },
    {
        id: "DHS-104",
        darkhouse: "HAATZA Powai Depot",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        available: 8,
        reserved: 2,
        reorder: 20,
        status: "Low Stock"
    },
    {
        id: "DHS-105",
        darkhouse: "HAATZA Indiranagar Hub",
        product: "Lay's Classic Salted Chips",
        sku: "SNK-LYS-CLT",
        available: 180,
        reserved: 15,
        reorder: 25,
        status: "In Stock"
    },
    {
        id: "DHS-106",
        darkhouse: "HAATZA GK-1 Warehouse",
        product: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        available: 3,
        reserved: 1,
        reorder: 10,
        status: "Low Stock"
    },
    {
        id: "DHS-107",
        darkhouse: "HAATZA GK-1 Warehouse",
        product: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        available: 0,
        reserved: 0,
        reorder: 8,
        status: "Out of Stock"
    },
    {
        id: "DHS-108",
        darkhouse: "HAATZA HSR Layout Depot",
        product: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        available: 95,
        reserved: 18,
        reorder: 30,
        status: "In Stock"
    },
    {
        id: "DHS-109",
        darkhouse: "HAATZA HSR Layout Depot",
        product: "Coca-Cola Zero Sugar",
        sku: "DRK-COK-ZER",
        available: 72,
        reserved: 6,
        reorder: 15,
        status: "In Stock"
    }
];

export const MOCK_STOCK_TRANSFERS = [
    {
        id: "TRF-90201",
        source: "HAATZA Central Warehouse",
        destination: "HAATZA Koramangala Hub",
        productsCount: 12,
        createdDate: "01 Jun 2026, 11:20 AM",
        status: "Pending"
    },
    {
        id: "TRF-90202",
        source: "HAATZA Central Warehouse",
        destination: "HAATZA Powai Depot",
        productsCount: 8,
        createdDate: "01 Jun 2026, 08:10 AM",
        status: "Dispatched"
    },
    {
        id: "TRF-90203",
        source: "HAATZA Koramangala Hub",
        destination: "HAATZA Indiranagar Hub",
        productsCount: 5,
        createdDate: "31 May 2026, 03:45 PM",
        status: "Received"
    },
    {
        id: "TRF-90204",
        source: "HAATZA Central Warehouse",
        destination: "HAATZA GK-1 Warehouse",
        productsCount: 15,
        createdDate: "30 May 2026, 10:15 AM",
        status: "Received"
    },
    {
        id: "TRF-90205",
        source: "HAATZA HSR Layout Depot",
        destination: "HAATZA Koramangala Hub",
        productsCount: 6,
        createdDate: "29 May 2026, 04:30 PM",
        status: "Dispatched"
    }
];
