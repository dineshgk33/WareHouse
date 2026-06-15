import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
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
    AlertCircle,
    Store,
    Sliders,
    XCircle,
    FileText,
    List,
    Clock,
    Sparkles,
    Check,
    RefreshCw
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PICKING, MOCK_PACKING, MOCK_DELIVERY } from "../../data/ordersData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import { getOrderStatusClass } from "../../utils/statusUtils";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useToast } from "../../hooks/useToast";
import { Barcode128Svg } from "../../utils/barcode";
import InvoicePreviewModal from "./InvoicePreviewModal";
import "./Orders.css";

const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
};

const getPageSize = (format) => {
    switch (format) {
        case "grid-1x1": return 1;
        case "grid-1x2": return 2;
        case "grid-2x2": return 4;
        case "grid-2x4": return 8;
        case "grid-3x4": return 12;
        case "thermal-4inch": return 1;  // Single column - 1 label per "page" (continuous)
        case "thermal-100x50": return 1; // Single column - 1 label per "page" (continuous)
        default: return 8;
    }
};

const ROWS_PER_PAGE = 7;

const getCategoryForProduct = (productName, sku = "") => {
    const name = productName.toLowerCase();
    const skuCode = sku.toUpperCase();
    if (name.includes("mango") || name.includes("fruit") || name.includes("apple") || name.includes("banana") || skuCode.startsWith("FRT")) {
        return "Fruits";
    }
    if (name.includes("milk") || name.includes("dairy") || name.includes("cheese") || name.includes("butter") || name.includes("paneer") || skuCode.startsWith("DRY")) {
        return "Dairy";
    }
    if (name.includes("fries") || name.includes("frozen") || name.includes("ice cream") || name.includes("coca-cola") || name.includes("coke") || name.includes("drink") || skuCode.startsWith("FZN") || skuCode.startsWith("DRK")) {
        return "Frozen";
    }
    if (name.includes("potato") || name.includes("tomato") || name.includes("onion") || name.includes("vegetable") || name.includes("veg") || name.includes("chips") || skuCode.startsWith("VEG") || skuCode.startsWith("SNK")) {
        return "Vegetables";
    }
    return "Frozen"; // default fallback
};

function OrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const rawTab = searchParams.get("tab") || "orders";
    
    // Normalize old "board" tab parameter to the specific page tabs
    let activeTab = rawTab;
    let initialStep = searchParams.get("step") || "all";
    if (rawTab === "board") {
        if (initialStep === "picking") activeTab = "picking";
        else if (initialStep === "packing") activeTab = "packing";
        else if (initialStep === "delivery") activeTab = "tracking";
        else activeTab = "orders";
    }
    
    // Synchronize steps based on active tabs
    let boardStep = initialStep;
    if (activeTab === "picking") boardStep = "picking";
    else if (activeTab === "packing") boardStep = "packing";
    else if (activeTab === "tracking") boardStep = "delivery";

    const activePaginationView = activeTab;

    // ─── States ───────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState(() => {
        return MOCK_ORDERS.map((o, idx) => {
            const dh = INITIAL_DARKHOUSES[idx % INITIAL_DARKHOUSES.length];
            return {
                ...o,
                warehouse: o.warehouse || dh.name,
                warehouseCode: dh.code,
                priority: o.priority || (parseInt(o.id.replace(/\D/g, "")) % 3 === 0 ? "Critical" : parseInt(o.id.replace(/\D/g, "")) % 3 === 1 ? "High" : "Normal")
            };
        });
    });
    const [picks, setPicks] = useState(MOCK_PICKING);
    const [packs, setPacks] = useState(MOCK_PACKING);
    const [deliveries, setDeliveries] = useState(MOCK_DELIVERY);

    // ─── New Restructured Module States ──────────────────────────────────────
    // Management Tab States
    const [selectedManagementIds, setSelectedManagementIds] = useState([]);
    const [bulkActionType, setBulkActionType] = useState("");
    const [managementSearch, setManagementSearch] = useState("");

    // Inspector Tab States
    const [inspectorSearch, setInspectorSearch] = useState("");
    const [selectedInspectorOrderId, setSelectedInspectorOrderId] = useState(null);
    const selectedInspectorOrder = useMemo(() => {
        return orders.find(o => o.id === selectedInspectorOrderId) || null;
    }, [orders, selectedInspectorOrderId]);

    // New Order Query Tab States
    const [queryIdInput, setQueryIdInput] = useState("");
    const [queryResult, setQueryResult] = useState(null);

    // Cancelled Orders Tab States
    const [cancelledSearch, setCancelledSearch] = useState("");
    const [processedRefunds, setProcessedRefunds] = useState([]);

    useEffect(() => {
        if (activeTab === "details" && !selectedInspectorOrderId && orders.length > 0) {
            setSelectedInspectorOrderId(orders[0].id);
        }
    }, [activeTab, orders, selectedInspectorOrderId]);

    // Dynamic Active Dropdowns (per row)
    const [activeRowMenuId, setActiveRowMenuId] = useState(null);

    // Filters Pending Orders
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingPage, setPendingPage] = useState(1);

    // Filters All Orders
    const [ordSearch, setOrdSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("All");
    const [ordPage, setOrdPage] = useState(1);

    useEffect(() => {
        if (activeTab === "orders") {
            if (boardStep === "all") setSelectedStatus("ALL");
            else if (boardStep === "pending") setSelectedStatus("Pending");
            else if (boardStep === "completed") setSelectedStatus("Delivered");
        } else if (activeTab === "picking") {
            setSelectedStatus("Picking");
        } else if (activeTab === "packing") {
            setSelectedStatus("Packing");
        } else if (activeTab === "tracking") {
            setSelectedStatus("Ready To Dispatch");
        }
    }, [activeTab, boardStep]);

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

    // Filters Label History Tab
    const [histPage, setHistPage] = useState(1);

    // Bulk selection, printing, and preview states
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [labelHistory, setLabelHistory] = useState(() => {
        try {
            const saved = localStorage.getItem("haatza_label_history");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [previewLabels, setPreviewLabels] = useState([]);
    const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
    const [labelLayoutFormat, setLabelLayoutFormat] = useState("thermal-4inch"); // thermal-4inch, thermal-100x50, or grid-2x4
    const [triggerImmediatePrint, setTriggerImmediatePrint] = useState(false);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'ord-view' | 'ord-edit' | 'pick-assign' | 'dlv-track' | 'dlv-update'
    const [selectedItem, setSelectedItem] = useState(null);

    // Invoice Modal States
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [invoiceOrder, setInvoiceOrder] = useState(null);

    // Form fields
    const [formCustomer, setFormCustomer] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formPayment, setFormPayment] = useState("");
    const [formStatus, setFormStatus] = useState("");
    const [formWarehouse, setFormWarehouse] = useState("");
    const [formPicker, setFormPicker] = useState("Ramesh Kumar");
    
    // Delivery update fields
    const [formRider, setFormRider] = useState("");
    const [formDlvStatus, setFormDlvStatus] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formEta, setFormEta] = useState("");

    const { toast, showToast } = useToast(3000);

    // ConfirmModal state for accessible order cancellation (replaces window.confirm)
    const [confirmState, setConfirmState] = useState({ open: false, orderId: null });

    // Sync label history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("haatza_label_history", JSON.stringify(labelHistory));
        } catch (e) {
            console.error("Failed to save label history to localStorage", e);
        }
    }, [labelHistory]);

    const triggerPrint = () => {
        console.log("Labels to print:", previewLabels);

        // Verify if labels exist
        if (!previewLabels || previewLabels.length === 0) {
            showToast("No labels available for printing.");
            alert("No labels available for printing.");
            return;
        }

        // Wait for labels to render inside DOM before print
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const printContainer = document.getElementById("print-sheet");
                if (!printContainer) {
                    console.error("Print container #print-sheet not found in DOM");
                    showToast("Error: Print container not found.");
                    return;
                }

                // Verify print data rendered
                const renderedLabels = printContainer.querySelectorAll(".quick-commerce-label");
                if (renderedLabels.length === 0) {
                    console.error("Print data not rendered: no label elements found inside #print-sheet");
                    showToast("Error: Print data not rendered.");
                    return;
                }

                console.log(`Print verification passed: ${renderedLabels.length} labels found in #print-sheet`);
                window.print();
            });
        });
    };

    // Handle instant print trigger
    useEffect(() => {
        if (triggerImmediatePrint && isPrintPreviewOpen && previewLabels.length > 0) {
            setTimeout(() => {
                setTriggerImmediatePrint(false);
                triggerPrint();
            }, 0);
        }
    }, [triggerImmediatePrint, isPrintPreviewOpen, previewLabels]);

    // Reset pagination when tab changes
    useEffect(() => {
        setTimeout(() => {
            setOrdPage(1);
            setPickPage(1);
            setPackPage(1);
            setDlvPage(1);
            setHistPage(1);
            setPendingPage(1);
            setPendingSearch("");
            setActiveRowMenuId(null);
            setSelectedOrderIds([]); // Clear selection when switching tabs
        }, 0);
    }, [activeTab, boardStep]);




    // Derived filtering pools
    const pickers = useMemo(() => ["All", ...new Set(picks.map(p => p.picker).filter(p => p !== "Unassigned"))], [picks]);
    const riders = useMemo(() => ["All", ...new Set(deliveries.map(d => d.rider).filter(r => r !== "Unassigned"))], [deliveries]);

    const paginatedHistory = useMemo(() => {
        const start = (histPage - 1) * ROWS_PER_PAGE;
        return labelHistory.slice(start, start + ROWS_PER_PAGE);
    }, [labelHistory, histPage]);

    // ─── 1. Filtering All Orders ──────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = o.id.toLowerCase().includes(ordSearch.toLowerCase()) || o.customer.toLowerCase().includes(ordSearch.toLowerCase());
            const matchesWarehouse = selectedWarehouseFilter === "All" || o.warehouse === selectedWarehouseFilter;
            
            let matchesStatus = false;
            if (selectedStatus === "ALL") {
                matchesStatus = true;
            } else if (selectedStatus === "Pending") {
                matchesStatus = o.status === "Pending";
            } else if (selectedStatus === "Picking") {
                matchesStatus = o.status === "Picking";
            } else if (selectedStatus === "Packing") {
                matchesStatus = o.status === "Packing";
            } else if (selectedStatus === "Ready To Dispatch") {
                matchesStatus = o.status === "Ready To Dispatch" || o.status === "Label Generated" || o.status === "Processing";
            } else if (selectedStatus === "Shipped") {
                matchesStatus = o.status === "Shipped";
            } else if (selectedStatus === "Delivered") {
                matchesStatus = o.status === "Delivered";
            }
            
            return matchesSearch && matchesStatus && matchesWarehouse;
        });
    }, [orders, ordSearch, selectedStatus, selectedWarehouseFilter]);

    const paginatedOrders = useMemo(() => {
        const start = (ordPage - 1) * ROWS_PER_PAGE;
        return filteredOrders.slice(start, start + ROWS_PER_PAGE);
    }, [filteredOrders, ordPage]);

    const ordStats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => o.status === "Pending").length;
        const picking = orders.filter(o => o.status === "Picking").length;
        const packing = orders.filter(o => o.status === "Packing").length;
        const readyToDispatch = orders.filter(o => o.status === "Ready To Dispatch" || o.status === "Label Generated" || o.status === "Processing").length;
        const shipped = orders.filter(o => o.status === "Shipped").length;
        const delivered = orders.filter(o => o.status === "Delivered").length;
        return { total, pending, picking, packing, readyToDispatch, shipped, delivered };
    }, [orders]);

    // ─── Restructured Tabs Filter States & Handlers ──────────────────────────
    // Deterministic Item Generator Helper for Details/Query Views
    const getItemsForOrder = (order) => {
        if (!order) return [];
        const idNum = parseInt((order.id || "").replace(/\D/g, "")) || 1234;
        const productsList = [
            { name: "Alphonso Mangoes Premium", sku: "FRT-ANG-01", price: 120 },
            { name: "Organic Whole Milk 1L", sku: "DRY-MILK-02", price: 65 },
            { name: "Frozen French Fries 1kg", sku: "FZN-FRIES-03", price: 149 },
            { name: "Fresh Red Apples 1kg", sku: "FRT-AAPL-04", price: 180 },
            { name: "Paneer Block Fresh 200g", sku: "DRY-PANR-05", price: 85 }
        ];
        const selected = [];
        const count = order.items || 1;
        for (let i = 0; i < count; i++) {
            const prod = productsList[(idNum + i) % productsList.length];
            selected.push({
                ...prod,
                qty: ((idNum + i) % 2) + 1
            });
        }
        return selected;
    };

    // Filters for Management
    const filteredManagementOrders = useMemo(() => {
        return orders.filter(o => {
            const query = managementSearch.toLowerCase();
            const matchesSearch = o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query);
            const matchesWarehouse = selectedWarehouseFilter === "All" || o.warehouse === selectedWarehouseFilter;
            return matchesSearch && matchesWarehouse;
        });
    }, [orders, managementSearch, selectedWarehouseFilter]);

    // Filters for Inspector List
    const filteredInspectorOrders = useMemo(() => {
        return orders.filter(o => {
            const query = inspectorSearch.toLowerCase();
            const matchesSearch = o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query);
            const matchesWarehouse = selectedWarehouseFilter === "All" || o.warehouse === selectedWarehouseFilter;
            return matchesSearch && matchesWarehouse;
        });
    }, [orders, inspectorSearch, selectedWarehouseFilter]);

    // Filters for Cancelled Orders
    const cancelledOrders = useMemo(() => {
        return orders.filter(o => o.status === "Cancelled");
    }, [orders]);

    const filteredCancelledOrders = useMemo(() => {
        return cancelledOrders.filter(o => {
            const query = cancelledSearch.toLowerCase();
            const matchesSearch = o.id.toLowerCase().includes(query) || o.customer.toLowerCase().includes(query);
            const matchesWarehouse = selectedWarehouseFilter === "All" || o.warehouse === selectedWarehouseFilter;
            return matchesSearch && matchesWarehouse;
        });
    }, [cancelledOrders, cancelledSearch, selectedWarehouseFilter]);

    // Handlers for Management
    const handleTogglePriority = (id) => {
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                const nextPriority = o.priority === "Normal" ? "High" : o.priority === "High" ? "Critical" : "Normal";
                showToast(`Priority for ${o.id} set to ${nextPriority}`);
                return { ...o, priority: nextPriority };
            }
            return o;
        }));
    };

    const handleToggleAllManagementSelect = () => {
        if (selectedManagementIds.length === filteredManagementOrders.length) {
            setSelectedManagementIds([]);
        } else {
            setSelectedManagementIds(filteredManagementOrders.map(o => o.id));
        }
    };

    const handleToggleManagementSelect = (id) => {
        setSelectedManagementIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleExecuteBulkAction = () => {
        if (selectedManagementIds.length === 0 || !bulkActionType) return;
        
        let releasedOrders = [];
        setOrders(prev => prev.map(o => {
            if (selectedManagementIds.includes(o.id)) {
                if (bulkActionType === "high-priority") {
                    return { ...o, priority: "High" };
                } else if (bulkActionType === "critical-priority") {
                    return { ...o, priority: "Critical" };
                } else if (bulkActionType === "release-picking") {
                    releasedOrders.push(o);
                    return { ...o, status: "Picking" };
                } else if (bulkActionType === "cancel") {
                    return { ...o, status: "Cancelled" };
                }
            }
            return o;
        }));

        if (releasedOrders.length > 0) {
            setPicks(prev => {
                const updated = [...prev];
                releasedOrders.forEach(o => {
                    if (!updated.some(p => p.orderId === o.id)) {
                        updated.push({
                            id: `PCK-${Math.floor(4000 + Math.random() * 1000)}`,
                            orderId: o.id,
                            customer: o.customer,
                            picker: "Unassigned",
                            productsCount: o.items || 1,
                            status: "Pending"
                        });
                    }
                });
                return updated;
            });
        }
        
        if (bulkActionType === "cancel") {
            setPicks(prev => prev.map(p => selectedManagementIds.includes(p.orderId) ? { ...p, status: "Cancelled" } : p));
            setPacks(prev => prev.map(p => selectedManagementIds.includes(p.orderId) ? { ...p, status: "Cancelled" } : p));
            setDeliveries(prev => prev.map(d => selectedManagementIds.includes(d.orderId) ? { ...d, status: "Failed" } : d));
        }

        showToast(`Successfully processed bulk '${bulkActionType}' for ${selectedManagementIds.length} orders.`);
        setSelectedManagementIds([]);
        setBulkActionType("");
    };

    // Handler for New Order Query
    const handleRunQuery = (targetId = null) => {
        const checkId = targetId || queryIdInput;
        if (!checkId) {
            showToast("Please enter an Order ID");
            return;
        }
        const found = orders.find(o => o.id.toLowerCase() === checkId.trim().toLowerCase());
        if (found) {
            setQueryResult(found);
            showToast(`Found Order ${found.id} stock allocations & dispatch routing!`);
        } else {
            setQueryResult(null);
            showToast(`Order ID '${checkId}' not found.`);
        }
    };

    // Handler for Cancelled Refunds
    const handleTriggerRefund = (id) => {
        setProcessedRefunds(prev => [...prev, id]);
        showToast(`Refund processed successfully for order ${id}. Valuation credited.`);
    };

    // Filters Pending Orders
    const filteredPendingOrders = useMemo(() => {
        return orders.filter(o => {
            if (o.status !== "Pending") return false;
            const query = pendingSearch.toLowerCase();
            const matchesId = o.id.toLowerCase().includes(query);
            const matchesCustomer = o.customer.toLowerCase().includes(query);
            const matchesMobile = o.mobile ? o.mobile.toLowerCase().includes(query) : false;
            const matchesWarehouse = selectedWarehouseFilter === "All" || o.warehouse === selectedWarehouseFilter;
            return (matchesId || matchesCustomer || matchesMobile) && matchesWarehouse;
        });
    }, [orders, pendingSearch, selectedWarehouseFilter]);

    const paginatedPendingOrders = useMemo(() => {
        const start = (pendingPage - 1) * ROWS_PER_PAGE;
        return filteredPendingOrders.slice(start, start + ROWS_PER_PAGE);
    }, [filteredPendingOrders, pendingPage]);

    // ─── 2. Filtering Picking ─────────────────────────────────────────────────
    const filteredPicks = useMemo(() => {
        return picks.filter(p => {
            const matchesSearch = p.id.toLowerCase().includes(pickSearch.toLowerCase()) || p.orderId.toLowerCase().includes(pickSearch.toLowerCase()) || p.customer.toLowerCase().includes(pickSearch.toLowerCase());
            const matchesPicker = pickPicker === "All" || p.picker === pickPicker;
            const assocOrder = orders.find(o => o.id === p.orderId);
            const matchesWarehouse = selectedWarehouseFilter === "All" || (assocOrder && assocOrder.warehouse === selectedWarehouseFilter);
            return matchesSearch && matchesPicker && matchesWarehouse;
        });
    }, [picks, pickSearch, pickPicker, orders, selectedWarehouseFilter]);

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
            const assocOrder = orders.find(o => o.id === p.orderId);
            const matchesWarehouse = selectedWarehouseFilter === "All" || (assocOrder && assocOrder.warehouse === selectedWarehouseFilter);
            return matchesSearch && matchesStatus && matchesWarehouse;
        });
    }, [packs, packSearch, packStatus, orders, selectedWarehouseFilter]);

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
            const assocOrder = orders.find(o => o.id === d.orderId);
            const matchesWarehouse = selectedWarehouseFilter === "All" || (assocOrder && assocOrder.warehouse === selectedWarehouseFilter);
            return matchesSearch && matchesRider && matchesStatus && matchesWarehouse;
        });
    }, [deliveries, dlvSearch, dlvRider, dlvStatus, orders, selectedWarehouseFilter]);

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

    // ─── Bulk Label Generation Helpers & Handlers ──────────────────────────────

    // Stable product mapping helper for generating labels based on order information
    const getLabelsForOrder = (order) => {
        const labelsCount = order.items || 1;
        const labels = [];
        
        const productsPool = [
            { id: "PRD-101", name: "Fresh Alphonso Mangoes", brand: "Organic India", weight: "1.0 kg", baseSku: "FRT-MNG-ALP" },
            { id: "PRD-102", name: "Amul Taaza Toned Milk", brand: "Amul", weight: "1.03 kg", baseSku: "DRY-MLK-TAZ" },
            { id: "PRD-103", name: "Lay's Classic Salted Chips", brand: "Britannia", weight: "50g", baseSku: "SNK-LYS-CLT" },
            { id: "PRD-104", name: "Coca-Cola Zero Sugar", brand: "Coca-Cola", weight: "320g", baseSku: "DRK-COK-ZER" },
            { id: "PRD-105", name: "McCain French Fries", brand: "Nestle", weight: "450g", baseSku: "FZN-MCN-FRS" }
        ];
        
        const warehouseList = ["Koramangala Hub", "Indiranagar Hub", "HSR Layout Depot", "GK-1 Warehouse", "Powai Depot"];
        const packedByList = ["Ramesh Kumar", "Sunita Sharma", "Amit Patel", "Suresh Singh", "Ananya Iyer"];
        
        const idNum = parseInt(order.id.replace(/\D/g, "")) || 8818;
        
        for (let i = 0; i < labelsCount; i++) {
            const prodIndex = (idNum + i) % productsPool.length;
            const whIndex = (idNum + i) % warehouseList.length;
            const pbIndex = (idNum + i) % packedByList.length;
            
            const product = productsPool[prodIndex];
            const warehouse = warehouseList[whIndex];
            const packedBy = packedByList[pbIndex];
            const batchId = `BCH-${1000 + (idNum % 9000)}-${i + 1}`;
            
            const packedDate = order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            
            labels.push({
                id: `${order.id}-${i + 1}`,
                orderId: order.id,
                productId: product.id,
                productName: product.name,
                brand: product.brand,
                netWeight: product.weight,
                sku: `${product.baseSku}-${whIndex}`,
                batchId,
                warehouse,
                packedBy,
                packedDate,
                status: "Label Generated",
                customer: order.customer
            });
        }
        
        return labels;
    };

    const toggleSelectOrder = (id) => {
        setSelectedOrderIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const targetList = activePaginationView === "pending" ? paginatedPendingOrders : paginatedOrders.filter(o => o.status === "Pending" || o.status === "Label Generated");
        if (targetList.length === 0) return;
        
        const allSelected = targetList.every(o => selectedOrderIds.includes(o.id));
        if (allSelected) {
            const toRemove = targetList.map(o => o.id);
            setSelectedOrderIds(prev => prev.filter(id => !toRemove.includes(id)));
        } else {
            const toAdd = targetList.map(o => o.id).filter(id => !selectedOrderIds.includes(id));
            setSelectedOrderIds(prev => [...prev, ...toAdd]);
        }
    };

    const handleBulkGenerateLabels = () => {
        if (selectedOrderIds.length === 0) {
            showToast("No orders selected for label generation.");
            return;
        }
        
        const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
        const allLabels = [];
        
        selectedOrders.forEach(o => {
            allLabels.push(...getLabelsForOrder(o));
        });
        
        setPreviewLabels(allLabels);
        setIsPrintPreviewOpen(true);
        
        // Add record to label history
        const newBatch = {
            id: `BCH-${Date.now().toString().slice(-6)}`,
            timestamp: new Date().toLocaleString('en-IN', { hour12: true }),
            ordersCount: selectedOrders.length,
            labelsCount: allLabels.length,
            labels: allLabels
        };
        
        setLabelHistory(prev => [newBatch, ...prev]);
        
        // Update statuses of pending selected orders to Label Generated
        setOrders(prev => prev.map(o => {
            if (selectedOrderIds.includes(o.id) && o.status === "Pending") {
                return { ...o, status: "Label Generated" };
            }
            return o;
        }));
        
        showToast(`Generated ${allLabels.length} labels for ${selectedOrders.length} orders.`);
    };

    const handleBulkPrintLabels = () => {
        if (selectedOrderIds.length === 0) {
            showToast("No orders selected for printing.");
            return;
        }
        handleBulkGenerateLabels();
        setTriggerImmediatePrint(true);
    };

    const handleBoardStepClick = (step) => {
        setSelectedOrderIds([]);
        if (step === "all") {
            setSearchParams({ tab: "orders" });
            setSelectedStatus("ALL");
        } else if (step === "completed") {
            setSearchParams({ tab: "orders", step: "completed" });
            setSelectedStatus("Delivered");
        } else if (step === "pending") {
            setSearchParams({ tab: "orders", step: "pending" });
            setSelectedStatus("Pending");
        } else if (step === "picking") {
            setSearchParams({ tab: "picking" });
            setSelectedStatus("Picking");
        } else if (step === "packing") {
            setSearchParams({ tab: "packing" });
            setSelectedStatus("Packing");
        } else if (step === "delivery") {
            setSearchParams({ tab: "tracking" });
            setSelectedStatus("Ready To Dispatch");
        }
        setOrdPage(1);
        setPendingPage(1);
        setPickPage(1);
        setPackPage(1);
        setDlvPage(1);
    };

    const handleCardClick = (status) => {
        if (status === "ALL") handleBoardStepClick("all");
        else if (status === "Pending") handleBoardStepClick("pending");
        else if (status === "Picking") handleBoardStepClick("picking");
        else if (status === "Packing") handleBoardStepClick("packing");
        else if (status === "Ready To Dispatch" || status === "Shipped" || status === "Out for Delivery") handleBoardStepClick("delivery");
        else if (status === "Delivered") handleBoardStepClick("completed");
        else {
            setSelectedStatus(status);
            setOrdPage(1);
        }
        setSelectedOrderIds([]);
    };

    const handleBulkMarkReadyForPicking = () => {
        if (selectedOrderIds.length === 0) {
            showToast("No orders selected.");
            return;
        }
        
        const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id) && o.status === "Pending");
        if (selectedOrders.length === 0) {
            showToast("No pending orders selected.");
            return;
        }

        const newPicks = selectedOrders.map((o, idx) => ({
            id: `PCK-${4100 + picks.length + idx}`,
            orderId: o.id,
            customer: o.customer,
            picker: "Unassigned",
            productsCount: o.items || 1,
            status: "Pending"
        }));

        setOrders(prev => prev.map(order => {
            if (selectedOrderIds.includes(order.id) && order.status === "Pending") {
                return { ...order, status: "Picking" };
            }
            return order;
        }));

        setPicks(prev => [...prev, ...newPicks]);

        showToast(`Marked ${selectedOrders.length} orders as Ready for Picking.`);
        setSelectedOrderIds([]);
    };

    const handleBulkMarkReadyForPacking = () => {
        if (selectedOrderIds.length === 0) {
            showToast("No orders selected.");
            return;
        }

        const eligibleOrders = orders.filter(o => selectedOrderIds.includes(o.id) && o.status !== "Delivered" && o.status !== "Shipped" && o.status !== "Cancelled");
        if (eligibleOrders.length === 0) {
            showToast("No eligible orders selected for packaging.");
            return;
        }

        const newPacks = eligibleOrders.map((o, idx) => ({
            id: `PAK-${5100 + packs.length + idx}`,
            orderId: o.id,
            customer: o.customer,
            packedBy: "Unassigned",
            items: o.items || 1,
            status: "Waiting"
        }));

        setOrders(prev => prev.map(order => {
            if (selectedOrderIds.includes(order.id) && order.status !== "Delivered" && order.status !== "Shipped" && order.status !== "Cancelled") {
                return { ...order, status: "Packing" };
            }
            return order;
        }));

        setPacks(prev => [...prev, ...newPacks]);

        showToast(`Marked ${eligibleOrders.length} orders as Ready for Packing.`);
        setSelectedOrderIds([]);
    };

    const handleCreateTestOrders = () => {
        const count = 100;
        const newOrders = [];
        const customerNames = [
            "Aarav Mehta", "Ishaan Sharma", "Ananya Verma", "Kabir Gupta", "Aditya Rao",
            "Diya Kapoor", "Rohan Malhotra", "Sai Prasad", "Riya Sen", "Vikram Joshi"
        ];
        const initialList = ["AM", "IS", "AV", "KG", "AR", "DK", "RM", "SP", "RS", "VJ"];
        const avatarColors = [
            "avatar-indigo", "avatar-teal", "avatar-rose", "avatar-amber", 
            "avatar-violet", "avatar-sky", "avatar-green", "avatar-orange"
        ];
        const paymentMethods = ["Credit Card", "PayPal", "COD", "Transfer Bank"];
        
        for (let i = 1; i <= count; i++) {
            const id = `#ORD-TEST-${9000 + i}`;
            const custIdx = i % customerNames.length;
            const colorIdx = i % avatarColors.length;
            const payIdx = i % paymentMethods.length;
            
            newOrders.push({
                id,
                customer: customerNames[custIdx],
                initials: initialList[custIdx],
                color: avatarColors[colorIdx],
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: 1 + (i % 4),
                amount: `₹${(100 + (i * 12.5)).toFixed(2)}`,
                payment: paymentMethods[payIdx],
                status: "Pending",
                mobile: `+91 99880 ${10000 + i}`
            });
        }
        
        setOrders(prev => [...newOrders, ...prev]);
        showToast(`Successfully created ${count} Pending orders for high-capacity load testing!`);
    };

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
        setFormWarehouse(order.warehouse || (INITIAL_DARKHOUSES[0] ? INITIAL_DARKHOUSES[0].name : ""));
        setModalType("ord-edit");
        setIsModalOpen(true);
        setActiveRowMenuId(null);
    };

    const handleGenerateInvoice = (order) => {
        setInvoiceOrder(order);
        setIsInvoiceOpen(true);
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
                const matchedDh = INITIAL_DARKHOUSES.find(dh => dh.name === formWarehouse);
                return {
                    ...o,
                    customer: formCustomer,
                    amount: formAmount,
                    payment: formPayment,
                    status: formStatus,
                    warehouse: formWarehouse,
                    warehouseCode: matchedDh ? matchedDh.code : o.warehouseCode
                };
            }
            return o;
        }));
        setIsModalOpen(false);
        showToast(`Successfully edited details of ${selectedItem.id}`);
    };

    const handlePickAssignSubmit = (e) => {
        e.preventDefault();
        const orderIdToUpdate = selectedItem.orderId;
        setPicks(prev => {
            const exists = prev.some(p => p.id === selectedItem.id);
            if (exists) {
                return prev.map(p => p.id === selectedItem.id ? { ...p, picker: formPicker, status: "Assigned" } : p);
            } else {
                return [...prev, {
                    id: `PCK-${Math.floor(4000 + Math.random() * 1000)}`,
                    orderId: orderIdToUpdate,
                    customer: selectedItem.customer,
                    picker: formPicker,
                    productsCount: selectedItem.productsCount || 1,
                    status: "Assigned"
                }];
            }
        });
        setOrders(prev => prev.map(o => o.id === orderIdToUpdate ? { ...o, status: "Picking" } : o));
        setIsModalOpen(false);
        showToast(`Assigned Picker ${formPicker} to ticket ${selectedItem.id}`);
    };

    const handleDlvUpdateSubmit = (e) => {
        e.preventDefault();
        const orderIdToUpdate = selectedItem.orderId;
        setDeliveries(prev => {
            const exists = prev.some(d => d.id === selectedItem.id);
            if (exists) {
                return prev.map(d => {
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
                });
            } else {
                return [...prev, {
                    id: `DLV-${Math.floor(6000 + Math.random() * 1000)}`,
                    orderId: orderIdToUpdate,
                    customer: selectedItem.customer,
                    rider: formRider,
                    status: formDlvStatus,
                    location: formLocation,
                    eta: formEta
                }];
            }
        });
        if (orderIdToUpdate) {
            setOrders(prev => prev.map(o => {
                if (o.id === orderIdToUpdate) {
                    let nextStatus = o.status;
                    if (formDlvStatus === "Out for Delivery") {
                        nextStatus = "Shipped";
                    } else if (formDlvStatus === "Delivered") {
                        nextStatus = "Delivered";
                    } else if (formDlvStatus === "Failed") {
                        nextStatus = "Failed";
                    }
                    return { ...o, status: nextStatus };
                }
                return o;
            }));
        }
        setIsModalOpen(false);
        showToast(`Updated delivery transit details for ${selectedItem.id}`);
    };

    // ─── Inline Operations ────────────────────────────────────────────────────
    // Open accessible confirm dialog instead of window.confirm()
    const handleCancelOrder = (id) => {
        setConfirmState({ open: true, orderId: id });
        setActiveRowMenuId(null);
    };

    const handleConfirmCancel = () => {
        const id = confirmState.orderId;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Cancelled" } : o));
        setPicks(prev => prev.map(p => p.orderId === id ? { ...p, status: "Cancelled" } : p));
        setPacks(prev => prev.map(p => p.orderId === id ? { ...p, status: "Cancelled" } : p));
        setDeliveries(prev => prev.map(d => d.orderId === id ? { ...d, status: "Failed" } : d));
        setConfirmState({ open: false, orderId: null });
        showToast(`Cancelled order ${id}`);
    };

    const handleCancelDismiss = () => {
        setConfirmState({ open: false, orderId: null });
    };

    const handleCompletePick = (id) => {
        let orderIdToUpdate = null;
        let pickItem = null;
        setPicks(prev => prev.map(p => {
            if (p.id === id) {
                orderIdToUpdate = p.orderId;
                pickItem = p;
                return { ...p, status: "Completed" };
            }
            return p;
        }));
        if (orderIdToUpdate) {
            setOrders(prev => prev.map(o => o.id === orderIdToUpdate ? { ...o, status: "Packing" } : o));
            setPacks(prev => {
                if (prev.some(p => p.orderId === orderIdToUpdate)) return prev;
                return [...prev, {
                    id: `PAK-${Math.floor(5000 + Math.random() * 1000)}`,
                    orderId: orderIdToUpdate,
                    customer: pickItem.customer,
                    packedBy: "Unassigned",
                    items: pickItem.productsCount || 1,
                    status: "Waiting"
                }];
            });
        }
        showToast(`Marked picking ticket ${id} as completed`);
    };

    const handleStartPacking = (id) => {
        let orderIdToUpdate = null;
        setPacks(prev => prev.map(p => {
            if (p.id === id) {
                orderIdToUpdate = p.orderId;
                return { ...p, status: "Packing", packedBy: "Ananya Iyer" };
            }
            return p;
        }));
        if (orderIdToUpdate) {
            setOrders(prev => prev.map(o => o.id === orderIdToUpdate ? { ...o, status: "Packing" } : o));
        }
        showToast(`Started packing order matching sheet ${id}`);
    };

    const handlePrintLabel = (id) => {
        showToast(`Generating barcode tag & printing shipping label for ${id}...`);
        const orderItem = orders.find(o => o.id === id) || 
                          orders.find(o => o.id === id.replace("PCK-", "ORD-")) ||
                          orders.find(o => id.includes(o.id));
                          
        if (!orderItem) {
            showToast("Error: Order item not found.");
            return;
        }

        const labels = getLabelsForOrder(orderItem);
        if (labels.length === 0) {
            showToast("No labels available for printing.");
            alert("No labels available for printing.");
            return;
        }

        setPreviewLabels(labels);
        setIsPrintPreviewOpen(true);
        setTriggerImmediatePrint(true);
    };

    const handleCompletePack = (id) => {
        let orderIdToUpdate = null;
        let packItem = null;
        setPacks(prev => prev.map(p => {
            if (p.id === id) {
                orderIdToUpdate = p.orderId;
                packItem = p;
                return { ...p, status: "Packed" };
            }
            return p;
        }));
        if (orderIdToUpdate) {
            const assocOrder = orders.find(o => o.id === orderIdToUpdate);
            const wh = assocOrder ? (assocOrder.warehouse || "Warehouse Hub") : "Warehouse Hub";
            setOrders(prev => prev.map(o => o.id === orderIdToUpdate ? { ...o, status: "Ready for Dispatch" } : o));
            setDeliveries(prev => {
                if (prev.some(d => d.orderId === orderIdToUpdate)) return prev;
                return [...prev, {
                    id: `DLV-${Math.floor(6000 + Math.random() * 1000)}`,
                    orderId: orderIdToUpdate,
                    customer: packItem.customer,
                    rider: "Unassigned",
                    eta: "Pending Assignment",
                    location: wh,
                    status: "Assigned"
                }];
            });
        }
        showToast(`Packed & sealed package box for ${id}`);
    };

    const handleCallRider = (rider) => {
        showToast(`Dialing rider ${rider} at +91 99880 12345...`);
    };

    // Use shared utility — eliminates the local copy
    const getStatusClass = getOrderStatusClass;

    const toggleRowMenu = (id, e) => {
        e.stopPropagation();
        setActiveRowMenuId(prev => prev === id ? null : id);
    };

    const handleTabClick = (tabKey) => {
        if (tabKey === "pending") {
            navigate("/orders/pending");
        } else {
            navigate(`/orders?tab=${tabKey}`);
        }
    };

    return (
        <div className="orders-root fade-in">
            {/* Accessible Toast Notification */}
            {toast && (
                <div
                    className="orders-toast slide-in-top"
                    role="alert"
                    aria-live="polite"
                >
                    <CheckCircle size={15} className="toast-icon" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Accessible Confirm Modal — replaces window.confirm() */}
            <ConfirmModal
                isOpen={confirmState.open}
                title={`Cancel Order ${confirmState.orderId}?`}
                message="This will mark the order as Cancelled. This action cannot be undone."
                confirmLabel="Yes, Cancel Order"
                cancelLabel="Keep Order"
                onConfirm={handleConfirmCancel}
                onCancel={handleCancelDismiss}
                variant="danger"
            />

            {/* Page Header */}
            <div className="orders-header-block print-btn-no-print">
                <div className="orders-header-left">
                    <h1 className="orders-header-title">
                        {activeTab === "management" && "Order Management"}
                        {activeTab === "orders" && "Order List"}
                        {activeTab === "details" && "Order Details"}
                        {activeTab === "new-query" && "New Order Query"}
                        {activeTab === "picking" && "Picking"}
                        {activeTab === "packing" && "Packing"}
                        {activeTab === "tracking" && "Delivery Management"}
                        {activeTab === "cancelled" && "Cancelled Orders"}
                    </h1>
                    <p className="orders-header-subtitle">
                        {activeTab === "management" && "Override routing priorities, manage process queues, and execute bulk order states."}
                        {activeTab === "orders" && (
                            boardStep === "all" ? "Unified quick-commerce database list: audit general customer orders, review payment methods, and manage database records." :
                            boardStep === "pending" ? "Incoming orders queue: verify store stock check allocations and release to pickers." :
                            boardStep === "completed" ? "Completed order directory: view historical records of successfully delivered orders." :
                            "Unified database overview."
                        )}
                        {activeTab === "details" && "Detailed inspector sheet displaying ordered products, execution timelines, and barcodes."}
                        {activeTab === "new-query" && "Lookup order status, check real-time stock allocation checks, and view transit routes."}
                        {activeTab === "picking" && "Order picking queue: active picker assignments and shelf bin item checklists."}
                        {activeTab === "packing" && "Bagger packing station: box, verify items, print barcode labels, and seal packages."}
                        {activeTab === "tracking" && "Courier delivery hub: assign riders, track live simulated routes, and monitor ETAs."}
                        {activeTab === "cancelled" && "Review cancelled orders, verify cancellation reasons, and process direct refunds."}
                    </p>
                </div>
                {activeTab === "orders" && boardStep === "all" && (
                    <div className="orders-header-right">
                        <button 
                            className="orders-inline-btn orders-inline-btn--secondary"
                            onClick={handleCreateTestOrders}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        >
                            <span>+ Create 100 Bulk Test Orders</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Stat Grid */}
            <div className="orders-stats-grid">
                {activeTab === "management" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{orders.length}</span>
                                <span className="stat-card-label">Total Volume</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-failed" style={{ backgroundColor: "#ef4444" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{orders.filter(o => o.priority === "High" || o.priority === "Critical").length}</span>
                                <span className="stat-card-label">High/Critical Priority</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{orders.filter(o => o.status === "Pending").length}</span>
                                <span className="stat-card-label">Pending Processing</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">94.2%</span>
                                <span className="stat-card-label">Fulfillment Rate</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "orders" && (
                    <>
                        <div 
                            className={`orders-stat-card ${boardStep === "all" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("all")}
                        >
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.total}</span>
                                <span className="stat-card-label">All Orders</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${boardStep === "pending" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("pending")}
                        >
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.pending}</span>
                                <span className="stat-card-label">Pending Queue</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${boardStep === "picking" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("picking")}
                        >
                            <span className="stat-dot dot-info" style={{ backgroundColor: "#3b82f6" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.picking}</span>
                                <span className="stat-card-label">Picking Queue</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${boardStep === "packing" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("packing")}
                        >
                            <span className="stat-dot dot-pending" style={{ backgroundColor: "#f97316" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.packing}</span>
                                <span className="stat-card-label">Packing Queue</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${boardStep === "delivery" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("delivery")}
                        >
                            <span className="stat-dot dot-shipped" style={{ backgroundColor: "#10b981" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{orders.filter(o => o.status === "Ready for Dispatch" || o.status === "Shipped" || o.status === "Out for Delivery").length}</span>
                                <span className="stat-card-label">Delivery Queue</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${boardStep === "completed" ? "active" : ""}`}
                            onClick={() => handleBoardStepClick("completed")}
                        >
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.delivered}</span>
                                <span className="stat-card-label">Completed</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "cancelled" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-failed" style={{ backgroundColor: "#ef4444" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{cancelledOrders.length}</span>
                                <span className="stat-card-label">Total Cancelled</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-info" style={{ backgroundColor: "#f59e0b" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">
                                    ₹{cancelledOrders.reduce((sum, o) => {
                                        const amtVal = parseFloat(o.amount.replace(/[^0-9.]/g, "")) || 0;
                                        return sum + amtVal;
                                    }, 0).toFixed(2)}
                                </span>
                                <span className="stat-card-label">Refund Valuation</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">
                                    {cancelledOrders.filter(o => !processedRefunds.includes(o.id)).length}
                                </span>
                                <span className="stat-card-label">Awaiting Refund</span>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "label-history" && (
                    <>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{labelHistory.length}</span>
                                <span className="stat-card-label">Total Batches</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-delivered" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">
                                    {labelHistory.reduce((acc, b) => acc + b.labelsCount, 0)}
                                </span>
                                <span className="stat-card-label">Labels Printed</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">
                                    {orders.filter(o => o.status === "Pending").length}
                                </span>
                                <span className="stat-card-label">Pending Invoices</span>
                            </div>
                        </div>
                        <div className="orders-stat-card">
                            <span className="stat-dot dot-shipped" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">
                                    {orders.filter(o => o.status === "Label Generated").length}
                                </span>
                                <span className="stat-card-label">Labels Generated</span>
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
                            aria-selected={activeTab === "board"}
                            className={`orders-tab ${activeTab === "board" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("board")}
                        >
                            Order List
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "details"}
                            className={`orders-tab ${activeTab === "details" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("details")}
                        >
                            Order Details
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "management"}
                            className={`orders-tab ${activeTab === "management" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("management")}
                        >
                            Order Management
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "new-query"}
                            className={`orders-tab ${activeTab === "new-query" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("new-query")}
                        >
                            New Order Query
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "cancelled"}
                            className={`orders-tab ${activeTab === "cancelled" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("cancelled")}
                        >
                            Cancelled Orders
                        </button>
                    </div>

                    {/* Toolbar Search / Select Filters */}
                    <div className="orders-toolbar__actions">
                        {["management", "orders", "picking", "packing", "tracking", "cancelled"].includes(activeTab) && (
                            <select
                                className="orders-toolbar-select global-warehouse-filter"
                                value={selectedWarehouseFilter}
                                onChange={(e) => {
                                    setSelectedWarehouseFilter(e.target.value);
                                    setOrdPage(1);
                                    setPendingPage(1);
                                    setPickPage(1);
                                    setPackPage(1);
                                    setDlvPage(1);
                                }}
                                style={{ border: "2px solid var(--primary)", fontWeight: "600", marginRight: "8px" }}
                            >
                                <option value="All">🏪 All Hubs & Darkhouses</option>
                                {INITIAL_DARKHOUSES.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        )}
                        {activePaginationView === "pending" && (
                            <div className="orders-search-wrap">
                                <Search size={14} className="orders-search-icon" />
                                <input
                                    type="text"
                                    className="orders-search-input"
                                    placeholder="Search ID, customer, or mobile..."
                                    value={pendingSearch}
                                    onChange={(e) => { setPendingSearch(e.target.value); setPendingPage(1); }}
                                />
                            </div>
                        )}
                        {activeTab === "cancelled" && (
                            <div className="orders-search-wrap">
                                <Search size={14} className="orders-search-icon" />
                                <input
                                    type="text"
                                    className="orders-search-input"
                                    placeholder="Search ID or customer..."
                                    value={cancelledSearch}
                                    onChange={(e) => setCancelledSearch(e.target.value)}
                                />
                            </div>
                        )}
                        {activePaginationView === "orders" && (
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
                                    value={selectedStatus}
                                    onChange={(e) => { handleCardClick(e.target.value); }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Picking">Picking</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Ready To Dispatch">Ready To Dispatch</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            </>
                        )}

                        {activePaginationView === "picking" && (
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

                        {activePaginationView === "packing" && (
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

                        {activePaginationView === "tracking" && (
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
                        {activePaginationView === "label-history" && (
                            <div className="orders-toolbar-log-info" style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                                Total printed batches recorded: {labelHistory.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* 1. Order Management Tab */}
                {activeTab === "management" && (
                    <div className="management-control-dashboard fade-in">
                        {/* Priority Overrides Table */}
                        <div className="management-table-container">
                            <div className="management-table-header-row">
                                <h3 className="section-title">Priority Overrides & Routing Control</h3>
                                <div className="management-search-box">
                                    <Search size={14} className="orders-search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Quick filter priority orders..." 
                                        className="orders-search-input"
                                        value={managementSearch}
                                        onChange={(e) => setManagementSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="orders-table-responsive">
                                <table className="orders-data-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "40px", textAlign: "center" }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={filteredManagementOrders.length > 0 && selectedManagementIds.length === filteredManagementOrders.length}
                                                    onChange={handleToggleAllManagementSelect}
                                                />
                                            </th>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Stage</th>
                                            <th>Current Priority</th>
                                            <th className="text-right">Action Overrides</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredManagementOrders.map(order => (
                                            <tr key={order.id}>
                                                <td style={{ textAlign: "center" }}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedManagementIds.includes(order.id)}
                                                        onChange={() => handleToggleManagementSelect(order.id)}
                                                    />
                                                </td>
                                                <td className="font-mono font-bold">{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td>{order.date}</td>
                                                <td>
                                                    <span className={`orders-status-badge ${getStatusClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`priority-badge priority-${(order.priority || "Normal").toLowerCase()}`}>
                                                        {order.priority || "Normal"}
                                                    </span>
                                                </td>
                                                <td className="text-right actions-cell">
                                                    <button 
                                                        onClick={() => handleTogglePriority(order.id)}
                                                        className="orders-inline-btn orders-inline-btn--secondary"
                                                        style={{ fontSize: "11px", padding: "4px 10px" }}
                                                    >
                                                        <RefreshCw size={10} style={{ marginRight: "4px" }} />
                                                        Toggle Priority
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredManagementOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center" style={{ padding: "40px 10px", color: "var(--text-muted)" }}>
                                                    No orders match the filter search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bulk Actions Console */}
                        <div className="management-bulk-panel">
                            <h3 className="section-title">Bulk Lifecycle Controls</h3>
                            <div className="bulk-controls-row">
                                <span className="bulk-selection-count">
                                    <strong>{selectedManagementIds.length}</strong> orders selected
                                </span>
                                <select 
                                    className="orders-toolbar-select"
                                    value={bulkActionType}
                                    onChange={(e) => setBulkActionType(e.target.value)}
                                    style={{ width: "220px" }}
                                >
                                    <option value="">Choose bulk action...</option>
                                    <option value="high-priority">Set Priority to High</option>
                                    <option value="critical-priority">Set Priority to Critical</option>
                                    <option value="release-picking">Release to Picking Queue</option>
                                    <option value="cancel">Cancel Orders</option>
                                </select>
                                <button 
                                    className="orders-inline-btn orders-inline-btn--primary"
                                    onClick={handleExecuteBulkAction}
                                    disabled={selectedManagementIds.length === 0 || !bulkActionType}
                                    style={{ height: "36px", fontSize: "13px" }}
                                >
                                    Execute Action
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Order Details Inspector Tab */}
                {activeTab === "details" && (
                    <div className="details-inspector-container fade-in">
                        {/* Left Column: List selector */}
                        <div className="details-inspector-left">
                            <div className="inspector-search-box">
                                <Search size={14} className="orders-search-icon" />
                                <input 
                                    type="text"
                                    placeholder="Search ID or customer..."
                                    className="orders-search-input"
                                    value={inspectorSearch}
                                    onChange={(e) => setInspectorSearch(e.target.value)}
                                    style={{ width: "100%" }}
                                />
                            </div>
                            <div className="inspector-orders-list">
                                {filteredInspectorOrders.map(o => (
                                    <div 
                                        key={o.id}
                                        className={`inspector-order-row ${selectedInspectorOrder?.id === o.id ? "active" : ""}`}
                                        onClick={() => setSelectedInspectorOrderId(o.id)}
                                    >
                                        <div className="inspector-row-top">
                                            <span className="order-id font-mono">{o.id}</span>
                                            <span className="order-date">{o.date}</span>
                                        </div>
                                        <div className="inspector-row-bottom">
                                            <span className="customer-name">{o.customer}</span>
                                            <span className={`orders-status-badge ${getStatusClass(o.status)}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {filteredInspectorOrders.length === 0 && (
                                    <div className="inspector-empty">No matching orders found.</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Detailed inspect panel */}
                        <div className="details-inspector-right">
                            {selectedInspectorOrder ? (
                                <div className="inspector-details-card">
                                    <div className="details-card-header">
                                        <div>
                                            <h3 className="inspector-card-title">Order {selectedInspectorOrder.id} Inspector</h3>
                                            <p className="customer-info">Customer: <strong>{selectedInspectorOrder.customer}</strong> | Mobile: <strong>{selectedInspectorOrder.mobile || "+91 99880 12345"}</strong></p>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <button 
                                                className="orders-inline-btn orders-inline-btn--secondary"
                                                onClick={() => handlePrintLabel(selectedInspectorOrder.id)}
                                            >
                                                <Printer size={14} style={{ marginRight: "4px" }} />
                                                <span>Print Tag</span>
                                            </button>
                                            {(() => {
                                                const status = selectedInspectorOrder.status;
                                                if (status === "Pending") {
                                                    return (
                                                        <button 
                                                            className="orders-inline-btn orders-inline-btn--success"
                                                            onClick={() => {
                                                                setOrders(prev => prev.map(o => o.id === selectedInspectorOrder.id ? { ...o, status: "Picking" } : o));
                                                                setPicks(prev => {
                                                                    if (prev.some(p => p.orderId === selectedInspectorOrder.id)) return prev;
                                                                    return [...prev, {
                                                                        id: `PCK-${Math.floor(4000 + Math.random() * 1000)}`,
                                                                        orderId: selectedInspectorOrder.id,
                                                                        customer: selectedInspectorOrder.customer,
                                                                        picker: "Unassigned",
                                                                        productsCount: selectedInspectorOrder.items || 1,
                                                                        status: "Pending"
                                                                    }];
                                                                });
                                                                showToast(`Released order ${selectedInspectorOrder.id} to picking queue`);
                                                            }}
                                                        >
                                                            <span>⚡ Release to Picking</span>
                                                        </button>
                                                    );
                                                }
                                                if (status === "Picking") {
                                                    const pick = picks.find(p => p.orderId === selectedInspectorOrder.id);
                                                    if (!pick || pick.status === "Pending") {
                                                        return (
                                                            <button 
                                                                className="orders-inline-btn"
                                                                onClick={() => openPickAssign(pick || {
                                                                    id: `PCK-TEMP`,
                                                                    orderId: selectedInspectorOrder.id,
                                                                    customer: selectedInspectorOrder.customer,
                                                                    picker: "Unassigned",
                                                                    productsCount: selectedInspectorOrder.items || 1
                                                                })}
                                                            >
                                                                <span>👤 Assign Picker</span>
                                                            </button>
                                                        );
                                                    }
                                                    if (pick.status === "Assigned") {
                                                        return (
                                                            <button 
                                                                className="orders-inline-btn orders-inline-btn--success"
                                                                onClick={() => handleCompletePick(pick.id)}
                                                            >
                                                                <span>✓ Complete Picking</span>
                                                            </button>
                                                        );
                                                    }
                                                }
                                                if (status === "Packing") {
                                                    const pack = packs.find(p => p.orderId === selectedInspectorOrder.id);
                                                    if (pack) {
                                                        if (pack.status === "Waiting") {
                                                            return (
                                                                <button 
                                                                    className="orders-inline-btn"
                                                                    onClick={() => handleStartPacking(pack.id)}
                                                                >
                                                                    <span>📦 Start Packing</span>
                                                                </button>
                                                            );
                                                        }
                                                        if (pack.status === "Packing") {
                                                            return (
                                                                <button 
                                                                    className="orders-inline-btn orders-inline-btn--success"
                                                                    onClick={() => handleCompletePack(pack.id)}
                                                                >
                                                                    <span>✓ Complete Packing</span>
                                                                </button>
                                                            );
                                                        }
                                                    } else {
                                                        // Fallback pick completion check
                                                        return (
                                                            <button 
                                                                className="orders-inline-btn"
                                                                onClick={() => {
                                                                    setPacks(prev => {
                                                                        if (prev.some(p => p.orderId === selectedInspectorOrder.id)) return prev;
                                                                        return [...prev, {
                                                                            id: `PAK-${Math.floor(5000 + Math.random() * 1000)}`,
                                                                            orderId: selectedInspectorOrder.id,
                                                                            customer: selectedInspectorOrder.customer,
                                                                            packedBy: "Unassigned",
                                                                            items: selectedInspectorOrder.items || 1,
                                                                            status: "Waiting"
                                                                        }];
                                                                    });
                                                                    showToast(`Initialized packing ticket for ${selectedInspectorOrder.id}`);
                                                                }}
                                                            >
                                                                <span>📦 Start packing ticket</span>
                                                            </button>
                                                        );
                                                    }
                                                }
                                                if (status === "Ready for Dispatch" || status === "Packed") {
                                                    const dlv = deliveries.find(d => d.orderId === selectedInspectorOrder.id);
                                                    return (
                                                        <button 
                                                            className="orders-inline-btn"
                                                            onClick={() => openDlvUpdate(dlv || {
                                                                id: `DLV-TEMP`,
                                                                orderId: selectedInspectorOrder.id,
                                                                customer: selectedInspectorOrder.customer,
                                                                rider: "Unassigned",
                                                                status: "Assigned",
                                                                location: selectedInspectorOrder.warehouse || "Warehouse Hub",
                                                                eta: "Pending Assignment"
                                                            })}
                                                        >
                                                            <span>🚚 Assign Rider & Ship</span>
                                                        </button>
                                                    );
                                                }
                                                if (status === "Shipped" || status === "Out for Delivery") {
                                                    const dlv = deliveries.find(d => d.orderId === selectedInspectorOrder.id);
                                                    return (
                                                        <button 
                                                            className="orders-inline-btn orders-inline-btn--success"
                                                            onClick={() => {
                                                                if (dlv) {
                                                                    setDeliveries(prev => prev.map(d => d.id === dlv.id ? { ...d, status: "Delivered", eta: "Completed" } : d));
                                                                }
                                                                setOrders(prev => prev.map(o => o.id === selectedInspectorOrder.id ? { ...o, status: "Delivered" } : o));
                                                                showToast(`Marked order ${selectedInspectorOrder.id} as Delivered`);
                                                            }}
                                                        >
                                                            <span>✓ Mark Delivered</span>
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>

                                    {/* Items Mapped */}
                                    <div className="inspector-section">
                                        <h4 className="inspector-section-title">Ordered Items Allocation</h4>
                                        <table className="inspector-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Item Description</th>
                                                    <th>Category</th>
                                                    <th>SKU Code</th>
                                                    <th className="text-center">Qty Requested</th>
                                                    <th className="text-right">Unit Rate</th>
                                                    <th className="text-right">Total Price</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getItemsForOrder(selectedInspectorOrder).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.name}</td>
                                                        <td>
                                                            <span className="category-tag">{getCategoryForProduct(item.name, item.sku)}</span>
                                                        </td>
                                                        <td className="font-mono">{item.sku}</td>
                                                        <td className="text-center font-bold">{item.qty}</td>
                                                        <td className="text-right">₹{item.price.toFixed(2)}</td>
                                                        <td className="text-right font-bold">₹{(item.qty * item.price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Progress Timeline */}
                                    <div className="inspector-section">
                                        <h4 className="inspector-section-title">Progress Execution Timeline</h4>
                                        <div className="execution-timeline">
                                            {(() => {
                                                const stages = ["Pending", "Picking", "Packing", "Ready To Dispatch", "Shipped", "Delivered"];
                                                const normalizeStatus = (st) => {
                                                    switch (st) {
                                                        case "Pending": return "Pending";
                                                        case "Picking": return "Picking";
                                                        case "Packing":
                                                        case "Processing": return "Packing";
                                                        case "Label Generated":
                                                        case "Ready for Dispatch":
                                                        case "Ready To Dispatch":
                                                        case "Packed": return "Ready To Dispatch";
                                                        case "Shipped":
                                                        case "Out for Delivery": return "Shipped";
                                                        case "Delivered": return "Delivered";
                                                        default: return "Pending";
                                                    }
                                                };
                                                const normalizedStatus = normalizeStatus(selectedInspectorOrder.status);
                                                const currentStageIdx = stages.indexOf(normalizedStatus);
                                                return stages.map((stage, idx) => {
                                                    let isDone = idx <= currentStageIdx;
                                                    let isCurrent = idx === currentStageIdx;
                                                    
                                                    // Handle cancelled state override
                                                    if (selectedInspectorOrder.status === "Cancelled") {
                                                        isDone = false;
                                                        isCurrent = false;
                                                    }
                                                    
                                                    return (
                                                        <div key={idx} className={`timeline-step ${isDone ? "step-done" : ""} ${isCurrent ? "step-current" : ""} ${selectedInspectorOrder.status === "Cancelled" ? "step-cancelled" : ""}`}>
                                                            <div className="step-marker">
                                                                {selectedInspectorOrder.status === "Cancelled" ? "✗" : (isDone ? "✓" : idx + 1)}
                                                            </div>
                                                            <div className="step-label-wrap">
                                                                <span className="step-label">{stage}</span>
                                                                {isDone && <span className="step-time">{idx === 0 ? "10:15 AM" : idx === 1 ? "10:30 AM" : idx === 2 ? "11:00 AM" : idx === 3 ? "11:15 AM" : idx === 4 ? "11:45 AM" : "12:10 PM"}</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    {/* Label Preview */}
                                    <div className="inspector-section">
                                        <h4 className="inspector-section-title">Shipping Barcode Tag Sheet</h4>
                                        <div className="shipping-label-card">
                                            <div className="label-logo-row">
                                                <span className="label-logo">HAATZA</span>
                                                <span className="label-method">EXPRESS WAREHOUSE LOGISTICS</span>
                                            </div>
                                            <div className="label-main-grid">
                                                <div className="label-address">
                                                    <span className="label-title">SHIP TO:</span>
                                                    <strong>{selectedInspectorOrder.customer}</strong>
                                                    <span>{selectedInspectorOrder.mobile || "+91 99880 12345"}</span>
                                                    <span>Sector 4, Dwarka, New Delhi - 110075</span>
                                                </div>
                                                <div className="label-meta-details">
                                                    <div><span className="meta-label">ORDER REFERENCE:</span> <span className="meta-val font-mono font-bold">{selectedInspectorOrder.id}</span></div>
                                                    <div><span className="meta-label">DISPATCH DATE:</span> <span className="meta-val">{selectedInspectorOrder.date}</span></div>
                                                    <div><span className="meta-label">PAYMENT CHANNEL:</span> <span className="meta-val font-bold">{selectedInspectorOrder.payment}</span></div>
                                                </div>
                                            </div>
                                            <div className="label-barcode-section">
                                                <div 
                                                    className="barcode-container" 
                                                    style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: (() => {
                                                            const barcode = new Barcode128Svg(selectedInspectorOrder.id);
                                                            barcode.height = 50;
                                                            barcode.factor = 1.8;
                                                            return barcode.toString();
                                                        })()
                                                    }}
                                                />
                                                <span className="barcode-text font-mono">{selectedInspectorOrder.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="inspector-empty-state">
                                    Select an order from the list on the left to inspect detailed properties.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. New Order Query Tab */}
                {activeTab === "new-query" && (
                    <div className="new-order-query-container fade-in">
                        <div className="query-search-panel">
                            <h3 className="section-title">Real-time Order Query & Stock Checker</h3>
                            <p className="panel-desc">Query any active Order ID to inspect stock verification status and route milestones mapping.</p>
                            <div className="query-input-row">
                                <div className="query-search-wrap">
                                    <Search size={16} className="orders-search-icon" />
                                    <input 
                                        type="text"
                                        placeholder="Enter Order ID (e.g. #ORD-8818, #ORD-8812...)"
                                        className="orders-search-input query-input"
                                        value={queryIdInput}
                                        onChange={(e) => setQueryIdInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleRunQuery(); }}
                                        style={{ width: "100%", fontSize: "14px", paddingLeft: "36px" }}
                                    />
                                </div>
                                <button 
                                    className="orders-inline-btn orders-inline-btn--primary"
                                    onClick={() => handleRunQuery()}
                                    style={{ height: "42px", padding: "0 24px", fontSize: "13px" }}
                                >
                                    Run Query
                                </button>
                            </div>
                            <div className="suggestion-chips">
                                <span className="chip-label">Suggestions:</span>
                                {orders.slice(0, 5).map(o => (
                                    <button 
                                        key={o.id}
                                        className="suggestion-chip"
                                        onClick={() => { setQueryIdInput(o.id); handleRunQuery(o.id); }}
                                    >
                                        {o.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {queryResult ? (
                            <div className="query-results-grid">
                                {/* Stock Verification */}
                                <div className="query-stock-card">
                                    <h4 className="card-title">Darkhouse Allocation Check</h4>
                                    <div className="order-info-strip">
                                        <span>Order: <strong className="font-mono">{queryResult.id}</strong></span>
                                        <span>Customer: <strong>{queryResult.customer}</strong></span>
                                        <span>Darkhouse: <strong>{queryResult.warehouse || "HAATZA Koramangala Hub"}</strong></span>
                                        <span>Stage: <span className={`orders-status-badge ${getStatusClass(queryResult.status)}`}>{queryResult.status}</span></span>
                                    </div>
                                    <table className="query-stock-table">
                                        <thead>
                                            <tr>
                                                <th>Item Name</th>
                                                <th>SKU Code</th>
                                                <th>Qty</th>
                                                <th>Allocated Bin</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getItemsForOrder(queryResult).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.name}</td>
                                                    <td className="font-mono">{item.sku}</td>
                                                    <td>{item.qty} units</td>
                                                    <td className="font-mono">BIN-{(idx * 3) + 12}-A</td>
                                                    <td>
                                                        <span className="stock-badge in-stock" style={{ color: "#10b981", fontWeight: "700" }}>✓ In Stock</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Dispatch Route */}
                                <div className="query-route-card">
                                    <h4 className="card-title">Simulated Dispatch Route Mapped</h4>
                                    <p className="card-subtitle">Milestones from origin Darkhouse to shipping destination.</p>
                                    
                                    <div className="route-flowchart">
                                        <div className="route-node origin">
                                            <div className="node-icon" style={{ backgroundColor: "#3b82f6", color: "white" }}><Store size={14} /></div>
                                            <div className="node-info">
                                                <span className="node-label">Origin Hub</span>
                                                <strong className="node-value">{queryResult.warehouse || "HAATZA Koramangala Hub"}</strong>
                                            </div>
                                        </div>
                                        <div className="route-line-connector">
                                            <div className="route-line-pulse"></div>
                                        </div>
                                        <div className="route-node transit">
                                            <div className="node-icon" style={{ backgroundColor: "#f59e0b", color: "white" }}><Truck size={14} /></div>
                                            <div className="node-info">
                                                <span className="node-label">Dispatch Courier</span>
                                                <strong className="node-value">{["Shipped", "Delivered"].includes(queryResult.status) ? "Amit Patel (Rider #882)" : "Awaiting Picker Handoff"}</strong>
                                            </div>
                                        </div>
                                        <div className="route-line-connector"></div>
                                        <div className="route-node destination">
                                            <div className="node-icon" style={{ backgroundColor: "#10b981", color: "white" }}><MapPin size={14} /></div>
                                            <div className="node-info">
                                                <span className="node-label">Destination Address</span>
                                                <strong className="node-value">Dwarka Sector-4, New Delhi - 110075</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="query-empty-state">
                                Enter an active Order ID above to check inventory allocations and courier progress.
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Cancelled Orders Tab */}
                {activeTab === "cancelled" && (
                    <div className="cancelled-orders-container fade-in">
                        {filteredCancelledOrders.length === 0 ? (
                            <div className="orders-empty-state-container" style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "60px 20px",
                                textAlign: "center"
                            }}>
                                <XCircle size={48} style={{ color: "var(--brand-danger)", marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                                    No Cancelled Orders
                                </h3>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
                                    There are currently no orders flagged as cancelled.
                                </p>
                            </div>
                        ) : (
                            <div className="orders-table-responsive">
                                <table className="orders-data-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Cancelled Value</th>
                                            <th>Cancellation Reason</th>
                                            <th>Refund Stage</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCancelledOrders.map(order => {
                                            const isRefunded = processedRefunds.includes(order.id);
                                            return (
                                                <tr key={order.id}>
                                                    <td className="font-mono font-bold">{order.id}</td>
                                                    <td>{order.customer}</td>
                                                    <td>{order.date}</td>
                                                    <td>{order.amount}</td>
                                                    <td>{order.items > 2 ? "Out of Stock Allocation" : "Customer Cancellation"}</td>
                                                    <td>
                                                        <span className={`refund-badge ${isRefunded ? "refunded" : "pending"}`}>
                                                            {isRefunded ? "Refunded" : "Awaiting Refund"}
                                                        </span>
                                                    </td>
                                                    <td className="text-right actions-cell">
                                                        {!isRefunded ? (
                                                            <button 
                                                                className="orders-inline-btn orders-inline-btn--primary refund-action-btn"
                                                                onClick={() => handleTriggerRefund(order.id)}
                                                                style={{ fontSize: "11px", padding: "4px 12px" }}
                                                            >
                                                                <Check size={10} style={{ marginRight: "4px" }} />
                                                                Process Refund
                                                            </button>
                                                        ) : (
                                                            <span className="refunded-check" style={{ color: "#10b981", fontWeight: "700", fontSize: "12px" }}>✓ Refunded</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Darkstore Fulfillment Board Table Data Grid */}
                {["orders", "picking", "packing", "tracking"].includes(activeTab) && (
                    boardStep === "pending" && filteredPendingOrders.length === 0 ? (
                        <div className="orders-empty-state-container" style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "60px 20px",
                            textAlign: "center"
                        }}>
                            <CheckCircle size={48} style={{ color: "#10b981", marginBottom: "16px" }} />
                            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                                No Pending Orders
                            </h3>
                            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
                                All orders have been processed successfully.
                            </p>
                            <button 
                                className="orders-inline-btn" 
                                onClick={() => handleBoardStepClick("all")}
                                style={{ padding: "10px 24px", fontSize: "13px" }}
                            >
                                View All Orders
                            </button>
                        </div>
                    ) : (
                        <div className="orders-table-responsive">
                            <table className="orders-data-table">
                                {activePaginationView === "pending" && (
                                    <>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "40px", paddingRight: "10px", textAlign: "center" }}>
                                                    <input 
                                                        type="checkbox"
                                                        className="orders-checkbox-main"
                                                        checked={
                                                            paginatedPendingOrders.length > 0 &&
                                                            paginatedPendingOrders.every(o => selectedOrderIds.includes(o.id))
                                                        }
                                                        onChange={toggleSelectAll}
                                                        title="Select all Pending orders on this page"
                                                    />
                                                </th>
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
                                            {paginatedPendingOrders.map((order, index) => (
                                                <tr key={order.id} className="orders-row-hover">
                                                    <td style={{ textAlign: "center", paddingRight: "10px" }}>
                                                        <input 
                                                            type="checkbox"
                                                            className="orders-checkbox-row"
                                                            checked={selectedOrderIds.includes(order.id)}
                                                            onChange={() => toggleSelectOrder(order.id)}
                                                        />
                                                    </td>
                                                    <td className="odt-id">{order.id}</td>
                                                    <td>
                                                        <div className="odt-customer">
                                                            <span className={`odt-avatar ${order.color || "avatar-indigo"}`}>
                                                                {order.initials}
                                                            </span>
                                                            <div className="odt-customer-name">
                                                                <div>{order.customer}</div>
                                                                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                                                    <Store size={10} style={{ display: "inline-block" }} /> {order.warehouse || "Koramangala Hub"}
                                                                </span>
                                                            </div>
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
                                                                <div 
                                                                    className="global-action-dropdown"
                                                                    style={index >= paginatedPendingOrders.length - 2 && paginatedPendingOrders.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                                >
                                                                    <button className="global-dropdown-item" onClick={() => openOrdView(order)}>
                                                                        <Eye size={13} />
                                                                        <span>View Details</span>
                                                                    </button>
                                                                    <button className="global-dropdown-item" onClick={() => openOrdEdit(order)}>
                                                                        <Edit2 size={13} />
                                                                        <span>Edit Order</span>
                                                                    </button>
                                                                    <button className="global-dropdown-item" onClick={() => handleGenerateInvoice(order)}>
                                                                        <FileText size={13} />
                                                                        <span>Generate Invoice</span>
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
                                            ))}
                                        </tbody>
                                    </>
                                )}
                                {activePaginationView === "orders" && (
                                    <>
                                        <thead>
                                            <tr>
                                                <th style={{ width: "40px", paddingRight: "10px", textAlign: "center" }}>
                                                    <input 
                                                        type="checkbox"
                                                        className="orders-checkbox-main"
                                                        checked={
                                                            paginatedOrders.length > 0 &&
                                                            paginatedOrders.filter(o => o.status === "Pending").length > 0 &&
                                                            paginatedOrders.filter(o => o.status === "Pending").every(o => selectedOrderIds.includes(o.id))
                                                        }
                                                        onChange={toggleSelectAll}
                                                        title="Select all Pending orders on this page"
                                                    />
                                                </th>
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
                                                    <td colSpan={9} className="odt-empty">
                                                        No customer orders found matching filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedOrders.map((order, index) => (
                                                    <tr key={order.id} className="orders-row-hover">
                                                        <td style={{ textAlign: "center", paddingRight: "10px" }}>
                                                            <input 
                                                                type="checkbox"
                                                                className="orders-checkbox-row"
                                                                checked={selectedOrderIds.includes(order.id)}
                                                                onChange={() => toggleSelectOrder(order.id)}
                                                                disabled={order.status !== "Pending" && order.status !== "Label Generated"}
                                                                title={order.status !== "Pending" && order.status !== "Label Generated" ? "Only Pending or Label Generated orders can be selected" : ""}
                                                            />
                                                        </td>
                                                        <td className="odt-id">{order.id}</td>
                                                        <td>
                                                            <div className="odt-customer">
                                                                <span className={`odt-avatar ${order.color || "avatar-indigo"}`}>
                                                                    {order.initials}
                                                                </span>
                                                                <div className="odt-customer-name">
                                                                    <div>{order.customer}</div>
                                                                    <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                                                        <Store size={10} style={{ display: "inline-block" }} /> {order.warehouse || "Koramangala Hub"}
                                                                    </span>
                                                                </div>
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
                                                                    <div 
                                                                        className="global-action-dropdown"
                                                                        style={index >= paginatedOrders.length - 2 && paginatedOrders.length > 2 ? { top: "auto", bottom: "36px" } : {}}
                                                                    >
                                                                        <button className="global-dropdown-item" onClick={() => openOrdView(order)}>
                                                                            <Eye size={13} />
                                                                            <span>View Details</span>
                                                                        </button>
                                                                        <button className="global-dropdown-item" onClick={() => openOrdEdit(order)}>
                                                                            <Edit2 size={13} />
                                                                            <span>Edit Order</span>
                                                                        </button>
                                                                        <button className="global-dropdown-item" onClick={() => handleGenerateInvoice(order)}>
                                                                            <FileText size={13} />
                                                                            <span>Generate Invoice</span>
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

                                {activePaginationView === "picking" && (
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
                                                paginatedPicks.map(item => {
                                                    const assocOrder = orders.find(o => o.id === item.orderId);
                                                    return (
                                                        <tr key={item.id} className="orders-row-hover">
                                                            <td className="odt-id">{item.id}</td>
                                                            <td className="odt-id">{item.orderId}</td>
                                                            <td className="odt-customer-name">
                                                                <div>{item.customer}</div>
                                                                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                                                    <Store size={10} /> {assocOrder?.warehouse || "Koramangala Hub"}
                                                                </span>
                                                            </td>
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
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </>
                                )}

                                {activePaginationView === "packing" && (
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
                                                paginatedPacks.map(item => {
                                                    const assocOrder = orders.find(o => o.id === item.orderId);
                                                    return (
                                                        <tr key={item.id} className="orders-row-hover">
                                                            <td className="odt-id">{item.id}</td>
                                                            <td className="odt-id">{item.orderId}</td>
                                                            <td className="odt-customer-name">
                                                                <div>{item.customer}</div>
                                                                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                                                    <Store size={10} /> {assocOrder?.warehouse || "Koramangala Hub"}
                                                                </span>
                                                            </td>
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
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </>
                                )}

                                {activePaginationView === "tracking" && (
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
                                                paginatedDeliveries.map(item => {
                                                    const assocOrder = orders.find(o => o.id === item.orderId);
                                                    return (
                                                        <tr key={item.id} className="orders-row-hover">
                                                            <td className="odt-id">{item.id}</td>
                                                            <td className="odt-id">{item.orderId}</td>
                                                            <td className="odt-customer-name">
                                                                <div>{item.customer}</div>
                                                                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                                                    <Store size={10} /> {assocOrder?.warehouse || "Koramangala Hub"}
                                                                </span>
                                                            </td>
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
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </>
                                )}

                                {activeTab === "label-history" && (
                                    <>
                                        <thead>
                                            <tr>
                                                <th>Batch ID</th>
                                                <th>Generated Date & Time</th>
                                                <th>Orders Count</th>
                                                <th>Labels Count</th>
                                                <th style={{ textAlign: "right" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="odt-empty">
                                                        No label printing history found. Generate some labels to start logging.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedHistory.map(batch => (
                                                    <tr key={batch.id} className="orders-row-hover">
                                                        <td className="odt-id">{batch.id}</td>
                                                        <td className="odt-date">{batch.timestamp}</td>
                                                        <td className="odt-items">{batch.ordersCount} orders</td>
                                                        <td className="odt-items">{batch.labelsCount} labels</td>
                                                        <td>
                                                            <div className="orders-actions-cell">
                                                                <button 
                                                                    className="orders-inline-btn orders-inline-btn--secondary"
                                                                    onClick={() => {
                                                                        setPreviewLabels(batch.labels);
                                                                        setIsPrintPreviewOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye size={12} />
                                                                    <span>Preview</span>
                                                                </button>
                                                                <button 
                                                                    className="orders-inline-btn"
                                                                    onClick={() => {
                                                                        setPreviewLabels(batch.labels);
                                                                        setIsPrintPreviewOpen(true);
                                                                        setTriggerImmediatePrint(true);
                                                                    }}
                                                                >
                                                                    <Printer size={12} />
                                                                    <span>Reprint Sheet</span>
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
                    )
                )}

                {/* Pagination Controls */}
                {!["management", "details", "new-query", "cancelled"].includes(activeTab) && 
                 ((activePaginationView === "orders" && filteredOrders.length > ROWS_PER_PAGE) ||
                  (activePaginationView === "pending" && filteredPendingOrders.length > ROWS_PER_PAGE) ||
                  (activePaginationView === "picking" && filteredPicks.length > ROWS_PER_PAGE) ||
                  (activePaginationView === "packing" && filteredPacks.length > ROWS_PER_PAGE) ||
                  (activePaginationView === "tracking" && filteredDeliveries.length > ROWS_PER_PAGE) ||
                  (activePaginationView === "label-history" && labelHistory.length > ROWS_PER_PAGE)) && (
                    <div className="orders-pagination print-btn-no-print">
                        <span className="orders-pagination-info">
                            Showing <strong>{
                                activePaginationView === "orders" ? Math.min(filteredOrders.length, (ordPage - 1) * ROWS_PER_PAGE + 1) :
                                activePaginationView === "pending" ? Math.min(filteredPendingOrders.length, (pendingPage - 1) * ROWS_PER_PAGE + 1) :
                                activePaginationView === "picking" ? Math.min(filteredPicks.length, (pickPage - 1) * ROWS_PER_PAGE + 1) :
                                activePaginationView === "packing" ? Math.min(filteredPacks.length, (packPage - 1) * ROWS_PER_PAGE + 1) :
                                activePaginationView === "tracking" ? Math.min(filteredDeliveries.length, (dlvPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(labelHistory.length, (histPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activePaginationView === "orders" ? Math.min(filteredOrders.length, ordPage * ROWS_PER_PAGE) :
                                activePaginationView === "pending" ? Math.min(filteredPendingOrders.length, pendingPage * ROWS_PER_PAGE) :
                                activePaginationView === "picking" ? Math.min(filteredPicks.length, pickPage * ROWS_PER_PAGE) :
                                activePaginationView === "packing" ? Math.min(filteredPacks.length, packPage * ROWS_PER_PAGE) :
                                activePaginationView === "tracking" ? Math.min(filteredDeliveries.length, dlvPage * ROWS_PER_PAGE) :
                                Math.min(labelHistory.length, histPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activePaginationView === "orders" ? filteredOrders.length :
                                activePaginationView === "pending" ? filteredPendingOrders.length :
                                activePaginationView === "picking" ? filteredPicks.length :
                                activePaginationView === "packing" ? filteredPacks.length :
                                activePaginationView === "tracking" ? filteredDeliveries.length :
                                labelHistory.length
                            }</strong> {activePaginationView === "label-history" ? "batches" : "orders"}
                        </span>

                        <div className="orders-pagination-controls">
                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activePaginationView === "orders") setOrdPage(p => Math.max(1, p - 1));
                                    else if (activePaginationView === "pending") setPendingPage(p => Math.max(1, p - 1));
                                    else if (activePaginationView === "picking") setPickPage(p => Math.max(1, p - 1));
                                    else if (activePaginationView === "packing") setPackPage(p => Math.max(1, p - 1));
                                    else if (activePaginationView === "tracking") setDlvPage(p => Math.max(1, p - 1));
                                    else setHistPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activePaginationView === "orders" ? ordPage === 1 :
                                    activePaginationView === "pending" ? pendingPage === 1 :
                                    activePaginationView === "picking" ? pickPage === 1 :
                                    activePaginationView === "packing" ? packPage === 1 :
                                    activePaginationView === "tracking" ? dlvPage === 1 :
                                    histPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length:
                                activePaginationView === "orders" ? Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                activePaginationView === "pending" ? Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE) :
                                activePaginationView === "picking" ? Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                activePaginationView === "packing" ? Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                activePaginationView === "tracking" ? Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE) :
                                Math.ceil(labelHistory.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`orders-page-btn orders-page-number ${
                                        (activePaginationView === "orders" && ordPage === page) ||
                                        (activePaginationView === "pending" && pendingPage === page) ||
                                        (activePaginationView === "picking" && pickPage === page) ||
                                        (activePaginationView === "packing" && packPage === page) ||
                                        (activePaginationView === "tracking" && dlvPage === page) ||
                                        (activePaginationView === "label-history" && histPage === page)
                                            ? "orders-page-number--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activePaginationView === "orders") setOrdPage(page);
                                        else if (activePaginationView === "pending") setPendingPage(page);
                                        else if (activePaginationView === "picking") setPickPage(page);
                                        else if (activePaginationView === "packing") setPackPage(page);
                                        else if (activePaginationView === "tracking") setDlvPage(page);
                                        else setHistPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activePaginationView === "orders") setOrdPage(p => Math.min(Math.ceil(filteredOrders.length / ROWS_PER_PAGE), p + 1));
                                    else if (activePaginationView === "pending") setPendingPage(p => Math.min(Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE), p + 1));
                                    else if (activePaginationView === "picking") setPickPage(p => Math.min(Math.ceil(filteredPicks.length / ROWS_PER_PAGE), p + 1));
                                    else if (activePaginationView === "packing") setPackPage(p => Math.min(Math.ceil(filteredPacks.length / ROWS_PER_PAGE), p + 1));
                                    else if (activePaginationView === "tracking") setDlvPage(p => Math.min(Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE), p + 1));
                                    else setHistPage(p => Math.min(Math.ceil(labelHistory.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activePaginationView === "orders" ? ordPage === Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                    activePaginationView === "pending" ? pendingPage === Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE) :
                                    activePaginationView === "picking" ? pickPage === Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                    activePaginationView === "packing" ? packPage === Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                    activePaginationView === "tracking" ? dlvPage === Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE) :
                                    histPage === Math.ceil(labelHistory.length / ROWS_PER_PAGE)
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
                                    <div className="orders-form-group">
                                        <label htmlFor="formWarehouse">Fulfillment Hub / Darkhouse</label>
                                        <select id="formWarehouse" value={formWarehouse} onChange={(e) => setFormWarehouse(e.target.value)}>
                                            {INITIAL_DARKHOUSES.map(d => (
                                                <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                                            ))}
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

                            {modalType === "ord-view" && (
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        handleGenerateInvoice(selectedItem);
                                    }}
                                    className="orders-modal-submit-btn"
                                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    <FileText size={14} />
                                    <span>Generate Invoice</span>
                                </button>
                            )}

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

            {/* ─── FLOATING BULK ACTIONS TOOLBAR ─── */}
            {selectedOrderIds.length > 0 && activeTab === "orders" && (boardStep === "all" || boardStep === "pending") && (
                <div className="orders-bulk-toolbar fade-in-up print-btn-no-print">
                    <div className="bulk-toolbar-info">
                        <div className="bulk-count-badge">{selectedOrderIds.length}</div>
                        <span className="bulk-text">Orders Selected</span>
                    </div>
                    <div className="bulk-toolbar-actions">
                        <button className="bulk-action-btn primary" onClick={handleBulkGenerateLabels}>
                            Generate Labels
                        </button>
                        <button className="bulk-action-btn success" onClick={handleBulkPrintLabels}>
                            <Printer size={13} />
                            <span>Print Labels</span>
                        </button>
                        {boardStep === "pending" ? (
                            <button className="bulk-action-btn info" onClick={handleBulkMarkReadyForPicking}>
                                Mark Ready For Picking
                            </button>
                        ) : (
                            <button className="bulk-action-btn info" onClick={handleBulkMarkReadyForPacking}>
                                Mark Ready For Packing
                            </button>
                        )}
                        <button className="bulk-action-btn cancel" onClick={() => setSelectedOrderIds([])}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ─── PRINT PREVIEW MODAL ─── */}
            {isPrintPreviewOpen && (
                <div className="orders-modal-backdrop preview-backdrop fade-in print-btn-no-print" onClick={() => setIsPrintPreviewOpen(false)}>
                    <div className="orders-modal-container preview-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="orders-modal-header preview-header">
                            <div className="orders-modal-header__icon-wrap">
                                <Printer size={18} />
                            </div>
                            <div className="orders-modal-header__text-block">
                                <h3 className="orders-modal-title">
                                    {labelLayoutFormat.startsWith('thermal') ? '🖨️ Thermal Printer' : '📄 A4 Warehouse'} Labels Print Preview
                                </h3>
                                <span className="orders-modal-subtitle">
                                    {previewLabels.length} Labels • {labelLayoutFormat === 'thermal-4inch' ? '4-inch Thermal' : labelLayoutFormat === 'thermal-100x50' ? '100×50mm Thermal' : 'A4 Sheet'} • HAATZA Dark Store Operations
                                </span>
                            </div>
                            <div className="preview-header-controls">
                                <select 
                                    className="orders-toolbar-select format-select"
                                    value={labelLayoutFormat}
                                    onChange={(e) => setLabelLayoutFormat(e.target.value)}
                                >
                                    <option value="thermal-4inch">🖨️ Thermal 4-inch (101.6mm)</option>
                                    <option value="thermal-100x50">🖨️ Thermal 100mm × 50mm</option>
                                    <option value="grid-2x4">📄 A4 Sheet - 2x4 Grid (8 labels)</option>
                                    <option value="grid-1x1">📄 A4 Sheet - 1x1 Grid (1 label)</option>
                                    <option value="grid-1x2">📄 A4 Sheet - 1x2 Grid (2 labels)</option>
                                    <option value="grid-2x2">📄 A4 Sheet - 2x2 Grid (4 labels)</option>
                                    <option value="grid-3x4">📄 A4 Sheet - 3x4 Grid (12 labels)</option>
                                </select>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="orders-modal-body preview-body">
                            <p className="adjust-explainer">
                                {labelLayoutFormat.startsWith('thermal') ? (
                                    <>
                                        <strong>🖨️ Thermal Printer Mode</strong><br/>
                                        • Use <strong>{labelLayoutFormat === 'thermal-4inch' ? '4-inch (101.6mm)' : '100mm'}</strong> thermal paper<br/>
                                        • Portrait orientation, continuous feed<br/>
                                        • Set printer to <strong>actual paper width</strong> in driver settings<br/>
                                        • No scaling - labels will stack vertically<br/>
                                        • Compatible with Zebra, TSC, XPrinter, and standard 4-inch thermal printers
                                    </>
                                ) : (
                                    <>
                                        <strong>📄 A4 Sheet Mode</strong><br/>
                                        • Printer set to <strong>A4</strong> paper, portrait orientation<br/>
                                        • <strong>No margins</strong> required (scale: 100%) for perfect alignment
                                    </>
                                )}
                            </p>
                            
                            <div className="preview-sheet-scroll-container">
                                <div className="preview-pages-wrapper">
                                    {chunkArray(previewLabels, getPageSize(labelLayoutFormat)).map((pageLabels, pageIndex) => (
                                        <div key={pageIndex} className={`a4-page-mockup ${labelLayoutFormat}`}>
                                            {pageLabels.map((label) => {
                                                const category = getCategoryForProduct(label.productName, label.sku);
                                                const barcode = new Barcode128Svg(label.id);
                                                
                                                // Barcode sizing for different formats
                                                if (labelLayoutFormat === "thermal-4inch" || labelLayoutFormat === "thermal-100x50") {
                                                    // Thermal printer: larger barcode for better scan reliability
                                                    barcode.height = 60;
                                                    barcode.factor = 2.5;
                                                } else if (labelLayoutFormat === "grid-1x1") {
                                                    barcode.height = 55;
                                                    barcode.factor = 2.4;
                                                } else if (labelLayoutFormat === "grid-1x2" || labelLayoutFormat === "grid-2x2") {
                                                    barcode.height = 45;
                                                    barcode.factor = 1.8;
                                                } else if (labelLayoutFormat === "grid-3x4") {
                                                    barcode.height = 25;
                                                    barcode.factor = 1.0;
                                                } else {
                                                    barcode.height = 30;
                                                    barcode.factor = 1.2;
                                                }
                                                const barcodeHtml = barcode.toString();
                                                
                                                return (
                                                    <div key={label.id} className={`quick-commerce-label category-${category.toLowerCase()}`}>
                                                        <div className="label-header-band">
                                                            <span className="label-category-badge">{category.toUpperCase()}</span>
                                                            <span className="label-logo-symbol">
                                                                ▲ <span className="label-logo-text">HAATZA</span>
                                                            </span>
                                                            <span className="label-qc-pill">✓ QC PASSED</span>
                                                        </div>
                                                        
                                                        <div className="label-main-content">
                                                            <div className="label-product-section">
                                                                <div className="label-brand-name">{label.brand}</div>
                                                                <div className="label-product-title">{label.productName}</div>
                                                            </div>
                                                            <div className="label-weight-badge">{label.netWeight}</div>
                                                        </div>

                                                        <div className="label-details-grid">
                                                            <div className="detail-item">
                                                                <span className="detail-label">ORDER ID</span>
                                                                <span className="detail-value highlight">{label.orderId}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <span className="detail-label">BATCH ID</span>
                                                                <span className="detail-value monospace">{label.batchId}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <span className="detail-label">PACKED BY</span>
                                                                <span className="detail-value">{label.packedBy}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <span className="detail-label">PACKED DATE</span>
                                                                <span className="detail-value">{label.packedDate}</span>
                                                            </div>
                                                            <div className="detail-item full-width">
                                                                <span className="detail-label">HUB / ORIGIN</span>
                                                                <span className="detail-value">{label.warehouse} (SKU: {label.sku})</span>
                                                            </div>
                                                        </div>

                                                        <div className="label-barcode-section">
                                                            <div className="label-barcode-graphic" dangerouslySetInnerHTML={{ __html: barcodeHtml }} />
                                                            <div className="label-barcode-text">{label.id}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="orders-modal-footer preview-footer">
                            <button className="orders-modal-cancel-btn" onClick={() => setIsPrintPreviewOpen(false)}>
                                Close
                            </button>
                            <button 
                                className="orders-modal-submit-btn print-submit-btn" 
                                onClick={triggerPrint}
                            >
                                <Printer size={15} />
                                <span>Print Sheet</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {isInvoiceOpen && invoiceOrder && (
                <InvoicePreviewModal
                    isOpen={isInvoiceOpen}
                    order={invoiceOrder}
                    onClose={() => setIsInvoiceOpen(false)}
                />
            )}

            {/* ─── DEDICATED PRINT CONTAINER (HIDDEN ON SCREEN, VISIBLE ON PRINT) ─── */}
            {previewLabels.length > 0 && createPortal(
                <div id="print-sheet">
                    {chunkArray(previewLabels, getPageSize(labelLayoutFormat)).map((pageLabels, pageIndex) => (
                        <div key={pageIndex} className={`a4-page-print-sheet ${labelLayoutFormat}`}>
                            {pageLabels.map((label) => {
                                const category = getCategoryForProduct(label.productName, label.sku);
                                const barcode = new Barcode128Svg(label.id);
                                
                                // Barcode sizing for different formats
                                if (labelLayoutFormat === "thermal-4inch" || labelLayoutFormat === "thermal-100x50") {
                                    // Thermal printer: larger barcode for better scan reliability
                                    barcode.height = 60;
                                    barcode.factor = 2.5;
                                } else if (labelLayoutFormat === "grid-1x1") {
                                    barcode.height = 55;
                                    barcode.factor = 2.4;
                                } else if (labelLayoutFormat === "grid-1x2" || labelLayoutFormat === "grid-2x2") {
                                    barcode.height = 45;
                                    barcode.factor = 1.8;
                                } else if (labelLayoutFormat === "grid-3x4") {
                                    barcode.height = 25;
                                    barcode.factor = 1.0;
                                } else {
                                    barcode.height = 30;
                                    barcode.factor = 1.2;
                                }
                                const barcodeHtml = barcode.toString();
                                
                                return (
                                    <div key={label.id} className={`quick-commerce-label printable category-${category.toLowerCase()}`}>
                                        <div className="label-header-band">
                                            <span className="label-category-badge">{category.toUpperCase()}</span>
                                            <span className="label-logo-symbol">
                                                ▲ <span className="label-logo-text">HAATZA</span>
                                            </span>
                                            <span className="label-qc-pill">✓ QC PASSED</span>
                                        </div>
                                        
                                        <div className="label-main-content">
                                            <div className="label-product-section">
                                                <div className="label-brand-name">{label.brand}</div>
                                                <div className="label-product-title">{label.productName}</div>
                                            </div>
                                            <div className="label-weight-badge">{label.netWeight}</div>
                                        </div>

                                        <div className="label-details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">ORDER ID</span>
                                                <span className="detail-value highlight">{label.orderId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">BATCH ID</span>
                                                <span className="detail-value monospace">{label.batchId}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">PACKED BY</span>
                                                <span className="detail-value">{label.packedBy}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">PACKED DATE</span>
                                                <span className="detail-value">{label.packedDate}</span>
                                            </div>
                                            <div className="detail-item full-width">
                                                <span className="detail-label">HUB / ORIGIN</span>
                                                <span className="detail-value">{label.warehouse} (SKU: {label.sku})</span>
                                            </div>
                                        </div>

                                        <div className="label-barcode-section">
                                            <div className="label-barcode-graphic" dangerouslySetInnerHTML={{ __html: barcodeHtml }} />
                                            <div className="label-barcode-text">{label.id}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export default OrdersPage;
