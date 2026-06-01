import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import "./Inventory.css";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INVENTORY_ITEMS = [
    {
        sku: "HTZ-001",
        name: "Wireless Noise-Cancelling Headphones",
        category: "Electronics",
        warehouse: "WH-A / Shelf 3B",
        inStock: 142,
        reorderPoint: 50,
        maxStock: 300,
        status: "In Stock",
        lastUpdated: "31 May 2026",
    },
    {
        sku: "HTZ-002",
        name: "Ergonomic Mesh Office Chair",
        category: "Furniture",
        warehouse: "WH-B / Bay 12",
        inStock: 18,
        reorderPoint: 20,
        maxStock: 100,
        status: "Low Stock",
        lastUpdated: "30 May 2026",
    },
    {
        sku: "HTZ-003",
        name: "Mechanical Gaming Keyboard",
        category: "Electronics",
        warehouse: "WH-A / Shelf 1C",
        inStock: 0,
        reorderPoint: 30,
        maxStock: 200,
        status: "Out of Stock",
        lastUpdated: "28 May 2026",
    },
    {
        sku: "HTZ-004",
        name: "Ultra-Wide Curved Monitor 34″",
        category: "Electronics",
        warehouse: "WH-C / Rack 7",
        inStock: 67,
        reorderPoint: 25,
        maxStock: 120,
        status: "In Stock",
        lastUpdated: "01 Jun 2026",
    },
    {
        sku: "HTZ-005",
        name: "Standing Desk Frame (Electric)",
        category: "Furniture",
        warehouse: "WH-B / Bay 04",
        inStock: 9,
        reorderPoint: 15,
        maxStock: 60,
        status: "Low Stock",
        lastUpdated: "29 May 2026",
    },
    {
        sku: "HTZ-006",
        name: "USB-C 7-Port Hub Pro",
        category: "Accessories",
        warehouse: "WH-A / Shelf 2A",
        inStock: 385,
        reorderPoint: 80,
        maxStock: 400,
        status: "Overstocked",
        lastUpdated: "01 Jun 2026",
    },
    {
        sku: "HTZ-007",
        name: "Portable Bluetooth Speaker",
        category: "Electronics",
        warehouse: "WH-C / Rack 3",
        inStock: 0,
        reorderPoint: 40,
        maxStock: 250,
        status: "Out of Stock",
        lastUpdated: "27 May 2026",
    },
    {
        sku: "HTZ-008",
        name: "Premium Laptop Backpack 15.6″",
        category: "Accessories",
        warehouse: "WH-A / Shelf 5D",
        inStock: 211,
        reorderPoint: 60,
        maxStock: 350,
        status: "In Stock",
        lastUpdated: "31 May 2026",
    },
    {
        sku: "HTZ-009",
        name: "Smart LED Desk Lamp",
        category: "Lighting",
        warehouse: "WH-B / Bay 09",
        inStock: 12,
        reorderPoint: 25,
        maxStock: 150,
        status: "Low Stock",
        lastUpdated: "30 May 2026",
    },
    {
        sku: "HTZ-010",
        name: "Webcam 4K with Ring Light",
        category: "Electronics",
        warehouse: "WH-C / Rack 11",
        inStock: 54,
        reorderPoint: 20,
        maxStock: 180,
        status: "In Stock",
        lastUpdated: "01 Jun 2026",
    },
];

const TABS = ["All Items", "Low Stock", "Out of Stock", "Overstocked"];
const ROWS_PER_PAGE = 7;

// ─── Status helpers ───────────────────────────────────────────────────────────
function getStatusClass(status) {
    switch (status) {
        case "In Stock":     return "inv-pill inv-pill--success";
        case "Low Stock":    return "inv-pill inv-pill--warning";
        case "Out of Stock": return "inv-pill inv-pill--danger";
        case "Overstocked":  return "inv-pill inv-pill--info";
        default:             return "inv-pill";
    }
}

