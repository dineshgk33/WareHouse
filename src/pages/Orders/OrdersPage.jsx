import React, { useState, useMemo, useEffect, useCallback } from "react";
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
    FileText,
    Download
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PICKING, MOCK_PACKING, MOCK_DELIVERY } from "../../data/ordersData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import { getOrderStatusClass } from "../../utils/statusUtils";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useToast } from "../../hooks/useToast";
import { Barcode128Svg } from "../../utils/barcode";
import { generateInvoiceBlobUrl, downloadInvoicePDF, printInvoicePDF } from "../../utils/invoiceGenerator";
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
    const activeTab = location.pathname === "/orders/pending" ? "pending" : (searchParams.get("tab") || "orders");

    // ─── States ───────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [picks, setPicks] = useState(MOCK_PICKING);
    const [packs, setPacks] = useState(MOCK_PACKING);
    const [deliveries, setDeliveries] = useState(MOCK_DELIVERY);

    // Dynamic Active Dropdowns (per row)
    const [activeRowMenuId, setActiveRowMenuId] = useState(null);

    // Filters Pending Orders
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingPage, setPendingPage] = useState(1);

    // Filters All Orders
    const [ordSearch, setOrdSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
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
    }, [activeTab]);    // Invoice Modal States
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
    const [invoiceBlobUrl, setInvoiceBlobUrl] = useState(null);

    const handleViewInvoice = useCallback((order) => {
        if (invoiceBlobUrl) {
            URL.revokeObjectURL(invoiceBlobUrl);
        }
        const url = generateInvoiceBlobUrl(order);
        setInvoiceBlobUrl(url);
        setSelectedInvoiceOrder(order);
        setActiveRowMenuId(null);
    }, [invoiceBlobUrl]);

    const handleCloseInvoiceModal = () => {
        setSelectedInvoiceOrder(null);
        if (invoiceBlobUrl) {
            URL.revokeObjectURL(invoiceBlobUrl);
            setInvoiceBlobUrl(null);
        }
    };

    const handleDownloadInvoice = (order) => {
        downloadInvoicePDF(order);
        setActiveRowMenuId(null);
    };

    // Keep references for event listener to avoid re-binding
    const handleViewInvoiceRef = React.useRef(handleViewInvoice);
    const ordersRef = React.useRef(orders);

    useEffect(() => {
        handleViewInvoiceRef.current = handleViewInvoice;
    }, [handleViewInvoice]);

    useEffect(() => {
        ordersRef.current = orders;
    }, [orders]);

    // Scanner Keyboard Emulation Event Listener
    useEffect(() => {
        let buffer = "";
        let lastKeyTime = 0;

        const handleKeyDown = (e) => {
            const key = e.key;
            const now = Date.now();

            if (key === "Enter") {
                if (buffer.length >= 3 && now - lastKeyTime < 100) {
                    const scannedCode = buffer.trim();
                    let orderIdCandidate = scannedCode;

                    if (/-\d+$/.test(orderIdCandidate)) {
                        orderIdCandidate = orderIdCandidate.replace(/-\d+$/, "");
                    }

                    if (!orderIdCandidate.startsWith("#") && (orderIdCandidate.toUpperCase().startsWith("ORD") || orderIdCandidate.toUpperCase().startsWith("TEST"))) {
                        orderIdCandidate = "#" + orderIdCandidate;
                    }

                    const foundOrder = ordersRef.current.find(o => 
                        o.id.toLowerCase() === orderIdCandidate.toLowerCase() ||
                        o.id.toLowerCase().replace("#", "") === orderIdCandidate.toLowerCase().replace("#", "")
                    );

                    if (foundOrder) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewInvoiceRef.current(foundOrder);
                        showToast(`Scanner: Order ${foundOrder.id} identified.`);
                    }
                    buffer = "";
                } else {
                    buffer = "";
                }
                return;
            }

            if (!key || key.length !== 1) {
                return;
            }

            const timeDiff = now - lastKeyTime;
            if (buffer.length > 0 && timeDiff > 50) {
                buffer = key;
            } else {
                buffer += key;
            }
            lastKeyTime = now;
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Clean up blob URL on unmount
    useEffect(() => {
        return () => {
            if (invoiceBlobUrl) {
                URL.revokeObjectURL(invoiceBlobUrl);
            }
        };
    }, [invoiceBlobUrl]);

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
            
            return matchesSearch && matchesStatus;
        });
    }, [orders, ordSearch, selectedStatus]);

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

    // Filters Pending Orders
    const filteredPendingOrders = useMemo(() => {
        return orders.filter(o => {
            if (o.status !== "Pending") return false;
            const query = pendingSearch.toLowerCase();
            const matchesId = o.id.toLowerCase().includes(query);
            const matchesCustomer = o.customer.toLowerCase().includes(query);
            const matchesMobile = o.mobile ? o.mobile.toLowerCase().includes(query) : false;
            return matchesId || matchesCustomer || matchesMobile;
        });
    }, [orders, pendingSearch]);

    const paginatedPendingOrders = useMemo(() => {
        const start = (pendingPage - 1) * ROWS_PER_PAGE;
        return filteredPendingOrders.slice(start, start + ROWS_PER_PAGE);
    }, [filteredPendingOrders, pendingPage]);

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
        const targetList = activeTab === "pending" ? paginatedPendingOrders : paginatedOrders.filter(o => o.status === "Pending" || o.status === "Label Generated");
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

       const handleCardClick = (status) => {
        if (status === "Pending") {
            navigate("/orders/pending");
        } else {
            navigate("/orders");
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
    // Open accessible confirm dialog instead of window.confirm()
    const handleCancelOrder = (id) => {
        setConfirmState({ open: true, orderId: id });
        setActiveRowMenuId(null);
    };

    const handleConfirmCancel = () => {
        const id = confirmState.orderId;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Cancelled" } : o));
        setConfirmState({ open: false, orderId: null });
        showToast(`Cancelled order ${id}`);
    };

    const handleCancelDismiss = () => {
        setConfirmState({ open: false, orderId: null });
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
        setPacks(prev => prev.map(p => p.id === id ? { ...p, status: "Packed" } : p));
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
                        {activeTab === "orders" && "All Orders"}
                        {activeTab === "pending" && "Pending Orders"}
                        {activeTab === "picking" && "Order Picking Control"}
                        {activeTab === "packing" && "Order Packing & Labeling"}
                        {activeTab === "tracking" && "Real-Time Delivery Tracking"}
                        {activeTab === "label-history" && "Label Printing History Log"}
                    </h1>
                    <p className="orders-header-subtitle">
                        {activeTab === "orders" && "Track customer invoices, payment statuses, and overall execution lifecycle."}
                        {activeTab === "pending" && "Track and manage all newly placed orders awaiting warehouse processing."}
                        {activeTab === "picking" && "Dispatch inventory pickers to gather mapped items across darkhouse bins."}
                        {activeTab === "packing" && "Box, seal, and generate custom package barcode tags for active riders."}
                        {activeTab === "tracking" && "Monitor dispatch riders, ETAs, active locations, and package handovers."}
                        {activeTab === "label-history" && "Search, audit, and reprint previously compiled A4 adhesive label sheets."}
                    </p>
                </div>
                {activeTab === "orders" && (
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
                {(activeTab === "orders" || activeTab === "pending") && (
                    <>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "ALL" ? "active" : ""}`}
                            onClick={() => handleCardClick("ALL")}
                        >
                            <span className="stat-dot dot-info" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.total}</span>
                                <span className="stat-card-label">All Orders</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "pending" || (activeTab === "orders" && selectedStatus === "Pending") ? "active" : ""}`}
                            onClick={() => handleCardClick("Pending")}
                        >
                            <span className="stat-dot dot-pending" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.pending}</span>
                                <span className="stat-card-label">Pending Orders</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "Picking" ? "active" : ""}`}
                            onClick={() => handleCardClick("Picking")}
                        >
                            <span className="stat-dot dot-info" style={{ backgroundColor: "#3b82f6" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.picking}</span>
                                <span className="stat-card-label">Picking</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "Packing" ? "active" : ""}`}
                            onClick={() => handleCardClick("Packing")}
                        >
                            <span className="stat-dot dot-pending" style={{ backgroundColor: "#f97316" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.packing}</span>
                                <span className="stat-card-label">Packing</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "Ready To Dispatch" ? "active" : ""}`}
                            onClick={() => handleCardClick("Ready To Dispatch")}
                        >
                            <span className="stat-dot dot-shipped" style={{ backgroundColor: "#10b981" }} />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.readyToDispatch}</span>
                                <span className="stat-card-label">Ready To Dispatch</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "Shipped" ? "active" : ""}`}
                            onClick={() => handleCardClick("Shipped")}
                        >
                            <span className="stat-dot dot-shipped" />
                            <div className="stat-card-body">
                                <span className="stat-card-value">{ordStats.shipped}</span>
                                <span className="stat-card-label">Shipped</span>
                            </div>
                        </div>
                        <div 
                            className={`orders-stat-card ${activeTab === "orders" && selectedStatus === "Delivered" ? "active" : ""}`}
                            onClick={() => handleCardClick("Delivered")}
                        >
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
                            aria-selected={activeTab === "orders"}
                            className={`orders-tab ${activeTab === "orders" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("orders")}
                        >
                            All Orders
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "pending"}
                            className={`orders-tab ${activeTab === "pending" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("pending")}
                        >
                            Pending Orders
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
                        <button
                            role="tab"
                            aria-selected={activeTab === "label-history"}
                            className={`orders-tab ${activeTab === "label-history" ? "orders-tab--active" : ""}`}
                            onClick={() => handleTabClick("label-history")}
                        >
                            Label History
                        </button>
                    </div>

                    {/* Toolbar Search / Select Filters */}
                    <div className="orders-toolbar__actions">
                        {activeTab === "pending" && (
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
                        {activeTab === "label-history" && (
                            <div className="orders-toolbar-log-info" style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                                Total printed batches recorded: {labelHistory.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Data Grid */}
                {activeTab === "pending" && filteredPendingOrders.length === 0 ? (
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
                            onClick={() => handleTabClick("orders")}
                            style={{ padding: "10px 24px", fontSize: "13px" }}
                        >
                            View All Orders
                        </button>
                    </div>
                ) : (
                    <div className="orders-table-responsive">
                        <table className="orders-data-table">
                            {activeTab === "pending" && (
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
                                                <td className="odt-id">
                                                    {order.id}
                                                    <button 
                                                        className="invoice-icon-btn" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewInvoice(order);
                                                        }}
                                                        title="View Tax Invoice"
                                                    >
                                                        <FileText size={12} />
                                                    </button>
                                                </td>
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
                                                                <button className="global-dropdown-item" onClick={() => handleViewInvoice(order)}>
                                                                    <FileText size={13} />
                                                                    <span>View Invoice</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => handleDownloadInvoice(order)}>
                                                                    <Download size={13} />
                                                                    <span>Download Invoice</span>
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
                            {activeTab === "orders" && (
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
                                                <td className="odt-id">
                                                    {order.id}
                                                    <button 
                                                        className="invoice-icon-btn" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewInvoice(order);
                                                        }}
                                                        title="View Tax Invoice"
                                                    >
                                                        <FileText size={12} />
                                                    </button>
                                                </td>
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
                                                                <button className="global-dropdown-item" onClick={() => handleViewInvoice(order)}>
                                                                    <FileText size={13} />
                                                                    <span>View Invoice</span>
                                                                </button>
                                                                <button className="global-dropdown-item" onClick={() => handleDownloadInvoice(order)}>
                                                                    <Download size={13} />
                                                                    <span>Download Invoice</span>
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
            )}

                {/* Pagination Controls */}
                {((activeTab === "orders" && filteredOrders.length > ROWS_PER_PAGE) ||
                  (activeTab === "pending" && filteredPendingOrders.length > ROWS_PER_PAGE) ||
                  (activeTab === "picking" && filteredPicks.length > ROWS_PER_PAGE) ||
                  (activeTab === "packing" && filteredPacks.length > ROWS_PER_PAGE) ||
                  (activeTab === "tracking" && filteredDeliveries.length > ROWS_PER_PAGE) ||
                  (activeTab === "label-history" && labelHistory.length > ROWS_PER_PAGE)) && (
                    <div className="orders-pagination print-btn-no-print">
                        <span className="orders-pagination-info">
                            Showing <strong>{
                                activeTab === "orders" ? Math.min(filteredOrders.length, (ordPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "pending" ? Math.min(filteredPendingOrders.length, (pendingPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "picking" ? Math.min(filteredPicks.length, (pickPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "packing" ? Math.min(filteredPacks.length, (packPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "tracking" ? Math.min(filteredDeliveries.length, (dlvPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(labelHistory.length, (histPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activeTab === "orders" ? Math.min(filteredOrders.length, ordPage * ROWS_PER_PAGE) :
                                activeTab === "pending" ? Math.min(filteredPendingOrders.length, pendingPage * ROWS_PER_PAGE) :
                                activeTab === "picking" ? Math.min(filteredPicks.length, pickPage * ROWS_PER_PAGE) :
                                activeTab === "packing" ? Math.min(filteredPacks.length, packPage * ROWS_PER_PAGE) :
                                activeTab === "tracking" ? Math.min(filteredDeliveries.length, dlvPage * ROWS_PER_PAGE) :
                                Math.min(labelHistory.length, histPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activeTab === "orders" ? filteredOrders.length :
                                activeTab === "pending" ? filteredPendingOrders.length :
                                activeTab === "picking" ? filteredPicks.length :
                                activeTab === "packing" ? filteredPacks.length :
                                activeTab === "tracking" ? filteredDeliveries.length :
                                labelHistory.length
                            }</strong> {activeTab === "label-history" ? "batches" : "orders"}
                        </span>

                        <div className="orders-pagination-controls">
                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activeTab === "orders") setOrdPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "pending") setPendingPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "picking") setPickPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "packing") setPackPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "tracking") setDlvPage(p => Math.max(1, p - 1));
                                    else setHistPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activeTab === "orders" ? ordPage === 1 :
                                    activeTab === "pending" ? pendingPage === 1 :
                                    activeTab === "picking" ? pickPage === 1 :
                                    activeTab === "packing" ? packPage === 1 :
                                    activeTab === "tracking" ? dlvPage === 1 :
                                    histPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length:
                                activeTab === "orders" ? Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                activeTab === "pending" ? Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE) :
                                activeTab === "picking" ? Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                activeTab === "packing" ? Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                activeTab === "tracking" ? Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE) :
                                Math.ceil(labelHistory.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`orders-page-btn orders-page-number ${
                                        (activeTab === "orders" && ordPage === page) ||
                                        (activeTab === "pending" && pendingPage === page) ||
                                        (activeTab === "picking" && pickPage === page) ||
                                        (activeTab === "packing" && packPage === page) ||
                                        (activeTab === "tracking" && dlvPage === page) ||
                                        (activeTab === "label-history" && histPage === page)
                                            ? "orders-page-number--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeTab === "orders") setOrdPage(page);
                                        else if (activeTab === "pending") setPendingPage(page);
                                        else if (activeTab === "picking") setPickPage(page);
                                        else if (activeTab === "packing") setPackPage(page);
                                        else if (activeTab === "tracking") setDlvPage(page);
                                        else setHistPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="orders-page-btn"
                                onClick={() => {
                                    if (activeTab === "orders") setOrdPage(p => Math.min(Math.ceil(filteredOrders.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "pending") setPendingPage(p => Math.min(Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "picking") setPickPage(p => Math.min(Math.ceil(filteredPicks.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "packing") setPackPage(p => Math.min(Math.ceil(filteredPacks.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "tracking") setDlvPage(p => Math.min(Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE), p + 1));
                                    else setHistPage(p => Math.min(Math.ceil(labelHistory.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activeTab === "orders" ? ordPage === Math.ceil(filteredOrders.length / ROWS_PER_PAGE) :
                                    activeTab === "pending" ? pendingPage === Math.ceil(filteredPendingOrders.length / ROWS_PER_PAGE) :
                                    activeTab === "picking" ? pickPage === Math.ceil(filteredPicks.length / ROWS_PER_PAGE) :
                                    activeTab === "packing" ? packPage === Math.ceil(filteredPacks.length / ROWS_PER_PAGE) :
                                    activeTab === "tracking" ? dlvPage === Math.ceil(filteredDeliveries.length / ROWS_PER_PAGE) :
                                    histPage === Math.ceil(labelHistory.length / ROWS_PER_PAGE)
                                }
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── INVOICE PREVIEW MODAL ─────────────────────────────────────────── */}
            {selectedInvoiceOrder && (
                <div className="invoice-modal-backdrop fade-in" onClick={handleCloseInvoiceModal}>
                    <div className="invoice-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="invoice-modal-header">
                            <div className="invoice-modal-header-left">
                                <div className="orders-modal-header__icon-wrap" style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)" }}>
                                    <FileText size={18} />
                                </div>
                                <div className="orders-modal-header__text-block">
                                    <h3 className="orders-modal-title">GST Tax Invoice</h3>
                                    <span className="orders-modal-subtitle">
                                        {selectedInvoiceOrder.id}
                                    </span>
                                </div>
                            </div>
                            <div className="invoice-modal-header-actions">
                                <button 
                                    className="bulk-action-btn success" 
                                    onClick={() => printInvoicePDF(selectedInvoiceOrder)}
                                    title="Print Invoice"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 14px" }}
                                >
                                    <Printer size={13} />
                                    <span>Print</span>
                                </button>
                                <button 
                                    className="bulk-action-btn primary" 
                                    onClick={() => downloadInvoicePDF(selectedInvoiceOrder)}
                                    title="Download PDF"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", padding: "0 14px" }}
                                >
                                    <Download size={13} />
                                    <span>Download</span>
                                </button>
                                <button 
                                    className="orders-modal-cancel-btn" 
                                    onClick={handleCloseInvoiceModal}
                                    style={{ margin: 0, padding: "8px 16px", height: "36px", display: "inline-flex", alignItems: "center" }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="invoice-modal-body">
                            {invoiceBlobUrl ? (
                                <iframe 
                                    id="invoice-preview-iframe"
                                    className="invoice-iframe" 
                                    src={invoiceBlobUrl} 
                                    title={`Invoice Preview for ${selectedInvoiceOrder.id}`}
                                />
                            ) : (
                                <div className="odt-empty">Generating PDF Preview...</div>
                            )}
                        </div>

                    </div>
                </div>
            )}

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

            {/* ─── FLOATING BULK ACTIONS TOOLBAR ─── */}
            {selectedOrderIds.length > 0 && (activeTab === "orders" || activeTab === "pending") && (
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
                        {activeTab === "pending" ? (
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
