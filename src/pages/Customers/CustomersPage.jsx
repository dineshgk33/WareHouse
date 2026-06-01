import React, { useState, useMemo, useEffect } from "react";
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
    Ban,
    TrendingUp,
    TrendingDown,
    Calendar,
    Building2,
    Sparkles,
    Clock,
    ShoppingBag,
    Tag,
    ChevronRight,
    Plus,
    Award,
    ShieldAlert,
    Phone,
    MapPin,
    FileText,
    Percent,
    ArrowUpRight,
    Edit2
} from "lucide-react";
import {
    AreaChart,
    Area,
    ResponsiveContainer
} from "recharts";
import "./Customers.css";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
    {
        id: "C-0001",
        name: "Sophia Ramirez",
        email: "sophia.ramirez@email.com",
        phone: "+1 (415) 823-9201",
        location: "San Francisco, CA",
        city: "San Francisco",
        totalOrders: 34,
        totalSpent: 4820.5,
        status: "Active",
        joined: "Jan 14, 2024",
        avatarColor: "avatar-indigo",
        loyaltyBadge: "VIP",
        lastOrderDate: "May 28, 2026",
        customerType: "Consumer",
        address: "450 Mission St, San Francisco, CA 94105",
        favCategories: ["Fruits & Vegetables", "Snacks & Drinks"],
        notes: "Prefers eco-friendly packaging. Prefers morning deliveries on weekends."
    },
    {
        id: "C-0002",
        name: "James Okafor",
        email: "james.okafor@mail.com",
        phone: "+1 (212) 554-7734",
        location: "New York, NY",
        city: "New York",
        totalOrders: 19,
        totalSpent: 2371.0,
        status: "Active",
        joined: "Mar 02, 2024",
        avatarColor: "avatar-teal",
        loyaltyBadge: "Frequent",
        lastOrderDate: "May 25, 2026",
        customerType: "Consumer",
        address: "72 Grand St, New York, NY 10013",
        favCategories: ["Dairy & Bread", "Atta, Rice & Dal"],
        notes: "Loyal customer. Usually orders bulk grains."
    },
    {
        id: "C-0003",
        name: "Ling Wei",
        email: "lingwei@techcorp.io",
        phone: "+1 (312) 678-0045",
        location: "Chicago, IL",
        city: "Chicago",
        totalOrders: 8,
        totalSpent: 649.99,
        status: "Inactive",
        joined: "Apr 18, 2024",
        avatarColor: "avatar-rose",
        loyaltyBadge: "Regular",
        lastOrderDate: "Feb 10, 2026",
        customerType: "Business",
        address: "333 W Wacker Dr, Chicago, IL 60606",
        favCategories: ["Coffee & Tea", "Bakery"],
        notes: "Corporate account. Orders coffee machine pods monthly."
    },
    {
        id: "C-0004",
        name: "Marcus Johnson",
        email: "marcus.j@outlook.com",
        phone: "+1 (713) 990-2187",
        location: "Houston, TX",
        city: "Houston",
        totalOrders: 52,
        totalSpent: 9134.75,
        status: "Active",
        joined: "Nov 30, 2023",
        avatarColor: "avatar-amber",
        loyaltyBadge: "VIP",
        lastOrderDate: "May 30, 2026",
        customerType: "Consumer",
        address: "1200 Travis St, Houston, TX 77002",
        favCategories: ["Meat & Seafood", "Fruits & Vegetables"],
        notes: "High-value VIP consumer. Enjoys seafood selections."
    },
    {
        id: "C-0005",
        name: "Priya Nair",
        email: "priya.nair@promail.in",
        phone: "+91 98452 10983",
        location: "Bangalore, IN",
        city: "Bangalore",
        totalOrders: 3,
        totalSpent: 214.5,
        status: "Blocked",
        joined: "Jul 07, 2024",
        avatarColor: "avatar-purple",
        loyaltyBadge: "Regular",
        lastOrderDate: "Aug 12, 2024",
        customerType: "Consumer",
        address: "80 Feet Rd, Koramangala, Bangalore 560034",
        favCategories: ["Snacks & Drinks"],
        notes: "Account blocked due to multiple chargeback attempts."
    },
    {
        id: "C-0006",
        name: "Elena Petrov",
        email: "e.petrov@euronet.eu",
        phone: "+44 7911 123456",
        location: "London, UK",
        city: "London",
        totalOrders: 27,
        totalSpent: 3560.0,
        status: "Active",
        joined: "Feb 09, 2024",
        avatarColor: "avatar-cyan",
        loyaltyBadge: "Frequent",
        lastOrderDate: "May 22, 2026",
        customerType: "Consumer",
        address: "24 Park Ln, London W1K 1PR, UK",
        favCategories: ["Dairy & Bread", "Packaged Foods"],
        notes: "Frequent buyer of organic breads and imported spreads."
    },
    {
        id: "C-0007",
        name: "David Park",
        email: "david.park@kmail.kr",
        phone: "+82 10-4455-7812",
        location: "Seoul, KR",
        city: "Seoul",
        totalOrders: 11,
        totalSpent: 1188.25,
        status: "Inactive",
        joined: "May 22, 2024",
        avatarColor: "avatar-orange",
        loyaltyBadge: "Regular",
        lastOrderDate: "Jan 15, 2026",
        customerType: "Consumer",
        address: "12 Garosu-gil, Gangnam-gu, Seoul, Korea",
        favCategories: ["Snacks & Drinks", "Instant Noodles"],
        notes: "Has not ordered in 4 months. Send coupon code."
    },
    {
        id: "C-0008",
        name: "Amara Diallo",
        email: "amara.diallo@afri.co",
        phone: "+221 77 345 6789",
        location: "Dakar, SN",
        city: "Dakar",
        totalOrders: 6,
        totalSpent: 529.0,
        status: "Active",
        joined: "Jun 01, 2025",
        avatarColor: "avatar-green",
        loyaltyBadge: "New",
        lastOrderDate: "May 20, 2026",
        customerType: "Consumer",
        address: "Route de Ngor, Dakar, Senegal",
        favCategories: ["Fruits & Vegetables", "Ice Creams & Desserts"],
        notes: "Newly active buyer. High potential for retention campaigns."
    },
    {
        id: "C-0009",
        name: "Vikram Malhotra",
        email: "vikram.m@wholesale.in",
        phone: "+91 99000 88221",
        location: "Bangalore, IN",
        city: "Bangalore",
        totalOrders: 42,
        totalSpent: 12500.0,
        status: "Active",
        joined: "Oct 12, 2023",
        avatarColor: "avatar-indigo",
        loyaltyBadge: "VIP",
        lastOrderDate: "May 29, 2026",
        customerType: "Wholesale",
        address: "Outer Ring Rd, Marathahalli, Bangalore 560037",
        favCategories: ["Dairy & Bread", "Atta, Rice & Dal", "Snacks & Drinks"],
        notes: "Wholesale distributor account. Large volume orders weekly."
    }
];

