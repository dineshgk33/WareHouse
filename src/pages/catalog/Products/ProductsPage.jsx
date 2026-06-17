import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Download, 
    Eye, 
    Edit2, 
    Copy, 
    Power, 
    Trash2, 
    Package, 
    ShoppingBag, 
    AlertTriangle, 
    UserCheck,
    Search,
    BookOpen,
    ArrowRight,
    ArrowLeft,
    Check,
    FileText,
    Image as ImageIcon,
    Tag,
    Warehouse,
    AlertCircle
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import PimSelfTestConsole from "./PimSelfTestConsole";
import { INITIAL_DARKHOUSES } from "../../../data/darkhouses";
import { 
    MOCK_BRANDS, 
    MOCK_SUBCATEGORIES_MAP, 
    DYNAMIC_ATTRIBUTES_CONFIG 
} from "../../../data/catalogData";
import { getProducts, saveProducts, getCategories, addAuditLog } from "../../../services/dbService";
import "./ProductsPage.css";

const PAGE_SIZE = 5;

function ProductsPage() {
    const [productsList, setProductsList] = useState(() => getProducts());
    const categories = useMemo(() => getCategories(), []);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [brandFilter, setBrandFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Wizard active step state
    const [activeStep, setActiveStep] = useState(1);

    // Form fields state
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        barcode: "",
        category: "Fruits & Vegetables",
        subcategory: "Fruits",
        brand: "Organic India",
        mrp: 0,
        sellingPrice: 0,
        discount: 0,
        tax: 5,
        stock: 0,
        reorderLevel: 10,
        unit: "1 kg",
        status: "Draft",
        image: "📦",
        description: "",
        attributes: {},
        images: {
            primary: "📦",
            secondary: [],
            gallery: [],
            thumbnail: "📦"
        },
        warehouseAssignments: []
    });

    const [formErrors, setFormErrors] = useState({});

    // Dynamic subcategories list helper
    const subcategoriesList = useMemo(() => {
        return MOCK_SUBCATEGORIES_MAP[formData.category] || [];
    }, [formData.category]);

    // Dynamic attributes schema helper
    const currentAttributesSchema = useMemo(() => {
        // Resolve mapped schema key e.g. "Fruits", "Vegetables", "Dairy", etc.
        const key = formData.subcategory;
        return DYNAMIC_ATTRIBUTES_CONFIG[key] || [];
    }, [formData.subcategory]);

    // ─── Auto SKU Generation ──────────────────────────────────────────────────
    const generateAutoSKU = () => {
        // Derive category prefix (first 3 chars, e.g. FRT, DRY, SNK)
        let catCode = "GEN";
        if (formData.category.includes("Fruits")) catCode = "FRT";
        else if (formData.category.includes("Dairy")) catCode = "DRY";
        else if (formData.category.includes("Munchies")) catCode = "SNK";
        else if (formData.category.includes("Cold Drinks")) catCode = "DRK";
        else if (formData.category.includes("Instant")) catCode = "FZN";
        else if (formData.category.includes("Personal")) catCode = "PSC";
        else if (formData.category.includes("Electronics")) catCode = "ELC";
        else if (formData.category.includes("Fashion")) catCode = "FSH";

        // Derive subcategory prefix (first 3 chars)
        const subcatCode = (formData.subcategory || "GEN").substring(0, 3).toUpperCase();
        
        // Derive brand prefix
        const brandCode = (formData.brand || "GEN").substring(0, 3).toUpperCase();

        const prefix = `${catCode}-${subcatCode}-${brandCode}-`;

        // Filter current products list to find the latest index
        const matches = productsList.filter(p => p.sku && p.sku.startsWith(prefix));
        let maxIndex = 0;
        matches.forEach(p => {
            const parts = p.sku.split("-");
            const numPart = parseInt(parts[parts.length - 1]);
            if (!isNaN(numPart) && numPart > maxIndex) {
                maxIndex = numPart;
            }
        });

        const nextIndex = String(maxIndex + 1).padStart(4, "0");
        return `${prefix}${nextIndex}`;
    };

    // ─── Search and Filters Configuration ─────────────────────────────────────
    const filters = [
        {
            key: "category",
            value: catFilter,
            onChange: (e) => { setCatFilter(e.target.value); setCurrentPage(1); },
            options: ["All", ...categories.map(c => c.name)],
            label: "Filter by Category"
        },
        {
            key: "brand",
            value: brandFilter,
            onChange: (e) => { setBrandFilter(e.target.value); setCurrentPage(1); },
            options: ["All", ...MOCK_BRANDS.map(b => b.name)],
            label: "Filter by Brand"
        },
        {
            key: "status",
            value: statusFilter,
            onChange: (e) => { setStatusFilter(e.target.value); setCurrentPage(1); },
            options: [
                { value: "All", label: "All Statuses" },
                { value: "Published", label: "Published" },
                { value: "Pending Review", label: "Pending Review" },
                { value: "Draft", label: "Draft" },
                { value: "Inactive", label: "Inactive" }
            ],
            label: "Filter by Status"
        }
    ];

    // ─── Search and Filter Action ─────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        return productsList.filter((prod) => {
            const matchesSearch = 
                prod.name.toLowerCase().includes(search.toLowerCase()) ||
                (prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase())) ||
                (prod.barcode && prod.barcode.toLowerCase().includes(search.toLowerCase()));
            
            const matchesCategory = catFilter === "All" || prod.category === catFilter;
            const matchesBrand = brandFilter === "All" || prod.brand === brandFilter;
            const matchesStatus = statusFilter === "All" || prod.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
        });
    }, [search, catFilter, brandFilter, statusFilter, productsList]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedProducts = filteredProducts.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stat Card Values ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = productsList.length;
        const active = productsList.filter(p => p.status === "Published").length;
        const draft = productsList.filter(p => p.status === "Draft").length;
        const pending = productsList.filter(p => p.status === "Pending Review").length;
        return { total, active, draft, pending };
    }, [productsList]);

    // ─── Form Handlers ────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: ["mrp", "sellingPrice", "discount", "tax", "stock", "reorderLevel"].includes(name)
                    ? parseFloat(value) || 0
                    : value
            };
            
            if (name === "mrp" || name === "sellingPrice") {
                const mrpVal = name === "mrp" ? parseFloat(value) || 0 : prev.mrp;
                const sellVal = name === "sellingPrice" ? parseFloat(value) || 0 : prev.sellingPrice;
                if (mrpVal > 0) {
                    updated.discount = parseFloat(((mrpVal - sellVal) / mrpVal * 100).toFixed(1));
                }
            }

            // Category switches update subcategory default
            if (name === "category") {
                const subList = MOCK_SUBCATEGORIES_MAP[value] || [];
                updated.subcategory = subList[0] || "";
                updated.attributes = {};
            }

            return updated;
        });

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleDynamicAttrChange = (code, val) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [code]: val
            }
        }));

        if (formErrors[code]) {
            setFormErrors(prev => ({ ...prev, [code]: "" }));
        }
    };

    const handleWarehouseCheckbox = (dhName) => {
        setFormData(prev => {
            const exists = prev.warehouseAssignments.some(w => w.name === dhName);
            if (exists) {
                const filtered = prev.warehouseAssignments.filter(w => w.name !== dhName);
                const totalStock = filtered.reduce((acc, curr) => acc + curr.stock, 0);
                return {
                    ...prev,
                    warehouseAssignments: filtered,
                    stock: totalStock
                };
            } else {
                const updatedAssignments = [...prev.warehouseAssignments, { name: dhName, stock: 50 }];
                const totalStock = updatedAssignments.reduce((acc, curr) => acc + curr.stock, 0);
                return {
                    ...prev,
                    warehouseAssignments: updatedAssignments,
                    stock: totalStock
                };
            }
        });
    };

    const handleWarehouseStockChange = (dhName, stockVal) => {
        setFormData(prev => {
            const updated = prev.warehouseAssignments.map(w => {
                if (w.name === dhName) {
                    return { ...w, stock: parseInt(stockVal) || 0 };
                }
                return w;
            });
            const totalStock = updated.reduce((acc, curr) => acc + curr.stock, 0);
            return {
                ...prev,
                warehouseAssignments: updated,
                stock: totalStock
            };
        });
    };

    // ─── Image validation simulation ──────────────────────────────────────────
    const handleImageFileMock = (type, e) => {
        const fileVal = e.target.value;
        const fakeName = fileVal.split("\\").pop();
        
        // Simulating aspect ratios & limits checks
        if (fakeName.toLowerCase().endsWith(".gif")) {
            setFormErrors(prev => ({ ...prev, images: "Blocked: Only JPG, PNG and WebP are allowed (GIF upload denied)." }));
            return;
        }

        // Mock size check based on name suffix
        if (fakeName.includes("large")) {
            setFormErrors(prev => ({ ...prev, images: "Blocked: File size exceeds 2MB limit." }));
            return;
        }

        setFormErrors(prev => ({ ...prev, images: "" }));
        
        // Set visual mock emoji
        let visualEmoji = "📦";
        if (formData.category.includes("Fruits")) visualEmoji = "🍎";
        else if (formData.category.includes("Dairy")) visualEmoji = "🥛";
        else if (formData.category.includes("Munchies")) visualEmoji = "🍿";
        else if (formData.category.includes("Cold Drinks")) visualEmoji = "🥤";
        else if (formData.category.includes("Electronics")) visualEmoji = "⚡";
        else if (formData.category.includes("Fashion")) visualEmoji = "👕";

        setFormData(prev => ({
            ...prev,
            image: visualEmoji,
            images: {
                ...prev.images,
                primary: fakeName || visualEmoji,
                thumbnail: visualEmoji
            }
        }));
    };

    // ─── Step Transitions & Validations ───────────────────────────────────────
    const validateStep = (step) => {
        const errors = {};
        
        if (step === 1) {
            if (!formData.category) errors.category = "Category is required";
            if (!formData.subcategory) errors.subcategory = "Subcategory is required";
        }
        
        if (step === 2) {
            if (!formData.name.trim()) errors.name = "Product name is required";
            if (!formData.brand) errors.brand = "Brand is required";
            if (!formData.unit.trim()) errors.unit = "Unit size (e.g. 1 kg) is required";
        }

        if (step === 3) {
            // Validate required dynamic attributes
            currentAttributesSchema.forEach(schema => {
                const val = formData.attributes[schema.code];
                if (schema.required && (val === undefined || val === "")) {
                    errors[schema.code] = `${schema.name} is required for this product type`;
                }

                // FSSAI pattern validation
                if (schema.code === "fssaiNumber" && val) {
                    const pattern = /^[0-9]{14}$/;
                    if (!pattern.test(val)) {
                        errors.fssaiNumber = "FSSAI license must be exactly 14 digits";
                    }
                }
            });
        }

        if (step === 5) {
            if (formData.mrp <= 0) errors.mrp = "MRP must be greater than 0";
            if (formData.sellingPrice <= 0) errors.sellingPrice = "Selling price must be greater than 0";
            if (formData.sellingPrice > formData.mrp) errors.sellingPrice = "Selling price cannot exceed MRP";
            if (formData.darkhousePrice && formData.darkhousePrice > formData.sellingPrice) {
                errors.darkhousePrice = "Darkhouse price cannot exceed retail selling price";
            }
        }

        if (step === 6) {
            // If mapping exists, check that warehouses are active
            const hasInactiveHub = formData.warehouseAssignments.some(w => {
                const dhInfo = INITIAL_DARKHOUSES.find(dh => dh.name === w.name);
                return dhInfo && dhInfo.status === "INACTIVE";
            });
            if (hasInactiveHub) {
                errors.warehouseAssignments = "Invalid mapping: Cannot assign inventory to inactive darkhouses (e.g. Bandra Hub).";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
        if (!validateStep(activeStep)) return;
        
        if (activeStep === 6) {
            // Generate auto SKU for step 7 review
            setFormData(prev => ({
                ...prev,
                sku: prev.sku || generateAutoSKU()
            }));
        }

        setActiveStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setActiveStep(prev => Math.max(1, prev - 1));
    };

    // ─── Submit Action ────────────────────────────────────────────────────────
    const handleWizardSubmit = (e) => {
        e.preventDefault();
        if (!validateStep(activeStep)) return;

        // Lifecycle transitions check: cannot publish directly if Draft is empty
        if (formData.status === "Published" && !formData.name) {
            alert("Error: Cannot publish empty draft.");
            return;
        }

        // Duplicate SKU Check
        const isSkuDuplicate = productsList.some(p => p.sku === formData.sku && p.id !== selectedProduct?.id);
        if (isSkuDuplicate) {
            setFormErrors({ sku: `SKU conflict: The generated SKU code ${formData.sku} is already active.` });
            return;
        }

        if (isEditMode) {
            const updated = productsList.map(p => {
                if (p.id === selectedProduct.id) {
                    const newProd = { ...p, ...formData };
                    addAuditLog(
                        sessionStorage.getItem("username") || "PIM Manager",
                        "Product Updated",
                        "Product Management",
                        p,
                        newProd,
                        `Updated product: ${p.name}`
                    );
                    return newProd;
                }
                return p;
            });
            setProductsList(updated);
            saveProducts(updated);
        } else {
            const newProduct = {
                id: `PRD-${Date.now().toString().slice(-4)}`,
                ...formData
            };
            const updated = [newProduct, ...productsList];
            setProductsList(updated);
            saveProducts(updated);
            addAuditLog(
                sessionStorage.getItem("username") || "PIM Manager",
                "Product Created",
                "Product Management",
                null,
                newProduct,
                `Created new product: ${newProduct.name}`
            );
        }

        setIsWizardOpen(false);
    };

    // ─── Action Triggers ──────────────────────────────────────────────────────
    const handleOpenAddWizard = () => {
        setFormData({
            name: "",
            sku: "",
            barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            category: "Fruits & Vegetables",
            subcategory: "Fruits",
            brand: "Organic India",
            mrp: 0,
            sellingPrice: 0,
            discount: 0,
            tax: 5,
            stock: 0,
            reorderLevel: 10,
            unit: "1 kg",
            status: "Draft",
            image: "📦",
            description: "",
            attributes: {},
            images: {
                primary: "📦",
                secondary: [],
                gallery: [],
                thumbnail: "📦"
            },
            warehouseAssignments: []
        });
        setFormErrors({});
        setIsEditMode(false);
        setActiveStep(1);
        setIsWizardOpen(true);
    };

    const handleOpenEditWizard = (product, closeMenu) => {
        setSelectedProduct(product);
        setFormData({
            ...product,
            images: product.images || { primary: product.image || "📦", secondary: [], gallery: [], thumbnail: product.image || "📦" },
            warehouseAssignments: product.warehouseAssignments || []
        });
        setFormErrors({});
        setIsEditMode(true);
        setActiveStep(1);
        setIsWizardOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleDuplicate = (product, closeMenu) => {
        const duplicated = {
            ...product,
            id: `PRD-${Date.now().toString().slice(-4)}`,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}-COPY`,
            barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`
        };
        const updated = [duplicated, ...productsList];
        setProductsList(updated);
        saveProducts(updated);
        addAuditLog(
            sessionStorage.getItem("username") || "PIM Manager",
            "Product Duplicated",
            "Product Management",
            product,
            duplicated,
            `Duplicated product ${product.name} as ${duplicated.name}`
        );
        if (closeMenu) closeMenu();
    };

    const handleToggleStatus = (product, closeMenu) => {
        const updated = productsList.map(p => {
            if (p.id === product.id) {
                const nextStatus = p.status === "Published" ? "Inactive" : "Published";
                const newProd = { ...p, status: nextStatus };
                addAuditLog(
                    sessionStorage.getItem("username") || "PIM Manager",
                    "Product Status Toggled",
                    "Product Management",
                    p,
                    newProd,
                    `Toggled status of ${p.name} to ${nextStatus}`
                );
                return newProd;
            }
            return p;
        });
        setProductsList(updated);
        saveProducts(updated);
        if (closeMenu) closeMenu();
    };

    const handleDelete = (productId, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            const target = productsList.find(p => p.id === productId);
            const updated = productsList.filter(p => p.id !== productId);
            setProductsList(updated);
            saveProducts(updated);
            if (target) {
                addAuditLog(
                    sessionStorage.getItem("username") || "PIM Manager",
                    "Product Deleted",
                    "Product Management",
                    target,
                    null,
                    `Deleted product: ${target.name}`
                );
            }
            if (closeMenu) closeMenu();
        }
    };

    const handleOpenDetails = (product, closeMenu) => {
        setSelectedProduct(product);
        setIsDetailsModalOpen(true);
        if (closeMenu) closeMenu();
    };

    // ─── Table Columns Configuration ──────────────────────────────────────────
    const columns = [
        {
            header: "Product SKU & Name",
            render: (row) => (
                <div className="prod-cell-info">
                    <span className="prod-cell-icon">{row.image || "📦"}</span>
                    <div className="prod-cell-text">
                        <span className="prod-cell-name">{row.name}</span>
                        <span className="prod-cell-sku">SKU: {row.sku || "N/A"}</span>
                    </div>
                </div>
            )
        },
        { header: "Category", render: (row) => `${row.category} (${row.subcategory || "N/A"})` },
        { header: "Brand", key: "brand" },
        {
            header: "Pricing",
            render: (row) => (
                <div className="prod-price-cell">
                    <span className="prod-price-sell">₹{row.sellingPrice}</span>
                    <span className="prod-price-mrp">₹{row.mrp}</span>
                </div>
            )
        },
        {
            header: "Total Stock",
            render: (row) => {
                const isLow = row.stock <= row.reorderLevel && row.stock > 0;
                return (
                    <span className={`prod-stock-num ${row.stock === 0 ? "out" : isLow ? "low" : ""}`}>
                        {row.stock} Units
                    </span>
                );
            }
        },
        {
            header: "PIM Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="products-view fade-in">
            {/* Page Header */}
            <PageHeader
                title="PIM Enterprise Catalog"
                description="Manage HAATZA's quick-commerce product catalogs with robust attribute schemas and lifecycle flows"
                primaryAction={{
                    label: "Create Product Wizard",
                    icon: Plus,
                    onClick: handleOpenAddWizard
                }}
            />

            {/* Test Runner Suite Panel */}
            <PimSelfTestConsole 
                onRunTestFeedback={(res) => {
                    console.log("Self Tests Executed Successfully:", res);
                }} 
            />

            {/* Statistics */}
            <div className="prod-stats-grid">
                <StatCard
                    title="SKU Pool Count"
                    value={String(stats.total)}
                    icon={Package}
                    trend="+5%"
                    trendType="success"
                    defaultPeriod="Total pool"
                />
                <StatCard
                    title="Active Published"
                    value={String(stats.active)}
                    icon={UserCheck}
                    trend="+2%"
                    trendType="success"
                    defaultPeriod="Storefront visible"
                />
                <StatCard
                    title="Drafts In-work"
                    value={String(stats.draft)}
                    icon={BookOpen}
                    trend="0%"
                    trendType="neutral"
                    defaultPeriod="Work in progress"
                />
                <StatCard
                    title="Pending Audit"
                    value={String(stats.pending)}
                    icon={AlertTriangle}
                    trend="+12%"
                    trendType="danger"
                    defaultPeriod="Awaiting approval"
                />
            </div>

            {/* Products Table Card */}
            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name, SKU or barcode..."
                    filters={filters}
                />

                <DataTable
                    columns={columns}
                    data={paginatedProducts}
                    rowIdKey="id"
                    onRowClick={(row) => handleOpenDetails(row)}
                    emptyMessage="No products match your catalog filters"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenDetails(row, closeMenu)}>
                                <Eye size={14} />
                                <span>View Details</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditWizard(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Product</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleDuplicate(row, closeMenu)}>
                                <Copy size={14} />
                                <span>Duplicate</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleToggleStatus(row, closeMenu)}>
                                <Power size={14} />
                                <span>{row.status === "Published" ? "Draft Back" : "Publish"}</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Product</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                    <div className="prod-pagination">
                        <span className="prod-pagination-info">
                            Showing <strong>{Math.min(filteredProducts.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredProducts.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredProducts.length}</strong> catalog entries
                        </span>
                        
                        <div className="prod-pagination-controls">
                            <button
                                className="prod-page-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`prod-page-btn prod-page-number ${
                                        safePage === page ? "prod-page-btn--active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                className="prod-page-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── PIM WIZARD MODAL ────────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                title={isEditMode ? "Edit Product Workspace" : "Enterprise Product Wizard"}
                description={`Step ${activeStep} of 7 - Catalog mapping controls`}
                icon={Package}
                sizeClass="large"
                footer={(
                    <div className="pim-wizard-footer">
                        {activeStep > 1 && (
                            <button type="button" className="btn-cancel" onClick={handlePrevStep}>
                                <ArrowLeft size={14} />
                                <span>Back</span>
                            </button>
                        )}
                        {activeStep < 7 ? (
                            <button type="button" className="btn-submit" onClick={handleNextStep}>
                                <span>Continue</span>
                                <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button type="submit" form="pim-wizard-form" className="btn-submit btn-publish-final">
                                <Check size={14} />
                                <span>Save & Commit Product</span>
                            </button>
                        )}
                    </div>
                )}
            >
                {/* Horizontal Progress Bar */}
                <div className="pim-wizard-steps">
                    {[
                        { step: 1, label: "Category" },
                        { step: 2, label: "Core Fields" },
                        { step: 3, label: "Attributes" },
                        { step: 4, label: "Media" },
                        { step: 5, label: "Pricing" },
                        { step: 6, label: "Warehouse" },
                        { step: 7, label: "Review" }
                    ].map(item => (
                        <div key={item.step} className={`pim-wizard-step ${activeStep === item.step ? "active" : activeStep > item.step ? "completed" : ""}`}>
                            <span className="step-num">{activeStep > item.step ? "✓" : item.step}</span>
                            <span className="step-label">{item.label}</span>
                        </div>
                    ))}
                </div>

                <form id="pim-wizard-form" onSubmit={handleWizardSubmit} className="pim-wizard-body">
                    
                    {/* STEP 1: Category Mapping */}
                    {activeStep === 1 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 1: Category Classification</div>
                            <div className="cat-form-group">
                                <label htmlFor="category">Store Category</label>
                                <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="cat-form-group">
                                <label htmlFor="subcategory">Store Subcategory</label>
                                <select id="subcategory" name="subcategory" value={formData.subcategory} onChange={handleInputChange}>
                                    {subcategoriesList.map((sub, idx) => (
                                        <option key={idx} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pim-info-helper cat-full-width">
                                Selecting Category & Subcategory drives the dynamic attribute fields and validation schemas in Step 3.
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Basic Info */}
                    {activeStep === 2 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 2: Core Identification</div>
                            <div className="cat-form-group cat-full-width">
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Organic Pure Honey"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={formErrors.name ? "cat-input-error" : ""}
                                />
                                {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                            </div>
                            <div className="cat-form-group">
                                <label htmlFor="brand">Brand *</label>
                                <select id="brand" name="brand" value={formData.brand} onChange={handleInputChange}>
                                    {MOCK_BRANDS.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="cat-form-group">
                                <label htmlFor="unit">Sales Unit Size *</label>
                                <input
                                    type="text"
                                    id="unit"
                                    name="unit"
                                    placeholder="e.g. 500g, 1 Pack, 6 units"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    className={formErrors.unit ? "cat-input-error" : ""}
                                />
                                {formErrors.unit && <span className="cat-error-text">{formErrors.unit}</span>}
                            </div>
                            <div className="cat-form-group cat-full-width">
                                <label htmlFor="description">Storefront Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Enter item description..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Category Dynamic Attributes */}
                    {activeStep === 3 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 3: Dynamic Category-Based Fields</div>
                            {currentAttributesSchema.length === 0 ? (
                                <div className="cat-full-width text-center py-4 text-muted">
                                    No dynamic fields specified for subcategory: {formData.subcategory}. Click Continue.
                                </div>
                            ) : (
                                currentAttributesSchema.map(schema => (
                                    <div key={schema.code} className="cat-form-group">
                                        <label htmlFor={schema.code}>
                                            {schema.name} {schema.required ? "*" : ""}
                                        </label>
                                        
                                        {schema.type === "select" ? (
                                            <select
                                                id={schema.code}
                                                value={formData.attributes[schema.code] || ""}
                                                onChange={(e) => handleDynamicAttrChange(schema.code, e.target.value)}
                                                className={formErrors[schema.code] ? "cat-input-error" : ""}
                                            >
                                                <option value="">-- Choose Option --</option>
                                                {schema.options.map((opt, i) => (
                                                    <option key={i} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : schema.type === "checkbox" ? (
                                            <div className="pim-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={schema.code}
                                                    checked={!!formData.attributes[schema.code]}
                                                    onChange={(e) => handleDynamicAttrChange(schema.code, e.target.checked)}
                                                />
                                                <span className="checkbox-label">Certified Organic / Eco-friendly</span>
                                            </div>
                                        ) : schema.type === "textarea" ? (
                                            <textarea
                                                id={schema.code}
                                                rows={2}
                                                value={formData.attributes[schema.code] || ""}
                                                onChange={(e) => handleDynamicAttrChange(schema.code, e.target.value)}
                                                className={formErrors[schema.code] ? "cat-input-error" : ""}
                                            />
                                        ) : (
                                            <input
                                                type={schema.type}
                                                id={schema.code}
                                                value={formData.attributes[schema.code] || ""}
                                                onChange={(e) => handleDynamicAttrChange(schema.code, e.target.value)}
                                                placeholder={schema.placeholder}
                                                className={formErrors[schema.code] ? "cat-input-error" : ""}
                                            />
                                        )}
                                        {formErrors[schema.code] && <span className="cat-error-text">{formErrors[schema.code]}</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* STEP 4: Media Library */}
                    {activeStep === 4 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 4: Image Validation & Media</div>
                            
                            <div className="cat-form-group cat-full-width">
                                <label>Image Assets Upload Handler</label>
                                <div className="pim-media-uploader">
                                    <ImageIcon size={32} />
                                    <div className="uploader-desc">
                                        <p>Click to browse or drop PNG/JPG/WebP files</p>
                                        <span>Max file size: 2MB | Suggested ratio: 1:1 square</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp, image/gif"
                                        onChange={(e) => handleImageFileMock("primary", e)}
                                        className="uploader-input-real"
                                    />
                                </div>
                                {formErrors.images && <span className="cat-error-text block mt-1">{formErrors.images}</span>}
                            </div>

                            <div className="cat-form-group">
                                <label>Primary Image Preview</label>
                                <div className="pim-preview-box">
                                    <span className="preview-emoji">{formData.image || "📦"}</span>
                                    <div className="preview-text">
                                        <p className="filename-tag">{formData.images.primary}</p>
                                        <span className="badge-thumbnail">Primary Node</span>
                                    </div>
                                </div>
                            </div>

                            <div className="cat-form-group">
                                <label>Thumbnail Preview</label>
                                <div className="pim-preview-box-mini">
                                    <span className="preview-emoji-mini">{formData.images.thumbnail}</span>
                                    <span>Auto-generated 80x80px</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Pricing */}
                    {activeStep === 5 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 5: Pricing boundaries</div>
                            <div className="cat-form-group">
                                <label htmlFor="mrp">Maximum Retail Price (MRP) *</label>
                                <input
                                    type="number"
                                    id="mrp"
                                    name="mrp"
                                    min="0"
                                    value={formData.mrp}
                                    onChange={handleInputChange}
                                    className={formErrors.mrp ? "cat-input-error" : ""}
                                />
                                {formErrors.mrp && <span className="cat-error-text">{formErrors.mrp}</span>}
                            </div>

                            <div className="cat-form-group">
                                <label htmlFor="sellingPrice">Store Selling Price *</label>
                                <input
                                    type="number"
                                    id="sellingPrice"
                                    name="sellingPrice"
                                    min="0"
                                    value={formData.sellingPrice}
                                    onChange={handleInputChange}
                                    className={formErrors.sellingPrice ? "cat-input-error" : ""}
                                />
                                {formErrors.sellingPrice && <span className="cat-error-text">{formErrors.sellingPrice}</span>}
                            </div>

                            <div className="cat-form-group">
                                <label htmlFor="darkhousePrice">Darkhouse Cost Price</label>
                                <input
                                    type="number"
                                    id="darkhousePrice"
                                    name="darkhousePrice"
                                    min="0"
                                    value={formData.darkhousePrice || ""}
                                    onChange={(e) => setFormData({...formData, darkhousePrice: parseFloat(e.target.value) || 0})}
                                    className={formErrors.darkhousePrice ? "cat-input-error" : ""}
                                />
                                {formErrors.darkhousePrice && <span className="cat-error-text">{formErrors.darkhousePrice}</span>}
                            </div>

                            <div className="cat-form-group">
                                <label htmlFor="tax">GST Tax Rate (%)</label>
                                <select id="tax" name="tax" value={formData.tax} onChange={handleInputChange}>
                                    <option value="0">0% Exempt</option>
                                    <option value="5">5% Basic</option>
                                    <option value="12">12% Standard</option>
                                    <option value="18">18% Standard II</option>
                                    <option value="28">28% Premium</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: Warehouse Allocation */}
                    {activeStep === 6 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 6: Darkhouse Inventory Allocations</div>
                            
                            <div className="cat-full-width">
                                <p className="dh-map-instruction">
                                    Allocate initial opening stock to active distribution darkhouses:
                                </p>
                                {formErrors.warehouseAssignments && (
                                    <div className="pim-error-banner-alert">
                                        <AlertCircle size={16} />
                                        <span>{formErrors.warehouseAssignments}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pim-dh-allocation-list cat-full-width">
                                {INITIAL_DARKHOUSES.map((dh) => {
                                    const assigned = formData.warehouseAssignments.find(w => w.name === dh.name);
                                    const isChecked = !!assigned;
                                    const isInactive = dh.status === "INACTIVE";

                                    return (
                                        <div key={dh.id} className={`pim-dh-item-row ${isInactive ? "inactive-hub" : ""} ${isChecked ? "checked" : ""}`}>
                                            <label className="pim-dh-chk-label">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    disabled={isInactive}
                                                    onChange={() => handleWarehouseCheckbox(dh.name)}
                                                />
                                                <div className="pim-dh-desc">
                                                    <span className="dh-name-span">{dh.name}</span>
                                                    <span className="dh-city-badge">{dh.city} · Code: {dh.code}</span>
                                                    {isInactive && <span className="dh-inactive-pill">Offline</span>}
                                                </div>
                                            </label>

                                            {isChecked && (
                                                <div className="pim-dh-stock-input">
                                                    <label>Opening Stock</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={assigned.stock}
                                                        onChange={(e) => handleWarehouseStockChange(dh.name, e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 7: Review & Publish Lifecycle */}
                    {activeStep === 7 && (
                        <div className="cat-form-grid">
                            <div className="form-section-title cat-full-width">Step 7: Schema Review & Lifecycle Publishing</div>
                            
                            <div className="cat-form-group cat-full-width pim-review-summary-card">
                                <div className="summary-block">
                                    <span className="summary-lbl">Generated SKU</span>
                                    <strong className="summary-val font-mono">{formData.sku}</strong>
                                </div>
                                <div className="summary-block">
                                    <span className="summary-lbl">Barcode</span>
                                    <span className="summary-val font-mono">{formData.barcode}</span>
                                </div>
                                <div className="summary-block">
                                    <span className="summary-lbl">Tax Details</span>
                                    <span className="summary-val">{formData.tax}% GST Mapped</span>
                                </div>
                                <div className="summary-block">
                                    <span className="summary-lbl">Accumulated Stocks</span>
                                    <span className="summary-val font-mono">{formData.stock} Units total</span>
                                </div>
                            </div>

                            <div className="cat-form-group">
                                <label htmlFor="status">Publishing Lifecycle State</label>
                                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Draft">Draft</option>
                                    <option value="Pending Review">Pending Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Published">Published (Active Storefront)</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Archived">Archived</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="pim-lifecycle-info-banner cat-full-width">
                                <strong>Lifecycle Rules:</strong> Items set to <em>Published</em> will be synchronized to active darkhouse checkouts. Ensure all dynamic parameters (Step 3) are validated beforehand.
                            </div>
                        </div>
                    )}

                </form>
            </CatalogModal>

            {/* ─── DETAILS MODAL ─────────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Product Information Management (PIM) Sheet"
                description={`Audit log registry for SKU: ${selectedProduct?.sku || "N/A"}`}
                icon={FileText}
                sizeClass="large"
                footer={(
                    <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>
                        Close Reference
                    </button>
                )}
            >
                {selectedProduct && (
                    <div className="prod-details-layout">
                        <div className="prod-details-header">
                            <span className="details-large-icon">{selectedProduct.image || "📦"}</span>
                            <div>
                                <h2>{selectedProduct.name}</h2>
                                <span className="details-category-tag">{selectedProduct.category}</span>
                            </div>
                        </div>

                        <div className="prod-details-grid">
                            <div className="details-card">
                                <h3>Classification Details</h3>
                                <div className="details-row">
                                    <span className="label">SKU Code</span>
                                    <span className="val font-mono">{selectedProduct.sku}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Barcode</span>
                                    <span className="val font-mono">{selectedProduct.barcode}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Subcategory</span>
                                    <span className="val">{selectedProduct.subcategory || "N/A"}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Brand</span>
                                    <span className="val">{selectedProduct.brand}</span>
                                </div>
                            </div>

                            <div className="details-card">
                                <h3>Dynamic Attributes</h3>
                                {selectedProduct.attributes && Object.keys(selectedProduct.attributes).length > 0 ? (
                                    Object.entries(selectedProduct.attributes).map(([key, val]) => (
                                        <div key={key} className="details-row">
                                            <span className="label">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                                            <span className="val">{typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="val text-long">No dynamic attributes configured.</span>
                                )}
                            </div>

                            <div className="details-card">
                                <h3>Pricing Constraints</h3>
                                <div className="details-row">
                                    <span className="label">Maximum Retail Price</span>
                                    <span className="val">₹{selectedProduct.mrp}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Store Selling Price</span>
                                    <span className="val highlighted">₹{selectedProduct.sellingPrice}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Dynamic Discount</span>
                                    <span className="val">{selectedProduct.discount}% Off</span>
                                </div>
                            </div>

                            <div className="details-card">
                                <h3>Darkhouse Linkages</h3>
                                <div className="details-row">
                                    <span className="label">Total Stock Pool</span>
                                    <span className="val">{selectedProduct.stock} Units</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Status</span>
                                    <span className="val"><StatusBadge status={selectedProduct.status} /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CatalogModal>
        </div>
    );
}

export default ProductsPage;
