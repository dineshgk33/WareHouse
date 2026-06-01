import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Package,
    Trash2,
    PackageSearch,
    PackageCheck,
    Truck,
    ShoppingBag,
    Eye,
    Edit2,
    CheckCircle,
    User,
    Printer,
    Navigation,
    PhoneCall,
    MapPin,
    AlertCircle
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PICKING, MOCK_PACKING, MOCK_DELIVERY } from "../../data/ordersData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import "./Orders.css";

const ROWS_PER_PAGE = 7;

function OrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "orders";

    // ─── States ───────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [picks, setPicks] = useState(MOCK_PICKING);
    const [packs, setPacks] = useState(MOCK_PACKING);
    const [deliveries, setDeliveries] = useState(MOCK_DELIVERY);

    // Dynamic Active Dropdowns (per row)
    const [activeRowMenuId, setActiveRowMenuId] = useState(null);

    // Filters All Orders
    const [ordSearch, setOrdSearch] = useState("");
    const [ordStatus, setOrdStatus] = useState("All");
    const [ordPage, setOrdPage] = useState(1);

    // Filters Picking
    const [pickSearch, setPickSearch] = useState("");
    const [pickPicker, setPickPicker] = useState("All");
    const [pickPage, setPickPage] = useState(1);

    // Filters Packing
    const [packSearch, setPackSearch] = useState("");
    const [packStatus, setPackStatus] = useState("All");
    const [packPage, setPackPage] = useState(1);

    // Filters Delivery Tracking
    const [dlvSearch, setDlvSearch] = useState("");
    const [dlvRider, setDlvRider] = useState("All");
    const [dlvStatus, setDlvStatus] = useState("All");
    const [dlvPage, setDlvPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'ord-view' | 'ord-edit' | 'pick-assign' | 'dlv-track' | 'dlv-update'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form fields
    const [formCustomer, setFormCustomer] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formPayment, setFormPayment] = useState("");
    const [formStatus, setFormStatus] = useState("");
    const [formPicker, setFormPicker] = useState("Ramesh Kumar");
    
    // Delivery update fields
    const [formRider, setFormRider] = useState("");
    const [formDlvStatus, setFormDlvStatus] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formEta, setFormEta] = useState("");

    // Custom alerts / toast simulations
    const [toastMessage, setToastMessage] = useState("");

    // Auto-dismiss toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Reset pagination when tab changes
    useEffect(() => {
        setOrdPage(1);
        setPickPage(1);
        setPackPage(1);
        setDlvPage(1);
        setActiveRowMenuId(null);
    }, [activeTab]);

    const showToast = (msg) => {
        setToastMessage(msg);
    };

    // Derived filtering pools
    const pickers = useMemo(() => ["All", ...new Set(picks.map(p => p.picker).filter(p => p !== "Unassigned"))], [picks]);
    const riders = useMemo(() => ["All", ...new Set(deliveries.map(d => d.rider).filter(r => r !== "Unassigned"))], [deliveries]);

    // ─── 1. Filtering All Orders ──────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = o.id.toLowerCase().includes(ordSearch.toLowerCase()) || o.customer.toLowerCase().includes(ordSearch.toLowerCase());
            const matchesStatus = ordStatus === "All" || o.status === ordStatus;
            return matchesSearch && matchesStatus;
        });
    }, [orders, ordSearch, ordStatus]);

    const paginatedOrders = useMemo(() => {
        const start = (ordPage - 1) * ROWS_PER_PAGE;
        return filteredOrders.slice(start, start + ROWS_PER_PAGE);
    }, [filteredOrders, ordPage]);

    const ordStats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === "Pending").length;
        const shipped = orders.filter(o => o.status === "Shipped").length;
        const delivered = orders.filter(o => o.status === "Delivered").length;
        return { total, pending, shipped, delivered };
    }, [orders]);

    // ─── 2. Filtering Picking ─────────────────────────────────────────────────
    const filteredPicks = useMemo(() => {
        return picks.filter(p => {
            const matchesSearch = p.id.toLowerCase().includes(pickSearch.toLowerCase()) || p.orderId.toLowerCase().includes(pickSearch.toLowerCase()) || p.customer.toLowerCase().includes(pickSearch.toLowerCase());
            const matchesPicker = pickPicker === "All" || p.picker === pickPicker;
            return matchesSearch && matchesPicker;
        });
    }, [picks, pickSearch, pickPicker]);

    const paginatedPicks = useMemo(() => {
        const start = (pickPage - 1) * ROWS_PER_PAGE;
        return filteredPicks.slice(start, start + ROWS_PER_PAGE);
    }, [filteredPicks, pickPage]);

    const pickStats = useMemo(() => {
        const pending = picks.filter(p => p.status === "Pending").length;
        const assigned = picks.filter(p => p.status === "Assigned").length;
        const completed = picks.filter(p => p.status === "Completed").length;
        return { pending, assigned, completed };
    }, [picks]);

    // ─── 3. Filtering Packing ─────────────────────────────────────────────────
    const filteredPacks = useMemo(() => {
        return packs.filter(p => {
            const matchesSearch = p.id.toLowerCase().includes(packSearch.toLowerCase()) || p.orderId.toLowerCase().includes(packSearch.toLowerCase()) || p.customer.toLowerCase().includes(packSearch.toLowerCase());
            const matchesStatus = packStatus === "All" || p.status === packStatus;
            return matchesSearch && matchesStatus;
        });
    }, [packs, packSearch, packStatus]);

    const paginatedPacks = useMemo(() => {
        const start = (packPage - 1) * ROWS_PER_PAGE;
        return filteredPacks.slice(start, start + ROWS_PER_PAGE);
    }, [filteredPacks, packPage]);

    const packStats = useMemo(() => {
        const waiting = packs.filter(p => p.status === "Waiting").length;
        const packing = packs.filter(p => p.status === "Packing").length;
        const packed = packs.filter(p => p.status === "Packed").length;
        return { waiting, packing, packed };
    }, [packs]);

    // ─── 4. Filtering Delivery Tracking ───────────────────────────────────────
    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(d => {
            const matchesSearch = d.id.toLowerCase().includes(dlvSearch.toLowerCase()) || d.orderId.toLowerCase().includes(dlvSearch.toLowerCase()) || d.customer.toLowerCase().includes(dlvSearch.toLowerCase());
            const matchesRider = dlvRider === "All" || d.rider === dlvRider;
            const matchesStatus = dlvStatus === "All" || d.status === dlvStatus;
            return matchesSearch && matchesRider && matchesStatus;
        });
    }, [deliveries, dlvSearch, dlvRider, dlvStatus]);

    const paginatedDeliveries = useMemo(() => {
        const start = (dlvPage - 1) * ROWS_PER_PAGE;
        return filteredDeliveries.slice(start, start + ROWS_PER_PAGE);
    }, [filteredDeliveries, dlvPage]);

    const dlvStats = useMemo(() => {
        const assigned = deliveries.filter(d => d.status === "Assigned").length;
        const outForDelivery = deliveries.filter(d => d.status === "Out for Delivery").length;
        const delivered = deliveries.filter(d => d.status === "Delivered").length;
        const failed = deliveries.filter(d => d.status === "Failed").length;
        return { assigned, outForDelivery, delivered, failed };
    }, [deliveries]);

    // ─── Modals Handlers ──────────────────────────────────────────────────────
    const openOrdView = (order) => {
        setSelectedItem(order);
        setModalType("ord-view");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openOrdEdit = (order) => {
        setSelectedItem(order);
        setFormCustomer(order.customer);
        setFormAmount(order.amount);
        setFormPayment(order.payment);
        setFormStatus(order.status);
        setModalType("ord-edit");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openPickAssign = (pick) => {
        setSelectedItem(pick);
        setFormPicker(pick.picker === "Unassigned" ? "Ramesh Kumar" : pick.picker);
        setModalType("pick-assign");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openDlvTrack = (dlv) => {
        setSelectedItem(dlv);
        setModalType("dlv-track");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openDlvUpdate = (dlv) => {
        setSelectedItem(dlv);
        setFormRider(dlv.rider);
        setFormDlvStatus(dlv.status);
        setFormLocation(dlv.location);
        setFormEta(dlv.eta);
        setModalType("dlv-update");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    // ─── Operations Form Submissions ──────────────────────────────────────────
    const handleOrdEditSubmit = (e) => {
        e.preventDefault();
        setOrders(prev => prev.map(o => {
            if (o.id === selectedItem.id) {
                return {
                    ...o,
                    customer: formCustomer,
                    amount: formAmount,
                    payment: formPayment,
                    status: formStatus
                };
            }
            return o;
        }));
        setIsModalOpen(false);
        showToast(`Successfully edited details of ${selectedItem.id}`);
    };

    const handlePickAssignSubmit = (e) => {
        e.preventDefault();
        setPicks(prev => prev.map(p => {
            if (p.id === selectedItem.id) {
                return {
                    ...p,
                    picker: formPicker,
                    status: "Assigned"
                };
            }
            return p;
        }));
        setIsModalOpen(false);
        showToast(`Assigned Picker ${formPicker} to ticket ${selectedItem.id}`);
    };

    const handleDlvUpdateSubmit = (e) => {
        e.preventDefault();
        setDeliveries(prev => prev.map(d => {
            if (d.id === selectedItem.id) {
                return {
                    ...d,
                    rider: formRider,
                    status: formDlvStatus,
                    location: formLocation,
                    eta: formEta
                };
            }
            return d;
        }));
        setIsModalOpen(false);
        showToast(`Updated delivery transit details for ${selectedItem.id}`);
    };

    // ─── Inline Operations ────────────────────────────────────────────────────
    const handleCancelOrder = (id) => {
        if (window.confirm(`Are you sure you want to cancel order ${id}?`)) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Cancelled" } : o));
            setActiveRowMenuId(null);
            showToast(`Cancelled order ${id}`);
        }
    };

    const handleCompletePick = (id) => {
        setPicks(prev => prev.map(p => p.id === id ? { ...p, status: "Completed" } : p));
        showToast(`Marked picking ticket ${id} as completed`);
    };

    const handleStartPacking = (id) => {
        setPacks(prev => prev.map(p => p.id === id ? { ...p, status: "Packing", packedBy: "Ananya Iyer" } : p));
        showToast(`Started packing order matching sheet ${id}`);
    };

    const handlePrintLabel = (id) => {
        showToast(`Generating barcode tag & printing shipping label for ${id}...`);
        if (window.print) {
            // Simulated delay indicator
        }
    };

    const handleCompletePack = (id) => {
        setPacks(prev => prev.map(p => p.id === id ? { ...p, status: "Packed" } : p));
        showToast(`Packed & sealed package box for ${id}`);
    };

    const handleCallRider = (rider) => {
        showToast(`Dialing rider ${rider} at +91 99880 12345...`);
    };

    // Utility classes for statuses
    const getStatusClass = (status) => {
        switch (status) {
            case "Delivered":
            case "Completed":
            case "Packed":
                return "orders-pill orders-pill--success";
            case "Shipped":
            case "Processing":
            case "Assigned":
            case "Packing":
            case "Out for Delivery":
                return "orders-pill orders-pill--warning";
            case "Pending":
            case "Waiting":
                return "orders-pill orders-pill--info";
            case "Cancelled":
            case "Failed":
                return "orders-pill orders-pill--danger";
            default:
                return "orders-pill";
        }
    };

    const toggleRowMenu = (id, e) => {
        e.stopPropagation();
        setActiveRowMenuId(prev => prev === id ? null : id);
    };

    const handleTabClick = (tabKey) => {
        setSearchParams({ tab: tabKey });
    };

    return (
        <div className="orders-root fade-in">
            {/* Custom Toast Indicator */}
            {toastMessage && (
                <div className="orders-toast slide-in-top">
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="orders-header-block">
                <div className="orders-header-left">
                    <h1 className="orders-header-title">
                        {activeTab === "orders" && "All Orders"}
                        {activeTab === "picking" && "Order Picking Control"}
                        {activeTab === "packing" && "Order Packing & Labeling"}
                        {activeTab === "tracking" && "Real-Time Delivery Tracking"}
                    </h1>
                    <p className="orders-header-subtitle">
                        {activeTab === "orders" && "Track customer invoices, payment statuses, and overall execution lifecycle."}
                        {activeTab === "picking" && "Dispatch inventory pickers to gather mapped items across darkhouse bins."}
                        {activeTab === "packing" && "Box, seal, and generate custom package barcode tags for active riders."}
                        {activeTab === "tracking" && "Monitor dispatch riders, ETAs, active locations, and package handovers."}
                    </p>
                </div>
            </div>

            {/* Summary Stat Grid */}
            <div className="orders-stats-grid">
                {activeTab === "orders" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.total}</span>
                                <span className="stat-card-label">Total Invoices</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.pending}</span>
                                <span className="stat-card-label">Pending</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-shipped" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.shipped}</span>
                                <span className="stat-card-label">Shipped</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.delivered}</span>
                                <span className="stat-card-label">Delivered</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "picking" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{pickStats.pending}</span>
                                <span className="stat-card-label">Pending Picks</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-shipped" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{pickStats.assigned}</span>
                                <span className="stat-card-label">Assigned</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{pickStats.completed}</span>
                                <span className="stat-card-label">Completed Picks</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "packing" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{packStats.waiting}</span>
                                <span className="stat-card-label">Waiting Box</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-shipped" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{packStats.packing}</span>
                                <span className="stat-card-label">Packing Box</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{packStats.packed}</span>
                                <span className="stat-card-label">Packed & Sealed</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "tracking" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{dlvStats.assigned}</span>
                                <span className="stat-card-label">Assigned Riders</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{dlvStats.outForDelivery}</span>
                                <span className="stat-card-label">In Transit</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{dlvStats.delivered}</span>
                                <span className="stat-card-label">Delivered</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-failed" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{dlvStats.failed}</span>
                                <span className="stat-card-label">Failed</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Table Container */}
            <div className="orders-table-card">
                {/* Navigation Tabs Toolbar */}
                <div className="orders-toolbar">
                    <div className="orders-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "orders"}
                            className={`orders-tab ${activeTab === "orders" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("orders")}
                        >
                            All Orders
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "picking"}
                            className={`orders-tab ${activeTab === "picking" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("picking")}
                        >
                            Picking
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "packing"}
                            className={`orders-tab ${activeTab === "packing" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("packing")}
                        >
                            Packing
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "tracking"}
                            className={`orders-tab ${activeTab === "tracking" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("tracking")}
                        >
                            Delivery Tracking
                        </button>
                    </div>

                    {/* Toolbar Search / Select Filters */}
                    <div className="orders-toolbar__actions">
                        {activeTab === "orders" && (
                            <>
                                <div className="orders-search-wrap">
                                    <Search size={14} className="orders-search-icon" />
                                    <input
                                        type="text"
                                        className="orders-search-input"
                                        placeholder="Search order ID or customer..."
                                        value={ordSearch}
                                        onChange={(e) => { setOrdSearch(e.target.value); setOrdPage(1); }}
                                    />
                                </div>
                                <select
                                    className="orders-toolbar-select"
                                    value={ordStatus}
                                    onChange={(e) => { setOrdStatus(e.target.value); setOrdPage(1); }}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </>
                        )}

                        {activeTab === "picking" && (
                            <>
                                <div className="orders-search-wrap">
                                    <Search size={14} className="orders-search-icon" />
                                    <input
                                        type="text"
                                        className="orders-search-input"
                                        placeholder="Search picker or order..."
                                        value={pickSearch}
                                        onChange={(e) => { setPickSearch(e.target.value); setPickPage(1); }}
                                    />
                                </div>
                                <select
                                    className="orders-toolbar-select"
                                    value={pickPicker}
                                    onChange={(e) => { setPickPicker(e.target.value); setPickPage(1); }}
                                >
                                    <option value="All">All Pickers</option>
                                    <option value="Unassigned">Unassigned Only</option>
                                    {pickers.filter(p => p !== "All").map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {activeTab === "packing" && (
                            <>
                                <div className="orders-search-wrap">
                                    <Search size={14} className="orders-search-icon" />
                                    <input
                                        type="text"
                                        className="orders-search-input"
                                        placeholder="Search packing list ID..."
                                        value={packSearch}
                                        onChange={(e) => { setPackSearch(e.target.value); setPackPage(1); }}
                                    />
                                </div>
                                <select
                                    className="orders-toolbar-select"
                                    value={packStatus}
                                    onChange={(e) => { setPackStatus(e.target.value); setPackPage(1); }}
                                >
                                    <option value="All">All States</option>
                                    <option value="Waiting">Waiting</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Packed">Packed</option>
                                </select>
                            </>
                        )}

                        {activeTab === "tracking" && (
                            <>
                                <div className="orders-search-wrap">
                                    <Search size={14} className="orders-search-icon" />
                                    <input
                                        type="text"
                                        className="orders-search-input"
                                        placeholder="Search rider or destination..."
                                        value={dlvSearch}
                                        onChange={(e) => { setDlvSearch(e.target.value); setDlvPage(1); }}
                                    />
                                </div>
                                <select
                                    className="orders-toolbar-select"
                                    value={dlvRider}
                                    onChange={(e) => { setDlvRider(e.target.value); setDlvPage(1); }}
                                >
                                    <option value="All">All Riders</option>
                                    {riders.filter(r => r !== "All").map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <select
                                    className="orders-toolbar-select"
                                    value={dlvStatus}
                                    onChange={(e) => { setDlvStatus(e.target.value); setDlvPage(1); }}
                                >
                                    <option value="All">All States</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Out for Delivery">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {/* Table Data Grid */}
                <div className="orders-table-responsive">
                    <table className="orders-data-table">
                        {activeTab === "orders" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Amount</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="odt-empty">
                                                No customer orders found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map(order => (
                                            <tr key={order.id} className="orders-row-hover">
                                                <td className="odt-id">{order.id}</td>
                                                <td>
                                                    <div className="odt-customer">
                                                        <span className={`odt-avatar ${order.color || "avatar-indigo"}`}>
                                                            {order.initials}
                                                        </span>
                                                        <span className="odt-customer-name">{order.customer}</span>
                                                    </div>
                                                </td>
                                                <td className="odt-date">{order.date}</td>
                                                <td className="odt-items">{order.items} items</td>
                                                <td className="odt-amount">{order.amount}</td>
                                                <td className="odt-payment">{order.payment}</td>
                                                <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                                                <td style={{ position: "relative" }}>
                                                    <button className="odt-action-btn" onClick={(e) => toggleRowMenu(order.id, e)}>
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {activeRowMenuId === order.id && (
                                                        <>
                                                            <div className="global-dropdown-overlay" onClick={() => setActiveRowMenuId(null)} />
                                                            <div className="global-action-dropdown">
                                                                <button className="global-dropdown-item" onClick={() => openOrdView(order)}>
                                                                    <Eye size={13} />
                                                                    <span>View Details</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => openOrdEdit(order)}>
                                                                    <Edit2 size={13} />
                                                                    <span>Edit Order</span>
                                                                </button>
                                                                <div className="global-dropdown-divider"></div>
                                                                <button className="global-dropdown-item global-dropdown-item-danger" onClick={() => handleCancelOrder(order.id)}>
                                                                    <Trash2 size={13} />
                                                                    <span>Cancel Order</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}

                        {activeTab === "picking" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Pick ID</th>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Picker Assigned</th>
                                        <th>Products Count</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPicks.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="odt-empty">
                                                No pick lists found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedPicks.map(item => (
                                            <tr key={item.id} className="orders-row-hover">
                                                <td className="odt-id">{item.id}</td>
                                                <td className="odt-id">{item.orderId}</td>
                                                <td className="odt-customer-name">{item.customer}</td>
                                                <td>
                                                    <span className={`picker-assigned-pill ${item.picker === "Unassigned" ? "unassigned" : ""}`}>
                                                        <User size={12} />
                                                        {item.picker}
                                                    </span>
                                                </td>
                                                <td className="odt-items">{item.productsCount} SKUs</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="orders-actions-cell">
                                                        {item.status === "Pending" && (
                                                            <button className="orders-inline-btn" onClick={() => openPickAssign(item)}>
                                                                Assign Picker
                                                            </button>
                                                        )}
                                                        {item.status === "Assigned" && (
                                                            <>
                                                                <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => openPickAssign(item)}>
                                                                    Reassign
                                                                </button>
                                                                <button className="orders-inline-btn orders-inline-btn--success" onClick={() => handleCompletePick(item.id)}>
                                                                    Complete Pick
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status === "Completed" && (
                                                            <span className="orders-inline-completed">Completed</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}

                        {activeTab === "packing" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Pack ID</th>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Packed By</th>
                                        <th>Items Count</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPacks.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="odt-empty">
                                                No packing boxes found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedPacks.map(item => (
                                            <tr key={item.id} className="orders-row-hover">
                                                <td className="odt-id">{item.id}</td>
                                                <td className="odt-id">{item.orderId}</td>
                                                <td className="odt-customer-name">{item.customer}</td>
                                                <td>
                                                    <span className={`picker-assigned-pill ${item.packedBy === "Unassigned" ? "unassigned" : ""}`}>
                                                        <User size={12} />
                                                        {item.packedBy}
                                                    </span>
                                                </td>
                                                <td className="odt-items">{item.items} items</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="orders-actions-cell">
                                                        {item.status === "Waiting" && (
                                                            <button className="orders-inline-btn" onClick={() => handleStartPacking(item.id)}>
                                                                Start Packing
                                                            </button>
                                                        )}
                                                        {item.status === "Packing" && (
                                                            <>
                                                                <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => handlePrintLabel(item.id)}>
                                                                    <Printer size={12} />
                                                                    <span>Print Label</span>
                                                                </button>
                                                                <button className="orders-inline-btn orders-inline-btn--success" onClick={() => handleCompletePack(item.id)}>
                                                                    Complete
                                                                </button>
                                                            </>
                                                        )}
                                                        {item.status === "Packed" && (
                                                            <button className="orders-inline-btn orders-inline-btn--secondary" onClick={() => handlePrintLabel(item.id)}>
                                                                <Printer size={12} />
                                                                <span>Reprint Tag</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </>
                        )}

                        {activeTab === "tracking" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Delivery ID</th>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Rider Assigned</th>
                                        <th>ETA</th>
                                        <th>Current Location</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDeliveries.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="odt-empty">
                                                No delivery riders found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDeliveries.map(item => (
                                            <tr key={item.id} className="orders-row-hover">
                                                <td className="odt-id">{item.id}</td>
                                                <td className="odt-id">{item.orderId}</td>
                                                <td className="odt-customer-name">{item.customer}</td>
                                                <td>
                                                    <span className={`picker-assigned-pill ${item.rider === "Unassigned" ? "unassigned" : ""}`}>
                                                        <User size={12} />
                                                        {item.rider}
                                                    </span>
                                                </td>
                                                <td className="odt-items">{item.eta}</td>
                                                <td className="odt-warehouse">{item.location}</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="orders-actions-cell">
                                                        <button className="orders-inline-btn orders-inline-btn--secondary" title="Call rider" onClick={() => handleCallRider(item.rider)} disabled={item.rider === "Unassigned"}>
                                                            <PhoneCall size={12} />
                                                        </button>
                                                        <button className="orders-inline-btn orders-inline-btn--secondary" title="Track on map" onClick={() => openDlvTrack(item)} disabled={item.status === "Delivered" || item.status === "Failed"}>
                                                            <Navigation size={12} />
                                                        </button>
                                                        <button className="orders-inline-btn" title="Update status" onClick={() => openDlvUpdate(item)}>
                                                            Update
                                                        </button>
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

                {/* Pagination Controls */}
                {((activeTab === "orders" && filteredOrders.length > ROWS_PER_PAGE) ||
                  (activeTab === "picking" && filteredPicks.length > ROWS_PER_PAGE) ||
                  (activeTab === "packing" && filteredPacks.length > ROWS_PER_PAGE) ||
                  (activeTab === "tracking" && filteredDeliveries.length > ROWS_PER_PAGE)) && (
                    <div className="orders-pagination">
                        <span className="orders-pagination-info">
                            Showing <strong>{
                                activeTab === "orders" ? Math.min(filteredOrders.length, (ordPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "picking" ? Math.min(filteredPicks.length, (pickPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "packing" ? Math.min(filteredPacks.length, (packPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(filteredDeliveries.length, (dlvPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activeTab === "orders" ? Math.min(filteredOrders.length, ordPage * ROWS_PER_PAGE) :
                                activeTab === "picking" ? Math.min(filteredPicks.length, pickPage * ROWS_PER_PAGE) :
                                activeTab === "packing" ? Math.min(filteredPacks.length, packPage * ROWS_PER_PAGE) :
                                Math.min(filteredDeliveries.length, dlvPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activeTab === "orders" ? filteredOrders.length :
                                activeTab === "picking" ? filteredPicks.length :
                                activeTab === "packing" ? filteredPacks.length :
                                filteredDeliveries.length
                            }</strong> orders
                        </span>

                        <div className="orders-pagination-controls">
                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activeTab === "orders") setOrdPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "picking") setPickPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "packing") setPackPage(p => Math.max(1, p - 1));
                                    else setDlvPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activeTab === "orders" ? ordPage === 1 :
                                    activeTab === "picking" ? pickPage === 1 :
                                    activeTab === "packing" ? packPage === 1 :
                                    dlvPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length:
                                activeTab === "orders" ? Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                activeTab === "picking" ? Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                activeTab === "packing" ? Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`orders-page-btn orders-page-number ${
                                        (activeTab === "orders" && ordPage === page) ||
                                        (activeTab === "picking" && pickPage === page) ||
                                        (activeTab === "packing" && packPage === page) ||
                                        (activeTab === "tracking" && dlvPage === page)
                                            ? "orders-page-number--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeTab === "orders") setOrdPage(page);
                                        else if (activeTab === "picking") setPickPage(page);
                                        else if (activeTab === "packing") setPackPage(page);
                                        else setDlvPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activeTab === "orders") setOrdPage(p => Math.min(Math.ceil(filteredOrders.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "picking") setPickPage(p => Math.min(Math.ceil(filteredPicks.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "packing") setPackPage(p => Math.min(Math.ceil(filteredPacks.length / ROWS_PER_PAGE), p + 1));
                                    else setDlvPage(p => Math.min(Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activeTab === "orders" ? ordPage === Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                    activeTab === "picking" ? pickPage === Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                    activeTab === "packing" ? packPage === Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                    dlvPage === Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE)
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
                <div className="orders-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="orders-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="orders-modal-header">
                            <div className="orders-modal-header__icon-wrap">
                                {modalType.startsWith("ord") ? <ShoppingBag size={18} /> : modalType.startsWith("pick") ? <PackageSearch size={18} /> : <Truck size={18} />}
                            </div>
                            <div className="orders-modal-header__text-block">
                                <h3 className="orders-modal-title">
                                    {modalType === "ord-view" && "Order Sheet Overview"}
                                    {modalType === "ord-edit" && "Modify Customer Order Info"}
                                    {modalType === "pick-assign" && "Assign Packing Picker Hub"}
                                    {modalType === "dlv-track" && "Active Rider Delivery Tracking"}
                                    {modalType === "dlv-update" && "Update Rider Transit Info"}
                                </h3>
                                <span className="orders-modal-subtitle">
                                    {selectedItem?.id || selectedItem?.orderId}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="orders-modal-body">
                            
                            {/* 1. All Orders View Details */}
                            {modalType === "ord-view" && selectedItem && (
                                <div className="orders-details-sheet">
                                    <div className="details-row"><span className="details-label">Order Reference:</span><span className="details-val font-mono">{selectedItem.id}</span></div>
                                    <div className="details-row"><span className="details-label">Customer Name:</span><span className="details-val">{selectedItem.customer}</span></div>
                                    <div className="details-row"><span className="details-label">Created Date:</span><span className="details-val">{selectedItem.date}</span></div>
                                    <div className="details-row"><span className="details-label">Total Items Count:</span><span className="details-val">{selectedItem.items} items</span></div>
                                    <div className="details-row"><span className="details-label">Invoice Amount:</span><span className="details-val bold">{selectedItem.amount}</span></div>
                                    <div className="details-row"><span className="details-label">Payment Channel:</span><span className="details-val">{selectedItem.payment}</span></div>
                                    <div className="details-row"><span className="details-label">Processing Stage:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                </div>
                            )}

                            {/* 2. All Orders Edit */}
                            {modalType === "ord-edit" && (
                                <form id="ord-edit-form" onSubmit={handleOrdEditSubmit} className="orders-modal-form">
                                    <div className="orders-form-group">
                                        <label htmlFor="formCustomer">Customer Name</label>
                                        <input type="text" id="formCustomer" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} required />
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formAmount">Invoice Amount</label>
                                        <input type="text" id="formAmount" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} required />
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formPayment">Payment Method</label>
                                        <select id="formPayment" value={formPayment} onChange={(e) => setFormPayment(e.target.value)}>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="PayPal">PayPal</option>
                                            <option value="COD">COD</option>
                                            <option value="Transfer Bank">Transfer Bank</option>
                                        </select>
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formStatus">Operational Status</label>
                                        <select id="formStatus" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </form>
                            )}

                            {/* 3. Picking Assign Picker */}
                            {modalType === "pick-assign" && selectedItem && (
                                <form id="pick-assign-form" onSubmit={handlePickAssignSubmit} className="orders-modal-form">
                                    <p className="adjust-explainer">Assign picking lists to active store dispatchers. The picker will receive an alert to retrieve <strong>{selectedItem.productsCount} SKUs</strong> from designated warehouse bins.</p>
                                    <div className="orders-form-group">
                                        <label htmlFor="formPicker">Picker Assigned</label>
                                        <select id="formPicker" value={formPicker} onChange={(e) => setFormPicker(e.target.value)}>
                                            <option value="Ramesh Kumar">Ramesh Kumar</option>
                                            <option value="Sunita Sharma">Sunita Sharma</option>
                                            <option value="Amit Patel">Amit Patel</option>
                                            <option value="Suresh Singh">Suresh Singh</option>
                                        </select>
                                    </div>
                                </form>
                            )}

                            {/* 4. Delivery Active Rider Tracking Map */}
                            {modalType === "dlv-track" && selectedItem && (
                                <div className="map-view-wrapper">
                                    <div className="simulated-map-container">
                                        <div className="simulated-map-grid">
                                            <div className="simulated-road horizontal"></div>
                                            <div className="simulated-road vertical"></div>
                                            
                                            {/* Store Pin */}
                                            <div className="map-pin-badge store">
                                                <Store size={12} />
                                                <span>HAATZA Hub</span>
                                            </div>

                                            {/* Rider Pin */}
                                            <div className="map-pin-badge rider-pin bounce">
                                                <Truck size={12} />
                                                <span>{selectedItem.rider}</span>
                                            </div>

                                            {/* Customer Pin */}
                                            <div className="map-pin-badge customer">
                                                <MapPin size={12} />
                                                <span>{selectedItem.customer}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="map-details-card">
                                        <div className="map-detail-row"><span className="label">Current Location:</span><span className="val">{selectedItem.location}</span></div>
                                        <div className="map-detail-row"><span className="label">ETA remaining:</span><span className="val highlight">{selectedItem.eta}</span></div>
                                        <div className="map-detail-row"><span className="label">Rider Assigned:</span><span className="val">{selectedItem.rider}</span></div>
                                    </div>
                                </div>
                            )}

                            {/* 5. Delivery Update status */}
                            {modalType === "dlv-update" && selectedItem && (
                                <form id="dlv-update-form" onSubmit={handleDlvUpdateSubmit} className="orders-modal-form">
                                    <div className="orders-form-group">
                                        <label htmlFor="formRider">Rider Assigned</label>
                                        <select id="formRider" value={formRider} onChange={(e) => setFormRider(e.target.value)}>
                                            <option value="Unassigned">Unassigned</option>
                                            <option value="Ramesh Kumar">Ramesh Kumar</option>
                                            <option value="Sunita Sharma">Sunita Sharma</option>
                                            <option value="Amit Patel">Amit Patel</option>
                                            <option value="Suresh Singh">Suresh Singh</option>
                                        </select>
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formDlvStatus">Delivery Stage</label>
                                        <select id="formDlvStatus" value={formDlvStatus} onChange={(e) => setFormDlvStatus(e.target.value)}>
                                            <option value="Assigned">Assigned</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formLocation">Current Location</label>
                                        <input type="text" id="formLocation" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} required />
                                    </div>
                                    <div className="orders-form-group">
                                        <label htmlFor="formEta">ETA Duration</label>
                                        <input type="text" id="formEta" value={formEta} onChange={(e) => setFormEta(e.target.value)} required />
                                    </div>
                                </form>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="orders-modal-footer">
                            <button className="orders-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>

                            {modalType === "ord-edit" && (
                                <button type="submit" form="ord-edit-form" className="orders-modal-submit-btn">
                                    Apply Changes
                                </button>
                            )}

                            {modalType === "pick-assign" && (
                                <button type="submit" form="pick-assign-form" className="orders-modal-submit-btn">
                                    Assign Picker
                                </button>
                            )}

                            {modalType === "dlv-update" && (
                                <button type="submit" form="dlv-update-form" className="orders-modal-submit-btn">
                                    Update Transit Info
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
