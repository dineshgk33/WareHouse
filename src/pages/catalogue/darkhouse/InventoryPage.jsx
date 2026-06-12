import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    AlertTriangle,
    Search,
    ChevronLeft,
    ChevronRight,
    Store,
    XCircle,
    Eye,
    SlidersHorizontal
} from "lucide-react";
import { MOCK_DARKHOUSE_STOCK } from "../../../data/inventoryData";
import { INITIAL_DARKHOUSES } from "../../../data/darkhouses";
import { getInventoryStatusClass } from "../../../utils/statusUtils";
import { useAuth } from "../../../contexts/AuthContext";
import "../Catalogue.css";

const ROWS_PER_PAGE = 6;

function InventoryPage() {
    const { canEdit, canView } = useAuth();

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
    const [modalType, setModalType] = useState(null); // 'dh-view' | 'dh-adjust'
    const [selectedItem, setSelectedItem] = useState(null);

    // Darkhouse adjust fields
    const [formAvailable, setFormAvailable] = useState(0);
    const [formReserved, setFormReserved] = useState(0);
    const [formReorder, setFormReorder] = useState(0);

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

    // ─── Form Submits ─────────────────────────────────────────────────────────
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

    // Use shared utility from statusUtils.js
    const getStatusClass = getInventoryStatusClass;

    const handleExportCSV = () => {
        const headers = ["Darkhouse Hub", "Product Name", "SKU", "Available Stock", "Reserved Stock", "Reorder Level", "Status"];
        const rows = darkhouseStock.map(i => [`"${i.darkhouse}"`, `"${i.product}"`, i.sku, i.available, i.reserved, i.reorder, i.status]);
        const filename = "haatza_darkhouse_inventory.csv";

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
                    <h1 className="inv-header__title">Inventory</h1>
                    <p className="inv-header__subtitle">Track stock status, modify quantities, and adjust reorder triggers for darkhouse hub catalogue items.</p>
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
                                        <p>No inventory allocations found matching filters.</p>
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
                                                {canEdit("DARKHOUSE_INVENTORY") && (
                                                    <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openDhAdjust(item)}>
                                                        <SlidersHorizontal size={13} />
                                                    </button>
                                                )}
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
                                <h3 className="inv-modal-title">
                                    {modalType === "dh-view" ? "Darkhouse Stock Details" : "Adjust Darkhouse Stock Levels"}
                                </h3>
                                <span className="inv-modal-subtitle">{selectedItem.sku}</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="inv-modal-body">
                            {modalType === "dh-view" && (
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

                            {modalType === "dh-adjust" && (
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
                        </div>

                        {/* Modal Footer */}
                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            {modalType === "dh-adjust" && (
                                <button type="submit" form="dh-adjust-form" className="inv-modal-submit-btn">
                                    Apply Stock Level
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
