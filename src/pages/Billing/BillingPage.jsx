import React, { useState, useMemo } from "react";
import {
    Download,
    CreditCard,
    Search,
    ChevronDown,
    MoreVertical,
    TrendingUp,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    FileText,
    Trash2,
    Mail,
} from "lucide-react";
import "./Billing.css";

/* ─────────────────────────────────────────────
   Mock Data
───────────────────────────────────────────── */
const INVOICES = [
    {
        id: "#INV-00421",
        customer: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        date: "28 May 2025",
        amount: 18400,
        method: "Card",
        status: "Paid",
    },
    {
        id: "#INV-00420",
        customer: "Liam Fitzgerald",
        email: "liam.fitz@outlook.com",
        date: "27 May 2025",
        amount: 5200,
        method: "UPI",
        status: "Pending",
    },
    {
        id: "#INV-00419",
        customer: "Amara Osei",
        email: "amara.osei@proton.me",
        date: "25 May 2025",
        amount: 9900,
        method: "Bank",
        status: "Paid",
    },
    {
        id: "#INV-00418",
        customer: "Carlos Mendez",
        email: "cmendez@corp.io",
        date: "24 May 2025",
        amount: 3200,
        method: "Card",
        status: "Refunded",
    },
    {
        id: "#INV-00417",
        customer: "Yuki Tanaka",
        email: "yuki.t@shopzone.jp",
        date: "23 May 2025",
        amount: 14750,
        method: "COD",
        status: "Paid",
    },
    {
        id: "#INV-00416",
        customer: "Fatima Al-Rashid",
        email: "fatima.ar@haatza.ae",
        date: "22 May 2025",
        amount: 7300,
        method: "UPI",
        status: "Failed",
    },
    {
        id: "#INV-00415",
        customer: "Noah Bennett",
        email: "noah.b@enterprise.com",
        date: "20 May 2025",
        amount: 22100,
        method: "Bank",
        status: "Paid",
    },
    {
        id: "#INV-00414",
        customer: "Mei-Ling Chen",
        email: "meiling@techhive.sg",
        date: "18 May 2025",
        amount: 4150,
        method: "Card",
        status: "Pending",
    },
];

const STATUS_OPTIONS = ["All", "Paid", "Pending", "Failed", "Refunded"];
const DATE_RANGES    = ["All Time", "Last 7 days", "Last 30 days", "Last 3 months", "Custom Range"];
const ROWS_PER_PAGE  = 6;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function statusClass(status) {
    switch (status) {
        case "Paid":      return "status-pill status-paid";
        case "Pending":   return "status-pill status-pending";
        case "Failed":    return "status-pill status-failed";
        case "Refunded":  return "status-pill status-refunded";
        default:          return "status-pill";
    }
}

function methodIcon(method) {
    switch (method) {
        case "Card": return <CreditCard size={13} className="method-icon" />;
        case "UPI":  return <TrendingUp  size={13} className="method-icon" />;
        case "COD":  return <FileText    size={13} className="method-icon" />;
        case "Bank": return <Download    size={13} className="method-icon" />;
        default:     return null;
    }
}

