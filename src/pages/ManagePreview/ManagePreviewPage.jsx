import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    Eye,
    Upload,
    Trash2,
    RefreshCw,
    Check,
    AlertCircle,
    Move,
    Save,
    FileText,
    Sparkles,
    Smartphone,
    Maximize2,
    ChevronRight,
    Share2,
    Grid,
    Columns,
    ExternalLink,
    Lock,
    Unlock,
    Settings,
    AlertTriangle,
    ChevronLeft,
    Plus,
    X,
    Star,
    CheckCircle,
    Search,
    MoreVertical
} from "lucide-react";
import "./ManagePreviewPage.css";
import podiumCategoryItem from "../../assets/podium_category_item.png";
import haatzaLogo from "../../assets/logo.jpeg";
import liteLogo from "../../assets/lite.png";
import nestLogo from "../../assets/nest.png";
import SearchableSelect from "../../components/common/SearchableSelect";

// ─── WIDGET METADATA DATABASE ──────────────────────────────────────────────
const CATEGORIES = [
    { id: "home", label: "Home Page" },
    { id: "category", label: "Category Page" },
    { id: "listing", label: "Product Listing" },
    { id: "details", label: "Product Details" },
    { id: "promotions", label: "Promotions" }
];

const WIDGET_BY_CATEGORY = {
    home: ["Lite_Banner", "Lite_bannercarousel", "Lite_Shopbycategory", "freshmarketSection", "trendingSection", "productSection"],
    category: ["roomgrid", "Lite_Shopbycategory", "kidsSection", "matsSection"],
    listing: ["productSection", "perfumeSection"],
    details: ["productSection", "trendingSection"],
    promotions: ["Lite_Promobanner", "Lite_Banner"]
};

