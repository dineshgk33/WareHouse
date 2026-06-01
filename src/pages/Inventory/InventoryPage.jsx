import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Download,
    AlertTriangle,
    Package,
    RefreshCw,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    XCircle,
    Store,
    Repeat,
    Eye,
    Edit2,
    SlidersHorizontal,
    Plus,
    CheckCircle,
    Truck,
    ArrowLeftRight,
    Settings
} from "lucide-react";
import { MOCK_WAREHOUSE_STOCK, MOCK_DARKHOUSE_STOCK, MOCK_STOCK_TRANSFERS } from "../../data/inventoryData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import "./Inventory.css";

const ROWS_PER_PAGE = 6;

function InventoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "warehouse";

    // ─── States ───────────────────────────────────────────────────────────────
    const [warehouseStock, setWarehouseStock] = useState(MOCK_WAREHOUSE_STOCK);
    const [darkhouseStock, setDarkhouseStock] = useState(MOCK_DARKHOUSE_STOCK);
    const [transfers, setTransfers] = useState(MOCK_STOCK_TRANSFERS);

    // Filters for Warehouse
    const [whSearch, setWhSearch] = useState("");
    const [whCategory, setWhCategory] = useState("All");
    const [whLocation, setWhLocation] = useState("All");
    const [whPage, setWhPage] = useState(1);

    // Filters for Darkhouse
    const [dhSearch, setDhSearch] = useState("");
    const [dhSelect, setDhSelect] = useState("All");
    const [dhStatusFilter, setDhStatusFilter] = useState("All");
    const [dhPage, setDhPage] = useState(1);

    // Filters for Transfers
    const [trSearch, setTrSearch] = useState("");
    const [trStatusFilter, setTrStatusFilter] = useState("All");
    const [trPage, setTrPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'wh-view' | 'wh-edit' | 'wh-adjust' | 'dh-view' | 'dh-adjust' | 'transfer-new'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formStock, setFormStock] = useState(0);
    const [formReorderPoint, setFormReorderPoint] = useState(0);
    const [formSku, setFormSku] = useState("");
    
    // Darkhouse adjust fields
    const [formAvailable, setFormAvailable] = useState(0);
    const [formReserved, setFormReserved] = useState(0);
    const [formReorder, setFormReorder] = useState(0);

    // Stock transfer creation fields
    const [trSource, setTrSource] = useState("HAATZA Central Warehouse");
    const [trDestination, setTrDestination] = useState(INITIAL_DARKHOUSES[0]?.name || "HAATZA Koramangala Hub");
    const [trCount, setTrCount] = useState(5);

    // Reset pagination when changing tab
    useEffect(() => {
        setWhPage(1);
        setDhPage(1);
        setTrPage(1);
    }, [activeTab]);

    // Derived Unique Options
    const categories = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.category))], [warehouseStock]);
    const locations = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.location.split(" / ")[0]))], [warehouseStock]);
    const darkhouses = useMemo(() => ["All", ...INITIAL_DARKHOUSES.map(d => d.name)], []);

    // ─── Dynamic Filtering ────────────────────────────────────────────────────
    
    // 1. Warehouse Inventory
    const filteredWarehouseStock = useMemo(() => {
        return warehouseStock.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(whSearch.toLowerCase()) || item.sku.toLowerCase().includes(whSearch.toLowerCase());
            const matchesCategory = whCategory === "All" || item.category === whCategory;
            const matchesLocation = whLocation === "All" || item.location.startsWith(whLocation);
            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [warehouseStock, whSearch, whCategory, whLocation]);

    const paginatedWhStock = useMemo(() => {
        const start = (whPage - 1) * ROWS_PER_PAGE;
        return filteredWarehouseStock.slice(start, start + ROWS_PER_PAGE);
    }, [filteredWarehouseStock, whPage]);

    // Stats for Warehouse
    const whStats = useMemo(() => {
        const total = warehouseStock.length;
        const low = warehouseStock.filter(i => i.stock <= i.reorderPoint && i.stock > 0).length;
        const out = warehouseStock.filter(i => i.stock === 0).length;
        return { total, low, out };
    }, [warehouseStock]);

    // 2. Darkhouse Inventory
    const filteredDarkhouseStock = useMemo(() => {
        return darkhouseStock.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(dhSearch.toLowerCase()) || item.sku.toLowerCase().includes(dhSearch.toLowerCase());
            const matchesDh = dhSelect === "All" || item.darkhouse === dhSelect;
            let matchesStatus = true;
            if (dhStatusFilter === "Low Stock") {
                matchesStatus = item.available <= item.reorder && item.available > 0;
            } else if (dhStatusFilter === "Out of Stock") {
                matchesStatus = item.available === 0;
            } else if (dhStatusFilter === "In Stock") {
                matchesStatus = item.available > item.reorder;
            }
            return matchesSearch && matchesDh && matchesStatus;
        });
    }, [darkhouseStock, dhSearch, dhSelect, dhStatusFilter]);

    const paginatedDhStock = useMemo(() => {
        const start = (dhPage - 1) * ROWS_PER_PAGE;
        return filteredDarkhouseStock.slice(start, start + ROWS_PER_PAGE);
    }, [filteredDarkhouseStock, dhPage]);

    // Stats for Darkhouse
    const dhStats = useMemo(() => {
        const total = darkhouseStock.length;
        const low = darkhouseStock.filter(i => i.available <= i.reorder && i.available > 0).length;
        const out = darkhouseStock.filter(i => i.available === 0).length;
        return { total, low, out };
    }, [darkhouseStock]);

    // 3. Stock Transfers
    const filteredTransfers = useMemo(() => {
        return transfers.filter(tr => {
            const matchesSearch = tr.id.toLowerCase().includes(trSearch.toLowerCase()) || tr.source.toLowerCase().includes(trSearch.toLowerCase()) || tr.destination.toLowerCase().includes(trSearch.toLowerCase());
            const matchesStatus = trStatusFilter === "All" || tr.status === trStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [transfers, trSearch, trStatusFilter]);

    const paginatedTransfers = useMemo(() => {
        const start = (trPage - 1) * ROWS_PER_PAGE;
        return filteredTransfers.slice(start, start + ROWS_PER_PAGE);
    }, [filteredTransfers, trPage]);

    // Stats for Transfers
    const trStats = useMemo(() => {
        const total = transfers.length;
        const pending = transfers.filter(t => t.status === "Pending").length;
        const dispatched = transfers.filter(t => t.status === "Dispatched").length;
        const received = transfers.filter(t => t.status === "Received").length;
        return { total, pending, dispatched, received };
    }, [transfers]);

    // ─── Modal Openers ────────────────────────────────────────────────────────
    const openWhView = (item) => {
        setSelectedItem(item);
        setModalType("wh-view");
        setIsModalOpen(true);
    };

    const openWhEdit = (item) => {
        setSelectedItem(item);
        setFormName(item.product);
        setFormCategory(item.category);
        setFormLocation(item.location);
        setFormReorderPoint(item.reorderPoint);
        setFormSku(item.sku);
        setModalType("wh-edit");
        setIsModalOpen(true);
    };

    const openWhAdjust = (item) => {
        setSelectedItem(item);
        setFormStock(item.stock);
        setModalType("wh-adjust");
        setIsModalOpen(true);
    };

    const openDhView = (item) => {
        setSelectedItem(item);
        setModalType("dh-view");
        setIsModalOpen(true);
    };

    const openDhAdjust = (item) => {
        setSelectedItem(item);
        setFormAvailable(item.available);
        setFormReserved(item.reserved);
        setFormReorder(item.reorder);
        setModalType("dh-adjust");
        setIsModalOpen(true);
    };

    const openNewTransfer = () => {
        setTrSource("HAATZA Central Warehouse");
        setTrDestination(INITIAL_DARKHOUSES[0]?.name || "HAATZA Koramangala Hub");
        setTrCount(5);
        setModalType("transfer-new");
        setIsModalOpen(true);
    };

    // ─── CRUD Actions ─────────────────────────────────────────────────────────
    const handleWhEditSubmit = (e) => {
        e.preventDefault();
        setWarehouseStock(prev => prev.map(item => {
            if (item.sku === selectedItem.sku) {
                return {
                    ...item,
                    product: formName,
                    category: formCategory,
                    location: formLocation,
                    reorderPoint: formReorderPoint
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

    const handleWhAdjustSubmit = (e) => {
        e.preventDefault();
        setWarehouseStock(prev => prev.map(item => {
            if (item.sku === selectedItem.sku) {
                const nextStatus = formStock === 0 ? "Out of Stock" : formStock <= item.reorderPoint ? "Low Stock" : "In Stock";
                return {
                    ...item,
                    stock: formStock,
                    status: nextStatus,
                    lastUpdated: "Just Now"
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

    const handleDhAdjustSubmit = (e) => {
        e.preventDefault();
        setDarkhouseStock(prev => prev.map(item => {
            if (item.id === selectedItem.id) {
                const nextStatus = formAvailable === 0 ? "Out of Stock" : formAvailable <= formReorder ? "Low Stock" : "In Stock";
                return {
                    ...item,
                    available: formAvailable,
                    reserved: formReserved,
                    reorder: formReorder,
                    status: nextStatus
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

    const handleNewTransferSubmit = (e) => {
        e.preventDefault();
        const newTr = {
            id: `TRF-${Math.floor(10000 + Math.random() * 90000)}`,
            source: trSource,
            destination: trDestination,
            productsCount: trCount,
            createdDate: "Just Now",
            status: "Pending"
        };
        setTransfers(prev => [newTr, ...prev]);
        setIsModalOpen(false);
    };

    const handleApproveTransfer = (id) => {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "Dispatched" } : t));
    };

    const handleDispatchTransfer = (id) => {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "Dispatched" } : t));
    };

    const handleReceiveTransfer = (id) => {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "Received" } : t));
    };

    const handleTabClick = (tabKey) => {
        setSearchParams({ tab: tabKey });
    };

    // Helper classes for statuses
    const getStatusClass = (status) => {
        switch (status) {
            case "In Stock":
            case "Received":
                return "inv-pill inv-pill--success";
            case "Low Stock":
            case "Dispatched":
                return "inv-pill inv-pill--warning";
            case "Out of Stock":
            case "Pending":
                return "inv-pill inv-pill--danger";
            default:
                return "inv-pill";
        }
    };

    const handleExportCSV = () => {
        let headers = [];
        let rows = [];
        let filename = "haatza_inventory.csv";

        if (activeTab === "warehouse") {
            headers = ["SKU", "Product Name", "Category", "Warehouse Location", "Stock", "Reorder Point", "Status", "Last Updated"];
            rows = warehouseStock.map(i => [i.sku, `"${i.product}"`, i.category, `"${i.location}"`, i.stock, i.reorderPoint, i.status, i.lastUpdated]);
            filename = "haatza_warehouse_stock.csv";
        } else if (activeTab === "darkhouse") {
            headers = ["Darkhouse", "Product Name", "SKU", "Available Stock", "Reserved Stock", "Reorder Point", "Status"];
            rows = darkhouseStock.map(i => [`"${i.darkhouse}"`, `"${i.product}"`, i.sku, i.available, i.reserved, i.reorder, i.status]);
            filename = "haatza_darkhouse_stock.csv";
        } else {
            headers = ["Transfer ID", "Source Hub", "Destination Hub", "Products Count", "Created Date", "Status"];
            rows = transfers.map(i => [i.id, `"${i.source}"`, `"${i.destination}"`, i.productsCount, `"${i.createdDate}"`, i.status]);
            filename = "haatza_stock_transfers.csv";
        }

        const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="inv-root fade-in">
            {/* Page Header */}
            <div className="inv-header">
                <div className="inv-header__title-block">
                    <h1 className="inv-header__title">
                        {activeTab === "warehouse" && "Warehouse Inventory"}
                        {activeTab === "darkhouse" && "Darkhouse Inventory"}
                        {activeTab === "transfers" && "Stock Transfers Control"}
                    </h1>
                    <p className="inv-header__subtitle">
                        {activeTab === "warehouse" && "Monitor, edit, and adjust products inside your central warehouse shelves."}
                        {activeTab === "darkhouse" && "Manage quick-commerce fronting darkhouses available and reserved inventory pools."}
                        {activeTab === "transfers" && "Coordinate central stock allocations and dispatcher hub-to-hub deliveries."}
                    </p>
                </div>
                <div className="inv-header-actions-group">
                    {activeTab === "transfers" && (
                        <button className="inv-action-btn-primary" onClick={openNewTransfer}>
                            <Plus size={15} />
                            <span>New Stock Transfer</span>
                        </button>
                    )}
                    <button className="inv-export-btn" onClick={handleExportCSV}>
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Stat Grid */}
            <div className="inv-summary-grid">
                {activeTab === "warehouse" && (
                    <>
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <Package size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{whStats.total}</span>
                                <span className="inv-summary-card__label">Total SKUs</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--neutral">Central Pool</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{whStats.low}</span>
                                <span className="inv-summary-card__label">Low Stock SKUs</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--warning">Needs Attention</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{whStats.out}</span>
                                <span className="inv-summary-card__label">Out of Stock</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--danger">Urgent Reorder</span>
                        </div>
                    </>
                )}

                {activeTab === "darkhouse" && (
                    <>
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <Store size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{dhStats.total}</span>
                                <span className="inv-summary-card__label">Total Hub Items</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--neutral">Fronting Stock</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{dhStats.low}</span>
                                <span className="inv-summary-card__label">Low Hub Pools</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--warning">Needs Transfer</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{dhStats.out}</span>
                                <span className="inv-summary-card__label">Hub Stockouts</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--danger">Urgent Replenish</span>
                        </div>
                    </>
                )}

                {activeTab === "transfers" && (
                    <>
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <Repeat size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{trStats.total}</span>
                                <span className="inv-summary-card__label">Total Transfers</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--neutral">System Logs</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <SlidersHorizontal size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{trStats.pending}</span>
                                <span className="inv-summary-card__label">Pending</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--danger">Awaiting Approve</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <Truck size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{trStats.dispatched}</span>
                                <span className="inv-summary-card__label">In Transit</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--warning">Dispatched</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--success">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--success">
                                <CheckCircle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--success">{trStats.received}</span>
                                <span className="inv-summary-card__label">Received</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--success">Completed</span>
                        </div>
                    </>
                )}
            </div>

            {/* Main Table Card Area */}
            <div className="inv-table-card">
                {/* Toolbar */}
                <div className="inv-toolbar">
                    <div className="inv-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "warehouse"}
                            className={`inv-tab ${activeTab === "warehouse" ? "inv-tab--active" : ""}`}
                            onClick={() => handleTabClick("warehouse")}
                        >
                            Warehouse Inventory
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "darkhouse"}
                            className={`inv-tab ${activeTab === "darkhouse" ? "inv-tab--active" : ""}`}
                            onClick={() => handleTabClick("darkhouse")}
                        >
                            Darkhouse Inventory
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "transfers"}
                            className={`inv-tab ${activeTab === "transfers" ? "inv-tab--active" : ""}`}
                            onClick={() => handleTabClick("transfers")}
                        >
                            Stock Transfers
                        </button>
                    </div>

                    <div className="inv-toolbar__actions">
                        {activeTab === "warehouse" && (
                            <>
                                <div className="inv-search-wrap">
                                    <Search size={14} className="inv-search-icon" />
                                    <input
                                        type="text"
                                        className="inv-search"
                                        placeholder="Search product SKU or name..."
                                        value={whSearch}
                                        onChange={(e) => { setWhSearch(e.target.value); setWhPage(1); }}
                                    />
                                </div>
                                <select 
                                    className="inv-toolbar-select"
                                    value={whCategory}
                                    onChange={(e) => { setWhCategory(e.target.value); setWhPage(1); }}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.filter(c => c !== "All").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="inv-toolbar-select"
                                    value={whLocation}
                                    onChange={(e) => { setWhLocation(e.target.value); setWhPage(1); }}
                                >
                                    <option value="All">All Areas</option>
                                    {locations.filter(l => l !== "All").map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {activeTab === "darkhouse" && (
                            <>
                                <div className="inv-search-wrap">
                                    <Search size={14} className="inv-search-icon" />
                                    <input
                                        type="text"
                                        className="inv-search"
                                        placeholder="Search by SKU or item..."
                                        value={dhSearch}
                                        onChange={(e) => { setDhSearch(e.target.value); setDhPage(1); }}
                                    />
                                </div>
                                <select
                                    className="inv-toolbar-select"
                                    value={dhSelect}
                                    onChange={(e) => { setDhSelect(e.target.value); setDhPage(1); }}
                                >
                                    <option value="All">All Darkhouses</option>
                                    {darkhouses.filter(d => d !== "All").map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    className="inv-toolbar-select"
                                    value={dhStatusFilter}
                                    onChange={(e) => { setDhStatusFilter(e.target.value); setDhPage(1); }}
                                >
                                    <option value="All">All stock status</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </select>
                            </>
                        )}

                        {activeTab === "transfers" && (
                            <>
                                <div className="inv-search-wrap">
                                    <Search size={14} className="inv-search-icon" />
                                    <input
                                        type="text"
                                        className="inv-search"
                                        placeholder="Search by ID or destination..."
                                        value={trSearch}
                                        onChange={(e) => { setTrSearch(e.target.value); setTrPage(1); }}
                                    />
                                </div>
                                <select
                                    className="inv-toolbar-select"
                                    value={trStatusFilter}
                                    onChange={(e) => { setTrStatusFilter(e.target.value); setTrPage(1); }}
                                >
                                    <option value="All">All Transfer States</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Received">Received</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {/* Data Grid Area */}
                <div className="inv-table-responsive">
                    <table className="inv-table">
                        {activeTab === "warehouse" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Warehouse Location</th>
                                        <th>In Stock</th>
                                        <th>Reorder Level</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedWhStock.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="inv-empty">
                                                <Package size={32} className="inv-empty__icon" />
                                                <p>No warehouse items found matching filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedWhStock.map(item => (
                                            <tr key={item.sku} className="inventory-row-hover">
                                                <td className="inv-td--sku">{item.sku}</td>
                                                <td className="inv-td--name">{item.product}</td>
                                                <td><span className="inv-category-badge">{item.category}</span></td>
                                                <td className="inv-td--warehouse">{item.location}</td>
                                                <td>
                                                    <span className={`inv-stock-number ${item.stock === 0 ? "out" : item.stock <= item.reorderPoint ? "low" : ""}`}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td className="inv-td--reorder">{item.reorderPoint}</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td className="inv-td--date">{item.lastUpdated}</td>
                                                <td>
                                                    <div className="inv-actions-cell">
                                                        <button className="inv-row-action-btn" title="View details" onClick={() => openWhView(item)}>
                                                            <Eye size={13} />
                                                        </button>
                                                        <button className="inv-row-action-btn" title="Edit" onClick={() => openWhEdit(item)}>
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openWhAdjust(item)}>
                                                            <SlidersHorizontal size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}

                        {activeTab === "darkhouse" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Darkhouse Hub</th>
                                        <th>Product Name</th>
                                        <th>SKU</th>
                                        <th>Available Stock</th>
                                        <th>Reserved Stock</th>
                                        <th>Reorder Level</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDhStock.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="inv-empty">
                                                <Store size={32} className="inv-empty__icon" />
                                                <p>No darkhouse stock allocations found matching filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDhStock.map(item => (
                                            <tr key={item.id} className="inventory-row-hover">
                                                <td className="inv-td--darkhouse">{item.darkhouse}</td>
                                                <td className="inv-td--name">{item.product}</td>
                                                <td className="inv-td--sku">{item.sku}</td>
                                                <td>
                                                    <span className={`inv-stock-number ${item.available === 0 ? "out" : item.available <= item.reorder ? "low" : ""}`}>
                                                        {item.available}
                                                    </span>
                                                </td>
                                                <td className="inv-td--reserved">{item.reserved}</td>
                                                <td className="inv-td--reorder">{item.reorder}</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="inv-actions-cell">
                                                        <button className="inv-row-action-btn" title="View details" onClick={() => openDhView(item)}>
                                                            <Eye size={13} />
                                                        </button>
                                                        <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openDhAdjust(item)}>
                                                            <SlidersHorizontal size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}

                        {activeTab === "transfers" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Transfer ID</th>
                                        <th>Source Warehouse</th>
                                        <th>Destination Darkhouse</th>
                                        <th>Total Items Mapped</th>
                                        <th>Dispatched Date</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransfers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="inv-empty">
                                                <Repeat size={32} className="inv-empty__icon" />
                                                <p>No stock transfer orders found matching filters.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransfers.map(item => (
                                            <tr key={item.id} className="inventory-row-hover">
                                                <td className="inv-td--sku">{item.id}</td>
                                                <td className="inv-td--warehouse">{item.source}</td>
                                                <td className="inv-td--darkhouse">{item.destination}</td>
                                                <td>
                                                    <span className="inv-transfer-count-badge">
                                                        {item.productsCount} SKUs
                                                    </span>
                                                </td>
                                                <td className="inv-td--date">{item.createdDate}</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="inv-actions-cell">
                                                        {item.status === "Pending" && (
                                                            <>
                                                                <button className="inv-action-inline-btn inv-action-inline-btn--success" onClick={() => handleApproveTransfer(item.id)}>
                                                                    Approve
                                                                </button>
                                                                <button className="inv-action-inline-btn inv-action-inline-btn--warning" onClick={() => handleDispatchTransfer(item.id)}>
                                                                    Dispatch
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status === "Dispatched" && (
                                                            <button className="inv-action-inline-btn inv-action-inline-btn--success" onClick={() => handleReceiveTransfer(item.id)}>
                                                                Mark Received
                                                            </button>
                                                        )}
                                                        {item.status === "Received" && (
                                                            <span className="inv-action-completed-text">Completed</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                {((activeTab === "warehouse" && filteredWarehouseStock.length > ROWS_PER_PAGE) ||
                  (activeTab === "darkhouse" && filteredDarkhouseStock.length > ROWS_PER_PAGE) ||
                  (activeTab === "transfers" && filteredTransfers.length > ROWS_PER_PAGE)) && (
                    <div className="inv-pagination">
                        <span className="inv-pagination__info">
                            Showing <strong>{
                                activeTab === "warehouse" ? Math.min(filteredWarehouseStock.length, (whPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "darkhouse" ? Math.min(filteredDarkhouseStock.length, (dhPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(filteredTransfers.length, (trPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activeTab === "warehouse" ? Math.min(filteredWarehouseStock.length, whPage * ROWS_PER_PAGE) :
                                activeTab === "darkhouse" ? Math.min(filteredDarkhouseStock.length, dhPage * ROWS_PER_PAGE) :
                                Math.min(filteredTransfers.length, trPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activeTab === "warehouse" ? filteredWarehouseStock.length :
                                activeTab === "darkhouse" ? filteredDarkhouseStock.length :
                                filteredTransfers.length
                            }</strong> entries
                        </span>

                        <div className="inv-pagination__controls">
                            <button
                                className="inv-page-btn"
                                onClick={() => {
                                    if (activeTab === "warehouse") setWhPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "darkhouse") setDhPage(p => Math.max(1, p - 1));
                                    else setTrPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activeTab === "warehouse" ? whPage === 1 :
                                    activeTab === "darkhouse" ? dhPage === 1 :
                                    trPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: 
                                activeTab === "warehouse" ? Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE) :
                                activeTab === "darkhouse" ? Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE) :
                                Math.ceil(filteredTransfers.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`inv-page-btn inv-page-num ${
                                        (activeTab === "warehouse" && whPage === page) ||
                                        (activeTab === "darkhouse" && dhPage === page) ||
                                        (activeTab === "transfers" && trPage === page)
                                            ? "inv-page-num--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeTab === "warehouse") setWhPage(page);
                                        else if (activeTab === "darkhouse") setDhPage(page);
                                        else setTrPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="inv-page-btn"
                                onClick={() => {
                                    if (activeTab === "warehouse") setWhPage(p => Math.min(Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "darkhouse") setDhPage(p => Math.min(Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE), p + 1));
                                    else setTrPage(p => Math.min(Math.ceil(filteredTransfers.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activeTab === "warehouse" ? whPage === Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE) :
                                    activeTab === "darkhouse" ? dhPage === Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE) :
                                    trPage === Math.ceil(filteredTransfers.length / ROWS_PER_PAGE)
                                }
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODAL GLASSMORPHIC BACKDROP ─────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="inv-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="inv-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="inv-modal-header">
                            <div className="inv-modal-header__icon-wrap">
                                {modalType.startsWith("wh") ? <Package size={18} /> : <Store size={18} />}
                            </div>
                            <div className="inv-modal-header__text-block">
                                <h3 className="inv-modal-title">
                                    {modalType === "wh-view" && "Warehouse Stock Details"}
                                    {modalType === "wh-edit" && "Edit Warehouse Stock Info"}
                                    {modalType === "wh-adjust" && "Warehouse Stock Correction"}
                                    {modalType === "dh-view" && "Darkhouse Stock Allocations"}
                                    {modalType === "dh-adjust" && "Adjust Darkhouse Stock Levels"}
                                    {modalType === "transfer-new" && "Initiate Central Stock Transfer"}
                                </h3>
                                <span className="inv-modal-subtitle">
                                    {modalType.startsWith("wh") && selectedItem?.sku}
                                    {modalType.startsWith("dh") && selectedItem?.sku}
                                    {modalType === "transfer-new" && "Create internal dispatcher transfer orders"}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="inv-modal-body">
                            
                            {/* 1. WH View details */}
                            {modalType === "wh-view" && selectedItem && (
                                <div className="inv-details-sheet">
                                    <div className="details-row"><span className="details-label">Product Name:</span><span className="details-val">{selectedItem.product}</span></div>
                                    <div className="details-row"><span className="details-label">SKU Code:</span><span className="details-val font-mono">{selectedItem.sku}</span></div>
                                    <div className="details-row"><span className="details-label">Category Group:</span><span className="details-val">{selectedItem.category}</span></div>
                                    <div className="details-row"><span className="details-label">Shelf Location:</span><span className="details-val">{selectedItem.location}</span></div>
                                    <div className="details-row"><span className="details-label">Current Stock:</span><span className="details-val bold">{selectedItem.stock} items</span></div>
                                    <div className="details-row"><span className="details-label">Reorder Level:</span><span className="details-val">{selectedItem.reorderPoint} items</span></div>
                                    <div className="details-row"><span className="details-label">Warehouse Status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                    <div className="details-row"><span className="details-label">Last Audited:</span><span className="details-val">{selectedItem.lastUpdated}</span></div>
                                </div>
                            )}

                            {/* 2. WH Edit */}
                            {modalType === "wh-edit" && (
                                <form id="wh-edit-form" onSubmit={handleWhEditSubmit} className="inv-modal-form">
                                    <div className="inv-form-group">
                                        <label htmlFor="formName">Product Name</label>
                                        <input type="text" id="formName" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formCategory">Category</label>
                                        <input type="text" id="formCategory" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formLocation">Shelf Location</label>
                                        <input type="text" id="formLocation" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReorder">Reorder Threshold</label>
                                        <input type="number" id="formReorder" value={formReorderPoint} onChange={(e) => setFormReorderPoint(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                            {/* 3. WH Adjust */}
                            {modalType === "wh-adjust" && selectedItem && (
                                <form id="wh-adjust-form" onSubmit={handleWhAdjustSubmit} className="inv-modal-form">
                                    <p className="adjust-explainer">Update physical stock counts directly. Changing counts below <strong>{selectedItem.reorderPoint}</strong> triggers low-stock alerts automatically.</p>
                                    <div className="inv-form-group">
                                        <label htmlFor="formStock">Physical Stock Count</label>
                                        <div className="adjust-number-input">
                                            <input type="number" id="formStock" value={formStock} onChange={(e) => setFormStock(parseInt(e.target.value) || 0)} required min="0" />
                                            <span className="unit-label">Units</span>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* 4. DH View Details */}
                            {modalType === "dh-view" && selectedItem && (
                                <div className="inv-details-sheet">
                                    <div className="details-row"><span className="details-label">Darkhouse Destination:</span><span className="details-val">{selectedItem.darkhouse}</span></div>
                                    <div className="details-row"><span className="details-label">Product Mapped:</span><span className="details-val">{selectedItem.product}</span></div>
                                    <div className="details-row"><span className="details-label">SKU Code:</span><span className="details-val font-mono">{selectedItem.sku}</span></div>
                                    <div className="details-row"><span className="details-label">Available Stock (Ready):</span><span className="details-val bold">{selectedItem.available} items</span></div>
                                    <div className="details-row"><span className="details-label">Reserved Stock (Ordered):</span><span className="details-val">{selectedItem.reserved} items</span></div>
                                    <div className="details-row"><span className="details-label">Reorder Level:</span><span className="details-val">{selectedItem.reorder} items</span></div>
                                    <div className="details-row"><span className="details-label">Hub Status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                </div>
                            )}

                            {/* 5. DH Adjust */}
                            {modalType === "dh-adjust" && selectedItem && (
                                <form id="dh-adjust-form" onSubmit={handleDhAdjustSubmit} className="inv-modal-form">
                                    <div className="inv-form-group">
                                        <label htmlFor="formAvailable">Available (Ready to Pack)</label>
                                        <input type="number" id="formAvailable" value={formAvailable} onChange={(e) => setFormAvailable(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReserved">Reserved (Ordered by customers)</label>
                                        <input type="number" id="formReserved" value={formReserved} onChange={(e) => setFormReserved(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReorderDh">Reorder Trigger Limit</label>
                                        <input type="number" id="formReorderDh" value={formReorder} onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                            {/* 6. New Stock Transfer */}
                            {modalType === "transfer-new" && (
                                <form id="tr-new-form" onSubmit={handleNewTransferSubmit} className="inv-modal-form">
                                    <div className="inv-form-group">
                                        <label htmlFor="trSource">Origin Source</label>
                                        <select id="trSource" value={trSource} onChange={(e) => setTrSource(e.target.value)}>
                                            <option value="HAATZA Central Warehouse">HAATZA Central Warehouse</option>
                                            {INITIAL_DARKHOUSES.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="trDestination">Destination Hub</label>
                                        <select id="trDestination" value={trDestination} onChange={(e) => setTrDestination(e.target.value)}>
                                            {INITIAL_DARKHOUSES.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="trCount">Total Mapped Products Count (SKUs)</label>
                                        <input type="number" id="trCount" value={trCount} onChange={(e) => setTrCount(parseInt(e.target.value) || 0)} required min="1" />
                                    </div>
                                </form>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            
                            {modalType === "wh-edit" && (
                                <button type="submit" form="wh-edit-form" className="inv-modal-submit-btn">
                                    Save Changes
                                </button>
                            )}
                            
                            {modalType === "wh-adjust" && (
                                <button type="submit" form="wh-adjust-form" className="inv-modal-submit-btn">
                                    Apply Adjust
                                </button>
                            )}

                            {modalType === "dh-adjust" && (
                                <button type="submit" form="dh-adjust-form" className="inv-modal-submit-btn">
                                    Apply Stock Level
                                </button>
                            )}

                            {modalType === "transfer-new" && (
                                <button type="submit" form="tr-new-form" className="inv-modal-submit-btn">
                                    Initiate Allocation
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default InventoryPage;
