import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    AlertTriangle,
    Package,
    Search,
    ChevronLeft,
    ChevronRight,
    Store,
    XCircle,
    Repeat,
    SlidersHorizontal,
    Plus,
    CheckCircle,
    Truck
} from "lucide-react";
import { MOCK_STOCK_TRANSFERS } from "../../data/inventoryData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import { getInventoryStatusClass } from "../../utils/statusUtils";
import { useAuth } from "../../context/AuthContext";
import "../Inventory/Inventory.css";

const ROWS_PER_PAGE = 6;

function StockTransfersPage() {
    const { canCreate, canApprove, canView } = useAuth();

    // ─── States ───────────────────────────────────────────────────────────────
    const [transfers, setTransfers] = useState(() => {
        const saved = localStorage.getItem("haatza_stock_transfers");
        return saved ? JSON.parse(saved) : MOCK_STOCK_TRANSFERS;
    });

    useEffect(() => {
        localStorage.setItem("haatza_stock_transfers", JSON.stringify(transfers));
    }, [transfers]);

    // Filters for Transfers
    const [trSearch, setTrSearch] = useState("");
    const [trStatusFilter, setTrStatusFilter] = useState("All");
    const [trPage, setTrPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'transfer-new'
    const [selectedItem, setSelectedItem] = useState(null);

    // Stock transfer creation fields
    const [trSource, setTrSource] = useState("HAATZA Central Warehouse");
    const [trDestination, setTrDestination] = useState(INITIAL_DARKHOUSES[0]?.name || "HAATZA Koramangala Hub");
    const [trCount, setTrCount] = useState(5);

    // ─── Dynamic Filtering ────────────────────────────────────────────────────
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
    const openNewTransfer = () => {
        setModalType("transfer-new");
        setIsModalOpen(true);
    };

    // ─── Form Submits ─────────────────────────────────────────────────────────
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

    // Approve a pending transfer → sets to Dispatched
    const handleApproveTransfer = (id) => {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "Dispatched" } : t));
    };

    // Mark a dispatched transfer as received
    const handleReceiveTransfer = (id) => {
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "Received" } : t));
    };

    // Use shared utility from statusUtils.js
    const getStatusClass = getInventoryStatusClass;

    const handleExportCSV = () => {
        const headers = ["Transfer ID", "Source Hub", "Destination Hub", "Products Count", "Created Date", "Status"];
        const rows = transfers.map(i => [i.id, `"${i.source}"`, `"${i.destination}"`, i.productsCount, `"${i.createdDate}"`, i.status]);
        const filename = "haatza_stock_transfers.csv";

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
                    <h1 className="inv-header__title">Stock Transfers Control</h1>
                    <p className="inv-header__subtitle">Coordinate central stock allocations and dispatcher hub-to-hub deliveries.</p>
                </div>
                <div className="inv-header-actions-group">
                    {canCreate("STOCK_TRANSFERS") && (
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
                    </div>
                </div>

                <div className="inv-table-responsive">
                    <table className="inv-table">
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
                                                {item.status === "Pending" && canApprove("STOCK_TRANSFERS") && (
                                                    <>
                                                        <button className="inv-action-inline-btn inv-action-inline-btn--success" onClick={() => handleApproveTransfer(item.id)}>
                                                            Approve
                                                        </button>
                                                        <button className="inv-action-inline-btn inv-action-inline-btn--warning" onClick={() => handleApproveTransfer(item.id)}>
                                                            Dispatch
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === "Dispatched" && canApprove("STOCK_TRANSFERS") && (
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
                    </table>
                </div>

                {/* Pagination */}
                {filteredTransfers.length > ROWS_PER_PAGE && (
                    <div className="inv-pagination">
                        <span className="inv-pagination__info">
                            Showing <strong>{Math.min(filteredTransfers.length, (trPage - 1) * ROWS_PER_PAGE + 1)}</strong> to <strong>{Math.min(filteredTransfers.length, trPage * ROWS_PER_PAGE)}</strong> of <strong>{filteredTransfers.length}</strong> entries
                        </span>

                        <div className="inv-pagination__controls">
                            <button
                                className="inv-page-btn"
                                onClick={() => setTrPage(p => Math.max(1, p - 1))}
                                disabled={trPage === 1}
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: Math.ceil(filteredTransfers.length / ROWS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`inv-page-btn inv-page-num ${trPage === page ? "inv-page-num--active" : ""}`}
                                    onClick={() => setTrPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="inv-page-btn"
                                onClick={() => setTrPage(p => Math.min(Math.ceil(filteredTransfers.length / ROWS_PER_PAGE), p + 1))}
                                disabled={trPage === Math.ceil(filteredTransfers.length / ROWS_PER_PAGE)}
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
                                <Repeat size={18} />
                            </div>
                            <div className="inv-modal-header__text-block">
                                <h3 className="inv-modal-title">Initiate Central Stock Transfer</h3>
                                <span className="inv-modal-subtitle">Create internal dispatcher transfer orders</span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="inv-modal-body">
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
                        </div>

                        {/* Modal Footer */}
                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            <button type="submit" form="tr-new-form" className="inv-modal-submit-btn">
                                Initiate Allocation
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default StockTransfersPage;
