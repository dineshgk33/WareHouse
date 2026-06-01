import React, { useState } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Package,
    Trash2,
} from "lucide-react";
import "./Orders.css";

/* ─── Mock Data (24 items, spans exactly 3 pages of 8 items each) ─── */
const MOCK_ORDERS = [
    {
        id: "#ORD-8821",
        customer: { name: "Sophia Bennett",   initials: "SB", color: "avatar-indigo"  },
        date: "30 May 2026",
        items: 3,
        amount: "₹249.00",
        payment: "Credit Card",
        status: "Delivered",
    },
    {
        id: "#ORD-8820",
        customer: { name: "Marcus Johnson",   initials: "MJ", color: "avatar-teal"   },
        date: "30 May 2026",
        items: 1,
        amount: "₹59.95",
        payment: "PayPal",
        status: "Shipped",
    },
    {
        id: "#ORD-8819",
        customer: { name: "Aisha Rahman",     initials: "AR", color: "avatar-rose"   },
        date: "29 May 2026",
        items: 5,
        amount: "₹512.40",
        payment: "Transfer Bank",
        status: "Processing",
    },
    {
        id: "#ORD-8818",
        customer: { name: "David Müller",     initials: "DM", color: "avatar-amber"  },
        date: "29 May 2026",
        items: 2,
        amount: "₹134.99",
        payment: "COD",
        status: "Pending",
    },
    {
        id: "#ORD-8817",
        customer: { name: "Priya Nair",       initials: "PN", color: "avatar-violet" },
        date: "28 May 2026",
        items: 4,
        amount: "₹389.00",
        payment: "Credit Card",
        status: "Delivered",
    },
    {
        id: "#ORD-8816",
        customer: { name: "Liam O'Brien",     initials: "LO", color: "avatar-sky"    },
        date: "27 May 2026",
        items: 1,
        amount: "₹78.50",
        payment: "PayPal",
        status: "Cancelled",
    },
    {
        id: "#ORD-8815",
        customer: { name: "Fatima Al-Hassan", initials: "FA", color: "avatar-green"  },
        date: "27 May 2026",
        items: 6,
        amount: "₹730.20",
        payment: "Transfer Bank",
        status: "Shipped",
    },
    {
        id: "#ORD-8814",
        customer: { name: "Carlos Rivera",    initials: "CR", color: "avatar-orange" },
        date: "26 May 2026",
        items: 2,
        amount: "₹199.00",
        payment: "COD",
        status: "Pending",
    },
    // Page 2 Mock Orders
    {
        id: "#ORD-8813",
        customer: { name: "Oliver Smith",     initials: "OS", color: "avatar-indigo" },
        date: "26 May 2026",
        items: 2,
        amount: "₹120.00",
        payment: "Credit Card",
        status: "Delivered",
    },
    {
        id: "#ORD-8812",
        customer: { name: "Emma Watson",      initials: "EW", color: "avatar-teal"   },
        date: "25 May 2026",
        items: 4,
        amount: "₹430.50",
        payment: "PayPal",
        status: "Processing",
    },
    {
        id: "#ORD-8811",
        customer: { name: "Lucas Silva",      initials: "LS", color: "avatar-rose"   },
        date: "25 May 2026",
        items: 1,
        amount: "₹45.00",
        payment: "COD",
        status: "Shipped",
    },
    {
        id: "#ORD-8810",
        customer: { name: "Chloe Davis",      initials: "CD", color: "avatar-amber"  },
        date: "24 May 2026",
        items: 3,
        amount: "₹210.00",
        payment: "Credit Card",
        status: "Delivered",
    },
    {
        id: "#ORD-8809",
        customer: { name: "Mia Johnson",      initials: "MJ", color: "avatar-violet" },
        date: "24 May 2026",
        items: 2,
        amount: "₹99.99",
        payment: "Transfer Bank",
        status: "Pending",
    },
    {
        id: "#ORD-8808",
        customer: { name: "Noah Carter",      initials: "NC", color: "avatar-sky"    },
        date: "23 May 2026",
        items: 5,
        amount: "₹620.00",
        payment: "PayPal",
        status: "Shipped",
    },
    {
        id: "#ORD-8807",
        customer: { name: "Zoe Martinez",     initials: "ZM", color: "avatar-green"  },
        date: "23 May 2026",
        items: 1,
        amount: "₹85.00",
        payment: "COD",
        status: "Delivered",
    },
    {
        id: "#ORD-8806",
        customer: { name: "Leo Dubois",       initials: "LD", color: "avatar-orange" },
        date: "22 May 2026",
        items: 3,
        amount: "₹175.50",
        payment: "Credit Card",
        status: "Cancelled",
    },
    // Page 3 Mock Orders
    {
        id: "#ORD-8805",
        customer: { name: "Maya Patel",       initials: "MP", color: "avatar-indigo" },
        date: "22 May 2026",
        items: 2,
        amount: "₹150.00",
        payment: "Transfer Bank",
        status: "Processing",
    },
    {
        id: "#ORD-8804",
        customer: { name: "Alex Wong",        initials: "AW", color: "avatar-teal"   },
        date: "21 May 2026",
        items: 4,
        amount: "₹320.00",
        payment: "PayPal",
        status: "Delivered",
    },
    {
        id: "#ORD-8803",
        customer: { name: "Sarah Jenkins",    initials: "SJ", color: "avatar-rose"   },
        date: "21 May 2026",
        items: 1,
        amount: "₹65.00",
        payment: "COD",
        status: "Pending",
    },
    {
        id: "#ORD-8802",
        customer: { name: "Daniel Kim",       initials: "DK", color: "avatar-amber"  },
        date: "20 May 2026",
        items: 3,
        amount: "₹280.00",
        payment: "Credit Card",
        status: "Shipped",
    },
    {
        id: "#ORD-8801",
        customer: { name: "Lily Evans",       initials: "LE", color: "avatar-violet" },
        date: "20 May 2026",
        items: 2,
        amount: "₹110.00",
        payment: "PayPal",
        status: "Delivered",
    },
    {
        id: "#ORD-8800",
        customer: { name: "James Miller",     initials: "JM", color: "avatar-sky"    },
        date: "19 May 2026",
        items: 5,
        amount: "₹499.00",
        payment: "Transfer Bank",
        status: "Shipped",
    },
    {
        id: "#ORD-8799",
        customer: { name: "Elena Petrova",    initials: "EP", color: "avatar-green"  },
        date: "19 May 2026",
        items: 1,
        amount: "₹95.00",
        payment: "COD",
        status: "Delivered",
    },
    {
        id: "#ORD-8798",
        customer: { name: "Ryan Reynolds",    initials: "RR", color: "avatar-orange" },
        date: "18 May 2026",
        items: 2,
        amount: "₹180.00",
        payment: "Credit Card",
        status: "Processing",
    }
];

