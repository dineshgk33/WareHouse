// catalogData.js - Comprehensive Mock Data for HAATZA Quick-Commerce Catalog

export const MOCK_CATEGORIES = [
    { id: "CAT-001", name: "Fruits & Vegetables", productsCount: 142, displayOrder: 1, status: "Active", icon: "🍎" },
    { id: "CAT-002", name: "Dairy & Bread", productsCount: 98, displayOrder: 2, status: "Active", icon: "🥛" },
    { id: "CAT-003", name: "Munchies & Snacks", productsCount: 215, displayOrder: 3, status: "Active", icon: "🍿" },
    { id: "CAT-004", name: "Cold Drinks & Juices", productsCount: 120, displayOrder: 4, status: "Active", icon: "🥤" },
    { id: "CAT-005", name: "Instant & Frozen Food", productsCount: 85, displayOrder: 5, status: "Active", icon: "🍕" },
    { id: "CAT-006", name: "Personal Care", productsCount: 110, displayOrder: 6, status: "Active", icon: "🧴" },
    { id: "CAT-007", name: "Household Essentials", productsCount: 95, displayOrder: 7, status: "Active", icon: "🧹" },
    { id: "CAT-008", name: "Baby Care", productsCount: 45, displayOrder: 8, status: "Inactive", icon: "🍼" },
];

export const MOCK_BRANDS = [
    { id: "BRD-001", name: "Amul", productsCount: 42, status: "Active", logo: "🧀" },
    { id: "BRD-002", name: "Britannia", productsCount: 28, status: "Active", logo: "🍪" },
    { id: "BRD-003", name: "Coca-Cola", productsCount: 35, status: "Active", logo: "🥤" },
    { id: "BRD-004", name: "Surf Excel", productsCount: 15, status: "Active", logo: "🧼" },
    { id: "BRD-005", name: "Apple", productsCount: 12, status: "Active", logo: "🍎" },
    { id: "BRD-006", name: "Organic India", productsCount: 18, status: "Active", logo: "🌿" },
    { id: "BRD-007", name: "Nestle", productsCount: 54, status: "Active", logo: "🍫" },
    { id: "BRD-008", name: "Cadbury", productsCount: 30, status: "Inactive", logo: "🍬" }
];

export const MOCK_PRODUCTS = [
    {
        id: "PRD-101",
        name: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ALP",
        barcode: "8901020304051",
        category: "Fruits & Vegetables",
        subcategory: "Fresh Fruits",
        brand: "Organic India",
        mrp: 350,
        sellingPrice: 299,
        discount: 14.5,
        tax: 5,
        stock: 120,
        reorderLevel: 30,
        unit: "1 kg",
        weight: "1.0 kg",
        dimensions: "N/A",
        status: "Active",
        image: "🥭",
        description: "Naturally ripened premium sweet Alphonso Mangoes direct from Ratnagiri orchards."
    },
    {
        id: "PRD-102",
        name: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-TAZ",
        barcode: "8901262010014",
        category: "Dairy & Bread",
        subcategory: "Milk & Cream",
        brand: "Amul",
        mrp: 56,
        sellingPrice: 54,
        discount: 3.5,
        tax: 0,
        stock: 350,
        reorderLevel: 80,
        unit: "1 L",
        weight: "1.03 kg",
        dimensions: "10x10x18 cm",
        status: "Active",
        image: "🥛",
        description: "Homogenized toned milk, pasteurized for quality, rich in nutrition."
    },
    {
        id: "PRD-103",
        name: "Lay's Classic Salted Chips",
        sku: "SNK-LYS-CLT",
        barcode: "8902080302012",
        category: "Munchies & Snacks",
        subcategory: "Chips & Crisps",
        brand: "Britannia",
        mrp: 20,
        sellingPrice: 19,
        discount: 5.0,
        tax: 18,
        stock: 450,
        reorderLevel: 50,
        unit: "50g",
        weight: "50g",
        dimensions: "15x5x22 cm",
        status: "Active",
        image: "🍟",
        description: "Crispy and salted golden potato chips, the perfect snack partner."
    },
    {
        id: "PRD-104",
        name: "Coca-Cola Zero Sugar",
        sku: "DRK-COK-ZER",
        barcode: "8901764022203",
        category: "Cold Drinks & Juices",
        subcategory: "Soft Drinks",
        brand: "Coca-Cola",
        mrp: 40,
        sellingPrice: 35,
        discount: 12.5,
        tax: 28,
        stock: 280,
        reorderLevel: 40,
        unit: "300ml Can",
        weight: "320g",
        dimensions: "6x6x12 cm",
        status: "Active",
        image: "🥤",
        description: "Zero Sugar Coca-Cola soft drink can, best served chilled."
    },
    {
        id: "PRD-105",
        name: "McCain French Fries",
        sku: "FZN-MCN-FRS",
        barcode: "8901532109823",
        category: "Instant & Frozen Food",
        subcategory: "Frozen Veggies",
        brand: "Nestle",
        mrp: 140,
        sellingPrice: 125,
        discount: 10.7,
        tax: 12,
        stock: 15,
        reorderLevel: 20, // Low Stock!
        unit: "450g",
        weight: "450g",
        dimensions: "20x3x25 cm",
        status: "Active",
        image: "🍟",
        description: "Delicious crispy straight cut frozen potato fries."
    },
    {
        id: "PRD-106",
        name: "Dettol Liquid Handwash",
        sku: "PSC-DTL-HDW",
        barcode: "8901396349821",
        category: "Personal Care",
        subcategory: "Hand & Body Wash",
        brand: "Cadbury",
        mrp: 99,
        sellingPrice: 89,
        discount: 10.1,
        tax: 18,
        stock: 0,
        reorderLevel: 25, // Inactive / Out of stock!
        unit: "200ml Refill",
        weight: "220g",
        dimensions: "12x4x15 cm",
        status: "Inactive",
        image: "🧴",
        description: "Effective germ protection handwash refill pack."
    }
];