// Sparkline datasets for 5 KPI cards
const sparklineData = {
    "Total Customers": [
        { val: 1150 }, { val: 1158 }, { val: 1162 }, { val: 1170 }, { val: 1176 }, { val: 1180 }, { val: 1183 }
    ],
    "New This Month": [
        { val: 45 }, { val: 58 }, { val: 62 }, { val: 74 }, { val: 80 }, { val: 88 }, { val: 94 }
    ],
    "Active": [
        { val: 990 }, { val: 1005 }, { val: 1012 }, { val: 1020 }, { val: 1025 }, { val: 1032 }, { val: 1044 }
    ],
    "Repeat Customers": [
        { val: 780 }, { val: 792 }, { val: 805 }, { val: 818 }, { val: 824 }, { val: 835 }, { val: 852 }
    ],
    "Blocked Customers": [
        { val: 14 }, { val: 15 }, { val: 13 }, { val: 15 }, { val: 12 }, { val: 10 }, { val: 8 }
    ]
};

const SEGMENTATION_TABS = [
    { id: "All", label: "All" },
    { id: "Active", label: "Active" },
    { id: "Inactive", label: "Inactive" },
    { id: "Blocked", label: "Blocked" },
    { id: "VIP", label: "VIP" },
    { id: "New Customers", label: "New Customers" },
    { id: "Frequent Buyers", label: "Frequent Buyers" }
];

const DATE_FILTER_OPTIONS = [
    { value: "All", label: "All Time" },
    { value: "30D", label: "Last 30 Days" },
    { value: "6M", label: "Last 6 Months" }
];

const TYPE_FILTER_OPTIONS = [
    { value: "All", label: "All Types" },
    { value: "Consumer", label: "Consumer" },
    { value: "Business", label: "Business" },
    { value: "Wholesale", label: "Wholesale" }
];

// Helper: status CSS class
function statusClass(status) {
    if (status === "Active") return "badge-active";
    if (status === "Blocked") return "badge-blocked";
    return "badge-inactive";
}

