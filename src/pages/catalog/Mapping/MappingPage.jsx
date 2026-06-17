import React, { useState, useMemo } from "react";
import { Plus, Eye, Edit2, Trash2, Map, CheckCircle2, Warehouse, AlertCircle, AlertTriangle } from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_MAPPING, MOCK_PRODUCTS } from "../../../data/catalogData";
import { INITIAL_DARKHOUSES } from "../../../data/darkhouses";
import "./MappingPage.css";

const PAGE_SIZE = 5;

function MappingPage() {
    const [mappingList, setMappingList] = useState(MOCK_MAPPING);
    const [search, setSearch] = useState("");
    const [darkhouseFilter, setDarkhouseFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [selectedDarkhouses, setSelectedDarkhouses] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    // ─── Filters configuration ───────────────────────────────────────────────
    const filters = [
        {
            key: "darkhouse",
            value: darkhouseFilter,
            onChange: (e) => { setDarkhouseFilter(e.target.value); setCurrentPage(1); },
            options: ["All", ...INITIAL_DARKHOUSES.map(d => d.name)],
            label: "Filter by Darkhouse"
        }
    ];

    // ─── Search and filter logic ─────────────────────────────────────────────
    const filteredMappings = useMemo(() => {
        return mappingList.filter((map) => {
            const matchesSearch = 
                map.productName.toLowerCase().includes(search.toLowerCase()) ||
                map.sku.toLowerCase().includes(search.toLowerCase());
            
            const matchesDarkhouse = 
                darkhouseFilter === "All" || 
                map.mappedDarkhouses.includes(darkhouseFilter);
            
            return matchesSearch && matchesDarkhouse;
        });
    }, [search, darkhouseFilter, mappingList]);

    // ─── Pagination ────────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredMappings.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedMappings = filteredMappings.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    // ─── Stats ─────────────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = mappingList.length;
        const mapped = mappingList.filter(m => m.mappedDarkhouses.length > 0).length;
        const unmapped = total - mapped;
        return { total, mapped, unmapped };
    }, [mappingList]);

    // ─── Handlers ──────────────────────────────────────────────────────────────
    const handleOpenMapModal = (mapping, closeMenu) => {
        setSelectedMapping(mapping);
        setSelectedDarkhouses([...mapping.mappedDarkhouses]);
        setFormErrors({});
        setIsMapModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleCheckboxChange = (dhName, isInactive) => {
        if (isInactive) {
            setFormErrors({ modal: "Error: Cannot assign stock to Inactive/Offline darkhouse nodes." });
            return;
        }

        setFormErrors({});
        setSelectedDarkhouses(prev => {
            if (prev.includes(dhName)) {
                return prev.filter(name => name !== dhName);
            } else {
                return [...prev, dhName];
            }
        });
    };

    const handleSaveMapping = (e) => {
        e.preventDefault();
        
        // Find mapped product and check PIM status
        const productInfo = MOCK_PRODUCTS.find(p => p.sku === selectedMapping.sku);
        const isProductPublished = productInfo && productInfo.status === "Published";

        setMappingList(prev => 
            prev.map(m => {
                if (m.id === selectedMapping.id) {
                    const status = selectedDarkhouses.length > 0 ? "Active" : "Inactive";
                    const allocatedStock = selectedDarkhouses.length * 60;
                    return {
                        ...m,
                        mappedDarkhouses: selectedDarkhouses,
                        availableStock: allocatedStock,
                        status: isProductPublished ? status : "Inactive", // Cannot be active if product isn't published
                        syncAlert: !isProductPublished
                    };
                }
                return m;
            })
        );
        setIsMapModalOpen(false);
    };

    const handleRemoveAllMappings = (mapping, closeMenu) => {
        if (window.confirm(`Are you sure you want to remove all darkhouse mappings for ${mapping.productName}?`)) {
            setMappingList(prev => 
                prev.map(m => m.id === mapping.id ? { ...m, mappedDarkhouses: [], availableStock: 0, status: "Inactive", syncAlert: false } : m)
            );
        }
        if (closeMenu) closeMenu();
    };

    const columns = [
        {
            header: "Product SKU & Name",
            render: (row) => {
                const prod = MOCK_PRODUCTS.find(p => p.sku === row.sku);
                const isDraft = prod && prod.status !== "Published";
                
                return (
                    <div className="map-prod-cell">
                        <span className="map-box-icon">📦</span>
                        <div className="map-prod-text">
                            <span className="map-prod-name">{row.productName}</span>
                            <div className="map-prod-sub-row">
                                <span className="map-prod-sku">SKU: {row.sku}</span>
                                {isDraft && (
                                    <span className="pim-alert-badge">
                                        <AlertTriangle size={10} />
                                        <span>Draft/Pending</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Regional Allocations",
            render: (row) => (
                <div className="mapped-hubs-list">
                    {row.mappedDarkhouses.length === 0 ? (
                        <span className="unmapped-alert">
                            <AlertCircle size={12} />
                            <span>Unallocated</span>
                        </span>
                    ) : (
                        row.mappedDarkhouses.map((dh, idx) => (
                            <span key={idx} className="mapped-hub-pill">{dh}</span>
                        ))
                    )}
                </div>
            )
        },
        {
            header: "Aggregated Stock Pool",
            render: (row) => (
                <span className={`map-stock-badge ${row.availableStock === 0 ? "out" : ""}`}>
                    {row.availableStock} Units Mapped
                </span>
            )
        },
        {
            header: "Linkage Status",
            render: (row) => {
                const prod = MOCK_PRODUCTS.find(p => p.sku === row.sku);
                const isOutofSync = (prod && prod.status !== "Published" && row.mappedDarkhouses.length > 0) || row.syncAlert;

                return (
                    <div className="flex flex-col gap-1">
                        <StatusBadge status={row.status} />
                        {isOutofSync && (
                            <span className="pim-warning-text-alert">
                                ⚠ Inventory Out of Sync (Not Published)
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="mapping-view fade-in">
            <PageHeader
                title="Product Mapping & Linkages"
                description="Link catalog SKUs to active regional warehouses and zones to synchronize stock levels"
            />

            {/* Stats */}
            <div className="map-stats-grid">
                <StatCard
                    title="Active Mapped SKUs"
                    value={String(stats.mapped)}
                    icon={Map}
                    trend="+15%"
                    trendType="success"
                    defaultPeriod="Linked to nodes"
                />
                <StatCard
                    title="Unmapped SKUs"
                    value={String(stats.unmapped)}
                    icon={Warehouse}
                    trend="-2%"
                    trendType="success"
                    defaultPeriod="No nodes assigned"
                />
                <StatCard
                    title="Total SKU Pool"
                    value={String(stats.total)}
                    icon={CheckCircle2}
                    trend="0%"
                    trendType="neutral"
                    defaultPeriod="Active mappings"
                />
            </div>

            <div className="cat-table-card">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Search SKU or product name..."
                    filters={filters}
                />

                <DataTable
                    columns={columns}
                    data={paginatedMappings}
                    rowIdKey="id"
                    emptyMessage="No product mappings found matching your criteria"
                    actions={(row, closeMenu) => (
                        <>
                            <button className="global-dropdown-item" onClick={() => handleOpenMapModal(row, closeMenu)}>
                                <Warehouse size={14} />
                                <span>Assign Hubs</span>
                            </button>
                            <div className="global-dropdown-divider"></div>
                            <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleRemoveAllMappings(row, closeMenu)}>
                                <Trash2 size={14} />
                                <span>Unmap All</span>
                            </button>
                        </>
                    )}
                />

                {/* Pagination */}
                {filteredMappings.length > 0 && (
                    <div className="prod-pagination">
                        <span className="prod-pagination-info">
                            Showing <strong>{Math.min(filteredMappings.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredMappings.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredMappings.length}</strong> SKU assignments
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

            {/* ─── CHOOSE MAP MODAL ────────────────────────────────────────────────── */}
            <CatalogModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                title="Assign Darkhouse Hubs"
                description={`Map SKU: ${selectedMapping?.sku} (${selectedMapping?.productName})`}
                icon={Warehouse}
                footer={(
                    <>
                        <button className="btn-cancel" onClick={() => setIsMapModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="map-hub-form" className="btn-submit">
                            Save Linkages
                        </button>
                    </>
                )}
            >
                <form id="map-hub-form" onSubmit={handleSaveMapping} className="dh-mapping-form">
                    <p className="dh-map-instruction">
                        Select which regional quick-commerce hubs this SKU is active in. Inactive nodes are locked out:
                    </p>

                    {formErrors.modal && (
                        <div className="pim-error-banner-alert">
                            <AlertCircle size={16} />
                            <span>{formErrors.modal}</span>
                        </div>
                    )}
                    
                    <div className="dh-list-checkbox-grid">
                        {INITIAL_DARKHOUSES.map((dh) => {
                            const isChecked = selectedDarkhouses.includes(dh.name);
                            const isOffline = dh.status === "INACTIVE";

                            return (
                                <label key={dh.id} className={`dh-checkbox-card ${isChecked ? "checked" : ""} ${isOffline ? "offline" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isOffline}
                                        onChange={() => handleCheckboxChange(dh.name, isOffline)}
                                        className="dh-real-checkbox"
                                    />
                                    <div className="dh-checkbox-body">
                                        <div className="dh-header-group">
                                            <span className="dh-map-name">{dh.name}</span>
                                            {isOffline ? (
                                                <span className="dh-inactive-pill">Offline</span>
                                            ) : (
                                                <span className="dh-map-code">{dh.code}</span>
                                            )}
                                        </div>
                                        <span className="dh-map-city">{dh.city}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </form>
            </CatalogModal>
        </div>
    );
}

export default MappingPage;
