import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
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
    Tag,
    ArrowUpDown
} from "lucide-react";
import { INITIAL_DARKHOUSES, CITIES, WAREHOUSE_CAPABILITIES, refreshDarkhouses } from "../../data/darkhouses";
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

    React.useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch("https://www.haatza.com/_functions/getWarehouses?page=1&limit=100");
                if (!res.ok) throw new Error("HTTP error " + res.status);
                const data = await res.json();
                if (data.status && Array.isArray(data.data)) {
                    const mapped = data.data.map(item => {
                        const normType = (item.warehouseType === "DARK_STORE" || item.warehouseType === "Lite" || item.warehouseType === "DARK_HOUSE") ? "DARK_HOUSE" : "MAIN_WAREHOUSE";
                        const normStatus = item.status ? item.status.toUpperCase() : "ACTIVE";
                        return {
                            ...item,
                            id: item.warehouseId,
                            warehouseId: item.warehouseId,
                            name: item.warehouseName,
                            warehouseName: item.warehouseName,
                            type: normType,
                            warehouseType: normType,
                            capabilities: [normType],
                            code: item.franchiseCode,
                            franchiseCode: item.franchiseCode,
                            ownerPhone: item.contactPhone,
                            contactPhone: item.contactPhone,
                            ownerEmail: item.contactEmail,
                            contactEmail: item.contactEmail,
                            serviceRadius: item.serviceRadiusKm,
                            serviceRadiusKm: item.serviceRadiusKm,
                            startTime: item.operatingStartTime ? item.operatingStartTime.substring(0, 5) : "08:00",
                            operatingStartTime: item.operatingStartTime ? item.operatingStartTime.substring(0, 5) : "08:00",
                            endTime: item.operatingEndTime ? item.operatingEndTime.substring(0, 5) : "22:00",
                            operatingEndTime: item.operatingEndTime ? item.operatingEndTime.substring(0, 5) : "22:00",
                            manager: item.accountManager || "N/A",
                            accountManager: item.accountManager || "N/A",
                            phone: item.managerPhone || "N/A",
                            managerPhone: item.managerPhone || "N/A",
                            address: `${item.addressLine1 || ""}${item.addressLine2 ? ', ' + item.addressLine2 : ''}, ${item.city || ""}, ${item.state || ""} - ${item.pincode || ""}`,
                            status: normStatus,
                            avatarColor: ["avatar-indigo", "avatar-teal", "avatar-purple", "avatar-cyan", "avatar-rose", "avatar-amber"][Math.floor(Math.random() * 6)]
                        };
                    });
                    setDarkhouses(mapped);
                }
            } catch (err) {
                console.error("Failed to load warehouses from API", err);
            }
        };
        fetchWarehouses();
    }, []);

    React.useEffect(() => {
        localStorage.setItem("haatza_darkhouses", JSON.stringify(darkhouses));
        refreshDarkhouses();
    }, [darkhouses]);

    const [activeRowMenuId, setActiveRowMenuId] = useState(null);

    // Filters for Darkhouse List
    const [dhSearch, setDhSearch] = useState("");
    const [dhCity, setDhCity] = useState("All");
    const [dhCapability, setDhCapability] = useState("All");
    const [dhSortBy, setDhSortBy] = useState(null);
    const [dhSortOrder, setDhSortOrder] = useState("asc");
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

    // Submission loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields - Warehouse List (Refactored)
    const [formDhName, setFormDhName] = useState("");
    const [formDhType, setFormDhType] = useState("MAIN_WAREHOUSE");
    const [formDhCode, setFormDhCode] = useState("");
    const [formDhStatus, setFormDhStatus] = useState("ACTIVE");
    
    // Owner Info
    const [formDhOwnerName, setFormDhOwnerName] = useState("");
    const [formDhOwnerPhone, setFormDhOwnerPhone] = useState("");
    const [formDhOwnerEmail, setFormDhOwnerEmail] = useState("");
    
    // Address Info
    const [formDhAddressLine1, setFormDhAddressLine1] = useState("");
    const [formDhAddressLine2, setFormDhAddressLine2] = useState("");
    const [formDhState, setFormDhState] = useState("Karnataka");
    const [formDhCity, setFormDhCity] = useState("Bangalore");
    const [formDhPincode, setFormDhPincode] = useState("");
    
    // Geo Location
    const [formDhLatitude, setFormDhLatitude] = useState("");
    const [formDhLongitude, setFormDhLongitude] = useState("");
    
    // Operations
    const [formDhServiceRadius, setFormDhServiceRadius] = useState(10);
    const [formDhStartTime, setFormDhStartTime] = useState("09:00");
    const [formDhEndTime, setFormDhEndTime] = useState("22:00");
    const [formDhOperatingDays, setFormDhOperatingDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
    
    // Management
    const [formDhManager, setFormDhManager] = useState("");
    const [formDhPhone, setFormDhPhone] = useState("");

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
        setTimeout(() => {
            setDhPage(1);
            setMPage(1);
            setApPage(1);
            setDhCapability("All");
            setActiveRowMenuId(null);
        }, 0);
    }, [activeTab]);

    // Lock scroll on body when modal is open
    useEffect(() => {
        if (isModalOpen) {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prevOverflow;
            };
        }
    }, [isModalOpen]);

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
            const matchesSearch = 
                d.name.toLowerCase().includes(dhSearch.toLowerCase()) || 
                d.code.toLowerCase().includes(dhSearch.toLowerCase()) || 
                (d.ownerName || "").toLowerCase().includes(dhSearch.toLowerCase()) ||
                d.city.toLowerCase().includes(dhSearch.toLowerCase()) ||
                d.manager.toLowerCase().includes(dhSearch.toLowerCase()) ||
                (d.type || "").toLowerCase().includes(dhSearch.toLowerCase());
            const matchesCity = dhCity === "All" || d.city === dhCity;
            const matchesCapability = dhCapability === "All" || d.type === dhCapability || (d.capabilities && d.capabilities.includes(dhCapability));
            return matchesSearch && matchesCity && matchesCapability;
        });
    }, [darkhouses, dhSearch, dhCity, dhCapability]);

    const sortedDarkhouses = useMemo(() => {
        let items = [...filteredDarkhouses];
        if (dhSortBy) {
            items.sort((a, b) => {
                const valA = dhSortBy === "capabilities" ? (a.capabilities || []).join(", ") : (a[dhSortBy] || "");
                const valB = dhSortBy === "capabilities" ? (b.capabilities || []).join(", ") : (b[dhSortBy] || "");
                if (valA < valB) return dhSortOrder === "asc" ? -1 : 1;
                if (valA > valB) return dhSortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filteredDarkhouses, dhSortBy, dhSortOrder]);

    const paginatedDarkhouses = useMemo(() => {
        const start = (dhPage - 1) * ROWS_PER_PAGE;
        return sortedDarkhouses.slice(start, start + ROWS_PER_PAGE);
    }, [sortedDarkhouses, dhPage]);

    const handleDhSort = (field) => {
        if (dhSortBy === field) {
            setDhSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setDhSortBy(field);
            setDhSortOrder("asc");
        }
    };

    const dhStats = useMemo(() => {
        const total = darkhouses.length;
        const active = darkhouses.filter(d => (d.status || "").toUpperCase() === "ACTIVE").length;
        const inactive = darkhouses.filter(d => (d.status || "").toUpperCase() === "INACTIVE" || (d.status || "").toUpperCase() === "UNDER_MAINTENANCE" || (d.status || "").toUpperCase() === "UNDER MAINTENANCE").length;
        const main = darkhouses.filter(d => (d.warehouseType || d.type) === "MAIN_WAREHOUSE").length;
        const darkHouse = darkhouses.filter(d => (d.warehouseType || d.type) === "DARK_HOUSE").length;
        return { total, active, inactive, main, darkHouse };
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
        setFormDhType("MAIN_WAREHOUSE");
        setFormDhCode("");
        setFormDhStatus("ACTIVE");
        setFormDhOwnerName("");
        setFormDhOwnerPhone("");
        setFormDhOwnerEmail("");
        setFormDhAddressLine1("");
        setFormDhAddressLine2("");
        setFormDhState("Karnataka");
        setFormDhCity("Bangalore");
        setFormDhPincode("");
        setFormDhLatitude("");
        setFormDhLongitude("");
        setFormDhServiceRadius(10);
        setFormDhStartTime("09:00");
        setFormDhEndTime("22:00");
        setFormDhOperatingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
        setFormDhManager(managers[0]?.name || "");
        setFormDhPhone(managers[0]?.phone || "");
        setModalType("dh-add");
        setIsModalOpen(true);
    };

    const openDhEdit = (dh) => {
        setSelectedItem(dh);
        setFormDhName(dh.warehouseName || dh.name || "");
        setFormDhType(dh.warehouseType || dh.type || (dh.capabilities && dh.capabilities[0]) || "MAIN_WAREHOUSE");
        setFormDhCode(dh.franchiseCode || dh.code || "");
        setFormDhStatus(dh.status || "ACTIVE");
        setFormDhOwnerName(dh.ownerName || "");
        setFormDhOwnerPhone(dh.contactPhone || dh.ownerPhone || dh.phone || "");
        setFormDhOwnerEmail(dh.contactEmail || dh.ownerEmail || "");
        setFormDhAddressLine1(dh.addressLine1 || dh.address || "");
        setFormDhAddressLine2(dh.addressLine2 || "");
        setFormDhState(dh.state || "Karnataka");
        setFormDhCity(dh.city || "Bangalore");
        setFormDhPincode(dh.pincode || "");
        setFormDhLatitude(dh.latitude || "");
        setFormDhLongitude(dh.longitude || "");
        setFormDhServiceRadius(dh.serviceRadiusKm || dh.serviceRadius || 10);
        setFormDhStartTime(dh.operatingStartTime || dh.startTime || "09:00");
        setFormDhEndTime(dh.operatingEndTime || dh.endTime || "22:00");
        setFormDhOperatingDays(dh.operatingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
        setFormDhManager(dh.accountManager || dh.manager || "");
        setFormDhPhone(dh.managerPhone || dh.phone || "");
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
    // Geolocation capture handler
    const handleCaptureLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by this browser.");
            setFormDhLatitude("12.9716");
            setFormDhLongitude("77.5946");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormDhLatitude(position.coords.latitude.toFixed(6));
                setFormDhLongitude(position.coords.longitude.toFixed(6));
                showToast("Location captured successfully!");
            },
            (error) => {
                setFormDhLatitude("12.9716");
                setFormDhLongitude("77.5946");
                showToast("Unable to retrieve location. Using Bangalore fallback coordinates.");
            }
        );
    };

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // ─── Modal Form Actions ───────────────────────────────────────────────────
    const handleDhAddSubmit = async (e) => {
        e.preventDefault();
        
        if (!formDhName.trim()) {
            showToast("Warehouse Name is required");
            return;
        }
        if (!formDhType.trim()) {
            showToast("Warehouse Type is required");
            return;
        }
        if (!formDhOwnerName.trim()) {
            showToast("Owner Name is required");
            return;
        }
        const cleanPhone = formDhOwnerPhone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            showToast("Owner Phone must be at least 10 digits");
            return;
        }
        if (!formDhOwnerEmail.trim() || !isValidEmail(formDhOwnerEmail)) {
            showToast("Please provide a valid contact email");
            return;
        }
        if (!formDhCity.trim()) {
            showToast("City is required");
            return;
        }
        if (!formDhState.trim()) {
            showToast("State is required");
            return;
        }
        if (!formDhPincode.trim()) {
            showToast("Pincode is required");
            return;
        }
        if (!formDhStartTime) {
            showToast("Operating Start Time is required");
            return;
        }
        if (!formDhEndTime) {
            showToast("Operating End Time is required");
            return;
        }
        if (!formDhManager) {
            showToast("Please assign a Manager");
            return;
        }
        if (formDhOperatingDays.length === 0) {
            showToast("Please select at least one operating day");
            return;
        }

        if (isSubmitting) return;

        const payload = {
            warehouseName: formDhName,
            warehouseType: formDhType,
            franchiseCode: formDhCode,
            ownerName: formDhOwnerName,
            contactPhone: formDhOwnerPhone,
            contactEmail: formDhOwnerEmail,
            addressLine1: formDhAddressLine1,
            addressLine2: formDhAddressLine2,
            city: formDhCity,
            state: formDhState,
            pincode: formDhPincode,
            latitude: parseFloat(formDhLatitude) || 0.0,
            longitude: parseFloat(formDhLongitude) || 0.0,
            serviceRadiusKm: parseInt(formDhServiceRadius) || 10,
            status: formDhStatus,
            operatingStartTime: formDhStartTime,
            operatingEndTime: formDhEndTime,
            accountManager: formDhManager,
            managerPhone: formDhPhone
        };

        try {
            setIsSubmitting(true);
            const res = await fetch("https://www.haatza.com/_functions/createWarehouse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.status) {
                showToast("Warehouse created successfully");
                const newWh = {
                    ...data.data,
                    // Keep compatibility properties for older components
                    id: data.data.warehouseId,
                    name: data.data.warehouseName,
                    type: data.data.warehouseType,
                    code: data.data.franchiseCode,
                    ownerPhone: data.data.contactPhone,
                    ownerEmail: data.data.contactEmail,
                    serviceRadius: data.data.serviceRadiusKm,
                    startTime: data.data.operatingStartTime,
                    endTime: data.data.operatingEndTime,
                    manager: data.data.accountManager,
                    phone: data.data.managerPhone,
                    address: `${data.data.addressLine1}${data.data.addressLine2 ? ', ' + data.data.addressLine2 : ''}, ${data.data.city}, ${data.data.state} - ${data.data.pincode}`,
                    avatarColor: ["avatar-indigo", "avatar-teal", "avatar-purple", "avatar-cyan", "avatar-rose", "avatar-amber"][Math.floor(Math.random() * 6)]
                };
                setDarkhouses(prev => [newWh, ...prev]);
                setIsModalOpen(false);
            } else {
                showToast(data.message || "Failed to create warehouse");
            }
        } catch (error) {
            showToast(error.message || "Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDhEditSubmit = async (e) => {
        e.preventDefault();
        if (!formDhName.trim()) {
            showToast("Warehouse Name is required");
            return;
        }
        if (!formDhCode.trim()) {
            showToast("Franchise Code is required");
            return;
        }
        if (!formDhOwnerName.trim()) {
            showToast("Owner Name is required");
            return;
        }
        const cleanPhone = formDhOwnerPhone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            showToast("Owner Phone must be at least 10 digits");
            return;
        }
        if (!formDhOwnerEmail.trim() || !isValidEmail(formDhOwnerEmail)) {
            showToast("Please provide a valid Owner Email address");
            return;
        }
        if (!formDhAddressLine1.trim()) {
            showToast("Address Line 1 is required");
            return;
        }
        if (!formDhState.trim()) {
            showToast("State is required");
            return;
        }
        if (!formDhCity.trim()) {
            showToast("City is required");
            return;
        }
        if (!formDhPincode.trim() || formDhPincode.length < 5) {
            showToast("Please provide a valid Pincode");
            return;
        }
        if (!formDhManager) {
            showToast("Please assign a Manager");
            return;
        }
        if (formDhOperatingDays.length === 0) {
            showToast("Please select at least one operating day");
            return;
        }

        if (isSubmitting) return;

        const payload = {
            tableId: selectedItem.tableId || selectedItem.id,
            warehouseId: selectedItem.warehouseId,
            addressLine1: formDhAddressLine1,
            city: formDhCity,
            managerPhone: formDhPhone,
            latitude: parseFloat(formDhLatitude) || 0.0,
            state: formDhState,
            warehouseName: formDhName,
            warehouseType: formDhType,
            longitude: parseFloat(formDhLongitude) || 0.0,
            accountManager: formDhManager,
            contactEmail: formDhOwnerEmail,
            franchiseCode: formDhCode,
            status: formDhStatus,
            addressLine2: formDhAddressLine2,
            ownerName: formDhOwnerName,
            operatingStartTime: formDhStartTime,
            operatingEndTime: formDhEndTime,
            contactPhone: formDhOwnerPhone,
            pincode: formDhPincode,
            serviceRadiusKm: parseInt(formDhServiceRadius) || 10
        };

        try {
            setIsSubmitting(true);
            const res = await fetch("https://www.haatza.com/_functions/updateWarehouse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.status) {
                showToast("Warehouse updated successfully");
                const updatedWh = {
                    ...data.data,
                    // Keep compatibility properties for older components
                    id: data.data.warehouseId,
                    name: data.data.warehouseName,
                    type: data.data.warehouseType,
                    code: data.data.franchiseCode,
                    ownerPhone: data.data.contactPhone,
                    ownerEmail: data.data.contactEmail,
                    serviceRadius: data.data.serviceRadiusKm,
                    startTime: data.data.operatingStartTime,
                    endTime: data.data.operatingEndTime,
                    manager: data.data.accountManager,
                    phone: data.data.managerPhone,
                    address: `${data.data.addressLine1}${data.data.addressLine2 ? ', ' + data.data.addressLine2 : ''}, ${data.data.city}, ${data.data.state} - ${data.data.pincode}`,
                    avatarColor: selectedItem.avatarColor || "avatar-indigo"
                };

                setDarkhouses(prev => prev.map(d => {
                    if (d.id === selectedItem.id || d.warehouseId === selectedItem.warehouseId || d.tableId === selectedItem.tableId) {
                        return updatedWh;
                    }
                    return d;
                }));
                setIsModalOpen(false);
            } else {
                showToast(data.message || "Failed to update warehouse");
            }
        } catch (error) {
            showToast(error.message || "Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
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

    const handleToggleDhStatus = async (id) => {
        const warehouse = darkhouses.find(d => d.id === id || d.warehouseId === id);
        if (!warehouse) return;

        const nextStatus = (warehouse.status || "").toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        const payload = {
            tableId: warehouse.tableId || warehouse.id,
            warehouseId: warehouse.warehouseId,
            addressLine1: warehouse.addressLine1 || "",
            city: warehouse.city || "",
            managerPhone: warehouse.managerPhone || warehouse.phone || "",
            latitude: warehouse.latitude || 0.0,
            state: warehouse.state || "",
            warehouseName: warehouse.warehouseName || warehouse.name || "",
            warehouseType: warehouse.warehouseType || warehouse.type || "MAIN_WAREHOUSE",
            longitude: warehouse.longitude || 0.0,
            accountManager: warehouse.accountManager || warehouse.manager || "",
            contactEmail: warehouse.contactEmail || warehouse.ownerEmail || "",
            franchiseCode: warehouse.franchiseCode || warehouse.code || "",
            status: nextStatus,
            addressLine2: warehouse.addressLine2 || "",
            ownerName: warehouse.ownerName || "",
            operatingStartTime: warehouse.operatingStartTime || warehouse.startTime || "09:00",
            operatingEndTime: warehouse.operatingEndTime || warehouse.endTime || "22:00",
            contactPhone: warehouse.contactPhone || warehouse.ownerPhone || "",
            pincode: warehouse.pincode || "",
            serviceRadiusKm: warehouse.serviceRadiusKm || warehouse.serviceRadius || 10
        };

        try {
            const res = await fetch("https://www.haatza.com/_functions/updateWarehouse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.status) {
                showToast(`Toggled ${warehouse.warehouseName || warehouse.name} status to ${nextStatus}`);
                const updatedWh = {
                    ...data.data,
                    // Keep compatibility properties for older components
                    id: data.data.warehouseId,
                    name: data.data.warehouseName,
                    type: data.data.warehouseType,
                    code: data.data.franchiseCode,
                    ownerPhone: data.data.contactPhone,
                    ownerEmail: data.data.contactEmail,
                    serviceRadius: data.data.serviceRadiusKm,
                    startTime: data.data.operatingStartTime,
                    endTime: data.data.operatingEndTime,
                    manager: data.data.accountManager,
                    phone: data.data.managerPhone,
                    address: `${data.data.addressLine1}${data.data.addressLine2 ? ', ' + data.data.addressLine2 : ''}, ${data.data.city}, ${data.data.state} - ${data.data.pincode}`,
                    avatarColor: warehouse.avatarColor || "avatar-indigo"
                };
                setDarkhouses(prev => prev.map(d => {
                    if (d.id === id || d.warehouseId === id || d.tableId === warehouse.tableId) {
                        return updatedWh;
                    }
                    return d;
                }));
            } else {
                showToast(data.message || "Failed to update warehouse status");
            }
        } catch (error) {
            showToast(error.message || "Network error occurred");
        }
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

    // Type badge mapping helper
    const getTypeBadgeClass = (type) => {
        const normType = (type || "").toUpperCase();
        if (normType === "MAIN_WAREHOUSE") {
            return "dkh-type-badge dkh-type-badge--main";
        } else if (normType === "DARK_HOUSE" || normType === "DARK_STORE") {
            return "dkh-type-badge dkh-type-badge--darkhouse";
        }
        return "dkh-type-badge";
    };

    // UI badges helper
    const getStatusClass = (status) => {
        const normStatus = (status || "").toUpperCase();
        switch (normStatus) {
            case "ACTIVE":
            case "IN STOCK":
                return "dkh-badge dkh-badge-active";
            case "LOW STOCK":
            case "UNDER_MAINTENANCE":
            case "UNDER MAINTENANCE":
                return "dkh-badge dkh-badge-warning";
            case "INACTIVE":
            case "ON LEAVE":
            case "OUT OF STOCK":
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
                        {activeTab === "list" && "HAATZA Warehouse Hubs"}
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
                            <span>Create Warehouse</span>
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
                                <Warehouse size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.total}</span>
                                <span className="dkh-summary-card__label">Total Warehouses</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--success">
                                <Building size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.main}</span>
                                <span className="dkh-summary-card__label">Main Warehouses</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--danger">
                                <Warehouse size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.darkHouse}</span>
                                <span className="dkh-summary-card__label">Dark Houses</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--success">
                                <CheckCircle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.active}</span>
                                <span className="dkh-summary-card__label">Active</span>
                            </div>
                        </div>
                        <div className="dkh-summary-card">
                            <div className="dkh-summary-card__icon-wrap dkh-summary-card__icon-wrap--warning">
                                <XCircle size={20} />
                            </div>
                            <div className="dkh-summary-card__body">
                                <span className="dkh-summary-card__value">{dhStats.inactive}</span>
                                <span className="dkh-summary-card__label">Inactive</span>
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
                            Warehouse List
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
                                <select
                                    className="dkh-toolbar-select"
                                    value={dhCapability}
                                    onChange={(e) => { setDhCapability(e.target.value); setDhPage(1); }}
                                >
                                    <option value="All">All Types</option>
                                    {WAREHOUSE_CAPABILITIES.map(cap => (
                                        <option key={cap} value={cap}>{cap}</option>
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
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th 
                                            onClick={() => handleDhSort('warehouseType')} 
                                            className="sortable-header" 
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                        >
                                            Type <ArrowUpDown size={12} className="sort-icon" />
                                        </th>
                                        <th>City</th>
                                        <th>Account Manager</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDarkhouses.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="dkh-empty">
                                                No warehouse hubs found matching filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDarkhouses.map((dh, index) => (
                                            <tr key={dh.warehouseId || dh.id} className="darkhouse-row-hover">
                                                <td className="dkh-td--code font-mono">{dh.warehouseId || dh.id}</td>
                                                <td className="dkh-td--name">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{dh.warehouseName || dh.name}</span>
                                                        <div className="dkh-tooltip-content">{dh.warehouseName || dh.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getTypeBadgeClass(dh.warehouseType || dh.type)}>
                                                        {(dh.warehouseType || dh.type) === "MAIN_WAREHOUSE" ? "Main Warehouse" :
                                                         (dh.warehouseType || dh.type) === "DARK_HOUSE" ? "Dark House" :
                                                         (dh.warehouseType || dh.type)}
                                                    </span>
                                                </td>
                                                <td><span className="dkh-city-badge">{dh.city}</span></td>
                                                <td className="dkh-td--manager">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">
                                                            <span className="dkh-manager-initials-pill">
                                                                {getInitials(dh.accountManager || dh.manager)}
                                                            </span>
                                                            {dh.accountManager || dh.manager}
                                                        </span>
                                                        <div className="dkh-tooltip-content">{dh.accountManager || dh.manager}</div>
                                                    </div>
                                                </td>
                                                <td><span className={getStatusClass(dh.status)}>{dh.status}</span></td>
                                                <td style={{ position: "relative" }}>
                                                    <button className="dkh-row-action-btn" onClick={(e) => toggleRowMenu(dh.warehouseId || dh.id, e)}>
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {activeRowMenuId === (dh.warehouseId || dh.id) && (
                                                        <>
                                                            <div className="global-dropdown-overlay" onClick={() => setActiveRowMenuId(null)} />
                                                            <div 
                                                                className="global-action-dropdown"
                                                                style={index >= paginatedDarkhouses.length - 2 && paginatedDarkhouses.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                            >
                                                                <button className="global-dropdown-item" onClick={() => openDhView(dh)}>
                                                                    <Eye size={13} />
                                                                    <span>View Details</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => openDhEdit(dh)}>
                                                                    <Edit2 size={13} />
                                                                    <span>Edit Hub</span>
                                                                </button>
                                                                <div className="global-dropdown-divider"></div>
                                                                <button className="global-dropdown-item" onClick={() => handleToggleDhStatus(dh.warehouseId || dh.id)}>
                                                                    <CheckCircle size={13} />
                                                                    <span>{dh.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
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
                                        paginatedManagers.map((mgr, index) => (
                                            <tr key={mgr.id} className="darkhouse-row-hover">
                                                <td>
                                                    <div className={`odt-avatar ${mgr.avatarColor || "avatar-indigo"}`}>
                                                        {mgr.initials}
                                                    </div>
                                                </td>
                                                <td className="dkh-td--name">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{mgr.name}</span>
                                                        <div className="dkh-tooltip-content">{mgr.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate dkh-manager-detail-tag">
                                                            <Mail size={12} />
                                                            {mgr.email}
                                                        </span>
                                                        <div className="dkh-tooltip-content">{mgr.email}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="dkh-manager-detail-tag">
                                                        <Phone size={12} />
                                                        {mgr.phone}
                                                    </span>
                                                </td>
                                                <td className="dkh-td--manager">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{mgr.darkhouse}</span>
                                                        <div className="dkh-tooltip-content">{mgr.darkhouse}</div>
                                                    </div>
                                                </td>
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
                                                            <div 
                                                                className="global-action-dropdown"
                                                                style={index >= paginatedManagers.length - 2 && paginatedManagers.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                            >
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
                                                <td className="dkh-td--name">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{item.product}</span>
                                                        <div className="dkh-tooltip-content">{item.product}</div>
                                                    </div>
                                                </td>
                                                <td className="dkh-td--code">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{item.sku}</span>
                                                        <div className="dkh-tooltip-content font-mono">{item.sku}</div>
                                                    </div>
                                                </td>
                                                <td><span className="dkh-city-badge">{item.category}</span></td>
                                                <td className="dkh-td--manager">
                                                    <div className="dkh-tooltip-wrapper">
                                                        <span className="dkh-truncate">{item.darkhouse}</span>
                                                        <div className="dkh-tooltip-content">{item.darkhouse}</div>
                                                    </div>
                                                </td>
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
            {isModalOpen && createPortal(
                <div className="dkh-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="dkh-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="dkh-modal-header">
                            <div className="dkh-modal-header__left">
                                <div className="dkh-modal-header__icon-wrap">
                                    {modalType.startsWith("dh") ? <Building size={18} /> : modalType.startsWith("mgr") ? <Users size={18} /> : <PackagePlus size={18} />}
                                </div>
                                <div className="dkh-modal-header__text-block">
                                    <h3 className="dkh-modal-title">
                                        {modalType === "dh-view" && "Warehouse Hub Overview"}
                                        {modalType === "dh-add" && "Create Warehouse"}
                                        {modalType === "dh-edit" && "Modify Warehouse Details"}
                                        {modalType === "mgr-edit" && "Modify Manager Contacts"}
                                        {modalType === "mgr-assign" && "Assign Hub Linkage"}
                                        {modalType === "ap-assign" && "Allocate Product Stock"}
                                        {modalType === "ap-bulk" && "Bulk Allocation Parameters"}
                                    </h3>
                                    <span className="dkh-modal-subtitle">
                                        {modalType === "dh-add" || modalType === "dh-edit" ? "Warehouse Registration & Allocation Operations" : (selectedItem?.id || selectedItem?.name || "Allocation Operations")}
                                    </span>
                                </div>
                            </div>
                            <button className="dkh-modal-close" onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="dkh-modal-body">
                            
                            {/* 1. View Darkhouse details */}
                            {modalType === "dh-view" && selectedItem && (
                                <div className="dkh-details-sheet" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    {/* Section 1 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase" }}>Warehouse Info</div>
                                    <div><span className="details-label">Warehouse Name</span><span className="details-val">{selectedItem.warehouseName || selectedItem.name}</span></div>
                                    <div><span className="details-label">Warehouse Type</span><span className="details-val"><span className={getTypeBadgeClass(selectedItem.warehouseType || selectedItem.type)}>{(selectedItem.warehouseType || selectedItem.type) === "MAIN_WAREHOUSE" ? "Main Warehouse" : (selectedItem.warehouseType || selectedItem.type) === "DARK_HOUSE" ? "Dark House" : (selectedItem.warehouseType || selectedItem.type)}</span></span></div>
                                    <div><span className="details-label">Franchise Code</span><span className="details-val font-mono">{selectedItem.franchiseCode || selectedItem.code}</span></div>
                                    <div><span className="details-label">Status</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>

                                    {/* Section 2 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Owner Info</div>
                                    <div><span className="details-label">Owner Name</span><span className="details-val">{selectedItem.ownerName || "N/A"}</span></div>
                                    <div><span className="details-label">Owner Phone</span><span className="details-val">{selectedItem.ownerPhone || "N/A"}</span></div>
                                    <div style={{ gridColumn: "span 2" }}><span className="details-label">Owner Email</span><span className="details-val">{selectedItem.ownerEmail || "N/A"}</span></div>

                                    {/* Section 3 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Address Info</div>
                                    <div style={{ gridColumn: "span 2" }}><span className="details-label">Address Line 1</span><span className="details-val">{selectedItem.addressLine1 || selectedItem.address || "N/A"}</span></div>
                                    <div style={{ gridColumn: "span 2" }}><span className="details-label">Address Line 2</span><span className="details-val">{selectedItem.addressLine2 || "N/A"}</span></div>
                                    <div><span className="details-label">State</span><span className="details-val">{selectedItem.state || "N/A"}</span></div>
                                    <div><span className="details-label">City</span><span className="details-val">{selectedItem.city}</span></div>
                                    <div><span className="details-label">Pincode</span><span className="details-val">{selectedItem.pincode || "N/A"}</span></div>

                                    {/* Section 4 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Geo Location</div>
                                    <div><span className="details-label">Latitude</span><span className="details-val">{selectedItem.latitude || "N/A"}</span></div>
                                    <div><span className="details-label">Longitude</span><span className="details-val">{selectedItem.longitude || "N/A"}</span></div>

                                    {/* Section 5 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Operations</div>
                                    <div><span className="details-label">Service Radius</span><span className="details-val">{selectedItem.serviceRadius ? `${selectedItem.serviceRadius} km` : "N/A"}</span></div>
                                    <div><span className="details-label">Operating Hours</span><span className="details-val">{selectedItem.startTime && selectedItem.endTime ? `${selectedItem.startTime} - ${selectedItem.endTime}` : "N/A"}</span></div>
                                    <div style={{ gridColumn: "span 2" }}>
                                        <span className="details-label">Operating Days</span>
                                        <span className="details-val" style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                            {selectedItem.operatingDays?.map(day => (
                                                <span key={day} className="dkh-city-badge" style={{ margin: 0 }}>{day}</span>
                                            )) || "N/A"}
                                        </span>
                                    </div>

                                    {/* Section 6 */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Management</div>
                                    <div><span className="details-label">Manager Assigned</span><span className="details-val">{selectedItem.manager || "N/A"}</span></div>
                                    <div><span className="details-label">Phone Contacts</span><span className="details-val">{selectedItem.phone || "N/A"}</span></div>
                                </div>
                            )}

                            {/* 2. Add Warehouse */}
                            {modalType === "dh-add" && (
                                <form id="dh-add-form" onSubmit={handleDhAddSubmit} className="dkh-modal-form">
                                    {/* Section 1: Warehouse Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "8px" }}>Section 1: Warehouse Info</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhName">Warehouse Name</label>
                                        <input type="text" id="formDhName" placeholder="e.g. HAATZA Koramangala Hub" value={formDhName} onChange={(e) => setFormDhName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhType">Warehouse Type</label>
                                        <select id="formDhType" value={formDhType} onChange={(e) => setFormDhType(e.target.value)} required>
                                            <option value="MAIN_WAREHOUSE">Main Warehouse</option>
                                            <option value="DARK_HOUSE">Dark House</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCode">Franchise Code</label>
                                        <input type="text" id="formDhCode" placeholder="e.g. BLR-KOR-01" value={formDhCode} onChange={(e) => setFormDhCode(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhStatus">Status</label>
                                        <select id="formDhStatus" value={formDhStatus} onChange={(e) => setFormDhStatus(e.target.value)} required>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                        </select>
                                    </div>

                                    {/* Section 2: Owner Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 2: Owner Info</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhOwnerName">Owner Name</label>
                                        <input type="text" id="formDhOwnerName" placeholder="e.g. Amit Sharma" value={formDhOwnerName} onChange={(e) => setFormDhOwnerName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhOwnerPhone">Owner Phone</label>
                                        <input type="text" id="formDhOwnerPhone" placeholder="e.g. +91 98765 01234" value={formDhOwnerPhone} onChange={(e) => setFormDhOwnerPhone(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhOwnerEmail">Owner Email</label>
                                        <input type="email" id="formDhOwnerEmail" placeholder="e.g. owner@haatza.com" value={formDhOwnerEmail} onChange={(e) => setFormDhOwnerEmail(e.target.value)} required />
                                    </div>

                                    {/* Section 3: Address Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 3: Address Info</div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhAddressLine1">Address Line 1</label>
                                        <input type="text" id="formDhAddressLine1" placeholder="e.g. 12th Main Road, Koramangala 3rd Block" value={formDhAddressLine1} onChange={(e) => setFormDhAddressLine1(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhAddressLine2">Address Line 2 (Optional)</label>
                                        <input type="text" id="formDhAddressLine2" placeholder="e.g. Suite 101" value={formDhAddressLine2} onChange={(e) => setFormDhAddressLine2(e.target.value)} />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhState">State</label>
                                        <input type="text" id="formDhState" placeholder="e.g. Karnataka" value={formDhState} onChange={(e) => setFormDhState(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCity">City</label>
                                        <select id="formDhCity" value={formDhCity} onChange={(e) => setFormDhCity(e.target.value)} required>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPincode">Pincode</label>
                                        <input type="text" id="formDhPincode" placeholder="e.g. 560034" value={formDhPincode} onChange={(e) => setFormDhPincode(e.target.value)} required />
                                    </div>

                                    {/* Section 4: Geo Location */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 4: Geo Location</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhLatitude">Latitude</label>
                                        <input type="text" id="formDhLatitude" placeholder="e.g. 12.9352" value={formDhLatitude} onChange={(e) => setFormDhLatitude(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhLongitude">Longitude</label>
                                        <input type="text" id="formDhLongitude" placeholder="e.g. 77.6245" value={formDhLongitude} onChange={(e) => setFormDhLongitude(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width" style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button type="button" className="dkh-action-btn-secondary" style={{ padding: "8px 16px", cursor: "pointer" }} onClick={handleCaptureLocation}>
                                            Capture Current Location
                                        </button>
                                    </div>

                                    {/* Section 5: Operations */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 5: Operations</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhServiceRadius">Service Radius (km)</label>
                                        <input type="number" id="formDhServiceRadius" placeholder="e.g. 10" value={formDhServiceRadius} onChange={(e) => setFormDhServiceRadius(parseInt(e.target.value) || 0)} required min="1" />
                                    </div>
                                    <div className="dkh-form-group" style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="formDhStartTime">Start Time</label>
                                            <input type="time" id="formDhStartTime" value={formDhStartTime} onChange={(e) => setFormDhStartTime(e.target.value)} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="formDhEndTime">End Time</label>
                                            <input type="time" id="formDhEndTime" value={formDhEndTime} onChange={(e) => setFormDhEndTime(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label>Operating Days</label>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px" }}>
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                                <label key={day} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formDhOperatingDays.includes(day)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormDhOperatingDays(prev => [...prev, day]);
                                                            } else {
                                                                setFormDhOperatingDays(prev => prev.filter(d => d !== day));
                                                            }
                                                        }}
                                                    />
                                                    <span>{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 6: Management */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 6: Management</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhManager">Manager Assigned</label>
                                        <select
                                            id="formDhManager"
                                            value={formDhManager}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                setFormDhManager(selectedName);
                                                const mObj = managers.find(m => m.name === selectedName);
                                                if (mObj) {
                                                    setFormDhPhone(mObj.phone);
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Select Manager</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.name}>
                                                    [{m.id}] {m.name} ({m.phone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPhone">Phone Contacts</label>
                                        <input type="text" id="formDhPhone" value={formDhPhone} onChange={(e) => setFormDhPhone(e.target.value)} required />
                                    </div>
                                </form>
                            )}

                            {/* 3. Edit Warehouse */}
                            {modalType === "dh-edit" && (
                                <form id="dh-edit-form" onSubmit={handleDhEditSubmit} className="dkh-modal-form">
                                    {/* Section 1: Warehouse Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "8px" }}>Section 1: Warehouse Info</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhName">Warehouse Name</label>
                                        <input type="text" id="formDhName" placeholder="e.g. HAATZA Koramangala Hub" value={formDhName} onChange={(e) => setFormDhName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhType">Warehouse Type</label>
                                        <select id="formDhType" value={formDhType} onChange={(e) => setFormDhType(e.target.value)} required>
                                            <option value="MAIN_WAREHOUSE">Main Warehouse</option>
                                            <option value="DARK_HOUSE">Dark House</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCode">Franchise Code</label>
                                        <input type="text" id="formDhCode" placeholder="e.g. BLR-KOR-01" value={formDhCode} onChange={(e) => setFormDhCode(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhStatus">Status</label>
                                        <select id="formDhStatus" value={formDhStatus} onChange={(e) => setFormDhStatus(e.target.value)} required>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                        </select>
                                    </div>

                                    {/* Section 2: Owner Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 2: Owner Info</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhOwnerName">Owner Name</label>
                                        <input type="text" id="formDhOwnerName" placeholder="e.g. Amit Sharma" value={formDhOwnerName} onChange={(e) => setFormDhOwnerName(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhOwnerPhone">Owner Phone</label>
                                        <input type="text" id="formDhOwnerPhone" placeholder="e.g. +91 98765 01234" value={formDhOwnerPhone} onChange={(e) => setFormDhOwnerPhone(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhOwnerEmail">Owner Email</label>
                                        <input type="email" id="formDhOwnerEmail" placeholder="e.g. owner@haatza.com" value={formDhOwnerEmail} onChange={(e) => setFormDhOwnerEmail(e.target.value)} required />
                                    </div>

                                    {/* Section 3: Address Info */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 3: Address Info</div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhAddressLine1">Address Line 1</label>
                                        <input type="text" id="formDhAddressLine1" placeholder="e.g. 12th Main Road, Koramangala 3rd Block" value={formDhAddressLine1} onChange={(e) => setFormDhAddressLine1(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label htmlFor="formDhAddressLine2">Address Line 2 (Optional)</label>
                                        <input type="text" id="formDhAddressLine2" placeholder="e.g. Suite 101" value={formDhAddressLine2} onChange={(e) => setFormDhAddressLine2(e.target.value)} />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhState">State</label>
                                        <input type="text" id="formDhState" placeholder="e.g. Karnataka" value={formDhState} onChange={(e) => setFormDhState(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhCity">City</label>
                                        <select id="formDhCity" value={formDhCity} onChange={(e) => setFormDhCity(e.target.value)} required>
                                            <option value="Bangalore">Bangalore</option>
                                            <option value="Mumbai">Mumbai</option>
                                            <option value="Delhi">Delhi</option>
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPincode">Pincode</label>
                                        <input type="text" id="formDhPincode" placeholder="e.g. 560034" value={formDhPincode} onChange={(e) => setFormDhPincode(e.target.value)} required />
                                    </div>

                                    {/* Section 4: Geo Location */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 4: Geo Location</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhLatitude">Latitude</label>
                                        <input type="text" id="formDhLatitude" placeholder="e.g. 12.9352" value={formDhLatitude} onChange={(e) => setFormDhLatitude(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhLongitude">Longitude</label>
                                        <input type="text" id="formDhLongitude" placeholder="e.g. 77.6245" value={formDhLongitude} onChange={(e) => setFormDhLongitude(e.target.value)} required />
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width" style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button type="button" className="dkh-action-btn-secondary" style={{ padding: "8px 16px", cursor: "pointer" }} onClick={handleCaptureLocation}>
                                            Capture Current Location
                                        </button>
                                    </div>

                                    {/* Section 5: Operations */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 5: Operations</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhServiceRadius">Service Radius (km)</label>
                                        <input type="number" id="formDhServiceRadius" placeholder="e.g. 10" value={formDhServiceRadius} onChange={(e) => setFormDhServiceRadius(parseInt(e.target.value) || 0)} required min="1" />
                                    </div>
                                    <div className="dkh-form-group" style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="formDhStartTime">Start Time</label>
                                            <input type="time" id="formDhStartTime" value={formDhStartTime} onChange={(e) => setFormDhStartTime(e.target.value)} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="formDhEndTime">End Time</label>
                                            <input type="time" id="formDhEndTime" value={formDhEndTime} onChange={(e) => setFormDhEndTime(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="dkh-form-group dkh-form-group--full-width">
                                        <label>Operating Days</label>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px" }}>
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                                <label key={day} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formDhOperatingDays.includes(day)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormDhOperatingDays(prev => [...prev, day]);
                                                            } else {
                                                                setFormDhOperatingDays(prev => prev.filter(d => d !== day));
                                                            }
                                                        }}
                                                    />
                                                    <span>{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 6: Management */}
                                    <div style={{ gridColumn: "span 2", fontWeight: "700", color: "var(--primary)", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", fontSize: "12px", textTransform: "uppercase", marginTop: "12px" }}>Section 6: Management</div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhManager">Manager Assigned</label>
                                        <select
                                            id="formDhManager"
                                            value={formDhManager}
                                            onChange={(e) => {
                                                const selectedName = e.target.value;
                                                setFormDhManager(selectedName);
                                                const mObj = managers.find(m => m.name === selectedName);
                                                if (mObj) {
                                                    setFormDhPhone(mObj.phone);
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Select Manager</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.name}>
                                                    [{m.id}] {m.name} ({m.phone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="dkh-form-group">
                                        <label htmlFor="formDhPhone">Phone Contacts</label>
                                        <input type="text" id="formDhPhone" value={formDhPhone} onChange={(e) => setFormDhPhone(e.target.value)} required />
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
                                    <div className="dkh-form-group dkh-form-group--full-width">
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
                                    <div className="dkh-form-group dkh-form-group--full-width">
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
                                <button type="submit" form="dh-add-form" className="dkh-modal-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Save Warehouse"}
                                </button>
                            )}

                            {modalType === "dh-edit" && (
                                <button type="submit" form="dh-edit-form" className="dkh-modal-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
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
                </div>,
                document.body
            )}
        </div>
    );
}

export default DarkhousesPage;
