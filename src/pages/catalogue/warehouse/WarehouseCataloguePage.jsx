import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    AlertTriangle,
    Package,
    Search,
    ChevronLeft,
    ChevronRight,
    XCircle,
    Eye,
    Edit2,
    SlidersHorizontal
} from "lucide-react";
import { MOCK_WAREHOUSE_STOCK } from "../../../data/inventoryData";
import { getInventoryStatusClass } from "../../../utils/statusUtils";
import { useAuth } from "../../../contexts/AuthContext";
import "../Catalogue.css";

const ROWS_PER_PAGE = 6;

function WarehouseCataloguePage() {
    const { canEdit, canView } = useAuth();

    // ─── States ───────────────────────────────────────────────────────────────
    const [warehouseStock, setWarehouseStock] = useState(() => {
        const saved = localStorage.getItem("haatza_warehouse_stock");
        return saved ? JSON.parse(saved) : MOCK_WAREHOUSE_STOCK;
    });

    useEffect(() => {
        localStorage.setItem("haatza_warehouse_stock", JSON.stringify(warehouseStock));
    }, [warehouseStock]);

    // Filters for Warehouse
    const [whSearch, setWhSearch] = useState("");
    const [whCategory, setWhCategory] = useState("All");
    const [whLocation, setWhLocation] = useState("All");
    const [whPage, setWhPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'wh-view' | 'wh-edit' | 'wh-adjust'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formStock, setFormStock] = useState(0);
    const [formReorderPoint, setFormReorderPoint] = useState(0);
    const [formSku, setFormSku] = useState("");

    // Derived Unique Options
    const categories = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.category))], [warehouseStock]);
    const locations = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.location.split(" / ")[0]))], [warehouseStock]);

    // ─── Dynamic Filtering ────────────────────────────────────────────────────
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

    // ─── Form Submits ─────────────────────────────────────────────────────────
    const handleWhEditSubmit = (e) => {
        e.preventDefault();
        setWarehouseStock(prev => prev.map(item => {
            if (item.sku === selectedItem.sku) {
                return {
                    ...item,
                    product: formName,
                    category: formCategory,
                    location: formLocation,
                    reorderPoint: formReorderPoint,
                    lastUpdated: "Just Now"
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

    // Use shared utility from statusUtils.js
    const getStatusClass = getInventoryStatusClass;

    const handleExportCSV = () => {
        const headers = ["SKU", "Product Name", "Category", "Warehouse Location", "Stock", "Reorder Point", "Status", "Last Updated"];
        const rows = warehouseStock.map(i => [i.sku, `"${i.product}"`, i.category, `"${i.location}"`, i.stock, i.reorderPoint, i.status, i.lastUpdated]);
        const filename = "haatza_warehouse_stock.csv";

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
                    <h1 className="inv-header__title">Warehouse Catalogue</h1>
                    <p className="inv-header__subtitle">Monitor, edit, and adjust products inside your central warehouse shelves.</p>
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
                            <option value="All">All Locations</option>
                            {locations.filter(l => l !== "All").map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
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
                                                {canEdit("WAREHOUSE_INVENTORY") && (
                                                    <>
                                                        <button className="inv-row-action-btn" title="Edit" onClick={() => openWhEdit(item)}>
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openWhAdjust(item)}>
                                                            <SlidersHorizontal size={13} />
                                                        </button>
                                                    </>
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
                {filteredWarehouseStock.length > ROWS_PER_PAGE && (
                    <div className="inv-pagination">
                        <span className="inv-pagination__info">
                            Showing <strong>{Math.min(filteredWarehouseStock.length, (whPage - 1) * ROWS_PER_PAGE + 1)}</strong> to <strong>{Math.min(filteredWarehouseStock.length, whPage * ROWS_PER_PAGE)}</strong> of <strong>{filteredWarehouseStock.length}</strong> entries
                        </span>

                        <div className="inv-pagination__controls">
                            <button
                                className="inv-page-btn"
                                onClick={() => setWhPage(p => Math.max(1, p - 1))}
                                disabled={whPage === 1}
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`inv-page-btn inv-page-num ${whPage === page ? "inv-page-num--active" : ""}`}
                                    onClick={() => setWhPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="inv-page-btn"
                                onClick={() => setWhPage(p => Math.min(Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE), p + 1))}
                                disabled={whPage === Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE)}
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
                                <Package size={18} />
                            </div>
                            <div className="inv-modal-header__text-block">
                                <h3 className="inv-modal-title">
                                    {modalType === "wh-view" && "Warehouse Stock Details"}
                                    {modalType === "wh-edit" && "Edit Warehouse Stock Info"}
                                    {modalType === "wh-adjust" && "Warehouse Stock Correction"}
                                </h3>
                                <span className="inv-modal-subtitle">
                                    {selectedItem?.sku}
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
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default WarehouseCataloguePage;