/* ─────────────────────────────────────────────
   Summary Card
───────────────────────────────────────────── */
function SummaryCard({ label, value, sub, colorClass, icon: Icon }) {
    return (
        <div className={`billing-summary-card ${colorClass}`}>
            <div className="bsc-icon-wrap">
                <Icon size={20} />
            </div>
            <div className="bsc-body">
                <span className="bsc-label">{label}</span>
                <span className="bsc-value">{value}</span>
                <span className="bsc-sub">{sub}</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
function BillingPage() {
    const [invoicesList, setInvoicesList] = useState(INVOICES);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [search,      setSearch]      = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateRange,   setDateRange]   = useState("All Time");
    const [page,        setPage]        = useState(1);

    // Custom date states
    const [customBillingStart, setCustomBillingStart] = useState("2026-05-25");
    const [customBillingEnd, setCustomBillingEnd] = useState("2026-06-01");
    const [customBillingApplied, setCustomBillingApplied] = useState(false);

    const toggleDropdown = (id) => {
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveInvoice = (id) => {
        setInvoicesList((prev) => prev.filter((i) => i.id !== id));
        setActiveDropdownId(null);
    };

    const handleChangeStatus = (id) => {
        setInvoicesList((prev) =>
            prev.map((inv) => {
                if (inv.id === id) {
                    const nextStatus =
                        inv.status === "Paid"
                            ? "Pending"
                            : inv.status === "Pending"
                            ? "Failed"
                            : inv.status === "Failed"
                            ? "Refunded"
                            : "Paid";
                    return { ...inv, status: nextStatus };
                }
                return inv;
            })
        );
        setActiveDropdownId(null);
    };

    /* Filtered rows */
    const filtered = useMemo(() => {
        return invoicesList.filter((inv) => {
            const matchSearch =
                inv.customer.toLowerCase().includes(search.toLowerCase()) ||
                inv.email.toLowerCase().includes(search.toLowerCase()) ||
                inv.id.toLowerCase().includes(search.toLowerCase());
            const matchStatus =
                statusFilter === "All" || inv.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [search, statusFilter]);

    /* Pagination */
    const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginated   = filtered.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    const handleStatusFilter = (s) => {
        setStatusFilter(s);
        setPage(1);
    };

    /* Footer totals (filtered set) */
    const totalFiltered  = filtered.reduce((s, i) => s + i.amount, 0);
    const countFiltered  = filtered.length;

    return (
        <div className="billing-view fade-in">

            {/* ── Page Header ── */}
            <div className="billing-header">
                <div className="billing-header-text">
                    <h1 className="billing-title">Billing &amp; Payments</h1>
                    <p className="billing-subtitle">Manage invoices, track revenue, and monitor payment status.</p>
                </div>
                <button className="billing-export-btn">
                    <Download size={15} />
                    Export CSV
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="billing-cards-grid">
                <SummaryCard
                    label="Total Revenue"
                    value={formatCurrency(93250 + invoicesList.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0))}
                    sub="+8.23% vs last month"
                    colorClass="bsc-green"
                    icon={TrendingUp}
                />
                <SummaryCard
                    label="Pending Payments"
                    value={formatCurrency(3100 + invoicesList.filter(i => i.status === "Pending").reduce((sum, i) => sum + i.amount, 0))}
                    sub={`${invoicesList.filter(i => i.status === "Pending").length} invoices awaiting`}
                    colorClass="bsc-amber"
                    icon={AlertCircle}
                />
                <SummaryCard
                    label="Refunds Issued"
                    value={formatCurrency(invoicesList.filter(i => i.status === "Refunded").reduce((sum, i) => sum + i.amount, 0))}
                    sub={`${invoicesList.filter(i => i.status === "Refunded").length} refunds this month`}
                    colorClass="bsc-red"
                    icon={RotateCcw}
                />
                <SummaryCard
                    label="Successful Transactions"
                    value={(1600 + invoicesList.filter(i => i.status === "Paid").length).toLocaleString()}
                    sub="+12.5% vs last month"
                    colorClass="bsc-blue"
                    icon={CreditCard}
                />
            </div>

            {/* ── Invoices Table Card ── */}
            <div className="billing-table-card">

                {/* Table Card Header */}
                <div className="billing-table-card-header">
                    <div className="billing-table-title-block">
                        <h2>Invoices</h2>
                        <p>{countFiltered} record{countFiltered !== 1 ? "s" : ""} found</p>
                    </div>
                </div>

                {/* Filter Row */}
                <div className="billing-filter-row">
                    {/* Search */}
                    <div className="billing-search-wrap">
                        <Search size={14} className="billing-search-icon" />
                        <input
                            type="text"
                            className="billing-search-input"
                            placeholder="Search invoice, customer, email…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Status filter pills */}
                    <div className="billing-status-filters">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                className={`status-filter-btn ${statusFilter === s ? "active" : ""}`}
                                onClick={() => handleStatusFilter(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Date Range dropdown */}
                    <div className="billing-date-dropdown-wrap">
                        <select
                            className="billing-date-select"
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value);
                                if (e.target.value !== "Custom Range") {
                                    setCustomBillingApplied(false);
                                }
                            }}
                            aria-label="Date range filter"
                        >
                            {DATE_RANGES.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="billing-date-arrow" />
                    </div>
                </div>

                {/* Custom Date Range Picker */}
                {dateRange === "Custom Range" && (
                    <div className="custom-date-range-bar fade-in" style={{ margin: "0 24px 16px 24px" }}>
                        <div className="date-input-group">
                            <label htmlFor="billing-start-date">From</label>
                            <input
                                id="billing-start-date"
                                type="date"
                                className="custom-date-input"
                                value={customBillingStart}
                                onChange={(e) => setCustomBillingStart(e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="billing-end-date">To</label>
                            <input
                                id="billing-end-date"
                                type="date"
                                className="custom-date-input"
                                value={customBillingEnd}
                                onChange={(e) => setCustomBillingEnd(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn-apply-date"
                            onClick={() => setCustomBillingApplied(true)}
                        >
                            Apply Range
                        </button>
                        {customBillingApplied && (
                            <span style={{ fontSize: "12px", color: "var(--color-success)", fontWeight: "600", marginLeft: "8px" }}>
                                ✓ Range Applied
                            </span>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="billing-table-responsive">
                    <table className="billing-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Download</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="billing-empty-row">
                                        <AlertCircle size={18} />
                                        No invoices match your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="billing-inv-id">{inv.id}</td>
                                        <td>
                                            <div className="billing-customer-cell">
                                                <div className="billing-avatar">
                                                    {inv.customer.charAt(0)}
                                                </div>
                                                <div className="billing-customer-info">
                                                    <span className="billing-customer-name">{inv.customer}</span>
                                                    <span className="billing-customer-email">{inv.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="billing-date">{inv.date}</td>
                                        <td className="billing-amount">{formatCurrency(inv.amount)}</td>
                                        <td>
                                            <div className="billing-method-cell">
                                                {methodIcon(inv.method)}
                                                <span className="billing-method-label">{inv.method}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={statusClass(inv.status)}>{inv.status}</span>
                                        </td>
                                        <td>
                                            <button className="billing-download-btn" aria-label={`Download ${inv.id}`}>
                                                <Download size={14} />
                                            </button>
                                        </td>
                                        <td style={{ position: "relative" }}>
                                            <button 
                                                className="billing-action-btn" 
                                                aria-label="More actions"
                                                onClick={() => toggleDropdown(inv.id)}
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {activeDropdownId === inv.id && (
                                                <>
                                                    <div className="global-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                                                    <div className="global-action-dropdown">
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => {
                                                                window.location.href = `mailto:${inv.email}`;
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Mail size={13} />
                                                            <span>Send Email</span>
                                                        </button>
                                                        <button 
                                                            className="global-dropdown-item"
                                                            onClick={() => handleChangeStatus(inv.id)}
                                                        >
                                                            <CreditCard size={13} />
                                                            <span>Cycle Status</span>
                                                        </button>
                                                        <div className="global-dropdown-divider"></div>
                                                        <button 
                                                            className="global-dropdown-item global-dropdown-item-danger"
                                                            onClick={() => handleRemoveInvoice(inv.id)}
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete Record</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                        {/* Summary Footer Row */}
                        {filtered.length > 0 && (
                            <tfoot>
                                <tr className="billing-table-footer-row">
                                    <td colSpan={3} className="billing-footer-label">
                                        Total ({countFiltered} invoices)
                                    </td>
                                    <td className="billing-footer-amount">
                                        {formatCurrency(totalFiltered)}
                                    </td>
                                    <td colSpan={4} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <div className="billing-pagination">
                    <span className="billing-pagination-info">
                        Showing {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, filtered.length)}–
                        {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="billing-pagination-controls">
                        <button
                            className="billing-page-btn"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                className={`billing-page-btn ${n === currentPage ? "billing-page-active" : ""}`}
                                onClick={() => setPage(n)}
                                aria-label={`Page ${n}`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            className="billing-page-btn"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillingPage;
