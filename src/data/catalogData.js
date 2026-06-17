// catalogData.js - Extended Enterprise PIM Database Mock Data for HAATZA

export const MOCK_CATEGORIES = [
    { id: "CAT-001", name: "Fruits & Vegetables", productsCount: 142, displayOrder: 1, status: "Active", icon: "🍎" },
    { id: "CAT-002", name: "Dairy & Bread", productsCount: 98, displayOrder: 2, status: "Active", icon: "🥛" },
    { id: "CAT-003", name: "Munchies & Snacks", productsCount: 215, displayOrder: 3, status: "Active", icon: "🍿" },
    { id: "CAT-004", name: "Cold Drinks & Juices", productsCount: 120, displayOrder: 4, status: "Active", icon: "🥤" },
    { id: "CAT-005", name: "Instant & Frozen Food", productsCount: 85, displayOrder: 5, status: "Active", icon: "🍕" },
    { id: "CAT-006", name: "Personal Care", productsCount: 110, displayOrder: 6, status: "Active", icon: "🧴" },
    { id: "CAT-007", name: "Electronics", productsCount: 12, displayOrder: 7, status: "Active", icon: "⚡" },
    { id: "CAT-008", name: "Fashion", productsCount: 45, displayOrder: 8, status: "Active", icon: "👕" },
];

export const MOCK_SUBCATEGORIES_MAP = {
    "Fruits & Vegetables": ["Fruits", "Vegetables"],
    "Dairy & Bread": ["Dairy", "Bread & Buns"],
    "Munchies & Snacks": ["Snacks", "Biscuits", "Chocolates"],
    "Cold Drinks & Juices": ["Beverages", "Energy Drinks", "Juices"],
    "Instant & Frozen Food": ["Ready to Eat", "Frozen Veggies", "Frozen Snacks"],
    "Personal Care": ["Personal Care", "Face Wash", "Shampoo"],
    "Electronics": ["Electronics", "Mobile Accessories", "Wearables"],
    "Fashion": ["Fashion", "Apparel", "Footwear"]
};

export const MOCK_BRANDS = [
    { id: "BRD-001", name: "Amul", productsCount: 42, status: "Active", logo: "🧀" },
    { id: "BRD-002", name: "Britannia", productsCount: 28, status: "Active", logo: "🍪" },
    { id: "BRD-003", name: "Coca-Cola", productsCount: 35, status: "Active", logo: "🥤" },
    { id: "BRD-004", name: "Surf Excel", productsCount: 15, status: "Active", logo: "🧼" },
    { id: "BRD-005", name: "Apple", productsCount: 12, status: "Active", logo: "🍎" },
    { id: "BRD-006", name: "Organic India", productsCount: 18, status: "Active", logo: "🌿" },
    { id: "BRD-007", name: "Nestle", productsCount: 54, status: "Active", logo: "🍫" },
    { id: "BRD-008", name: "Nike", productsCount: 30, status: "Active", logo: "👟" }
];

