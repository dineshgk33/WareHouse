import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Boxes, 
    CheckSquare, 
    AlertCircle, 
    Eye, 
    Edit2, 
    Trash2, 
    Power, 
    ClipboardList,
    Layers
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_VARIANTS, MOCK_PRODUCTS } from "../../../data/catalogData";
import "./Variants.css";

const PAGE_SIZE = 5;

function VariantsPage() {
    const [variantsList, setVariantsList] = useState(MOCK_VARIANTS);
    const [search, setSearch] = useState("");
    const [productFilter, setProductFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
        productId: MOCK_PRODUCTS[0]?.id || "",
        productName: MOCK_PRODUCTS[0]?.name || "",
        variant: "",
        sku: "",
        barcode: "",
        price: 0,
        stock: 0,
        status: "Active"
    });
    const [formErrors, setFormErrors] = useState({});

    // ─── Search and Filters Configuration ─────────────────────────────────────
    const uniqueProductNames = useMemo(() => {
        const names = variantsList.map(v => v.productName);
        return ["All", ...Array.from(new Set(names))];
    }, [variantsList]);

    const filters = [
        {
            key: "product",
            value: productFilter,
            onChange: (e) => { setProductFilter(e.target.value); setCurrentPage(1); },
            options: uniqueProductNames,
            label: "Filter by Product"
        },
        {
            key: "status",
            value: statusFilter,
            onChange: (e) => { setStatusFilter(e.target.value); setCurrentPage(1); },
            options: [
                { value: "All", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Low Stock", label: "Low/Out of Stock" }
            ],
            label: "Filter by Status"
        }
    ];

    // ─── Search and Filter Action ─────────────────────────────────────────────
    const filteredVariants = useMemo(() => {
        return variantsList.filter((vr) => {
            const matchesSearch = 
                vr.productName.toLowerCase().includes(search.toLowerCase()) ||
                vr.variant.toLowerCase().includes(search.toLowerCase()) ||
                vr.sku.toLowerCase().includes(search.toLowerCase()) ||
                vr.barcode.toLowerCase().includes(search.toLowerCase());
            
            const matchesProduct = productFilter === "All" || vr.productName === productFilter;
            
            let matchesStatus = true;
            if (statusFilter !== "All") {
                if (statusFilter === "Low Stock") {
                    matchesStatus = vr.stock <= 50;
                } else {
                    matchesStatus = vr.status === statusFilter;
                }
            }
            
            return matchesSearch && matchesProduct && matchesStatus;
        });
    }, [search, productFilter, statusFilter, variantsList]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredVariants.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedVariants = filteredVariants.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stat Card Values ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = variantsList.length;
        const active = variantsList.filter(v => v.status === "Active").length;
        const inactive = variantsList.filter(v => v.status === "Inactive").length;
        const lowStock = variantsList.filter(v => v.stock <= 50).length;
        return { total, active, inactive, lowStock };
    }, [variantsList]);

    // ─── Form Inputs Tracker ───────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["price", "stock"].includes(name)
                ? parseFloat(value) || 0
                : value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleProductChange = (e) => {
        const prodId = e.target.value;
        const prod = MOCK_PRODUCTS.find(p => p.id === prodId);
        setFormData(prev => ({
            ...prev,
            productId: prodId,
            productName: prod ? prod.name : ""
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.productId) errors.productId = "Parent product selection is required";
        if (!formData.variant.trim()) errors.variant = "Variant name is required (e.g. 500ml Pack)";
        if (!formData.sku.trim()) errors.sku = "SKU Code is required";
        if (!formData.barcode.trim()) errors.barcode = "Barcode is required";
        if (formData.price <= 0) errors.price = "Price must be greater than 0";
        if (formData.stock < 0) errors.stock = "Stock count cannot be negative";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ─── CRUD Action Triggers ─────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData({
            productId: MOCK_PRODUCTS[0]?.id || "",
            productName: MOCK_PRODUCTS[0]?.name || "",
            variant: "",
            sku: "",
            barcode: "",
            price: 0,
            stock: 0,
            status: "Active"
        });
        setFormErrors({});
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const newVariant = {
            id: `VAR-${Date.now()}`,
            ...formData
        };

        setVariantsList(prev => [newVariant, ...prev]);
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (vr, closeMenu) => {
        setSelectedVariant(vr);
        setFormData({
            productId: vr.productId,
            productName: vr.productName,
            variant: vr.variant,
            sku: vr.sku,
            barcode: vr.barcode,
            price: vr.price,
            stock: vr.stock,
            status: vr.status
        });
        setFormErrors({});
        setIsEditModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setVariantsList(prev => 
            prev.map(v => v.id === selectedVariant.id ? { ...v, ...formData } : v)
        );
        setIsEditModalOpen(false);
    };

    const handleToggleStatus = (vr, closeMenu) => {
        setVariantsList(prev => 
            prev.map(v => {
                if (v.id === vr.id) {
                    const nextStatus = v.status === "Active" ? "Inactive" : "Active";
                    return { ...v, status: nextStatus };
                }
                return v;
            })
        );
        if (closeMenu) closeMenu();
    };

    const handleDelete = (vrId, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this variant?")) {
            setVariantsList(prev => prev.filter(v => v.id !== vrId));
            if (closeMenu) closeMenu();
        }
    };

    const handleOpenDetails = (vr, closeMenu) => {
        setSelectedVariant(vr);
        setIsDetailsModalOpen(true);
        if (closeMenu) closeMenu();
    };

    // ─── Table Column Configs ─────────────────────────────────────────────────
    const columns = [
        {
            header: "Variant Info",
            render: (row) => (
                <div className="vr-cell-info">
                    <span className="vr-cell-icon"><Boxes size={16} /></span>
                    <div className="vr-cell-text">
                        <span className="vr-product-name">{row.productName}</span>
                        <span className="vr-variant-label">{row.variant}</span>
                    </div>
                </div>
            )
        },
        {
            header: "SKU",
            render: (row) => <span className="vr-sku-text">{row.sku}</span>
        },
        {
            header: "Barcode",
            render: (row) => <span className="vr-barcode-text">{row.barcode}</span>
        },
        {
            header: "Price",
            render: (row) => <span className="vr-price-text">₹{row.price}</span>
        },
        {
            header: "Stock Status",
            render: (row) => {
                const isLow = row.stock <= 50;
                return (
                    <span className={`vr-stock-num ${row.stock === 0 ? "out" : isLow ? "low" : ""}`}>
                        {row.stock} items
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
        <div className="variants-view fade-in">
            {/* Page Header */}
            <PageHeader
                title="Variants"
                description="Manage sub-categorized variants of catalog items, custom weight packagings and specific barcodes"
                primaryAction={{
                    label: "Add Variant",
                    icon: Plus,
                    onClick: handleOpenAddModal
                }}
            />

            {/* Metrics Dashboard Grid */}
            <div className="vr-stats-grid">
                <StatCard
                    title="Total Variants"
                    value={String(stats.total)}
                    icon={Boxes}
                    trend="+8%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active Variants"
                    value={String(stats.active)}
                    icon={CheckSquare}
                    trend="+12%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Low Stock Warning"
                    value={String(stats.lowStock)}
                    icon={AlertCircle}
                    trend="+15%"
                    trendType="danger"
                    defaultPeriod="Today"
                />
                <StatCard
                    title="Inactive Variants"
                    value={String(stats.inactive)}
                    icon={ClipboardList}
                    trend="-2%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
            </div>

            {/* Search Filter and Main Grid Table */}
            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by SKU, barcode, product or variant name..."
                    filters={filters}
                />

                <DataTable
                    columns={columns}
                    data={paginatedVariants}
                    rowIdKey="id"
                    onRowClick={(row) => handleOpenDetails(row)}
                    emptyMessage="No variants match your search filters"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenDetails(row, closeMenu)}>
                                <Eye size={14} />
                                <span>View Details</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditModal(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Variant</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleToggleStatus(row, closeMenu)}>
                                <Power size={14} />
                                <span>{row.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Variant</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination Footer */}
                {filteredVariants.length > 0 && (
                    <div className="vr-pagination">
                        <span className="vr-pagination-info">
                            Showing <strong>{Math.min(filteredVariants.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredVariants.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredVariants.length}</strong> variants
                        </span>
                        
                        <div className="vr-pagination-controls">
                            <button
                                className="vr-page-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`vr-page-btn vr-page-number ${
                                        safePage === page ? "vr-page-btn--active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                className="vr-page-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── ADD VARIANT MODAL ──────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Variant"
                description="Register a new product variation size"
                icon={Plus}
                sizeClass="large"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="add-variant-form" className="btn-submit">
                            Save Variant
                        </button>
                    </>
                )}
            >
                <form id="add-variant-form" onSubmit={handleAddSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="productId">Parent Product</label>
                        <select 
                            id="productId" 
                            name="productId" 
                            value={formData.productId} 
                            onChange={handleProductChange}
                        >
                            {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="variant">Variant Label</label>
                        <input
                            type="text"
                            id="variant"
                            name="variant"
                            placeholder="e.g. 500ml Pack, 1 kg Bottle"
                            value={formData.variant}
                            onChange={handleInputChange}
                            className={formErrors.variant ? "cat-input-error" : ""}
                        />
                        {formErrors.variant && <span className="cat-error-text">{formErrors.variant}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="sku">SKU Code</label>
                        <input
                            type="text"
                            id="sku"
                            name="sku"
                            placeholder="e.g. DRY-MLK-TZ5"
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
                            placeholder="e.g. 8901262010052"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            className={formErrors.barcode ? "cat-input-error" : ""}
                        />
                        {formErrors.barcode && <span className="cat-error-text">{formErrors.barcode}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="price">Selling Price (₹)</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={formErrors.price ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.price && <span className="cat-error-text">{formErrors.price}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="stock">Opening Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            className={formErrors.stock ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.stock && <span className="cat-error-text">{formErrors.stock}</span>}
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

            {/* ─── EDIT VARIANT MODAL ─────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Variant"
                description={`Update configuration details for ${selectedVariant?.variant}`}
                icon={Edit2}
                sizeClass="large"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-variant-form" className="btn-submit">
                            Save Changes
                        </button>
                    </>
                )}
            >
                <form id="edit-variant-form" onSubmit={handleEditSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-productId">Parent Product</label>
                        <select 
                            id="edit-productId" 
                            name="productId" 
                            value={formData.productId} 
                            onChange={handleProductChange}
                        >
                            {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-variant">Variant Label</label>
                        <input
                            type="text"
                            id="edit-variant"
                            name="variant"
                            value={formData.variant}
                            onChange={handleInputChange}
                            className={formErrors.variant ? "cat-input-error" : ""}
                        />
                        {formErrors.variant && <span className="cat-error-text">{formErrors.variant}</span>}
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

                    <div className="cat-form-group">
                        <label htmlFor="edit-price">Selling Price (₹)</label>
                        <input
                            type="number"
                            id="edit-price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={formErrors.price ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.price && <span className="cat-error-text">{formErrors.price}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-stock">Current Stock</label>
                        <input
                            type="number"
                            id="edit-stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            className={formErrors.stock ? "cat-input-error" : ""}
                            min="0"
                        />
                        {formErrors.stock && <span className="cat-error-text">{formErrors.stock}</span>}
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

            {/* ─── VARIANT DETAILS MODAL ─────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Variant Details"
                description={`Reference sheet for SKU: ${selectedVariant?.sku}`}
                icon={Eye}
                sizeClass="large"
                footer={(
                    <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>
                        Close
                    </button>
                )}
            >
                <div className="vr-details-layout">
                    <div className="vr-details-header">
                        <div className="vr-details-large-icon">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2>{selectedVariant?.variant} Variant</h2>
                            <span className="vr-details-tag">Parent Product: {selectedVariant?.productName}</span>
                        </div>
                    </div>

                    <div className="vr-details-grid">
                        <div className="vr-details-card">
                            <h3>Key Parameters</h3>
                            <div className="vr-details-row">
                                <span className="label">SKU Code</span>
                                <span className="val highlighted">{selectedVariant?.sku}</span>
                            </div>
                            <div className="vr-details-row">
                                <span className="label">Barcode</span>
                                <span className="val" style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700 }}>
                                    {selectedVariant?.barcode}
                                </span>
                            </div>
                        </div>

                        <div className="vr-details-card">
                            <h3>Pricing & Stock</h3>
                            <div className="vr-details-row">
                                <span className="label">Selling Price</span>
                                <span className="val highlighted">₹{selectedVariant?.price}</span>
                            </div>
                            <div className="vr-details-row">
                                <span className="label">Current Warehousing Stock</span>
                                <span className={`vr-stock-num ${selectedVariant?.stock === 0 ? "out" : selectedVariant?.stock <= 50 ? "low" : ""}`} style={{ marginTop: "4px" }}>
                                    {selectedVariant?.stock} items
                                </span>
                            </div>
                            <div className="vr-details-row" style={{ marginTop: "4px" }}>
                                <span className="label">Status</span>
                                <div style={{ marginTop: "4px" }}>
                                    {selectedVariant && <StatusBadge status={selectedVariant.status} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CatalogModal>
        </div>
    );
}

export default VariantsPage;
