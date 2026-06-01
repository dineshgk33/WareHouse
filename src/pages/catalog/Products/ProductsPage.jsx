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
    BookOpen
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS } from "../../../data/catalogData";
import "./ProductsPage.css";

const PAGE_SIZE = 5;

function ProductsPage() {
    const [productsList, setProductsList] = useState(MOCK_PRODUCTS);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [brandFilter, setBrandFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        barcode: "",
        category: "Fruits & Vegetables",
        subcategory: "",
        brand: "Organic India",
        mrp: 0,
        sellingPrice: 0,
        discount: 0,
        tax: 5,
        stock: 0,
        reorderLevel: 10,
        unit: "1 kg",
        weight: "",
        dimensions: "",
        status: "Active",
        image: "📦",
        description: ""
    });
    const [formErrors, setFormErrors] = useState({});

    // ─── Search and Filters Configuration ─────────────────────────────────────
    const filters = [
        {
            key: "category",
            value: catFilter,
            onChange: (e) => { setCatFilter(e.target.value); setCurrentPage(1); },
            options: ["All", ...MOCK_CATEGORIES.map(c => c.name)],
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
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Low Stock", label: "Low Stock" }
            ],
            label: "Filter by Status"
        }
    ];

    // ─── Search and Filter Action ─────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        return productsList.filter((prod) => {
            const matchesSearch = 
                prod.name.toLowerCase().includes(search.toLowerCase()) ||
                prod.sku.toLowerCase().includes(search.toLowerCase()) ||
                prod.barcode.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = catFilter === "All" || prod.category === catFilter;
            const matchesBrand = brandFilter === "All" || prod.brand === brandFilter;
            
            let matchesStatus = true;
            if (statusFilter !== "All") {
                if (statusFilter === "Low Stock") {
                    matchesStatus = prod.stock <= prod.reorderLevel && prod.stock > 0;
                } else {
                    matchesStatus = prod.status === statusFilter;
                }
            }
            
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
        const active = productsList.filter(p => p.status === "Active").length;
        const inactive = productsList.filter(p => p.status === "Inactive").length;
        const lowStock = productsList.filter(p => p.stock <= p.reorderLevel && p.stock > 0).length;
        return { total, active, inactive, lowStock };
    }, [productsList]);

    // ─── Form Inputs Tracker ───────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: ["mrp", "sellingPrice", "discount", "tax", "stock", "reorderLevel"].includes(name)
                    ? parseFloat(value) || 0
                    : value
            };
            
            // Auto calculate discount percentage if MRP and Selling Price change
            if (name === "mrp" || name === "sellingPrice") {
                const mrpVal = name === "mrp" ? parseFloat(value) || 0 : prev.mrp;
                const sellVal = name === "sellingPrice" ? parseFloat(value) || 0 : prev.sellingPrice;
                if (mrpVal > 0) {
                    updated.discount = parseFloat(((mrpVal - sellVal) / mrpVal * 100).toFixed(1));
                }
            }
            return updated;
        });

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Product name is required";
        if (!formData.sku.trim()) errors.sku = "SKU is required";
        if (!formData.barcode.trim()) errors.barcode = "Barcode is required";
        if (formData.mrp <= 0) errors.mrp = "MRP must be greater than 0";
        if (formData.sellingPrice < 0) errors.sellingPrice = "Selling price cannot be negative";
        if (formData.sellingPrice > formData.mrp) errors.sellingPrice = "Selling price cannot exceed MRP";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ─── CRUD Action Triggers ─────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            sku: "",
            barcode: "",
            category: MOCK_CATEGORIES[0]?.name || "Fruits & Vegetables",
            subcategory: "",
            brand: MOCK_BRANDS[0]?.name || "Amul",
            mrp: 0,
            sellingPrice: 0,
            discount: 0,
            tax: 5,
            stock: 0,
            reorderLevel: 10,
            unit: "1 kg",
            weight: "",
            dimensions: "",
            status: "Active",
            image: "📦",
            description: ""
        });
        setFormErrors({});
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const newId = `PRD-${Date.now()}`;
        const newProduct = {
            id: newId,
            ...formData
        };

        setProductsList(prev => [newProduct, ...prev]);
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (product, closeMenu) => {
        setSelectedProduct(product);
        setFormData({ ...product });
        setFormErrors({});
        setIsEditModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProductsList(prev => 
            prev.map(p => p.id === selectedProduct.id ? { ...p, ...formData } : p)
        );
        setIsEditModalOpen(false);
    };

    const handleDuplicate = (product, closeMenu) => {
        const duplicated = {
            ...product,
            id: `PRD-${Date.now()}`,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}-COPY`,
            barcode: `${product.barcode}1`
        };
        setProductsList(prev => [duplicated, ...prev]);
        if (closeMenu) closeMenu();
    };

    const handleToggleStatus = (product, closeMenu) => {
        setProductsList(prev => 
            prev.map(p => {
                if (p.id === product.id) {
                    const nextStatus = p.status === "Active" ? "Inactive" : "Active";
                    return { ...p, status: nextStatus };
                }
                return p;
            })
        );
        if (closeMenu) closeMenu();
    };

    const handleDelete = (productId, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            setProductsList(prev => prev.filter(p => p.id !== productId));
            if (closeMenu) closeMenu();
        }
    };

    const handleOpenDetails = (product, closeMenu) => {
        setSelectedProduct(product);
        setIsDetailsModalOpen(true);
        if (closeMenu) closeMenu();
    };

    // ─── Table Column Configs ─────────────────────────────────────────────────
    const columns = [
        {
            header: "Product",
            render: (row) => (
                <div className="prod-cell-info">
                    <span className="prod-cell-icon">{row.image || "📦"}</span>
                    <div className="prod-cell-text">
                        <span className="prod-cell-name">{row.name}</span>
                        <span className="prod-cell-sku">SKU: {row.sku}</span>
                    </div>
                </div>
            )
        },
        { header: "Barcode", key: "barcode", className: "prod-hide-mobile" },
        { header: "Category", key: "category" },
        { header: "Brand", key: "brand", className: "prod-hide-mobile" },
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
            header: "Stock",
            render: (row) => {
                const isLow = row.stock <= row.reorderLevel && row.stock > 0;
                return (
                    <span className={`prod-stock-num ${row.stock === 0 ? "out" : isLow ? "low" : ""}`}>
                        {row.stock} {row.unit}
                    </span>
                );
            }
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="products-view fade-in">
            {/* Page Header */}
            <PageHeader
                title="Products"
                description="Manage your quick-commerce stock pool, prices, dimensions and categorization"
                primaryAction={{
                    label: "Add Product",
                    icon: Plus,
                    onClick: handleOpenAddModal
                }}
            />

            {/* Summary Stat Grid */}
            <div className="prod-stats-grid">
                <StatCard
                    title="Total Products"
                    value={String(stats.total)}
                    icon={Package}
                    trend="+12%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active"
                    value={String(stats.active)}
                    icon={UserCheck}
                    trend="+8%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Low Stock"
                    value={String(stats.lowStock)}
                    icon={AlertTriangle}
                    trend="+25%"
                    trendType="danger"
                    defaultPeriod="Today"
                />
                <StatCard
                    title="Inactive"
                    value={String(stats.inactive)}
                    icon={ShoppingBag}
                    trend="-5%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
            </div>

            {/* Main Table Grid Container */}
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
                    emptyMessage="No products match your filters"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenDetails(row, closeMenu)}>
                                <Eye size={14} />
                                <span>View Details</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditModal(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Product</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleDuplicate(row, closeMenu)}>
                                <Copy size={14} />
                                <span>Duplicate</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleToggleStatus(row, closeMenu)}>
                                <Power size={14} />
                                <span>{row.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Product</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination Footer */}
                {filteredProducts.length > 0 && (
                    <div className="prod-pagination">
                        <span className="prod-pagination-info">
                            Showing <strong>{Math.min(filteredProducts.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredProducts.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredProducts.length}</strong> products
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

            {/* ─── ADD PRODUCT MODAL ───────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Product"
                description="Register a new quick-commerce stock item"
                icon={Package}
                sizeClass="large"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="add-product-form" className="btn-submit">
                            Save Product
                        </button>
                    </>
                )}
            >
                <form id="add-product-form" onSubmit={handleAddSubmit} className="cat-form-grid">
                    {/* Basic Info */}
                    <div className="form-section-title cat-full-width">Basic Info</div>
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="name">Product Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g. Fresh Alphonso Mangoes"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={formErrors.name ? "cat-input-error" : ""}
                        />
                        {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="sku">SKU Code</label>
                        <input
                            type="text"
                            id="sku"
                            name="sku"
                            placeholder="e.g. FRT-MNG-ALP"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className={formErrors.sku ? "cat-input-error" : ""}
                        />
                        {formErrors.sku && <span className="cat-error-text">{formErrors.sku}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="barcode">Barcode</label>
                        <input
                            type="text"
                            id="barcode"
                            name="barcode"
                            placeholder="e.g. 8901020304051"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            className={formErrors.barcode ? "cat-input-error" : ""}
                        />
                        {formErrors.barcode && <span className="cat-error-text">{formErrors.barcode}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="description">Product Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Write comprehensive product parameters..."
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={2}
                        />
                    </div>

                    {/* Classification */}
                    <div className="form-section-title cat-full-width">Classification</div>
                    <div className="cat-form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                            {MOCK_CATEGORIES.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="brand">Brand</label>
                        <select id="brand" name="brand" value={formData.brand} onChange={handleInputChange}>
                            {MOCK_BRANDS.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pricing */}
                    <div className="form-section-title cat-full-width">Pricing</div>
                    <div className="cat-form-group">
                        <label htmlFor="mrp">MRP (₹)</label>
                        <input
                            type="number"
                            id="mrp"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleInputChange}
                            className={formErrors.mrp ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.mrp && <span className="cat-error-text">{formErrors.mrp}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="sellingPrice">Selling Price (₹)</label>
                        <input
                            type="number"
                            id="sellingPrice"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleInputChange}
                            className={formErrors.sellingPrice ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.sellingPrice && <span className="cat-error-text">{formErrors.sellingPrice}</span>}
                    </div>

                    {/* Inventory */}
                    <div className="form-section-title cat-full-width">Inventory & Delivery</div>
                    <div className="cat-form-group">
                        <label htmlFor="stock">Opening Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="unit">Unit</label>
                        <input
                            type="text"
                            id="unit"
                            name="unit"
                            placeholder="e.g. 1 kg, 500ml, 1 Pack"
                            value={formData.unit}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="reorderLevel">Reorder Point</label>
                        <input
                            type="number"
                            id="reorderLevel"
                            name="reorderLevel"
                            value={formData.reorderLevel}
                            onChange={handleInputChange}
                            min="0"
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="status">Operational Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </CatalogModal>

            {/* ─── EDIT PRODUCT MODAL ──────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Product"
                description={`Update details for ${selectedProduct?.name}`}
                icon={Edit2}
                sizeClass="large"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-product-form" className="btn-submit">
                            Save Changes
                        </button>
                    </>
                )}
            >
                <form id="edit-product-form" onSubmit={handleEditSubmit} className="cat-form-grid">
                    {/* Basic Info */}
                    <div className="form-section-title cat-full-width">Basic Info</div>
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-name">Product Name</label>
                        <input
                            type="text"
                            id="edit-name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={formErrors.name ? "cat-input-error" : ""}
                        />
                        {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-sku">SKU Code</label>
                        <input
                            type="text"
                            id="edit-sku"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className={formErrors.sku ? "cat-input-error" : ""}
                        />
                        {formErrors.sku && <span className="cat-error-text">{formErrors.sku}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-barcode">Barcode</label>
                        <input
                            type="text"
                            id="edit-barcode"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            className={formErrors.barcode ? "cat-input-error" : ""}
                        />
                        {formErrors.barcode && <span className="cat-error-text">{formErrors.barcode}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-description">Product Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={2}
                        />
                    </div>

                    {/* Classification */}
                    <div className="form-section-title cat-full-width">Classification</div>
                    <div className="cat-form-group">
                        <label htmlFor="edit-category">Category</label>
                        <select id="edit-category" name="category" value={formData.category} onChange={handleInputChange}>
                            {MOCK_CATEGORIES.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-brand">Brand</label>
                        <select id="edit-brand" name="brand" value={formData.brand} onChange={handleInputChange}>
                            {MOCK_BRANDS.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pricing */}
                    <div className="form-section-title cat-full-width">Pricing</div>
                    <div className="cat-form-group">
                        <label htmlFor="edit-mrp">MRP (₹)</label>
                        <input
                            type="number"
                            id="edit-mrp"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleInputChange}
                            className={formErrors.mrp ? "cat-input-error" : ""}
                        />
                        {formErrors.mrp && <span className="cat-error-text">{formErrors.mrp}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-sellingPrice">Selling Price (₹)</label>
                        <input
                            type="number"
                            id="edit-sellingPrice"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            onChange={handleInputChange}
                            className={formErrors.sellingPrice ? "cat-input-error" : ""}
                        />
                        {formErrors.sellingPrice && <span className="cat-error-text">{formErrors.sellingPrice}</span>}
                    </div>

                    {/* Inventory */}
                    <div className="form-section-title cat-full-width">Inventory & Delivery</div>
                    <div className="cat-form-group">
                        <label htmlFor="edit-stock">Current Stock</label>
                        <input
                            type="number"
                            id="edit-stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-unit">Unit</label>
                        <input
                            type="text"
                            id="edit-unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-reorderLevel">Reorder Point</label>
                        <input
                            type="number"
                            id="edit-reorderLevel"
                            name="reorderLevel"
                            value={formData.reorderLevel}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-status">Operational Status</label>
                        <select id="edit-status" name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </CatalogModal>

            {/* ─── PRODUCT DETAILS MODAL ───────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Product Details"
                description={`Reference sheet for SKU: ${selectedProduct?.sku}`}
                icon={Eye}
                sizeClass="large"
                footer={(
                    <>
                        <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>
                            Close
                        </button>
                        <button 
                            className="btn-submit" 
                            onClick={() => handleOpenEditModal(selectedProduct, () => setIsDetailsModalOpen(false))}
                        >
                            Edit Details
                        </button>
                    </>
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
                                <h3>Basic Information</h3>
                                <div className="details-row">
                                    <span className="label">SKU Code</span>
                                    <span className="val">{selectedProduct.sku}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Barcode (EAN)</span>
                                    <span className="val">{selectedProduct.barcode}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Brand</span>
                                    <span className="val">{selectedProduct.brand}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Description</span>
                                    <span className="val text-long">{selectedProduct.description || "No description provided."}</span>
                                </div>
                            </div>

                            <div className="details-card">
                                <h3>Commercial & Inventory</h3>
                                <div className="details-row">
                                    <span className="label">MRP</span>
                                    <span className="val">₹{selectedProduct.mrp}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Selling Price</span>
                                    <span className="val highlighted">₹{selectedProduct.sellingPrice}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Tax Rate</span>
                                    <span className="val">{selectedProduct.tax}% GST</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Available Stock</span>
                                    <span className="val">{selectedProduct.stock} {selectedProduct.unit}</span>
                                </div>
                                <div className="details-row">
                                    <span className="label">Status</span>
                                    <StatusBadge status={selectedProduct.status} />
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