export const DYNAMIC_ATTRIBUTES_CONFIG = {
    "Fruits": [
        { code: "weight", name: "Weight", type: "text", required: true, placeholder: "e.g. 1 kg, 500g" },
        { code: "originCountry", name: "Origin Country", type: "text", required: true, placeholder: "e.g. India, USA" },
        { code: "farmSource", name: "Farm Source", type: "text", required: false, placeholder: "e.g. Ratnagiri Farms" },
        { code: "ripeness", name: "Ripeness State", type: "select", options: ["Raw", "Semi-Ripe", "Fully Ripe"], required: true },
        { code: "storageTemp", name: "Storage Temperature", type: "text", required: true, placeholder: "e.g. 4°C - 8°C" },
        { code: "shelfLife", name: "Shelf Life (Days)", type: "number", required: true, placeholder: "e.g. 5" },
        { code: "organic", name: "Organic Certified", type: "checkbox", required: false }
    ],
    "Vegetables": [
        { code: "weight", name: "Weight", type: "text", required: true, placeholder: "e.g. 500g" },
        { code: "originCountry", name: "Origin Country", type: "text", required: true, placeholder: "e.g. India" },
        { code: "organic", name: "Organic Certified", type: "checkbox", required: false },
        { code: "storageType", name: "Storage Type", type: "select", options: ["Ambient", "Refrigerated", "Dry & Dark"], required: true },
        { code: "harvestDate", name: "Harvest Date", type: "date", required: true }
    ],
    "Dairy": [
        { code: "mfgDate", name: "Manufacturing Date", type: "date", required: true },
        { code: "expiryDate", name: "Expiry Date", type: "date", required: true },
        { code: "storageTemp", name: "Storage Temperature", type: "text", required: true, placeholder: "e.g. 2°C - 4°C" },
        { code: "batchNumber", name: "Batch Number", type: "text", required: true, placeholder: "e.g. BAT-DY-99" },
        { code: "fssaiNumber", name: "FSSAI License Number", type: "text", required: true, placeholder: "14-digit number", pattern: "^[0-9]{14}$" },
        { code: "fatPercentage", name: "Fat Percentage (%)", type: "number", required: false, min: 0, max: 100 }
    ],
    "Beverages": [
        { code: "volume", name: "Volume", type: "text", required: true, placeholder: "e.g. 750ml, 1.5L" },
        { code: "containerType", name: "Container Type", type: "select", options: ["Can", "Glass Bottle", "PET Bottle", "Tetra Pack"], required: true },
        { code: "expiryDate", name: "Expiry Date", type: "date", required: true },
        { code: "storageConditions", name: "Storage Conditions", type: "text", required: false, placeholder: "e.g. Keep chilled, avoid sunlight" }
    ],
    "Snacks": [
        { code: "weight", name: "Weight", type: "text", required: true, placeholder: "e.g. 150g" },
        { code: "flavor", name: "Flavor", type: "text", required: true, placeholder: "e.g. Tangy Tomato, Salted" },
        { code: "expiryDate", name: "Expiry Date", type: "date", required: true },
        { code: "ingredients", name: "Ingredients", type: "textarea", required: false },
        { code: "allergenInfo", name: "Allergen Information", type: "text", required: false, placeholder: "e.g. Contains Gluten, Soy" }
    ],
    "Personal Care": [
        { code: "gender", name: "Gender Orientation", type: "select", options: ["Unisex", "Men", "Women", "Kids"], required: true },
        { code: "skinType", name: "Skin Type Suitability", type: "select", options: ["All Skin Types", "Dry", "Oily", "Sensitive", "Combination"], required: true },
        { code: "ingredients", name: "Ingredients", type: "textarea", required: false },
        { code: "usageInstructions", name: "Usage Instructions", type: "textarea", required: false },
        { code: "expiryDate", name: "Expiry Date", type: "date", required: true }
    ],
    "Electronics": [
        { code: "modelNumber", name: "Model Number", type: "text", required: true },
        { code: "warranty", name: "Warranty Period", type: "text", required: true, placeholder: "e.g. 1 Year Brand Warranty" },
        { code: "color", name: "Color", type: "text", required: true },
        { code: "hsn", name: "HSN Code", type: "text", required: true, placeholder: "8-digit HSN code" },
        { code: "gst", name: "GST Rate (%)", type: "number", required: true, placeholder: "e.g. 18" },
        { code: "countryOfOrigin", name: "Country of Origin", type: "text", required: true }
    ],
    "Fashion": [
        { code: "size", name: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"], required: true },
        { code: "color", name: "Color", type: "text", required: true },
        { code: "material", name: "Material Composition", type: "text", required: true, placeholder: "e.g. 100% Organic Cotton" },
        { code: "gender", name: "Gender Orientation", type: "select", options: ["Men", "Women", "Unisex", "Boys", "Girls"], required: true },
        { code: "washInstructions", name: "Wash Care Instructions", type: "textarea", required: false }
    ]
};

export const MOCK_PRODUCTS = [
    {
        id: "PRD-101",
        name: "Fresh Alphonso Mangoes",
        sku: "FRT-MNG-ORG-0001",
        barcode: "8901020304051",
        category: "Fruits & Vegetables",
        subcategory: "Fruits",
        brand: "Organic India",
        mrp: 350,
        sellingPrice: 299,
        discount: 14.5,
        tax: 5,
        stock: 120,
        reorderLevel: 30,
        unit: "1 kg",
        status: "Published",
        image: "🥭",
        description: "Naturally ripened premium sweet Alphonso Mangoes direct from Ratnagiri orchards.",
        attributes: {
            weight: "1 kg",
            originCountry: "India",
            farmSource: "Ratnagiri Farms",
            ripeness: "Fully Ripe",
            storageTemp: "4°C - 8°C",
            shelfLife: 7,
            organic: true
        }
    },
    {
        id: "PRD-102",
        name: "Amul Taaza Toned Milk",
        sku: "DRY-MLK-AMU-0002",
        barcode: "8901262010014",
        category: "Dairy & Bread",
        subcategory: "Dairy",
        brand: "Amul",
        mrp: 56,
        sellingPrice: 54,
        discount: 3.5,
        tax: 0,
        stock: 350,
        reorderLevel: 80,
        unit: "1 L",
        status: "Published",
        image: "🥛",
        description: "Homogenized toned milk, pasteurized for quality, rich in nutrition.",
        attributes: {
            mfgDate: "2026-06-15",
            expiryDate: "2026-06-20",
            storageTemp: "2°C - 4°C",
            batchNumber: "AMU-MLK-01",
            fssaiNumber: "12345678901234",
            fatPercentage: 3.0
        }
    },
    {
        id: "PRD-103",
        name: "Lay's Classic Salted Chips",
        sku: "SNK-LYS-BRI-0003",
        barcode: "8902080302012",
        category: "Munchies & Snacks",
        subcategory: "Snacks",
        brand: "Britannia",
        mrp: 20,
        sellingPrice: 19,
        discount: 5.0,
        tax: 18,
        stock: 450,
        reorderLevel: 50,
        unit: "50g",
        status: "Published",
        image: "🍿",
        description: "Crispy and salted golden potato chips, the perfect snack partner.",
        attributes: {
            weight: "50g",
            flavor: "Classic Salted",
            expiryDate: "2026-12-15",
            ingredients: "Potatoes, Edible Vegetable Oil, Salt",
            allergenInfo: "Contains no allergens"
        }
    },
    {
        id: "PRD-104",
        name: "Coca-Cola Zero Sugar",
        sku: "DRK-COK-COC-0004",
        barcode: "8901764022203",
        category: "Cold Drinks & Juices",
        subcategory: "Beverages",
        brand: "Coca-Cola",
        mrp: 40,
        sellingPrice: 35,
        discount: 12.5,
        tax: 28,
        stock: 280,
        reorderLevel: 40,
        unit: "300ml Can",
        status: "Pending Review",
        image: "🥤",
        description: "Zero Sugar Coca-Cola soft drink can, best served chilled.",
        attributes: {
            volume: "300ml",
            containerType: "Can",
            expiryDate: "2026-09-30",
            storageConditions: "Store in cool & dry place, keep away from direct sunlight"
        }
    },
    {
        id: "PRD-105",
        name: "McCain French Fries",
        sku: "FZN-MCN-NES-0005",
        barcode: "8901532109823",
        category: "Instant & Frozen Food",
        subcategory: "Frozen Veggies",
        brand: "Nestle",
        mrp: 140,
        sellingPrice: 125,
        discount: 10.7,
        tax: 12,
        stock: 15,
        reorderLevel: 20,
        unit: "450g",
        status: "Draft",
        image: "🍟",
        description: "Delicious crispy straight cut frozen potato fries.",
        attributes: {
            weight: "450g",
            organic: false,
            storageType: "Refrigerated",
            harvestDate: "2026-05-10"
        }
    },
    {
        id: "PRD-106",
        name: "Dettol Liquid Handwash",
        sku: "PSC-DTL-CAD-0006",
        barcode: "8901396349821",
        category: "Personal Care",
        subcategory: "Personal Care",
        brand: "Cadbury",
        mrp: 99,
        sellingPrice: 89,
        discount: 10.1,
        tax: 18,
        stock: 0,
        reorderLevel: 25,
        unit: "200ml Refill",
        status: "Inactive",
        image: "🧴",
        description: "Effective germ protection handwash refill pack.",
        attributes: {
            gender: "Unisex",
            skinType: "All Skin Types",
            ingredients: "Active Germicides, Fragrance, Aqua",
            usageInstructions: "Apply on wet hands, rub to generate lather and wash off",
            expiryDate: "2028-06-15"
        }
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
    { id: "VAR-101", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "500ml Pack", sku: "DRY-MLK-AMU-0002-V1", barcode: "8901262010052", price: 28, stock: 150, status: "Active" },
    { id: "VAR-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "1L Carton", sku: "DRY-MLK-AMU-0002", barcode: "8901262010014", price: 54, stock: 350, status: "Active" },
    { id: "VAR-103", productId: "PRD-102", productName: "Amul Taaza Toned Milk", variant: "2L Bottle", sku: "DRY-MLK-AMU-0002-V3", barcode: "8901262010021", price: 105, stock: 50, status: "Inactive" }
];

export const MOCK_PRICING = [
    { id: "PRC-101", productId: "PRD-101", productName: "Fresh Alphonso Mangoes", mrp: 350, sellingPrice: 299, darkhousePrice: 285, discount: 51, validity: "2026-06-01 to 2026-06-15" },
    { id: "PRC-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", mrp: 56, sellingPrice: 54, darkhousePrice: 52, discount: 2, validity: "Permanent" },
    { id: "PRC-103", productId: "PRD-103", productName: "Lay's Classic Salted Chips", mrp: 20, sellingPrice: 19, darkhousePrice: 17.5, discount: 1, validity: "Permanent" },
    { id: "PRC-104", productId: "PRD-104", productName: "Coca-Cola Zero Sugar", mrp: 40, sellingPrice: 35, darkhousePrice: 32, discount: 5, validity: "2026-05-25 to 2026-06-05" },
    { id: "PRC-105", productId: "PRD-105", productName: "McCain French Fries", mrp: 140, sellingPrice: 125, darkhousePrice: 110, discount: 15, validity: "2026-06-01 to 2026-06-10" }
];

export const MOCK_MAPPING = [
    { id: "MAP-101", productId: "PRD-101", productName: "Fresh Alphonso Mangoes", sku: "FRT-MNG-ORG-0001", mappedDarkhouses: ["HAATZA Koramangala Hub", "HAATZA Indiranagar Hub", "HAATZA HSR Layout Depot"], availableStock: 120, status: "Active" },
    { id: "MAP-102", productId: "PRD-102", productName: "Amul Taaza Toned Milk", sku: "DRY-MLK-AMU-0002", mappedDarkhouses: ["HAATZA Koramangala Hub", "HAATZA Indiranagar Hub", "HAATZA HSR Layout Depot", "HAATZA Powai Depot", "HAATZA GK-1 Warehouse"], availableStock: 350, status: "Active" },
    { id: "MAP-103", productId: "PRD-103", productName: "Lay's Classic Salted Chips", sku: "SNK-LYS-BRI-0003", mappedDarkhouses: ["HAATZA Koramangala Hub", "HAATZA Indiranagar Hub", "HAATZA Powai Depot"], availableStock: 450, status: "Active" },
    { id: "MAP-104", productId: "PRD-105", productName: "McCain French Fries", sku: "FZN-MCN-NES-0005", mappedDarkhouses: ["HAATZA Koramangala Hub", "HAATZA GK-1 Warehouse"], availableStock: 15, status: "Active" },
    { id: "MAP-105", productId: "PRD-106", productName: "Dettol Liquid Handwash", sku: "PSC-DTL-CAD-0006", mappedDarkhouses: [], availableStock: 0, status: "Inactive" }
];

export const MOCK_MEDIA = [
    { id: "MED-001", type: "PRIMARY", url: "🥭", name: "mango_front.png", product: "Fresh Alphonso Mangoes", size: "124 KB" },
    { id: "MED-002", type: "SECONDARY", url: "🥭", name: "mango_side.png", product: "Fresh Alphonso Mangoes", size: "98 KB" },
    { id: "MED-003", type: "GALLERY", url: "🥛", name: "milk_pack_3d.png", product: "Amul Taaza Toned Milk", size: "256 KB" },
    { id: "MED-004", type: "PRIMARY", url: "🍿", name: "chips_front_brand.png", product: "Lay's Classic Salted Chips", size: "185 KB" },
    { id: "MED-005", type: "SECONDARY", url: "🥤", name: "can_side_view.png", product: "Coca-Cola Zero Sugar", size: "85 KB" },
    { id: "MED-006", type: "GALLERY", url: "🍟", name: "fries_baked_plate.jpg", product: "McCain French Fries", size: "320 KB" }
];

export const MOCK_AUDITS = [
    { id: "AUD-001", action: "Product Created", productName: "Fresh Alphonso Mangoes", oldValue: "N/A", newValue: "Status: Published, Price: ₹299", updatedBy: "Dinesh G.K", timestamp: "01 Jun 2026, 10:15 AM" },
    { id: "AUD-002", action: "Stock Mapped", productName: "Amul Taaza Toned Milk", oldValue: "3 Darkhouses", newValue: "5 Darkhouses", updatedBy: "Amit Sharma", timestamp: "01 Jun 2026, 11:30 AM" },
    { id: "AUD-003", action: "Price Modified", productName: "Lay's Classic Salted Chips", oldValue: "MRP ₹20, Sell ₹20", newValue: "MRP ₹20, Sell ₹19", updatedBy: "Dinesh G.K", timestamp: "31 May 2026, 04:45 PM" },
    { id: "AUD-004", action: "Deactivated Hub", productName: "Dettol Liquid Handwash", oldValue: "Status: Published", newValue: "Status: Inactive (Stock Out)", updatedBy: "Priya Rao", timestamp: "30 May 2026, 09:00 AM" },
    { id: "AUD-005", action: "Variant Added", productName: "Amul Taaza Toned Milk", oldValue: "2 Variants", newValue: "3 Variants", updatedBy: "Dinesh G.K", timestamp: "29 May 2026, 02:15 PM" }
];
