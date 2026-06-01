import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Award, 
    CheckCircle, 
    XCircle, 
    Package, 
    Eye, 
    Edit2, 
    Trash2, 
    Power, 
    FolderOpen 
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_BRANDS, MOCK_PRODUCTS } from "../../../data/catalogData";
import "./Brands.css";

const PAGE_SIZE = 5;

function BrandsPage() {
    const [brandsList, setBrandsList] = useState(MOCK_BRANDS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        logo: "🏷️",
        status: "Active"
    });
    const [formErrors, setFormErrors] = useState({});

    // ─── Search and Filters Configuration ─────────────────────────────────────
    const filters = [
        {
            key: "status",
            value: statusFilter,
            onChange: (e) => { setStatusFilter(e.target.value); setCurrentPage(1); },
            options: [
                { value: "All", label: "All Statuses" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" }
            ],
            label: "Filter by Status"
        }
    ];

    // ─── Search and Filter Action ─────────────────────────────────────────────
    const filteredBrands = useMemo(() => {
        return brandsList.filter((brd) => {
            const matchesSearch = 
                brd.name.toLowerCase().includes(search.toLowerCase()) ||
                brd.id.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || brd.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, brandsList]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedBrands = filteredBrands.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stat Card Values ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = brandsList.length;
        const active = brandsList.filter(b => b.status === "Active").length;
        const inactive = brandsList.filter(b => b.status === "Inactive").length;
        const totalProducts = brandsList.reduce((sum, b) => sum + (b.productsCount || 0), 0);
        return { total, active, inactive, totalProducts };
    }, [brandsList]);

    // ─── Form Inputs Tracker ───────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Brand name is required";
        if (!formData.logo.trim()) errors.logo = "Brand logo emoji is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ─── CRUD Action Triggers ─────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            logo: "🏷️",
            status: "Active"
        });
        setFormErrors({});
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const newBrand = {
            id: `BRD-00${brandsList.length + 1}`,
            name: formData.name,
            logo: formData.logo,
            status: formData.status,
            productsCount: 0
        };

        setBrandsList(prev => [...prev, newBrand]);
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (brand, closeMenu) => {
        setSelectedBrand(brand);
        setFormData({
            name: brand.name,
            logo: brand.logo,
            status: brand.status
        });
        setFormErrors({});
        setIsEditModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setBrandsList(prev => 
            prev.map(b => b.id === selectedBrand.id ? { ...b, ...formData } : b)
        );
        setIsEditModalOpen(false);
    };

    const handleToggleStatus = (brand, closeMenu) => {
        setBrandsList(prev => 
            prev.map(b => {
                if (b.id === brand.id) {
                    const nextStatus = b.status === "Active" ? "Inactive" : "Active";
                    return { ...b, status: nextStatus };
                }
                return b;
            })
        );
        if (closeMenu) closeMenu();
    };

    const handleDelete = (brandId, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this brand?")) {
            setBrandsList(prev => prev.filter(b => b.id !== brandId));
            if (closeMenu) closeMenu();
        }
    };

    const handleOpenDetails = (brand, closeMenu) => {
        setSelectedBrand(brand);
        setIsDetailsModalOpen(true);
        if (closeMenu) closeMenu();
    };

    // Find products mapped to the selected brand
    const brandProductsList = useMemo(() => {
        if (!selectedBrand) return [];
        return MOCK_PRODUCTS.filter(p => p.brand.toLowerCase() === selectedBrand.name.toLowerCase());
    }, [selectedBrand]);

    // ─── Table Column Configs ─────────────────────────────────────────────────
    const columns = [
        {
            header: "Logo",
            render: (row) => (
                <div className="brand-logo-badge">
                    {row.logo || "🏷️"}
                </div>
            )
        },
        {
            header: "Brand ID",
            render: (row) => <span className="brand-id-text">{row.id}</span>
        },
        {
            header: "Name",
            render: (row) => <span className="brand-name-text">{row.name}</span>
        },
        {
            header: "Products Linked",
            render: (row) => (
                <span className="brand-products-badge">
                    {row.productsCount} products
                </span>
            )
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="brands-view fade-in">
            {/* Page Header */}
            <PageHeader
                title="Brands"
                description="Manage product manufacturer brands, linked quick-commerce inventory sizes, and logos"
                primaryAction={{
                    label: "Add Brand",
                    icon: Plus,
                    onClick: handleOpenAddModal
                }}
            />

            {/* Metrics Dashboard Grid */}
            <div className="brand-stats-grid">
                <StatCard
                    title="Total Brands"
                    value={String(stats.total)}
                    icon={Award}
                    trend="+15%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active Brands"
                    value={String(stats.active)}
                    icon={CheckCircle}
                    trend="+10%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Inactive Brands"
                    value={String(stats.inactive)}
                    icon={XCircle}
                    trend="-2%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Linked Products"
                    value={String(stats.totalProducts)}
                    icon={Package}
                    trend="+18%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
            </div>

            {/* Search Filter and Main Grid table */}
            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by brand name or ID..."
                    filters={filters}
                />

                <DataTable
                    columns={columns}
                    data={paginatedBrands}
                    rowIdKey="id"
                    onRowClick={(row) => handleOpenDetails(row)}
                    emptyMessage="No brands match your criteria"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenDetails(row, closeMenu)}>
                                <Eye size={14} />
                                <span>View Details</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditModal(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Brand</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleToggleStatus(row, closeMenu)}>
                                <Power size={14} />
                                <span>{row.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Brand</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination Footer */}
                {filteredBrands.length > 0 && (
                    <div className="brand-pagination">
                        <span className="brand-pagination-info">
                            Showing <strong>{Math.min(filteredBrands.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredBrands.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredBrands.length}</strong> brands
                        </span>
                        
                        <div className="brand-pagination-controls">
                            <button
                                className="brand-page-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`brand-page-btn brand-page-number ${
                                        safePage === page ? "brand-page-btn--active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                className="brand-page-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── ADD BRAND MODAL ───────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Brand"
                description="Register a new manufacturer brand name"
                icon={Plus}
                sizeClass="medium"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="add-brand-form" className="btn-submit">
                            Save Brand
                        </button>
                    </>
                )}
            >
                <form id="add-brand-form" onSubmit={handleAddSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="name">Brand Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g. Haldiram's"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={formErrors.name ? "cat-input-error" : ""}
                        />
                        {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="logo">Logo Emoji</label>
                        <input
                            type="text"
                            id="logo"
                            name="logo"
                            placeholder="e.g. 🍿"
                            value={formData.logo}
                            onChange={handleInputChange}
                            className={formErrors.logo ? "cat-input-error" : ""}
                        />
                        {formErrors.logo && <span className="cat-error-text">{formErrors.logo}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="status">Operational Status</label>
                        <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </CatalogModal>

            {/* ─── EDIT BRAND MODAL ──────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Brand"
                description={`Update details for ${selectedBrand?.name}`}
                icon={Edit2}
                sizeClass="medium"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-brand-form" className="btn-submit">
                            Save Changes
                        </button>
                    </>
                )}
            >
                <form id="edit-brand-form" onSubmit={handleEditSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-name">Brand Name</label>
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

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-logo">Logo Emoji</label>
                        <input
                            type="text"
                            id="edit-logo"
                            name="logo"
                            value={formData.logo}
                            onChange={handleInputChange}
                            className={formErrors.logo ? "cat-input-error" : ""}
                        />
                        {formErrors.logo && <span className="cat-error-text">{formErrors.logo}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-status">Operational Status</label>
                        <select id="edit-status" name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </form>
            </CatalogModal>

            {/* ─── BRAND DETAILS MODAL ───────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Brand Details"
                description={`Reference datasheet for ${selectedBrand?.name}`}
                icon={Eye}
                sizeClass="large"
                footer={(
                    <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>
                        Close
                    </button>
                )}
            >
                <div className="brand-details-layout">
                    <div className="brand-details-header">
                        <div className="brand-details-large-icon">
                            {selectedBrand?.logo}
                        </div>
                        <div>
                            <h2>{selectedBrand?.name}</h2>
                            <span className="brand-details-tag">ID: {selectedBrand?.id}</span>
                        </div>
                    </div>

                    <div className="brand-details-grid">
                        <div className="brand-details-card">
                            <h3>Brand Summary</h3>
                            <div className="brand-details-row">
                                <span className="label">Total Products Linked</span>
                                <span className="val highlighted">{selectedBrand?.productsCount} products</span>
                            </div>
                            <div className="brand-details-row">
                                <span className="label">Status</span>
                                <div style={{ marginTop: "4px" }}>
                                    {selectedBrand && <StatusBadge status={selectedBrand.status} />}
                                </div>
                            </div>
                        </div>

                        <div className="brand-details-card">
                            <h3>Linked Catalog Products</h3>
                            {brandProductsList.length === 0 ? (
                                <div className="brand-empty-products">
                                    <FolderOpen size={24} className="brand-empty-icon" />
                                    <span>No direct mock products are currently associated with this brand.</span>
                                </div>
                            ) : (
                                <div className="brand-products-list">
                                    {brandProductsList.map((prod) => (
                                        <div key={prod.id} className="brand-product-item">
                                            <span className="brand-product-emoji">{prod.image}</span>
                                            <div className="brand-product-text">
                                                <span className="brand-product-title">{prod.name}</span>
                                                <span className="brand-product-sub">SKU: {prod.sku} • ₹{prod.sellingPrice}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CatalogModal>
        </div>
    );
}

export default BrandsPage;
