import React, { useState, useMemo } from "react";
import { 
    Plus, 
    Settings, 
    Sliders, 
    ToggleLeft, 
    Hash, 
    Eye, 
    Edit2, 
    Trash2, 
    Power, 
    Layers 
} from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_ATTRIBUTES } from "../../../data/catalogData";
import "./Attributes.css";

const PAGE_SIZE = 5;

function AttributesPage() {
    const [attributesList, setAttributesList] = useState(MOCK_ATTRIBUTES);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        valuesString: "",
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
    const filteredAttributes = useMemo(() => {
        return attributesList.filter((attr) => {
            const matchesSearch = 
                attr.name.toLowerCase().includes(search.toLowerCase()) ||
                attr.id.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || attr.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter, attributesList]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredAttributes.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedAttributes = filteredAttributes.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stat Card Values ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = attributesList.length;
        const active = attributesList.filter(a => a.status === "Active").length;
        const inactive = attributesList.filter(a => a.status === "Inactive").length;
        const totalValues = attributesList.reduce((sum, a) => sum + (a.values ? a.values.length : 0), 0);
        return { total, active, inactive, totalValues };
    }, [attributesList]);

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
        if (!formData.name.trim()) errors.name = "Attribute name is required";
        if (!formData.valuesString.trim()) errors.valuesString = "At least one attribute value is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ─── CRUD Action Triggers ─────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            valuesString: "",
            status: "Active"
        });
        setFormErrors({});
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const valuesArray = formData.valuesString
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);

        const newAttribute = {
            id: `ATT-00${attributesList.length + 1}`,
            name: formData.name,
            values: valuesArray,
            status: formData.status,
            productsLinked: 0
        };

        setAttributesList(prev => [...prev, newAttribute]);
        setIsAddModalOpen(false);
    };

    const handleOpenEditModal = (attr, closeMenu) => {
        setSelectedAttribute(attr);
        setFormData({
            name: attr.name,
            valuesString: attr.values.join(", "),
            status: attr.status
        });
        setFormErrors({});
        setIsEditModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const valuesArray = formData.valuesString
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);

        setAttributesList(prev => 
            prev.map(a => a.id === selectedAttribute.id 
                ? { ...a, name: formData.name, status: formData.status, values: valuesArray } 
                : a
            )
        );
        setIsEditModalOpen(false);
    };

    const handleToggleStatus = (attr, closeMenu) => {
        setAttributesList(prev => 
            prev.map(a => {
                if (a.id === attr.id) {
                    const nextStatus = a.status === "Active" ? "Inactive" : "Active";
                    return { ...a, status: nextStatus };
                }
                return a;
            })
        );
        if (closeMenu) closeMenu();
    };

    const handleDelete = (attrId, closeMenu) => {
        if (window.confirm("Are you sure you want to delete this attribute?")) {
            setAttributesList(prev => prev.filter(a => a.id !== attrId));
            if (closeMenu) closeMenu();
        }
    };

    const handleOpenDetails = (attr, closeMenu) => {
        setSelectedAttribute(attr);
        setIsDetailsModalOpen(true);
        if (closeMenu) closeMenu();
    };

    // ─── Table Column Configs ─────────────────────────────────────────────────
    const columns = [
        {
            header: "Attribute ID",
            render: (row) => <span className="attr-id-text">{row.id}</span>
        },
        {
            header: "Name",
            render: (row) => <span className="attr-name-text">{row.name}</span>
        },
        {
            header: "Configured Values",
            render: (row) => (
                <div className="attr-values-cell">
                    {row.values.slice(0, 4).map((val, i) => (
                        <span key={i} className="attr-value-pill">{val}</span>
                    ))}
                    {row.values.length > 4 && (
                        <span className="attr-value-pill-more">+{row.values.length - 4} more</span>
                    )}
                </div>
            )
        },
        {
            header: "Products Linked",
            render: (row) => (
                <span className="attr-linked-badge">
                    {row.productsLinked} items
                </span>
            )
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="attributes-view fade-in">
            {/* Page Header */}
            <PageHeader
                title="Attributes"
                description="Configure product properties like Color, Volume, Weight and custom variant dimensions"
                primaryAction={{
                    label: "Add Attribute",
                    icon: Plus,
                    onClick: handleOpenAddModal
                }}
            />

            {/* Metrics Dashboard Grid */}
            <div className="attr-stats-grid">
                <StatCard
                    title="Total Attributes"
                    value={String(stats.total)}
                    icon={Settings}
                    trend="+5%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active Attributes"
                    value={String(stats.active)}
                    icon={Sliders}
                    trend="+12%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Inactive Attributes"
                    value={String(stats.inactive)}
                    icon={ToggleLeft}
                    trend="0%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Unique Options"
                    value={String(stats.totalValues)}
                    icon={Hash}
                    trend="+22%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
            </div>

            {/* Search Filter and Main Grid Table */}
            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by attribute name or ID..."
                    filters={filters}
                />

                <DataTable
                    columns={columns}
                    data={paginatedAttributes}
                    rowIdKey="id"
                    onRowClick={(row) => handleOpenDetails(row)}
                    emptyMessage="No attributes match your filters"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenDetails(row, closeMenu)}>
                                <Eye size={14} />
                                <span>View Details</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleOpenEditModal(row, closeMenu)}>
                                <Edit2 size={14} />
                                <span>Edit Attribute</span>
                            </button>
                            <button className="global-dropdown-item" onClick={() => handleToggleStatus(row, closeMenu)}>
                                <Power size={14} />
                                <span>{row.status === "Active" ? "Deactivate" : "Activate"}</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleDelete(row.id, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Delete Attribute</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination Footer */}
                {filteredAttributes.length > 0 && (
                    <div className="attr-pagination">
                        <span className="attr-pagination-info">
                            Showing <strong>{Math.min(filteredAttributes.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredAttributes.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredAttributes.length}</strong> attributes
                        </span>
                        
                        <div className="attr-pagination-controls">
                            <button
                                className="attr-page-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`attr-page-btn attr-page-number ${
                                        safePage === page ? "attr-page-btn--active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                className="attr-page-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── ADD ATTRIBUTE MODAL ───────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Attribute"
                description="Register a new custom catalog mapping dimension"
                icon={Plus}
                sizeClass="medium"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="add-attribute-form" className="btn-submit">
                            Save Attribute
                        </button>
                    </>
                )}
            >
                <form id="add-attribute-form" onSubmit={handleAddSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="name">Attribute Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="e.g. Size, Color, Packaging"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={formErrors.name ? "cat-input-error" : ""}
                        />
                        {formErrors.name && <span className="cat-error-text">{formErrors.name}</span>}
                    </div>

                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="valuesString">Attribute Values (Comma-separated)</label>
                        <input
                            type="text"
                            id="valuesString"
                            name="valuesString"
                            placeholder="e.g. Red, Blue, Green, Small, Medium, Large"
                            value={formData.valuesString}
                            onChange={handleInputChange}
                            className={formErrors.valuesString ? "cat-input-error" : ""}
                        />
                        {formErrors.valuesString && <span className="cat-error-text">{formErrors.valuesString}</span>}
                        <span style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Separate multiple values with a comma. Leading and trailing spaces will be trimmed.
                        </span>
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

            {/* ─── EDIT ATTRIBUTE MODAL ──────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Attribute"
                description={`Update configuration parameters for ${selectedAttribute?.name}`}
                icon={Edit2}
                sizeClass="medium"
                footer={(
                    <>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-attribute-form" className="btn-submit">
                            Save Changes
                        </button>
                    </>
                )}
            >
                <form id="edit-attribute-form" onSubmit={handleEditSubmit} className="cat-form-grid">
                    <div className="cat-form-group cat-full-width">
                        <label htmlFor="edit-name">Attribute Name</label>
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
                        <label htmlFor="edit-valuesString">Attribute Values (Comma-separated)</label>
                        <input
                            type="text"
                            id="edit-valuesString"
                            name="valuesString"
                            value={formData.valuesString}
                            onChange={handleInputChange}
                            className={formErrors.valuesString ? "cat-input-error" : ""}
                        />
                        {formErrors.valuesString && <span className="cat-error-text">{formErrors.valuesString}</span>}
                        <span style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Separate multiple values with a comma.
                        </span>
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

            {/* ─── ATTRIBUTE DETAILS MODAL ───────────────────────────────────────── */}
            <CatalogModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Attribute Details"
                description={`Reference sheet for ${selectedAttribute?.name}`}
                icon={Eye}
                sizeClass="large"
                footer={(
                    <button className="btn-cancel" onClick={() => setIsDetailsModalOpen(false)}>
                        Close
                    </button>
                )}
            >
                <div className="attr-details-layout">
                    <div className="attr-details-header">
                        <div className="attr-details-large-icon">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2>{selectedAttribute?.name} Attribute</h2>
                            <span className="attr-details-tag">ID: {selectedAttribute?.id}</span>
                        </div>
                    </div>

                    <div className="attr-details-grid">
                        <div className="attr-details-card">
                            <h3>General Config</h3>
                            <div className="attr-details-row">
                                <span className="label">Total Linked Products</span>
                                <span className="val highlighted">{selectedAttribute?.productsLinked} products</span>
                            </div>
                            <div className="attr-details-row">
                                <span className="label">Operational Status</span>
                                <div style={{ marginTop: "4px" }}>
                                    {selectedAttribute && <StatusBadge status={selectedAttribute.status} />}
                                </div>
                            </div>
                        </div>

                        <div className="attr-details-card">
                            <h3>Configured Value Pool</h3>
                            <div className="attr-details-row">
                                <span className="label">Total Available Values</span>
                                <span className="val" style={{ fontWeight: 700, fontSize: "14px", color: "var(--primary)" }}>
                                    {selectedAttribute?.values.length} configured options
                                </span>
                            </div>
                            
                            <div className="attr-details-values-wrapper">
                                {selectedAttribute?.values.map((v, idx) => (
                                    <span key={idx} className="attr-details-value-pill">
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CatalogModal>
        </div>
    );
}

export default AttributesPage;
