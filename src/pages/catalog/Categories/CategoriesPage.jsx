import React, { useState, useMemo } from "react";
import { Plus, Eye, Edit2, Trash2, Folder, Layers, ShieldAlert, CheckCircle } from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_CATEGORIES } from "../../../data/catalogData";
import "./CategoriesPage.css";

const PAGE_SIZE = 5;

function CategoriesPage() {
    const [categories, setCategories] = useState(MOCK_CATEGORIES);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        name: "",
        displayOrder: 1,
        status: "Active",
        icon: "📁"
    });
    const [formErrors, setFormErrors] = useState({});

    // ─── Filter logic ─────────────────────────────────────────────────────────
    const filteredCategories = useMemo(() => {
        return categories.filter((cat) => {
            const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "All" || cat.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, categories]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedCategories = filteredCategories.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter(c => c.status === "Active").length;
        const inactive = categories.filter(c => c.status === "Inactive").length;
        return { total, active, inactive };
    }, [categories]);

    // ─── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "displayOrder" ? parseInt(value) || 1 : value
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Category name is required";
        if (formData.displayOrder <= 0) errors.displayOrder = "Display order must be greater than 0";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            displayOrder: categories.length + 1,
            status: "Active",
            icon: "📁"
        });
        setFormErrors({});
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const newId = `CAT-${Date.now()}`;
        const newCat = {
            id: newId,
            productsCount: 0,
            ...formData
        };

        const updated = [...categories, newCat];
        setCategories(updated);
        saveCategories(updated);
        addAuditLog(
            sessionStorage.getItem("username") || "PIM Manager",
            "Category Created",
            "Category Management",
            null,
            newCat,
            `Created new category: ${newCat.name}`
        );
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (cat, closeMenu) => {
        setSelectedCategory(cat);
        setFormData({
            name: cat.name,
            displayOrder: cat.displayOrder,
            status: cat.status,
            icon: cat.icon
        });
        setFormErrors({});
        setIsEditModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const updated = categories.map(c => {
            if (c.id === selectedCategory.id) {
                const newCat = { ...c, ...formData };
                addAuditLog(
                    sessionStorage.getItem("username") || "PIM Manager",
                    "Category Updated",
                    "Category Management",
                    c,
                    newCat,
                    `Updated category: ${c.name}`
                );
                return newCat;
            }
            return c;
        });
        setCategories(updated);
        saveCategories(updated);
        setIsEditModalOpen(false);
    };

    const handleDelete = (id, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            setCategories(prev => prev.filter(c => c.id !== id));
            if (closeMenu) closeMenu();
        }
    };

    const columns = [
        {
            header: "Category Info",
            render: (row) => (
                <div className="cat-cell-info">
                    <span className="cat-cell-emoji">{row.icon || "📁"}</span>
                    <div className="cat-cell-text">
                        <span className="cat-cell-name">{row.name}</span>
                        <span className="cat-cell-id">ID: {row.id}</span>
                    </div>
                </div>
            )
        },
        { 
            header: "Products Count", 
            render: (row) => <strong className="cat-count-bold">{row.productsCount} items</strong> 
        },
        { 
            header: "Display Order", 
            render: (row) => <span className="cat-order-tag">Index {row.displayOrder}</span> 
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="cat-page-view fade-in">
            <PageHeader
                title="Categories"
                description="Organize your store grid layout, browse nodes, and item indexing structures"
                primaryAction={{
                    label: "Add Category",
                    icon: Plus,
                    onClick: handleOpenAddModal
                }}
            />

            <div className="cat-stats-grid">
                <StatCard
                    title="Total Categories"
                    value={String(stats.total)}
                    icon={Folder}
                    trend="+5%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active Categories"
                    value={String(stats.active)}
                    icon={CheckCircle}
                    trend="+10%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Inactive Categories"
                    value={String(stats.inactive)}
                    icon={ShieldAlert}
                    trend="-2%"
                    trendType="danger"
                    defaultPeriod="Last 30 days"
                />
            </div>

            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by category name..."
                    filters={[
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
                    ]}
                />

                <DataTable
                    columns={columns}
                    data={paginatedCategories}
                    rowIdKey="id"
                    emptyMessage="No categories match your filters"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditModal(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Category</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Category</span>
                            </button>
                        </>
                    )}
                />

                {filteredCategories.length > 0 && (
                    <div className="prod-pagination">
                        <span className="prod-pagination-info">
                            Showing <strong>{Math.min(filteredCategories.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredCategories.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredCategories.length}</strong> categories
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

            <CatalogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Category"
                description="Register a new browsing category"
                icon={Plus}
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="add-category-form" className="btn-submit">
                            Save Category
                        </button>
                    </>
                )}
            >
                <form id="add-category-form" onSubmit={handleAddSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="name">Category Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g. Dairy & Eggs"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={formErrors.name ? "cat-input-error" : ""}
                        />
                        {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="displayOrder">Display Order Index</label>
                        <input
                            type="number"
                            id="displayOrder"
                            name="displayOrder"
                            value={formData.displayOrder}
                            onChange={handleInputChange}
                            min="1"
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="icon">Emoji / Symbol Icon</label>
                        <input
                            type="text"
                            id="icon"
                            name="icon"
                            placeholder="e.g. 🥛, 🍇"
                            value={formData.icon}
                            onChange={handleInputChange}
                        />
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

            <CatalogModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Category"
                description={`Modify ${selectedCategory?.name}`}
                icon={Edit2}
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-category-form" className="btn-submit">
                            Save Changes
                        </button>
                    </>
                )}
            >
                <form id="edit-category-form" onSubmit={handleEditSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-name">Category Name</label>
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
                        <label htmlFor="edit-displayOrder">Display Order Index</label>
                        <input
                            type="number"
                            id="edit-displayOrder"
                            name="displayOrder"
                            value={formData.displayOrder}
                            onChange={handleInputChange}
                            min="1"
                        />
                    </div>

                    <div className="cat-form-group">
                        <label htmlFor="edit-icon">Emoji / Symbol Icon</label>
                        <input
                            type="text"
                            id="edit-icon"
                            name="icon"
                            value={formData.icon}
                            onChange={handleInputChange}
                        />
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
        </div>
    );
}

export default CategoriesPage;
