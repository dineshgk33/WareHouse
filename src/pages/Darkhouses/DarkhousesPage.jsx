import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Search,
    Plus,
    X,
    Warehouse,
    User,
    Phone,
    MapPin,
    Activity,
    CheckCircle,
    XCircle,
    MoreVertical,
    Download,
    Eye,
    Edit2,
    Trash2,
    ShoppingBag,
    UserCheck,
    AlertTriangle,
    Building,
    Users,
    PackagePlus,
    Clock,
    Mail,
    ChevronLeft,
    ChevronRight,
    Tag
} from "lucide-react";
import { INITIAL_DARKHOUSES, CITIES } from "../../data/darkhouses";
import { MOCK_MANAGERS, MOCK_ASSIGNED_PRODUCTS } from "../../data/darkhousesData";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../../data/catalogData";
import "./Darkhouses.css";

const ROWS_PER_PAGE = 6;

function DarkhousesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "list";

    // ─── States ───────────────────────────────────────────────────────────────
    const [darkhouses, setDarkhouses] = useState(INITIAL_DARKHOUSES);
    const [managers, setManagers] = useState(MOCK_MANAGERS);
    const [assignedProducts, setAssignedProducts] = useState(MOCK_ASSIGNED_PRODUCTS);

    const [activeRowMenuId, setActiveRowMenuId] = useState(null);

    // Filters for Darkhouse List
    const [dhSearch, setDhSearch] = useState("");
    const [dhCity, setDhCity] = useState("All");
    const [dhPage, setDhPage] = useState(1);

    // Filters for Managers
    const [mSearch, setMSearch] = useState("");
    const [mCity, setMCity] = useState("All");
    const [mPage, setMPage] = useState(1);

    // Filters for Assign Products
    const [apSearch, setApSearch] = useState("");
    const [apDarkhouse, setApDarkhouse] = useState("All");
    const [apCategory, setApCategory] = useState("All");
    const [apPage, setApPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'dh-add' | 'dh-edit' | 'dh-view' | 'mgr-edit' | 'mgr-assign' | 'ap-assign' | 'ap-bulk'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form fields - Darkhouse List
    const [formDhName, setFormDhName] = useState("");
    const [formDhCode, setFormDhCode] = useState("");
    const [formDhCity, setFormDhCity] = useState("Bangalore");
    const [formDhAddress, setFormDhAddress] = useState("");
    const [formDhManager, setFormDhManager] = useState("");
    const [formDhPhone, setFormDhPhone] = useState("");
    const [formDhStatus, setFormDhStatus] = useState("Active");

    // Form fields - Managers
    const [formMgrName, setFormMgrName] = useState("");
    const [formMgrEmail, setFormMgrEmail] = useState("");
    const [formMgrPhone, setFormMgrPhone] = useState("");
    const [formMgrDh, setFormMgrDh] = useState("");
    const [formMgrShift, setFormMgrShift] = useState("Morning");
    const [formMgrStatus, setFormMgrStatus] = useState("Active");

    // Form fields - Assign Products
    const [formApProduct, setFormApProduct] = useState("");
    const [formApDh, setFormApDh] = useState("");
    const [formApStock, setFormApStock] = useState(100);
    const [formApReorder, setFormApReorder] = useState(15);

    // Toast alert state
    const [toastMessage, setToastMessage] = useState("");

    // Auto-dismiss toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Reset pagination on tab change
    useEffect(() => {
        setDhPage(1);
        setMPage(1);
        setApPage(1);
        setActiveRowMenuId(null);
    }, [activeTab]);

    const showToast = (msg) => {
        setToastMessage(msg);
    };

    // Helper: Initials for Manager avatar
    const getInitials = (name) => {
        if (!name) return "DH";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // ─── 1. Filtering Darkhouse List ──────────────────────────────────────────
    const filteredDarkhouses = useMemo(() => {
        return darkhouses.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(dhSearch.toLowerCase()) || d.code.toLowerCase().includes(dhSearch.toLowerCase()) || d.manager.toLowerCase().includes(dhSearch.toLowerCase());
            const matchesCity = dhCity === "All" || d.city === dhCity;
            return matchesSearch && matchesCity;
        });
    }, [darkhouses, dhSearch, dhCity]);

    const paginatedDarkhouses = useMemo(() => {
        const start = (dhPage - 1) * ROWS_PER_PAGE;
        return filteredDarkhouses.slice(start, start + ROWS_PER_PAGE);
    }, [filteredDarkhouses, dhPage]);

    const dhStats = useMemo(() => {
        const total = darkhouses.length;
        const active = darkhouses.filter(d => d.status === "Active").length;
        const inactive = darkhouses.filter(d => d.status === "Inactive").length;
        const todayOrders = darkhouses.reduce((acc, d) => acc + d.todayOrders, 0);
        return { total, active, inactive, todayOrders };
    }, [darkhouses]);

    // ─── 2. Filtering Managers ────────────────────────────────────────────────
    const filteredManagers = useMemo(() => {
        return managers.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(mSearch.toLowerCase()) || m.email.toLowerCase().includes(mSearch.toLowerCase());
            // Align manager search to city by checking darkhouse city
            let matchesCity = true;
            if (mCity !== "All") {
                const dhInfo = darkhouses.find(d => d.name === m.darkhouse);
                matchesCity = dhInfo ? dhInfo.city === mCity : false;
            }
            return matchesSearch && matchesCity;
        });
    }, [managers, mSearch, mCity, darkhouses]);

    const paginatedManagers = useMemo(() => {
        const start = (mPage - 1) * ROWS_PER_PAGE;
        return filteredManagers.slice(start, start + ROWS_PER_PAGE);
    }, [filteredManagers, mPage]);

    const mStats = useMemo(() => {
        const total = managers.length;
        const active = managers.filter(m => m.status === "Active").length;
        const onLeave = managers.filter(m => m.status === "On Leave").length;
        const assigned = managers.filter(m => m.darkhouse && m.darkhouse !== "Unassigned").length;
        return { total, active, onLeave, assigned };
    }, [managers]);

    // ─── 3. Filtering Assign Products ─────────────────────────────────────────
    const filteredAssignedProducts = useMemo(() => {
        return assignedProducts.filter(ap => {
            const matchesSearch = ap.product.toLowerCase().includes(apSearch.toLowerCase()) || ap.sku.toLowerCase().includes(apSearch.toLowerCase());
            const matchesDh = apDarkhouse === "All" || ap.darkhouse === apDarkhouse;
            const matchesCategory = apCategory === "All" || ap.category === apCategory;
            return matchesSearch && matchesDh && matchesCategory;
        });
    }, [assignedProducts, apSearch, apDarkhouse, apCategory]);

    const paginatedAssignedProducts = useMemo(() => {
        const start = (apPage - 1) * ROWS_PER_PAGE;
        return filteredAssignedProducts.slice(start, start + ROWS_PER_PAGE);
    }, [filteredAssignedProducts, apPage]);

    const apStats = useMemo(() => {
        const mapped = assignedProducts.length;
        const pending = MOCK_PRODUCTS.length - new Set(assignedProducts.map(p => p.sku)).size;
        const low = assignedProducts.filter(p => p.stock <= p.reorder && p.stock > 0).length;
        return { mapped, pending: Math.max(0, pending), low };
    }, [assignedProducts]);

    // ─── Modal Openers ────────────────────────────────────────────────────────
    const openDhView = (dh) => {
        setSelectedItem(dh);
        setModalType("dh-view");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openDhAdd = () => {
        setFormDhName("");
        setFormDhCode("");
        setFormDhCity("Bangalore");
        setFormDhAddress("");
        setFormDhManager("Amit Sharma");
        setFormDhPhone("");
        setFormDhStatus("Active");
        setModalType("dh-add");
        setIsModalOpen(true);
    };

    const openDhEdit = (dh) => {
        setSelectedItem(dh);
        setFormDhName(dh.name);
        setFormDhCode(dh.code);
        setFormDhCity(dh.city);
        setFormDhAddress(dh.address);
        setFormDhManager(dh.manager);
        setFormDhPhone(dh.phone);
        setFormDhStatus(dh.status);
        setModalType("dh-edit");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openMgrEdit = (mgr) => {
        setSelectedItem(mgr);
        setFormMgrName(mgr.name);
        setFormMgrEmail(mgr.email);
        setFormMgrPhone(mgr.phone);
        setFormMgrDh(mgr.darkhouse);
        setFormMgrShift(mgr.shift);
        setFormMgrStatus(mgr.status);
        setModalType("mgr-edit");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openMgrAssign = (mgr) => {
        setSelectedItem(mgr);
        setFormMgrDh(mgr.darkhouse === "Unassigned" ? darkhouses[0]?.name || "" : mgr.darkhouse);
        setModalType("mgr-assign");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const openApAssign = () => {
        setFormApProduct(MOCK_PRODUCTS[0]?.name || "");
        setFormApDh(darkhouses[0]?.name || "");
        setFormApStock(100);
        setFormApReorder(15);
        setModalType("ap-assign");
        setIsModalOpen(true);
    };

    const openApBulk = () => {
        setFormApDh(darkhouses[0]?.name || "");
        setFormApStock(100);
        setFormApReorder(15);
        setModalType("ap-bulk");
        setIsModalOpen(true);
    };

    // ─── Modal Form Actions ───────────────────────────────────────────────────
    const handleDhAddSubmit = (e) => {
        e.preventDefault();
        const colors = ["avatar-indigo", "avatar-teal", "avatar-purple", "avatar-cyan", "avatar-rose", "avatar-amber"];
        const newDh = {
            id: `DKH-${Math.floor(100 + Math.random() * 900)}`,
            name: formDhName,
            code: formDhCode,
            city: formDhCity,
            address: formDhAddress,
            manager: formDhManager,
            phone: formDhPhone,
            status: formDhStatus,
            todayOrders: 0,
            avatarColor: colors[Math.floor(Math.random() * colors.length)]
        };
        setDarkhouses(prev => [newDh, ...prev]);
        setIsModalOpen(false);
        showToast(`Registered new hub ${formDhName}`);
    };

    const handleDhEditSubmit = (e) => {
        e.preventDefault();
        setDarkhouses(prev => prev.map(d => {
            if (d.id === selectedItem.id) {
                return {
                    ...d,
                    name: formDhName,
                    code: formDhCode,
                    city: formDhCity,
                    address: formDhAddress,
                    manager: formDhManager,
                    phone: formDhPhone,
                    status: formDhStatus
                };
            }
            return d;
        }));
        setIsModalOpen(false);
        showToast(`Saved hub changes for ${formDhName}`);
    };

    const handleMgrEditSubmit = (e) => {
        e.preventDefault();
        setManagers(prev => prev.map(m => {
            if (m.id === selectedItem.id) {
                return {
                    ...m,
                    name: formMgrName,
                    email: formMgrEmail,
                    phone: formMgrPhone,
                    darkhouse: formMgrDh,
                    shift: formMgrShift,
                    status: formMgrStatus
                };
            }
            return m;
        }));
        setIsModalOpen(false);
        showToast(`Saved manager details for ${formMgrName}`);
    };

    const handleMgrAssignSubmit = (e) => {
        e.preventDefault();
        setManagers(prev => prev.map(m => {
            if (m.id === selectedItem.id) {
                return {
                    ...m,
                    darkhouse: formMgrDh
                };
            }
            return m;
        }));
        // Auto update Darkhouse manager field too
        setDarkhouses(prev => prev.map(d => {
            if (d.name === formMgrDh) {
                return { ...d, manager: selectedItem.name };
            }
            return d;
        }));
        setIsModalOpen(false);
        showToast(`Assigned Manager ${selectedItem.name} to ${formMgrDh}`);
    };

    const handleApAssignSubmit = (e) => {
        e.preventDefault();
        const selectedProdInfo = MOCK_PRODUCTS.find(p => p.name === formApProduct);
        const newMap = {
            id: `MAP-${Math.floor(10000 + Math.random() * 90000)}`,
            product: formApProduct,
            sku: selectedProdInfo ? selectedProdInfo.sku : "FRT-NEW-SKU",
            category: selectedProdInfo ? selectedProdInfo.category : "Fruits & Vegetables",
            darkhouse: formApDh,
            stock: formApStock,
            reorder: formApReorder,
            status: formApStock === 0 ? "Out of Stock" : formApStock <= formApReorder ? "Low Stock" : "In Stock"
        };
        setAssignedProducts(prev => [newMap, ...prev]);
        setIsModalOpen(false);
        showToast(`Successfully mapped ${formApProduct} to ${formApDh}`);
    };

    const handleApBulkSubmit = (e) => {
        e.preventDefault();
        // Allocate all catalog products to this darkhouse
        const newAllocations = MOCK_PRODUCTS.map(p => ({
            id: `MAP-${Math.floor(10000 + Math.random() * 90000)}`,
            product: p.name,
            sku: p.sku,
            category: p.category,
            darkhouse: formApDh,
            stock: formApStock,
            reorder: formApReorder,
            status: formApStock === 0 ? "Out of Stock" : formApStock <= formApReorder ? "Low Stock" : "In Stock"
        }));
        setAssignedProducts(prev => [...newAllocations, ...prev]);
        setIsModalOpen(false);
        showToast(`Bulk mapped all ${MOCK_PRODUCTS.length} catalog products to ${formApDh}`);
    };

    // ─── Inline State Toggles ─────────────────────────────────────────────────
    const handleToggleDhStatus = (id) => {
        setDarkhouses(prev => prev.map(d => {
            if (d.id === id) {
                const nextStatus = d.status === "Active" ? "Inactive" : "Active";
                showToast(`Toggled ${d.name} state to ${nextStatus}`);
                return { ...d, status: nextStatus };
            }
            return d;
        }));
        setActiveRowMenuId(null);
    };

    const handleToggleMgrStatus = (id) => {
        setManagers(prev => prev.map(m => {
            if (m.id === id) {
                const nextStatus = m.status === "Active" ? "On Leave" : "Active";
                showToast(`Toggled ${m.name} status to ${nextStatus}`);
                return { ...m, status: nextStatus };
            }
            return m;
        }));
        setActiveRowMenuId(null);
    };

    const handleRemoveProductMap = (id, prodName) => {
        if (window.confirm(`Are you sure you want to remove mapping allocation for ${prodName}?`)) {
            setAssignedProducts(prev => prev.filter(ap => ap.id !== id));
            showToast(`Deleted mapping allocation for ${prodName}`);
        }
    };

    // UI badges helper
    const getStatusClass = (status) => {
        switch (status) {
            case "Active":
            case "In Stock":
                return "dkh-badge dkh-badge-active";
            case "Low Stock":
                return "dkh-badge dkh-badge-warning";
            case "Inactive":
            case "On Leave":
            case "Out of Stock":
                return "dkh-badge dkh-badge-inactive";
            default:
                return "dkh-badge";
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
        <div className="dkh-root fade-in">
            {/* Custom Toast Alert */}
            {toastMessage && (
                <div className="dkh-toast slide-in-top">
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="dkh-header">
                <div className="dkh-header__title-block">
                    <h1 className="dkh-header__title">
                        {activeTab === "list" && "HAATZA Darkhouse Hubs"}
                        {activeTab === "managers" && "Hub Managers Management"}
                        {activeTab === "assign" && "Regional Product Mapping"}
                    </h1>
                    <p className="dkh-header__subtitle">
                        {activeTab === "list" && "Monitor active fronting hubs, orders capacity and regional dispatching addresses."}
                        {activeTab === "managers" && "Manage staff shift schedules, active hub linkages and contacts directories."}
                        {activeTab === "assign" && "Link quick-commerce catalog products to regional darkhouse stock pools."}
                    </p>
                </div>
                <div className="dkh-header-actions-group">
                    {activeTab === "list" && (
                        <button className="dkh-action-btn-primary" onClick={openDhAdd}>
                            <Plus size={15} />
                            <span>Add New Darkhouse</span>
                        </button>
                    )}
                    {activeTab === "assign" && (
                        <>
                            <button className="dkh-action-btn-secondary" onClick={openApBulk}>
                                <span>Bulk Allocations</span>
                            </button>
                            <button className="dkh-action-btn-primary" onClick={openApAssign}>
                                <Plus size={15} />
                                <span>Assign Product</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Summary Stat Grid */}
            <div className="dkh-summary-grid">
                {activeTab === "list" && (
                    <>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--info">
                                <Building size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.total}</span>
                                <span className="dkh-summary-card__label">Total Hubs</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--success">
                                <CheckCircle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.active}</span>
                                <span className="dkh-summary-card__label">Active Hubs</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.inactive}</span>
                                <span className="dkh-summary-card__label">Inactive Hubs</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--info">
                                <ShoppingBag size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.todayOrders}</span>
                                <span className="dkh-summary-card__label">Today's Orders</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "managers" && (
                    <>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--info">
                                <Users size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{mStats.total}</span>
                                <span className="dkh-summary-card__label">Total Managers</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--success">
                                <UserCheck size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{mStats.active}</span>
                                <span className="dkh-summary-card__label">On Shift (Active)</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{mStats.onLeave}</span>
                                <span className="dkh-summary-card__label">On Leave</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--info">
                                <Building size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{mStats.assigned}</span>
                                <span className="dkh-summary-card__label">Hub Linked</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "assign" && (
                    <>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--info">
                                <PackagePlus size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{apStats.mapped}</span>
                                <span className="dkh-summary-card__label">Mapped Products</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{apStats.pending}</span>
                                <span className="dkh-summary-card__label">Pending Maps</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{apStats.low}</span>
                                <span className="dkh-summary-card__label">Low Stock Map Pools</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Table Area */}
            <div className="dkh-table-card">
                {/* Dynamic Toolbar */}
                <div className="dkh-toolbar">
                    <div className="dkh-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "list"}
                            className={`dkh-tab ${activeTab === "list" ? "dkh-tab--active" : ""}`}
                            onClick={() => handleTabClick("list")}
                        >
                            Darkhouse List
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "managers"}
                            className={`dkh-tab ${activeTab === "managers" ? "dkh-tab--active" : ""}`}
                            onClick={() => handleTabClick("managers")}
                        >
                            Managers
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "assign"}
                            className={`dkh-tab ${activeTab === "assign" ? "dkh-tab--active" : ""}`}
                            onClick={() => handleTabClick("assign")}
                        >
                            Assign Products
                        </button>
                    </div>

                    <div className="dkh-toolbar__actions">
                        {activeTab === "list" && (
                            <>
                                <div className="dkh-search-wrap">
                                    <Search size={14} className="dkh-search-icon" />
                                    <input
                                        type="text"
                                        className="dkh-search-input"
                                        placeholder="Search by code, city, name..."
                                        value={dhSearch}
                                        onChange={(e) => { setDhSearch(e.target.value); setDhPage(1); }}
                                    />
                                </div>
                                <select
                                    className="dkh-toolbar-select"
                                    value={dhCity}
                                    onChange={(e) => { setDhCity(e.target.value); setDhPage(1); }}
                                >
                                    <option value="All">All Cities</option>
                                    {CITIES.filter(c => c !== "All").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {activeTab === "managers" && (
                            <>
                                <div className="dkh-search-wrap">
                                    <Search size={14} className="dkh-search-icon" />
                                    <input
                                        type="text"
                                        className="dkh-search-input"
                                        placeholder="Search by manager name or email..."
                                        value={mSearch}
                                        onChange={(e) => { setMSearch(e.target.value); setMPage(1); }}
                                    />
                                </div>
                                <select
                                    className="dkh-toolbar-select"
                                    value={mCity}
                                    onChange={(e) => { setMCity(e.target.value); setMPage(1); }}
                                >
                                    <option value="All">All Cities</option>
                                    {CITIES.filter(c => c !== "All").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {activeTab === "assign" && (
                            <>
                                <div className="dkh-search-wrap">
                                    <Search size={14} className="dkh-search-icon" />
                                    <input
                                        type="text"
                                        className="dkh-search-input"
                                        placeholder="Search by product name or SKU..."
                                        value={apSearch}
                                        onChange={(e) => { setApSearch(e.target.value); setApPage(1); }}
                                    />
                                </div>
                                <select
                                    className="dkh-toolbar-select"
                                    value={apDarkhouse}
                                    onChange={(e) => { setApDarkhouse(e.target.value); setApPage(1); }}
                                >
                                    <option value="All">All Darkhouses</option>
                                    {darkhouses.map(d => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                                <select
                                    className="dkh-toolbar-select"
                                    value={apCategory}
                                    onChange={(e) => { setApCategory(e.target.value); setApPage(1); }}
                                >
                                    <option value="All">All Categories</option>
                                    {MOCK_CATEGORIES.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {/* Table Responsive Layout */}
                <div className="dkh-table-responsive">
                    <table className="dkh-table">
                        {activeTab === "list" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Hub Name</th>
                                        <th>Hub Code</th>
                                        <th>City</th>
                                        <th>Address</th>
                                        <th>Manager Assigned</th>
                                        <th>Today Orders</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDarkhouses.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="dkh-empty">
                                                No darkhouse hubs found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDarkhouses.map(dh => (
                                            <tr key={dh.id} className="darkhouse-row-hover">
                                                <td className="dkh-td--name">{dh.name}</td>
                                                <td className="dkh-td--code">{dh.code}</td>
                                                <td><span className="dkh-city-badge">{dh.city}</span></td>
                                                <td className="dkh-td--address">{dh.address}</td>
                                                <td className="dkh-td--manager">
                                                    <span className="dkh-manager-initials-pill">
                                                        {getInitials(dh.manager)}
                                                    </span>
                                                    {dh.manager}
                                                </td>
                                                <td className="dkh-td--orders">{dh.todayOrders} orders</td>
                                                <td><span className={getStatusClass(dh.status)}>{dh.status}</span></td>
                                                <td style={{ position: "relative" }}>
                                                    <button className="dkh-row-action-btn" onClick={(e) => toggleRowMenu(dh.id, e)}>
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {activeRowMenuId === dh.id && (
                                                        <>
                                                            <div className="global-dropdown-overlay" onClick={() => setActiveRowMenuId(null)} />
                                                            <div className="global-action-dropdown">
                                                                <button className="global-dropdown-item" onClick={() => openDhView(dh)}>
                                                                    <Eye size={13} />
                                                                    <span>View Details</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => openDhEdit(dh)}>
                                                                    <Edit2 size={13} />
                                                                    <span>Edit Hub</span>
                                                                </button>
                                                                <div className="global-dropdown-divider"></div>
                                                                <button className="global-dropdown-item" onClick={() => handleToggleDhStatus(dh.id)}>
                                                                    <CheckCircle size={13} />
                                                                    <span>{dh.status === "Active" ? "Deactivate" : "Activate"}</span>
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

                        {activeTab === "managers" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Profile</th>
                                        <th>Name</th>
                                        <th>Email Address</th>
                                        <th>Phone Contacts</th>
                                        <th>Assigned Darkhouse</th>
                                        <th>Shift Schedule</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedManagers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="dkh-empty">
                                                No manager staff directory found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedManagers.map(mgr => (
                                            <tr key={mgr.id} className="darkhouse-row-hover">
                                                <td>
                                                    <div className={`odt-avatar ${mgr.avatarColor || "avatar-indigo"}`}>
                                                        {mgr.initials}
                                                    </div>
                                                </td>
                                                <td className="dkh-td--name">{mgr.name}</td>
                                                <td>
                                                    <span className="dkh-manager-detail-tag">
                                                        <Mail size={12} />
                                                        {mgr.email}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="dkh-manager-detail-tag">
                                                        <Phone size={12} />
                                                        {mgr.phone}
                                                    </span>
                                                </td>
                                                <td className="dkh-td--manager">{mgr.darkhouse}</td>
                                                <td>
                                                    <span className="dkh-shift-pill">
                                                        <Clock size={12} />
                                                        {mgr.shift}
                                                    </span>
                                                </td>
                                                <td><span className={getStatusClass(mgr.status)}>{mgr.status}</span></td>
                                                <td style={{ position: "relative" }}>
                                                    <button className="dkh-row-action-btn" onClick={(e) => toggleRowMenu(mgr.id, e)}>
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {activeRowMenuId === mgr.id && (
                                                        <>
                                                            <div className="global-dropdown-overlay" onClick={() => setActiveRowMenuId(null)} />
                                                            <div className="global-action-dropdown">
                                                                <button className="global-dropdown-item" onClick={() => openMgrAssign(mgr)}>
                                                                    <Warehouse size={13} />
                                                                    <span>Assign Hub</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => openMgrEdit(mgr)}>
                                                                    <Edit2 size={13} />
                                                                    <span>Edit Details</span>
                                                                </button>
                                                                <div className="global-dropdown-divider"></div>
                                                                <button className="global-dropdown-item" onClick={() => handleToggleMgrStatus(mgr.id)}>
                                                                    <Clock size={13} />
                                                                    <span>Shift status</span>
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

                        {activeTab === "assign" && (
                            <>
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>SKU Code</th>
                                        <th>Category</th>
                                        <th>Mapped Darkhouse</th>
                                        <th>Available Stock</th>
                                        <th>Reorder Point</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAssignedProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="dkh-empty">
                                                No catalog product mappings found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedAssignedProducts.map(item => (
                                            <tr key={item.id} className="darkhouse-row-hover">
                                                <td className="dkh-td--name">{item.product}</td>
                                                <td className="dkh-td--code">{item.sku}</td>
                                                <td><span className="dkh-city-badge">{item.category}</span></td>
                                                <td className="dkh-td--manager">{item.darkhouse}</td>
                                                <td>
                                                    <span className={`inv-stock-number ${item.stock === 0 ? "out" : item.stock <= item.reorder ? "low" : ""}`}>
                                                        {item.stock} items
                                                    </span>
                                                </td>
                                                <td className="dkh-td--orders" style={{ textAlign: "left" }}>{item.reorder} units</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="dkh-actions-cell">
                                                        <button className="dkh-inline-btn dkh-inline-btn--danger" onClick={() => handleRemoveProductMap(item.id, item.product)}>
                                                            Remove
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

                {/* Pagination footer */}
                {((activeTab === "list" && filteredDarkhouses.length > ROWS_PER_PAGE) ||
                  (activeTab === "managers" && filteredManagers.length > ROWS_PER_PAGE) ||
                  (activeTab === "assign" && filteredAssignedProducts.length > ROWS_PER_PAGE)) && (
                    <div className="dkh-pagination">
                        <span className="dkh-pagination__info">
                            Showing <strong>{
                                activeTab === "list" ? Math.min(filteredDarkhouses.length, (dhPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "managers" ? Math.min(filteredManagers.length, (mPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(filteredAssignedProducts.length, (apPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activeTab === "list" ? Math.min(filteredDarkhouses.length, dhPage * ROWS_PER_PAGE) :
                                activeTab === "managers" ? Math.min(filteredManagers.length, mPage * ROWS_PER_PAGE) :
                                Math.min(filteredAssignedProducts.length, apPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activeTab === "list" ? filteredDarkhouses.length :
                                activeTab === "managers" ? filteredManagers.length :
                                filteredAssignedProducts.length
                            }</strong> hub entries
                        </span>

                        <div className="dkh-pagination__controls">
                            <button
                                className="dkh-page-btn"
                                onClick={() => {
                                    if (activeTab === "list") setDhPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "managers") setMPage(p => Math.max(1, p - 1));
                                    else setApPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activeTab === "list" ? dhPage === 1 :
                                    activeTab === "managers" ? mPage === 1 :
                                    apPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length:
                                activeTab === "list" ? Math.ceil(filteredDarkhouses.length / ROWS_PER_PAGE) :
                                activeTab === "managers" ? Math.ceil(filteredManagers.length / ROWS_PER_PAGE) :
                                Math.ceil(filteredAssignedProducts.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`dkh-page-btn dkh-page-num ${
                                        (activeTab === "list" && dhPage === page) ||
                                        (activeTab === "managers" && mPage === page) ||
                                        (activeTab === "assign" && apPage === page)
                                            ? "dkh-page-num--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeTab === "list") setDhPage(page);
                                        else if (activeTab === "managers") setMPage(page);
                                        else setApPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="dkh-page-btn"
                                onClick={() => {
                                    if (activeTab === "list") setDhPage(p => Math.min(Math.ceil(filteredDarkhouses.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "managers") setMPage(p => Math.min(Math.ceil(filteredManagers.length / ROWS_PER_PAGE), p + 1));
                                    else setApPage(p => Math.min(Math.ceil(filteredAssignedProducts.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activeTab === "list" ? dhPage === Math.ceil(filteredDarkhouses.length / ROWS_PER_PAGE) :
                                    activeTab === "managers" ? mPage === Math.ceil(filteredManagers.length / ROWS_PER_PAGE) :
                                    apPage === Math.ceil(filteredAssignedProducts.length / ROWS_PER_PAGE)
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
                <div className="dkh-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="dkh-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="dkh-modal-header">
                            <div className="dkh-modal-header__icon-wrap">
                                {modalType.startsWith("dh") ? <Building size={18} /> : modalType.startsWith("mgr") ? <Users size={18} /> : <PackagePlus size={18} />}
                            </div>
                            <div className="dkh-modal-header__text-block">
                                <h3 className="dkh-modal-title">
                                    {modalType === "dh-view" && "Darkhouse Hub Overview"}
                                    {modalType === "dh-add" && "Register New Fronting Darkhouse"}
                                    {modalType === "dh-edit" && "Modify Darkhouse Details"}
                                    {modalType === "mgr-edit" && "Modify Manager Contacts"}
                                    {modalType === "mgr-assign" && "Assign Hub Linkage"}
                                    {modalType === "ap-assign" && "Allocate Product Stock"}
                                    {modalType === "ap-bulk" && "Bulk Allocation Parameters"}
                                </h3>
                                <span className="dkh-modal-subtitle">
                                    {selectedItem?.id || selectedItem?.name || "Allocation Operations"}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="dkh-modal-body">
                            
                            {/* 1. View Darkhouse details */}
                            {modalType === "dh-view" && selectedItem && (
                                <div className="dkh-details-sheet">
                                    <div className="details-row"><span className="details-label">Darkhouse Name:</span><span className="details-val">{selectedItem.name}</span></div>
                                    <div className="details-row"><span className="details-label">Hub Code:</span><span className="details-val font-mono">{selectedItem.code}</span></div>
                                    <div className="details-row"><span className="details-label">City Region:</span><span className="details-val">{selectedItem.city}</span></div>
                                    <div className="details-row"><span className="details-label">Physical Address:</span><span className="details-val">{selectedItem.address}</span></div>
                                    <div className="details-row"><span className="details-label">Manager assigned:</span><span className="details-val">{selectedItem.manager}</span></div>
                                    <div className="details-row"><span className="details-label">Phone Contacts:</span><span className="details-val">{selectedItem.phone}</span></div>
                                    <div className="details-row"><span className="details-label">Capacity status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                </div>
                            )}

                            {/* 2. Add Darkhouse */}
                            {modalType === "dh-add" && (
                                <form id="dh-add-form" onSubmit={handleDhAddSubmit} className="dkh-modal-form">
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhName">Darkhouse Hub Name</label>
                                        <input type="text" id="formDhName" placeholder="e.g. HAATZA Koramangala Hub" value={formDhName} onChange={(e) => setFormDhName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCode">Hub Code</label>
                                        <input type="text" id="formDhCode" placeholder="e.g. BLR-KOR-01" value={formDhCode} onChange={(e) => setFormDhCode(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCity">City Region</label>
                                        <select id="formDhCity" value={formDhCity} onChange={(e) => setFormDhCity(e.target.value)}>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhAddress">Physical Address</label>
                                        <input type="text" id="formDhAddress" placeholder="12th Main Road, Koramangala..." value={formDhAddress} onChange={(e) => setFormDhAddress(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhManager">Manager Assigned</label>
                                        <select id="formDhManager" value={formDhManager} onChange={(e) => setFormDhManager(e.target.value)}>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPhone">Phone Contacts</label>
                                        <input type="text" id="formDhPhone" placeholder="+91 98765 01234" value={formDhPhone} onChange={(e) => setFormDhPhone(e.target.value)} required />
                                    </div>
                                </form>
                            )}

                            {/* 3. Edit Darkhouse */}
                            {modalType === "dh-edit" && (
                                <form id="dh-edit-form" onSubmit={handleDhEditSubmit} className="dkh-modal-form">
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhName">Darkhouse Hub Name</label>
                                        <input type="text" id="formDhName" value={formDhName} onChange={(e) => setFormDhName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCode">Hub Code</label>
                                        <input type="text" id="formDhCode" value={formDhCode} onChange={(e) => setFormDhCode(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCity">City Region</label>
                                        <select id="formDhCity" value={formDhCity} onChange={(e) => setFormDhCity(e.target.value)}>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhAddress">Physical Address</label>
                                        <input type="text" id="formDhAddress" value={formDhAddress} onChange={(e) => setFormDhAddress(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhManager">Manager Assigned</label>
                                        <select id="formDhManager" value={formDhManager} onChange={(e) => setFormDhManager(e.target.value)}>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPhone">Phone Contacts</label>
                                        <input type="text" id="formDhPhone" value={formDhPhone} onChange={(e) => setFormDhPhone(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhStatus">Hub Capacity Status</label>
                                        <select id="formDhStatus" value={formDhStatus} onChange={(e) => setFormDhStatus(e.target.value)}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </form>
                            )}

                            {/* 4. Edit Manager Details */}
                            {modalType === "mgr-edit" && (
                                <form id="mgr-edit-form" onSubmit={handleMgrEditSubmit} className="dkh-modal-form">
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrName">Manager Name</label>
                                        <input type="text" id="formMgrName" value={formMgrName} onChange={(e) => setFormMgrName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrEmail">Email Address</label>
                                        <input type="email" id="formMgrEmail" value={formMgrEmail} onChange={(e) => setFormMgrEmail(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrPhone">Phone Contacts</label>
                                        <input type="text" id="formMgrPhone" value={formMgrPhone} onChange={(e) => setFormMgrPhone(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrDh">Assigned Darkhouse</label>
                                        <select id="formMgrDh" value={formMgrDh} onChange={(e) => setFormMgrDh(e.target.value)}>
                                            <option value="Unassigned">Unassigned</option>
                                            {darkhouses.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrShift">Shift Schedule</label>
                                        <select id="formMgrShift" value={formMgrShift} onChange={(e) => setFormMgrShift(e.target.value)}>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrStatus">Shift Status</label>
                                        <select id="formMgrStatus" value={formMgrStatus} onChange={(e) => setFormMgrStatus(e.target.value)}>
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>
                                    </div>
                                </form>
                            )}

                            {/* 5. Assign Manager Hub */}
                            {modalType === "mgr-assign" && (
                                <form id="mgr-assign-form" onSubmit={handleMgrAssignSubmit} className="dkh-modal-form">
                                    <p className="adjust-explainer">Associate active managers to fronting regional hubs. This automatically overrides current manager labels of the hub.</p>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formMgrAssignDh">Assigned Darkhouse</label>
                                        <select id="formMgrAssignDh" value={formMgrDh} onChange={(e) => setFormMgrDh(e.target.value)}>
                                            {darkhouses.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            )}

                            {/* 6. Mappings - Assign Product */}
                            {modalType === "ap-assign" && (
                                <form id="ap-assign-form" onSubmit={handleApAssignSubmit} className="dkh-modal-form">
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApProduct">Product Catalog Item</label>
                                        <select id="formApProduct" value={formApProduct} onChange={(e) => setFormApProduct(e.target.value)}>
                                            {MOCK_PRODUCTS.map(p => (
                                                <option key={p.id} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApDh">Regional Hub Destination</label>
                                        <select id="formApDh" value={formApDh} onChange={(e) => setFormApDh(e.target.value)}>
                                            {darkhouses.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApStock">Initial Allocation Stock</label>
                                        <input type="number" id="formApStock" value={formApStock} onChange={(e) => setFormApStock(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApReorder">Reorder Limit Threshold</label>
                                        <input type="number" id="formApReorder" value={formApReorder} onChange={(e) => setFormApReorder(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                            {/* 7. Mappings - Bulk Assign */}
                            {modalType === "ap-bulk" && (
                                <form id="ap-bulk-form" onSubmit={handleApBulkSubmit} className="dkh-modal-form">
                                    <p className="adjust-explainer font-semibold">Bulk allocate all active product lines in your catalog to a designated regional darkhouse hub at once.</p>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApDhBulk">Regional Hub Destination</label>
                                        <select id="formApDhBulk" value={formApDh} onChange={(e) => setFormApDh(e.target.value)}>
                                            {darkhouses.map(d => (
                                                <option key={d.id} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApStockBulk">Default Initial Stock Allocation</label>
                                        <input type="number" id="formApStockBulk" value={formApStock} onChange={(e) => setFormApStock(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formApReorderBulk">Default Reorder Point Threshold</label>
                                        <input type="number" id="formApReorderBulk" value={formApReorder} onChange={(e) => setFormApReorder(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="dkh-modal-footer">
                            <button className="dkh-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>

                            {modalType === "dh-add" && (
                                <button type="submit" form="dh-add-form" className="dkh-modal-submit-btn">
                                    Save Darkhouse
                                </button>
                            )}

                            {modalType === "dh-edit" && (
                                <button type="submit" form="dh-edit-form" className="dkh-modal-submit-btn">
                                    Save Changes
                                </button>
                            )}

                            {modalType === "mgr-edit" && (
                                <button type="submit" form="mgr-edit-form" className="dkh-modal-submit-btn">
                                    Save Changes
                                </button>
                            )}

                            {modalType === "mgr-assign" && (
                                <button type="submit" form="mgr-assign-form" className="dkh-modal-submit-btn">
                                    Assign Hub Manager
                                </button>
                            )}

                            {modalType === "ap-assign" && (
                                <button type="submit" form="ap-assign-form" className="dkh-modal-submit-btn">
                                    Save Allocation Map
                                </button>
                            )}

                            {modalType === "ap-bulk" && (
                                <button type="submit" form="ap-bulk-form" className="dkh-modal-submit-btn">
                                    Initiate Bulk Map
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default DarkhousesPage;
