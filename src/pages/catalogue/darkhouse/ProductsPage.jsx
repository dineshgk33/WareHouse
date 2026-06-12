import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    AlertTriangle,
    Search,
    ChevronLeft,
    ChevronRight,
    Store,
    XCircle,
    Eye
} from "lucide-react";
import { MOCK_DARKHOUSE_STOCK } from "../../../data/inventoryData";
import { INITIAL_DARKHOUSES } from "../../../data/darkhouses";
import { getInventoryStatusClass } from "../../../utils/statusUtils";
import { useAuth } from "../../../contexts/AuthContext";
import "../Catalogue.css";

const ROWS_PER_PAGE = 6;

function ProductsPage() {
    const { canView } = useAuth();

    // ─── States ───────────────────────────────────────────────────────────────
    const [darkhouseStock, setDarkhouseStock] = useState(() => {
        const saved = localStorage.getItem("haatza_darkhouse_stock");
        return saved ? JSON.parse(saved) : MOCK_DARKHOUSE_STOCK;
    });

    useEffect(() => {
        localStorage.setItem("haatza_darkhouse_stock", JSON.stringify(darkhouseStock));
    }, [darkhouseStock]);

    // Filters for Darkhouse
    const [dhSearch, setDhSearch] = useState("");
    const [dhStatusFilter, setDhStatusFilter] = useState("All");
    const [dhPage, setDhPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // ─── Dynamic Filtering ────────────────────────────────────────────────────
    const filteredDarkhouseStock = useMemo(() => {
        return darkhouseStock.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(dhSearch.toLowerCase()) || item.sku.toLowerCase().includes(dhSearch.toLowerCase());
            let matchesStatus = true;
            if (dhStatusFilter === "Low Stock") {
                matchesStatus = item.available <= item.reorder && item.available > 0;
            } else if (dhStatusFilter === "Out of Stock") {
                matchesStatus = item.available === 0;
            } else if (dhStatusFilter === "In Stock") {
                matchesStatus = item.available > item.reorder;
            }
            return matchesSearch && matchesStatus;
        });
    }, [darkhouseStock, dhSearch, dhStatusFilter]);

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

    // ─── Modal Openers ────────────────────────────────────────────────────────
    const openDhView = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // Use shared utility from statusUtils.js
    const getStatusClass = getInventoryStatusClass;

    const handleExportCSV = () => {
        const headers = ["SKU", "Product Name", "Category", "Darkhouse Hub", "Status"];
        const rows = darkhouseStock.map(i => [i.sku, `"${i.product}"`, i.sku.startsWith("FRT") ? "Fruits & Vegetables" : i.sku.startsWith("DRY") ? "Dairy & Bread" : "Snacks & Munchies", `"${i.darkhouse}"`, i.status]);
        const filename = "haatza_darkhouse_products.csv";

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
                    <h1 className="inv-header__title">Products</h1>
                    <p className="inv-header__subtitle">Manage and check quick-commerce fronting products available and reserved in catalogue pools.</p>
                </div>
                <div className="inv-header-actions-group">
                    <button className="inv-export-btn" onClick={handleExportCSV}>
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Stat Grid */}
            <div className="inv-summary-grid">
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
            </div>

            {/* Main Table Card Area */}
            <div className="inv-table-card">
                {/* Toolbar */}
                <div className="inv-toolbar">
                    <div className="inv-toolbar__actions" style={{ flexWrap: "wrap", gap: "12px", width: "100%" }}>

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
                            value={dhStatusFilter}
                            onChange={(e) => { setDhStatusFilter(e.target.value); setDhPage(1); }}
                        >
                            <option value="All">All stock status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="inv-table-responsive">
                    <table className="inv-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Darkhouse Hub</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDhStock.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="inv-empty">
                                        <Store size={32} className="inv-empty__icon" />
                                        <p>No products found in the catalogue matching filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedDhStock.map(item => (
                                    <tr key={item.id} className="inventory-row-hover">
                                        <td className="inv-td--sku">{item.sku}</td>
                                        <td className="inv-td--name">{item.product}</td>
                                        <td><span className="inv-category-badge">{item.sku.startsWith("FRT") ? "Fruits & Vegetables" : item.sku.startsWith("DRY") ? "Dairy & Bread" : "Snacks & Munchies"}</span></td>
                                        <td className="inv-td--darkhouse">{item.darkhouse}</td>
                                        <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                        <td>
                                            <div className="inv-actions-cell">
                                                <button className="inv-row-action-btn" title="View details" onClick={() => openDhView(item)}>
                                                    <Eye size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredDarkhouseStock.length > ROWS_PER_PAGE && (
                    <div className="inv-pagination">
                        <span className="inv-pagination__info">
                            Showing <strong>{Math.min(filteredDarkhouseStock.length, (dhPage - 1) * ROWS_PER_PAGE + 1)}</strong> to <strong>{Math.min(filteredDarkhouseStock.length, dhPage * ROWS_PER_PAGE)}</strong> of <strong>{filteredDarkhouseStock.length}</strong> entries
                        </span>

                        <div className="inv-pagination__controls">
                            <button
                                className="inv-page-btn"
                                onClick={() => setDhPage(p => Math.max(1, p - 1))}
                                disabled={dhPage === 1}
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`inv-page-btn inv-page-num ${dhPage === page ? "inv-page-num--active" : ""}`}
                                    onClick={() => setDhPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="inv-page-btn"
                                onClick={() => setDhPage(p => Math.min(Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE), p + 1))}
                                disabled={dhPage === Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE)}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── MODAL GLASSMORPHIC BACKDROP ─────────────────────────────────────────── */}
            {isModalOpen && selectedItem && (
                <div className="inv-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="inv-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="inv-modal-header">
                            <div className="inv-modal-header__icon-wrap">
                                <Store size={18} />
                            </div>
                            <div className="inv-modal-header__text-block">
                                <h3 className="inv-modal-title">Darkhouse Stock Details</h3>
                                <span className="inv-modal-subtitle">{selectedItem.sku}</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="inv-modal-body">
                            <div className="inv-details-sheet">
                                <div className="details-row"><span className="details-label">Darkhouse Destination:</span><span className="details-val">{selectedItem.darkhouse}</span></div>
                                <div className="details-row"><span className="details-label">Product Mapped:</span><span className="details-val">{selectedItem.product}</span></div>
                                <div className="details-row"><span className="details-label">SKU Code:</span><span className="details-val font-mono">{selectedItem.sku}</span></div>
                                <div className="details-row"><span className="details-label">Available Stock (Ready):</span><span className="details-val bold">{selectedItem.available} items</span></div>
                                <div className="details-row"><span className="details-label">Reserved Stock (Ordered):</span><span className="details-val">{selectedItem.reserved} items</span></div>
                                <div className="details-row"><span className="details-label">Reorder Level:</span><span className="details-val">{selectedItem.reorder} items</span></div>
                                <div className="details-row"><span className="details-label">Hub Status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsPage;
