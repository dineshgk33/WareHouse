import React, { useState, useMemo } from "react";
import {
    Search,
    Download,
    Users,
    ChevronDown,
    MoreVertical,
    Mail,
    UserCheck,
    UserPlus,
    Trash2,
} from "lucide-react";
import "./Customers.css";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CUSTOMERS = [
    {
        id: "C-0001",
        name: "Sophia Ramirez",
        email: "sophia.ramirez@email.com",
        phone: "+1 (415) 823-9201",
        location: "San Francisco, CA",
        totalOrders: 34,
        totalSpent: 4820.5,
        status: "Active",
        joined: "Jan 14, 2024",
        avatarColor: "avatar-indigo",
    },
    {
        id: "C-0002",
        name: "James Okafor",
        email: "james.okafor@mail.com",
        phone: "+1 (212) 554-7734",
        location: "New York, NY",
        totalOrders: 19,
        totalSpent: 2371.0,
        status: "Active",
        joined: "Mar 02, 2024",
        avatarColor: "avatar-teal",
    },
    {
        id: "C-0003",
        name: "Ling Wei",
        email: "lingwei@techcorp.io",
        phone: "+1 (312) 678-0045",
        location: "Chicago, IL",
        totalOrders: 8,
        totalSpent: 649.99,
        status: "Inactive",
        joined: "Apr 18, 2024",
        avatarColor: "avatar-rose",
    },
    {
        id: "C-0004",
        name: "Marcus Johnson",
        email: "marcus.j@outlook.com",
        phone: "+1 (713) 990-2187",
        location: "Houston, TX",
        totalOrders: 52,
        totalSpent: 9134.75,
        status: "Active",
        joined: "Nov 30, 2023",
        avatarColor: "avatar-amber",
    },
    {
        id: "C-0005",
        name: "Priya Nair",
        email: "priya.nair@promail.in",
        phone: "+91 98452 10983",
        location: "Bangalore, IN",
        totalOrders: 3,
        totalSpent: 214.5,
        status: "Blocked",
        joined: "Jul 07, 2024",
        avatarColor: "avatar-purple",
    },
    {
        id: "C-0006",
        name: "Elena Petrov",
        email: "e.petrov@euronet.eu",
        phone: "+44 7911 123456",
        location: "London, UK",
        totalOrders: 27,
        totalSpent: 3560.0,
        status: "Active",
        joined: "Feb 09, 2024",
        avatarColor: "avatar-cyan",
    },
    {
        id: "C-0007",
        name: "David Park",
        email: "david.park@kmail.kr",
        phone: "+82 10-4455-7812",
        location: "Seoul, KR",
        totalOrders: 11,
        totalSpent: 1188.25,
        status: "Inactive",
        joined: "May 22, 2024",
        avatarColor: "avatar-orange",
    },
    {
        id: "C-0008",
        name: "Amara Diallo",
        email: "amara.diallo@afri.co",
        phone: "+221 77 345 6789",
        location: "Dakar, SN",
        totalOrders: 6,
        totalSpent: 529.0,
        status: "Active",
        joined: "Jun 01, 2025",
        avatarColor: "avatar-green",
    },
];