const WIDGET_METADATA = {
    Lite_Banner: {
        name: "Lite Banner",
        resolution: { width: 1200, height: 600, display: "1200 x 600 px" },
        maxSize: 2 * 1024 * 1024, // 2MB
        maxSizeDisplay: "2 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 1,
        defaultImages: [
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    Lite_Promobanner: {
        name: "Lite Promobanner",
        resolution: { width: 1080, height: 1080, display: "1080 x 1080 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 1,
        defaultImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1080&q=80"]
    },
    Lite_Shopbycategory: {
        name: "Lite Shopbycategory",
        resolution: { width: 300, height: 300, display: "300 x 300 px" },
        maxSize: 500 * 1024, // 500KB
        maxSizeDisplay: "500 KB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 8,
        defaultImages: [
            "/beauty/bath_oral.png",
            "/beauty/hair_care.png",
            "/beauty/cosmetics.png",
            "/beauty/mens_grooming.png",
            "/beauty/feminine_hygiene.png",
            "/beauty/sexual_wellness.png",
            "/beauty/health_pharmacy.png",
            "/beauty/baby_care.png"
        ],
        labels: [
            "Bath & oral care",
            "Hair care",
            "Beauty & cosmetics",
            "Men's grooming",
            "Feminine hygiene",
            "Sexual wellness",
            "Health & pharmacy",
            "Baby care"
        ]
    },
    Lite_bannercarousel: {
        name: "Lite bannercarousel",
        resolution: { width: 1200, height: 600, display: "1200 x 600 px" },
        maxSize: 2 * 1024 * 1024, // 2MB
        maxSizeDisplay: "2 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    freshmarketSection: {
        name: "Fresh Market Section",
        resolution: { width: 400, height: 400, display: "400 x 400 px" },
        maxSize: 1 * 1024 * 1024, // 1MB
        maxSizeDisplay: "1 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 4,
        defaultImages: [
            "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1568651341771-4217316bc8d8?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80"
        ],
        labels: ["Fresh Apples", "Organic Oranges", "Whole Milk", "Red Tomatoes"],
        prices: ["₹120", "₹95", "₹60", "₹40"]
    },
    matsSection: {
        name: "Mats & Rugs Section",
        resolution: { width: 500, height: 500, display: "500 x 500 px" },
        maxSize: 1 * 1024 * 1024, // 1MB
        maxSizeDisplay: "1 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=500&q=80"
        ],
        labels: ["Floor Mat Yaris Brown & Beige", "Floor Mat Glanza Brown", "Floor Mat Monaco Red"],
        prices: ["₹69", "₹69", "₹69"],
        oldPrices: ["₹199", "₹199", "₹199"],
        discounts: ["65% OFF", "65% OFF", "65% OFF"],
        brands: ["ELEGANT WEAVERS", "ELEGANT WEAVERS", "ELEGANT WEAVERS"],
        quantities: ["1 pc", "1 pc", "1 pc"],
        deliveries: ["8 mins", "8 mins", "8 mins"]
    },
    roomgrid: {
        name: "Room Grid Category",
        resolution: { width: 300, height: 300, display: "300 x 300 px" },
        maxSize: 500 * 1024, // 500KB
        maxSizeDisplay: "500 KB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 4,
        defaultImages: [
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80"
        ],
        labels: ["Living Room", "Bedroom", "Kitchen", "Bathroom"]
    },
    trendingSection: {
        name: "Trending Section",
        resolution: { width: 500, height: 500, display: "500 x 500 px" },
        maxSize: 1 * 1024 * 1024, // 1MB
        maxSizeDisplay: "1 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 5,
        defaultImages: [
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80"
        ],
        labels: ["Sattu & desi coolers", "Vegan specials", "Ice creams & yoghurts", "Sattu & desi coolers", "Vegan specials"],
        prices: ["₹2,499", "₹4,999", "₹8,999", "₹1,599", "₹1,899"],
        ratings: [4.5, 4.2, 4.8, 4.6, 4.6],
        discounts: ["STARTING @ ₹31", "UP TO 20% OFF", "UP TO 40% OFF", "STARTING @ ₹31", "UP TO 20% OFF"]
    },
    productSection: {
        name: "Product Section",
        resolution: { width: 500, height: 700, display: "500 x 700 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=500&q=80"
        ],
        labels: ["Groundnut Oil", "Sesame Oil", "Til Oil"],
        prices: ["₹1,619", "₹299", "₹519"],
        ratings: [4.5, 4.5, 4.5],
        oldPrices: ["₹1,900", "₹340", "₹619"],
        discounts: ["₹281 OFF", "12% OFF", "₹100 OFF"],
        quantities: ["5 ltr", "500 ml", "1 ltr"],
        deliveries: ["12 mins", "12 mins", "12 mins"],
        unitPrices: ["₹32.4/100 ml", "₹32.4/100 ml", "₹32.4/100 ml"]
    },
    perfumeSection: {
        name: "Perfume Section",
        resolution: { width: 600, height: 800, display: "600 x 800 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
        ],
        labels: ["Ajmal Blu Moon Attar (Blu Moon)", "Jaguar Eau de Toilette (Classic)", "Tommy Girl Perfume"],
        prices: ["₹449", "₹3,199", "₹8,939"],
        ratings: [4.5, 4.5, 4.5],
        oldPrices: ["₹800", "₹4,900", "₹9,900"],
        discounts: ["10% OFF on MRP", "₹1,701 OFF", "₹961 OFF"],
        quantities: ["5 ml", "100 ml", "100 ml"],
        deliveries: ["15 mins", "15 mins", "15 mins"],
        tag1: ["Fresh", "Fresh", "Floral"],
        tag2: [null, "Lasts up to 10 hours", "Lasts up to 36 hours"]
    },
    kidsSection: {
        name: "Kids Section",
        resolution: { width: 800, height: 800, display: "800 x 800 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=400&q=80"
        ],
        labels: ["0-3 Years", "3-10 Years", "10 Years & Above"],
        prices: ["₹999", "₹1,499", "₹1,200"],
        ratings: [4.6, 4.7, 4.5]
    }
};

const formatSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const MOCK_CATEGORIES = [
    { categoryId: "cat_elect", categoryName: "Electronics" },
    { categoryId: "cat_groc", categoryName: "Grocery" },
    { categoryId: "cat_pers", categoryName: "Personal Care" },
    { categoryId: "cat_fash", categoryName: "Fashion" },
    { categoryId: "cat_home", categoryName: "Home & Kitchen" },
    { categoryId: "cat_books", categoryName: "Books" },
    { categoryId: "cat_toys", categoryName: "Toys & Games" }
];

const MOCK_PRODUCTS = [
    {
        productId: "PROD_IPH15",
        productName: "iPhone 15 Pro",
        price: "₹79,999",
        discount: "10% Off",
        mainCategoryId: "cat_elect",
        subCategoryId: "sub_mobiles",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-IPH15-PRO"
    },
    {
        productId: "PROD_MACB",
        productName: "MacBook Air M3",
        price: "$1199",
        discount: "10% Off",
        mainCategoryId: "cat_elect",
        subCategoryId: "sub_laptops",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-MACB-AIR-M3"
    },
    {
        productId: "PROD_HEADP",
        productName: "Sony Noise Cancelling Headphones",
        price: "$349",
        discount: "15% Off",
        mainCategoryId: "cat_elect",
        subCategoryId: "sub_audio",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-SONY-NC-HD"
    },
    {
        productId: "PROD_ORG_ORANGE",
        productName: "Organic Oranges (1kg)",
        price: "$4.99",
        discount: "No Discount",
        mainCategoryId: "cat_groc",
        subCategoryId: "sub_fruits",
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-ORG-ORANGE-1K"
    },
    {
        productId: "PROD_ALM_MILK",
        productName: "Almond Milk (Unsweetened)",
        price: "$3.49",
        discount: "8% Off",
        mainCategoryId: "cat_groc",
        subCategoryId: "sub_dairy",
        image: "https://images.unsplash.com/photo-1568651341771-4217316bc8d8?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-ALM-MILK-UNS"
    },
    {
        productId: "PROD_CE_SERUM",
        productName: "Vitamin C Face Serum",
        price: "$18.99",
        discount: "20% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_skincare",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-VITC-FACE-SERUM"
    },
    {
        productId: "PROD_SHAMPOO",
        productName: "Herbal Hydrating Shampoo",
        price: "$12.50",
        discount: "12% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_haircare",
        image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-HERB-HYD-SHAMP"
    },
    {
        productId: "PROD_LTH_JACKET",
        productName: "Classic Leather Jacket",
        price: "$149.00",
        discount: "30% Off",
        mainCategoryId: "cat_fash",
        subCategoryId: "sub_outerwear",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-CLASS-LTH-JACK"
    },
    {
        productId: "PROD_AIR_FRYER",
        productName: "Digital Air Fryer 5.8QT",
        price: "$89.99",
        discount: "25% Off",
        mainCategoryId: "cat_home",
        subCategoryId: "sub_appliances",
        image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&w=300&q=80",
        sku: "SKU-DIG-AIR-FRY-58"
    },
    {
        productId: "PROD_COLGATE",
        productName: "Colgate MaxFresh Toothpaste (150g)",
        price: "₹95",
        discount: "5% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_bath_oral",
        image: "/beauty/bath_oral.png",
        sku: "SKU-COLGATE-150"
    },
    {
        productId: "PROD_DOVE_SOAP",
        productName: "Dove Cream Bathing Bar (3x125g)",
        price: "₹175",
        discount: "8% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_bath_oral",
        image: "/beauty/bath_oral.png",
        sku: "SKU-DOVE-SOAP-3"
    },
    {
        productId: "PROD_LOREAL_SHAMPOO",
        productName: "L'Oreal Paris Total Repair Shampoo (650ml)",
        price: "₹499",
        discount: "15% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_hair_care",
        image: "/beauty/hair_care.png",
        sku: "SKU-LOREAL-SH-650"
    },
    {
        productId: "PROD_STREAX_SERUM",
        productName: "Streax Hair Serum with Walnut Oil (100ml)",
        price: "₹210",
        discount: "10% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_hair_care",
        image: "/beauty/hair_care.png",
        sku: "SKU-STREAX-SERUM"
    },
    {
        productId: "PROD_MAYBELLINE_FOUNDATION",
        productName: "Maybelline Fit Me Matte Foundation",
        price: "₹549",
        discount: "12% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_cosmetics",
        image: "/beauty/cosmetics.png",
        sku: "SKU-MAYB-FOUND"
    },
    {
        productId: "PROD_LAKME_LIPSTICK",
        productName: "Lakme Absolute Matte Melt Liquid Lipstick",
        price: "₹399",
        discount: "10% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_cosmetics",
        image: "/beauty/cosmetics.png",
        sku: "SKU-LAKME-LIP"
    },
    {
        productId: "PROD_GILLETTE_FOAM",
        productName: "Gillette Classic Sensitive Shaving Foam (418g)",
        price: "₹225",
        discount: "5% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_mens_grooming",
        image: "/beauty/mens_grooming.png",
        sku: "SKU-GILL-FOAM"
    },
    {
        productId: "PROD_PHILIPS_TRIMMER",
        productName: "Philips Multi Grooming Trimmer Series 3000",
        price: "₹1,495",
        discount: "20% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_mens_grooming",
        image: "/beauty/mens_grooming.png",
        sku: "SKU-PHIL-TRIM-3000"
    },
    {
        productId: "PROD_WHISPER_PADS",
        productName: "Whisper Ultra Clean Sanitary Pads (XL 30 Count)",
        price: "₹299",
        discount: "10% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_feminine_hygiene",
        image: "/beauty/feminine_hygiene.png",
        sku: "SKU-WHISP-PADS-30"
    },
    {
        productId: "PROD_DUREX_GEL",
        productName: "Durex Play Stimulating Massage Gel (200ml)",
        price: "₹450",
        discount: "8% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_sexual_wellness",
        image: "/beauty/sexual_wellness.png",
        sku: "SKU-DUREX-GEL-200"
    },
    {
        productId: "PROD_REVITAL_H",
        productName: "Revital H Daily Health Supplement (30 Capsules)",
        price: "₹310",
        discount: "7% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_health_pharmacy",
        image: "/beauty/health_pharmacy.png",
        sku: "SKU-REVITAL-H-30"
    },
    {
        productId: "PROD_PAMPERS_DIAPERS",
        productName: "Pampers Active Baby Diapers (M 62 Count)",
        price: "₹799",
        discount: "15% Off",
        mainCategoryId: "cat_pers",
        subCategoryId: "sub_baby_care",
        image: "/beauty/baby_care.png",
        sku: "SKU-PAMPERS-M-62"
    }
];

const formatSubCategory = (subId) => {
    if (!subId) return "";
    const mappings = {
        sub_bath_oral: "Bath & Oral Care",
        sub_hair_care: "Hair Care",
        sub_cosmetics: "Beauty & Cosmetics",
        sub_mens_grooming: "Men's Grooming",
        sub_feminine_hygiene: "Feminine Hygiene",
        sub_sexual_wellness: "Sexual Wellness",
        sub_health_pharmacy: "Health & Pharmacy",
        sub_baby_care: "Baby Care"
    };
    if (mappings[subId]) return mappings[subId];
    return subId.replace("sub_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

function ManagePreviewPage() {
    // ─── Dropdown States ──────────────────────────────────────────────────
    const [selectedCat, setSelectedCat] = useState("home");
    const [selectedWidgetId, setSelectedWidgetId] = useState("Lite_bannercarousel");

    // Dynamic widget selection matching categories
    const widgetsList = useMemo(() => {
        return WIDGET_BY_CATEGORY[selectedCat] || [];
    }, [selectedCat]);

    const activeMeta = useMemo(() => {
        return WIDGET_METADATA[selectedWidgetId] || WIDGET_METADATA.Lite_bannercarousel;
    }, [selectedWidgetId]);

    // ─── Image Workspace States ───────────────────────────────────────────
    const [widgetImages, setWidgetImages] = useState([]);
    const [beforeImages, setBeforeImages] = useState([]); // Base comparison snapshot
    const [validationErrors, setValidationErrors] = useState({});
    
    // Custom CMS Asset Manager States
    const [imageMetadata, setImageMetadata] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState(["All"]);
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [jumpToSlotVal, setJumpToSlotVal] = useState("");
    const [hoveredSlotIndex, setHoveredSlotIndex] = useState(null);
    const [hoverMousePos, setHoverMousePos] = useState({ x: 0, y: 0 });
    const [recentUpdates, setRecentUpdates] = useState(new Set());
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Drag & Drop
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Modal / Alert UI States
    const [activePreviewSlotIndex, setActivePreviewSlotIndex] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState("success"); // success, error, info
    const [showPublishModal, setShowPublishModal] = useState(false);
    
    // Compare Mode (Side-by-Side)
    const [isCompareMode, setIsCompareMode] = useState(false);

    // Custom Drag-to-Scroll handler for desktop mouse scrolling in simulator
    const handleDragScroll = useCallback((e) => {
        const ele = e.currentTarget;
        const startX = e.pageX - ele.offsetLeft;
        const scrollLeft = ele.scrollLeft;
        let isDragging = false;
        
        const handleMouseMove = (moveEvent) => {
            const x = moveEvent.pageX - ele.offsetLeft;
            const walk = (x - startX) * 1.5;
            if (Math.abs(walk) > 5) {
                isDragging = true;
                ele.style.pointerEvents = 'none';
            }
            ele.scrollLeft = scrollLeft - walk;
        };
        
        const handleMouseUp = () => {
            setTimeout(() => {
                ele.style.pointerEvents = 'auto';
            }, 50);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    // ─── Lite_Banner Configuration States ────────────────────────
    const [liteBannerConfig, setLiteBannerConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_lite_banner_config");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {}
        return {
            imageUrl: "",
            redirectType: "CATEGORY",
            categoryId: "",
            categoryName: "",
            destProductId: "",
            destProductName: "",
            destPrice: "",
            destDiscount: "",
            destMainCategory: "",
            destSubCategory: ""
        };
    });
    const [liteBannerErrors, setLiteBannerErrors] = useState({});
    const [liteBannerExpandedSlot, setLiteBannerExpandedSlot] = useState(null);

    // ─── Fresh Market Section Configuration States ─────────────────────────
    const FRESHMARKET_SLOT_DEFAULT = (idx) => ({
        productName: WIDGET_METADATA.freshmarketSection?.labels[idx] || `Item ${idx + 1}`,
        productId: "",
        price: WIDGET_METADATA.freshmarketSection?.prices[idx] || "₹100",
        weight: "1 kg",
        badge: "Fresh",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [freshmarketConfig, setFreshmarketConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_freshmarket_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            title: "🥦 Fresh Market Deals",
            seeAllText: "See All",
            items: Array.from({ length: 4 }, (_, idx) => FRESHMARKET_SLOT_DEFAULT(idx))
        };
    });
    const [freshmarketErrors, setFreshmarketErrors] = useState({});
    const [freshmarketProductSearch, setFreshmarketProductSearch] = useState({});
    const [freshmarketExpandedSlot, setFreshmarketExpandedSlot] = useState(null);

    // ─── Mats & Rugs Section Configuration States ──────────────────────────
    const MATS_SLOT_DEFAULT = (idx) => ({
        productName: WIDGET_METADATA.matsSection?.labels[idx] || `Mat ${idx + 1}`,
        productId: "",
        price: WIDGET_METADATA.matsSection?.prices[idx] || "₹69",
        oldPrice: WIDGET_METADATA.matsSection?.oldPrices?.[idx] || "₹199",
        discount: WIDGET_METADATA.matsSection?.discounts?.[idx] || "65% OFF",
        brand: WIDGET_METADATA.matsSection?.brands?.[idx] || "ELEGANT WEAVERS",
        quantity: WIDGET_METADATA.matsSection?.quantities?.[idx] || "1 pc",
        delivery: WIDGET_METADATA.matsSection?.deliveries?.[idx] || "8 mins",
        offer: WIDGET_METADATA.matsSection?.discounts?.[idx] || "65% OFF",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [matsConfig, setMatsConfig] = useState(() => {
        let config = {
            title: "Mats & doormats starting @ Rs.49",
            subtitle: "Comfort for your feet",
            seeAllText: "View All",
            items: []
        };
        try {
            const saved = localStorage.getItem("haatza_mats_config");
            if (saved) {
                config = JSON.parse(saved);
            }
        } catch (e) {}
        
        if (!config.title) config.title = "Mats & doormats starting @ Rs.49";
        if (!config.subtitle) config.subtitle = "Comfort for your feet";
        if (!config.items) config.items = [];
        const requiredCount = WIDGET_METADATA.matsSection?.requiredCount || 3;
        while (config.items.length < requiredCount) {
            config.items.push(MATS_SLOT_DEFAULT(config.items.length));
        }
        config.items = config.items.slice(0, requiredCount).map((item, idx) => {
            const defaults = MATS_SLOT_DEFAULT(idx);
            return {
                ...defaults,
                ...item
            };
        });
        return config;
    });
    const [matsErrors, setMatsErrors] = useState({});
    const [matsProductSearch, setMatsProductSearch] = useState({});
    const [matsExpandedSlot, setMatsExpandedSlot] = useState(null);

    // ─── Room Grid Configuration States ────────────────────────────────────
    const ROOMGRID_SLOT_DEFAULT = (idx) => ({
        label: WIDGET_METADATA.roomgrid?.labels[idx] || `Room ${idx + 1}`,
        redirectType: "CATEGORY",
        categoryId: "",
        categoryName: "",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [roomgridConfig, setRoomgridConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_roomgrid_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return Array.from({ length: 4 }, (_, idx) => ROOMGRID_SLOT_DEFAULT(idx));
    });
    const [roomgridErrors, setRoomgridErrors] = useState({});
    const [roomgridProductSearch, setRoomgridProductSearch] = useState({});
    const [roomgridExpandedSlot, setRoomgridExpandedSlot] = useState(null);

    // ─── Lite Shopbycategory Configuration States ──────────────────────────────
    const LITE_SHOPBYCATEGORY_SLOT_DEFAULT = () => ({
        redirectType: "CATEGORY",
        categoryId: "",
        categoryName: "",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [liteShopbycategoryConfig, setLiteShopbycategoryConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_lite_shopbycategory_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return Array.from({ length: 8 }, LITE_SHOPBYCATEGORY_SLOT_DEFAULT);
    });
    const [liteShopbycategoryErrors, setLiteShopbyerrors] = useState({});
    const [liteShopbycategoryProductSearch, setLiteShopbycategoryProductSearch] = useState({});
    const [liteShopbycategoryExpandedSlot, setLiteShopbycategoryExpandedSlot] = useState(null);

    // ─── Lite Promobanner Configuration States ──────────────────────────────
    const [litePromobannerConfig, setLitePromobannerConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_lite_promobanner_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            title: "Super Saver Pack",
            description: "Stock up today with discount codes applied automatically at billing checkout.",
            ctaText: "Shop Now",
            redirectType: "CATEGORY",
            categoryId: "",
            categoryName: "",
            destProductId: "",
            destProductName: "",
            destPrice: "",
            destDiscount: "",
            destMainCategory: "",
            destSubCategory: ""
        };
    });
    const [litePromobannerErrors, setLitePromobannerErrors] = useState({});
    const [litePromobannerExpandedSlot, setLitePromobannerExpandedSlot] = useState(null);
    const [litePromobannerProductSearch, setLitePromobannerProductSearch] = useState("");

    // ─── Lite Shop by Category Configuration States ────────────────────────
    const SHOPBYCAT_SLOT_DEFAULT = (idx) => ({
        label: WIDGET_METADATA.roomgrid?.labels?.[idx] || `Category ${idx + 1}`,
        redirectType: "CATEGORY",
        categoryId: "",
        categoryName: "",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [shopbycategoryConfig, setShopbycategoryConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_shopbycategory_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return Array.from({ length: 8 }, (_, idx) => SHOPBYCAT_SLOT_DEFAULT(idx));
    });
    const [shopbycategoryErrors, setShopbycategoryErrors] = useState({});
    const [shopbycategoryProductSearch, setShopbycategoryProductSearch] = useState({});
    const [shopbycategoryExpandedSlot, setShopbycategoryExpandedSlot] = useState(null);

    // ─── Lite Lite bannercarousel Configuration States ──────────────────────────
    const LITE_BANNERCAROUSEL_SLOT_DEFAULT = (idx) => ({
        title: idx === 0 ? "Smart Summer Living" : idx === 1 ? "Premium Audio Deals" : "Classic Eyewear Spec",
        subtitle: idx === 0 ? "Upgrade your space with selected category discounts today." : idx === 1 ? "Experience sound in absolute detail with 15% off." : "Timeless designs curated for fashion lovers.",
        redirectType: "CATEGORY",
        categoryId: "",
        categoryName: "",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [liteBannercarouselConfig, setLiteBannercarouselConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_lite_bannercarousel_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return Array.from({ length: 3 }, (_, idx) => LITE_BANNERCAROUSEL_SLOT_DEFAULT(idx));
    });
    const [liteBannercarouselErrors, setLiteBannercarouselErrors] = useState({});
    const [liteBannercarouselProductSearch, setLiteBannercarouselProductSearch] = useState({});
    const [liteBannercarouselExpandedSlot, setLiteBannercarouselExpandedSlot] = useState(null);

    const TRENDING_SLOT_DEFAULT = (idx) => ({
        productName: WIDGET_METADATA.trendingSection.labels[idx] || `Product ${idx + 1}`,
        productId: "",
        price: WIDGET_METADATA.trendingSection.prices[idx] || "₹1,999",
        discount: "Hot",
        rating: String(WIDGET_METADATA.trendingSection.ratings[idx] || "4.5"),
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [trendingConfig, setTrendingConfig] = useState(() => {
        let config = {
            title: "🔥 Trending Products",
            seeAllText: "See All",
            items: []
        };
        try {
            const saved = localStorage.getItem("haatza_trending_config");
            if (saved) {
                config = JSON.parse(saved);
            }
        } catch (e) {}
        
        const requiredCount = WIDGET_METADATA.trendingSection?.requiredCount || 5;
        if (!config.items) config.items = [];
        while (config.items.length < requiredCount) {
            config.items.push(TRENDING_SLOT_DEFAULT(config.items.length));
        }
        config.items = config.items.slice(0, requiredCount);
        return config;
    });
    const [trendingErrors, setTrendingErrors] = useState({});
    const [trendingProductSearch, setTrendingProductSearch] = useState({});
    const [trendingExpandedSlot, setTrendingExpandedSlot] = useState(null);

    // ─── Product Section Configuration States ──────────────────────────────
    const PRODUCT_SLOT_DEFAULT = (idx) => ({
        productName: WIDGET_METADATA.productSection.labels[idx] || `Product ${idx + 1}`,
        productId: "",
        price: WIDGET_METADATA.productSection.prices[idx] || "₹1,299",
        oldPrice: "₹1,999",
        discount: "15% Off",
        quantity: idx === 1 ? "1 unit" : idx === 3 ? "1 pc" : "1 pair",
        rating: String(WIDGET_METADATA.productSection.ratings[idx] || "4.5"),
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [productConfig, setProductConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_product_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            brandTitle: "Tata Simply Better",
            seeAllText: "View 18 Items",
            items: Array.from({ length: 4 }, (_, idx) => PRODUCT_SLOT_DEFAULT(idx))
        };
    });
    const [productErrors, setProductErrors] = useState({});
    const [productProductSearch, setProductProductSearch] = useState({});
    const [productExpandedSlot, setProductExpandedSlot] = useState(null);

    // ─── Perfume Section Configuration States ──────────────────────────────
    const PERFUME_SLOT_DEFAULT = (idx) => ({
        productName: WIDGET_METADATA.perfumeSection.labels[idx] || `Perfume ${idx + 1}`,
        productId: "",
        price: WIDGET_METADATA.perfumeSection.prices[idx] || "₹12,000",
        offerTag: "Fresh",
        rating: String(WIDGET_METADATA.perfumeSection.ratings[idx] || "4.8"),
        deliveryTime: "10 mins",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [perfumeConfig, setPerfumeConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_perfume_config");
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            title: "Look good, smell great",
            subtitle: "Rare elixirs sourced for high society scent profiles",
            items: Array.from({ length: 3 }, (_, idx) => PERFUME_SLOT_DEFAULT(idx))
        };
    });
    const [perfumeErrors, setPerfumeErrors] = useState({});
    const [perfumeProductSearch, setPerfumeProductSearch] = useState({});
    const [perfumeExpandedSlot, setPerfumeExpandedSlot] = useState(null);

    // ─── Kids Section Configuration States ──────────────────────────────────
    const KIDS_SLOT_DEFAULT = (idx) => ({
        label: WIDGET_METADATA.kidsSection.labels[idx] || `Age Group ${idx + 1}`,
        redirectType: "CATEGORY",
        categoryId: "",
        categoryName: "",
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });

    const [kidsConfig, setKidsConfig] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_kids_config");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.items) {
                    parsed.items = parsed.items.slice(0, 3);
                    while (parsed.items.length < 3) {
                        parsed.items.push(KIDS_SLOT_DEFAULT(parsed.items.length));
                    }
                }
                return parsed;
            }
        } catch (e) {}
        return {
            title: "Smiles, Giggles, Party Time!",
            bgImage: "",
            items: Array.from({ length: 3 }, (_, idx) => KIDS_SLOT_DEFAULT(idx))
        };
    });

    const [kidsErrors, setKidsErrors] = useState({});
    const [kidsProductSearch, setKidsProductSearch] = useState({});
    const [kidsExpandedSlot, setKidsExpandedSlot] = useState(null);

    const [destProductSearchQuery, setDestProductSearchQuery] = useState("");
    const [categoriesList, setCategoriesList] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [productsMasterList, setProductsMasterList] = useState(() => {
        const saved = localStorage.getItem("haatza_mock_products");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing local mock products", e);
            }
        }
        return MOCK_PRODUCTS;
    });
    const [simulatorTab, setSimulatorTab] = useState("home");
    const [simSearchQuery, setSimSearchQuery] = useState("");
    const [selectedCategoryInSim, setSelectedCategoryInSim] = useState("cat_elect");
    const [selectedSubCategoryInSim, setSelectedSubCategoryInSim] = useState("");
    const [selectedProductInSim, setSelectedProductInSim] = useState(MOCK_PRODUCTS[0]);

    // Auto-switch simulator tab when CMS selectedCat changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedCat === "home") {
                setSimulatorTab("home");
            } else if (selectedCat === "category") {
                setSimulatorTab("category");
            } else if (selectedCat === "listing") {
                setSimulatorTab("listing");
            } else if (selectedCat === "details") {
                setSimulatorTab("details");
                const bannerProd = productsMasterList.find(p => p.productId === (liteBannerConfig?.destProductId || ""));
                if (bannerProd) {
                    setSelectedProductInSim(bannerProd);
                }
            } else if (selectedCat === "promotions") {
                setSimulatorTab("promotions");
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [selectedCat, liteBannerConfig, productsMasterList]);

    const phoneBodyRef = useRef(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 250);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Live Clock for Phone
    const [phoneTime, setPhoneTime] = useState("09:41");
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12
            setPhoneTime(`${hours}:${minutes} ${ampm}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Scroll active widget into view inside the phone screen
    useEffect(() => {
        const timer = setTimeout(() => {
            const activeEl = document.querySelector(".simulator-phone-screen .editing-highlight");
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [selectedWidgetId]);

    // Load presets or drafts on widget change
    useEffect(() => {
        const timer = setTimeout(() => {
            const draftKey = `haatza_draft_${selectedWidgetId}`;
            const savedDraft = localStorage.getItem(draftKey);
            const metadataKey = `haatza_draft_metadata_${selectedWidgetId}`;
            const savedMetadata = localStorage.getItem(metadataKey);
            
            let initialImages;
            if (savedDraft) {
                try {
                    initialImages = JSON.parse(savedDraft);
                } catch (e) {
                    initialImages = [...activeMeta.defaultImages];
                }
            } else {
                initialImages = [...activeMeta.defaultImages];
            }

            // Fill remaining slots up to requiredCount
            while (initialImages.length < activeMeta.requiredCount) {
                initialImages.push(null);
            }
            // Slice to correct length if exceeded
            initialImages = initialImages.slice(0, activeMeta.requiredCount);

            setWidgetImages(initialImages);
            setBeforeImages([...activeMeta.defaultImages]); // Baseline comparison is default image set
            setValidationErrors({});

            // Initialize Metadata
            let initialMeta = {};
            if (savedMetadata) {
                try {
                    initialMeta = JSON.parse(savedMetadata);
                } catch (e) {
                    initialMeta = {};
                }
            }

            const format = activeMeta.formats[0]?.split('/')[1]?.toUpperCase() || "JPG";
            const ext = format.toLowerCase();
            const finalMeta = {};

            for (let i = 0; i < activeMeta.requiredCount; i++) {
                const img = initialImages[i];
                if (initialMeta[i]) {
                    finalMeta[i] = initialMeta[i];
                    if (!img) {
                        finalMeta[i].status = "Missing";
                    }
                } else {
                    if (img) {
                        const bytes = Math.round(activeMeta.maxSize * 0.45 + (i * 123456) % (activeMeta.maxSize * 0.3));
                        finalMeta[i] = {
                            name: `${selectedWidgetId.toLowerCase()}-preset-${i + 1}.${ext}`,
                            size: formatSize(bytes),
                            uploadDate: "Jun 8, 2026",
                            status: "Published",
                            resolution: `${activeMeta.resolution.width} × ${activeMeta.resolution.height}`
                        };
                    } else {
                        finalMeta[i] = {
                            name: "Empty Slot",
                            size: "-",
                            uploadDate: "-",
                            status: "Missing",
                            resolution: `${activeMeta.resolution.width} × ${activeMeta.resolution.height}`
                        };
                    }
                }
            }
            setImageMetadata(finalMeta);
            setSelectedIndices([]);
            setSearchQuery("");
            setDebouncedSearchQuery("");
            setActiveFilters(["All"]);
            setRecentUpdates(new Set());

            if (selectedWidgetId === "Lite_Banner") {
                const saved = localStorage.getItem("haatza_lite_banner_config");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                            setLiteBannerConfig(parsed);
                        }
                    } catch (e) {}
                }
                setLiteBannerErrors({});
                setLiteBannerExpandedSlot(null);
            }

            if (selectedWidgetId === "Lite_Shopbycategory") {
                const saved = localStorage.getItem("haatza_lite_shopbycategory_config");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length === 8) {
                            setLiteShopbycategoryConfig(parsed);
                        }
                    } catch (e) {
                        console.error("Error parsing beauty category config", e);
                    }
                }
                setLiteShopbyerrors({});
                setLiteShopbycategoryProductSearch({});
                setLiteShopbycategoryExpandedSlot(null);
            }

            if (selectedWidgetId === "Lite_Promobanner") {
                const saved = localStorage.getItem("haatza_lite_promobanner_config");
                if (saved) {
                    try {
                        setLitePromobannerConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setLitePromobannerErrors({});
                setLitePromobannerProductSearch("");
                setLitePromobannerExpandedSlot(null);
            }

            if (selectedWidgetId === "roomgrid") {
                const saved = localStorage.getItem("haatza_roomgrid_config");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length === 4) {
                            setRoomgridConfig(parsed);
                        }
                    } catch (e) {}
                }
                setRoomgridErrors({});
                setRoomgridProductSearch({});
                setRoomgridExpandedSlot(null);
            }

            if (selectedWidgetId === "Lite_bannercarousel") {
                const saved = localStorage.getItem("haatza_lite_bannercarousel_config");
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length === 3) {
                            setLiteBannercarouselConfig(parsed);
                        }
                    } catch (e) {}
                }
                setLiteBannercarouselErrors({});
                setLiteBannercarouselProductSearch({});
                setLiteBannercarouselExpandedSlot(null);
            }

            if (selectedWidgetId === "freshmarketSection") {
                const saved = localStorage.getItem("haatza_freshmarket_config");
                if (saved) {
                    try {
                        setFreshmarketConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setFreshmarketErrors({});
                setFreshmarketProductSearch({});
                setFreshmarketExpandedSlot(null);
            }

            if (selectedWidgetId === "matsSection") {
                const saved = localStorage.getItem("haatza_mats_config");
                if (saved) {
                    try {
                        setMatsConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setMatsErrors({});
                setMatsProductSearch({});
                setMatsExpandedSlot(null);
            }

            if (selectedWidgetId === "trendingSection") {
                const saved = localStorage.getItem("haatza_trending_config");
                if (saved) {
                    try {
                        setTrendingConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setTrendingErrors({});
                setTrendingProductSearch({});
                setTrendingExpandedSlot(null);
            }

            if (selectedWidgetId === "productSection") {
                const saved = localStorage.getItem("haatza_product_config");
                if (saved) {
                    try {
                        setProductConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setProductErrors({});
                setProductProductSearch({});
                setProductExpandedSlot(null);
            }

            if (selectedWidgetId === "perfumeSection") {
                const saved = localStorage.getItem("haatza_perfume_config");
                if (saved) {
                    try {
                        setPerfumeConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setPerfumeErrors({});
                setPerfumeProductSearch({});
                setPerfumeExpandedSlot(null);
            }

            if (selectedWidgetId === "kidsSection") {
                const saved = localStorage.getItem("haatza_kids_config");
                if (saved) {
                    try {
                        setKidsConfig(JSON.parse(saved));
                    } catch (e) {}
                }
                setKidsErrors({});
                setKidsProductSearch({});
                setKidsExpandedSlot(null);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [selectedWidgetId, activeMeta]);

    // Handle toast fade
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // ─── category loader helper effect ───
    useEffect(() => {
        setTimeout(() => {
            setIsLoadingCategories(true);
        }, 0);
        const timer = setTimeout(() => {
            setCategoriesList(MOCK_CATEGORIES);
            setIsLoadingCategories(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Keep litePromobannerConfig.imageUrl synced with widgetImages[0]
    useEffect(() => {
        if (selectedWidgetId === "Lite_Promobanner" && widgetImages.length > 0) {
            const currentImg = widgetImages[0];
            if (currentImg !== litePromobannerConfig.imageUrl) {
                setTimeout(() => {
                    setLitePromobannerConfig(prev => ({ ...prev, imageUrl: currentImg || "" }));
                }, 0);
            }
        }
    }, [widgetImages, selectedWidgetId, litePromobannerConfig.imageUrl]);

    // Keep liteBannerConfig.imageUrl synced with widgetImages[0]
    useEffect(() => {
        if (selectedWidgetId === "Lite_Banner" && widgetImages.length > 0) {
            const currentImg = widgetImages[0];
            if (currentImg !== liteBannerConfig.imageUrl) {
                setTimeout(() => {
                    setLiteBannerConfig(prev => ({ ...prev, imageUrl: currentImg || "" }));
                }, 0);
            }
        }
    }, [widgetImages, selectedWidgetId, liteBannerConfig.imageUrl]);



    const triggerToast = (msg, type = "success") => {
        setToastType(type);
        setToastMessage(msg);
    };

    // Category changed -> auto select first widget of new category
    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setSelectedCat(cat);
        const firstWidget = WIDGET_BY_CATEGORY[cat]?.[0] || "";
        if (firstWidget) {
            setSelectedWidgetId(firstWidget);
        }
    };

    // ─── Image Validation Logic ──────────────────────────────────────────
    const validateAndSetImage = useCallback((file, slotIndex) => {
        const meta = activeMeta;
        
        // 1. File Type Check
        if (!meta.formats.includes(file.type)) {
            const err = `Invalid format. Allowed formats: ${meta.formatsDisplay}`;
            setValidationErrors(prev => ({ ...prev, [slotIndex]: err }));
            triggerToast(err, "error");
            return;
        }

        // 2. File Size Check
        if (file.size > meta.maxSize) {
            const err = `File size exceeds ${meta.maxSizeDisplay} limit.`;
            setValidationErrors(prev => ({ ...prev, [slotIndex]: err }));
            triggerToast(err, "error");
            return;
        }

        // 3. Resolution Check
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const { width, height } = img;
            if (width !== meta.resolution.width || height !== meta.resolution.height) {
                const err = `Resolution must be exactly ${meta.resolution.display} (detected: ${width}x${height}px).`;
                setValidationErrors(prev => ({ ...prev, [slotIndex]: err }));
                triggerToast(err, "error");
                return;
            }

            // All checks passed! Convert to base64 so it persists on draft save
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                const base64data = reader.result;
                setWidgetImages(prev => {
                    const newImgs = [...prev];
                    newImgs[slotIndex] = base64data;
                    return newImgs;
                });
                setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next[slotIndex];
                    return next;
                });
                // Save metadata
                setImageMetadata(prev => ({
                    ...prev,
                    [slotIndex]: {
                        name: file.name,
                        size: formatSize(file.size),
                        uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        status: "Draft",
                        resolution: `${meta.resolution.width} × ${meta.resolution.height}`
                    }
                }));

                // Record recent updates
                setRecentUpdates(prev => {
                    const next = new Set(prev);
                    next.add(slotIndex);
                    return next;
                });

                triggerToast(`Slot ${slotIndex + 1} updated successfully!`);
            };
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            const err = "Failed to load image file contents.";
            setValidationErrors(prev => ({ ...prev, [slotIndex]: err }));
            triggerToast(err, "error");
        };
    }, [activeMeta]);

    // Handle Upload Click
    const handleFileChange = (e, index) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSetImage(files[0], index);
        }
    };

    // Replace Image
    const handleReplaceClick = (index) => {
        const input = document.getElementById(`file-input-${index}`);
        if (input) input.click();
    };

    // Delete Image
    const handleDeleteClick = (index) => {
        setWidgetImages(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
        setImageMetadata(prev => ({
            ...prev,
            [index]: {
                name: "Empty Slot",
                size: "-",
                uploadDate: "-",
                status: "Missing",
                resolution: `${activeMeta.resolution.width} × ${activeMeta.resolution.height}`
            }
        }));
        setRecentUpdates(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
        });
        triggerToast(`Image removed from slot ${index + 1}.`, "info");
    };

    // Preview Full Image Modal
    const handlePreviewClick = (index) => {
        if (index !== null && index !== undefined) {
            setActivePreviewSlotIndex(index);
        }
    };

    // ─── Drag & Drop Reordering ──────────────────────────────────────────
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("dragging");
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setWidgetImages(prev => {
            const next = [...prev];
            const temp = next[draggedIndex];
            next[draggedIndex] = next[index];
            next[index] = temp;
            return next;
        });

        // Swap validation errors
        setValidationErrors(prev => {
            const next = { ...prev };
            const draggedErr = next[draggedIndex];
            const targetErr = next[index];
            
            if (draggedErr) next[index] = draggedErr;
            else delete next[index];

            if (targetErr) next[draggedIndex] = targetErr;
            else delete next[draggedIndex];

            return next;
        });

        // Swap metadata
        setImageMetadata(prev => {
            const next = { ...prev };
            const temp = next[draggedIndex];
            next[draggedIndex] = next[index];
            next[index] = temp;
            return next;
        });

        // Swap recent updates
        setRecentUpdates(prev => {
            const next = new Set(prev);
            const hadDragged = next.has(draggedIndex);
            const hadTarget = next.has(index);
            if (hadDragged) next.add(index); else next.delete(index);
            if (hadTarget) next.add(draggedIndex); else next.delete(draggedIndex);
            return next;
        });

        triggerToast("Slots reordered successfully!");
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove("dragging");
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // ─── Publish Flow Actions ───────────────────────────────────────────
    const validateLiteBannerForm = () => {
        const errors = {};
        if (selectedWidgetId === "Lite_Banner") {
            const hasImage = widgetImages[0] !== null && widgetImages[0] !== undefined && widgetImages[0] !== "";
            if (!hasImage) {
                errors.bannerImage = "Banner image is required.";
            }
            if (liteBannerConfig.redirectType === "CATEGORY" && !liteBannerConfig.categoryId) {
                errors.categoryId = "Category redirect requires a selected category.";
            } else if (liteBannerConfig.redirectType === "PRODUCT" && !liteBannerConfig.destProductId) {
                errors.destProductId = "Product redirect requires a selected product.";
            }
        }
        return errors;
    };

    const validateLiteShopbycategoryForm = () => {
        const errors = {};
        if (selectedWidgetId === "Lite_Shopbycategory") {
            liteShopbycategoryConfig.forEach((slot, idx) => {
                const slotErrors = {};
                if (slot.redirectType === "CATEGORY" && !slot.categoryId) {
                    slotErrors.categoryId = "Category redirect requires a selected category.";
                } else if (slot.redirectType === "PRODUCT" && !slot.destProductId) {
                    slotErrors.destProductId = "Product redirect requires a selected product.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateLitePromobannerForm = () => {
        const errors = {};
        if (selectedWidgetId === "Lite_Promobanner") {
            const hasImage = widgetImages[0] !== null && widgetImages[0] !== undefined && widgetImages[0] !== "";
            if (!hasImage) {
                errors.bannerImage = "Promo image is required.";
            }
            if (!litePromobannerConfig.title) {
                errors.title = "Headline is required.";
            }
            if (litePromobannerConfig.redirectType === "CATEGORY" && !litePromobannerConfig.categoryId) {
                errors.destination = "Please select a category.";
            } else if (litePromobannerConfig.redirectType === "PRODUCT" && !litePromobannerConfig.destProductId) {
                errors.destProductId = "Product ID is required.";
            }
        }
        return errors;
    };

    const validateRoomgridForm = () => {
        const errors = {};
        if (selectedWidgetId === "roomgrid") {
            roomgridConfig.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.label) {
                    slotErrors.label = "Label is required.";
                }
                if (slot.redirectType === "CATEGORY" && !slot.categoryId) {
                    slotErrors.categoryId = "Category redirect requires a selected category.";
                } else if (slot.redirectType === "PRODUCT" && !slot.destProductId) {
                    slotErrors.destProductId = "Product redirect requires a selected product.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateLiteBannercarouselForm = () => {
        const errors = {};
        if (selectedWidgetId === "Lite_bannercarousel") {
            liteBannercarouselConfig.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.title) {
                    slotErrors.title = "Title is required.";
                }
                if (slot.redirectType === "CATEGORY" && !slot.categoryId) {
                    slotErrors.categoryId = "Category redirect requires a selected category.";
                } else if (slot.redirectType === "PRODUCT" && !slot.destProductId) {
                    slotErrors.destProductId = "Product redirect requires a selected product.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateTrendingForm = () => {
        const errors = {};
        if (selectedWidgetId === "trendingSection") {
            if (!trendingConfig.title) {
                errors.title = "Section Title is required.";
            }
            trendingConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.productName) {
                    slotErrors.productName = "Product name is required.";
                }
                if (!slot.price) {
                    slotErrors.price = "Product price is required.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateProductForm = () => {
        const errors = {};
        if (selectedWidgetId === "productSection") {
            if (!productConfig.brandTitle) {
                errors.brandTitle = "Brand Title is required.";
            }
            productConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.productName) {
                    slotErrors.productName = "Product name is required.";
                }
                if (!slot.price) {
                    slotErrors.price = "Product price is required.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validatePerfumeForm = () => {
        const errors = {};
        if (selectedWidgetId === "perfumeSection") {
            if (!perfumeConfig.title) {
                errors.title = "Section Title is required.";
            }
            perfumeConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.productName) {
                    slotErrors.productName = "Product name is required.";
                }
                if (!slot.price) {
                    slotErrors.price = "Product price is required.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateKidsForm = () => {
        const errors = {};
        if (selectedWidgetId === "kidsSection") {
            if (!kidsConfig.title) {
                errors.title = "Section Title is required.";
            }
            kidsConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.label) {
                    slotErrors.label = "Label is required.";
                }
                if (slot.redirectType === "CATEGORY" && !slot.categoryId) {
                    slotErrors.categoryId = "Category redirect requires a selected category.";
                } else if (slot.redirectType === "PRODUCT" && !slot.destProductId) {
                    slotErrors.destProductId = "Product redirect requires a selected product.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateFreshmarketForm = () => {
        const errors = {};
        if (selectedWidgetId === "freshmarketSection") {
            if (!freshmarketConfig.title) {
                errors.title = "Section Title is required.";
            }
            freshmarketConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.productName) {
                    slotErrors.productName = "Product name is required.";
                }
                if (!slot.price) {
                    slotErrors.price = "Product price is required.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const validateMatsForm = () => {
        const errors = {};
        if (selectedWidgetId === "matsSection") {
            if (!matsConfig.title) {
                errors.title = "Section Title is required.";
            }
            matsConfig.items.forEach((slot, idx) => {
                const slotErrors = {};
                if (!slot.productName) {
                    slotErrors.productName = "Product name is required.";
                }
                if (!slot.price) {
                    slotErrors.price = "Product price is required.";
                }
                if (Object.keys(slotErrors).length > 0) {
                    errors[idx] = slotErrors;
                }
            });
        }
        return errors;
    };

    const handleSaveDraft = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateLiteBannerForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannerErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannerExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        if (selectedWidgetId === "Lite_Shopbycategory") {
            const errors = validateLiteShopbycategoryForm();
            if (Object.keys(errors).length > 0) {
                setLiteShopbyerrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteShopbycategoryExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        if (selectedWidgetId === "Lite_Promobanner") {
            const errors = validateLitePromobannerForm();
            if (Object.keys(errors).length > 0) {
                setLitePromobannerErrors(errors);
                setLitePromobannerExpandedSlot(0);
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        if (selectedWidgetId === "roomgrid") {
            const errors = validateRoomgridForm();
            if (Object.keys(errors).length > 0) {
                setRoomgridErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setRoomgridExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        if (selectedWidgetId === "Lite_bannercarousel") {
            const errors = validateLiteBannercarouselForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannercarouselErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannercarouselExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        if (selectedWidgetId === "trendingSection") {
            const errors = validateTrendingForm();
            if (Object.keys(errors).length > 0) {
                setTrendingErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setTrendingExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        if (selectedWidgetId === "productSection") {
            const errors = validateProductForm();
            if (Object.keys(errors).length > 0) {
                setProductErrors(errors);
                if (errors.brandTitle) {
                    triggerToast(errors.brandTitle, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setProductExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        if (selectedWidgetId === "perfumeSection") {
            const errors = validatePerfumeForm();
            if (Object.keys(errors).length > 0) {
                setPerfumeErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setPerfumeExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        if (selectedWidgetId === "kidsSection") {
            const errors = validateKidsForm();
            if (Object.keys(errors).length > 0) {
                setKidsErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setKidsExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        if (selectedWidgetId === "freshmarketSection") {
            const errors = validateFreshmarketForm();
            if (Object.keys(errors).length > 0) {
                setFreshmarketErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setFreshmarketExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        if (selectedWidgetId === "matsSection") {
            const errors = validateMatsForm();
            if (Object.keys(errors).length > 0) {
                setMatsErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setMatsExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                }
                return;
            }
        }

        const draftKey = `haatza_draft_${selectedWidgetId}`;
        localStorage.setItem(draftKey, JSON.stringify(widgetImages));
        
        const metadataKey = `haatza_draft_metadata_${selectedWidgetId}`;
        localStorage.setItem(metadataKey, JSON.stringify(imageMetadata));
        
        if (selectedWidgetId === "Lite_Banner") {
            localStorage.setItem("haatza_lite_banner_config", JSON.stringify(liteBannerConfig));
        }

        if (selectedWidgetId === "Lite_Shopbycategory") {
            localStorage.setItem("haatza_lite_shopbycategory_config", JSON.stringify(liteShopbycategoryConfig));
        }

        if (selectedWidgetId === "Lite_Promobanner") {
            localStorage.setItem("haatza_lite_promobanner_config", JSON.stringify(litePromobannerConfig));
        }

        if (selectedWidgetId === "roomgrid") {
            localStorage.setItem("haatza_roomgrid_config", JSON.stringify(roomgridConfig));
        }

        if (selectedWidgetId === "Lite_bannercarousel") {
            localStorage.setItem("haatza_lite_bannercarousel_config", JSON.stringify(liteBannercarouselConfig));
        }        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateLiteBannerForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannerErrors(errors);
                triggerToast("Please fix the validation errors.", "error");
                return;
            }
        }

        if (selectedWidgetId === "trendingSection") {
            localStorage.setItem("haatza_trending_config", JSON.stringify(trendingConfig));
        }

        if (selectedWidgetId === "productSection") {
            localStorage.setItem("haatza_product_config", JSON.stringify(productConfig));
        }

        if (selectedWidgetId === "perfumeSection") {
            localStorage.setItem("haatza_perfume_config", JSON.stringify(perfumeConfig));
        }

        if (selectedWidgetId === "kidsSection") {
            localStorage.setItem("haatza_kids_config", JSON.stringify(kidsConfig));
        }

        if (selectedWidgetId === "freshmarketSection") {
            localStorage.setItem("haatza_freshmarket_config", JSON.stringify(freshmarketConfig));
        }

        if (selectedWidgetId === "matsSection") {
            localStorage.setItem("haatza_mats_config", JSON.stringify(matsConfig));
        }

        setBeforeImages(widgetImages.filter(img => img !== null));
        triggerToast("Draft saved successfully! Saved parameters persisted in workspace.", "success");
    };

    const handlePublishClick = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateLiteBannerForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannerErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannerExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        if (selectedWidgetId === "Lite_Shopbycategory") {
            const errors = validateLiteShopbycategoryForm();
            if (Object.keys(errors).length > 0) {
                setLiteShopbyerrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteShopbycategoryExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        if (selectedWidgetId === "Lite_Promobanner") {
            const errors = validateLitePromobannerForm();
            if (Object.keys(errors).length > 0) {
                setLitePromobannerErrors(errors);
                setLitePromobannerExpandedSlot(0);
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        if (selectedWidgetId === "roomgrid") {
            const errors = validateRoomgridForm();
            if (Object.keys(errors).length > 0) {
                setRoomgridErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setRoomgridExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        if (selectedWidgetId === "Lite_bannercarousel") {
            const errors = validateLiteBannercarouselForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannercarouselErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannercarouselExpandedSlot(Number(firstErrIdx));
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        if (selectedWidgetId === "trendingSection") {
            const errors = validateTrendingForm();
            if (Object.keys(errors).length > 0) {
                setTrendingErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setTrendingExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        if (selectedWidgetId === "productSection") {
            const errors = validateProductForm();
            if (Object.keys(errors).length > 0) {
                setProductErrors(errors);
                if (errors.brandTitle) {
                    triggerToast(errors.brandTitle, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setProductExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        if (selectedWidgetId === "perfumeSection") {
            const errors = validatePerfumeForm();
            if (Object.keys(errors).length > 0) {
                setPerfumeErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setPerfumeExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        if (selectedWidgetId === "kidsSection") {
            const errors = validateKidsForm();
            if (Object.keys(errors).length > 0) {
                setKidsErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setKidsExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        if (selectedWidgetId === "freshmarketSection") {
            const errors = validateFreshmarketForm();
            if (Object.keys(errors).length > 0) {
                setFreshmarketErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setFreshmarketExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        if (selectedWidgetId === "matsSection") {
            const errors = validateMatsForm();
            if (Object.keys(errors).length > 0) {
                setMatsErrors(errors);
                if (errors.title) {
                    triggerToast(errors.title, "error");
                } else {
                    const firstErrIdx = Object.keys(errors)[0];
                    setMatsExpandedSlot(Number(firstErrIdx));
                    triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                }
                return;
            }
        }
        setShowPublishModal(true);
    };

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStep, setPublishStep] = useState(0);

    const handleConfirmPublish = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateLiteBannerForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannerErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannerExpandedSlot(Number(firstErrIdx));
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "Lite_Shopbycategory") {
            const errors = validateLiteShopbycategoryForm();
            if (Object.keys(errors).length > 0) {
                setLiteShopbyerrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteShopbycategoryExpandedSlot(Number(firstErrIdx));
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "Lite_Promobanner") {
            const errors = validateLitePromobannerForm();
            if (Object.keys(errors).length > 0) {
                setLitePromobannerErrors(errors);
                setLitePromobannerExpandedSlot(0);
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "roomgrid") {
            const errors = validateRoomgridForm();
            if (Object.keys(errors).length > 0) {
                setRoomgridErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setRoomgridExpandedSlot(Number(firstErrIdx));
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "Lite_bannercarousel") {
            const errors = validateLiteBannercarouselForm();
            if (Object.keys(errors).length > 0) {
                setLiteBannercarouselErrors(errors);
                const firstErrIdx = Object.keys(errors)[0];
                setLiteBannercarouselExpandedSlot(Number(firstErrIdx));
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "trendingSection") {
            const errors = validateTrendingForm();
            if (Object.keys(errors).length > 0) {
                setTrendingErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "productSection") {
            const errors = validateProductForm();
            if (Object.keys(errors).length > 0) {
                setProductErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "perfumeSection") {
            const errors = validatePerfumeForm();
            if (Object.keys(errors).length > 0) {
                setPerfumeErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "kidsSection") {
            const errors = validateKidsForm();
            if (Object.keys(errors).length > 0) {
                setKidsErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "freshmarketSection") {
            const errors = validateFreshmarketForm();
            if (Object.keys(errors).length > 0) {
                setFreshmarketErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }
        if (selectedWidgetId === "matsSection") {
            const errors = validateMatsForm();
            if (Object.keys(errors).length > 0) {
                setMatsErrors(errors);
                setShowPublishModal(false);
                return;
            }
        }

        const nonNullImages = widgetImages.filter(img => img !== null);
        if (nonNullImages.length < activeMeta.requiredCount) {
            triggerToast(`Cannot publish. Please upload all ${activeMeta.requiredCount} required images.`, "error");
            setShowPublishModal(false);
            return;
        }

        setIsPublishing(true);
        setPublishStep(1);

        setTimeout(() => {
            setPublishStep(2);
            setTimeout(() => {
                setPublishStep(3);
                setTimeout(() => {
                    setIsPublishing(false);
                    setShowPublishModal(false);
                    setPublishStep(0);
                    
                    // Mark all non-empty images as Published
                    setImageMetadata(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(key => {
                            if (next[key].status !== "Missing") {
                                next[key].status = "Published";
                            }
                        });
                        const metadataKey = `haatza_draft_metadata_${selectedWidgetId}`;
                        localStorage.setItem(metadataKey, JSON.stringify(next));
                        return next;
                    });

                    if (selectedWidgetId === "Lite_Banner") {
                        localStorage.setItem("haatza_lite_banner_config", JSON.stringify(liteBannerConfig));
                        localStorage.setItem("haatza_lite_banner_config_published", JSON.stringify(liteBannerConfig));
                    }
                    if (selectedWidgetId === "Lite_Shopbycategory") {
                        localStorage.setItem("haatza_lite_shopbycategory_config", JSON.stringify(liteShopbycategoryConfig));
                        localStorage.setItem("haatza_lite_shopbycategory_config_published", JSON.stringify(liteShopbycategoryConfig));
                    }
                    if (selectedWidgetId === "Lite_Promobanner") {
                        localStorage.setItem("haatza_lite_promobanner_config", JSON.stringify(litePromobannerConfig));
                        localStorage.setItem("haatza_lite_promobanner_config_published", JSON.stringify(litePromobannerConfig));
                    }
                    if (selectedWidgetId === "roomgrid") {
                        localStorage.setItem("haatza_roomgrid_config", JSON.stringify(roomgridConfig));
                        localStorage.setItem("haatza_roomgrid_config_published", JSON.stringify(roomgridConfig));
                    }
                    if (selectedWidgetId === "Lite_bannercarousel") {
                        localStorage.setItem("haatza_lite_bannercarousel_config", JSON.stringify(liteBannercarouselConfig));
                        localStorage.setItem("haatza_lite_bannercarousel_config_published", JSON.stringify(liteBannercarouselConfig));
                    }
                    if (selectedWidgetId === "trendingSection") {
                        localStorage.setItem("haatza_trending_config", JSON.stringify(trendingConfig));
                        localStorage.setItem("haatza_trending_config_published", JSON.stringify(trendingConfig));
                    }
                    if (selectedWidgetId === "productSection") {
                        localStorage.setItem("haatza_product_config", JSON.stringify(productConfig));
                        localStorage.setItem("haatza_product_config_published", JSON.stringify(productConfig));
                    }
                    if (selectedWidgetId === "perfumeSection") {
                        localStorage.setItem("haatza_perfume_config", JSON.stringify(perfumeConfig));
                        localStorage.setItem("haatza_perfume_config_published", JSON.stringify(perfumeConfig));
                    }
                    if (selectedWidgetId === "kidsSection") {
                        localStorage.setItem("haatza_kids_config", JSON.stringify(kidsConfig));
                        localStorage.setItem("haatza_kids_config_published", JSON.stringify(kidsConfig));
                    }
                    if (selectedWidgetId === "freshmarketSection") {
                        localStorage.setItem("haatza_freshmarket_config", JSON.stringify(freshmarketConfig));
                        localStorage.setItem("haatza_freshmarket_config_published", JSON.stringify(freshmarketConfig));
                    }
                    if (selectedWidgetId === "matsSection") {
                        localStorage.setItem("haatza_mats_config", JSON.stringify(matsConfig));
                        localStorage.setItem("haatza_mats_config_published", JSON.stringify(matsConfig));
                    }

                    triggerToast("Widget published successfully to customer mobile applications!", "success");
                }, 1000);
            }, 1000);
        }, 1000);
    };

    // ─── Filter Toggle Handler ─────────────────────────────────────────
    const handleToggleFilter = (filterName) => {
        if (filterName === "All") {
            setActiveFilters(["All"]);
            return;
        }

        setActiveFilters(prev => {
            let next = prev.filter(f => f !== "All");
            if (next.includes(filterName)) {
                next = next.filter(f => f !== filterName);
            } else {
                next.push(filterName);
            }
            if (next.length === 0) {
                next = ["All"];
            }
            return next;
        });
    };

    // ─── Card Selection Handlers ───────────────────────────────────────
    const handleSelectCard = useCallback((index, checked) => {
        setSelectedIndices(prev => {
            if (checked) {
                return [...prev, index];
            } else {
                return prev.filter(i => i !== index);
            }
        });
    }, []);

    const handleSelectAll = useCallback((checked, currentFilteredSlots) => {
        if (checked) {
            setSelectedIndices(currentFilteredSlots.map(s => s.index));
        } else {
            setSelectedIndices([]);
        }
    }, []);

    // ─── Bulk Operations ───────────────────────────────────────────────
    const handleBulkDelete = () => {
        if (selectedIndices.length === 0) return;
        
        setWidgetImages(prev => {
            const next = [...prev];
            selectedIndices.forEach(idx => {
                next[idx] = null;
            });
            return next;
        });

        setValidationErrors(prev => {
            const next = { ...prev };
            selectedIndices.forEach(idx => {
                delete next[idx];
            });
            return next;
        });

        setImageMetadata(prev => {
            const next = { ...prev };
            selectedIndices.forEach(idx => {
                next[idx] = {
                    name: "Empty Slot",
                    size: "-",
                    uploadDate: "-",
                    status: "Missing",
                    resolution: `${activeMeta.resolution.width} × ${activeMeta.resolution.height}`
                };
            });
            return next;
        });

        setRecentUpdates(prev => {
            const next = new Set(prev);
            selectedIndices.forEach(idx => {
                next.delete(idx);
            });
            return next;
        });

        triggerToast(`Successfully deleted ${selectedIndices.length} slot images.`, "info");
        setSelectedIndices([]);
    };

    const handleBulkDownload = () => {
        if (selectedIndices.length === 0) return;
        
        let downloadCount = 0;
        selectedIndices.forEach(idx => {
            const imgUrl = widgetImages[idx];
            if (!imgUrl) return;
            
            const meta = imageMetadata[idx];
            const fileName = meta?.name || `slot-image-${idx + 1}.png`;
            
            const link = document.createElement("a");
            link.href = imgUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            downloadCount++;
        });

        if (downloadCount > 0) {
            triggerToast(`Triggered download for ${downloadCount} selected images.`, "success");
        } else {
            triggerToast("No uploaded images found in selected slots to download.", "error");
        }
    };

    const handleBulkReplaceTrigger = () => {
        if (selectedIndices.length === 0) return;
        const input = document.getElementById("bulk-file-input");
        if (input) input.click();
    };

    const handleBulkFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const slotsToUpdate = [...selectedIndices].sort((a, b) => a - b);
        const countToUpdate = Math.min(files.length, slotsToUpdate.length);
        
        let processedCount = 0;
        for (let i = 0; i < countToUpdate; i++) {
            validateAndSetImage(files[i], slotsToUpdate[i]);
            processedCount++;
        }

        triggerToast(`Processing uploads for ${processedCount} slots...`, "info");
        e.target.value = "";
        setSelectedIndices([]);
    };

    // ─── Upload Toolbar Action ─────────────────────────────────────────
    const handleUploadNewImageClick = () => {
        const firstEmptyIndex = widgetImages.findIndex(img => img === null);
        if (firstEmptyIndex !== -1) {
            handleReplaceClick(firstEmptyIndex);
        } else {
            triggerToast("All slots are currently filled. Use 'Replace' on a specific card to update an image.", "info");
        }
    };

    // ─── Tooltip Hover Handlers ────────────────────────────────────────
    const handleThumbnailMouseEnter = useCallback((index, e) => {
        setHoveredSlotIndex(index);
        setHoverMousePos({ x: e.clientX, y: e.clientY });
    }, []);

    const handleThumbnailMouseMove = useCallback((index, e) => {
        setHoverMousePos({ x: e.clientX, y: e.clientY });
    }, []);

    const handleThumbnailMouseLeave = useCallback(() => {
        setHoveredSlotIndex(null);
    }, []);

    // ─── Filtered Slots Memo ──────────────────────────────────────────
    const filteredSlots = useMemo(() => {
        let list = widgetImages.map((imgUrl, index) => ({
            imgUrl,
            index,
            metadata: imageMetadata[index] || {}
        }));

        const isAll = activeFilters.includes("All") || activeFilters.length === 0;

        if (!isAll) {
            list = list.filter(item => {
                return activeFilters.every(filter => {
                    switch (filter) {
                        case "Uploaded":
                            return item.imgUrl !== null;
                        case "Missing":
                            return item.imgUrl === null;
                        case "Draft":
                            return item.imgUrl !== null && item.metadata.status === "Draft";
                        case "Published":
                            return item.imgUrl !== null && item.metadata.status === "Published";
                        case "Invalid Resolution":
                            return !!validationErrors[item.index];
                        case "Recently Updated":
                            return recentUpdates.has(item.index);
                        default:
                            return true;
                    }
                });
            });
        }

        const query = debouncedSearchQuery.trim().toLowerCase();
        if (query) {
            list = list.filter(item => {
                const slotNumStr = `#${item.index + 1}`;
                const slotNumRaw = String(item.index + 1);
                const name = (item.metadata.name || "").toLowerCase();
                const uploadDate = (item.metadata.uploadDate || "").toLowerCase();
                const widgetName = selectedWidgetId.toLowerCase();
                const type = (item.metadata.name || "").split(".").pop().toLowerCase();
                
                return name.includes(query) || 
                       slotNumStr.includes(query) || 
                       slotNumRaw === query || 
                       uploadDate.includes(query) || 
                       widgetName.includes(query) || 
                       type.includes(query);
            });
        }

        return list;
    }, [widgetImages, imageMetadata, activeFilters, debouncedSearchQuery, validationErrors, recentUpdates, selectedWidgetId]);

    // ─── Stats Memo ────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = widgetImages.length;
        const uploaded = widgetImages.filter(img => img !== null).length;
        const pending = total - uploaded;
        const invalid = Object.keys(validationErrors).length;
        return { total, uploaded, pending, invalid };
    }, [widgetImages, validationErrors]);

    // ─── Virtual Scroll State & Handlers ────────────────────────────────
    const [scrollTop, setScrollTop] = useState(0);
    const handleScroll = useCallback((e) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const itemHeight = 130;
    const containerHeight = 500;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const endIndex = Math.min(filteredSlots.length - 1, Math.floor((scrollTop + containerHeight) / itemHeight) + 2);

    const visibleSlots = useMemo(() => {
        if (filteredSlots.length <= 50) return [];
        return filteredSlots.slice(startIndex, endIndex + 1).map((slot, i) => ({
            ...slot,
            style: {
                position: "absolute",
                top: (startIndex + i) * itemHeight,
                left: 0,
                right: 0,
            }
        }));
    }, [filteredSlots, startIndex, endIndex]);

    const filteredDestSearchProducts = useMemo(() => {
        if (!destProductSearchQuery) return [];
        const query = destProductSearchQuery.toLowerCase();
        return productsMasterList.filter(p => 
            p.productName.toLowerCase().includes(query) ||
            p.productId.toLowerCase().includes(query) ||
            (p.sku && p.sku.toLowerCase().includes(query))
        );
    }, [destProductSearchQuery, productsMasterList]);


    const handleLitePromobannerClick = useCallback(() => {
        if (litePromobannerConfig.redirectType === "CATEGORY") {
            if (litePromobannerConfig.categoryId) {
                setSelectedCategoryInSim(litePromobannerConfig.categoryId);
                setSelectedSubCategoryInSim("");
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${litePromobannerConfig.categoryName}`, "info");
            } else {
                triggerToast("No category selected for this promo banner.", "error");
            }
        } else if (litePromobannerConfig.redirectType === "PRODUCT") {
            if (litePromobannerConfig.destProductId) {
                const found = productsMasterList.find(p => p.productId === litePromobannerConfig.destProductId);
                if (found) {
                    setSelectedProductInSim(found);
                } else {
                    setSelectedProductInSim({
                        productId: litePromobannerConfig.destProductId,
                        productName: litePromobannerConfig.destProductName,
                        price: litePromobannerConfig.destPrice || "$0.00",
                        discount: litePromobannerConfig.destDiscount || "No Discount",
                        mainCategoryId: litePromobannerConfig.destMainCategory || "cat_elect",
                        subCategoryId: litePromobannerConfig.destSubCategory || "",
                        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1080&q=80"
                    });
                }
                setSimulatorTab("details");
                triggerToast(`Opening Product: ${litePromobannerConfig.destProductName}`, "info");
            } else {
                triggerToast("No product selected for this promo banner.", "error");
            }
        }
    }, [litePromobannerConfig, productsMasterList]);

    const handleLiteBannercarouselClick = useCallback((idx) => {
        const slotCfg = liteBannercarouselConfig[idx] || {};
        if (slotCfg.categoryId || slotCfg.destProductId) {
            if (slotCfg.redirectType === "PRODUCT") {
                if (slotCfg.destProductId) {
                    const found = productsMasterList.find(p => p.productId === slotCfg.destProductId);
                    if (found) {
                        setSelectedProductInSim(found);
                    } else {
                        setSelectedProductInSim({
                            productId: slotCfg.destProductId,
                            productName: slotCfg.destProductName,
                            price: slotCfg.destPrice || "$0.00",
                            discount: slotCfg.destDiscount || "No Discount",
                            mainCategoryId: slotCfg.destMainCategory || "cat_elect",
                            subCategoryId: slotCfg.destSubCategory || "",
                            image: widgetImages[idx] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
                        });
                    }
                    setSimulatorTab("details");
                    triggerToast(`Opening Product: ${slotCfg.destProductName}`, "info");
                }
            } else {
                setSelectedCategoryInSim(slotCfg.categoryId);
                setSelectedSubCategoryInSim("");
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${slotCfg.categoryName}`, "info");
            }
        } else {
            triggerToast(`Slide ${idx + 1} clicked!`, "info");
        }
    }, [liteBannercarouselConfig, productsMasterList, widgetImages]);

    const handleLiteBannerClick = useCallback(() => {
        const slotCfg = liteBannerConfig || {};
        if (slotCfg.categoryId || slotCfg.destProductId) {
            if (slotCfg.redirectType === "PRODUCT") {
                if (slotCfg.destProductId) {
                    const found = productsMasterList.find(p => p.productId === slotCfg.destProductId);
                    if (found) {
                        setSelectedProductInSim(found);
                    } else {
                        setSelectedProductInSim({
                            productId: slotCfg.destProductId,
                            productName: slotCfg.destProductName,
                            price: slotCfg.destPrice || "$0.00",
                            discount: slotCfg.destDiscount || "No Discount",
                            mainCategoryId: slotCfg.destMainCategory || "cat_elect",
                            subCategoryId: slotCfg.destSubCategory || "",
                            image: widgetImages[0] || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
                        });
                    }
                    setSimulatorTab("details");
                    triggerToast(`Opening Product: ${slotCfg.destProductName}`, "info");
                }
            } else {
                setSelectedCategoryInSim(slotCfg.categoryId);
                setSelectedSubCategoryInSim("");
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${slotCfg.categoryName}`, "info");
            }
        } else {
            triggerToast(`Banner clicked!`, "info");
        }
    }, [liteBannerConfig, productsMasterList, widgetImages]);

    const handleRoomgridClick = useCallback((idx, defaultLabel, defaultImg) => {
        const slotCfg = roomgridConfig[idx] || {};
        if (slotCfg.categoryId || slotCfg.destProductId) {
            if (slotCfg.redirectType === "PRODUCT") {
                if (slotCfg.destProductId) {
                    const found = productsMasterList.find(p => p.productId === slotCfg.destProductId);
                    if (found) {
                        setSelectedProductInSim(found);
                    } else {
                        setSelectedProductInSim({
                            productId: slotCfg.destProductId,
                            productName: slotCfg.destProductName || defaultLabel,
                            price: slotCfg.destPrice || "$0.00",
                            discount: slotCfg.destDiscount || "No Discount",
                            mainCategoryId: slotCfg.destMainCategory || "cat_home",
                            subCategoryId: slotCfg.destSubCategory || "",
                            image: defaultImg
                        });
                    }
                    setSimulatorTab("details");
                    triggerToast(`Opening Product: ${slotCfg.destProductName || defaultLabel}`, "info");
                }
            } else {
                setSelectedCategoryInSim(slotCfg.categoryId);
                setSelectedSubCategoryInSim("");
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${slotCfg.categoryName}`, "info");
            }
        } else {
            triggerToast(`Room clicked: ${slotCfg.label || defaultLabel}`, "info");
        }
    }, [roomgridConfig, productsMasterList]);

    const handleFreshmarketItemClick = useCallback((idx, defaultName, defaultPrice, defaultImg) => {
        const slotCfg = freshmarketConfig.items[idx] || {};
        const prodId = slotCfg.destProductId || slotCfg.productId;
        if (prodId) {
            const found = productsMasterList.find(p => p.productId === prodId);
            if (found) {
                setSelectedProductInSim(found);
            } else {
                setSelectedProductInSim({
                    productId: prodId,
                    productName: slotCfg.productName || defaultName,
                    price: slotCfg.price || defaultPrice,
                    discount: slotCfg.badge || "Fresh",
                    mainCategoryId: slotCfg.destMainCategory || "cat_groc",
                    subCategoryId: slotCfg.destSubCategory || "",
                    image: defaultImg
                });
            }
            setSimulatorTab("details");
            triggerToast(`Opening Product: ${slotCfg.productName || defaultName}`, "info");
        } else {
            triggerToast(`Product clicked: ${slotCfg.productName || defaultName}`, "info");
        }
    }, [freshmarketConfig.items, productsMasterList]);

    const handleMatsItemClick = useCallback((idx, defaultName, defaultPrice, defaultImg) => {
        const slotCfg = matsConfig.items[idx] || {};
        const prodId = slotCfg.destProductId || slotCfg.productId;
        if (prodId) {
            const found = productsMasterList.find(p => p.productId === prodId);
            if (found) {
                setSelectedProductInSim(found);
            } else {
                setSelectedProductInSim({
                    productId: prodId,
                    productName: slotCfg.productName || defaultName,
                    price: slotCfg.price || defaultPrice,
                    discount: slotCfg.offer || "10% Off",
                    mainCategoryId: slotCfg.destMainCategory || "cat_home",
                    subCategoryId: slotCfg.destSubCategory || "",
                    image: defaultImg
                });
            }
            setSimulatorTab("details");
            triggerToast(`Opening Product: ${slotCfg.productName || defaultName}`, "info");
        } else {
            triggerToast(`Product clicked: ${slotCfg.productName || defaultName}`, "info");
        }
    }, [matsConfig.items, productsMasterList]);

    const handleTrendingItemClick = useCallback((idx, defaultName, defaultPrice, defaultDiscount, defaultImg) => {
        const slotCfg = trendingConfig.items[idx] || {};
        const prodId = slotCfg.destProductId || slotCfg.productId;
        if (prodId) {
            const found = productsMasterList.find(p => p.productId === prodId);
            if (found) {
                setSelectedProductInSim(found);
            } else {
                setSelectedProductInSim({
                    productId: prodId,
                    productName: slotCfg.productName || defaultName,
                    price: slotCfg.price || defaultPrice,
                    discount: slotCfg.discount || defaultDiscount,
                    mainCategoryId: slotCfg.destMainCategory || "cat_elect",
                    subCategoryId: slotCfg.destSubCategory || "",
                    image: defaultImg
                });
            }
            setSimulatorTab("details");
            triggerToast(`Opening Product: ${slotCfg.productName || defaultName}`, "info");
        } else {
            triggerToast(`Product clicked: ${slotCfg.productName || defaultName}`, "info");
        }
    }, [trendingConfig.items, productsMasterList]);

    const handleProductSectionItemClick = useCallback((idx, defaultName, defaultPrice, defaultDiscount, defaultImg) => {
        const slotCfg = productConfig.items[idx] || {};
        const prodId = slotCfg.destProductId || slotCfg.productId;
        if (prodId) {
            const found = productsMasterList.find(p => p.productId === prodId);
            if (found) {
                setSelectedProductInSim(found);
            } else {
                setSelectedProductInSim({
                    productId: prodId,
                    productName: slotCfg.productName || defaultName,
                    price: slotCfg.price || defaultPrice,
                    discount: slotCfg.discount || defaultDiscount,
                    mainCategoryId: slotCfg.destMainCategory || "cat_fash",
                    subCategoryId: slotCfg.destSubCategory || "",
                    image: defaultImg
                });
            }
            setSimulatorTab("details");
            triggerToast(`Opening Product: ${slotCfg.productName || defaultName}`, "info");
        } else {
            triggerToast(`Product clicked: ${slotCfg.productName || defaultName}`, "info");
        }
    }, [productConfig.items, productsMasterList]);

    const handlePerfumeItemClick = useCallback((idx, defaultName, defaultPrice, defaultDiscount, defaultImg) => {
        const slotCfg = perfumeConfig.items[idx] || {};
        const prodId = slotCfg.destProductId || slotCfg.productId;
        if (prodId) {
            const found = productsMasterList.find(p => p.productId === prodId);
            if (found) {
                setSelectedProductInSim(found);
            } else {
                setSelectedProductInSim({
                    productId: prodId,
                    productName: slotCfg.productName || defaultName,
                    price: slotCfg.price || defaultPrice,
                    discount: slotCfg.offerTag || defaultDiscount,
                    mainCategoryId: slotCfg.destMainCategory || "cat_pers",
                    subCategoryId: slotCfg.destSubCategory || "",
                    image: defaultImg
                });
            }
            setSimulatorTab("details");
            triggerToast(`Opening Perfume: ${slotCfg.productName || defaultName}`, "info");
        } else {
            triggerToast(`Perfume clicked: ${slotCfg.productName || defaultName}`, "info");
        }
    }, [perfumeConfig.items, productsMasterList]);

    const handleKidsItemClick = useCallback((idx, defaultLabel, defaultImg) => {
        const slotCfg = kidsConfig.items[idx] || {};
        if (slotCfg.categoryId || slotCfg.destProductId) {
            if (slotCfg.redirectType === "PRODUCT") {
                if (slotCfg.destProductId) {
                    const found = productsMasterList.find(p => p.productId === slotCfg.destProductId);
                    if (found) {
                        setSelectedProductInSim(found);
                    } else {
                        setSelectedProductInSim({
                            productId: slotCfg.destProductId,
                            productName: slotCfg.destProductName || defaultLabel,
                            price: slotCfg.destPrice || "$0.00",
                            discount: slotCfg.destDiscount || "No Discount",
                            mainCategoryId: slotCfg.destMainCategory || "cat_toys",
                            subCategoryId: slotCfg.destSubCategory || "",
                            image: defaultImg
                        });
                    }
                    setSimulatorTab("details");
                    triggerToast(`Opening Product: ${slotCfg.destProductName || defaultLabel}`, "info");
                }
            } else {
                setSelectedCategoryInSim(slotCfg.categoryId);
                setSelectedSubCategoryInSim("");
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${slotCfg.categoryName}`, "info");
            }
        } else {
            triggerToast(`Category clicked: ${slotCfg.label || defaultLabel}`, "info");
        }
    }, [kidsConfig.items, productsMasterList]);

    const renderWidgetMock = useCallback((widgetId, imagesSource, isBeforeLabel = false) => {
        const isEditingThis = widgetId === selectedWidgetId;
        const meta = WIDGET_METADATA[widgetId] || WIDGET_METADATA.Lite_Banner;
        
        let validImgs = [];
        if (isEditingThis) {
            validImgs = imagesSource.filter(img => img !== null);
        } else {
            const draftKey = `haatza_draft_${widgetId}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    validImgs = JSON.parse(savedDraft).filter(img => img !== null);
                } catch (e) {
                    validImgs = [...meta.defaultImages];
                }
            } else {
                validImgs = [...meta.defaultImages];
            }
        }

        // Fill remaining slots up to requiredCount
        while (validImgs.length < meta.requiredCount) {
            validImgs.push(null);
        }
        validImgs = validImgs.slice(0, meta.requiredCount);

        switch (widgetId) {
            case "Lite_Banner":
                return (
                    <div 
                        className="mock-widget-lite-banner animate-fade" 
                        onClick={handleLiteBannerClick} 
                        style={{ cursor: 'pointer' }}
                    >
                        {validImgs[0] ? (
                            <img src={validImgs[0]} alt="Lite Banner" loading="lazy" />
                        ) : (
                            <div className="beauty-cat-placeholder" style={{ aspectRatio: '2/1' }} />
                        )}
                    </div>
                );

            case "Lite_Promobanner":
                return (
                    <div className="mock-widget-lite-promobanner animate-fade" onClick={handleLitePromobannerClick} style={{ cursor: 'pointer' }}>
                        <div className="promo-container">
                            <img src={validImgs[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1080&q=80"} alt="Promo Banner" loading="lazy" />
                            <div className="promo-text-wrap">
                                <span className="promo-subtitle">LIMITED TIME OFFER</span>
                                <h2 className="promo-headline">{litePromobannerConfig.title || "Super Saver Pack"}</h2>
                                <p className="promo-desc">{litePromobannerConfig.description || "Stock up today with discount codes applied automatically at billing checkout."}</p>
                                <button className="promo-cta-btn">{litePromobannerConfig.ctaText || "Shop Now"}</button>
                            </div>
                        </div>
                    </div>
                );

            case "roomgrid":
                return (
                    <div className="room-grid-widget animate-fade">
                        <h4 className="room-grid-header">Shop By Room</h4>
                        <div className="room-grid-container">
                            {[0, 1, 2, 3].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const slotCfg = roomgridConfig[idx] || {};
                                const label = slotCfg.label || (meta.labels && meta.labels[idx]) || `Room ${idx + 1}`;
                                
                                return (
                                    <div 
                                        className="room-grid-card" 
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRoomgridClick(idx, label, img);
                                        }}
                                    >
                                        {img ? (
                                            <img className="room-grid-image" src={img} alt={label} />
                                        ) : (
                                            <div className="room-grid-image-placeholder" style={{ background: '#e4e4e7', width: '100%', height: '100%' }} />
                                        )}
                                        <div className="room-grid-overlay">
                                            {label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "Lite_bannercarousel":
                return (
                    <BannerCarouselWidget 
                        images={validImgs} 
                        config={liteBannercarouselConfig} 
                        onSlideClick={handleLiteBannercarouselClick} 
                    />
                );

            case "freshmarketSection":
                return (
                    <div className="mock-widget-freshmarket animate-fade" style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                        <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 className="widget-header-title" style={{ color: '#166534', margin: 0, fontSize: '14px', fontWeight: 700 }}>
                                {freshmarketConfig.title || "🥦 Fresh Market Deals"}
                            </h4>
                            <span className="section-see-all" style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, cursor: 'pointer' }}>
                                {freshmarketConfig.seeAllText || "See All"}
                            </span>
                        </div>
                        <div className="freshmarket-horizontal-scroll" onMouseDown={handleDragScroll} style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', cursor: 'grab' }}>
                            {[0, 1, 2, 3].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const slotCfg = freshmarketConfig.items[idx] || {};
                                const title = slotCfg.productName || (meta.labels && meta.labels[idx]) || `Item ${idx + 1}`;
                                const price = slotCfg.price || (meta.prices && meta.prices[idx]) || "₹100";
                                const weight = slotCfg.weight || "1 kg";
                                const badge = slotCfg.badge || "Fresh";

                                return (
                                    <div 
                                        className="freshmarket-item-card" 
                                        key={idx} 
                                        onClick={(e) => handleFreshmarketItemClick(idx, title, price, img)}
                                        style={{ 
                                            flex: '0 0 100px', 
                                            background: '#ffffff', 
                                            borderRadius: '6px', 
                                            border: '1px solid #dcfce7', 
                                            padding: '8px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '100%', height: '80px', borderRadius: '4px', overflow: 'hidden', background: '#f4f4f5' }}>
                                                {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#e4e4e7' }} />}
                                            </div>
                                            {badge && (
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    top: '4px', 
                                                    left: '4px', 
                                                    background: '#22c55e', 
                                                    color: '#fff', 
                                                    fontSize: '8px', 
                                                    fontWeight: 700, 
                                                    padding: '2px 4px', 
                                                    borderRadius: '3px' 
                                                }}>
                                                    {badge}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#1f2937', height: '28px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '14px' }}>{title}</span>
                                            <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{weight}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>{price}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); triggerToast(`Added ${title} to Cart!`); }} 
                                                style={{ border: 'none', background: '#22c55e', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "matsSection":
                return (
                    <div className="mock-widget-mats animate-fade" style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <h4 className="widget-header-title" style={{ color: '#111827', margin: 0, fontSize: '14px', fontWeight: 800, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {matsConfig.title || "Mats & doormats starting @ Rs.49"}
                                </h4>
                                {matsConfig.subtitle && (
                                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {matsConfig.subtitle}
                                    </p>
                                )}
                            </div>
                            <div 
                                onClick={(e) => { e.stopPropagation(); triggerToast(`Clicked See All: ${matsConfig.seeAllText || "View All"}`); }} 
                                style={{ 
                                    width: '26px', 
                                    height: '26px', 
                                    borderRadius: '6px', 
                                    border: '1px solid #e5e7eb', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    background: '#ffffff', 
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <ChevronRight size={14} style={{ color: '#1f2937' }} />
                            </div>
                        </div>
                        <div onMouseDown={handleDragScroll} style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', cursor: 'grab' }}>
                            {matsConfig.items.map((slotCfg, idx) => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const title = slotCfg.productName || (meta.labels && meta.labels[idx]) || `Mat ${idx + 1}`;
                                const price = slotCfg.price || (meta.prices && meta.prices[idx]) || "₹69";
                                const oldPrice = slotCfg.oldPrice || (meta.oldPrices && meta.oldPrices[idx]) || "₹199";
                                const discount = slotCfg.discount || (meta.discounts && meta.discounts[idx]) || "65% OFF";
                                const delivery = slotCfg.delivery || (meta.deliveries && meta.deliveries[idx]) || "8 mins";

                                return (
                                    <div 
                                        className="mats-item-card" 
                                        key={idx} 
                                        onClick={(e) => handleMatsItemClick(idx, title, price, img)}
                                        style={{ 
                                            flex: '0 0 92px', 
                                            background: '#ffffff', 
                                            borderRadius: '8px', 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ position: 'relative', width: '92px', height: '92px', borderRadius: '12px', overflow: 'hidden', background: '#f4f4f5', border: '1px solid #f3f4f6' }}>
                                            {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#e4e4e7' }} />}
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); triggerToast(`Added ${title} to Cart!`); }}
                                                style={{ 
                                                    position: 'absolute', 
                                                    bottom: '6px', 
                                                    right: '6px', 
                                                    width: '26px', 
                                                    height: '26px', 
                                                    borderRadius: '8px', 
                                                    background: '#ffffff', 
                                                    border: '1.5px solid #22c55e', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                                                    cursor: 'pointer',
                                                    zIndex: 10
                                                }}
                                            >
                                                <Plus size={16} style={{ color: '#22c55e', strokeWidth: 3 }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            {discount && (
                                                <span style={{ 
                                                    background: '#fde047', 
                                                    color: '#111827', 
                                                    fontSize: '9px', 
                                                    fontWeight: 800, 
                                                    padding: '2px 6px', 
                                                    borderRadius: '6px',
                                                    textTransform: 'uppercase',
                                                    marginBottom: '4px',
                                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                                }}>
                                                    {discount}
                                                </span>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '3px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#111827', fontFamily: 'system-ui, -apple-system, sans-serif' }}>{price}</span>
                                                {oldPrice && <span style={{ fontSize: '9px', textDecoration: 'line-through', color: '#9ca3af', fontFamily: 'system-ui, -apple-system, sans-serif' }}>{oldPrice}</span>}
                                            </div>
                                            <span style={{ 
                                                border: '1px solid #3b82f6', 
                                                color: '#2563eb', 
                                                fontSize: '8px', 
                                                fontWeight: 700, 
                                                padding: '1px 6px', 
                                                borderRadius: '6px',
                                                marginBottom: '6px',
                                                fontFamily: 'system-ui, -apple-system, sans-serif'
                                            }}>
                                                Har Din Sasta!
                                            </span>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 500, 
                                                color: '#1f2937', 
                                                height: '28px', 
                                                overflow: 'hidden', 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical', 
                                                lineHeight: '14px',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                textAlign: 'left'
                                            }}>
                                                {title}
                                            </span>
                                            {delivery && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                                                    <span style={{ color: '#22c55e', fontSize: '10px' }}>⚡</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 500, color: '#4b5563', fontFamily: 'system-ui, -apple-system, sans-serif' }}>{delivery}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "trendingSection":
                return (
                    <div className="mock-widget-trending animate-fade" style={{ background: '#f4f4f5', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 className="widget-header-title" style={{ color: '#111827', margin: 0, fontSize: '14px', fontWeight: 800, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                {trendingConfig.title || "Trending this week"}
                            </h4>
                        </div>
                        <div onMouseDown={handleDragScroll} style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', cursor: 'grab' }}>
                            {validImgs.map((_, idx) => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const defaultLabel = meta.labels && meta.labels[idx];
                                const defaultDiscount = meta.discounts && meta.discounts[idx];
                                
                                const slotCfg = trendingConfig.items[idx] || {};
                                const title = slotCfg.productName || defaultLabel || `Product ${idx + 1}`;
                                const badgeTag = slotCfg.discount || defaultDiscount || "STARTING @ ₹31";

                                return (
                                    <div 
                                        className="trending-item-card" 
                                        key={idx} 
                                        onClick={(e) => handleTrendingItemClick(idx, title, badgeTag, img)} 
                                        style={{ 
                                            flex: '0 0 86px', 
                                            width: '86px', 
                                            background: '#ffffff', 
                                            borderRadius: '16px', 
                                            overflow: 'hidden', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025)',
                                            border: '1px solid #f3f4f6'
                                        }}
                                    >
                                        <div style={{ width: '100%', height: '80px', overflow: 'hidden', background: '#f4f4f5' }}>
                                            {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#e4e4e7' }} />}
                                        </div>
                                        <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <span style={{ 
                                                fontSize: '10px', 
                                                fontWeight: 700, 
                                                color: '#111827', 
                                                height: '26px', 
                                                overflow: 'hidden', 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical', 
                                                lineHeight: '13px',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                textAlign: 'left',
                                                marginBottom: '6px'
                                            }}>
                                                {title}
                                            </span>
                                            <span style={{ 
                                                background: '#f43f5e', 
                                                color: '#ffffff', 
                                                fontSize: '7.5px', 
                                                fontWeight: 900, 
                                                padding: '3px 8px', 
                                                borderRadius: '9999px',
                                                textTransform: 'uppercase',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                textAlign: 'center',
                                                display: 'inline-block'
                                            }}>
                                                {badgeTag}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

             case "productSection":
                return (
                    <div className="mock-widget-products animate-fade" style={{ background: '#0a2540', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h4 className="widget-header-title" style={{ color: '#ffffff', margin: 0, fontSize: '15px', fontWeight: 800, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {productConfig.brandTitle || "Tata Simply Better"}
                                </h4>
                                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    {productConfig.subtitle || "Better lifestyle"}
                                </p>
                            </div>
                            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', borderRadius: '4px', overflow: 'hidden', background: '#ffffff', padding: '2px' }}>
                                <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=80&q=80" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </div>
                        <div 
                            onMouseDown={handleDragScroll} 
                            style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', cursor: 'grab' }}
                        >
                            {validImgs.map((_, idx) => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const defaultLabel = meta.labels && meta.labels[idx];
                                const defaultPrice = meta.prices && meta.prices[idx];
                                const defaultRating = meta.ratings && meta.ratings[idx];
                                const defaultOldPrice = meta.oldPrices && meta.oldPrices[idx];
                                const defaultDiscount = meta.discounts && meta.discounts[idx];
                                const defaultQuantity = meta.quantities && meta.quantities[idx];
                                const defaultDelivery = meta.deliveries && meta.deliveries[idx];
                                const defaultUnitPrice = meta.unitPrices && meta.unitPrices[idx];

                                const slotCfg = productConfig.items[idx] || {};
                                const title = slotCfg.productName || defaultLabel || `Product ${idx + 1}`;
                                const price = slotCfg.price || defaultPrice || "₹1,299";
                                const oldPrice = slotCfg.oldPrice || defaultOldPrice || "";
                                const discount = slotCfg.discount || defaultDiscount || "";
                                const quantity = slotCfg.quantity || defaultQuantity || "";
                                const rating = slotCfg.rating || defaultRating || "4.5";
                                const delivery = slotCfg.delivery || defaultDelivery || "12 mins";
                                const unitPrice = slotCfg.unitPrice || defaultUnitPrice || "₹32.4/100 ml";

                                return (
                                    <div 
                                        className="product-section-card" 
                                        key={idx} 
                                        onClick={(e) => handleProductSectionItemClick(idx, title, price, discount, img)} 
                                        style={{ 
                                            flex: '0 0 100px', 
                                            width: '100px', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        {/* Card white wrapper */}
                                        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '6px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                            {/* Image container with heart overlay */}
                                            <div style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#f4f4f5' }}>
                                                {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#e4e4e7' }} />}
                                                {/* Heart button */}
                                                <div style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '10px', color: '#64748b' }}>♡</span>
                                                </div>
                                            </div>
                                            {/* Quantity and ADD button row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 600, color: '#4b5563', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                    {quantity}
                                                </span>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); triggerToast(`Added ${title} to Cart!`); }}
                                                    style={{ 
                                                        border: '1px solid #22c55e', 
                                                        color: '#22c55e', 
                                                        fontSize: '8px', 
                                                        fontWeight: 800, 
                                                        padding: '2px 8px', 
                                                        borderRadius: '6px', 
                                                        background: '#ffffff' 
                                                    }}
                                                >
                                                    ADD
                                                </div>
                                            </div>
                                        </div>
                                        {/* Details below card (on dark blue background) */}
                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 4px' }}>
                                            <span style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                {unitPrice}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '2px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                    {price}
                                                </span>
                                                {oldPrice && (
                                                    <span style={{ fontSize: '8px', textDecoration: 'line-through', color: '#94a3b8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                        {oldPrice}
                                                    </span>
                                                )}
                                            </div>
                                            {discount && (
                                                <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#4ade80', marginTop: '1px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                    {discount}
                                                </span>
                                            )}
                                            <span style={{ 
                                                fontSize: '10px', 
                                                fontWeight: 700, 
                                                color: '#ffffff', 
                                                marginTop: '2px',
                                                height: '24px', 
                                                overflow: 'hidden', 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical', 
                                                lineHeight: '12px',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                textAlign: 'left'
                                            }}>
                                                {title}
                                            </span>
                                            {/* Rating and clock row */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '9px', color: '#94a3b8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                                                    <span style={{ color: '#fbbf24', fontSize: '9px' }}>★</span>
                                                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{rating}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <span>⏱</span>
                                                    <span>{delivery}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Bottom See all products button */}
                        <div 
                            onClick={(e) => { e.stopPropagation(); triggerToast("Redirecting to all products..."); }}
                            style={{ 
                                background: '#ffffff', 
                                color: '#1e293b', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                padding: '8px', 
                                borderRadius: '9999px', 
                                textAlign: 'center', 
                                cursor: 'pointer', 
                                marginTop: '4px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <span>See all products</span>
                            <span style={{ fontSize: '10px' }}>&gt;</span>
                        </div>
                    </div>
                );

            case "perfumeSection":
                return (
                    <div className="mock-widget-perfume animate-fade" style={{ backgroundColor: '#ffffff', color: '#1e293b', padding: '16px 12px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textAlign: 'left', margin: '0 0 12px 0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                            {perfumeConfig.title || "Look good, smell great"}
                        </h3>
                        <div className="perfume-carousel-scroller" onMouseDown={handleDragScroll} style={{ cursor: 'grab', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {validImgs.map((_, idx) => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const defaultLabel = meta.labels && meta.labels[idx];
                                const defaultPrice = meta.prices && meta.prices[idx];
                                const defaultOldPrice = meta.oldPrices && meta.oldPrices[idx];
                                const defaultDiscount = meta.discounts && meta.discounts[idx];
                                const defaultQuantity = meta.quantities && meta.quantities[idx];
                                const defaultDelivery = meta.deliveries && meta.deliveries[idx];
                                const defaultRating = meta.ratings && meta.ratings[idx];
                                const tag1 = meta.tag1 && meta.tag1[idx];
                                const tag2 = meta.tag2 && meta.tag2[idx];

                                const slotCfg = perfumeConfig.items[idx] || {};
                                const title = slotCfg.productName || defaultLabel || `Perfume ${idx + 1}`;
                                const price = slotCfg.price || defaultPrice || "₹12,000";
                                const oldPrice = slotCfg.oldPrice || defaultOldPrice || "";
                                const discount = slotCfg.discount || defaultDiscount || "";
                                const quantity = slotCfg.quantity || defaultQuantity || "100 ml";
                                const delivery = slotCfg.deliveryTime || defaultDelivery || "15 mins";
                                const rating = slotCfg.rating || defaultRating || "4.5";

                                return (
                                    <div 
                                        key={idx} 
                                        onClick={(e) => handlePerfumeItemClick(idx, defaultLabel, defaultPrice, slotCfg.offerTag, img)} 
                                        style={{ 
                                            width: '96px', 
                                            flexShrink: 0, 
                                            backgroundColor: '#ffffff', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        {/* Card Container Box */}
                                        <div style={{
                                            width: '96px',
                                            height: '115px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            padding: '6px',
                                            boxSizing: 'border-box'
                                        }}>
                                            {/* Upper part: Image + Heart icon */}
                                            <div style={{ position: 'relative', width: '100%', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {img ? (
                                                    <img src={img} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} loading="lazy" />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px' }} />
                                                )}
                                                
                                                {/* Heart Icon Overlay */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '0px',
                                                    right: '0px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#ffffff',
                                                    borderRadius: '50%',
                                                    padding: '4px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                }}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                                    </svg>
                                                </div>

                                                {/* 3 Dots Indicator (bottom-left of image container) */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '0px',
                                                    left: '2px',
                                                    display: 'flex',
                                                    gap: '2px'
                                                }}>
                                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#475569' }} />
                                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                                                </div>
                                            </div>

                                            {/* Bottom row inside card: Volume + ADD button */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                marginTop: '4px'
                                            }}>
                                                {/* Volume */}
                                                <span style={{
                                                    fontSize: '8px',
                                                    fontWeight: 700,
                                                    color: '#334155',
                                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                                }}>
                                                    {quantity}
                                                </span>

                                                {/* ADD Button */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerToast(`Added to cart: ${title}`);
                                                    }}
                                                    style={{
                                                        border: '1px solid #16a34a',
                                                        color: '#16a34a',
                                                        fontSize: '8px',
                                                        fontWeight: 700,
                                                        padding: '2px 8px',
                                                        borderRadius: '20px',
                                                        backgroundColor: '#ffffff',
                                                        cursor: 'pointer',
                                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                                        lineHeight: '1',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ADD
                                                </button>
                                            </div>
                                        </div>

                                        {/* Details below card container */}
                                        <div style={{ display: 'flex', flexDirection: 'column', padding: '2px 4px 0 4px', width: '96px', boxSizing: 'border-box' }}>
                                            {/* Price Row: Current Price + Old Price */}
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                    {price}
                                                </span>
                                                {oldPrice && (
                                                    <span style={{ fontSize: '8px', textDecoration: 'line-through', color: '#94a3b8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                        {oldPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Discount/Offer Tag */}
                                            {discount && (
                                                <span style={{ fontSize: '7.5px', fontWeight: 700, color: '#2563eb', display: 'block', margin: '1px 0 0 0', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'left' }}>
                                                    {discount}
                                                </span>
                                            )}
                                            {idx === 2 && discount === "₹961 OFF" && (
                                                <span style={{ fontSize: '7.5px', fontWeight: 700, color: '#2563eb', display: 'block', margin: '1px 0 0 0', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'left' }}>
                                                    ₹200 Cashback on EMI
                                                </span>
                                            )}

                                            {/* Product Title */}
                                            <span style={{ 
                                                fontSize: '9px', 
                                                fontWeight: 700, 
                                                color: '#475569', 
                                                marginTop: '3px',
                                                height: '24px', 
                                                overflow: 'hidden', 
                                                display: '-webkit-box', 
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical', 
                                                lineHeight: '12px',
                                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                                textAlign: 'left'
                                            }}>
                                                {title}
                                            </span>

                                            {/* Badges Column */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start', marginTop: '3px' }}>
                                                {tag1 && (
                                                    <span style={{
                                                        backgroundColor: '#f3f4f6',
                                                        color: '#4b5563',
                                                        fontSize: '8px',
                                                        fontWeight: 700,
                                                        padding: '2px 5px',
                                                        borderRadius: '4px',
                                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                                        lineHeight: '1'
                                                    }}>
                                                        {tag1}
                                                    </span>
                                                )}
                                                {tag2 && (
                                                    <span style={{
                                                        backgroundColor: '#fef3c7',
                                                        color: '#d97706',
                                                        fontSize: '8px',
                                                        fontWeight: 700,
                                                        padding: '2px 5px',
                                                        borderRadius: '4px',
                                                        fontFamily: 'system-ui, -apple-system, sans-serif',
                                                        lineHeight: '1'
                                                    }}>
                                                        {tag2}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating and Delivery time row */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '8.5px', color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                                                    <span style={{ color: '#fbbf24', fontSize: '9px' }}>★</span>
                                                    <span style={{ color: '#475569', fontWeight: 700 }}>{rating}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <span>⏱</span>
                                                    <span>{delivery}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "kidsSection": {
                const displayItems = (kidsConfig.items || []).slice(0, 3);
                
                // Helper to split labels into main and sub line
                const splitLabel = (label) => {
                    if (!label) return { main: "", sub: "" };
                    if (label.toLowerCase().includes("0-3")) {
                        return { main: "0-3", sub: "Years" };
                    }
                    if (label.toLowerCase().includes("3-10")) {
                        return { main: "3-10", sub: "Years" };
                    }
                    if (label.toLowerCase().includes("10")) {
                        return { main: "10 Years", sub: "& Above" };
                    }
                    const parts = label.split(" ");
                    if (parts.length > 1) {
                        return { main: parts[0], sub: parts.slice(1).join(" ") };
                    }
                    return { main: label, sub: "" };
                };

                return (
                    <div className="mock-widget-kids animate-fade" style={{ backgroundColor: '#ffffff', padding: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', overflow: 'hidden' }}>
                        {/* Wavy Header Banner */}
                        <div style={{ position: 'relative', backgroundColor: '#fef9c3', padding: '16px 12px 20px 12px', textAlign: 'center', minHeight: '60px', boxSizing: 'border-box' }}>
                            {/* Wavy bottom border using SVG */}
                            <div style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '10px', zIndex: 1 }}>
                                <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                                    <path d="M0 0 L100 0 L100 6 Q75 2 50 5 T0 4 Z" fill="#fef9c3" />
                                </svg>
                            </div>

                            {/* Left Kid Illustration */}
                            <div style={{ position: 'absolute', left: '8px', bottom: '-2px', zIndex: 2 }}>
                                <svg width="45" height="50" viewBox="0 0 64 64" style={{ display: 'block' }}>
                                    {/* Hair back */}
                                    <circle cx="28" cy="22" r="14" fill="#6f4e37" />
                                    <circle cx="38" cy="22" r="14" fill="#6f4e37" />
                                    <circle cx="32" cy="16" r="14" fill="#6f4e37" />
                                    {/* Ears */}
                                    <circle cx="18" cy="30" r="4" fill="#ffd1a9" />
                                    <circle cx="46" cy="30" r="4" fill="#ffd1a9" />
                                    {/* Face */}
                                    <circle cx="32" cy="30" r="12" fill="#ffd1a9" />
                                    {/* Hair front/bangs */}
                                    <path d="M20 24 Q32 16 44 24 Q38 18 32 20 Q26 18 20 24 Z" fill="#5c3a21" />
                                    <circle cx="22" cy="22" r="6" fill="#5c3a21" />
                                    <circle cx="42" cy="22" r="6" fill="#5c3a21" />
                                    {/* Eyes */}
                                    <circle cx="28" cy="30" r="1.5" fill="#2d3748" />
                                    <circle cx="36" cy="30" r="1.5" fill="#2d3748" />
                                    {/* Cheeks */}
                                    <circle cx="25" cy="33" r="1.5" fill="#f56565" opacity="0.6" />
                                    <circle cx="39" cy="33" r="1.5" fill="#f56565" opacity="0.6" />
                                    {/* Smile */}
                                    <path d="M30 34 Q32 37 34 34" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                    {/* Neck */}
                                    <rect x="29" y="40" width="6" height="6" fill="#ffd1a9" />
                                    {/* Body/Clothes (Green Vest) */}
                                    <path d="M20 46 C20 46 22 60 32 60 C42 60 44 46 44 46 Z" fill="#059669" />
                                    {/* Waving Arm (Left arm of girl, which is on the left side of SVG) */}
                                    <path d="M20 46 Q10 32 14 28 C16 26 20 30 20 38" fill="#ffd1a9" />
                                    {/* Other Arm */}
                                    <path d="M44 46 Q48 54 48 58" stroke="#ffd1a9" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>

                            {/* Right Kid Illustration */}
                            <div style={{ position: 'absolute', right: '8px', bottom: '-2px', zIndex: 2 }}>
                                <svg width="45" height="50" viewBox="0 0 64 64" style={{ display: 'block' }}>
                                    {/* Hair back */}
                                    <circle cx="32" cy="20" r="13" fill="#8b5a2b" />
                                    <circle cx="25" cy="18" r="8" fill="#8b5a2b" />
                                    <circle cx="39" cy="18" r="8" fill="#8b5a2b" />
                                    {/* Ears */}
                                    <circle cx="19" cy="28" r="3.5" fill="#ffd1a9" />
                                    <circle cx="45" cy="28" r="3.5" fill="#ffd1a9" />
                                    {/* Face */}
                                    <circle cx="32" cy="28" r="11" fill="#ffd1a9" />
                                    {/* Hair bangs */}
                                    <path d="M22 21 Q32 16 42 21" stroke="#6f4e37" strokeWidth="4" strokeLinecap="round" />
                                    {/* Eyes */}
                                    <circle cx="28" cy="28" r="1.5" fill="#2d3748" />
                                    <circle cx="36" cy="28" r="1.5" fill="#2d3748" />
                                    {/* Cheeks */}
                                    <circle cx="25" cy="31" r="1.5" fill="#f56565" opacity="0.6" />
                                    <circle cx="39" cy="31" r="1.5" fill="#f56565" opacity="0.6" />
                                    {/* Smile */}
                                    <path d="M30 32 Q32 35 34 32" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                    {/* Neck */}
                                    <rect x="30" y="38" width="4" height="5" fill="#ffd1a9" />
                                    {/* Body (Red Shirt) */}
                                    <path d="M22 43 C22 43 24 60 32 60 C40 60 42 43 42 43 Z" fill="#dc2626" />
                                    {/* Right arm pointing (which is on the right side of SVG) */}
                                    <path d="M42 43 Q54 35 50 31 C47 28 44 32 42 38" fill="#ffd1a9" />
                                    {/* Other Arm */}
                                    <path d="M22 43 Q16 50 18 55" stroke="#ffd1a9" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>

                            {/* Center Title */}
                            <h3 style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#1e293b',
                                margin: '0 auto',
                                padding: '0 40px',
                                lineHeight: '1.4',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                textAlign: 'center'
                            }}>
                                {kidsConfig.title || "Smiles, Giggles, Party Time!"}
                            </h3>
                        </div>

                        {/* Cards Grid */}
                        <div style={{ display: 'flex', gap: '8px', padding: '24px 12px 4px 12px', backgroundColor: '#ffffff', justifyContent: 'center', boxSizing: 'border-box' }}>
                            {displayItems.map((_, idx) => {
                                const img = widgetImages[idx] || meta.defaultImages[idx];
                                const defaultLabel = meta.labels && meta.labels[idx];
                                
                                const slotCfg = kidsConfig.items[idx] || {};
                                const rawLabel = slotCfg.label || defaultLabel || `Age Group ${idx + 1}`;
                                const { main, sub } = splitLabel(rawLabel);

                                return (
                                    <div 
                                        key={idx} 
                                        onClick={(e) => handleKidsItemClick(idx, defaultLabel, img)} 
                                        style={{ 
                                            width: '94px',
                                            height: '115px',
                                            backgroundColor: '#ffffff', 
                                            cursor: 'pointer',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            overflow: 'hidden',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        {/* Card Header Text (Centered age label) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px 0 4px', lineHeight: '1.1' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                {main}
                                            </span>
                                            {sub && (
                                                <span style={{ fontSize: '8px', fontWeight: 600, color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                    {sub}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Image Area at Bottom */}
                                        <div style={{ width: '100%', height: '78px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                                            {img ? (
                                                <img 
                                                    src={img} 
                                                    alt={rawLabel} 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        objectFit: 'cover',
                                                        borderBottomLeftRadius: '15px',
                                                        borderBottomRightRadius: '15px'
                                                    }} 
                                                    loading="lazy" 
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9' }} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            case "Lite_Shopbycategory": {
                const beautyCatMap = [
                    { id: "cat_pers", subId: "sub_bath_oral", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_hair_care", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_cosmetics", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_mens_grooming", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_feminine_hygiene", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_sexual_wellness", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_health_pharmacy", name: "Personal Care" },
                    { id: "cat_pers", subId: "sub_baby_care", name: "Personal Care" }
                ];
                return (
                    <div className="mock-widget-lite-shopbycategory animate-fade">
                        <div className="lite-shopbycategory-header">
                            <h4 className="lite-shopbycategory-title">Beauty &amp; personal care</h4>
                            <MoreVertical size={14} className="lite-shopbycategory-menu-icon" />
                        </div>
                        <div className="lite-shopbycategory-grid">
                            {validImgs.map((_, idx) => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const label = meta.labels[idx];
                                const catItem = beautyCatMap[idx];
                                const slotCfg = liteShopbycategoryConfig[idx] || {};
                                return (
                                    <div
                                        key={idx}
                                        className="lite-shopbycategory-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (slotCfg.categoryId || slotCfg.destProductId) {
                                                if (slotCfg.redirectType === "PRODUCT") {
                                                    if (slotCfg.destProductId) {
                                                        const found = productsMasterList.find(p => p.productId === slotCfg.destProductId);
                                                        if (found) {
                                                            setSelectedProductInSim(found);
                                                        } else {
                                                            setSelectedProductInSim({
                                                                productId: slotCfg.destProductId,
                                                                productName: slotCfg.destProductName,
                                                                price: slotCfg.destPrice || "$0.00",
                                                                discount: slotCfg.destDiscount || "No Discount",
                                                                mainCategoryId: slotCfg.destMainCategory || "cat_pers",
                                                                subCategoryId: slotCfg.destSubCategory || "",
                                                                image: img
                                                            });
                                                        }
                                                        setSimulatorTab("details");
                                                        triggerToast(`Opening Product: ${slotCfg.destProductName}`, "info");
                                                    }
                                                } else {
                                                    setSelectedCategoryInSim(slotCfg.categoryId);
                                                    setSelectedSubCategoryInSim("");
                                                    setSimulatorTab("category");
                                                    triggerToast(`Opening Category: ${slotCfg.categoryName}`, "info");
                                                }
                                            } else {
                                                setSelectedCategoryInSim(catItem.id);
                                                setSelectedSubCategoryInSim(catItem.subId);
                                                setSimulatorTab("category");
                                                triggerToast(`Viewing: ${label}`, "info");
                                            }
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="lite-shopbycategory-img-box">
                                            {img
                                                ? <img src={img} alt={label} loading="lazy" />
                                                : <div className="lite-shopbycategory-placeholder" />
                                            }
                                        </div>
                                        <span className="lite-shopbycategory-label">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            default:
                return null;
        }
    }, [selectedWidgetId, liteBannerConfig, litePromobannerConfig, roomgridConfig, liteBannercarouselConfig, trendingConfig, productConfig, perfumeConfig, kidsConfig, freshmarketConfig, matsConfig, handleLiteBannerClick, handleRoomgridClick, handleLitePromobannerClick, handleLiteBannercarouselClick, handleTrendingItemClick, handleProductSectionItemClick, handlePerfumeItemClick, handleKidsItemClick, handleFreshmarketItemClick, handleMatsItemClick, liteShopbycategoryConfig, productsMasterList, widgetImages]);

    const renderStaticFiller = useCallback(() => {
        let fillerWidgetId;
        if (selectedWidgetId === "productSection") {
            fillerWidgetId = "trendingSection";
        } else if (selectedWidgetId === "trendingSection") {
            fillerWidgetId = "productSection";
        } else if (selectedWidgetId === "matsSection") {
            fillerWidgetId = "productSection";
        } else if (selectedWidgetId === "freshmarketSection") {
            fillerWidgetId = "productSection";
        } else {
            fillerWidgetId = "trendingSection";
        }

        const fillerImagesSource = "DEFAULT";

        return (
            <div style={{ pointerEvents: 'none', userSelect: 'none', marginTop: '16px', borderTop: '1px dashed #e5e7eb', paddingTop: '16px', opacity: 0.85 }}>
                <div style={{ padding: '0 16px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Suggested for You
                    </span>
                </div>
                {renderWidgetMock(fillerWidgetId, fillerImagesSource, false)}
            </div>
        );
    }, [selectedWidgetId, renderWidgetMock]);

    const renderWidgetList = useCallback((widgetIds, imagesSource, isBeforeLabel) => {
        return (
            <div 
                key={selectedWidgetId}
                className="phone-widget-interactive-wrapper editing-highlight"
            >
                {renderWidgetMock(selectedWidgetId, imagesSource, isBeforeLabel)}
            </div>
        );
    }, [selectedWidgetId, renderWidgetMock]);

    // ─── Dynamic Simulator Frame Context Mock ───────────────────────────
    const renderSimulatorContent = useCallback((imagesSource, isBeforeLabel = false) => {
        return (
            <div className="simulator-phone-screen simulator-phone">
                {/* 1. TOP BRAND HEADER GRADIENT BLOCK (MATCHING THE SCREENSHOT EXACTLY) */}
                <div className="phone-brand-header-gradient">
                    {/* Status Bar */}
                    <div className="phone-status-bar">
                        <span className="phone-clock">{phoneTime}</span>
                        <div className="phone-status-icons">
                            <svg className="status-cellular-svg" viewBox="0 0 24 24" width="16" height="12" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                                <rect x="1" y="8" width="2.5" height="4" rx="0.5"/>
                                <rect x="5.5" y="6" width="2.5" height="6" rx="0.5"/>
                                <rect x="10" y="4" width="2.5" height="8" rx="0.5"/>
                                <rect x="14.5" y="2" width="2.5" height="10" rx="0.5"/>
                                <rect x="19" y="0" width="2.5" height="12" rx="0.5"/>
                            </svg>
                            <svg className="status-wifi-svg" viewBox="0 0 24 24" width="14" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                                <path d="M5 12.5a10 10 0 0 1 14 0" />
                                <path d="M8.5 16a5 5 0 0 1 7 0" />
                                <circle cx="12" cy="19.5" r="1" fill="currentColor" />
                            </svg>
                            <div className="phone-battery-capsule">
                                100
                            </div>
                        </div>
                    </div>

                    {(simulatorTab === "home" || simulatorTab === "category") && (
                        <>
                            {/* Brand Selector Cards */}
                            <div className="brand-tabs-row">
                                <div className="brand-tab-card">
                                    <div className="brand-tab-logo">
                                        <img src={haatzaLogo} alt="Haatza Logo" style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <span className="brand-tab-text" style={{ color: '#111827' }}>Haatza</span>
                                </div>
                                <div className="brand-tab-card active-lite">
                                    <div className="brand-tab-logo">
                                        <img src={liteLogo} alt="Lite Logo" style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <span className="brand-tab-text" style={{ color: '#16a34a' }}>Lite</span>
                                </div>
                                <div className="brand-tab-card">
                                    <div className="brand-tab-logo">
                                        <img src={nestLogo} alt="Nest Logo" style={{ height: '26px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <span className="brand-tab-text" style={{ color: '#111827' }}>Nest</span>
                                </div>
                            </div>

                            {/* Address & Fast Delivery Details */}
                            <div className="address-row-container">
                                <div className="address-left-col">
                                    <div className="delivery-time-row">
                                        <span className="delivery-time-text">10 Minutes</span>
                                        <span className="shop-distance-badge">
                                            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '2px' }}>
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            </svg>
                                            480 Meters
                                        </span>
                                    </div>
                                    <div className="delivery-address-text">
                                        <span className="address-building-icon">🏢</span>
                                        <span>123, 131, 1st Main Road, KIADB L...</span>
                                        <span className="address-chevron-icon">⌄</span>
                                    </div>
                                </div>
                                <div className="address-right-col">
                                    <button className="circular-icon-btn">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="21" r="1"/>
                                            <circle cx="20" cy="21" r="1"/>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                        </svg>
                                    </button>
                                    <button className="circular-icon-btn">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                            <line x1="1" y1="10" x2="23" y2="10"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Rounded Search Input Bar */}
                            <div className="search-bar-row" onClick={() => setSimulatorTab("search")} style={{ cursor: 'pointer' }}>
                                <div className="search-bar-input-mock">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="search-icon">
                                        <circle cx="11" cy="11" r="8"/>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <span className="search-placeholder">
                                        {simSearchQuery ? `Search "${simSearchQuery}"` : 'Search "iPhone, groceries, milk..."'}
                                    </span>
                                    <div className="search-right-divider">
                                        <span className="search-divider-line">|</span>
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" className="mic-icon">
                                            <rect x="9" y="3" width="6" height="10" rx="3" fill="#94a3b8"/>
                                            <path d="M5 10a7 7 0 0 0 14 0"/>
                                            <line x1="12" y1="17" x2="12" y2="21"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Horizontal Underlined Categories */}
                            <div className="categories-tab-row">
                                {MOCK_CATEGORIES.map(cat => {
                                    const isActive = selectedCategoryInSim === cat.categoryId && simulatorTab === "category";
                                    return (
                                        <div 
                                            key={cat.categoryId} 
                                            className={`category-tab-item ${isActive ? "active" : ""}`}
                                            onClick={() => {
                                                setSelectedCategoryInSim(cat.categoryId);
                                                setSelectedSubCategoryInSim("");
                                                setSimulatorTab("category");
                                                triggerToast(`Viewing Category: ${cat.categoryName}`, "info");
                                            }}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span className="category-tab-label">{cat.categoryName}</span>
                                            {isActive && <div className="active-category-underline" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* 2. SCROLLABLE FEED / PAGES */}
                {simulatorTab === "home" && (
                    <div className="simulator-scroll-content" ref={phoneBodyRef}>
                        {renderWidgetList(WIDGET_BY_CATEGORY.home, imagesSource, isBeforeLabel)}
                        {renderStaticFiller()}
                    </div>
                )}

                {simulatorTab === "search" && (
                    <div className="simulator-scroll-content sim-search-page">
                        <div className="sim-search-box-row">
                            <div className="sim-search-input-wrap">
                                <Search size={14} className="search-icon" />
                                <input 
                                    type="text"
                                    placeholder="Search products, brands..."
                                    value={simSearchQuery}
                                    onChange={(e) => setSimSearchQuery(e.target.value)}
                                />
                                {simSearchQuery && (
                                    <button 
                                        type="button"
                                        className="btn-clear-selection" 
                                        onClick={() => setSimSearchQuery("")}
                                        style={{ border: 'none', background: 'transparent', padding: '0 4px', cursor: 'pointer' }}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {!simSearchQuery ? (
                            <div className="sim-search-pills-section">
                                <div className="sim-search-section-title">Popular Searches</div>
                                <div className="sim-search-pills-row">
                                    {["iPhone", "MacBook", "Oranges", "Serum", "Air Fryer", "Jacket"].map(pill => (
                                        <span 
                                            key={pill} 
                                            className="sim-search-pill"
                                            onClick={() => setSimSearchQuery(pill)}
                                        >
                                            {pill}
                                        </span>
                                    ))}
                                </div>
                                
                                <div className="sim-search-section-title" style={{ marginTop: '20px' }}>Recommended for You</div>
                                <div className="sim-products-grid">
                                    {productsMasterList.slice(0, 4).map(prod => (
                                        <div 
                                            key={prod.productId} 
                                            className="sim-product-card"
                                            onClick={() => {
                                                setSelectedProductInSim(prod);
                                                setSimulatorTab("details");
                                            }}
                                        >
                                            <div className="sim-card-image-wrap">
                                                <img src={prod.image} alt={prod.productName} />
                                                {prod.discount && prod.discount !== "No Discount" && (
                                                    <span className="sim-card-discount-badge">{prod.discount}</span>
                                                )}
                                            </div>
                                            <div className="sim-card-details">
                                                <div className="sim-card-title">{prod.productName}</div>
                                                <div className="sim-card-rating">⭐ 4.8 <span>(120)</span></div>
                                                <div className="sim-card-price-row">
                                                    <span className="sim-card-price">{prod.price}</span>
                                                    <button 
                                                        type="button" 
                                                        className="sim-card-add-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            triggerToast(`Added ${prod.productName} to Cart!`, "success");
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="sim-search-pills-section">
                                <div className="sim-search-section-title">Search Results ({
                                    productsMasterList.filter(p => 
                                        p.productName.toLowerCase().includes(simSearchQuery.toLowerCase()) ||
                                        p.productId.toLowerCase().includes(simSearchQuery.toLowerCase())
                                    ).length
                                })</div>
                                
                                {productsMasterList.filter(p => 
                                    p.productName.toLowerCase().includes(simSearchQuery.toLowerCase()) ||
                                    p.productId.toLowerCase().includes(simSearchQuery.toLowerCase())
                                ).length > 0 ? (
                                    <div className="sim-products-grid">
                                        {productsMasterList.filter(p => 
                                            p.productName.toLowerCase().includes(simSearchQuery.toLowerCase()) ||
                                            p.productId.toLowerCase().includes(simSearchQuery.toLowerCase())
                                        ).map(prod => (
                                            <div 
                                                key={prod.productId} 
                                                className="sim-product-card"
                                                onClick={() => {
                                                    setSelectedProductInSim(prod);
                                                    setSimulatorTab("details");
                                                }}
                                            >
                                                <div className="sim-card-image-wrap">
                                                    <img src={prod.image} alt={prod.productName} />
                                                    {prod.discount && prod.discount !== "No Discount" && (
                                                        <span className="sim-card-discount-badge">{prod.discount}</span>
                                                    )}
                                                </div>
                                                <div className="sim-card-details">
                                                    <div className="sim-card-title">{prod.productName}</div>
                                                    <div className="sim-card-rating">⭐ 4.8 <span>(98)</span></div>
                                                    <div className="sim-card-price-row">
                                                        <span className="sim-card-price">{prod.price}</span>
                                                        <button 
                                                            type="button" 
                                                            className="sim-card-add-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                triggerToast(`Added ${prod.productName} to Cart!`, "success");
                                                            }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="sim-search-empty-state">
                                        <div className="sim-search-empty-icon">🔍</div>
                                        <div className="sim-search-empty-text">No products match your search</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {simulatorTab === "category" && (
                    <div className="simulator-scroll-content sim-category-page">
                        <div className="sim-category-tabs-container">
                            <div className="sim-category-tabs-row">
                                {MOCK_CATEGORIES.map(cat => (
                                    <span 
                                        key={cat.categoryId}
                                        className={`sim-cat-tab-pill ${selectedCategoryInSim === cat.categoryId ? "active" : ""}`}
                                        onClick={() => {
                                            setSelectedCategoryInSim(cat.categoryId);
                                            setSelectedSubCategoryInSim("");
                                        }}
                                    >
                                        {cat.categoryName}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {renderWidgetList(WIDGET_BY_CATEGORY.category, imagesSource, isBeforeLabel)}
                        <div className="sim-category-banner">
                            <h3>{selectedSubCategoryInSim 
                                ? formatSubCategory(selectedSubCategoryInSim) 
                                : (MOCK_CATEGORIES.find(c => c.categoryId === selectedCategoryInSim)?.categoryName || "Category Feed")}</h3>
                            <p>Showing curated products verified by Haatza</p>
                        </div>

                        {productsMasterList.filter(p => {
                            if (selectedSubCategoryInSim) {
                                return p.subCategoryId === selectedSubCategoryInSim;
                            }
                            return p.mainCategoryId === selectedCategoryInSim;
                        }).length > 0 ? (
                            <div className="sim-products-grid animate-fade">
                                {productsMasterList.filter(p => {
                                    if (selectedSubCategoryInSim) {
                                        return p.subCategoryId === selectedSubCategoryInSim;
                                    }
                                    return p.mainCategoryId === selectedCategoryInSim;
                                }).map(prod => (
                                    <div 
                                        key={prod.productId} 
                                        className="sim-product-card"
                                        onClick={() => {
                                            setSelectedProductInSim(prod);
                                            setSimulatorTab("details");
                                        }}
                                    >
                                        <div className="sim-card-image-wrap">
                                            <img src={prod.image} alt={prod.productName} />
                                            {prod.discount && prod.discount !== "No Discount" && (
                                                <span className="sim-card-discount-badge">{prod.discount}</span>
                                            )}
                                        </div>
                                        <div className="sim-card-details">
                                            <div className="sim-card-title">{prod.productName}</div>
                                            <div className="sim-card-rating">⭐ 4.7 <span>(64)</span></div>
                                            <div className="sim-card-price-row">
                                                <span className="sim-card-price">{prod.price}</span>
                                                <button 
                                                    type="button" 
                                                    className="sim-card-add-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        triggerToast(`Added ${prod.productName} to Cart!`, "success");
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="sim-search-empty-state">
                                <div className="sim-search-empty-icon">📦</div>
                                <div className="sim-search-empty-text">No products in this category yet.</div>
                            </div>
                        )}
                    </div>
                )}

                {simulatorTab === "details" && (
                    <div className="simulator-scroll-content sim-details-page">
                        <div className="sim-page-header">
                            <button type="button" className="sim-back-btn" onClick={() => setSimulatorTab("home")}>←</button>
                            <span className="sim-page-header-title">Product Details</span>
                        </div>
                        {selectedProductInSim && (
                            <div className="animate-fade">
                                <div className="sim-details-image-container">
                                    <img src={selectedProductInSim.image || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80"} alt={selectedProductInSim.productName} />
                                </div>
                                <div className="sim-details-content-card">
                                    <span className="sim-details-badge">100% Authentic</span>
                                    <h3 className="sim-details-title">{selectedProductInSim.productName}</h3>
                                    <div className="sim-details-rating-row">
                                        ⭐ 4.8 <span>(234 customer reviews)</span>
                                    </div>
                                    
                                    <div className="sim-details-price-card">
                                        <div className="sim-details-price-row">
                                            <span className="sim-details-price">{selectedProductInSim.price}</span>
                                            {selectedProductInSim.discount && selectedProductInSim.discount !== "No Discount" && (
                                                <>
                                                    <span className="sim-details-orig-price">
                                                        {selectedProductInSim.price.startsWith("₹") 
                                                            ? "₹" + Math.round(parseInt(selectedProductInSim.price.replace(/[^\d]/g, "") || "100") * 1.15).toLocaleString()
                                                            : "$" + Math.round(parseFloat(selectedProductInSim.price.replace(/[^\d.]/g, "") || "100") * 1.15)
                                                        }
                                                    </span>
                                                    <span className="sim-details-discount-pill">{selectedProductInSim.discount}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="sim-details-delivery-info">🚚 Fast 10-minute delivery to your current location</div>
                                    </div>
                                    
                                    <div className="sim-details-meta-section">
                                        <div className="sim-details-meta-item">Product ID: <strong>{selectedProductInSim.productId}</strong></div>
                                        <div className="sim-details-meta-item">SKU: <strong>{selectedProductInSim.sku || "N/A"}</strong></div>
                                        <div className="sim-details-meta-item">Category: <strong>{MOCK_CATEGORIES.find(c => c.categoryId === selectedProductInSim.mainCategoryId)?.categoryName || selectedProductInSim.mainCategoryId}</strong></div>
                                        <div className="sim-details-meta-item">Sub-category: <strong>{formatSubCategory(selectedProductInSim.subCategoryId)}</strong></div>
                                    </div>
                                    
                                    <div className="sim-details-desc-title">Product Description</div>
                                    <p className="sim-details-desc-text">
                                        Experience premium high-end quality from the Haatza catalog. This product features double QC certification, premium packaging, and fast customer assistance for an absolute elite buying experience.
                                    </p>
                                    
                                    <div className="sim-details-action-bar">
                                        <button type="button" className="sim-add-cart-btn" onClick={() => triggerToast("Added to Cart!", "success")}>Add to Cart</button>
                                        <button type="button" className="sim-buy-btn" onClick={() => triggerToast("Processing Order...", "info")}>Buy Now</button>
                                    </div>
                                </div>
                                {renderWidgetList(WIDGET_BY_CATEGORY.details, imagesSource, isBeforeLabel)}
                            </div>
                        )}
                    </div>
                )}

                {simulatorTab === "listing" && (
                    <div className="simulator-scroll-content sim-listing-page">
                        <div className="sim-page-header">
                            <button type="button" className="sim-back-btn" onClick={() => setSimulatorTab("home")}>←</button>
                            <span className="sim-page-header-title">Product Listing</span>
                        </div>
                        {renderWidgetList(WIDGET_BY_CATEGORY.listing, imagesSource, isBeforeLabel)}
                        {renderStaticFiller()}
                    </div>
                )}

                {simulatorTab === "promotions" && (
                    <div className="simulator-scroll-content sim-promotions-page">
                        <div className="sim-page-header">
                            <button type="button" className="sim-back-btn" onClick={() => setSimulatorTab("home")}>←</button>
                            <span className="sim-page-header-title">Promotions & Offers</span>
                        </div>
                        {renderWidgetList(WIDGET_BY_CATEGORY.promotions, imagesSource, isBeforeLabel)}
                        {renderStaticFiller()}
                    </div>
                )}

                {simulatorTab === "orders" && (
                    <div className="simulator-scroll-content sim-orders-page">
                        <div className="sim-page-header" style={{ margin: '-16px -16px 12px -16px', borderBottom: 'none' }}>
                            <button type="button" className="sim-back-btn" onClick={() => setSimulatorTab("home")}>←</button>
                            <span className="sim-page-header-title">My Orders</span>
                        </div>
                        
                        <div className="sim-order-card">
                            <div className="sim-order-header">
                                <span className="sim-order-id">Order #HTZ-9028-11</span>
                                <span className="sim-order-status">In Transit</span>
                            </div>
                            <div className="sim-order-product-row">
                                <img src={productsMasterList[0]?.image} className="sim-order-product-thumb" alt="Product" />
                                <div className="sim-order-product-info">
                                    <div className="sim-order-product-name">{productsMasterList[0]?.productName}</div>
                                    <div className="sim-order-product-price">Qty: 1 • {productsMasterList[0]?.price}</div>
                                </div>
                            </div>
                            
                            <div className="sim-order-timeline">
                                <div className="sim-timeline-step">
                                    <div className="sim-timeline-dot completed" />
                                    <div className="sim-timeline-text">
                                        <div className="sim-timeline-title">Out for Delivery</div>
                                        <div className="sim-timeline-time">Today, 3:32 PM</div>
                                    </div>
                                </div>
                                <div className="sim-timeline-step">
                                    <div className="sim-timeline-dot completed" />
                                    <div className="sim-timeline-text">
                                        <div className="sim-timeline-title">Arrived at Local Hub</div>
                                        <div className="sim-timeline-time">Today, 2:10 PM</div>
                                    </div>
                                </div>
                                <div className="sim-timeline-step">
                                    <div className="sim-timeline-dot completed" />
                                    <div className="sim-timeline-text">
                                        <div className="sim-timeline-title">Shipped from Warehouse</div>
                                        <div className="sim-timeline-time">Yesterday, 8:45 PM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {simulatorTab === "profile" && (
                    <div className="simulator-scroll-content sim-profile-page">
                        <div className="sim-profile-card">
                            <div className="sim-profile-avatar">HA</div>
                            <div className="sim-profile-name">Haatza Seller Admin</div>
                            <div className="sim-profile-email">admin@haatza.com</div>
                        </div>
                        
                        <div className="sim-profile-menu-section">
                            {["My Profile Details", "Manage Shipping Addresses", "Payment Configurations", "CMS Settings Helper", "Help & Support Center"].map(item => (
                                <div key={item} className="sim-profile-menu-item" onClick={() => triggerToast(`Clicked: ${item}`, "info")}>
                                    <span>{item}</span>
                                    <span>❯</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. SIMULATOR SYSTEM BOTTOM BUTTON BAR */}
                <div className="phone-nav-footer">
                    <div className={`phone-nav-btn ${simulatorTab === "home" ? "active" : ""}`} onClick={() => setSimulatorTab("home")}>🏠<span>Home</span></div>
                    <div className={`phone-nav-btn ${simulatorTab === "search" ? "active" : ""}`} onClick={() => setSimulatorTab("search")}>🔍<span>Search</span></div>
                    <div className={`phone-nav-btn ${simulatorTab === "category" ? "active" : ""}`} onClick={() => setSimulatorTab("category")}>📁<span>Category</span></div>
                    <div className={`phone-nav-btn ${simulatorTab === "orders" ? "active" : ""}`} onClick={() => setSimulatorTab("orders")}>📦<span>Orders</span></div>
                    <div className={`phone-nav-btn ${simulatorTab === "profile" ? "active" : ""}`} onClick={() => setSimulatorTab("profile")}>👤<span>Profile</span></div>
                </div>
                
                {/* 6. APPLE INDICATOR BAR */}
                <div className="phone-home-indicator" />
            </div>
        );
    }, [selectedCat, selectedWidgetId, phoneTime, activeMeta, renderWidgetMock, renderWidgetList, renderStaticFiller, simulatorTab, simSearchQuery, selectedCategoryInSim, selectedProductInSim, productsMasterList]);

    return (
        <div className="manage-preview-container fade-in">
            {/* ─── Header Section ─── */}
            <div className="page-header-row">
                <div className="header-left">
                    <div className="header-breadcrumbs">
                        <span>Dashboard</span>
                        <ChevronRight size={12} />
                        <span className="active">Widget Preview Manager</span>
                    </div>
                    <h1>Manage Preview</h1>
                    <p className="subtitle">Upload high-resolution assets, perform validation checks, and verify customer mobile layouts</p>
                </div>
                <div className="header-right-actions">
                    <button className="btn-secondary" onClick={handleSaveDraft}>
                        <Save size={15} />
                        <span>Save Draft</span>
                    </button>
                    <button className="btn-primary" onClick={handlePublishClick}>
                        <CheckCircle size={15} />
                        <span>Publish Widget</span>
                    </button>
                </div>
            </div>

            {/* ─── 2-Column Core Layout ─── */}
            <div className="editor-columns-grid">
                {/* LEFT CONFIGURATION PANEL (40%) */}
                <div className="configuration-panel-card">
                    <div className="panel-header">
                        <h2>Configuration Panel</h2>
                        <span className="active-dot" />
                    </div>

                    <div className="panel-body">

                        {/* ─── WIDGET SELECTOR ─── */}
                        <div className="widget-selector-section">
                            <div className="widget-selector-row">
                                <div className="form-group-wrap" style={{ flex: 1 }}>
                                    <label className="form-field-label">Page Category</label>
                                    <select
                                        className="styled-select"
                                        value={selectedCat}
                                        onChange={handleCategoryChange}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group-wrap" style={{ flex: 1 }}>
                                    <label className="form-field-label">Active Widget</label>
                                    <select
                                        className="styled-select"
                                        value={selectedWidgetId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedWidgetId(val);
                                        }}
                                    >
                                        {Object.keys(WIDGET_METADATA).map(wid => (
                                            <option key={wid} value={wid}>{WIDGET_METADATA[wid]?.name || wid}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Widget Info Strip */}
                            <div className="widget-info-strip">
                                <div className="widget-info-item">
                                    <span className="widget-info-label">Resolution</span>
                                    <span className="widget-info-value">{activeMeta.resolution.display}</span>
                                </div>
                                <div className="widget-info-item">
                                    <span className="widget-info-label">Slots</span>
                                    <span className="widget-info-value">{activeMeta.requiredCount}</span>
                                </div>
                                <div className="widget-info-item">
                                    <span className="widget-info-label">Max Size</span>
                                    <span className="widget-info-value">{activeMeta.maxSizeDisplay}</span>
                                </div>
                                <div className="widget-info-item">
                                    <span className="widget-info-label">Formats</span>
                                    <span className="widget-info-value">{activeMeta.formatsDisplay}</span>
                                </div>
                            </div>
                        </div>

                        {selectedWidgetId === "Lite_Banner" && (() => {
                            const imgUrl = widgetImages[0];
                            const isExpanded = liteBannerExpandedSlot === 0;
                            const isUploaded = imgUrl !== null && imgUrl !== undefined && imgUrl !== "";
                            const hasLink = liteBannerConfig.categoryId || liteBannerConfig.destProductId;

                            return (
                                <div className="lite-shopbycategory-config-section animate-fade">
                                    <div className="config-section-header">
                                        <h3>Lite Banner Configuration</h3>
                                        <span className="cms-badge" style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', color: '#fff' }}>Single Banner</span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="widget-slot-stats-row" style={{ marginBottom: '4px' }}>
                                        <div className="slot-stat-chip uploaded">
                                            <span className="chip-num">{stats.uploaded}</span>
                                            <span className="chip-label">Images Uploaded</span>
                                        </div>
                                        <div className="slot-stat-chip pending">
                                            <span className="chip-num">{stats.pending}</span>
                                            <span className="chip-label">Pending</span>
                                        </div>
                                        <div className="slot-stat-chip total">
                                            <span className="chip-num">
                                                {hasLink ? 1 : 0}
                                            </span>
                                            <span className="chip-label">Links Configured</span>
                                        </div>
                                    </div>

                                    <div className="lite-shopbycategory-slots-accordion">
                                        <div className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${Object.keys(liteBannerErrors).length > 0 ? 'has-errors' : ''}`}>
                                            {/* Accordion Header */}
                                            <div
                                                className="lite-shopbycategory-slot-accordion-header"
                                                onClick={() => setLiteBannerExpandedSlot(isExpanded ? null : 0)}
                                            >
                                                <div className="lite-shopbycategory-slot-thumb-wrap">
                                                    {isUploaded
                                                        ? <img src={imgUrl} alt="Banner" className="lite-shopbycategory-slot-thumb" />
                                                        : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>
                                                    }
                                                </div>
                                                <div className="lite-shopbycategory-slot-header-info">
                                                    <span className="lite-shopbycategory-slot-label-name">Main Banner</span>
                                                    <div className="lite-shopbycategory-slot-status-row">
                                                        <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>
                                                            {isUploaded ? '✓ Image' : '✗ No Image'}
                                                        </span>
                                                        <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>
                                                            {hasLink
                                                                ? (liteBannerConfig.redirectType === 'PRODUCT'
                                                                    ? `→ ${liteBannerConfig.destProductName ? liteBannerConfig.destProductName.substring(0, 18) + '...' : 'Product'}`
                                                                    : `→ ${liteBannerConfig.categoryName || 'Category'}`)
                                                                : '✗ No Link'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="lite-shopbycategory-slot-expand-icon">
                                                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                </div>
                                            </div>

                                            {/* Accordion Body */}
                                            {isExpanded && (
                                                <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                    {/* Step 1: Banner Image */}
                                                    <div className="lite-shopbycategory-slot-step">
                                                        <div className="lite-shopbycategory-slot-step-title">
                                                            <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>1</span>
                                                            <span>Banner Image</span>
                                                            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>1200×600 px • max 2 MB</span>
                                                        </div>
                                                        <div className="lite-shopbycategory-slot-img-upload-area">
                                                            {isUploaded ? (
                                                                <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                    <img src={imgUrl} alt="Banner" />
                                                                    <div className="lite-shopbycategory-slot-img-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="slot-action-btn upload-btn"
                                                                            onClick={() => handleReplaceClick(0)}
                                                                        >
                                                                            <RefreshCw size={12} /> Replace
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="slot-action-btn delete-btn"
                                                                            onClick={() => handleDeleteClick(0)}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="lite-shopbycategory-slot-upload-dropzone"
                                                                    onClick={() => handleReplaceClick(0)}
                                                                >
                                                                    <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Upload Banner Image</span>
                                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, WEBP • 1200×600 px</span>
                                                                </div>
                                                            )}
                                                            <input
                                                                type="file"
                                                                id="file-input-0"
                                                                style={{ display: "none" }}
                                                                accept="image/png, image/jpeg, image/webp"
                                                                onChange={(e) => handleFileChange(e, 0)}
                                                            />
                                                        </div>
                                                        {liteBannerErrors.bannerImage && (
                                                            <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <AlertTriangle size={12} />
                                                                {liteBannerErrors.bannerImage}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Step 2: Redirect Destination */}
                                                    <div className="lite-shopbycategory-slot-step">
                                                        <div className="lite-shopbycategory-slot-step-title">
                                                            <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>2</span>
                                                            <span>Redirect Destination</span>
                                                        </div>

                                                        {/* Redirect Type Toggle */}
                                                        <div className="modern-segmented-control" style={{ marginBottom: '12px' }}>
                                                            <button
                                                                type="button"
                                                                className={`segment-btn ${liteBannerConfig.redirectType === 'CATEGORY' ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setLiteBannerConfig(p => ({
                                                                        ...p,
                                                                        redirectType: "CATEGORY",
                                                                        categoryId: "",
                                                                        categoryName: "",
                                                                        destProductId: "",
                                                                        destProductName: "",
                                                                        destPrice: "",
                                                                        destDiscount: "",
                                                                        destMainCategory: "",
                                                                        destSubCategory: ""
                                                                    }));
                                                                    setLiteBannerErrors(prev => {
                                                                        const next = { ...prev };
                                                                        delete next.categoryId;
                                                                        delete next.destProductId;
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                Category Page
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`segment-btn ${liteBannerConfig.redirectType === 'PRODUCT' ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setLiteBannerConfig(p => ({
                                                                        ...p,
                                                                        redirectType: "PRODUCT",
                                                                        categoryId: "",
                                                                        categoryName: "",
                                                                        destProductId: "",
                                                                        destProductName: "",
                                                                        destPrice: "",
                                                                        destDiscount: "",
                                                                        destMainCategory: "",
                                                                        destSubCategory: ""
                                                                    }));
                                                                    setLiteBannerErrors(prev => {
                                                                        const next = { ...prev };
                                                                        delete next.categoryId;
                                                                        delete next.destProductId;
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                Product Page
                                                            </button>
                                                        </div>

                                                        {/* Category Redirect */}
                                                        {liteBannerConfig.redirectType === 'CATEGORY' && (
                                                            <div className="form-group-wrap animate-fade">
                                                                <label className="form-field-label">Select Category</label>
                                                                <SearchableSelect
                                                                    placeholder="Search category..."
                                                                    options={(categoriesList.length > 0 ? categoriesList : MOCK_CATEGORIES).map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                    value={liteBannerConfig.categoryId}
                                                                    onChange={(val, option) => {
                                                                        setLiteBannerConfig(p => ({ ...p, categoryId: val, categoryName: option ? option.label : "" }));
                                                                        setLiteBannerErrors(prev => {
                                                                            const next = { ...prev };
                                                                            delete next.categoryId;
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                                {liteBannerErrors.categoryId && (
                                                                    <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <AlertTriangle size={12} />
                                                                        {liteBannerErrors.categoryId}
                                                                    </div>
                                                                )}
                                                                {liteBannerConfig.categoryId && (
                                                                    <div className="selected-info-display-card category-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                        <div className="display-card-title">Selected Category</div>
                                                                        <div className="display-card-body">
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">Name:</span>
                                                                                <strong className="info-val">{liteBannerConfig.categoryName}</strong>
                                                                            </div>
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">ID:</span>
                                                                                <strong className="info-val code-font">{liteBannerConfig.categoryId}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Product Redirect */}
                                                        {liteBannerConfig.redirectType === 'PRODUCT' && (
                                                            <div className="form-group-wrap animate-fade">
                                                                <label className="form-field-label">Select Product</label>
                                                                <SearchableSelect
                                                                    placeholder="Search product by name or SKU..."
                                                                    options={productsMasterList.map(prod => ({ value: prod.productId, label: prod.productName, sku: prod.sku, price: prod.price, discount: prod.discount, image: prod.image, mainCategoryId: prod.mainCategoryId, subCategoryId: prod.subCategoryId }))}
                                                                    value={liteBannerConfig.destProductId}
                                                                    onChange={(val, option) => {
                                                                        setLiteBannerConfig(p => ({
                                                                            ...p,
                                                                            destProductId: val,
                                                                            destProductName: option ? option.label : "",
                                                                            destPrice: option ? option.price : "",
                                                                            destDiscount: option ? option.discount : "",
                                                                            destMainCategory: option ? option.mainCategoryId : "",
                                                                            destSubCategory: option ? option.subCategoryId : ""
                                                                        }));
                                                                        setLiteBannerErrors(prev => {
                                                                            const next = { ...prev };
                                                                            delete next.destProductId;
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                                {liteBannerErrors.destProductId && (
                                                                    <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <AlertTriangle size={12} />
                                                                        {liteBannerErrors.destProductId}
                                                                    </div>
                                                                )}
                                                                {liteBannerConfig.destProductId && (
                                                                    <div className="selected-info-display-card product-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                        <div className="display-card-title">Selected Product</div>
                                                                        <div className="display-card-body">
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">Name:</span>
                                                                                <strong className="info-val">{liteBannerConfig.destProductName}</strong>
                                                                            </div>
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">ID:</span>
                                                                                <strong className="info-val code-font">{liteBannerConfig.destProductId}</strong>
                                                                            </div>
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">Price:</span>
                                                                                <strong className="info-val">{liteBannerConfig.destPrice}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Configuration Summary */}
                                    <div className="cms-step-card summary-card" style={{ marginTop: '16px' }}>
                                        <div className="cms-step-header">
                                            <span className="step-num">✓</span>
                                            <h4>Configuration Summary</h4>
                                        </div>
                                        <div className="cms-step-content">
                                            <div className="summary-display-box">
                                                <div className="summary-row">
                                                    <span className="summary-label">Widget:</span>
                                                    <strong className="summary-value">Lite Banner</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Image:</span>
                                                    <strong className="summary-value text-ellipsis" title={imageMetadata[0]?.name || "Not selected"}>
                                                        {imageMetadata[0]?.name || "Not selected"}
                                                    </strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Redirect:</span>
                                                    <strong className="summary-value">{liteBannerConfig.redirectType === "CATEGORY" ? "Category Page" : "Product Page"}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Destination:</span>
                                                    <strong className="summary-value text-ellipsis" title={liteBannerConfig.redirectType === "CATEGORY" ? (liteBannerConfig.categoryName || "Not selected") : (liteBannerConfig.destProductName || "Not selected")}>
                                                        {liteBannerConfig.redirectType === "CATEGORY" ? (liteBannerConfig.categoryName || "Not selected") : (liteBannerConfig.destProductName || "Not selected")}
                                                    </strong>
                                                </div>
                                                <div className="summary-row status-row">
                                                    <span className="summary-label">Status:</span>
                                                    {(() => {
                                                        const hasImage = widgetImages[0] !== null && widgetImages[0] !== undefined && widgetImages[0] !== "";
                                                        const hasErrors = Object.keys(validateLiteBannerForm()).length > 0;
                                                        const isReady = hasImage && !hasErrors;
                                                        return (
                                                            <span className={`summary-status-badge ${isReady ? "ready" : "incomplete"}`}>
                                                                {isReady ? "Ready To Publish" : "Incomplete"}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {selectedWidgetId === "Lite_Promobanner" && (() => {
                            const imgUrl = widgetImages[0];
                            const isExpanded = litePromobannerExpandedSlot === 0;
                            const isUploaded = imgUrl !== null && imgUrl !== undefined && imgUrl !== "";
                            const hasLink = litePromobannerConfig.categoryId || litePromobannerConfig.destProductId;

                            return (
                                <div className="lite-shopbycategory-config-section animate-fade">
                                    <div className="config-section-header">
                                        <h3>Lite Promobanner Configuration</h3>
                                        <span className="cms-badge" style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', color: '#fff' }}>Promo Card</span>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="widget-slot-stats-row" style={{ marginBottom: '4px' }}>
                                        <div className="slot-stat-chip uploaded">
                                            <span className="chip-num">{stats.uploaded}</span>
                                            <span className="chip-label">Images Uploaded</span>
                                        </div>
                                        <div className="slot-stat-chip pending">
                                            <span className="chip-num">{stats.pending}</span>
                                            <span className="chip-label">Pending</span>
                                        </div>
                                        <div className="slot-stat-chip total">
                                            <span className="chip-num">
                                                {hasLink ? 1 : 0}
                                            </span>
                                            <span className="chip-label">Links Configured</span>
                                        </div>
                                    </div>

                                    <div className="lite-shopbycategory-slots-accordion">
                                        <div className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${Object.keys(litePromobannerErrors).length > 0 ? 'has-errors' : ''}`}>
                                            {/* Accordion Header */}
                                            <div
                                                className="lite-shopbycategory-slot-accordion-header"
                                                onClick={() => setLitePromobannerExpandedSlot(isExpanded ? null : 0)}
                                            >
                                                <div className="lite-shopbycategory-slot-thumb-wrap">
                                                    {isUploaded
                                                        ? <img src={imgUrl} alt="Promo" className="lite-shopbycategory-slot-thumb" />
                                                        : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>
                                                    }
                                                </div>
                                                <div className="lite-shopbycategory-slot-header-info">
                                                    <span className="lite-shopbycategory-slot-label-name">Main Promobanner</span>
                                                    <div className="lite-shopbycategory-slot-status-row">
                                                        <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>
                                                            {isUploaded ? '✓ Image' : '✗ No Image'}
                                                        </span>
                                                        <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>
                                                            {hasLink
                                                                ? (litePromobannerConfig.redirectType === 'PRODUCT'
                                                                    ? `→ ${litePromobannerConfig.destProductName ? litePromobannerConfig.destProductName.substring(0, 18) + '...' : 'Product'}`
                                                                    : `→ ${litePromobannerConfig.categoryName || 'Category'}`)
                                                                : '✗ No Link'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="lite-shopbycategory-slot-expand-icon">
                                                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                </div>
                                            </div>

                                            {/* Accordion Body */}
                                            {isExpanded && (
                                                <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                    {/* Step 1: Promo Image */}
                                                    <div className="lite-shopbycategory-slot-step">
                                                        <div className="lite-shopbycategory-slot-step-title">
                                                            <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>1</span>
                                                            <span>Promo Image</span>
                                                            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>1080×1080 px • max 1.5 MB</span>
                                                        </div>
                                                        <div className="lite-shopbycategory-slot-img-upload-area">
                                                            {isUploaded ? (
                                                                <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                    <img src={imgUrl} alt="Promo" />
                                                                    <div className="lite-shopbycategory-slot-img-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="slot-action-btn upload-btn"
                                                                            onClick={() => handleReplaceClick(0)}
                                                                        >
                                                                            <RefreshCw size={12} /> Replace
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="slot-action-btn delete-btn"
                                                                            onClick={() => handleDeleteClick(0)}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="lite-shopbycategory-slot-upload-dropzone"
                                                                    onClick={() => handleReplaceClick(0)}
                                                                >
                                                                    <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Upload Promo Image</span>
                                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, WEBP • 1080×1080 px</span>
                                                                </div>
                                                            )}
                                                            <input
                                                                type="file"
                                                                id="file-input-0"
                                                                style={{ display: "none" }}
                                                                accept="image/png, image/jpeg, image/webp"
                                                                onChange={(e) => handleFileChange(e, 0)}
                                                            />
                                                        </div>
                                                        {litePromobannerErrors.bannerImage && (
                                                            <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <AlertTriangle size={12} />
                                                                {litePromobannerErrors.bannerImage}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Step 2: Content Details */}
                                                    <div className="lite-shopbycategory-slot-step">
                                                        <div className="lite-shopbycategory-slot-step-title">
                                                            <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>2</span>
                                                            <span>Content Details</span>
                                                        </div>
                                                        <div className="form-group-wrap" style={{ marginBottom: '12px' }}>
                                                            <label className="form-field-label">Headline / Title *</label>
                                                            <input
                                                                type="text"
                                                                className={`styled-input ${litePromobannerErrors.title ? 'has-error' : ''}`}
                                                                value={litePromobannerConfig.title}
                                                                onChange={e => {
                                                                    setLitePromobannerConfig(p => ({ ...p, title: e.target.value }));
                                                                    setLitePromobannerErrors(prev => {
                                                                        const next = { ...prev };
                                                                        delete next.title;
                                                                        return next;
                                                                    });
                                                                }}
                                                            />
                                                            {litePromobannerErrors.title && (
                                                                <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <AlertTriangle size={12} />
                                                                    {litePromobannerErrors.title}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="form-group-wrap" style={{ marginBottom: '12px' }}>
                                                            <label className="form-field-label">Subtitle / Description</label>
                                                            <textarea
                                                                className="styled-input"
                                                                style={{ minHeight: '60px', fontFamily: 'inherit', padding: '8px' }}
                                                                value={litePromobannerConfig.description}
                                                                onChange={e => setLitePromobannerConfig(p => ({ ...p, description: e.target.value }))}
                                                            />
                                                        </div>
                                                        <div className="form-group-wrap">
                                                            <label className="form-field-label">Button CTA Text</label>
                                                            <input
                                                                type="text"
                                                                className="styled-input"
                                                                value={litePromobannerConfig.ctaText}
                                                                onChange={e => setLitePromobannerConfig(p => ({ ...p, ctaText: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Step 3: Redirect Destination */}
                                                    <div className="lite-shopbycategory-slot-step">
                                                        <div className="lite-shopbycategory-slot-step-title">
                                                            <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>3</span>
                                                            <span>Redirect Destination</span>
                                                        </div>

                                                        {/* Redirect Type Toggle */}
                                                        <div className="modern-segmented-control" style={{ marginBottom: '12px' }}>
                                                            <button
                                                                type="button"
                                                                className={`segment-btn ${litePromobannerConfig.redirectType === 'CATEGORY' ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setLitePromobannerConfig(p => ({
                                                                        ...p,
                                                                        redirectType: "CATEGORY",
                                                                        categoryId: "",
                                                                        categoryName: "",
                                                                        destProductId: "",
                                                                        destProductName: "",
                                                                        destPrice: "",
                                                                        destDiscount: "",
                                                                        destMainCategory: "",
                                                                        destSubCategory: ""
                                                                    }));
                                                                    setLitePromobannerErrors(prev => {
                                                                        const next = { ...prev };
                                                                        delete next.destination;
                                                                        delete next.destProductId;
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                Category Page
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`segment-btn ${litePromobannerConfig.redirectType === 'PRODUCT' ? 'active' : ''}`}
                                                                onClick={() => {
                                                                    setLitePromobannerConfig(p => ({
                                                                        ...p,
                                                                        redirectType: "PRODUCT",
                                                                        categoryId: "",
                                                                        categoryName: "",
                                                                        destProductId: "",
                                                                        destProductName: "",
                                                                        destPrice: "",
                                                                        destDiscount: "",
                                                                        destMainCategory: "",
                                                                        destSubCategory: ""
                                                                    }));
                                                                    setLitePromobannerErrors(prev => {
                                                                        const next = { ...prev };
                                                                        delete next.destination;
                                                                        delete next.destProductId;
                                                                        return next;
                                                                    });
                                                                }}
                                                            >
                                                                Product Page
                                                            </button>
                                                        </div>

                                                        {/* Category Redirect */}
                                                        {litePromobannerConfig.redirectType === 'CATEGORY' && (
                                                            <div className="form-group-wrap animate-fade">
                                                                <label className="form-field-label">Select Category</label>
                                                                <SearchableSelect
                                                                    placeholder="Search category..."
                                                                    options={(categoriesList.length > 0 ? categoriesList : MOCK_CATEGORIES).map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                    value={litePromobannerConfig.categoryId}
                                                                    onChange={(val, option) => {
                                                                        setLitePromobannerConfig(p => ({ ...p, categoryId: val, categoryName: option ? option.label : "" }));
                                                                        setLitePromobannerErrors(prev => {
                                                                            const next = { ...prev };
                                                                            delete next.destination;
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                                {litePromobannerErrors.destination && (
                                                                    <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <AlertTriangle size={12} />
                                                                        {litePromobannerErrors.destination}
                                                                    </div>
                                                                )}
                                                                {litePromobannerConfig.categoryId && (
                                                                    <div className="selected-info-display-card category-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                        <div className="display-card-title">Selected Category</div>
                                                                        <div className="display-card-body">
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">Name:</span>
                                                                                <strong className="info-val">{litePromobannerConfig.categoryName}</strong>
                                                                            </div>
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">ID:</span>
                                                                                <strong className="info-val code-font">{litePromobannerConfig.categoryId}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Product Redirect */}
                                                        {litePromobannerConfig.redirectType === 'PRODUCT' && (
                                                            <div className="form-group-wrap animate-fade">
                                                                <label className="form-field-label">Search Product</label>
                                                                <div className="product-search-box-wrapper">
                                                                    <div className="product-search-input-container">
                                                                        <Search size={14} className="search-icon" />
                                                                        <input
                                                                            type="text"
                                                                            className="styled-select search-input"
                                                                            placeholder="Search products..."
                                                                            value={litePromobannerProductSearch}
                                                                            onChange={(e) => setLitePromobannerProductSearch(e.target.value)}
                                                                        />
                                                                        {litePromobannerProductSearch && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn-clear-selection"
                                                                                onClick={() => setLitePromobannerProductSearch("")}
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {litePromobannerErrors.destProductId && (
                                                                        <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <AlertTriangle size={12} />
                                                                            {litePromobannerErrors.destProductId}
                                                                        </div>
                                                                    )}
                                                                    {litePromobannerProductSearch && (
                                                                        <div className="product-search-results-list">
                                                                            {productsMasterList
                                                                                .filter(p => p.productName.toLowerCase().includes(litePromobannerProductSearch.toLowerCase()) || p.productId.toLowerCase().includes(litePromobannerProductSearch.toLowerCase()))
                                                                                .map(prod => (
                                                                                    <div key={prod.productId} className="product-search-item-card">
                                                                                        <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                        <div className="product-item-details">
                                                                                            <div className="product-item-name">{prod.productName}</div>
                                                                                            <div className="product-item-id">ID: {prod.productId}</div>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn-select-product"
                                                                                            onClick={() => {
                                                                                                setLitePromobannerConfig(prev => ({
                                                                                                    ...prev,
                                                                                                    destProductId: prod.productId,
                                                                                                    destProductName: prod.productName,
                                                                                                    destPrice: prod.price,
                                                                                                    destDiscount: prod.discount,
                                                                                                    destMainCategory: prod.mainCategoryId,
                                                                                                    destSubCategory: prod.subCategoryId
                                                                                                }));
                                                                                                setLitePromobannerProductSearch("");
                                                                                                setLitePromobannerErrors(prev => {
                                                                                                    const next = { ...prev };
                                                                                                    delete next.destProductId;
                                                                                                    return next;
                                                                                                });
                                                                                            }}
                                                                                        >
                                                                                            Load
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {litePromobannerConfig.destProductId && (
                                                                    <div className="selected-info-display-card product-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                        <div className="display-card-title">Selected Product</div>
                                                                        <div className="display-card-body">
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">Name:</span>
                                                                                <strong className="info-val">{litePromobannerConfig.destProductName}</strong>
                                                                            </div>
                                                                            <div className="display-info-row">
                                                                                <span className="info-label">ID:</span>
                                                                                <strong className="info-val code-font">{litePromobannerConfig.destProductId}</strong>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Configuration Summary */}
                                    <div className="cms-step-card summary-card" style={{ marginTop: '16px' }}>
                                        <div className="cms-step-header">
                                            <span className="step-num">✓</span>
                                            <h4>Configuration Summary</h4>
                                        </div>
                                        <div className="cms-step-content">
                                            <div className="summary-display-box">
                                                <div className="summary-row">
                                                    <span className="summary-label">Widget:</span>
                                                    <strong className="summary-value">Lite Promobanner</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Image:</span>
                                                    <strong className="summary-value text-ellipsis" title={imageMetadata[0]?.name || "Not selected"}>
                                                        {imageMetadata[0]?.name || "Not selected"}
                                                    </strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Redirect:</span>
                                                    <strong className="summary-value">{litePromobannerConfig.redirectType === "CATEGORY" ? "Category Page" : "Product Page"}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Destination:</span>
                                                    <strong className="summary-value text-ellipsis" title={litePromobannerConfig.redirectType === "CATEGORY" ? (litePromobannerConfig.categoryName || "Not selected") : (litePromobannerConfig.destProductName || "Not selected")}>
                                                        {litePromobannerConfig.redirectType === "CATEGORY" ? (litePromobannerConfig.categoryName || "Not selected") : (litePromobannerConfig.destProductName || "Not selected")}
                                                    </strong>
                                                </div>
                                                <div className="summary-row status-row">
                                                    <span className="summary-label">Status:</span>
                                                    {(() => {
                                                        const hasImage = widgetImages[0] !== null && widgetImages[0] !== undefined && widgetImages[0] !== "";
                                                        const hasErrors = Object.keys(validateLitePromobannerForm()).length > 0;
                                                        const isReady = hasImage && !hasErrors;
                                                        return (
                                                            <span className={`summary-status-badge ${isReady ? "ready" : "incomplete"}`}>
                                                                {isReady ? "Ready To Publish" : "Incomplete"}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {selectedWidgetId === "roomgrid" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Room Grid Category Configuration</h3>
                                    <span className="cms-badge">4 Category Slots</span>
                                </div>
 
                                <div className="lite-shopbycategory-slots-accordion">
                                    {roomgridConfig.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = roomgridExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const hasLink = slot.categoryId || slot.destProductId;
                                        const query = roomgridProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));
 
                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${roomgridErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setRoomgridExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.label} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.label || `Room Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>{hasLink ? `→ Linked` : '✗ No Link'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>
 
                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Slot Label & Image</span>
                                                            </div>
                                                            <div className="form-group-wrap" style={{ marginBottom: '8px' }}>
                                                                <label className="form-field-label">Label Text *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="styled-input" 
                                                                    value={slot.label} 
                                                                    onChange={(e) => {
                                                                        const updated = [...roomgridConfig];
                                                                        updated[idx].label = e.target.value;
                                                                        setRoomgridConfig(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.label} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>
 
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Redirect Destination</span>
                                                            </div>
                                                            <div className="modern-segmented-control" style={{ marginBottom: '8px' }}>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'CATEGORY' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = [...roomgridConfig];
                                                                    updated[idx] = { ...updated[idx], redirectType: 'CATEGORY', destProductId: '', destProductName: '' };
                                                                    setRoomgridConfig(updated);
                                                                }}>Category Page</button>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'PRODUCT' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = [...roomgridConfig];
                                                                    updated[idx] = { ...updated[idx], redirectType: 'PRODUCT', categoryId: '', categoryName: '' };
                                                                    setRoomgridConfig(updated);
                                                                }}>Product Page</button>
                                                            </div>
 
                                                            {slot.redirectType === 'CATEGORY' ? (
                                                                <SearchableSelect
                                                                    placeholder="Search category..."
                                                                    options={MOCK_CATEGORIES.map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                    value={slot.categoryId}
                                                                    onChange={(val, option) => {
                                                                        const updated = [...roomgridConfig];
                                                                        updated[idx] = { ...updated[idx], categoryId: val, categoryName: option ? option.label : '' };
                                                                        setRoomgridConfig(updated);
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                            ) : (
                                                                <div className="product-search-box-wrapper">
                                                                    <input
                                                                        type="text"
                                                                        className="styled-select search-input"
                                                                        placeholder="Search product..."
                                                                        value={query}
                                                                        onChange={e => setRoomgridProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                    />
                                                                    {query && (
                                                                        <div className="product-search-results-list">
                                                                            {results.map(prod => (
                                                                                <div key={prod.productId} className="product-search-item-card">
                                                                                    <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                    <div className="product-item-details">
                                                                                        <div className="product-item-name">{prod.productName}</div>
                                                                                    </div>
                                                                                    <button type="button" className="btn-select-product" onClick={() => {
                                                                                        const updated = [...roomgridConfig];
                                                                                        updated[idx] = {
                                                                                            ...updated[idx],
                                                                                            destProductId: prod.productId,
                                                                                            destProductName: prod.productName,
                                                                                            destPrice: prod.price,
                                                                                            destDiscount: prod.discount,
                                                                                            destMainCategory: prod.mainCategoryId,
                                                                                            destSubCategory: prod.subCategoryId
                                                                                        };
                                                                                        setRoomgridConfig(updated);
                                                                                        setRoomgridProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                    }}>Load</button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── BANNER CAROUSEL CONFIG SECTION ─── */}
                        {selectedWidgetId === "Lite_bannercarousel" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Lite bannercarousel Configuration</h3>
                                    <span className="cms-badge">3 Slide Banners</span>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {liteBannercarouselConfig.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = liteBannercarouselExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const hasLink = slot.categoryId || slot.destProductId;
                                        const query = liteBannercarouselProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${liteBannercarouselErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setLiteBannercarouselExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.title} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.title || `Slide ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>{hasLink ? `→ Linked` : '✗ No Link'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Slide Details & Image</span>
                                                            </div>
                                                            <div className="form-group-wrap" style={{ marginBottom: '8px' }}>
                                                                <label className="form-field-label">Slide Title *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="styled-input" 
                                                                    value={slot.title} 
                                                                    onChange={(e) => {
                                                                        const updated = [...liteBannercarouselConfig];
                                                                        updated[idx].title = e.target.value;
                                                                        setLiteBannercarouselConfig(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="form-group-wrap" style={{ marginBottom: '8px' }}>
                                                                <label className="form-field-label">Slide Subtitle</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="styled-input" 
                                                                    value={slot.subtitle} 
                                                                    onChange={(e) => {
                                                                        const updated = [...liteBannercarouselConfig];
                                                                        updated[idx].subtitle = e.target.value;
                                                                        setLiteBannercarouselConfig(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.title} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Redirect Destination</span>
                                                            </div>
                                                            <div className="modern-segmented-control" style={{ marginBottom: '8px' }}>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'CATEGORY' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = [...liteBannercarouselConfig];
                                                                    updated[idx] = { ...updated[idx], redirectType: 'CATEGORY', destProductId: '', destProductName: '' };
                                                                    setLiteBannercarouselConfig(updated);
                                                                }}>Category Page</button>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'PRODUCT' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = [...liteBannercarouselConfig];
                                                                    updated[idx] = { ...updated[idx], redirectType: 'PRODUCT', categoryId: '', categoryName: '' };
                                                                    setLiteBannercarouselConfig(updated);
                                                                }}>Product Page</button>
                                                            </div>

                                                            {slot.redirectType === 'CATEGORY' ? (
                                                                <SearchableSelect
                                                                    placeholder="Search category..."
                                                                    options={MOCK_CATEGORIES.map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                    value={slot.categoryId}
                                                                    onChange={(val, option) => {
                                                                        const updated = [...liteBannercarouselConfig];
                                                                        updated[idx] = { ...updated[idx], categoryId: val, categoryName: option ? option.label : '' };
                                                                        setLiteBannercarouselConfig(updated);
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                            ) : (
                                                                <div className="product-search-box-wrapper">
                                                                    <input
                                                                        type="text"
                                                                        className="styled-select search-input"
                                                                        placeholder="Search product..."
                                                                        value={query}
                                                                        onChange={e => setLiteBannercarouselProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                    />
                                                                    {query && (
                                                                        <div className="product-search-results-list">
                                                                            {results.map(prod => (
                                                                                <div key={prod.productId} className="product-search-item-card">
                                                                                    <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                    <div className="product-item-details">
                                                                                        <div className="product-item-name">{prod.productName}</div>
                                                                                    </div>
                                                                                    <button type="button" className="btn-select-product" onClick={() => {
                                                                                        const updated = [...liteBannercarouselConfig];
                                                                                        updated[idx] = {
                                                                                            ...updated[idx],
                                                                                            destProductId: prod.productId,
                                                                                            destProductName: prod.productName,
                                                                                            destPrice: prod.price,
                                                                                            destDiscount: prod.discount,
                                                                                            destMainCategory: prod.mainCategoryId,
                                                                                            destSubCategory: prod.subCategoryId
                                                                                        };
                                                                                        setLiteBannercarouselConfig(updated);
                                                                                        setLiteBannercarouselProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                    }}>Load</button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── TRENDING SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "trendingSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Trending Section Configuration</h3>
                                    <span className="cms-badge">4 Product Cards</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={trendingConfig.title} 
                                            onChange={(e) => setTrendingConfig(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">See All CTA Link Text</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={trendingConfig.seeAllText} 
                                            onChange={(e) => setTrendingConfig(p => ({ ...p, seeAllText: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {trendingConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = trendingExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const query = trendingProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${slot.productId ? 'has-link' : ''} ${trendingErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setTrendingExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.productName} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.productName || `Product Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${slot.productId ? 'ok' : 'missing'}`}>{slot.productId ? `→ Linked (${slot.productId})` : '✗ No Master Product'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Image & Product Database Lookup</span>
                                                            </div>
                                                            
                                                            <div className="product-search-box-wrapper" style={{ marginBottom: '10px' }}>
                                                                <label className="form-field-label">Search Master Product</label>
                                                                <input
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Type product name to auto-load specs..."
                                                                    value={query}
                                                                    onChange={e => setTrendingProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                />
                                                                {query && (
                                                                    <div className="product-search-results-list">
                                                                        {results.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-meta">{prod.price}</div>
                                                                                </div>
                                                                                <button type="button" className="btn-select-product" onClick={() => {
                                                                                    const updated = { ...trendingConfig };
                                                                                    updated.items[idx] = {
                                                                                        ...updated.items[idx],
                                                                                        productId: prod.productId,
                                                                                        productName: prod.productName,
                                                                                        price: prod.price,
                                                                                        discount: prod.discount || "Hot",
                                                                                        destProductId: prod.productId,
                                                                                        destProductName: prod.productName,
                                                                                        destPrice: prod.price,
                                                                                        destDiscount: prod.discount,
                                                                                        destMainCategory: prod.mainCategoryId,
                                                                                        destSubCategory: prod.subCategoryId
                                                                                    };
                                                                                    setTrendingConfig(updated);
                                                                                    setTrendingProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                }}>Load</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.productName} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Custom Product Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Card Custom Attributes</span>
                                                            </div>
                                                            <div className="cms-form-grid-2col">
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Display Name *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.productName} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...trendingConfig };
                                                                            updated.items[idx].productName = e.target.value;
                                                                            setTrendingConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Price *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.price} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...trendingConfig };
                                                                            updated.items[idx].price = e.target.value;
                                                                            setTrendingConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Rating Value</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.rating} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...trendingConfig };
                                                                            updated.items[idx].rating = e.target.value;
                                                                            setTrendingConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Badge Tag (e.g. Hot)</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.discount} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...trendingConfig };
                                                                            updated.items[idx].discount = e.target.value;
                                                                            setTrendingConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── PRODUCT SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "productSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Weekly Specials Configuration</h3>
                                    <span className="cms-badge">4 Products with branding</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Brand Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={productConfig.brandTitle} 
                                            onChange={(e) => setProductConfig(p => ({ ...p, brandTitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">See All Text</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={productConfig.seeAllText} 
                                            onChange={(e) => setProductConfig(p => ({ ...p, seeAllText: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {productConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = productExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const query = productProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${slot.productId ? 'has-link' : ''} ${productErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setProductExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.productName} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.productName || `Product Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${slot.productId ? 'ok' : 'missing'}`}>{slot.productId ? `→ Linked (${slot.productId})` : '✗ No Master Product'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Image & Product Lookup</span>
                                                            </div>
                                                            
                                                            <div className="product-search-box-wrapper" style={{ marginBottom: '10px' }}>
                                                                <label className="form-field-label">Search Master Product</label>
                                                                <input
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Type product name to load details..."
                                                                    value={query}
                                                                    onChange={e => setProductProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                />
                                                                {query && (
                                                                    <div className="product-search-results-list">
                                                                        {results.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-meta">{prod.price}</div>
                                                                                </div>
                                                                                <button type="button" className="btn-select-product" onClick={() => {
                                                                                    const updated = { ...productConfig };
                                                                                    updated.items[idx] = {
                                                                                        ...updated.items[idx],
                                                                                        productId: prod.productId,
                                                                                        productName: prod.productName,
                                                                                        price: prod.price,
                                                                                        oldPrice: prod.price.startsWith("₹") ? `₹${Math.round(parseInt(prod.price.replace(/[^\d]/g, "") || "100") * 1.2)}` : "",
                                                                                        discount: prod.discount || "10% Off",
                                                                                        quantity: "1 unit",
                                                                                        destProductId: prod.productId,
                                                                                        destProductName: prod.productName,
                                                                                        destPrice: prod.price,
                                                                                        destDiscount: prod.discount,
                                                                                        destMainCategory: prod.mainCategoryId,
                                                                                        destSubCategory: prod.subCategoryId
                                                                                    };
                                                                                    setProductConfig(updated);
                                                                                    setProductProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                }}>Load</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.productName} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Card Custom Attributes</span>
                                                            </div>
                                                            <div className="cms-form-grid-2col">
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Display Name *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.productName} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].productName = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Price *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.price} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].price = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Old Price</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.oldPrice} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].oldPrice = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Offer Tag Text</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.discount} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].discount = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Quantity / Unit Size</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.quantity} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].quantity = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Rating Value</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.rating} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...productConfig };
                                                                            updated.items[idx].rating = e.target.value;
                                                                            setProductConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── PERFUME SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "perfumeSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Luxury Fragrance Configuration</h3>
                                    <span className="cms-badge">3 Perfume Cards</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={perfumeConfig.title} 
                                            onChange={(e) => setPerfumeConfig(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Subtitle</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={perfumeConfig.subtitle} 
                                            onChange={(e) => setPerfumeConfig(p => ({ ...p, subtitle: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {perfumeConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = perfumeExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const query = perfumeProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${slot.productId ? 'has-link' : ''} ${perfumeErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setPerfumeExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.productName} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.productName || `Perfume Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${slot.productId ? 'ok' : 'missing'}`}>{slot.productId ? `→ Linked (${slot.productId})` : '✗ No Master Product'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Image & Product Lookup</span>
                                                            </div>
                                                            
                                                            <div className="product-search-box-wrapper" style={{ marginBottom: '10px' }}>
                                                                <label className="form-field-label">Search Master Product</label>
                                                                <input
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Type to search master list..."
                                                                    value={query}
                                                                    onChange={e => setPerfumeProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                />
                                                                {query && (
                                                                    <div className="product-search-results-list">
                                                                        {results.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-meta">{prod.price}</div>
                                                                                </div>
                                                                                <button type="button" className="btn-select-product" onClick={() => {
                                                                                    const updated = { ...perfumeConfig };
                                                                                    updated.items[idx] = {
                                                                                        ...updated.items[idx],
                                                                                        productId: prod.productId,
                                                                                        productName: prod.productName,
                                                                                        price: prod.price,
                                                                                        rating: "4.8",
                                                                                        offerTag: "Fresh",
                                                                                        deliveryTime: "10 mins",
                                                                                        destProductId: prod.productId,
                                                                                        destProductName: prod.productName,
                                                                                        destPrice: prod.price,
                                                                                        destDiscount: prod.discount,
                                                                                        destMainCategory: prod.mainCategoryId,
                                                                                        destSubCategory: prod.subCategoryId
                                                                                    };
                                                                                    setPerfumeConfig(updated);
                                                                                    setPerfumeProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                }}>Load</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.productName} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Custom Product Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Card Custom Attributes</span>
                                                            </div>
                                                            <div className="cms-form-grid-2col">
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Display Name *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.productName} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...perfumeConfig };
                                                                            updated.items[idx].productName = e.target.value;
                                                                            setPerfumeConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Price *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.price} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...perfumeConfig };
                                                                            updated.items[idx].price = e.target.value;
                                                                            setPerfumeConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Offer Tag Label</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.offerTag} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...perfumeConfig };
                                                                            updated.items[idx].offerTag = e.target.value;
                                                                            setPerfumeConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Rating Value</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.rating} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...perfumeConfig };
                                                                            updated.items[idx].rating = e.target.value;
                                                                            setPerfumeConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Delivery Time Tag</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.deliveryTime} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...perfumeConfig };
                                                                            updated.items[idx].deliveryTime = e.target.value;
                                                                            setPerfumeConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── KIDS SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "kidsSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Kids Section Configuration</h3>
                                    <span className="cms-badge" style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', color: '#fff' }}>3 Slots</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={kidsConfig.title} 
                                            onChange={(e) => setKidsConfig(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Subtitle</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={kidsConfig.subtitle || ""} 
                                            onChange={(e) => setKidsConfig(p => ({ ...p, subtitle: e.target.value }))}
                                            placeholder="Comfort for kids..."
                                        />
                                    </div>
                                </div>

                                {/* Background Image upload (Optional step) */}
                                <div className="cms-step-card" style={{ marginBottom: '16px' }}>
                                    <div className="cms-step-header">
                                        <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>★</span>
                                        <h4>Background Image (Optional)</h4>
                                    </div>
                                    <div className="cms-step-content">
                                        <div className="banner-upload-dropzone-wrapper">
                                            {kidsConfig.bgImage ? (
                                                <div className="cms-image-preview-card">
                                                    <div className="preview-image-container">
                                                        <img src={kidsConfig.bgImage} alt="Kids BG" className="preview-image-element" style={{ objectFit: 'contain', maxHeight: '100px' }} />
                                                    </div>
                                                    <div className="preview-image-actions">
                                                        <button 
                                                            type="button" 
                                                            className="btn-preview-action replace" 
                                                            onClick={() => document.getElementById('kids-bg-file-input').click()}
                                                        >
                                                            <RefreshCw size={12} style={{ marginRight: '4px' }} /> Replace
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="btn-preview-action delete" 
                                                            onClick={() => setKidsConfig(prev => ({ ...prev, bgImage: "" }))}
                                                        >
                                                            <Trash2 size={12} style={{ marginRight: '4px' }} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="banner-upload-placeholder" onClick={() => document.getElementById('kids-bg-file-input').click()}>
                                                    <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                    <div className="upload-text" style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Upload Section BG Image</div>
                                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, WEBP • Max 1.5 MB</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                id="kids-bg-file-input" 
                                                style={{ display: 'none' }} 
                                                accept="image/*" 
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        const reader = new FileReader();
                                                        reader.readAsDataURL(file);
                                                        reader.onloadend = () => {
                                                            setKidsConfig(prev => ({ ...prev, bgImage: reader.result }));
                                                        };
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {kidsConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = kidsExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const hasLink = slot.categoryId || slot.destProductId;
                                        const query = kidsProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${kidsErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setKidsExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.label} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.label || `Card ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>
                                                                {hasLink
                                                                    ? (slot.redirectType === 'PRODUCT'
                                                                        ? `→ ${slot.destProductName ? slot.destProductName.substring(0, 18) + '...' : 'Product'}`
                                                                        : `→ ${slot.categoryName || 'Category'}`)
                                                                    : '✗ No Link'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>1</span>
                                                                <span>Card Title & Image</span>
                                                                <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>300×300 px • max 500 KB</span>
                                                            </div>
                                                            <div className="form-group-wrap" style={{ marginBottom: '8px' }}>
                                                                <label className="form-field-label">Age Group / Label *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="styled-input" 
                                                                    value={slot.label} 
                                                                    onChange={(e) => {
                                                                        const updated = { ...kidsConfig };
                                                                        updated.items[idx].label = e.target.value;
                                                                        setKidsConfig(updated);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.label} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>
                                                                                <RefreshCw size={12} /> Replace
                                                                            </button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Upload Card Image</span>
                                                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, WEBP • 300×300 px</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>2</span>
                                                                <span>Redirect Destination</span>
                                                            </div>
                                                            <div className="modern-segmented-control" style={{ marginBottom: '8px' }}>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'CATEGORY' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = { ...kidsConfig };
                                                                    updated.items[idx] = { ...updated.items[idx], redirectType: 'CATEGORY', destProductId: '', destProductName: '' };
                                                                    setKidsConfig(updated);
                                                                }}>Category Page</button>
                                                                <button type="button" className={`segment-btn ${slot.redirectType === 'PRODUCT' ? 'active' : ''}`} onClick={() => {
                                                                    const updated = { ...kidsConfig };
                                                                    updated.items[idx] = { ...updated.items[idx], redirectType: 'PRODUCT', categoryId: '', categoryName: '' };
                                                                    setKidsConfig(updated);
                                                                }}>Product Page</button>
                                                            </div>

                                                            {slot.redirectType === 'CATEGORY' ? (
                                                                <SearchableSelect
                                                                    placeholder="Search category..."
                                                                    options={MOCK_CATEGORIES.map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                    value={slot.categoryId}
                                                                    onChange={(val, option) => {
                                                                        const updated = { ...kidsConfig };
                                                                        updated.items[idx] = { ...updated.items[idx], categoryId: val, categoryName: option ? option.label : '' };
                                                                        setKidsConfig(updated);
                                                                    }}
                                                                    displayKey="label"
                                                                    valueKey="value"
                                                                    searchKey="label"
                                                                />
                                                            ) : (
                                                                <div className="product-search-box-wrapper">
                                                                    <input
                                                                        type="text"
                                                                        className="styled-select search-input"
                                                                        placeholder="Search product..."
                                                                        value={query}
                                                                        onChange={e => setKidsProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                    />
                                                                    {query && (
                                                                        <div className="product-search-results-list">
                                                                            {results.map(prod => (
                                                                                <div key={prod.productId} className="product-search-item-card">
                                                                                    <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                    <div className="product-item-details">
                                                                                        <div className="product-item-name">{prod.productName}</div>
                                                                                        <div className="product-item-meta">{prod.price}</div>
                                                                                    </div>
                                                                                    <button type="button" className="btn-select-product" onClick={() => {
                                                                                        const updated = { ...kidsConfig };
                                                                                        updated.items[idx] = {
                                                                                            ...updated.items[idx],
                                                                                            destProductId: prod.productId,
                                                                                            destProductName: prod.productName,
                                                                                            destPrice: prod.price,
                                                                                            destDiscount: prod.discount,
                                                                                            destMainCategory: prod.mainCategoryId,
                                                                                            destSubCategory: prod.subCategoryId
                                                                                        };
                                                                                        setKidsConfig(updated);
                                                                                        setKidsProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                    }}>Load</button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── FRESH MARKET SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "freshmarketSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Fresh Market Deals Configuration</h3>
                                    <span className="cms-badge">4 Fresh Grocery Slots</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={freshmarketConfig.title} 
                                            onChange={(e) => setFreshmarketConfig(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">See All CTA Link Text</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={freshmarketConfig.seeAllText} 
                                            onChange={(e) => setFreshmarketConfig(p => ({ ...p, seeAllText: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {freshmarketConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = freshmarketExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const query = freshmarketProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${slot.productId ? 'has-link' : ''} ${freshmarketErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setFreshmarketExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.productName} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.productName || `Grocery Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${slot.productId ? 'ok' : 'missing'}`}>{slot.productId ? `→ Linked (${slot.productId})` : '✗ No Master Product'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Image & Product Database Lookup</span>
                                                            </div>
                                                            
                                                            <div className="product-search-box-wrapper" style={{ marginBottom: '10px' }}>
                                                                <label className="form-field-label">Search Master Product</label>
                                                                <input
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Type product name to auto-load specs..."
                                                                    value={query}
                                                                    onChange={e => setFreshmarketProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                />
                                                                {query && (
                                                                    <div className="product-search-results-list">
                                                                        {results.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-meta">{prod.price}</div>
                                                                                </div>
                                                                                <button type="button" className="btn-select-product" onClick={() => {
                                                                                    const updated = { ...freshmarketConfig };
                                                                                    updated.items[idx] = {
                                                                                        ...updated.items[idx],
                                                                                        productId: prod.productId,
                                                                                        productName: prod.productName,
                                                                                        price: prod.price,
                                                                                        destProductId: prod.productId,
                                                                                        destProductName: prod.productName,
                                                                                        destPrice: prod.price,
                                                                                        destDiscount: prod.discount,
                                                                                        destMainCategory: prod.mainCategoryId,
                                                                                        destSubCategory: prod.subCategoryId
                                                                                    };
                                                                                    setFreshmarketConfig(updated);
                                                                                    setFreshmarketProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                }}>Load</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.productName} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Custom Product Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Card Custom Attributes</span>
                                                            </div>
                                                            <div className="cms-form-grid-2col">
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Display Name *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.productName} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...freshmarketConfig };
                                                                            updated.items[idx].productName = e.target.value;
                                                                            setFreshmarketConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Price *</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.price} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...freshmarketConfig };
                                                                            updated.items[idx].price = e.target.value;
                                                                            setFreshmarketConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Weight / Quantity Size</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.weight} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...freshmarketConfig };
                                                                            updated.items[idx].weight = e.target.value;
                                                                            setFreshmarketConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group-wrap">
                                                                    <label className="form-field-label">Organic Badge (e.g. Fresh, Organic)</label>
                                                                    <input 
                                                                        type="text" 
                                                                        className="styled-input" 
                                                                        value={slot.badge} 
                                                                        onChange={(e) => {
                                                                            const updated = { ...freshmarketConfig };
                                                                            updated.items[idx].badge = e.target.value;
                                                                            setFreshmarketConfig(updated);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── MATS SECTION CONFIG SECTION ─── */}
                        {selectedWidgetId === "matsSection" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Mats & Rugs Configuration</h3>
                                    <span className="cms-badge">3 Slots</span>
                                </div>

                                <div className="cms-form-grid-2col" style={{ marginBottom: '16px' }}>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Title *</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={matsConfig.title} 
                                            onChange={(e) => setMatsConfig(p => ({ ...p, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap">
                                        <label className="form-field-label">Section Subtitle</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={matsConfig.subtitle || ""} 
                                            onChange={(e) => setMatsConfig(p => ({ ...p, subtitle: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group-wrap" style={{ gridColumn: 'span 2' }}>
                                        <label className="form-field-label">See All CTA Link Text</label>
                                        <input 
                                            type="text" 
                                            className="styled-input" 
                                            value={matsConfig.seeAllText} 
                                            onChange={(e) => setMatsConfig(p => ({ ...p, seeAllText: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {matsConfig.items.map((slot, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const isExpanded = matsExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const query = matsProductSearch[idx] || "";
                                        const results = productsMasterList.filter(p => p.productName.toLowerCase().includes(query.toLowerCase()));

                                        return (
                                            <div key={idx} className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${slot.productId ? 'has-link' : ''} ${matsErrors[idx] ? 'has-errors' : ''}`}>
                                                <div className="lite-shopbycategory-slot-accordion-header" onClick={() => setMatsExpandedSlot(isExpanded ? null : idx)}>
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded ? <img src={imgUrl} alt={slot.productName} className="lite-shopbycategory-slot-thumb" /> : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>}
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{slot.productName || `Mat Slot ${idx + 1}`}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>{isUploaded ? '✓ Image' : '✗ No Image'}</span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${slot.productId ? 'ok' : 'missing'}`}>{slot.productId ? `→ Linked (${slot.productId})` : '✗ No Master Product'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">1</span>
                                                                <span>Image & Product Database Lookup</span>
                                                            </div>
                                                            
                                                            <div className="product-search-box-wrapper" style={{ marginBottom: '10px' }}>
                                                                <label className="form-field-label">Search Master Product</label>
                                                                <input
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Type product name to auto-load specs..."
                                                                    value={query}
                                                                    onChange={e => setMatsProductSearch(p => ({ ...p, [idx]: e.target.value }))}
                                                                />
                                                                {query && (
                                                                    <div className="product-search-results-list">
                                                                        {results.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-meta">{prod.price}</div>
                                                                                </div>
                                                                                <button type="button" className="btn-select-product" onClick={() => {
                                                                                    const updated = { ...matsConfig };
                                                                                    updated.items[idx] = {
                                                                                        ...updated.items[idx],
                                                                                        productId: prod.productId,
                                                                                        productName: prod.productName,
                                                                                        price: prod.price,
                                                                                        destProductId: prod.productId,
                                                                                        destProductName: prod.productName,
                                                                                        destPrice: prod.price,
                                                                                        destDiscount: prod.discount,
                                                                                        destMainCategory: prod.mainCategoryId,
                                                                                        destSubCategory: prod.subCategoryId
                                                                                    };
                                                                                    setMatsConfig(updated);
                                                                                    setMatsProductSearch(p => ({ ...p, [idx]: "" }));
                                                                                }}>Load</button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={slot.productName} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button type="button" className="slot-action-btn upload-btn" onClick={() => handleReplaceClick(idx)}>Replace</button>
                                                                            <button type="button" className="slot-action-btn delete-btn" onClick={() => handleDeleteClick(idx)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="lite-shopbycategory-slot-upload-dropzone" onClick={() => handleReplaceClick(idx)}>
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span>Upload Custom Product Image</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" id={`file-input-${idx}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, idx)} />
                                                            </div>
                                                        </div>

                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num">2</span>
                                                                <span>Card Custom Attributes</span>
                                                            </div>
                                                            <div className="cms-form-grid-2col">
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Display Name *</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.productName} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].productName = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Brand Name</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.brand || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].brand = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Price *</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.price} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].price = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Original Price (Strikeout)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.oldPrice || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].oldPrice = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Discount Badge (e.g. 65% OFF)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.discount || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].discount = e.target.value;
                                                                             updated.items[idx].offer = e.target.value; // Sync offer tag
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap">
                                                                     <label className="form-field-label">Quantity (e.g. 1 pc)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.quantity || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].quantity = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <div className="form-group-wrap" style={{ gridColumn: 'span 2' }}>
                                                                     <label className="form-field-label">Delivery Time (e.g. 8 mins)</label>
                                                                     <input 
                                                                         type="text" 
                                                                         className="styled-input" 
                                                                         value={slot.delivery || ""} 
                                                                         onChange={(e) => {
                                                                             const updated = { ...matsConfig };
                                                                             updated.items[idx].delivery = e.target.value;
                                                                             setMatsConfig(updated);
                                                                         }}
                                                                     />
                                                                 </div>
                                                             </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ─── GENERIC WIDGET FALLBACK IMAGE UPLOAD ─── */}
                        {!["Lite_Banner", "Lite_Shopbycategory", "Lite_Promobanner", "roomgrid", "Lite_bannercarousel", "trendingSection", "productSection", "perfumeSection", "kidsSection", "freshmarketSection", "matsSection"].includes(selectedWidgetId) && (
                            <div className="generic-widget-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>{activeMeta.name} Configuration</h3>
                                    <span className="cms-badge">Image Assets</span>
                                </div>

                                <div className="config-section-body">
                                    {/* Stats Row */}
                                    <div className="widget-slot-stats-row">
                                        <div className="slot-stat-chip uploaded">
                                            <span className="chip-num">{stats.uploaded}</span>
                                            <span className="chip-label">Uploaded</span>
                                        </div>
                                        <div className="slot-stat-chip pending">
                                            <span className="chip-num">{stats.pending}</span>
                                            <span className="chip-label">Pending</span>
                                        </div>
                                        <div className="slot-stat-chip total">
                                            <span className="chip-num">{stats.total}</span>
                                            <span className="chip-label">Total Slots</span>
                                        </div>
                                        {stats.invalid > 0 && (
                                            <div className="slot-stat-chip invalid">
                                                <span className="chip-num">{stats.invalid}</span>
                                                <span className="chip-label">Invalid</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Slot Cards */}
                                    <div className="generic-slots-list">
                                        {widgetImages.map((imgUrl, idx) => {
                                            const meta = imageMetadata[idx] || {};
                                            const hasError = !!validationErrors[idx];
                                            const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`generic-slot-card ${hasError ? "slot-has-error" : ""} ${isUploaded ? "slot-filled" : "slot-empty"}`}
                                                >
                                                    {/* Slot Number Badge */}
                                                    <div className="slot-badge-num">Slot {idx + 1}</div>

                                                    {/* Image Area */}
                                                    <div className="slot-image-area">
                                                        {isUploaded ? (
                                                            <img
                                                                src={imgUrl}
                                                                alt={`Slot ${idx + 1}`}
                                                                className="slot-thumb-img"
                                                                onClick={() => handlePreviewClick(idx)}
                                                                style={{ cursor: "pointer" }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="slot-upload-placeholder"
                                                                onClick={() => handleReplaceClick(idx)}
                                                            >
                                                                <Upload size={20} className="upload-placeholder-icon" />
                                                                <span>Upload Image</span>
                                                                <span className="slot-req-hint">
                                                                    {activeMeta.resolution.display} • {activeMeta.maxSizeDisplay}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Slot Meta Info */}
                                                    <div className="slot-meta-info">
                                                        <div className="slot-file-name" title={meta.name || "Empty Slot"}>
                                                            {meta.name || "Empty Slot"}
                                                        </div>
                                                        <div className="slot-meta-row">
                                                            <span className={`slot-status-badge ${(meta.status || "Missing").toLowerCase()}`}>
                                                                {meta.status || "Missing"}
                                                            </span>
                                                            {meta.size && meta.size !== "-" && (
                                                                <span className="slot-file-size">{meta.size}</span>
                                                            )}
                                                        </div>
                                                        {hasError && (
                                                            <div className="slot-error-msg">
                                                                <AlertCircle size={12} />
                                                                {validationErrors[idx]}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Slot Actions */}
                                                    <div className="slot-actions-row">
                                                        <button
                                                            type="button"
                                                            className="slot-action-btn upload-btn"
                                                            onClick={() => handleReplaceClick(idx)}
                                                            title={isUploaded ? "Replace Image" : "Upload Image"}
                                                        >
                                                            {isUploaded ? <RefreshCw size={13} /> : <Upload size={13} />}
                                                            {isUploaded ? "Replace" : "Upload"}
                                                        </button>
                                                        {isUploaded && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="slot-action-btn preview-btn"
                                                                    onClick={() => handlePreviewClick(idx)}
                                                                    title="Preview Image"
                                                                >
                                                                    <Eye size={13} />
                                                                    Preview
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="slot-action-btn delete-btn"
                                                                    onClick={() => handleDeleteClick(idx)}
                                                                    title="Delete Image"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Hidden file input */}
                                                    <input
                                                        type="file"
                                                        id={`file-input-${idx}`}
                                                        style={{ display: "none" }}
                                                        accept={activeMeta.formats.join(", ")}
                                                        onChange={(e) => handleFileChange(e, idx)}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Summary Card */}
                                    <div className="cms-step-card summary-card" style={{ marginTop: '16px' }}>
                                        <div className="cms-step-header">
                                            <span className="step-num">✓</span>
                                            <h4>Upload Summary</h4>
                                        </div>
                                        <div className="cms-step-content">
                                            <div className="summary-display-box">
                                                <div className="summary-row">
                                                    <span className="summary-label">Widget:</span>
                                                    <strong className="summary-value">{activeMeta.name}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Required Slots:</span>
                                                    <strong className="summary-value">{activeMeta.requiredCount}</strong>
                                                </div>
                                                <div className="summary-row">
                                                    <span className="summary-label">Uploaded:</span>
                                                    <strong className="summary-value">{stats.uploaded} / {stats.total}</strong>
                                                </div>
                                                <div className="summary-row status-row">
                                                    <span className="summary-label">Status:</span>
                                                    <span className={`summary-status-badge ${stats.uploaded === stats.total ? "ready" : "incomplete"}`}>
                                                        {stats.uploaded === stats.total ? "Ready To Publish" : "Incomplete"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── BEAUTY CATEGORY DEDICATED CONFIG SECTION ─── */}
                        {selectedWidgetId === "Lite_Shopbycategory" && (
                            <div className="lite-shopbycategory-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Lite Shopbycategory Configuration</h3>
                                    <span className="cms-badge" style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)', color: '#fff' }}>8 Category Slots</span>
                                </div>

                                {/* Stats Row */}
                                <div className="widget-slot-stats-row" style={{ marginBottom: '4px' }}>
                                    <div className="slot-stat-chip uploaded">
                                        <span className="chip-num">{stats.uploaded}</span>
                                        <span className="chip-label">Images Uploaded</span>
                                    </div>
                                    <div className="slot-stat-chip pending">
                                        <span className="chip-num">{stats.pending}</span>
                                        <span className="chip-label">Pending</span>
                                    </div>
                                    <div className="slot-stat-chip total">
                                        <span className="chip-num">
                                            {liteShopbycategoryConfig.filter(s => s.categoryId || s.destProductId).length}
                                        </span>
                                        <span className="chip-label">Links Configured</span>
                                    </div>
                                </div>

                                <div className="lite-shopbycategory-slots-accordion">
                                    {WIDGET_METADATA.Lite_Shopbycategory.labels.map((label, idx) => {
                                        const imgUrl = widgetImages[idx];
                                        const slotCfg = liteShopbycategoryConfig[idx] || {};
                                        const isExpanded = liteShopbycategoryExpandedSlot === idx;
                                        const isUploaded = imgUrl !== null && imgUrl !== undefined;
                                        const hasLink = slotCfg.categoryId || slotCfg.destProductId;
                                        const slotProductResults = liteShopbycategoryProductSearch[idx]
                                            ? productsMasterList.filter(p =>
                                                p.productName.toLowerCase().includes(liteShopbycategoryProductSearch[idx].toLowerCase()) ||
                                                p.productId.toLowerCase().includes(liteShopbycategoryProductSearch[idx].toLowerCase())
                                              )
                                            : [];

                                        return (
                                            <div
                                                key={idx}
                                                className={`lite-shopbycategory-slot-accordion-card ${isExpanded ? 'expanded' : ''} ${isUploaded ? 'has-image' : ''} ${hasLink ? 'has-link' : ''} ${liteShopbycategoryErrors[idx] ? 'has-errors' : ''}`}
                                            >
                                                {/* Accordion Header */}
                                                <div
                                                    className="lite-shopbycategory-slot-accordion-header"
                                                    onClick={() => setLiteShopbycategoryExpandedSlot(isExpanded ? null : idx)}
                                                >
                                                    <div className="lite-shopbycategory-slot-thumb-wrap">
                                                        {isUploaded
                                                            ? <img src={imgUrl} alt={label} className="lite-shopbycategory-slot-thumb" />
                                                            : <div className="lite-shopbycategory-slot-thumb-empty"><Upload size={14} /></div>
                                                        }
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-header-info">
                                                        <span className="lite-shopbycategory-slot-label-name">{label}</span>
                                                        <div className="lite-shopbycategory-slot-status-row">
                                                            <span className={`lite-shopbycategory-slot-img-badge ${isUploaded ? 'ok' : 'missing'}`}>
                                                                {isUploaded ? '✓ Image' : '✗ No Image'}
                                                            </span>
                                                            <span className={`lite-shopbycategory-slot-link-badge ${hasLink ? 'ok' : 'missing'}`}>
                                                                {hasLink
                                                                    ? (slotCfg.redirectType === 'PRODUCT'
                                                                        ? `→ ${slotCfg.destProductName ? slotCfg.destProductName.substring(0, 18) + '...' : 'Product'}`
                                                                        : `→ ${slotCfg.categoryName || 'Category'}`)
                                                                    : '✗ No Link'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="lite-shopbycategory-slot-expand-icon">
                                                        <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                    </div>
                                                </div>

                                                {/* Accordion Body */}
                                                {isExpanded && (
                                                    <div className="lite-shopbycategory-slot-accordion-body animate-fade">
                                                        {/* Step 1: Image Upload */}
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>1</span>
                                                                <span>Category Image</span>
                                                                <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>300×300 px • max 500 KB</span>
                                                            </div>
                                                            <div className="lite-shopbycategory-slot-img-upload-area">
                                                                {isUploaded ? (
                                                                    <div className="lite-shopbycategory-slot-uploaded-preview">
                                                                        <img src={imgUrl} alt={label} />
                                                                        <div className="lite-shopbycategory-slot-img-actions">
                                                                            <button
                                                                                type="button"
                                                                                className="slot-action-btn upload-btn"
                                                                                onClick={() => handleReplaceClick(idx)}
                                                                            >
                                                                                <RefreshCw size={12} /> Replace
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="slot-action-btn delete-btn"
                                                                                onClick={() => handleDeleteClick(idx)}
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="lite-shopbycategory-slot-upload-dropzone"
                                                                        onClick={() => handleReplaceClick(idx)}
                                                                    >
                                                                        <Upload size={20} style={{ color: '#ec4899', marginBottom: '6px' }} />
                                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Upload Category Image</span>
                                                                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>PNG, JPG, WEBP • 300×300 px</span>
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    id={`file-input-${idx}`}
                                                                    style={{ display: "none" }}
                                                                    accept="image/png, image/jpeg, image/webp"
                                                                    onChange={(e) => handleFileChange(e, idx)}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Step 2: Link Configuration */}
                                                        <div className="lite-shopbycategory-slot-step">
                                                            <div className="lite-shopbycategory-slot-step-title">
                                                                <span className="step-num" style={{ width: '20px', height: '20px', fontSize: '11px' }}>2</span>
                                                                <span>Redirect Destination</span>
                                                            </div>

                                                            {/* Redirect Type Toggle */}
                                                            <div className="modern-segmented-control" style={{ marginBottom: '12px' }}>
                                                                <button
                                                                    type="button"
                                                                    className={`segment-btn ${slotCfg.redirectType === 'CATEGORY' ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        const updated = [...liteShopbycategoryConfig];
                                                                        updated[idx] = { ...updated[idx], redirectType: 'CATEGORY', destProductId: '', destProductName: '', destPrice: '', destDiscount: '', destMainCategory: '', destSubCategory: '' };
                                                                        setLiteShopbycategoryConfig(updated);
                                                                        setLiteShopbyerrors(prev => {
                                                                            const next = { ...prev };
                                                                            delete next[idx];
                                                                            return next;
                                                                        });
                                                                    }}
                                                                >
                                                                    Category Page
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`segment-btn ${slotCfg.redirectType === 'PRODUCT' ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        const updated = [...liteShopbycategoryConfig];
                                                                        updated[idx] = { ...updated[idx], redirectType: 'PRODUCT', categoryId: '', categoryName: '' };
                                                                        setLiteShopbycategoryConfig(updated);
                                                                        setLiteShopbyerrors(prev => {
                                                                            const next = { ...prev };
                                                                            delete next[idx];
                                                                            return next;
                                                                        });
                                                                    }}
                                                                >
                                                                    Product Page
                                                                </button>
                                                            </div>

                                                            {/* Category Redirect */}
                                                            {slotCfg.redirectType === 'CATEGORY' && (
                                                                <div className="form-group-wrap animate-fade">
                                                                    <label className="form-field-label">Select Category</label>
                                                                    <SearchableSelect
                                                                        placeholder="Search category..."
                                                                        options={(categoriesList.length > 0 ? categoriesList : MOCK_CATEGORIES).map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                        value={slotCfg.categoryId}
                                                                        onChange={(val, option) => {
                                                                            const updated = [...liteShopbycategoryConfig];
                                                                            updated[idx] = { ...updated[idx], categoryId: val, categoryName: option ? option.label : '' };
                                                                            setLiteShopbycategoryConfig(updated);
                                                                            setLiteShopbyerrors(prev => {
                                                                                const next = { ...prev };
                                                                                if (next[idx]) {
                                                                                    const slotErr = { ...next[idx] };
                                                                                    delete slotErr.categoryId;
                                                                                    if (Object.keys(slotErr).length === 0) {
                                                                                        delete next[idx];
                                                                                    } else {
                                                                                        next[idx] = slotErr;
                                                                                    }
                                                                                }
                                                                                return next;
                                                                            });
                                                                        }}
                                                                        displayKey="label"
                                                                        valueKey="value"
                                                                        searchKey="label"
                                                                    />
                                                                    {liteShopbycategoryErrors[idx]?.categoryId && (
                                                                        <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                            <AlertTriangle size={12} />
                                                                            {liteShopbycategoryErrors[idx].categoryId}
                                                                        </div>
                                                                    )}
                                                                    {slotCfg.categoryId && (
                                                                        <div className="selected-info-display-card category-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                            <div className="display-card-title">Selected Category</div>
                                                                            <div className="display-card-body">
                                                                                <div className="display-info-row">
                                                                                    <span className="info-label">Name:</span>
                                                                                    <strong className="info-val">{slotCfg.categoryName}</strong>
                                                                                </div>
                                                                                <div className="display-info-row">
                                                                                    <span className="info-label">ID:</span>
                                                                                    <strong className="info-val code-font">{slotCfg.categoryId}</strong>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Product Redirect */}
                                                            {slotCfg.redirectType === 'PRODUCT' && (
                                                                <div className="form-group-wrap animate-fade">
                                                                    <label className="form-field-label">Search Product</label>
                                                                    <div className="product-search-box-wrapper">
                                                                        <div className="product-search-input-container">
                                                                            <Search size={14} className="search-icon" />
                                                                            <input
                                                                                type="text"
                                                                                className="styled-select search-input"
                                                                                placeholder="Search master database..."
                                                                                value={liteShopbycategoryProductSearch[idx] || ''}
                                                                                onChange={(e) => setLiteShopbycategoryProductSearch(prev => ({ ...prev, [idx]: e.target.value }))}
                                                                            />
                                                                            {liteShopbycategoryProductSearch[idx] && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-clear-selection"
                                                                                    onClick={() => setLiteShopbycategoryProductSearch(prev => ({ ...prev, [idx]: '' }))}
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        {liteShopbycategoryErrors[idx]?.destProductId && (
                                                                            <div className="error-message-inline" style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                                <AlertTriangle size={12} />
                                                                                {liteShopbycategoryErrors[idx].destProductId}
                                                                            </div>
                                                                        )}
                                                                        {liteShopbycategoryProductSearch[idx] && (
                                                                            <div className="product-search-results-list">
                                                                                {slotProductResults.length > 0 ? slotProductResults.map(prod => (
                                                                                    <div key={prod.productId} className="product-search-item-card">
                                                                                        <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                        <div className="product-item-details">
                                                                                            <div className="product-item-name">{prod.productName}</div>
                                                                                            <div className="product-item-id">ID: {prod.productId}</div>
                                                                                            <div className="product-item-meta">{prod.price} | {prod.discount}</div>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn-select-product"
                                                                                            onClick={() => {
                                                                                                const updated = [...liteShopbycategoryConfig];
                                                                                                updated[idx] = {
                                                                                                    ...updated[idx],
                                                                                                    destProductId: prod.productId,
                                                                                                    destProductName: prod.productName,
                                                                                                    destPrice: prod.price,
                                                                                                    destDiscount: prod.discount,
                                                                                                    destMainCategory: prod.mainCategoryId,
                                                                                                    destSubCategory: prod.subCategoryId
                                                                                                };
                                                                                                setLiteShopbycategoryConfig(updated);
                                                                                                setLiteShopbycategoryProductSearch(prev => ({ ...prev, [idx]: '' }));
                                                                                                setLiteShopbyerrors(prev => {
                                                                                                    const next = { ...prev };
                                                                                                    if (next[idx]) {
                                                                                                        const slotErr = { ...next[idx] };
                                                                                                        delete slotErr.destProductId;
                                                                                                        if (Object.keys(slotErr).length === 0) {
                                                                                                            delete next[idx];
                                                                                                        } else {
                                                                                                            next[idx] = slotErr;
                                                                                                        }
                                                                                                    }
                                                                                                    return next;
                                                                                                });
                                                                                                triggerToast(`Product "${prod.productName}" linked to slot ${idx + 1}`, 'success');
                                                                                            }}
                                                                                        >
                                                                                            Load
                                                                                        </button>
                                                                                    </div>
                                                                                )) : (
                                                                                    <div className="no-products-found">No products match search query</div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {slotCfg.destProductId && (
                                                                        <div className="selected-info-display-card product-theme animate-scale" style={{ marginTop: '8px' }}>
                                                                            <div className="display-card-title">Selected Product</div>
                                                                            <div className="display-card-body">
                                                                                <div className="display-info-row">
                                                                                    <span className="info-label">Name:</span>
                                                                                    <strong className="info-val">{slotCfg.destProductName}</strong>
                                                                                </div>
                                                                                <div className="display-info-row">
                                                                                    <span className="info-label">ID:</span>
                                                                                    <strong className="info-val code-font">{slotCfg.destProductId}</strong>
                                                                                </div>
                                                                                <div className="display-info-row">
                                                                                    <span className="info-label">Price:</span>
                                                                                    <strong className="info-val">{slotCfg.destPrice}</strong>
                                                                                </div>
                                                                                {slotCfg.destDiscount && slotCfg.destDiscount !== 'No Discount' && (
                                                                                    <div className="display-info-row">
                                                                                        <span className="info-label">Discount:</span>
                                                                                        <strong className="info-val" style={{ color: '#16a34a' }}>{slotCfg.destDiscount}</strong>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Lite Shopbycategory Summary */}
                                <div className="cms-step-card summary-card" style={{ marginTop: '16px' }}>
                                    <div className="cms-step-header">
                                        <span className="step-num">✓</span>
                                        <h4>Configuration Summary</h4>
                                    </div>
                                    <div className="cms-step-content">
                                        <div className="summary-display-box">
                                            <div className="summary-row">
                                                <span className="summary-label">Widget:</span>
                                                <strong className="summary-value">Lite Shopbycategory</strong>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Total Slots:</span>
                                                <strong className="summary-value">8</strong>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Images Uploaded:</span>
                                                <strong className="summary-value">{stats.uploaded} / 8</strong>
                                            </div>
                                            <div className="summary-row">
                                                <span className="summary-label">Links Set:</span>
                                                <strong className="summary-value">
                                                    {liteShopbycategoryConfig.filter(s => s.categoryId || s.destProductId).length} / 8
                                                </strong>
                                            </div>
                                            <div className="summary-row status-row">
                                                <span className="summary-label">Status:</span>
                                                {(() => {
                                                    const hasBeautyErrors = Object.keys(validateLiteShopbycategoryForm()).length > 0;
                                                    const isBeautyReady = stats.uploaded === 8 && !hasBeautyErrors;
                                                    return (
                                                        <span className={`summary-status-badge ${isBeautyReady ? "ready" : "incomplete"}`}>
                                                            {isBeautyReady ? "Ready To Publish" : "Incomplete"}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* RIGHT LIVE MOBILE PREVIEW (ONLY SIMULATOR) */}
                <div className="live-preview-panel-card">
                    <div className="preview-workspace-wrapper">
                        <div className="single-device-preview-wrapper animate-fade">
                            <div className="device-scale-wrapper">
                                <div className="phone-device-frame">
                                    {renderSimulatorContent(widgetImages, false)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── TOAST NOTIFICATION SYSTEM ─── */}
            {toastMessage && (
                <div className={`slide-in-toast ${toastType}`}>
                    {toastType === "success" && <Check size={16} />}
                    {toastType === "error" && <AlertTriangle size={16} />}
                    {toastType === "info" && <AlertCircle size={16} />}
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── MODAL: FULL IMAGE PREVIEW WITH SIMULATOR ─── */}
            {activePreviewSlotIndex !== null && (
                <div className="modal-backdrop" onClick={() => setActivePreviewSlotIndex(null)}>
                    <div className="modal-content-panel img-preview-modal animate-scale" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-bar">
                            <h3>Asset Preview & Mobile Sandbox</h3>
                            <button className="modal-close-btn" onClick={() => setActivePreviewSlotIndex(null)} aria-label="Close modal">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="asset-preview-body-grid">
                            {/* Left Side: Uploaded Image Detail */}
                            <div className="asset-preview-left-col">
                                <span className="column-section-title">Uploaded Asset</span>
                                <div className="full-image-preview-box">
                                    <img src={widgetImages[activePreviewSlotIndex]} alt="Fullscreen Preview" />
                                    <div className="full-image-meta">
                                        <span>Target Resolution: {activeMeta.resolution.display}</span>
                                        <a href={widgetImages[activePreviewSlotIndex]} download={imageMetadata[activePreviewSlotIndex]?.name || `widget-asset-${selectedWidgetId}.png`} className="download-btn-link">
                                            Download Asset
                                        </a>
                                    </div>
                                </div>
                                <div className="asset-info-table">
                                    <div className="info-row">
                                        <span>Slot Target</span>
                                        <strong>Slot #{activePreviewSlotIndex + 1}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>File Name</span>
                                        <strong style={{ wordBreak: 'break-all' }}>{imageMetadata[activePreviewSlotIndex]?.name || "-"}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>Widget Target</span>
                                        <strong>{selectedWidgetId}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>Resolution</span>
                                        <strong>{imageMetadata[activePreviewSlotIndex]?.resolution || activeMeta.resolution.display}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>File Size</span>
                                        <strong>{imageMetadata[activePreviewSlotIndex]?.size || "-"}</strong>
                                    </div>
                                    <div className="info-row">
                                        <span>Upload Time</span>
                                        <strong>{imageMetadata[activePreviewSlotIndex]?.uploadDate || "-"}</strong>
                                    </div>
                                </div>
                                <div className="modal-action-row" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => {
                                            handleReplaceClick(activePreviewSlotIndex);
                                            setActivePreviewSlotIndex(null);
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        Replace
                                    </button>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => {
                                            handleDeleteClick(activePreviewSlotIndex);
                                            setActivePreviewSlotIndex(null);
                                        }}
                                        style={{ flex: 1, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                    >
                                        Delete
                                    </button>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => setActivePreviewSlotIndex(null)}
                                        style={{ flex: 1 }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            
                            {/* Right Side: Mobile Preview Inside Popup */}
                            <div className="asset-preview-right-col">
                                <div className="mobile-preview-header-row">
                                    <span className="column-section-title">Mobile Simulator Preview</span>
                                    <button className="mobile-preview-close-btn" onClick={() => setActivePreviewSlotIndex(null)}>
                                        <X size={14} />
                                        <span>Close Preview</span>
                                    </button>
                                </div>
                                <div className="modal-device-scale-wrapper">
                                    <div className="phone-device-frame border-primary">
                                        <button 
                                            className="phone-overlay-close-btn"
                                            onClick={() => setActivePreviewSlotIndex(null)}
                                            title="Close Preview"
                                        >
                                            <X size={14} />
                                        </button>
                                        {renderSimulatorContent(widgetImages, false)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* ─── MODAL: PUBLISH CHECKLIST ─── */}
            {showPublishModal && (
                <div className="modal-backdrop" onClick={() => !isPublishing && setShowPublishModal(false)}>
                    <div className="modal-content-panel publish-checklist-modal animate-scale" onClick={e => e.stopPropagation()}>
                        {!isPublishing && (
                            <button className="modal-close-btn" onClick={() => setShowPublishModal(false)}>
                                <X size={20} />
                            </button>
                        )}
                        <div className="modal-dialog-body">
                            {isPublishing ? (
                                <div className="publishing-progress-state text-center">
                                    <div className="spinner-lg animate-spin" />
                                    <h3 className="publishing-headline">Publishing Widget Assets</h3>
                                    
                                    <div className="steps-tracker-list">
                                        <div className={`step-row ${publishStep >= 1 ? "active" : ""}`}>
                                            <span className="step-num">{publishStep > 1 ? "✓" : "1"}</span>
                                            <span className="step-label">Optimizing image layout assets...</span>
                                        </div>
                                        <div className={`step-row ${publishStep >= 2 ? "active" : ""}`}>
                                            <span className="step-num">{publishStep > 2 ? "✓" : "2"}</span>
                                            <span className="step-label">Uploading to Haatza Image CDN...</span>
                                        </div>
                                        <div className={`step-row ${publishStep >= 3 ? "active" : ""}`}>
                                            <span className="step-num">{publishStep > 3 ? "✓" : "3"}</span>
                                            <span className="step-label">Flushing Redis layout cache layers...</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2>Publish Widget to Customer App</h2>
                                    <p>Please verify that the current image configuration complies with brand visual templates.</p>

                                    <div className="checklist-container">
                                        <div className="checklist-row">
                                            <div className="check-indicator yes">✓</div>
                                            <div className="checklist-details">
                                                <span>Slots Full Validation</span>
                                                <p>All {activeMeta.requiredCount} required images have been uploaded with correct sizing parameters.</p>
                                            </div>
                                        </div>
                                        <div className="checklist-row">
                                            <div className="check-indicator yes">✓</div>
                                            <div className="checklist-details">
                                                <span>Fidelity Rendering Checklist</span>
                                                <p>All resolutions match exactly {activeMeta.resolution.display}. Aspect ratio scales correct.</p>
                                            </div>
                                        </div>
                                        <div className="checklist-row">
                                            <div className="check-indicator yes">✓</div>
                                            <div className="checklist-details">
                                                <span>Cache Invalidation Warning</span>
                                                <p>Publishing will overwrite active widget configurations for customers within 60 seconds.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="publish-confirm-row">
                                        <button 
                                            className="btn-secondary" 
                                            onClick={() => setShowPublishModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            className="btn-primary confirm"
                                            onClick={handleConfirmPublish}
                                        >
                                            Confirm & Publish Widget
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* ─── FLOATING IMAGE HOVER PREVIEW TOOLTIP ─── */}
            {hoveredSlotIndex !== null && widgetImages[hoveredSlotIndex] && (
                <div 
                    className="floating-preview-tooltip"
                    style={{
                        position: "fixed",
                        left: `${hoverMousePos.x + 15}px`,
                        top: `${hoverMousePos.y - 120}px`,
                        zIndex: 99999,
                        pointerEvents: "none"
                    }}
                >
                    <div className="tooltip-inner-content">
                        <div className="tooltip-img-container">
                            <img src={widgetImages[hoveredSlotIndex]} alt="Hover Preview" className="tooltip-img" />
                        </div>
                        <div className="tooltip-meta-row">
                            <span className="tooltip-slot-label">Slot #{hoveredSlotIndex + 1}</span>
                            <span className="tooltip-filename">{imageMetadata[hoveredSlotIndex]?.name || "image.png"}</span>
                        </div>
                        <div className="tooltip-details-grid">
                            <div className="tooltip-detail-item">
                                <span className="label">Resolution:</span>
                                <span className="val">{imageMetadata[hoveredSlotIndex]?.resolution || activeMeta.resolution.display}</span>
                            </div>
                            <div className="tooltip-detail-item">
                                <span className="label">File Size:</span>
                                <span className="val">{imageMetadata[hoveredSlotIndex]?.size || "-"}</span>
                            </div>
                            <div className="tooltip-detail-item">
                                <span className="label">Upload Date:</span>
                                <span className="val">{imageMetadata[hoveredSlotIndex]?.uploadDate || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── HELPER COMPONENT: AssetCard ─────────────────────────────────────────────
const AssetCard = React.memo(function AssetCard({ 
    slotIndex, 
    imgUrl, 
    metadata, 
    validationError, 
    isSelected, 
    onSelect, 
    onPreview, 
    onReplace, 
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    dragOverIndex,
    onThumbnailMouseEnter,
    onThumbnailMouseMove,
    onThumbnailMouseLeave,
    style
}) {
    const hasError = !!validationError;
    const isDraggingOver = dragOverIndex === slotIndex;
    const statusText = hasError ? "Invalid" : (metadata.status || "Missing");
    
    return (
        <div 
            id={`slot-card-${slotIndex}`}
            className={`simple-slot-card ${isDraggingOver ? "drag-over" : ""} ${hasError ? "has-error" : ""}`}
            draggable={imgUrl !== null}
            onDragStart={(e) => onDragStart(e, slotIndex)}
            onDragOver={(e) => onDragOver(e, slotIndex)}
            onDrop={(e) => onDrop(e, slotIndex)}
            onDragEnd={onDragEnd}
            style={style}
        >
            <div className="slot-card-header">
                <div className="slot-drag-handle">
                    <Move size={14} className="drag-icon" />
                    <span className="slot-number-text">#{slotIndex + 1}</span>
                </div>
            </div>

            <div className="slot-card-body">
                <div 
                    className="slot-thumbnail-wrapper"
                    onMouseEnter={(e) => onThumbnailMouseEnter(slotIndex, e)}
                    onMouseMove={(e) => onThumbnailMouseMove(slotIndex, e)}
                    onMouseLeave={onThumbnailMouseLeave}
                >
                    {imgUrl ? (
                        <img src={imgUrl} alt={`Slot ${slotIndex + 1}`} loading="lazy" />
                    ) : (
                        <div className="slot-empty-thumbnail">
                            <Upload size={16} />
                        </div>
                    )}
                </div>

                <div className="slot-controls-row">
                    <span className={`slot-status-badge status-${statusText.toLowerCase().replace(" ", "-")}`}>
                        {statusText}
                    </span>
                    
                    <div className="slot-actions-links">
                        <button className="slot-action-link replace-btn" onClick={() => onReplace(slotIndex)}>
                            Replace
                        </button>
                        {imgUrl && (
                            <button className="slot-action-link delete-btn" onClick={() => onDelete(slotIndex)}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {hasError && (
                <div className="slot-error-banner">
                    <AlertCircle size={10} />
                    <span>{validationError}</span>
                </div>
            )}
        </div>
    );
});

// ─── HELPER COMPONENT: BannerCarouselWidget ─────────────────────────────────
// Memoized carousel widget with internal interval and swiping indicators to prevent rendering lags
const BannerCarouselWidget = React.memo(function BannerCarouselWidget({ images, config, onSlideClick }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto rotate banners every 3 seconds inside preview simulator
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % images.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [images]);

    const handleDotClick = (idx, e) => {
        e.stopPropagation();
        setActiveIndex(idx);
    };

    return (
        <div className="mock-widget-lite-bannercarousel animate-fade">
            <div 
                className="carousel-slide-view" 
                onClick={() => onSlideClick && onSlideClick(activeIndex)}
                style={{ cursor: 'pointer' }}
            >
                <img 
                    src={images[activeIndex] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"} 
                    alt={`Carousel Slide ${activeIndex + 1}`} 
                    loading="lazy"
                />
                <div className="carousel-overlay-shadow" />
                <div className="carousel-tag-row">
                    <span className="tag-pill">TRENDING NOW</span>
                    <span className="page-indicator-text">{activeIndex + 1} / {images.length}</span>
                </div>
                
                <div className="carousel-captions">
                    <h4>{config?.[activeIndex]?.title || "Smart Summer Living"}</h4>
                    <p>{config?.[activeIndex]?.subtitle || "Upgrade your space with selected category discounts today."}</p>
                </div>
            </div>

            {/* Pagination Dots */}
            {images.length > 1 && (
                <div className="carousel-dots-row">
                    {images.map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`carousel-dot ${activeIndex === idx ? "active" : ""}`}
                            onClick={(e) => handleDotClick(idx, e)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default ManagePreviewPage;
