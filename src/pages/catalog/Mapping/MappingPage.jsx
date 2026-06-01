import React, { useState, useMemo } from "react";
import { Plus, Eye, Edit2, Trash2, Map, CheckCircle2, Warehouse, AlertCircle } from "lucide-react";
import PageHeader from "../../../components/CatalogCommon/PageHeader";
import DataTable from "../../../components/CatalogCommon/DataTable";
import SearchFilterBar from "../../../components/CatalogCommon/SearchFilterBar";
import StatusBadge from "../../../components/CatalogCommon/StatusBadge";
import CatalogModal from "../../../components/CatalogCommon/CatalogModal";
import StatCard from "../../../components/StatCard/StatCard";
import { MOCK_MAPPING, MOCK_CATEGORIES } from "../../../data/catalogData";
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
        setIsMapModalOpen(true);
        if (closeMenu) closeMenu();
    };

    const handleCheckboxChange = (dhName) => {
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
        setMappingList(prev => 
            prev.map(m => {
                if (m.id === selectedMapping.id) {
                    const status = selectedDarkhouses.length > 0 ? "Active" : "Inactive";
                    // Simulate random stock allocation per mapped darkhouse
                    const allocatedStock = selectedDarkhouses.length * (Math.floor(Math.random() * 50) + 15);
                    return {
                        ...m,
                        mappedDarkhouses: selectedDarkhouses,
                        availableStock: allocatedStock,
                        status
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
                prev.map(m => m.id === mapping.id ? { ...m, mappedDarkhouses: [], availableStock: 0, status: "Inactive" } : m)
            );
        }
        if (closeMenu) closeMenu();
    };

    const columns = [
        {
            header: "Product Info",
            render: (row) => (
                <div className="map-prod-cell">
                    <span className="map-box-icon">📦</span>
                    <div className="map-prod-text">
                        <span className="map-prod-name">{row.productName}</span>
                        <span className="map-prod-sku">SKU: {row.sku}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Mapped Darkhouses",
            render: (row) => (
                <div className="mapped-hubs-list">
                    {row.mappedDarkhouses.length === 0 ? (
                        <span className="unmapped-alert">
                            <AlertCircle size={12} />
                            <span>Unmapped</span>
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
            header: "Total Stock Available",
            render: (row) => (
                <span className={`map-stock-badge ${row.availableStock === 0 ? "out" : ""}`}>
                    {row.availableStock} Units
                </span>
            )
        },
        {
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    return (
        <div className="mapping-view fade-in">
            <PageHeader
                title="Product Mapping"
                description="Link stock items to regional darkhouse distribution hubs to trigger quick-commerce deliveries"
            />

            <div className="map-stats-grid">
                <StatCard
                    title="Total SKU Pool"
                    value={String(stats.total)}
                    icon={Map}
                    trend="+10%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Active Hub Linkages"
                    value={String(stats.mapped)}
                    icon={CheckCircle2}
                    trend="+15%"
                    trendType="success"
                    defaultPeriod="Last 30 days"
                />
                <StatCard
                    title="Unmapped SKUs"
                    value={String(stats.unmapped)}
                    icon={Warehouse}
                    trend="-8%"
                    trendType="danger"
                    defaultPeriod="Last 30 days"
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

                {filteredMappings.length > 0 && (
                    <div className="prod-pagination">
                        <span className="prod-pagination-info">
                            Showing <strong>{Math.min(filteredMappings.length, (safePage - 1) * PAGE_SIZE + 1)}</strong> to{" "}
                            <strong>{Math.min(filteredMappings.length, safePage * PAGE_SIZE)}</strong> of{" "}
                            <strong>{filteredMappings.length}</strong> mappings
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
                title="Assign Darkhouses"
                description={`Choose local hubs for ${selectedMapping?.productName}`}
                icon={Warehouse}
                footer={(
                    <>
                        <button className="btn-cancel" onClick={() => setIsMapModalOpen(false)}>
                            Cancel
                        </button>
                        <button type="submit" form="map-hub-form" className="btn-submit">
                            Save Mappings
                        </button>
                    </>
                )}
            >
                <form id="map-hub-form" onSubmit={handleSaveMapping} className="dh-mapping-form">
                    <p className="dh-map-instruction">
                        Select which regional hubs this quick-commerce stock pool should be active in:
                    </p>
                    
                    <div className="dh-list-checkbox-grid">
                        {INITIAL_DARKHOUSES.map((dh) => {
                            const isChecked = selectedDarkhouses.includes(dh.name);
                            return (
                                <label key={dh.id} className={`dh-checkbox-card ${isChecked ? "checked" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange(dh.name)}
                                        className="dh-real-checkbox"
                                    />
                                    <div className="dh-checkbox-body">
                                        <div className="dh-header-group">
                                            <span className="dh-map-name">{dh.name}</span>
                                            <span className="dh-map-code">{dh.code}</span>
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