// Helper: initials from name
function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CustomersPage() {
    const [customersList, setCustomersList] = useState(INITIAL_CUSTOMERS);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [activeTab, setActiveTab] = useState("All");

    // Search and Dropdown Filter States
    const [search, setSearch] = useState("");
    const [selectedCity, setSelectedCity] = useState("All");
    const [selectedDateRange, setSelectedDateRange] = useState("All");
    const [selectedCustomerType, setSelectedCustomerType] = useState("All");

    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState(null);
    const [drawerNotes, setDrawerNotes] = useState("");
    const [drawerStatus, setDrawerStatus] = useState("");

    // Dynamic cities extraction from customer list
    const citiesList = useMemo(() => {
        const uniqueCities = Array.from(new Set(customersList.map(c => c.city)));
        return ["All", ...uniqueCities];
    }, [customersList]);

    // Handle single row checkbox toggle
    const handleSelectRow = (id, e) => {
        e.stopPropagation(); // Avoid triggering row click to open drawer
        setSelectedCustomers(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Handle select all checkbox toggle
    const handleSelectAllRows = (displayedOnPage) => {
        const allIdsOnPage = displayedOnPage.map(c => c.id);
        const isAllSelected = allIdsOnPage.every(id => selectedCustomers.includes(id));
        
        if (isAllSelected) {
            setSelectedCustomers(prev => prev.filter(id => !allIdsOnPage.includes(id)));
        } else {
            setSelectedCustomers(prev => {
                const combined = [...prev, ...allIdsOnPage];
                return Array.from(new Set(combined));
            });
        }
    };

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };

    const handleRemoveCustomer = (id, e) => {
        if (e) e.stopPropagation();
        setCustomersList((prev) => prev.filter((c) => c.id !== id));
        setSelectedCustomers((prev) => prev.filter((item) => item !== id));
        if (selectedCustomerForDrawer?.id === id) {
            setSelectedCustomerForDrawer(null);
        }
        setActiveDropdownId(null);
    };

    const handleChangeStatus = (id, newStatus, e) => {
        if (e) e.stopPropagation();
        setCustomersList((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        if (selectedCustomerForDrawer?.id === id) {
            setSelectedCustomerForDrawer(prev => ({ ...prev, status: newStatus }));
            setDrawerStatus(newStatus);
        }
        setActiveDropdownId(null);
    };

    // Open sliding profile drawer
    const handleOpenDrawer = (customer) => {
        setSelectedCustomerForDrawer(customer);
        setDrawerNotes(customer.notes || "");
        setDrawerStatus(customer.status);
    };

    // Save notes updated in the drawer
    const handleSaveNotes = () => {
        if (!selectedCustomerForDrawer) return;
        setCustomersList(prev => 
            prev.map(c => c.id === selectedCustomerForDrawer.id ? { ...c, notes: drawerNotes } : c)
        );
        setSelectedCustomerForDrawer(prev => ({ ...prev, notes: drawerNotes }));
        alert("Notes saved successfully!");
    };

    // Filtered customers based on Search, Segment Tabs, City, Date Range, and Type
    const displayedCustomers = useMemo(() => {
        return customersList.filter((c) => {
            // Segment Tabs Filter
            let passTab = true;
            if (activeTab === "Active") passTab = c.status === "Active";
            else if (activeTab === "Inactive") passTab = c.status === "Inactive";
            else if (activeTab === "Blocked") passTab = c.status === "Blocked";
            else if (activeTab === "VIP") passTab = c.loyaltyBadge === "VIP";
            else if (activeTab === "New Customers") passTab = c.loyaltyBadge === "New";
            else if (activeTab === "Frequent Buyers") passTab = c.totalOrders >= 25 || c.loyaltyBadge === "Frequent";

            // Search Filter
            const matchesSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.email.toLowerCase().includes(search.toLowerCase()) ||
                c.location.toLowerCase().includes(search.toLowerCase()) ||
                c.id.toLowerCase().includes(search.toLowerCase());

            // City Filter
            const matchesCity = selectedCity === "All" || c.city === selectedCity;

            // Joined Date Filter
            let matchesDate = true;
            if (selectedDateRange === "30D") {
                matchesDate = c.joined.includes("2026") || c.joined.includes("May") || c.joined.includes("Jun");
            } else if (selectedDateRange === "6M") {
                matchesDate = c.joined.includes("2026") || c.joined.includes("2025");
            }

            // Customer Type Filter
            const matchesType = selectedCustomerType === "All" || c.customerType === selectedCustomerType;

            return passTab && matchesSearch && matchesCity && matchesDate && matchesType;
        });
    }, [customersList, activeTab, search, selectedCity, selectedDateRange, selectedCustomerType]);

    // Bulk actions
    const handleBulkExport = () => {
        alert(`Exporting details of ${selectedCustomers.length} selected customers as CSV...`);
        setSelectedCustomers([]);
    };

    const handleBulkSendPromo = () => {
        const code = `HAATZA50`;
        alert(`Promo code "${code}" sent successfully to ${selectedCustomers.length} customers!`);
        setSelectedCustomers([]);
    };

    const handleBulkBlock = () => {
        setCustomersList(prev => 
            prev.map(c => selectedCustomers.includes(c.id) ? { ...c, status: "Blocked" } : c)
        );
        alert(`Successfully blocked ${selectedCustomers.length} customers.`);
        setSelectedCustomers([]);
    };

    const handleBulkAddNote = () => {
        const noteText = prompt("Enter generic note to append to selected customers:");
        if (noteText) {
            setCustomersList(prev => 
                prev.map(c => selectedCustomers.includes(c.id) ? { ...c, notes: c.notes ? `${c.notes}\n${noteText}` : noteText } : c)
            );
            alert(`Appended notes to ${selectedCustomers.length} customers.`);
        }
        setSelectedCustomers([]);
    };

    const handleExportAll = () => {
        alert(`Exporting full customer database (${customersList.length} records) as CSV...`);
    };

    // Intelligently sync card clicks to segmentation tabs
    const handleCardClick = (tabId) => {
        setActiveTab(tabId);
    };

    // VIP insights & VIP percentage stats
    const vipCount = customersList.filter(c => c.loyaltyBadge === "VIP").length;
    const activeCount = customersList.filter(c => c.status === "Active").length;
    const inactiveCount = customersList.filter(c => c.status === "Inactive").length;
    const blockedCount = customersList.filter(c => c.status === "Blocked").length;

    return (
        <div className="customers-view fade-in">
            {/* ── Page Header ── */}
            <div className="customers-header">
                <div className="customers-header-title">
                    <h1>Customers Management</h1>
                    <p className="welcome-sub">Monitor and engage customer loyalty metrics across regional darkhouses</p>
                </div>
                <button className="cust-export-btn" onClick={handleExportAll}>
                    <Download size={15} strokeWidth={2.2} />
                    <span>Export All</span>
                </button>
            </div>

            {/* ── UPGRADED 5 SUMMARY KPI CARDS WITH SPARKLINES ── */}
            <div className="cust-stats-grid">
                {/* 1. Total Customers */}
                <div 
                    className={`cust-stat-card border-blue ${activeTab === "All" ? "card-active" : ""}`}
                    onClick={() => handleCardClick("All")}
                >
                    <div className="cust-card-left">
                        <div className="cust-stat-icon-wrap bg-blue">
                            <Users size={18} />
                        </div>
                        <div className="cust-stat-text-block">
                            <span className="cust-stat-value">{customersList.length}</span>
                            <span className="cust-stat-label">Total Customers</span>
                        </div>
                        <div className="cust-card-trend-row">
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +12.5%
                            </span>
                            <span className="vs-label">vs last 30 days</span>
                        </div>
                    </div>
                    <div className="cust-card-sparkline">
                        <ResponsiveContainer width="100%" height={32}>
                            <AreaChart data={sparklineData["Total Customers"]}>
                                <Area type="monotone" dataKey="val" stroke="#2563EB" strokeWidth={1.8} fillOpacity={0.1} fill="#2563EB" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. New This Month */}
                <div 
                    className={`cust-stat-card border-teal ${activeTab === "New Customers" ? "card-active" : ""}`}
                    onClick={() => handleCardClick("New Customers")}
                >
                    <div className="cust-card-left">
                        <div className="cust-stat-icon-wrap bg-teal">
                            <UserPlus size={18} />
                        </div>
                        <div className="cust-stat-text-block">
                            <span className="cust-stat-value">94</span>
                            <span className="cust-stat-label">New This Month</span>
                        </div>
                        <div className="cust-card-trend-row">
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +15.2%
                            </span>
                            <span className="vs-label">vs last 30 days</span>
                        </div>
                    </div>
                    <div className="cust-card-sparkline">
                        <ResponsiveContainer width="100%" height={32}>
                            <AreaChart data={sparklineData["New This Month"]}>
                                <Area type="monotone" dataKey="val" stroke="#0D9488" strokeWidth={1.8} fillOpacity={0.1} fill="#0D9488" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Active */}
                <div 
                    className={`cust-stat-card border-green ${activeTab === "Active" ? "card-active" : ""}`}
                    onClick={() => handleCardClick("Active")}
                >
                    <div className="cust-card-left">
                        <div className="cust-stat-icon-wrap bg-green">
                            <UserCheck size={18} />
                        </div>
                        <div className="cust-stat-text-block">
                            <span className="cust-stat-value">{activeCount}</span>
                            <span className="cust-stat-label">Active</span>
                        </div>
                        <div className="cust-card-trend-row">
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +8.4%
                            </span>
                            <span className="vs-label">vs last 30 days</span>
                        </div>
                    </div>
                    <div className="cust-card-sparkline">
                        <ResponsiveContainer width="100%" height={32}>
                            <AreaChart data={sparklineData["Active"]}>
                                <Area type="monotone" dataKey="val" stroke="#16A34A" strokeWidth={1.8} fillOpacity={0.1} fill="#16A34A" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Repeat Customers */}
                <div 
                    className={`cust-stat-card border-purple ${activeTab === "Frequent Buyers" ? "card-active" : ""}`}
                    onClick={() => handleCardClick("Frequent Buyers")}
                >
                    <div className="cust-card-left">
                        <div className="cust-stat-icon-wrap bg-purple">
                            <Clock size={18} />
                        </div>
                        <div className="cust-stat-text-block">
                            <span className="cust-stat-value">5</span>
                            <span className="cust-stat-label">Repeat Buyers</span>
                        </div>
                        <div className="cust-card-trend-row">
                            <span className="trend-badge trend-up">
                                <TrendingUp size={11} /> +18.7%
                            </span>
                            <span className="vs-label">vs last 30 days</span>
                        </div>
                    </div>
                    <div className="cust-card-sparkline">
                        <ResponsiveContainer width="100%" height={32}>
                            <AreaChart data={sparklineData["Repeat Customers"]}>
                                <Area type="monotone" dataKey="val" stroke="#7C3AED" strokeWidth={1.8} fillOpacity={0.1} fill="#7C3AED" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Blocked Customers */}
                <div 
                    className={`cust-stat-card border-red ${activeTab === "Blocked" ? "card-active" : ""}`}
                    onClick={() => handleCardClick("Blocked")}
                >
                    <div className="cust-card-left">
                        <div className="cust-stat-icon-wrap bg-red">
                            <Ban size={18} />
                        </div>
                        <div className="cust-stat-text-block">
                            <span className="cust-stat-value">{blockedCount}</span>
                            <span className="cust-stat-label">Blocked Accounts</span>
                        </div>
                        <div className="cust-card-trend-row">
                            <span className="trend-badge trend-down">
                                <TrendingDown size={11} /> -5.2%
                            </span>
                            <span className="vs-label">vs last 30 days</span>
                        </div>
                    </div>
                    <div className="cust-card-sparkline">
                        <ResponsiveContainer width="100%" height={32}>
                            <AreaChart data={sparklineData["Blocked Customers"]}>
                                <Area type="monotone" dataKey="val" stroke="#DC2626" strokeWidth={1.8} fillOpacity={0.1} fill="#DC2626" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── SEGMENTATION TABS BAR ── */}
            <div className="cust-segmentation-tabs-bar">
                {SEGMENTATION_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`cust-segment-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div className="cust-table-card">
                {/* Advanced Search & Filtering Bar */}
                <div className="cust-controls-row">
                    <div className="cust-search-wrap">
                        <Search size={15} className="cust-search-icon" />
                        <input
                            type="text"
                            className="cust-search-input"
                            placeholder="Search customer ID, name, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search customers"
                        />
                    </div>

                    <div className="cust-controls-right">
                        {/* City Filter */}
                        <div className="filter-select-wrapper">
                            <Building2 size={13} className="filter-select-icon" />
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="table-filter-select padding-left-icon"
                                aria-label="Filter by City"
                            >
                                <option value="All">All Cities</option>
                                {citiesList.filter(city => city !== "All").map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="select-dropdown-arrow" />
                        </div>

                        {/* Joined Date Filter */}
                        <div className="filter-select-wrapper">
                            <Calendar size={13} className="filter-select-icon" />
                            <select
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                                className="table-filter-select padding-left-icon"
                                aria-label="Filter by Joined Date"
                            >
                                {DATE_FILTER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="select-dropdown-arrow" />
                        </div>

                        {/* Customer Type Filter */}
                        <div className="filter-select-wrapper">
                            <Tag size={13} className="filter-select-icon" />
                            <select
                                value={selectedCustomerType}
                                onChange={(e) => setSelectedCustomerType(e.target.value)}
                                className="table-filter-select padding-left-icon"
                                aria-label="Filter by Customer Type"
                            >
                                {TYPE_FILTER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="select-dropdown-arrow" />
                        </div>

                        {/* Export Selected Button */}
                        <button 
                            className="cust-btn-outline" 
                            onClick={handleBulkExport}
                            disabled={selectedCustomers.length === 0}
                            title="Export Selected"
                        >
                            <Download size={13} />
                            <span>Export Selected</span>
                        </button>
                    </div>
                </div>

                {/* ── FLOATING BULK ACTIONS BAR ── */}
                {selectedCustomers.length > 0 && (
                    <div className="bulk-actions-floating-bar fade-in-up">
                        <div className="bulk-actions-content">
                            <div className="bulk-selected-count">
                                <span className="count-circle">{selectedCustomers.length}</span>
                                <span>Selected</span>
                            </div>
                            <div className="bulk-actions-divider"></div>
                            <div className="bulk-action-buttons-group">
                                <button className="bulk-action-btn" onClick={handleBulkExport}>
                                    <Download size={13} />
                                    <span>Export CSV</span>
                                </button>
                                <button className="bulk-action-btn" onClick={handleBulkSendPromo}>
                                    <Percent size={13} />
                                    <span>Send Promo</span>
                                </button>
                                <button className="bulk-action-btn block-btn" onClick={handleBulkBlock}>
                                    <Ban size={13} />
                                    <span>Block Accounts</span>
                                </button>
                                <button className="bulk-action-btn" onClick={handleBulkAddNote}>
                                    <FileText size={13} />
                                    <span>Add Note</span>
                                </button>
                            </div>
                            <button 
                                className="bulk-clear-btn"
                                onClick={() => setSelectedCustomers([])}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Customer Table with Checkbox selections & loyalty badges */}
                <div className="cust-table-responsive">
                    <table className="cust-table">
                        <thead>
                            <tr>
                                <th style={{ width: "40px" }} className="align-center-cell">
                                    <input 
                                        type="checkbox"
                                        className="cust-checkbox"
                                        checked={displayedCustomers.length > 0 && displayedCustomers.every(c => selectedCustomers.includes(c.id))}
                                        onChange={() => handleSelectAllRows(displayedCustomers)}
                                        aria-label="Select all customers on page"
                                    />
                                </th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th className="align-center-header">Orders</th>
                                <th>Total Spent</th>
                                <th>Last Order</th>
                                <th>Status</th>
                                <th className="align-center-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="cust-table-empty">
                                        No customer records match your filters.
                                    </td>
                                </tr>
                            ) : (
                                displayedCustomers.map((customer) => (
                                    <tr 
                                        key={customer.id} 
                                        className={`cust-table-row interactive-table-row ${selectedCustomers.includes(customer.id) ? "row-checked" : ""}`}
                                        onClick={() => handleOpenDrawer(customer)}
                                    >
                                        {/* Checkbox column */}
                                        <td className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                className="cust-checkbox"
                                                checked={selectedCustomers.includes(customer.id)}
                                                onChange={(e) => handleSelectRow(customer.id, e)}
                                                aria-label={`Select ${customer.name}`}
                                            />
                                        </td>

                                        {/* Customer avatar and ID details */}
                                        <td>
                                            <div className="cust-identity">
                                                <div className={`cust-avatar ${customer.avatarColor}`}>
                                                    {getInitials(customer.name)}
                                                </div>
                                                <div className="cust-name-block">
                                                    <div className="cust-name-row">
                                                        <span className="cust-name">{customer.name}</span>
                                                        <span className={`loyalty-tag tag-${customer.loyaltyBadge.toLowerCase()}`}>
                                                            {customer.loyaltyBadge}
                                                        </span>
                                                    </div>
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
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Mail size={13} className="cust-email-icon" />
                                                <span>{customer.email}</span>
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

                                        {/* Last Order Date */}
                                        <td className="cust-cell-muted">{customer.lastOrderDate || "N/A"}</td>

                                        {/* Status Badge */}
                                        <td>
                                            <span className={`cust-badge ${statusClass(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </td>

                                        {/* Row actions dots */}
                                        <td style={{ position: "relative" }} className="align-center-cell" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="cust-action-btn"
                                                aria-label={`More actions for ${customer.name}`}
                                                onClick={(e) => toggleDropdown(customer.id, e)}
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
                                                                handleOpenDrawer(customer);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Users size={13} />
                                                            <span>View Profile</span>
                                                        </button>
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={() => {
                                                                handleOpenDrawer(customer);
                                                                setActiveDropdownId(null);
                                                            }}
                                                        >
                                                            <Edit2 size={13} />
                                                            <span>Edit Profile</span>
                                                        </button>
                                                        <button 
                                                            className="dropdown-item"
                                                            onClick={(e) => handleChangeStatus(customer.id, customer.status === "Blocked" ? "Active" : "Blocked", e)}
                                                        >
                                                            <Ban size={13} />
                                                            <span>{customer.status === "Blocked" ? "Unblock" : "Block Customer"}</span>
                                                        </button>
                                                        <div className="dropdown-divider"></div>
                                                        <button 
                                                            className="dropdown-item dropdown-item-danger"
                                                            onClick={(e) => handleRemoveCustomer(customer.id, e)}
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete Profile</span>
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
            </div>

            {/* ── CUSTOMER PROFILE SLIDING DRAWER ── */}
            {selectedCustomerForDrawer && (
                <div className="cust-drawer-overlay-backdrop" onClick={() => setSelectedCustomerForDrawer(null)}>
                    <div className="cust-drawer-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header-row">
                            <div className="drawer-title-block">
                                <span className="drawer-subtitle">Customer Profile</span>
                                <div className="drawer-title-badge-group">
                                    <h2>{selectedCustomerForDrawer.name}</h2>
                                    <span className={`loyalty-tag tag-${selectedCustomerForDrawer.loyaltyBadge.toLowerCase()}`}>
                                        {selectedCustomerForDrawer.loyaltyBadge}
                                    </span>
                                </div>
                                <span className="drawer-cust-id">{selectedCustomerForDrawer.id}</span>
                            </div>
                            <button 
                                className="drawer-close-btn"
                                onClick={() => setSelectedCustomerForDrawer(null)}
                                aria-label="Close drawer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="drawer-scrollable-body">
                            {/* Visual Avatar details */}
                            <div className="drawer-visual-section">
                                <div className={`drawer-avatar-circle ${selectedCustomerForDrawer.avatarColor}`}>
                                    {getInitials(selectedCustomerForDrawer.name)}
                                </div>
                                <div className="drawer-visual-stats">
                                    <div className="visual-stat-item">
                                        <span className="v-stat-val">{selectedCustomerForDrawer.totalOrders}</span>
                                        <span className="v-stat-lbl">Orders</span>
                                    </div>
                                    <div className="visual-stat-item">
                                        <span className="v-stat-val">₹{selectedCustomerForDrawer.totalSpent.toLocaleString()}</span>
                                        <span className="v-stat-lbl">Spent</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Cards */}
                            <div className="drawer-info-group">
                                <h3>Contact Information</h3>
                                <div className="drawer-info-card">
                                    <div className="info-row">
                                        <Mail size={14} className="info-icon" />
                                        <span>{selectedCustomerForDrawer.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <Phone size={14} className="info-icon" />
                                        <span>{selectedCustomerForDrawer.phone}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPin size={14} className="info-icon" />
                                        <span className="info-address">{selectedCustomerForDrawer.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Operational Segment Details */}
                            <div className="drawer-info-group">
                                <h3>Operational Segments</h3>
                                <div className="drawer-segments-grid">
                                    <div className="segment-indicator">
                                        <span className="seg-lbl">Type:</span>
                                        <span className="seg-val">{selectedCustomerForDrawer.customerType}</span>
                                    </div>
                                    <div className="segment-indicator">
                                        <span className="seg-lbl">Status:</span>
                                        <div className="status-select-inline-wrapper">
                                            <select 
                                                value={drawerStatus}
                                                onChange={(e) => {
                                                    setDrawerStatus(e.target.value);
                                                    handleChangeStatus(selectedCustomerForDrawer.id, e.target.value);
                                                }}
                                                className="drawer-status-select-pill"
                                                aria-label="Change Status"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Blocked">Blocked</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="segment-indicator full-width-indicator">
                                        <span className="seg-lbl">Joined Date:</span>
                                        <span className="seg-val">{selectedCustomerForDrawer.joined}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Favorite Categories */}
                            <div className="drawer-info-group">
                                <h3>Favorite Categories</h3>
                                <div className="drawer-categories-wrap">
                                    {selectedCustomerForDrawer.favCategories.map((cat, idx) => (
                                        <span key={idx} className="category-pill-tag">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Editable Notes Section with save actions */}
                            <div className="drawer-info-group">
                                <div className="notes-header-inline">
                                    <h3>Customer Operational Notes</h3>
                                    <button 
                                        className="notes-save-action-btn"
                                        onClick={handleSaveNotes}
                                    >
                                        Save
                                    </button>
                                </div>
                                <textarea
                                    className="drawer-notes-textarea"
                                    value={drawerNotes}
                                    onChange={(e) => setDrawerNotes(e.target.value)}
                                    placeholder="Add specific delivery operational notes or CRM engagement details..."
                                />
                            </div>
                        </div>

                        {/* Drawer Bottom Controls Panel */}
                        <div className="drawer-footer-actions">
                            <button 
                                className="drawer-footer-btn outline-btn"
                                onClick={() => alert(`Editing profile of ${selectedCustomerForDrawer.name}...`)}
                            >
                                <Edit2 size={13} />
                                <span>Edit Profile</span>
                            </button>
                            <button 
                                className={`drawer-footer-btn ${drawerStatus === "Blocked" ? "unblock-btn" : "block-btn"}`}
                                onClick={() => {
                                    const next = drawerStatus === "Blocked" ? "Active" : "Blocked";
                                    handleChangeStatus(selectedCustomerForDrawer.id, next);
                                }}
                            >
                                <Ban size={13} />
                                <span>{drawerStatus === "Blocked" ? "Unblock Account" : "Block Customer"}</span>
                            </button>
                            <button 
                                className="drawer-footer-btn outline-btn"
                                onClick={() => alert(`Exporting executive customer profile details...`)}
                            >
                                <Download size={13} />
                                <span>Export Profile</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CUSTOMER INSIGHTS SECTION ── */}
            <div className="customers-insights-container">
                <div className="insights-header">
                    <Award size={16} className="insights-icon" />
                    <h2>Customer Loyalty & Behavioral Insights</h2>
                </div>

                <div className="insights-grid">
                    {/* Card 1: VIP Customers */}
                    <div className="insight-card border-left-purple">
                        <div className="insight-card-header">
                            <span className="insight-card-badge badge-purple">VIP Segmentation</span>
                            <Award size={15} className="insight-card-icon text-purple" />
                        </div>
                        <div className="insight-card-body">
                            <div className="insight-stat-wrap">
                                <span className="insight-stat-val">{vipCount} Members</span>
                                <span className="insight-stat-sub">High spender cluster</span>
                            </div>
                            <p className="insight-desc">
                                VIP consumers contribute to **48% of total revenue**. Highest spending member: **Marcus Johnson** (₹9,134.75spent).
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Repeat Purchase Trend */}
                    <div className="insight-card border-left-green">
                        <div className="insight-card-header">
                            <span className="insight-card-badge badge-green">Repeat Buyer Slope</span>
                            <TrendingUp size={15} className="insight-card-icon text-green" />
                        </div>
                        <div className="insight-card-body">
                            <div className="insight-stat-wrap">
                                <span className="insight-stat-val">78.4% Repeat Rate</span>
                                <span className="insight-stat-sub">+2.4% vs last month</span>
                            </div>
                            <p className="insight-desc">
                                Customer purchase loops are stabilizing, driven by **Fruits & Vegetables** and **Dairy & Bread** micro-retentions.
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Inactive Customers */}
                    <div className="insight-card border-left-yellow">
                        <div className="insight-card-header">
                            <span className="insight-card-badge badge-yellow">Re-engagement Triggers</span>
                            <Clock size={15} className="insight-card-icon text-yellow" />
                        </div>
                        <div className="insight-card-body">
                            <div className="insight-stat-wrap">
                                <span className="insight-stat-val">{inactiveCount} Inactive Accounts</span>
                                <span className="insight-stat-sub">Ready for triggers</span>
                            </div>
                            <p className="insight-desc">
                                Inactive buyers like **David Park** have not placed orders in over **90 days**. Action: Trigger discount code.
                            </p>
                            <button 
                                className="insight-card-action-btn"
                                onClick={() => alert("Re-engagement promo campaign successfully targeted at inactive segments!")}
                            >
                                <span>Trigger re-engagement campaign</span>
                                <ArrowUpRight size={12} />
                            </button>
                        </div>
                    </div>

                    {/* Card 4: Highest Spending City */}
                    <div className="insight-card border-left-blue">
                        <div className="insight-card-header">
                            <span className="insight-card-badge badge-blue">Geographical Focus</span>
                            <Building2 size={15} className="insight-card-icon text-blue" />
                        </div>
                        <div className="insight-card-body">
                            <div className="insight-stat-wrap">
                                <span className="insight-stat-val">Bangalore, IN</span>
                                <span className="insight-stat-sub">Highest spent cluster</span>
                            </div>
                            <p className="insight-desc">
                                Bangalore leads regional fulfillment spending with a total expenditure of **₹12,714.50** across active corporate hubs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomersPage;