function getBarClass(status) {
    switch (status) {
        case "In Stock":     return "stock-bar__fill stock-bar__fill--success";
        case "Low Stock":    return "stock-bar__fill stock-bar__fill--warning";
        case "Out of Stock": return "stock-bar__fill stock-bar__fill--danger";
        case "Overstocked":  return "stock-bar__fill stock-bar__fill--info";
        default:             return "stock-bar__fill";
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
function InventoryPage() {
    const [activeTab, setActiveTab]     = useState("All Items");
    const [search, setSearch]           = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [restockedSkus, setRestockedSkus] = useState([]);

    // Derived counts for summary cards
    const totalSKUs    = INVENTORY_ITEMS.length;   // static 248 display; table rows = 10 sample
    const lowStockCount   = INVENTORY_ITEMS.filter(i => i.status === "Low Stock").length;
    const outOfStockCount = INVENTORY_ITEMS.filter(i => i.status === "Out of Stock").length;

    // Filter by tab
    const tabFiltered = useMemo(() => {
        if (activeTab === "All Items")   return INVENTORY_ITEMS;
        return INVENTORY_ITEMS.filter(i => i.status === activeTab);
    }, [activeTab]);

    // Filter by search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return tabFiltered;
        return tabFiltered.filter(
            i =>
                i.sku.toLowerCase().includes(q) ||
                i.name.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q) ||
                i.warehouse.toLowerCase().includes(q)
        );
    }, [tabFiltered, search]);

    // Pagination
    const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const safePage    = Math.min(currentPage, totalPages);
    const pageRows    = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleRestock = (sku) => {
        setRestockedSkus(prev => [...prev, sku]);
    };

    const handleExportCSV = () => {
        const header = ["SKU", "Product Name", "Category", "Warehouse", "In Stock", "Reorder Point", "Status", "Last Updated"];
        const rows   = INVENTORY_ITEMS.map(i => [
            i.sku, `"${i.name}"`, i.category, `"${i.warehouse}"`,
            i.inStock, i.reorderPoint, i.status, i.lastUpdated
        ]);
        const csv = [header, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = "haatza_inventory.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="inv-root fade-in">

            {/* ── Page Header ─────────────────────────────────── */}
            <div className="inv-header">
                <div className="inv-header__title-block">
                    <h1 className="inv-header__title">Inventory Control</h1>
                    <p className="inv-header__subtitle">
                        Monitor stock levels, reorder points and warehouse locations
                    </p>
                </div>
                <button className="inv-export-btn" onClick={handleExportCSV} aria-label="Export CSV">
                    <Download size={15} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* ── Summary Cards ───────────────────────────────── */}
            <div className="inv-summary-grid">
                {/* Total SKUs */}
                <div className="inv-summary-card">
                    <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                        <Package size={20} className="inv-summary-card__icon" />
                    </div>
                    <div className="inv-summary-card__body">
                        <span className="inv-summary-card__value">248</span>
                        <span className="inv-summary-card__label">Total SKUs</span>
                    </div>
                    <span className="inv-summary-card__badge inv-summary-card__badge--neutral">
                        All Products
                    </span>
                </div>

                {/* Low Stock */}
                <div className="inv-summary-card inv-summary-card--warning">
                    <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                        <AlertTriangle size={20} className="inv-summary-card__icon" />
                    </div>
                    <div className="inv-summary-card__body">
                        <span className="inv-summary-card__value inv-summary-card__value--warning">23</span>
                        <span className="inv-summary-card__label">Low Stock Items</span>
                    </div>
                    <span className="inv-summary-card__badge inv-summary-card__badge--warning">
                        Needs Attention
                    </span>
                </div>

                {/* Out of Stock */}
                <div className="inv-summary-card inv-summary-card--danger">
                    <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                        <XCircle size={20} className="inv-summary-card__icon" />
                    </div>
                    <div className="inv-summary-card__body">
                        <span className="inv-summary-card__value inv-summary-card__value--danger">7</span>
                        <span className="inv-summary-card__label">Out of Stock</span>
                    </div>
                    <span className="inv-summary-card__badge inv-summary-card__badge--danger">
                        Urgent Reorder
                    </span>
                </div>
            </div>

            {/* ── Table Card ──────────────────────────────────── */}
            <div className="inv-table-card">

                {/* Toolbar: Tabs + Search */}
                <div className="inv-toolbar">
                    <div className="inv-tabs" role="tablist">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                role="tab"
                                aria-selected={activeTab === tab}
                                className={`inv-tab${activeTab === tab ? " inv-tab--active" : ""}`}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="inv-toolbar__actions">
                        <div className="inv-search-wrap">
                            <Search size={14} className="inv-search-icon" />
                            <input
                                type="text"
                                className="inv-search"
                                placeholder="Search SKU, product, category…"
                                value={search}
                                onChange={handleSearch}
                                aria-label="Search inventory"
                            />
                        </div>
                        <button className="inv-filter-btn" aria-label="Filter options">
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="inv-table-responsive">
                    <table className="inv-table" aria-label="Inventory table">
                        <thead>
                            <tr>
                                <th>
                                    <div className="inv-th-sort">
                                        <span>SKU</span>
                                        <ArrowUpDown size={11} />
                                    </div>
                                </th>
                                <th>
                                    <div className="inv-th-sort">
                                        <span>Product Name</span>
                                        <ArrowUpDown size={11} />
                                    </div>
                                </th>
                                <th>Category</th>
                                <th>Warehouse Location</th>
                                <th>
                                    <div className="inv-th-sort">
                                        <span>In Stock</span>
                                        <ArrowUpDown size={11} />
                                    </div>
                                </th>
                                <th>Reorder Point</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="inv-empty">
                                        <Package size={32} className="inv-empty__icon" />
                                        <p>No inventory items found</p>
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((item) => {
                                    const fillPct = Math.min(100, Math.round((item.inStock / item.maxStock) * 100));
                                    const isRestocked = restockedSkus.includes(item.sku);

                                    return (
                                        <tr key={item.sku}>
                                            <td className="inv-td--sku">{item.sku}</td>
                                            <td className="inv-td--name">{item.name}</td>
                                            <td>
                                                <span className="inv-category-badge">{item.category}</span>
                                            </td>
                                            <td className="inv-td--warehouse">{item.warehouse}</td>
                                            <td>
                                                <div className="inv-stock-cell">
                                                    <span className="inv-stock-number">{item.inStock.toLocaleString()}</span>
                                                    <div className="stock-bar" aria-label={`${fillPct}% of max stock`}>
                                                        <div
                                                            className={getBarClass(item.status)}
                                                            style={{ "--fill-pct": `${fillPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="inv-stock-pct">{fillPct}%</span>
                                                </div>
                                            </td>
                                            <td className="inv-td--reorder">{item.reorderPoint}</td>
                                            <td>
                                                <span className={getStatusClass(item.status)}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="inv-td--date">{item.lastUpdated}</td>
                                            <td>
                                                <button
                                                    className={`inv-restock-btn${isRestocked ? " inv-restock-btn--done" : ""}`}
                                                    onClick={() => handleRestock(item.sku)}
                                                    disabled={isRestocked}
                                                    aria-label={`Restock ${item.name}`}
                                                >
                                                    <RefreshCw size={12} />
                                                    <span>{isRestocked ? "Queued" : "Restock"}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="inv-pagination">
                    <span className="inv-pagination__info">
                        Showing <strong>{pageRows.length}</strong> of <strong>{filtered.length}</strong> results
                    </span>
                    <div className="inv-pagination__controls">
                        <button
                            className="inv-page-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                            <button
                                key={pg}
                                className={`inv-page-btn inv-page-num${safePage === pg ? " inv-page-num--active" : ""}`}
                                onClick={() => setCurrentPage(pg)}
                                aria-label={`Page ${pg}`}
                                aria-current={safePage === pg ? "page" : undefined}
                            >
                                {pg}
                            </button>
                        ))}

                        <button
                            className="inv-page-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            aria-label="Next page"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryPage;