const STATUS_META = {
    Pending:    { cls: "status-pending",    dot: "dot-pending"    },
    Processing: { cls: "status-processing", dot: "dot-processing" },
    Shipped:    { cls: "status-shipped",    dot: "dot-shipped"    },
    Delivered:  { cls: "status-delivered",  dot: "dot-delivered"  },
    Cancelled:  { cls: "status-cancelled",  dot: "dot-cancelled"  },
};

/* ─── Stat Mini-Card ─────────────────────────────────────────── */
function StatMiniCard({ label, value, dotClass }) {
    return (
        <div className="orders-stat-card">
            <span className={`stat-dot ${dotClass}`} />
            <div className="stat-card-body">
                <span className="stat-card-value">{value}</span>
                <span className="stat-card-label">{label}</span>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function OrdersPage() {
    const [ordersList, setOrdersList] = useState(MOCK_ORDERS);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatus]   = useState("All");
    const [dateFilter, setDate]       = useState("This Month");
    const [currentPage, setCurrentPage] = useState(1);

    // Custom date states
    const [customOrdersStart, setCustomOrdersStart] = useState("2026-05-25");
    const [customOrdersEnd, setCustomOrdersEnd] = useState("2026-06-01");
    const [customOrdersApplied, setCustomOrdersApplied] = useState(false);

    const toggleDropdown = (id) => {
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveOrder = (id) => {
        setOrdersList((prev) => prev.filter((o) => o.id !== id));
        setActiveDropdownId(null);
    };

    const handleCycleStatus = (id) => {
        setOrdersList((prev) =>
            prev.map((o) => {
                if (o.id === id) {
                    const nextStatus =
                        o.status === "Pending"
                            ? "Processing"
                            : o.status === "Processing"
                            ? "Shipped"
                            : o.status === "Shipped"
                            ? "Delivered"
                            : o.status === "Delivered"
                            ? "Cancelled"
                            : "Pending";
                    return { ...o, status: nextStatus };
                }
                return o;
            })
        );
        setActiveDropdownId(null);
    };

    const pageSize = 8;

    /* Handle Search Change */
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset page to 1
    };

    /* Handle Status Filter Change */
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setCurrentPage(1); // Reset page to 1
    };

    /* Client-side filter */
    const filtered = ordersList.filter((o) => {
        const matchSearch =
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.customer.name.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "All" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    /* Client-side pagination calculations */
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    // Clamp current page to total pages limit
    const activePage = Math.min(currentPage, totalPages);
    
    const startIndex = (activePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedOrders = filtered.slice(startIndex, endIndex);

    return (
        <div className="orders-page fade-in">

            {/* ── Page Header ─────────────────────────────────── */}
            <div className="orders-page-header">
                <div className="orders-page-title-block">
                    <div className="orders-page-icon-wrap">
                        <Package size={20} />
                    </div>
                    <div>
                        <h1 className="orders-page-title">Orders Management</h1>
                        <p className="orders-page-subtitle">
                            Track, manage and fulfil every customer order from one place.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Stat Mini-Cards ──────────────────────────────── */}
            <div className="orders-stats-row">
                <StatMiniCard label="Total Orders" value={(1718 + ordersList.length).toLocaleString()} dotClass="dot-info"       />
                <StatMiniCard label="Pending"      value={(130 + ordersList.filter(o => o.status === "Pending").length).toLocaleString()}   dotClass="dot-pending"    />
                <StatMiniCard label="Shipped"      value={(888 + ordersList.filter(o => o.status === "Shipped").length).toLocaleString()}      dotClass="dot-shipped"    />
                <StatMiniCard label="Delivered"    value={(710 + ordersList.filter(o => o.status === "Delivered").length).toLocaleString()}    dotClass="dot-delivered"  />
            </div>

            {/* ── Table Card ───────────────────────────────────── */}
            <div className="orders-table-card">

                {/* Toolbar */}
                <div className="orders-toolbar">
                    {/* Search */}
                    <div className="orders-search-wrap">
                        <Search size={15} className="orders-search-icon" />
                        <input
                            type="text"
                            className="orders-search-input"
                            placeholder="Search by order ID, customer…"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Filters */}
                    <div className="orders-filters">
                        {/* Status filter */}
                        <div className="orders-select-wrap">
                            <Filter size={13} className="orders-select-icon" />
                            <select
                                className="orders-select"
                                value={statusFilter}
                                onChange={handleStatusChange}
                                aria-label="Filter by status"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={13} className="orders-select-chevron" />
                        </div>

                        {/* Date filter */}
                        <div className="orders-select-wrap">
                            <select
                                className="orders-select orders-select--date"
                                value={dateFilter}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    if (e.target.value !== "Custom Range") {
                                        setCustomOrdersApplied(false);
                                    }
                                }}
                                aria-label="Filter by date range"
                            >
                                <option value="This Week">This Week</option>
                                <option value="This Month">This Month</option>
                                <option value="Last 3 months">Last 3 Months</option>
                                <option value="Custom Range">Custom Range</option>
                            </select>
                            <ChevronDown size={13} className="orders-select-chevron" />
                        </div>
                    </div>
                </div>

                {/* Custom Date Range Picker */}
                {dateFilter === "Custom Range" && (
                    <div className="custom-date-range-bar fade-in" style={{ margin: "0 24px 16px 24px" }}>
                        <div className="date-input-group">
                            <label htmlFor="orders-start-date">From</label>
                            <input
                                id="orders-start-date"
                                type="date"
                                className="custom-date-input"
                                value={customOrdersStart}
                                onChange={(e) => setCustomOrdersStart(e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="orders-end-date">To</label>
                            <input
                                id="orders-end-date"
                                type="date"
                                className="custom-date-input"
                                value={customOrdersEnd}
                                onChange={(e) => setCustomOrdersEnd(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn-apply-date"
                            onClick={() => setCustomOrdersApplied(true)}
                        >
                            Apply Range
                        </button>
                        {customOrdersApplied && (
                            <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginLeft: "8px" }}>
                                ✓ Range Applied
                            </span>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="orders-table-responsive">
                    <table className="orders-data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => {
                                    const meta = STATUS_META[order.status] || {};
                                    return (
                                        <tr key={order.id}>
                                            <td className="odt-id">{order.id}</td>
                                            <td>
                                                <div className="odt-customer">
                                                    <span className={`odt-avatar ${order.customer.color}`}>
                                                        {order.customer.initials}
                                                    </span>
                                                    <span className="odt-customer-name">
                                                        {order.customer.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="odt-date">{order.date}</td>
                                            <td className="odt-items">
                                                {order.items} {order.items === 1 ? "item" : "items"}
                                            </td>
                                            <td className="odt-amount">{order.amount}</td>
                                            <td className="odt-payment">{order.payment}</td>
                                            <td>
                                                <span className={`orders-status-pill ${meta.cls}`}>
                                                    <span className={`orders-status-dot ${meta.dot}`} />
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ position: "relative" }}>
                                                <button
                                                    className="odt-action-btn"
                                                    aria-label={`Actions for ${order.id}`}
                                                    onClick={() => toggleDropdown(order.id)}
                                                >
                                                    <MoreVertical size={15} />
                                                </button>

                                                {activeDropdownId === order.id && (
                                                    <>
                                                        <div className="global-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                                                        <div className="global-action-dropdown">
                                                            <button 
                                                                className="global-dropdown-item"
                                                                onClick={() => handleCycleStatus(order.id)}
                                                            >
                                                                <ChevronRight size={13} />
                                                                <span>Cycle Status</span>
                                                            </button>
                                                            <div className="global-dropdown-divider"></div>
                                                            <button 
                                                                className="global-dropdown-item global-dropdown-item-danger"
                                                                onClick={() => handleRemoveOrder(order.id)}
                                                            >
                                                                <Trash2 size={13} />
                                                                <span>Cancel Order</span>
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="odt-empty">
                                        No orders match your search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="orders-pagination">
                    <span className="orders-pagination-info">
                        Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of <strong>{totalItems}</strong> orders (filtered from 1,742 total)
                    </span>
                    <div className="orders-pagination-controls">
                        {/* Prev Button */}
                        <button 
                            className="orders-page-btn" 
                            disabled={activePage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={15} />
                            <span>Prev</span>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, idx) => {
                            const pageNum = idx + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`orders-page-number ${activePage === pageNum ? "orders-page-number--active" : ""}`}
                                    style={{ background: "transparent", border: "none", outline: "none" }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button 
                            className="orders-page-btn" 
                            disabled={activePage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            aria-label="Next page"
                        >
                            <span>Next</span>
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrdersPage;