const STATUS_OPTIONS = ["All", "Active", "Inactive", "Blocked"];
const SORT_OPTIONS = [
    { value: "most-spent", label: "Most Spent" },
    { value: "most-orders", label: "Most Orders" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
];
const PAGE_SIZE = 8;

// ─── Helper: initials from name ────────────────────────────────────────────────
function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Helper: status CSS class ──────────────────────────────────────────────────
function statusClass(status) {
    if (status === "Active") return "badge-active";
    if (status === "Blocked") return "badge-blocked";
    return "badge-inactive";
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, accentClass }) {
    return (
        <div className={`cust-stat-card ${accentClass}`}>
            <div className="cust-stat-icon-wrap">
                <Icon size={20} strokeWidth={2} />
            </div>
            <div className="cust-stat-body">
                <span className="cust-stat-value">{value}</span>
                <span className="cust-stat-label">{label}</span>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function CustomersPage() {
    const [customersList, setCustomersList] = useState(CUSTOMERS);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("most-spent");
    const [currentPage, setCurrentPage] = useState(1);

    const toggleDropdown = (id) => {
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveCustomer = (id) => {
        setCustomersList((prev) => prev.filter((c) => c.id !== id));
        setActiveDropdownId(null);
    };

    const handleChangeStatus = (id) => {
        setCustomersList((prev) =>
            prev.map((c) => {
                if (c.id === id) {
                    const nextStatus =
                        c.status === "Active"
                            ? "Inactive"
                            : c.status === "Inactive"
                            ? "Blocked"
                            : "Active";
                    return { ...c, status: nextStatus };
                }
                return c;
            })
        );
        setActiveDropdownId(null);
    };

    // Filtered + sorted customers
    const displayedCustomers = useMemo(() => {
        let result = customersList.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.location.toLowerCase().includes(search.toLowerCase());
            const matchesStatus =
                statusFilter === "All" || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        result = [...result].sort((a, b) => {
            if (sortBy === "most-spent") return b.totalSpent - a.totalSpent;
            if (sortBy === "most-orders") return b.totalOrders - a.totalOrders;
            if (sortBy === "newest")
                return new Date(b.joined) - new Date(a.joined);
            if (sortBy === "oldest")
                return new Date(a.joined) - new Date(b.joined);
            return 0;
        });

        return result;
    }, [search, statusFilter, sortBy]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(displayedCustomers.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginated = displayedCustomers.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE
    );

    const handleStatusFilter = (s) => {
        setStatusFilter(s);
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="customers-view fade-in">
            {/* ── Page Header ── */}
            <div className="customers-header">
                <div className="customers-header-title">
                    <h1>Customers</h1>
                    <p>Manage and monitor your customer base</p>
                </div>
                <button className="cust-export-btn">
                    <Download size={15} strokeWidth={2.2} />
                    <span>Export</span>
                </button>
            </div>

            {/* ── Summary Stat Cards ── */}
            <div className="cust-stats-grid">
                <SummaryCard
                    icon={Users}
                    label="Total Customers"
                    value={(1174 + customersList.length).toLocaleString()}
                    accentClass="accent-blue"
                />
                <SummaryCard
                    icon={UserPlus}
                    label="New This Month"
                    value="94"
                    accentClass="accent-teal"
                />
                <SummaryCard
                    icon={UserCheck}
                    label="Active"
                    value={(1035 + customersList.filter(c => c.status === "Active").length).toLocaleString()}
                    accentClass="accent-green"
                />
            </div>

            {/* ── Table Card ── */}
            <div className="cust-table-card">
                {/* Controls Row */}
                <div className="cust-controls-row">
                    {/* Search */}
                    <div className="cust-search-wrap">
                        <Search size={15} className="cust-search-icon" />
                        <input
                            type="text"
                            className="cust-search-input"
                            placeholder="Search by name, email or location…"
                            value={search}
                            onChange={handleSearch}
                            aria-label="Search customers"
                        />
                    </div>

                    <div className="cust-controls-right">
                        {/* Status Filter Tabs */}
                        <div className="cust-status-tabs" role="group" aria-label="Filter by status">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    className={`cust-status-tab ${statusFilter === s ? "cust-status-tab--active" : ""}`}
                                    onClick={() => handleStatusFilter(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="cust-sort-wrap">
                            <div className="dropdown-button-container">
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="dropdown-select"
                                    aria-label="Sort customers"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={13} className="dropdown-select-arrow" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="cust-table-responsive">
                    <table className="cust-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>Orders</th>
                                <th>Total Spent</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="cust-table-empty">
                                        No customers match your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((customer) => (
                                    <tr key={customer.id} className="cust-table-row">
                                        {/* Avatar + Name */}
                                        <td>
                                            <div className="cust-identity">
                                                <div className={`cust-avatar ${customer.avatarColor}`}>
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div className="cust-name-block">
                                                    <span className="cust-name">{customer.name}</span>
                                                    <span className="cust-id">{customer.id}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td>
                                            <a
                                                href={`mailto:${customer.email}`}
                                                className="cust-email-link"
                                                title={`Email ${customer.name}`}
                                            >
                                                <Mail size={13} className="cust-email-icon" />
                                                {customer.email}
                                            </a>
                                        </td>

                                        {/* Phone */}
                                        <td className="cust-cell-muted">{customer.phone}</td>

                                        {/* Location */}
                                        <td className="cust-cell-muted">{customer.location}</td>

                                        {/* Orders */}
                                        <td className="cust-cell-orders">{customer.totalOrders}</td>

                                        {/* Total Spent */}
                                        <td className="cust-cell-spent">
                                            ₹{customer.totalSpent.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>

                                        {/* Status Badge */}
                                        <td>
                                            <span className={`cust-badge ${statusClass(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="cust-cell-muted">{customer.joined}</td>

                                        {/* Actions */}
                                        <td style={{ position: "relative" }}>
                                            <button
                                                className="cust-action-btn"
                                                aria-label={`More actions for ${customer.name}`}
                                                onClick={() => toggleDropdown(customer.id)}
                                            >
                                                <MoreVertical size={15} />
                                            </button>

                                            {activeDropdownId === customer.id && (
                                                <>
                                                    <div className="cust-dropdown-overlay" onClick={() => setActiveDropdownId(null)} />
                                                    <div className="cust-action-dropdown">
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                window.location.href = `mailto:${customer.email}`;
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Mail size={13} />
                                                            <span>Send Email</span>
                                                        </button>
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={() => handleChangeStatus(customer.id)}
                                                        >
                                                            <UserCheck size={13} />
                                                            <span>Toggle Status</span>
                                                        </button>
                                                        <div className="dropdown-divider"></div>
                                                        <button 
                                                            className="dropdown-item dropdown-item-danger"
                                                            onClick={() => handleRemoveCustomer(customer.id)}
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete Customer</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="cust-pagination">
                    <span className="cust-pagination-info">
                        Showing{" "}
                        <strong>
                            {displayedCustomers.length === 0
                                ? 0
                                : (safeCurrentPage - 1) * PAGE_SIZE + 1}
                            –{Math.min(safeCurrentPage * PAGE_SIZE, displayedCustomers.length)}
                        </strong>{" "}
                        of <strong>{displayedCustomers.length}</strong> customers
                    </span>

                    <div className="cust-pagination-controls">
                        <button
                            className="cust-page-btn"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safeCurrentPage === 1}
                            aria-label="Previous page"
                        >
                            &#8592; Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`cust-page-btn cust-page-number ${safeCurrentPage === page ? "cust-page-btn--active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                                aria-label={`Page ${page}`}
                                aria-current={safeCurrentPage === page ? "page" : undefined}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="cust-page-btn"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage === totalPages}
                            aria-label="Next page"
                        >
                            Next &#8594;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomersPage;
