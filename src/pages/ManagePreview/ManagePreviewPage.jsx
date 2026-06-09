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
    Search
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
    home: ["Lite_Banner", "Lite_bannercarousel", "TrendingSection", "ProductSection"],
    category: ["Lite_Shopbycategory", "KidsSection"],
    listing: ["ProductSection", "PerfumeSection"],
    details: ["ProductSection", "TrendingSection"],
    promotions: ["Lite_Promobanner", "Lite_bannercarousel"]
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
        defaultImages: ["https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"]
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
        name: "Lite Shop by Category",
        resolution: { width: 300, height: 300, display: "300 x 300 px" },
        maxSize: 500 * 1024, // 500KB
        maxSizeDisplay: "500 KB",
        formats: ["image/png", "image/jpeg"],
        formatsDisplay: "PNG, JPG",
        requiredCount: 8,
        defaultImages: [
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem,
            podiumCategoryItem
        ],
        labels: [
            "New Rele...",
            "New Rele...",
            "Subscripti...",
            "Subscripti...",
            "New Rele...",
            "New Rele...",
            "Subscripti...",
            "Subscripti..."
        ]
    },
    Lite_bannercarousel: {
        name: "Lite Banner Carousel",
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
    TrendingSection: {
        name: "Trending Section",
        resolution: { width: 500, height: 500, display: "500 x 500 px" },
        maxSize: 1 * 1024 * 1024, // 1MB
        maxSizeDisplay: "1 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 4,
        defaultImages: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80", // Red Sneaker
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80", // Smart Watch
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80", // Headset
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80"  // Sunglasses
        ],
        labels: ["Sports Shoes", "Vaporizer Watch", "Studio Pro Headset", "Classic Aviators"],
        prices: ["₹2,499", "₹4,999", "₹8,999", "₹1,599"],
        ratings: [4.5, 4.2, 4.8, 4.6]
    },
    ProductSection: {
        name: "Product Section",
        resolution: { width: 500, height: 700, display: "500 x 700 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 4,
        defaultImages: [
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80", // Yellow Chucks
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80", // Black Tee
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=80", // White Sneaker
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=80"  // Summer Polo
        ],
        labels: ["Retro Yellow Chucks", "Premium Black Tee", "Airforce White High", "Summer Polo Shirt"],
        prices: ["₹3,499", "₹1,299", "₹6,999", "₹1,899"],
        ratings: [4.7, 4.3, 4.9, 4.4]
    },
    PerfumeSection: {
        name: "Perfume Section",
        resolution: { width: 600, height: 800, display: "600 x 800 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 3,
        defaultImages: [
            "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80", // Chanel
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80", // Dior
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"  // Luxury Oud
        ],
        labels: ["Coco Noir Luxury", "Sauvage Intense", "Velvet Rose Oud"],
        prices: ["₹11,500", "₹13,800", "₹16,200"],
        ratings: [4.9, 4.8, 5.0]
    },
    KidsSection: {
        name: "Kids Section",
        resolution: { width: 800, height: 800, display: "800 x 800 px" },
        maxSize: 1.5 * 1024 * 1024, // 1.5MB
        maxSizeDisplay: "1.5 MB",
        formats: ["image/png", "image/jpeg", "image/webp"],
        formatsDisplay: "PNG, JPG, WEBP",
        requiredCount: 4,
        defaultImages: [
            "https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&w=800&q=80", // Toys
            "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=800&q=80", // Clothes
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80", // Blocks
            "https://images.unsplash.com/photo-1533512900305-6601b9ad4def?auto=format&fit=crop&w=800&q=80"  // Shoes
        ],
        labels: ["Wooden Toddler Toys", "Cozy Cotton Jumper", "Rainbow Building Blocks", "Mini Active Trainers"],
        prices: ["₹999", "₹1,499", "₹1,200", "₹2,200"],
        ratings: [4.6, 4.7, 4.5, 4.8]
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
    }
];

const formatSubCategory = (subId) => {
    if (!subId) return "";
    return subId.replace("sub_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

function ManagePreviewPage() {
    // ─── Dropdown States ──────────────────────────────────────────────────
    const [selectedCat, setSelectedCat] = useState("home");
    const [selectedWidgetId, setSelectedWidgetId] = useState("Lite_Banner");

    // Dynamic widget selection matching categories
    const widgetsList = useMemo(() => {
        return WIDGET_BY_CATEGORY[selectedCat] || [];
    }, [selectedCat]);

    const activeMeta = useMemo(() => {
        return WIDGET_METADATA[selectedWidgetId] || WIDGET_METADATA.Lite_Banner;
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
    const [showPreviewAppModal, setShowPreviewAppModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    
    // Compare Mode (Side-by-Side)
    const [isCompareMode, setIsCompareMode] = useState(false);

    // ─── Lite Banner Configuration States ──────────────────────────────────
    const [bannerConfig, setBannerConfig] = useState({
        imageUrl: "",
        redirectType: "",
        categoryId: "",
        categoryName: "",
        productId: "",
        productName: "",
        price: "",
        discount: "",
        mainCategoryId: "",
        subCategoryId: "",
        // Banner content product details
        bannerProductId: "",
        bannerProductName: "",
        bannerPrice: "",
        bannerDiscount: "",
        bannerMainCategory: "",
        bannerSubCategory: "",
        // Destination details
        destProductId: "",
        destProductName: "",
        destPrice: "",
        destDiscount: "",
        destMainCategory: "",
        destSubCategory: ""
    });
    const [bannerErrors, setBannerErrors] = useState({});
    const [bannerProductSearchQuery, setBannerProductSearchQuery] = useState("");
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
    const [selectedProductInSim, setSelectedProductInSim] = useState(MOCK_PRODUCTS[0]);

    // Auto-switch simulator tab when CMS selectedCat changes
    useEffect(() => {
        if (selectedCat === "home") {
            setSimulatorTab("home");
        } else if (selectedCat === "category") {
            setSimulatorTab("category");
        } else if (selectedCat === "details") {
            setSimulatorTab("details");
            const bannerProd = productsMasterList.find(p => p.productId === bannerConfig.bannerProductId);
            if (bannerProd) {
                setSelectedProductInSim(bannerProd);
            }
        }
    }, [selectedCat, bannerConfig.bannerProductId, productsMasterList]);

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
        const draftKey = `haatza_draft_${selectedWidgetId}`;
        const savedDraft = localStorage.getItem(draftKey);
        const metadataKey = `haatza_draft_metadata_${selectedWidgetId}`;
        const savedMetadata = localStorage.getItem(metadataKey);
        
        let initialImages = [];
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
            const savedBannerConfig = localStorage.getItem("haatza_banner_config");
            if (savedBannerConfig) {
                try {
                    const parsed = JSON.parse(savedBannerConfig);
                    setBannerConfig({
                        imageUrl: parsed.imageUrl || "",
                        redirectType: parsed.redirectType || "",
                        categoryId: parsed.categoryId || "",
                        categoryName: parsed.categoryName || "",
                        productId: parsed.productId || "",
                        productName: parsed.productName || "",
                        price: parsed.price || "",
                        discount: parsed.discount || "",
                        mainCategoryId: parsed.mainCategoryId || "",
                        subCategoryId: parsed.subCategoryId || "",
                        // Banner content
                        bannerProductId: parsed.bannerProductId || "",
                        bannerProductName: parsed.bannerProductName || "",
                        bannerPrice: parsed.bannerPrice || "",
                        bannerDiscount: parsed.bannerDiscount || "",
                        bannerMainCategory: parsed.bannerMainCategory || "",
                        bannerSubCategory: parsed.bannerSubCategory || "",
                        // Destination
                        destProductId: parsed.destProductId || parsed.productId || "",
                        destProductName: parsed.destProductName || parsed.productName || "",
                        destPrice: parsed.destPrice || parsed.price || "",
                        destDiscount: parsed.destDiscount || parsed.discount || "",
                        destMainCategory: parsed.destMainCategory || parsed.mainCategoryId || "",
                        destSubCategory: parsed.destSubCategory || parsed.subCategoryId || ""
                    });
                } catch (e) {
                    console.error("Error parsing saved banner config", e);
                }
            } else {
                setBannerConfig({
                    imageUrl: initialImages[0] || "",
                    redirectType: "",
                    categoryId: "",
                    categoryName: "",
                    productId: "",
                    productName: "",
                    price: "",
                    discount: "",
                    mainCategoryId: "",
                    subCategoryId: "",
                    bannerProductId: "",
                    bannerProductName: "",
                    bannerPrice: "",
                    bannerDiscount: "",
                    bannerMainCategory: "",
                    bannerSubCategory: "",
                    destProductId: "",
                    destProductName: "",
                    destPrice: "",
                    destDiscount: "",
                    destMainCategory: "",
                    destSubCategory: ""
                });
            }
            setBannerErrors({});
            setBannerProductSearchQuery("");
            setDestProductSearchQuery("");
        }
    }, [selectedWidgetId, activeMeta]);

    // Handle toast fade
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // ─── Lite Banner Configuration Helper Effects ─────────────────────────
    // Load categories dynamically
    useEffect(() => {
        if (selectedWidgetId === "Lite_Banner") {
            setIsLoadingCategories(true);
            const timer = setTimeout(() => {
                setCategoriesList(MOCK_CATEGORIES);
                setIsLoadingCategories(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedWidgetId]);

    // Keep bannerConfig.imageUrl synced with widgetImages[0]
    useEffect(() => {
        if (selectedWidgetId === "Lite_Banner" && widgetImages.length > 0) {
            const currentImg = widgetImages[0];
            if (currentImg !== bannerConfig.imageUrl) {
                setBannerConfig(prev => ({ ...prev, imageUrl: currentImg || "" }));
            }
        }
    }, [widgetImages, selectedWidgetId]);

    const handleBannerImageUpload = (file) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            const err = "Invalid format. Allowed formats: PNG, JPG, WEBP";
            setBannerErrors(prev => ({ ...prev, bannerImage: err }));
            triggerToast(err, "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            const err = "File size exceeds 2 MB limit.";
            setBannerErrors(prev => ({ ...prev, bannerImage: err }));
            triggerToast(err, "error");
            return;
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const { width, height } = img;
            if (width !== 1200 || height !== 600) {
                const err = `Resolution must be exactly 1200 x 600 px (detected: ${width}x${height}px).`;
                setBannerErrors(prev => ({ ...prev, bannerImage: err }));
                triggerToast(err, "error");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                const base64data = reader.result;
                setWidgetImages(prev => {
                    const next = [...prev];
                    next[0] = base64data;
                    return next;
                });
                setBannerConfig(prev => ({ ...prev, imageUrl: base64data }));
                setBannerErrors(prev => ({ ...prev, bannerImage: null }));
                setImageMetadata(prev => ({
                    ...prev,
                    [0]: {
                        name: file.name,
                        size: formatSize(file.size),
                        uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        status: "Draft",
                        resolution: "1200 × 600"
                    }
                }));
                triggerToast("Banner Image uploaded successfully!");
            };
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            const err = "Failed to load image file.";
            setBannerErrors(prev => ({ ...prev, bannerImage: err }));
            triggerToast(err, "error");
        };
    };

    const handleBannerImageDelete = () => {
        setWidgetImages(prev => {
            const next = [...prev];
            next[0] = null;
            return next;
        });
        setBannerConfig(prev => ({ ...prev, imageUrl: "" }));
        setImageMetadata(prev => {
            const next = { ...prev };
            delete next[0];
            return next;
        });
        triggerToast("Banner Image deleted.", "info");
    };

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
    const validateBannerForm = () => {
        const errors = {};
        if (selectedWidgetId === "Lite_Banner") {
            const hasImage = widgetImages[0] !== null && widgetImages[0] !== undefined && widgetImages[0] !== "";
            if (!hasImage) {
                errors.bannerImage = "Banner image is required.";
            }
            if (!bannerConfig.bannerProductId) {
                errors.bannerProductId = "Banner product ID is required.";
            }
            if (!bannerConfig.bannerProductName) {
                errors.bannerProductName = "Banner product name is required.";
            }
            if (!bannerConfig.bannerPrice) {
                errors.bannerPrice = "Banner pricing is required.";
            }
            if (!bannerConfig.bannerMainCategory) {
                errors.bannerMainCategory = "Banner main category is required.";
            }
            if (!bannerConfig.bannerSubCategory) {
                errors.bannerSubCategory = "Banner sub category is required.";
            }
            if (!bannerConfig.redirectType) {
                errors.redirectType = "Redirect destination type is required.";
            } else if (bannerConfig.redirectType === "CATEGORY") {
                if (!bannerConfig.categoryId) {
                    errors.destination = "Please select a category.";
                }
            } else if (bannerConfig.redirectType === "PRODUCT") {
                if (!bannerConfig.destProductId) {
                    errors.destProductId = "Destination product ID is required.";
                }
                if (!bannerConfig.destProductName) {
                    errors.destProductName = "Destination product name is required.";
                }
                if (!bannerConfig.destPrice) {
                    errors.destPrice = "Destination pricing is required.";
                }
                if (!bannerConfig.destMainCategory) {
                    errors.destMainCategory = "Destination main category is required.";
                }
                if (!bannerConfig.destSubCategory) {
                    errors.destSubCategory = "Destination sub category is required.";
                }
            }
        }
        return errors;
    };

    const handleSaveDraft = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateBannerForm();
            if (Object.keys(errors).length > 0) {
                setBannerErrors(errors);
                triggerToast("Please fix the validation errors in the Configuration Panel before saving.", "error");
                return;
            }
        }

        const draftKey = `haatza_draft_${selectedWidgetId}`;
        localStorage.setItem(draftKey, JSON.stringify(widgetImages));
        
        const metadataKey = `haatza_draft_metadata_${selectedWidgetId}`;
        localStorage.setItem(metadataKey, JSON.stringify(imageMetadata));
        
        if (selectedWidgetId === "Lite_Banner") {
            const dataToSave = {
                widgetType: "Lite_Banner",
                imageUrl: bannerConfig.imageUrl || widgetImages[0] || "",
                redirectType: bannerConfig.redirectType,
                categoryId: bannerConfig.categoryId,
                categoryName: bannerConfig.categoryName,
                productId: bannerConfig.destProductId || bannerConfig.productId || "",
                productName: bannerConfig.destProductName || bannerConfig.productName || "",
                price: bannerConfig.destPrice || bannerConfig.price || "",
                discount: bannerConfig.destDiscount || bannerConfig.discount || "",
                mainCategoryId: bannerConfig.destMainCategory || bannerConfig.mainCategoryId || "",
                subCategoryId: bannerConfig.destSubCategory || bannerConfig.subCategoryId || "",
                bannerProductId: bannerConfig.bannerProductId,
                bannerProductName: bannerConfig.bannerProductName,
                bannerPrice: bannerConfig.bannerPrice,
                bannerDiscount: bannerConfig.bannerDiscount,
                bannerMainCategory: bannerConfig.bannerMainCategory,
                bannerSubCategory: bannerConfig.bannerSubCategory,
                destProductId: bannerConfig.destProductId,
                destProductName: bannerConfig.destProductName,
                destPrice: bannerConfig.destPrice,
                destDiscount: bannerConfig.destDiscount,
                destMainCategory: bannerConfig.destMainCategory,
                destSubCategory: bannerConfig.destSubCategory
            };
            localStorage.setItem("haatza_banner_config", JSON.stringify(dataToSave));
        }

        setBeforeImages(widgetImages.filter(img => img !== null));
        triggerToast("Draft saved successfully! Saved parameters persisted in workspace.", "success");
    };

    const handlePublishClick = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateBannerForm();
            if (Object.keys(errors).length > 0) {
                setBannerErrors(errors);
                triggerToast("Please fix the validation errors in the Configuration Panel.", "error");
                return;
            }
        }
        setShowPublishModal(true);
    };

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStep, setPublishStep] = useState(0);

    const handleConfirmPublish = () => {
        if (selectedWidgetId === "Lite_Banner") {
            const errors = validateBannerForm();
            if (Object.keys(errors).length > 0) {
                setBannerErrors(errors);
                triggerToast("Cannot publish. Please fix the validation errors in the Configuration Panel.", "error");
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
                        const dataToSave = {
                            widgetType: "Lite_Banner",
                            imageUrl: bannerConfig.imageUrl || widgetImages[0] || "",
                            redirectType: bannerConfig.redirectType,
                            categoryId: bannerConfig.categoryId,
                            categoryName: bannerConfig.categoryName,
                            productId: bannerConfig.destProductId || bannerConfig.productId || "",
                            productName: bannerConfig.destProductName || bannerConfig.productName || "",
                            price: bannerConfig.destPrice || bannerConfig.price || "",
                            discount: bannerConfig.destDiscount || bannerConfig.discount || "",
                            mainCategoryId: bannerConfig.destMainCategory || bannerConfig.mainCategoryId || "",
                            subCategoryId: bannerConfig.destSubCategory || bannerConfig.subCategoryId || "",
                            bannerProductId: bannerConfig.bannerProductId,
                            bannerProductName: bannerConfig.bannerProductName,
                            bannerPrice: bannerConfig.bannerPrice,
                            bannerDiscount: bannerConfig.bannerDiscount,
                            bannerMainCategory: bannerConfig.bannerMainCategory,
                            bannerSubCategory: bannerConfig.bannerSubCategory,
                            destProductId: bannerConfig.destProductId,
                            destProductName: bannerConfig.destProductName,
                            destPrice: bannerConfig.destPrice,
                            destDiscount: bannerConfig.destDiscount,
                            destMainCategory: bannerConfig.destMainCategory,
                            destSubCategory: bannerConfig.destSubCategory
                        };
                        localStorage.setItem("haatza_banner_config", JSON.stringify(dataToSave));
                        localStorage.setItem("haatza_banner_config_published", JSON.stringify(dataToSave));
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

    const filteredBannerSearchProducts = useMemo(() => {
        if (!bannerProductSearchQuery) return [];
        const query = bannerProductSearchQuery.toLowerCase();
        return productsMasterList.filter(p => 
            p.productName.toLowerCase().includes(query) ||
            p.productId.toLowerCase().includes(query) ||
            (p.sku && p.sku.toLowerCase().includes(query))
        );
    }, [bannerProductSearchQuery, productsMasterList]);

    const filteredDestSearchProducts = useMemo(() => {
        if (!destProductSearchQuery) return [];
        const query = destProductSearchQuery.toLowerCase();
        return productsMasterList.filter(p => 
            p.productName.toLowerCase().includes(query) ||
            p.productId.toLowerCase().includes(query) ||
            (p.sku && p.sku.toLowerCase().includes(query))
        );
    }, [destProductSearchQuery, productsMasterList]);

    const handleBannerClick = useCallback(() => {
        if (bannerConfig.redirectType === "CATEGORY") {
            if (bannerConfig.categoryId) {
                setSelectedCategoryInSim(bannerConfig.categoryId);
                setSimulatorTab("category");
                triggerToast(`Opening Category: ${bannerConfig.categoryName}`, "info");
            } else {
                triggerToast("No category selected for this banner.", "error");
            }
        } else if (bannerConfig.redirectType === "PRODUCT") {
            if (bannerConfig.destProductId) {
                const found = productsMasterList.find(p => p.productId === bannerConfig.destProductId);
                if (found) {
                    setSelectedProductInSim(found);
                } else {
                    setSelectedProductInSim({
                        productId: bannerConfig.destProductId,
                        productName: bannerConfig.destProductName,
                        price: bannerConfig.destPrice || "$0.00",
                        discount: bannerConfig.destDiscount || "No Discount",
                        mainCategoryId: bannerConfig.destMainCategory || "cat_elect",
                        subCategoryId: bannerConfig.destSubCategory || "",
                        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80"
                    });
                }
                setSimulatorTab("details");
                triggerToast(`Opening Product: ${bannerConfig.destProductName}`, "info");
            } else {
                triggerToast("No product selected for this banner.", "error");
            }
        } else {
            triggerToast("Banner clicked! Redirect type not configured.", "info");
        }
    }, [bannerConfig, productsMasterList]);

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

        const isDefaultOrEmpty = validImgs.every(img => img === null) || 
            (validImgs.length === 1 && validImgs[0] === WIDGET_METADATA.Lite_Banner.defaultImages[0]) || 
            (widgetId === "Lite_Shopbycategory" && validImgs[0] === podiumCategoryItem) ||
            (validImgs.length === 1 && validImgs[0] === WIDGET_METADATA.Lite_Promobanner.defaultImages[0]);

        switch (widgetId) {
            case "Lite_Banner":
                if (isDefaultOrEmpty) {
                    return (
                        <div className="mock-widget-lite-banner animate-fade stencil-banner-container" onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
                            <svg viewBox="0 0 400 180" width="100%" height="100%" style={{ display: 'block', borderRadius: '0px' }}>
                                <defs>
                                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1E88E5"/>
                                        <stop offset="100%" stopColor="#42A5F5"/>
                                    </linearGradient>
                                </defs>
                                <rect width="400" height="180" fill="url(#skyGrad)"/>
                                <path d="M-20,160 Q10,130 50,150 Q90,130 130,155 Q170,135 210,160 Q250,140 290,165 L420,165 L420,190 L-20,190 Z" fill="#ffffff" opacity="0.3"/>
                                <path d="M-10,170 Q30,150 70,165 Q110,145 150,170 Q190,150 230,172 Q270,155 315,170 L420,170 L420,190 L-10,190 Z" fill="#ffffff" opacity="0.6"/>
                                <path d="M150,20 Q170,5 200,10 Q230,0 250,15 Q270,8 290,20 Q310,10 330,22 L400,22 L400,-10 L150,-10 Z" fill="#ffffff" opacity="0.2"/>
                                <g fill="#ffffff" stroke="#1565C0" strokeWidth="1.5">
                                    <path d="M 155,40 L 163,40 L 169,55 L 175,40 L 183,40 L 183,65 L 175,65 L 175,48 L 169,60 L 163,48 L 163,65 L 155,65 Z"/>
                                    <path d="M 189,40 L 211,40 L 211,46 L 197,46 L 197,49 L 209,49 L 209,55 L 197,55 L 197,59 L 211,59 L 211,65 L 189,65 Z"/>
                                    <path d="M 217,40 L 239,40 L 239,46 L 225,46 L 225,59 L 233,59 L 233,52 L 228,52 L 228,47 L 239,47 L 239,65 L 217,65 Z"/>
                                    <path d="M 245,65 L 245,40 L 267,40 L 267,65 L 259,65 L 259,56 L 253,56 L 253,65 Z M 253,50 L 259,50 L 259,46 L 253,46 Z"/>
                                </g>
                                <g fill="#ffffff" stroke="#1565C0" strokeWidth="1.5">
                                    <path d="M 55,115 L 90,115 L 90,119 L 55,119 Z"/>
                                    <path d="M 95,90 L 120,90 L 120,96 L 102,96 L 102,100 L 120,100 L 120,115 L 95,115 L 95,109 L 113,109 L 113,105 L 95,105 Z"/>
                                    <path d="M 125,90 L 132,90 L 132,109 L 143,109 L 143,90 L 150,90 L 150,115 L 125,115 Z"/>
                                    <path d="M 155,90 L 163,90 L 169,105 L 175,90 L 183,90 L 183,115 L 175,115 L 175,98 L 169,110 L 163,98 L 163,115 L 155,115 Z"/>
                                    <path d="M 188,90 L 196,90 L 202,105 L 208,90 L 216,90 L 216,115 L 208,115 L 208,98 L 202,110 L 196,98 L 196,115 L 188,115 Z"/>
                                    <path d="M 221,90 L 243,90 L 243,96 L 229,96 L 229,99 L 241,99 L 241,105 L 229,105 L 229,109 L 243,109 L 243,115 L 221,115 Z"/>
                                    <path d="M 248,90 L 270,90 L 270,103 L 262,103 L 270,115 L 261,115 L 254,103 L 256,103 L 256,96 L 248,96 Z"/>
                                    <path d="M 280,90 L 305,90 L 305,96 L 287,96 L 287,100 L 305,100 L 305,115 L 280,115 L 280,109 L 298,109 L 298,105 L 280,105 Z"/>
                                    <path d="M 310,115 L 310,90 L 332,90 L 332,115 L 324,115 L 324,106 L 318,106 L 318,115 Z M 318,100 L 324,100 L 324,96 L 318,96 Z"/>
                                    <path d="M 337,90 L 344,90 L 344,109 L 359,109 L 359,115 L 337,115 Z"/>
                                    <path d="M 364,90 L 386,90 L 386,96 L 372,96 L 372,99 L 384,99 L 384,105 L 372,105 L 372,109 L 386,109 L 386,115 L 364,115 Z"/>
                                    <path d="M 391,90 L 416,90 L 416,96 L 398,96 L 398,100 L 416,100 L 416,115 L 391,115 L 391,109 L 409,109 L 409,105 L 391,105 Z"/>
                                </g>
                            </svg>
                        </div>
                    );
                }
                return (
                    <div className="mock-widget-lite-banner animate-fade" onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
                        <img src={validImgs[0]} alt="Lite Banner" loading="lazy" />
                        <div className="banner-overlay-gradient">
                            <span className="banner-badge">{bannerConfig.bannerDiscount || "EXCLUSIVE"}</span>
                            <h3 className="banner-title">{bannerConfig.bannerProductName || "Haatza Premium Deals"}</h3>
                            <p className="banner-sub">
                                {bannerConfig.bannerProductId ? `ID: ${bannerConfig.bannerProductId}` : "Get absolute quality verified by darkhouse masters"}
                                {bannerConfig.bannerPrice ? ` • ${bannerConfig.bannerPrice}` : ""}
                            </p>
                        </div>
                        <div className="banner-arrow-icon">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                );

            case "Lite_Promobanner":
                if (isDefaultOrEmpty) {
                    return (
                        <div className="mock-widget-promobanner animate-fade stencil-banner-container" style={{ cursor: 'pointer' }}>
                            <svg viewBox="0 0 400 180" width="100%" height="100%" style={{ display: 'block', borderRadius: '0px' }}>
                                <defs>
                                    <linearGradient id="promoGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#08104D"/>
                                        <stop offset="100%" stopColor="#15206F"/>
                                    </linearGradient>
                                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#FF5722"/>
                                        <stop offset="100%" stopColor="#FF9800"/>
                                    </linearGradient>
                                </defs>
                                <rect width="400" height="180" fill="url(#promoGrad)"/>
                                <g transform="translate(365, 30) scale(0.8)">
                                    <circle cx="0" cy="0" r="30" fill="#E65100"/>
                                    <circle cx="0" cy="0" r="28" fill="#FFF"/>
                                    <path d="M0,0 L0,-25 A25,25 0 0,1 17.6,-17.6 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L17.6,-17.6 A25,25 0 0,1 25,0 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L25,0 A25,25 0 0,1 17.6,17.6 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L17.6,17.6 A25,25 0 0,1 0,25 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L0,25 A25,25 0 0,1 -17.6,17.6 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L-17.6,17.6 A25,25 0 0,1 -25,0 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L-25,0 A25,25 0 0,1 -17.6,-17.6 Z" fill="url(#orangeGrad)"/>
                                    <path d="M0,0 L-17.6,-17.6 A25,25 0 0,1 0,-25 Z" fill="url(#orangeGrad)"/>
                                    <circle cx="0" cy="0" r="4" fill="#FFF"/>
                                </g>
                                <g transform="translate(230, 45) scale(0.6)" stroke="#FFD54F" strokeWidth="3" fill="#111">
                                    <path d="M10,15 L35,15 A12,12 0 0,1 22,27 A12,12 0 0,1 10,15 Z" fill="#222"/>
                                    <path d="M45,15 L70,15 A12,12 0 0,1 57,27 A12,12 0 0,1 45,15 Z" fill="#222"/>
                                    <path d="M35,15 Q40,12 45,15" fill="none" stroke="#FFD54F" strokeWidth="4"/>
                                    <path d="M10,15 C5,12 0,15 0,15" fill="none"/>
                                    <path d="M70,15 C75,12 80,15 80,15" fill="none"/>
                                </g>
                                <g fill="url(#orangeGrad)" stroke="#E65100" strokeWidth="1.5">
                                    <path d="M 145,40 L 153,40 L 169,55 L 175,40 L 183,40 L 183,65 L 175,65 L 175,48 L 169,60 L 163,48 L 163,65 L 155,65 Z"/>
                                    <path d="M 189,40 L 211,40 L 211,46 L 197,46 L 197,49 L 209,49 L 209,55 L 197,55 L 197,59 L 211,59 L 211,65 L 189,65 Z"/>
                                    <path d="M 217,40 L 239,40 L 239,46 L 225,46 L 225,59 L 233,59 L 233,52 L 228,52 L 228,47 L 239,47 L 239,65 L 217,65 Z"/>
                                    <path d="M 245,65 L 245,40 L 267,40 L 267,65 L 259,65 L 259,56 L 253,56 L 253,65 Z M 253,50 L 259,50 L 259,46 L 253,46 Z"/>
                                </g>
                                <g fill="url(#orangeGrad)" stroke="#E65100" strokeWidth="1.5">
                                    <path d="M 55,115 L 90,115 L 90,119 L 55,119 Z"/>
                                    <path d="M 95,90 L 120,90 L 120,96 L 102,96 L 102,100 L 120,100 L 120,115 L 95,115 L 95,109 L 113,109 L 113,105 L 95,105 Z"/>
                                    <path d="M 125,90 L 132,90 L 132,109 L 143,109 L 143,90 L 150,90 L 150,115 L 125,115 Z"/>
                                    <path d="M 155,90 L 163,90 L 169,105 L 175,90 L 183,90 L 183,115 L 175,115 L 175,98 L 169,110 L 163,98 L 163,115 L 155,115 Z"/>
                                    <path d="M 188,90 L 196,90 L 202,105 L 208,90 L 216,90 L 216,115 L 208,115 L 208,98 L 202,110 L 196,98 L 196,115 L 188,115 Z"/>
                                    <path d="M 221,90 L 243,90 L 243,96 L 229,96 L 229,99 L 241,99 L 241,105 L 229,105 L 229,109 L 243,109 L 243,115 L 221,115 Z"/>
                                    <path d="M 248,90 L 270,90 L 270,103 L 262,103 L 270,115 L 261,115 L 254,103 L 256,103 L 256,96 L 248,96 Z"/>
                                    <path d="M 280,90 L 305,90 L 305,96 L 287,96 L 287,100 L 305,100 L 305,115 L 280,115 L 280,109 L 298,109 L 298,105 L 280,105 Z"/>
                                    <path d="M 310,115 L 310,90 L 332,90 L 332,115 L 324,115 L 324,106 L 318,106 L 318,115 Z M 318,100 L 324,100 L 324,96 L 318,96 Z"/>
                                    <path d="M 337,90 L 344,90 L 344,109 L 359,109 L 359,115 L 337,115 Z"/>
                                    <path d="M 364,90 L 386,90 L 386,96 L 372,96 L 372,99 L 384,99 L 384,105 L 372,105 L 372,109 L 386,109 L 386,115 L 364,115 Z"/>
                                    <path d="M 391,90 L 416,90 L 416,96 L 398,96 L 398,100 L 416,100 L 416,115 L 391,115 L 391,109 L 409,109 L 409,105 L 391,105 Z"/>
                                </g>
                            </svg>
                        </div>
                    );
                }
                return (
                    <div className="mock-widget-promobanner animate-fade">
                        <div className="promo-container">
                            <img src={validImgs[0]} alt="Promo Banner" loading="lazy" />
                            <div className="promo-text-wrap">
                                <span className="promo-subtitle">LIMITED TIME OFFER</span>
                                <h2 className="promo-headline">Super Saver Pack</h2>
                                <p className="promo-desc">Stock up today with discount codes applied automatically at billing checkout.</p>
                                <button className="promo-cta-btn">Shop Now</button>
                            </div>
                        </div>
                    </div>
                );

            case "Lite_Shopbycategory":
                return (
                    <div className="mock-widget-shopbycategory animate-fade">
                        <h4 className="widget-header-title">Shop By Category</h4>
                        <div className="category-circle-grid screenshot-style-grid">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx] || podiumCategoryItem;
                                const label = meta.labels[idx] || (idx % 2 === 0 ? "New Rele..." : "Subscripti...");
                                
                                const catMap = [
                                    { id: "cat_elect", name: "Electronics" },
                                    { id: "cat_fash", name: "Fashion" },
                                    { id: "cat_groc", name: "Grocery" },
                                    { id: "cat_pers", name: "Personal Care" },
                                    { id: "cat_home", name: "Home & Kitchen" },
                                    { id: "cat_books", name: "Books" },
                                    { id: "cat_toys", name: "Toys & Games" },
                                    { id: "cat_elect", name: "Electronics" }
                                ];
                                const mappedCat = catMap[idx % catMap.length];

                                return (
                                    <div 
                                        className="category-circle-card screenshot-style-card" 
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategoryInSim(mappedCat.id);
                                            setSimulatorTab("category");
                                            triggerToast(`Viewing Category: ${mappedCat.name}`, "info");
                                        }}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="circle-img-wrap screenshot-style-wrap">
                                            {img ? <img src={img} alt={label} loading="lazy" /> : <div className="circle-placeholder" />}
                                        </div>
                                        <span className="circle-label screenshot-style-label">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "Lite_bannercarousel":
                return (
                    <BannerCarouselWidget images={validImgs} />
                );

            case "TrendingSection":
                return (
                    <div className="mock-widget-trending animate-fade">
                        <div className="section-title-row">
                            <h4 className="widget-header-title">🔥 Trending Products</h4>
                            <span className="section-see-all">See All</span>
                        </div>
                        <div className="trending-horizontal-scroll">
                            {[0, 1, 2, 3].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const title = meta.labels[idx];
                                const price = meta.prices[idx];
                                const rating = meta.ratings[idx];
                                return (
                                    <div className="trending-item-card" key={idx}>
                                        <div className="trending-card-img-wrap">
                                            {img ? <img src={img} alt={title} loading="lazy" /> : <div className="trending-placeholder" />}
                                            <span className="trending-tag">Hot</span>
                                        </div>
                                        <div className="trending-card-details">
                                            <span className="trending-item-title">{title}</span>
                                            <div className="trending-rating">
                                                <Star size={10} className="star-icon-filled" />
                                                <span>{rating}</span>
                                            </div>
                                            <div className="trending-price-row">
                                                <span className="trending-price">{price}</span>
                                                <button className="trending-add-btn"><Plus size={12} /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "ProductSection":
                return (
                    <div className="mock-widget-products animate-fade">
                        <div className="section-title-row">
                            <h4 className="widget-header-title">Weekly Specials</h4>
                            <span className="section-see-all">View 18 Items</span>
                        </div>
                        <div className="product-two-column-grid">
                            {[0, 1, 2, 3].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const title = meta.labels[idx];
                                const price = meta.prices[idx];
                                const rating = meta.ratings[idx];
                                return (
                                    <div className="grid-product-card" key={idx}>
                                        <div className="product-img-wrap">
                                            {img ? <img src={img} alt={title} loading="lazy" /> : <div className="product-placeholder" />}
                                            <div className="wishlist-btn-mock">❤️</div>
                                        </div>
                                        <div className="product-info-wrap">
                                            <span className="product-title-text">{title}</span>
                                            <div className="product-rating-row">
                                                <Star size={10} className="star-icon-filled" />
                                                <span className="rating-score">{rating}</span>
                                                <span className="reviews-count">(42)</span>
                                            </div>
                                            <div className="product-footer-row">
                                                <span className="product-price-val">{price}</span>
                                                <button className="product-add-cart-btn">Add</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "PerfumeSection":
                return (
                    <div className="mock-widget-perfume animate-fade">
                        <div className="perfume-dark-header">
                            <div className="perfume-glow-circle" />
                            <span className="perfume-pretitle">HAATZA PRIVATE COLLECTION</span>
                            <h3 className="perfume-title">Luxury Fragrance Bar</h3>
                            <p className="perfume-desc">Rare elixirs sourced for high society scent profiles</p>
                        </div>
                        <div className="perfume-carousel-scroller">
                            {[0, 1, 2].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const title = meta.labels[idx];
                                const price = meta.prices[idx];
                                return (
                                    <div className="perfume-luxury-card" key={idx}>
                                        <div className="perfume-img-container">
                                            {img ? <img src={img} alt={title} loading="lazy" /> : <div className="perfume-placeholder" />}
                                        </div>
                                        <div className="perfume-content-footer">
                                            <span className="perfume-card-title">{title}</span>
                                            <span className="perfume-card-price">{price}</span>
                                            <button className="perfume-buy-btn">Acquire</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case "KidsSection":
                return (
                    <div className="mock-widget-kids animate-fade">
                        <div className="kids-header-cloud">
                            <span className="kids-tagline">🎨 PLAY TIME!</span>
                            <h3 className="kids-section-title">Kids Active Zone</h3>
                        </div>
                        <div className="kids-cards-grid">
                            {[0, 1, 2, 3].map(idx => {
                                const img = validImgs[idx] || meta.defaultImages[idx];
                                const title = meta.labels[idx];
                                const price = meta.prices[idx];
                                return (
                                    <div className="kids-play-card" key={idx} style={{ backgroundColor: ["#FFEBEB", "#EBF3FF", "#F1FFE5", "#FFFBE5"][idx] }}>
                                        <div className="kids-img-container">
                                            {img ? <img src={img} alt={title} loading="lazy" /> : <div className="kids-placeholder" />}
                                        </div>
                                        <div className="kids-card-footer">
                                            <span className="kids-card-label">{title}</span>
                                            <div className="kids-price-row">
                                                <span className="kids-card-price">{price}</span>
                                                <span className="kids-add-icon">⭐</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }, [selectedWidgetId, bannerConfig, handleBannerClick]);

    // ─── Dynamic Simulator Frame Context Mock ───────────────────────────
    const renderSimulatorContent = useCallback((imagesSource, isBeforeLabel = false) => {
        return (
            <div className="simulator-phone-screen">
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
                    <div className="phone-scrollable-body" ref={phoneBodyRef}>
                        {/* Widget 1: Lite Banner or Lite Banner Carousel */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "Lite_Banner" || selectedWidgetId === "Lite_bannercarousel" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("Lite_Banner")}
                        >
                            {selectedWidgetId === "Lite_bannercarousel" 
                                ? renderWidgetMock("Lite_bannercarousel", imagesSource, isBeforeLabel)
                                : renderWidgetMock("Lite_Banner", imagesSource, isBeforeLabel)
                            }
                        </div>

                        {/* Widget 2: Shop by Category */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "Lite_Shopbycategory" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("Lite_Shopbycategory")}
                        >
                            {renderWidgetMock("Lite_Shopbycategory", imagesSource, isBeforeLabel)}
                        </div>

                        {/* Widget 3: Trending Section */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "TrendingSection" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("TrendingSection")}
                        >
                            {renderWidgetMock("TrendingSection", imagesSource, isBeforeLabel)}
                        </div>

                        {/* Widget 4: Weekly Product Section */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "ProductSection" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("ProductSection")}
                        >
                            {renderWidgetMock("ProductSection", imagesSource, isBeforeLabel)}
                        </div>

                        {/* Widget 5: Promo Banner */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "Lite_Promobanner" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("Lite_Promobanner")}
                        >
                            {renderWidgetMock("Lite_Promobanner", imagesSource, isBeforeLabel)}
                        </div>

                        {/* Widget 6: Perfume Private Collection Section */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "PerfumeSection" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("PerfumeSection")}
                        >
                            {renderWidgetMock("PerfumeSection", imagesSource, isBeforeLabel)}
                        </div>

                        {/* Widget 7: Kids Zone Section */}
                        <div 
                            className={`phone-widget-interactive-wrapper ${selectedWidgetId === "KidsSection" ? "editing-highlight" : ""}`}
                            onClick={() => setSelectedWidgetId("KidsSection")}
                        >
                            {renderWidgetMock("KidsSection", imagesSource, isBeforeLabel)}
                        </div>
                    </div>
                )}

                {simulatorTab === "search" && (
                    <div className="phone-scrollable-body sim-search-page">
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
                    <div className="phone-scrollable-body sim-category-page">
                        <div className="sim-category-tabs-container">
                            <div className="sim-category-tabs-row">
                                {MOCK_CATEGORIES.map(cat => (
                                    <span 
                                        key={cat.categoryId}
                                        className={`sim-cat-tab-pill ${selectedCategoryInSim === cat.categoryId ? "active" : ""}`}
                                        onClick={() => setSelectedCategoryInSim(cat.categoryId)}
                                    >
                                        {cat.categoryName}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="sim-category-banner">
                            <h3>{MOCK_CATEGORIES.find(c => c.categoryId === selectedCategoryInSim)?.categoryName || "Category Feed"}</h3>
                            <p>Showing curated products verified by Haatza</p>
                        </div>

                        {productsMasterList.filter(p => p.mainCategoryId === selectedCategoryInSim).length > 0 ? (
                            <div className="sim-products-grid animate-fade">
                                {productsMasterList.filter(p => p.mainCategoryId === selectedCategoryInSim).map(prod => (
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
                    <div className="phone-scrollable-body sim-details-page">
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
                            </div>
                        )}
                    </div>
                )}

                {simulatorTab === "orders" && (
                    <div className="phone-scrollable-body sim-orders-page">
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
                    <div className="phone-scrollable-body sim-profile-page">
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
    }, [selectedCat, selectedWidgetId, phoneTime, activeMeta, renderWidgetMock, simulatorTab, simSearchQuery, selectedCategoryInSim, selectedProductInSim, productsMasterList, handleBannerClick]);

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
                    <button className="btn-secondary" onClick={() => setShowPreviewAppModal(true)}>
                        <Smartphone size={15} />
                        <span>Preview App</span>
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
                        {selectedWidgetId === "Lite_Banner" && (
                            <div className="lite-banner-config-section animate-fade">
                                <div className="config-section-header">
                                    <h3>Lite Banner Configuration</h3>
                                    <span className="cms-badge">Enterprise Workflow</span>
                                </div>
                                
                                <div className="config-section-body">
                                    {/* ─── STEP 1: BANNER IMAGE ─── */}
                                    <div className="cms-step-card">
                                        <div className="cms-step-header">
                                            <span className="step-num">1</span>
                                            <h4>Banner Image *</h4>
                                        </div>
                                        
                                        <div className="cms-step-content">
                                            <div className={`banner-upload-dropzone-wrapper ${bannerErrors.bannerImage ? 'has-error' : ''}`}>
                                                {bannerConfig.imageUrl ? (
                                                    <div className="cms-image-preview-card">
                                                        <div className="preview-image-container">
                                                            <img src={bannerConfig.imageUrl} alt="Uploaded Banner" className="preview-image-element" />
                                                        </div>
                                                        <div className="preview-image-details">
                                                            <div className="detail-row">
                                                                <span className="detail-label">Image Name:</span>
                                                                <span className="detail-value text-ellipsis" title={imageMetadata[0]?.name || "banner_image.png"}>
                                                                    {imageMetadata[0]?.name || "banner_image.png"}
                                                                </span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">Resolution:</span>
                                                                <span className="detail-value">{imageMetadata[0]?.resolution || "1200 × 600 px"}</span>
                                                            </div>
                                                            <div className="detail-row">
                                                                <span className="detail-label">File Size:</span>
                                                                <span className="detail-value">{imageMetadata[0]?.size || "-"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="preview-image-actions">
                                                            <button 
                                                                type="button" 
                                                                className="btn-preview-action replace" 
                                                                onClick={() => document.getElementById('banner-image-file-input').click()}
                                                            >
                                                                Replace
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn-preview-action delete" 
                                                                onClick={handleBannerImageDelete}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="banner-upload-placeholder" onClick={() => document.getElementById('banner-image-file-input').click()}>
                                                        <div className="upload-icon">📤</div>
                                                        <div className="upload-text">Upload Banner Image</div>
                                                        <div className="upload-reqs">
                                                            <div>Resolution: 1200 × 600 px</div>
                                                            <div>Formats: PNG, JPG, WEBP</div>
                                                            <div>Maximum: 2 MB</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    id="banner-image-file-input" 
                                                    style={{ display: 'none' }} 
                                                    accept="image/png, image/jpeg, image/webp" 
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleBannerImageUpload(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {bannerErrors.bannerImage && (
                                                <div className="error-message-inline">{bannerErrors.bannerImage}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ─── STEP 2: BANNER CONTENT (Only shown after image upload) ─── */}
                                    {bannerConfig.imageUrl && (
                                        <div className="cms-step-card animate-fade">
                                            <div className="cms-step-header">
                                                <span className="step-num">2</span>
                                                <h4>Banner Content *</h4>
                                            </div>
                                            
                                            <div className="cms-step-content">
                                                <div className="form-group-wrap">
                                                    <label className="form-field-label">Load from Product Master</label>
                                                    <div className="product-search-box-wrapper">
                                                        <div className="product-search-input-container">
                                                            <Search size={14} className="search-icon" />
                                                            <input 
                                                                type="text"
                                                                className="styled-select search-input"
                                                                placeholder="Search master database..."
                                                                value={bannerProductSearchQuery}
                                                                onChange={(e) => setBannerProductSearchQuery(e.target.value)}
                                                            />
                                                            {bannerProductSearchQuery && (
                                                                <button 
                                                                    type="button" 
                                                                    className="btn-clear-selection"
                                                                    onClick={() => setBannerProductSearchQuery("")}
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        {bannerProductSearchQuery && (
                                                            <div className="product-search-results-list">
                                                                {filteredBannerSearchProducts.length > 0 ? (
                                                                    filteredBannerSearchProducts.map(prod => (
                                                                        <div key={prod.productId} className="product-search-item-card">
                                                                            <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                            <div className="product-item-details">
                                                                                <div className="product-item-name">{prod.productName}</div>
                                                                                <div className="product-item-id">ID: {prod.productId} | SKU: {prod.sku}</div>
                                                                                <div className="product-item-meta">{prod.price} | {prod.discount}</div>
                                                                            </div>
                                                                            <button 
                                                                                type="button" 
                                                                                className="btn-select-product"
                                                                                onClick={() => {
                                                                                    setBannerConfig(prev => ({
                                                                                        ...prev,
                                                                                        bannerProductId: prod.productId,
                                                                                        bannerProductName: prod.productName,
                                                                                        bannerPrice: prod.price,
                                                                                        bannerDiscount: prod.discount,
                                                                                        bannerMainCategory: prod.mainCategoryId,
                                                                                        bannerSubCategory: prod.subCategoryId
                                                                                    }));
                                                                                    setBannerProductSearchQuery("");
                                                                                    setBannerErrors(prev => ({
                                                                                        ...prev,
                                                                                        bannerProductId: null,
                                                                                        bannerProductName: null,
                                                                                        bannerPrice: null,
                                                                                        bannerMainCategory: null,
                                                                                        bannerSubCategory: null
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                Load
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="no-products-found">No products match search query</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="cms-form-grid-2col">
                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Product ID *</label>
                                                        <input 
                                                            type="text" 
                                                            className={`styled-input ${bannerErrors.bannerProductId ? 'has-error' : ''}`}
                                                            value={bannerConfig.bannerProductId}
                                                            onChange={(e) => {
                                                                setBannerConfig(prev => ({ ...prev, bannerProductId: e.target.value }));
                                                                if (e.target.value) setBannerErrors(prev => ({ ...prev, bannerProductId: null }));
                                                            }}
                                                        />
                                                        {bannerErrors.bannerProductId && (
                                                            <div className="error-message-inline">{bannerErrors.bannerProductId}</div>
                                                        )}
                                                    </div>

                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Product Name *</label>
                                                        <input 
                                                            type="text" 
                                                            className={`styled-input ${bannerErrors.bannerProductName ? 'has-error' : ''}`}
                                                            value={bannerConfig.bannerProductName}
                                                            onChange={(e) => {
                                                                setBannerConfig(prev => ({ ...prev, bannerProductName: e.target.value }));
                                                                if (e.target.value) setBannerErrors(prev => ({ ...prev, bannerProductName: null }));
                                                            }}
                                                        />
                                                        {bannerErrors.bannerProductName && (
                                                            <div className="error-message-inline">{bannerErrors.bannerProductName}</div>
                                                        )}
                                                    </div>

                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Pricing *</label>
                                                        <input 
                                                            type="text" 
                                                            className={`styled-input ${bannerErrors.bannerPrice ? 'has-error' : ''}`}
                                                            value={bannerConfig.bannerPrice}
                                                            onChange={(e) => {
                                                                setBannerConfig(prev => ({ ...prev, bannerPrice: e.target.value }));
                                                                if (e.target.value) setBannerErrors(prev => ({ ...prev, bannerPrice: null }));
                                                            }}
                                                        />
                                                        {bannerErrors.bannerPrice && (
                                                            <div className="error-message-inline">{bannerErrors.bannerPrice}</div>
                                                        )}
                                                    </div>

                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Discount %</label>
                                                        <input 
                                                            type="text" 
                                                            className="styled-input"
                                                            value={bannerConfig.bannerDiscount}
                                                            onChange={(e) => setBannerConfig(prev => ({ ...prev, bannerDiscount: e.target.value }))}
                                                        />
                                                    </div>

                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Main Category *</label>
                                                        <input 
                                                            type="text" 
                                                            className={`styled-input ${bannerErrors.bannerMainCategory ? 'has-error' : ''}`}
                                                            value={bannerConfig.bannerMainCategory}
                                                            onChange={(e) => {
                                                                setBannerConfig(prev => ({ ...prev, bannerMainCategory: e.target.value }));
                                                                if (e.target.value) setBannerErrors(prev => ({ ...prev, bannerMainCategory: null }));
                                                            }}
                                                        />
                                                        {bannerErrors.bannerMainCategory && (
                                                            <div className="error-message-inline">{bannerErrors.bannerMainCategory}</div>
                                                        )}
                                                    </div>

                                                    <div className="form-group-wrap">
                                                        <label className="form-field-label">Sub Category *</label>
                                                        <input 
                                                            type="text" 
                                                            className={`styled-input ${bannerErrors.bannerSubCategory ? 'has-error' : ''}`}
                                                            value={bannerConfig.bannerSubCategory}
                                                            onChange={(e) => {
                                                                setBannerConfig(prev => ({ ...prev, bannerSubCategory: e.target.value }));
                                                                if (e.target.value) setBannerErrors(prev => ({ ...prev, bannerSubCategory: null }));
                                                            }}
                                                        />
                                                        {bannerErrors.bannerSubCategory && (
                                                            <div className="error-message-inline">{bannerErrors.bannerSubCategory}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    className="btn-save-to-db"
                                                    onClick={() => {
                                                        if (!bannerConfig.bannerProductId || !bannerConfig.bannerProductName || !bannerConfig.bannerPrice || !bannerConfig.bannerMainCategory || !bannerConfig.bannerSubCategory) {
                                                            triggerToast("Please fill all required fields in Step 2 to save to Database.", "error");
                                                            return;
                                                        }
                                                        
                                                        const exists = productsMasterList.some(p => p.productId === bannerConfig.bannerProductId);
                                                        
                                                        const newProduct = {
                                                            productId: bannerConfig.bannerProductId,
                                                            productName: bannerConfig.bannerProductName,
                                                            price: bannerConfig.bannerPrice,
                                                            discount: bannerConfig.bannerDiscount || "No Discount",
                                                            mainCategoryId: bannerConfig.bannerMainCategory,
                                                            subCategoryId: bannerConfig.bannerSubCategory,
                                                            sku: `SKU-${bannerConfig.bannerProductId.toUpperCase()}`,
                                                            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80"
                                                        };
                                                        
                                                        let updatedList;
                                                        if (exists) {
                                                            updatedList = productsMasterList.map(p => p.productId === bannerConfig.bannerProductId ? newProduct : p);
                                                            triggerToast("Product updated in Product Master database!");
                                                        } else {
                                                            updatedList = [...productsMasterList, newProduct];
                                                            triggerToast("Product added to Product Master database successfully!");
                                                        }
                                                        
                                                        setProductsMasterList(updatedList);
                                                        localStorage.setItem("haatza_mock_products", JSON.stringify(updatedList));
                                                    }}>
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── STEP 3: REDIRECT CONFIGURATION ─── */}
                                    {bannerConfig.imageUrl && (
                                        <div className="cms-step-card animate-fade">
                                            <div className="cms-step-header">
                                                <span className="step-num">3</span>
                                                <h4>Redirect Destination *</h4>
                                            </div>
                                            
                                            <div className="cms-step-content">
                                                <div className="form-group-wrap">
                                                    <label className="form-field-label">Redirect Type *</label>
                                                    <div className="modern-segmented-control">
                                                        <button 
                                                            type="button"
                                                            className={`segment-btn ${bannerConfig.redirectType === "CATEGORY" ? "active" : ""}`}
                                                            onClick={() => {
                                                                setBannerConfig(prev => ({
                                                                    ...prev,
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
                                                                setBannerErrors(prev => ({ ...prev, redirectType: null, destination: null }));
                                                            }}
                                                        >
                                                            Category Page
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            className={`segment-btn ${bannerConfig.redirectType === "PRODUCT" ? "active" : ""}`}
                                                            onClick={() => {
                                                                setBannerConfig(prev => ({
                                                                    ...prev,
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
                                                                setBannerErrors(prev => ({ ...prev, redirectType: null, destination: null }));
                                                            }}
                                                        >
                                                            Product Page
                                                        </button>
                                                    </div>
                                                    {bannerErrors.redirectType && (
                                                        <div className="error-message-inline">{bannerErrors.redirectType}</div>
                                                    )}
                                                </div>

                                                {/* Category Redirection Form */}
                                                {bannerConfig.redirectType === "CATEGORY" && (
                                                    <div className="form-group-wrap animate-fade">
                                                        <label className="form-field-label">Search Category</label>
                                                        {isLoadingCategories ? (
                                                            <div className="loading-categories-indicator">Loading categories...</div>
                                                        ) : (
                                                            <SearchableSelect
                                                                placeholder="Search category..."
                                                                options={categoriesList.map(cat => ({ value: cat.categoryId, label: cat.categoryName }))}
                                                                value={bannerConfig.categoryId}
                                                                onChange={(val, option) => {
                                                                    setBannerConfig(prev => ({
                                                                        ...prev,
                                                                        categoryId: val,
                                                                        categoryName: option ? option.label : ""
                                                                    }));
                                                                    setBannerErrors(prev => ({ ...prev, destination: null }));
                                                                }}
                                                                displayKey="label"
                                                                valueKey="value"
                                                                searchKey="label"
                                                            />
                                                        )}
                                                        {bannerErrors.destination && !bannerConfig.categoryId && (
                                                            <div className="error-message-inline">{bannerErrors.destination}</div>
                                                        )}

                                                        {/* Selected Category Read-Only Display */}
                                                        {bannerConfig.categoryId && (
                                                            <div className="selected-info-display-card category-theme animate-scale">
                                                                <div className="display-card-title">Selected Category</div>
                                                                <div className="display-card-body">
                                                                    <div className="display-info-row">
                                                                        <span className="info-label">Category Name:</span>
                                                                        <strong className="info-val">{bannerConfig.categoryName}</strong>
                                                                    </div>
                                                                    <div className="display-info-row">
                                                                        <span className="info-label">Category ID:</span>
                                                                        <strong className="info-val code-font">{bannerConfig.categoryId}</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Product Redirection Form */}
                                                {bannerConfig.redirectType === "PRODUCT" && (
                                                    <div className="form-group-wrap animate-fade">
                                                        <label className="form-field-label">Load from Product Master</label>
                                                        <div className="product-search-box-wrapper">
                                                            <div className="product-search-input-container">
                                                                <Search size={14} className="search-icon" />
                                                                <input 
                                                                    type="text"
                                                                    className="styled-select search-input"
                                                                    placeholder="Search master database..."
                                                                    value={destProductSearchQuery}
                                                                    onChange={(e) => setDestProductSearchQuery(e.target.value)}
                                                                />
                                                                {destProductSearchQuery && (
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn-clear-selection"
                                                                        onClick={() => setDestProductSearchQuery("")}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            
                                                            {destProductSearchQuery && (
                                                                <div className="product-search-results-list">
                                                                    {filteredDestSearchProducts.length > 0 ? (
                                                                        filteredDestSearchProducts.map(prod => (
                                                                            <div key={prod.productId} className="product-search-item-card">
                                                                                <img src={prod.image} alt={prod.productName} className="product-item-thumb" />
                                                                                <div className="product-item-details">
                                                                                    <div className="product-item-name">{prod.productName}</div>
                                                                                    <div className="product-item-id">ID: {prod.productId} | SKU: {prod.sku}</div>
                                                                                    <div className="product-item-meta">{prod.price} | {prod.discount}</div>
                                                                                </div>
                                                                                <button 
                                                                                    type="button" 
                                                                                    className="btn-select-product"
                                                                                    onClick={() => {
                                                                                        setBannerConfig(prev => ({
                                                                                            ...prev,
                                                                                            destProductId: prod.productId,
                                                                                            destProductName: prod.productName,
                                                                                            destPrice: prod.price,
                                                                                            destDiscount: prod.discount,
                                                                                            destMainCategory: prod.mainCategoryId,
                                                                                            destSubCategory: prod.subCategoryId
                                                                                        }));
                                                                                        setDestProductSearchQuery("");
                                                                                        setBannerErrors(prev => ({
                                                                                            ...prev,
                                                                                            destProductId: null,
                                                                                            destProductName: null,
                                                                                            destPrice: null,
                                                                                            destMainCategory: null,
                                                                                            destSubCategory: null
                                                                                        }));
                                                                                    }}
                                                                                >
                                                                                    Load
                                                                                </button>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="no-products-found">No products match search query</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="cms-form-grid-2col" style={{ marginTop: '12px' }}>
                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Product ID *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className={`styled-input ${bannerErrors.destProductId ? 'has-error' : ''}`}
                                                                    value={bannerConfig.destProductId}
                                                                    onChange={(e) => {
                                                                        setBannerConfig(prev => ({ ...prev, destProductId: e.target.value }));
                                                                        if (e.target.value) setBannerErrors(prev => ({ ...prev, destProductId: null }));
                                                                    }}
                                                                />
                                                                {bannerErrors.destProductId && (
                                                                    <div className="error-message-inline">{bannerErrors.destProductId}</div>
                                                                )}
                                                            </div>

                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Product Name *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className={`styled-input ${bannerErrors.destProductName ? 'has-error' : ''}`}
                                                                    value={bannerConfig.destProductName}
                                                                    onChange={(e) => {
                                                                        setBannerConfig(prev => ({ ...prev, destProductName: e.target.value }));
                                                                        if (e.target.value) setBannerErrors(prev => ({ ...prev, destProductName: null }));
                                                                    }}
                                                                />
                                                                {bannerErrors.destProductName && (
                                                                    <div className="error-message-inline">{bannerErrors.destProductName}</div>
                                                                )}
                                                            </div>

                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Pricing *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className={`styled-input ${bannerErrors.destPrice ? 'has-error' : ''}`}
                                                                    value={bannerConfig.destPrice}
                                                                    onChange={(e) => {
                                                                        setBannerConfig(prev => ({ ...prev, destPrice: e.target.value }));
                                                                        if (e.target.value) setBannerErrors(prev => ({ ...prev, destPrice: null }));
                                                                    }}
                                                                />
                                                                {bannerErrors.destPrice && (
                                                                    <div className="error-message-inline">{bannerErrors.destPrice}</div>
                                                                )}
                                                            </div>

                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Discount %</label>
                                                                <input 
                                                                    type="text" 
                                                                    className="styled-input"
                                                                    value={bannerConfig.destDiscount}
                                                                    onChange={(e) => setBannerConfig(prev => ({ ...prev, destDiscount: e.target.value }))}
                                                                />
                                                            </div>

                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Main Category *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className={`styled-input ${bannerErrors.destMainCategory ? 'has-error' : ''}`}
                                                                    value={bannerConfig.destMainCategory}
                                                                    onChange={(e) => {
                                                                        setBannerConfig(prev => ({ ...prev, destMainCategory: e.target.value }));
                                                                        if (e.target.value) setBannerErrors(prev => ({ ...prev, destMainCategory: null }));
                                                                    }}
                                                                />
                                                                {bannerErrors.destMainCategory && (
                                                                    <div className="error-message-inline">{bannerErrors.destMainCategory}</div>
                                                                )}
                                                            </div>

                                                            <div className="form-group-wrap">
                                                                <label className="form-field-label">Destination Sub Category *</label>
                                                                <input 
                                                                    type="text" 
                                                                    className={`styled-input ${bannerErrors.destSubCategory ? 'has-error' : ''}`}
                                                                    value={bannerConfig.destSubCategory}
                                                                    onChange={(e) => {
                                                                        setBannerConfig(prev => ({ ...prev, destSubCategory: e.target.value }));
                                                                        if (e.target.value) setBannerErrors(prev => ({ ...prev, destSubCategory: null }));
                                                                    }}
                                                                />
                                                                {bannerErrors.destSubCategory && (
                                                                    <div className="error-message-inline">{bannerErrors.destSubCategory}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── STEP 4: CONFIGURATION SUMMARY ─── */}
                                    {bannerConfig.imageUrl && (
                                        <div className="cms-step-card summary-card animate-fade">
                                            <div className="cms-step-header">
                                                <span className="step-num">4</span>
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
                                                        <strong className="summary-value text-ellipsis" title={imageMetadata[0]?.name || "No image uploaded"}>
                                                            {imageMetadata[0]?.name || "No image uploaded"}
                                                        </strong>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span className="summary-label">Banner Content:</span>
                                                        <strong className="summary-value text-ellipsis" title={bannerConfig.bannerProductName || "Not configured"}>
                                                            {bannerConfig.bannerProductName ? `${bannerConfig.bannerProductName} (${bannerConfig.bannerProductId})` : "Not configured"}
                                                        </strong>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span className="summary-label">Redirect:</span>
                                                        <strong className="summary-value">
                                                            {bannerConfig.redirectType === "PRODUCT" ? "Product Page" : (bannerConfig.redirectType === "CATEGORY" ? "Category Page" : "Not configured")}
                                                        </strong>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span className="summary-label">Destination:</span>
                                                        <strong className="summary-value text-ellipsis">
                                                            {bannerConfig.redirectType === "PRODUCT" ? (bannerConfig.destProductName ? `${bannerConfig.destProductName} (${bannerConfig.destProductId})` : "Not selected") : (bannerConfig.redirectType === "CATEGORY" ? (bannerConfig.categoryName ? `${bannerConfig.categoryName} (${bannerConfig.categoryId})` : "Not selected") : "Not selected")}
                                                        </strong>
                                                    </div>
                                                    <div className="summary-row status-row">
                                                        <span className="summary-label">Status:</span>
                                                        <span className={`summary-status-badge ${Object.keys(validateBannerForm()).length === 0 ? "ready" : "incomplete"}`}>
                                                            {Object.keys(validateBannerForm()).length === 0 ? "Ready To Publish" : "Incomplete"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

            {/* ─── MODAL: PREVIEW APP (QR SIMULATOR) ─── */}
            {showPreviewAppModal && (
                <div className="modal-backdrop" onClick={() => setShowPreviewAppModal(false)}>
                    <div className="modal-content-panel app-qr-modal animate-scale" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowPreviewAppModal(false)}>
                            <X size={20} />
                        </button>
                        <div className="modal-dialog-body text-center">
                            <div className="modal-icon-header-wrapper">
                                <Smartphone size={32} className="text-primary animate-pulse" />
                            </div>
                            <h2>Scan to Preview on Device</h2>
                            <p>Test layout dimensions and color fidelity instantly inside the customer mobile app sandbox.</p>
                            
                            <div className="qr-code-simulator-box">
                                {/* SVG representing a generated QR Code */}
                                <svg width="180" height="180" viewBox="0 0 100 100" className="mock-qr-svg">
                                    <path d="M0,0 h30 v30 h-30 z M0,10 h20 v10 h-20 z M10,0 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#111827" />
                                    <path d="M35,5 h10 v10 h-10 z M50,5 h10 v10 h-10 z M5,35 h10 v10 h-10 z M25,35 h15 v15 h-15 z M45,35 h10 v15 h-10 z M5,50 h10 v10 h-10 z M75,35 h10 v10 h-10 z M90,35 h10 v10 h-10 z M75,50 h15 v15 h-15 z M35,65 h10 v10 h-10 z M45,75 h15 v15 h-15 z M65,75 h10 v10 h-10 z M75,75 h20 v20 h-20 z" fill="#111827" />
                                </svg>
                                <span className="qr-expiry-notice">Expires in 10 minutes</span>
                            </div>

                            <div className="url-copy-box">
                                <span className="url-label font-mono">haatza://preview-widget?id={selectedWidgetId}</span>
                                <button 
                                    className="copy-btn"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`haatza://preview-widget?id=${selectedWidgetId}`);
                                        triggerToast("App Sandbox URI copied to clipboard!");
                                    }}
                                >
                                    Copy URI
                                </button>
                            </div>

                            <p className="qr-help-info">Ensure your phone is connected to the same VPN node as the Central Alpha warehouse servers.</p>
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
const BannerCarouselWidget = React.memo(function BannerCarouselWidget({ images }) {
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
        <div className="mock-widget-banner-carousel animate-fade">
            <div className="carousel-slide-view">
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
                    <h4>Smart Summer Living</h4>
                    <p>Upgrade your space with selected category discounts today.</p>
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