export const MOCK_ATTRIBUTES = [
    { id: "ATT-001", name: "Color", values: ["Red", "Green", "Blue", "Black", "White"], productsLinked: 45, status: "Active" },
    { id: "ATT-002", name: "Weight", values: ["50g", "100g", "250g", "500g", "1kg"], productsLinked: 112, status: "Active" },
    { id: "ATT-003", name: "Volume", values: ["100ml", "200ml", "500ml", "1L", "2L"], productsLinked: 84, status: "Active" },
    { id: "ATT-004", name: "Pack Size", values: ["Single Pack", "Pack of 2", "Pack of 4", "Family Pack"], productsLinked: 30, status: "Active" },
    { id: "ATT-005", name: "Flavor", values: ["Salted", "Masala", "Tomato", "Chocolate", "Strawberry"], productsLinked: 25, status: "Inactive" }
];

export const MOCK_VARIANTS = [
    { id: "VAR-101", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "500ml Pack", sku: "DRY-MLK-TZ5", barcode: "8901262010052", price: 28, stock: 150, status: "Active" },
    { id: "VAR-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "1L Carton", sku: "DRY-MLK-TAZ", barcode: "8901262010014", price: 54, stock: 350, status: "Active" },
    { id: "VAR-103", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "2L Bottle", sku: "DRY-MLK-TZ2", barcode: "8901262010021", price: 105, stock: 50, status: "Inactive" },
    { id: "VAR-104", productId: "PRD-103", productName: "Lay's Classic Salted Chips", variant: "30g Pack", sku: "SNK-LYS-C30", barcode: "8902080302010", price: 10, stock: 200, status: "Active" },
    { id: "VAR-105", productId: "PRD-103", productName: "Lay's Classic Salted Chips", variant: "50g Pack", sku: "SNK-LYS-CLT", barcode: "8902080302012", price: 19, stock: 450, status: "Active" }
];

export const MOCK_PRICING = [
    { id: "PRC-101", productId: "PRD-101", productName: "Fresh Alphonso Mangoes", mrp: 350, sellingPrice: 299, darkhousePrice: 285, discount: 51, validity: "2026-06-01 to 2026-06-15" },
    { id: "PRC-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", mrp: 56, sellingPrice: 54, darkhousePrice: 52, discount: 2, validity: "Permanent" },
    { id: "PRC-103", productId: "PRD-103", productName: "Lay's Classic Salted Chips", mrp: 20, sellingPrice: 19, darkhousePrice: 17.5, discount: 1, validity: "Permanent" },
    { id: "PRC-104", productId: "PRD-104", productName: "Coca-Cola Zero Sugar", mrp: 40, sellingPrice: 35, darkhousePrice: 32, discount: 5, validity: "2026-05-25 to 2026-06-05" },
    { id: "PRC-105", productId: "PRD-105", productName: "McCain French Fries", mrp: 140, sellingPrice: 125, darkhousePrice: 110, discount: 15, validity: "2026-06-01 to 2026-06-10" }
];

export const MOCK_MAPPING = [
    { id: "MAP-101", productId: "PRD-101", productName: "Fresh Alphonso Mangoes", sku: "FRT-MNG-ALP", mappedDarkhouses: ["Koramangala Hub", "Indiranagar Hub", "HSR Layout Depot"], availableStock: 120, status: "Active" },
    { id: "MAP-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", sku: "DRY-MLK-TAZ", mappedDarkhouses: ["Koramangala Hub", "Indiranagar Hub", "HSR Layout Depot", "Powai Depot", "GK-1 Warehouse"], availableStock: 350, status: "Active" },
    { id: "MAP-103", productId: "PRD-103", productName: "Lay's Classic Salted Chips", sku: "SNK-LYS-CLT", mappedDarkhouses: ["Koramangala Hub", "Indiranagar Hub", "Powai Depot"], availableStock: 450, status: "Active" },
    { id: "MAP-104", productId: "PRD-105", productName: "McCain French Fries", sku: "FZN-MCN-FRS", mappedDarkhouses: ["Koramangala Hub", "GK-1 Warehouse"], availableStock: 15, status: "Active" },
    { id: "MAP-105", productId: "PRD-106", productName: "Dettol Liquid Handwash", sku: "PSC-DTL-HDW", mappedDarkhouses: [], availableStock: 0, status: "Inactive" }
];

export const MOCK_MEDIA = [
    { id: "MED-001", type: "Front", url: "🥭", name: "mango_front.png", product: "Fresh Alphonso Mangoes", size: "124 KB" },
    { id: "MED-002", type: "Side", url: "🥭", name: "mango_side.png", product: "Fresh Alphonso Mangoes", size: "98 KB" },
    { id: "MED-003", type: "Gallery", url: "🥛", name: "milk_pack_3d.png", product: "Amul Taaza Toned Milk", size: "256 KB" },
    { id: "MED-004", type: "Front", url: "🍿", name: "chips_front_brand.png", product: "Lay's Classic Salted Chips", size: "185 KB" },
    { id: "MED-005", type: "Side", url: "🥤", name: "can_side_view.png", product: "Coca-Cola Zero Sugar", size: "85 KB" },
    { id: "MED-006", type: "Gallery", url: "🍟", name: "fries_baked_plate.jpg", product: "McCain French Fries", size: "320 KB" }
];

export const MOCK_AUDITS = [
    { id: "AUD-001", action: "Product Created", productName: "Fresh Alphonso Mangoes", oldValue: "N/A", newValue: "Status: Active, Price: ₹299", updatedBy: "Dinesh G.K", timestamp: "01 Jun 2026, 10:15 AM" },
    { id: "AUD-002", action: "Stock Mapped", productName: "Amul Taaza Toned Milk", oldValue: "3 Darkhouses", newValue: "5 Darkhouses", updatedBy: "Amit Sharma", timestamp: "01 Jun 2026, 11:30 AM" },
    { id: "AUD-003", action: "Price Modified", productName: "Lay's Classic Salted Chips", oldValue: "MRP ₹20, Sell ₹20", newValue: "MRP ₹20, Sell ₹19", updatedBy: "Dinesh G.K", timestamp: "31 May 2026, 04:45 PM" },
    { id: "AUD-004", action: "Deactivated Hub", productName: "Dettol Liquid Handwash", oldValue: "Status: Active", newValue: "Status: Inactive (Stock Out)", updatedBy: "Priya Rao", timestamp: "30 May 2026, 09:00 AM" },
    { id: "AUD-005", action: "Variant Added", productName: "Amul Taaza Toned Milk", oldValue: "2 Variants", newValue: "3 Variants", updatedBy: "Dinesh G.K", timestamp: "29 May 2026, 02:15 PM" }
];
