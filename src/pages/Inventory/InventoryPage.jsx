import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Download,
    AlertTriangle,
    Package,
    RefreshCw,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    XCircle,
    Store,
    Repeat,
    Eye,
    Edit2,
    SlidersHorizontal,
    Plus,
    CheckCircle,
    Truck,
    ArrowLeftRight,
    Settings
} from "lucide-react";
import { MOCK_WAREHOUSE_STOCK, MOCK_DARKHOUSE_STOCK, MOCK_STOCK_TRANSFERS } from "../../data/inventoryData";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import { getInventoryStatusClass } from "../../utils/statusUtils";
import { useAuth } from "../../context/AuthContext";
import "./Inventory.css";

const MOCK_GLOBAL_PRODUCTS = [
    { id: "GP-01", sku: "FRT-MNG-ALP", name: "Fresh Alphonso Mangoes", category: "Fruits & Vegetables", price: 150, stock: 120 },
    { id: "GP-02", sku: "DRY-MLK-TAZ", name: "Amul Taaza Toned Milk", category: "Dairy & Bread", price: 30, stock: 350 },
    { id: "GP-03", sku: "SNK-LYS-CLT", name: "Lay's Classic Salted Chips", category: "Munchies & Snacks", price: 20, stock: 450 },
    { id: "GP-04", sku: "DRK-COK-ZER", name: "Coca-Cola Zero Sugar", category: "Cold Drinks & Juices", price: 40, stock: 280 },
    { id: "GP-05", sku: "FZN-MCN-FRS", name: "McCain French Fries", category: "Instant & Frozen Food", price: 110, stock: 15 },
    { id: "GP-06", sku: "PSC-DTL-HDW", name: "Dettol Liquid Handwash", category: "Personal Care", price: 99, stock: 0 },
    { id: "GP-07", sku: "HSE-SRF-EXC", name: "Surf Excel Easy Wash", category: "Household Essentials", price: 140, stock: 180 },
    { id: "GP-08", sku: "BBY-JHN-POW", name: "Johnson's Baby Powder", category: "Baby Care", price: 190, stock: 8 },
    { id: "GP-09", sku: "FRT-APP-RDL", name: "Red Delicious Apples", category: "Fruits & Vegetables", price: 180, stock: 95 },
    { id: "GP-10", sku: "DRY-BRD-BRN", name: "Britannia Brown Bread", category: "Dairy & Bread", price: 45, stock: 110 },
];

function FindProductToSell({ darkhouseStock, setDarkhouseStock, currentDhSelect, setDhSelect, darkhouses }) {
    const [selectedDh, setSelectedDh] = useState(
        currentDhSelect === "All" || !currentDhSelect
            ? (darkhouses.find(d => d !== "All") || "HAATZA Koramangala Hub")
            : currentDhSelect
    );

    const [tempLocalProducts, setTempLocalProducts] = useState([]);
    const [tempGlobalProducts, setTempGlobalProducts] = useState([]);

    const [globalSearch, setGlobalSearch] = useState("");
    const [localSearch, setLocalSearch] = useState("");

    const [globalSelectedSkus, setGlobalSelectedSkus] = useState(new Set());
    const [localSelectedSkus, setLocalSelectedSkus] = useState(new Set());

    const [toast, setToast] = useState({ show: false, message: "" });

    // Re-initialize lists when selected darkhouse changes or database stock updates
    useEffect(() => {
        const localSkus = new Set(
            darkhouseStock
                .filter(item => item.darkhouse === selectedDh)
                .map(item => item.sku)
        );

        const local = MOCK_GLOBAL_PRODUCTS.filter(p => localSkus.has(p.sku));
        const global = MOCK_GLOBAL_PRODUCTS.filter(p => !localSkus.has(p.sku));

        setTimeout(() => {
            setTempLocalProducts(local);
            setTempGlobalProducts(global);
            setGlobalSelectedSkus(new Set());
            setLocalSelectedSkus(new Set());
        }, 0);
    }, [selectedDh]);

    const handleMoveRight = () => {
        const selectedItems = tempGlobalProducts.filter(p => globalSelectedSkus.has(p.sku));
        if (selectedItems.length === 0) return;

        setTempLocalProducts(prev => [...prev, ...selectedItems]);
        setTempGlobalProducts(prev => prev.filter(p => !globalSelectedSkus.has(p.sku)));
        setGlobalSelectedSkus(new Set());
    };

    const handleMoveLeft = () => {
        const selectedItems = tempLocalProducts.filter(p => localSelectedSkus.has(p.sku));
        if (selectedItems.length === 0) return;

        setTempGlobalProducts(prev => [...prev, ...selectedItems]);
        setTempLocalProducts(prev => prev.filter(p => !localSelectedSkus.has(p.sku)));
        setLocalSelectedSkus(new Set());
    };

    const handleSave = () => {
        const existingStockMap = new Map();
        darkhouseStock
            .filter(item => item.darkhouse === selectedDh)
            .forEach(item => {
                existingStockMap.set(item.sku, item);
            });

        const updatedLocalStock = tempLocalProducts.map(p => {
            if (existingStockMap.has(p.sku)) {
                return existingStockMap.get(p.sku);
            } else {
                return {
                    id: `DHS-${Math.floor(1000 + Math.random() * 9000)}`,
                    darkhouse: selectedDh,
                    product: p.name,
                    sku: p.sku,
                    available: 0,
                    reserved: 0,
                    reorder: 10,
                    status: "Out of Stock"
                };
            }
        });

        setDarkhouseStock(prev => {
            const otherStock = prev.filter(item => item.darkhouse !== selectedDh);
            return [...otherStock, ...updatedLocalStock];
        });

        setToast({ show: true, message: `Successfully saved catalogue for ${selectedDh}!` });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleDiscard = () => {
        const localSkus = new Set(
            darkhouseStock
                .filter(item => item.darkhouse === selectedDh)
                .map(item => item.sku)
        );

        const local = MOCK_GLOBAL_PRODUCTS.filter(p => localSkus.has(p.sku));
        const global = MOCK_GLOBAL_PRODUCTS.filter(p => !localSkus.has(p.sku));

        setTempLocalProducts(local);
        setTempGlobalProducts(global);
        setGlobalSelectedSkus(new Set());
        setLocalSelectedSkus(new Set());

        setToast({ show: true, message: "Discarded temporary changes." });
        setTimeout(() => setToast({ show: false, message: "" }), 2000);
    };

    const filteredGlobal = tempGlobalProducts.filter(p =>
        p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const filteredLocal = tempLocalProducts.filter(p =>
        p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(localSearch.toLowerCase())
    );

    const toggleGlobalSelected = (sku) => {
        setGlobalSelectedSkus(prev => {
            const next = new Set(prev);
            if (next.has(sku)) next.delete(sku);
            else next.add(sku);
            return next;
        });
    };

    const toggleLocalSelected = (sku) => {
        setLocalSelectedSkus(prev => {
            const next = new Set(prev);
            if (next.has(sku)) next.delete(sku);
            else next.add(sku);
            return next;
        });
    };

    const toggleAllGlobal = () => {
        const allFilteredSkus = filteredGlobal.map(p => p.sku);
        const isAllSelected = allFilteredSkus.length > 0 && allFilteredSkus.every(sku => globalSelectedSkus.has(sku));

        setGlobalSelectedSkus(prev => {
            const next = new Set(prev);
            if (isAllSelected) {
                allFilteredSkus.forEach(sku => next.delete(sku));
            } else {
                allFilteredSkus.forEach(sku => next.add(sku));
            }
            return next;
        });
    };

    const toggleAllLocal = () => {
        const allFilteredSkus = filteredLocal.map(p => p.sku);
        const isAllSelected = allFilteredSkus.length > 0 && allFilteredSkus.every(sku => localSelectedSkus.has(sku));

        setLocalSelectedSkus(prev => {
            const next = new Set(prev);
            if (isAllSelected) {
                allFilteredSkus.forEach(sku => next.delete(sku));
            } else {
                allFilteredSkus.forEach(sku => next.add(sku));
            }
            return next;
        });
    };



    return (
        <div className="p-1 sm:p-4 bg-slate-50/50 rounded-2xl">
            {/* Darkhouse selection panel */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 m-0">
                        <Store className="text-[#020079]" size={18} />
                        <span>Configure Catalogue for Darkhouse Hub</span>
                    </h2>
                    <p className="text-xs text-slate-500 m-0 mt-1">Select a destination darkhouse hub to manage its sellable catalog items</p>
                </div>
                <select
                    value={selectedDh}
                    onChange={(e) => {
                        setSelectedDh(e.target.value);
                        setDhSelect(e.target.value); // Sync with parent filter
                    }}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] cursor-pointer shadow-sm min-w-[250px]"
                >
                    {darkhouses.filter(d => d !== "All").map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Transfer Lists Container */}
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
                {/* Left Card: Global Products */}
                <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Global Products</h3>
                            <p className="text-xs text-slate-400 m-0 mt-0.5">Master product catalogue</p>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {filteredGlobal.length} products
                        </span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search global products..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] transition-all text-sm"
                        />
                    </div>

                    {/* Scrollable list box */}
                    <div className="flex-1 overflow-y-auto max-h-[380px] min-h-[250px] border border-slate-100 rounded-xl bg-slate-50/20">
                        {filteredGlobal.length === 0 ? (
                            <EmptyState message="No global products found" type="global" />
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                        <th className="p-3 text-left w-10">
                                            <input
                                                type="checkbox"
                                                checked={filteredGlobal.length > 0 && filteredGlobal.every(p => globalSelectedSkus.has(p.sku))}
                                                onChange={toggleAllGlobal}
                                                className="w-4 h-4 rounded text-[#020079] border-slate-300 focus:ring-[#020079] cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                                        <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price / Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGlobal.map((p) => {
                                        const isSelected = globalSelectedSkus.has(p.sku);
                                        return (
                                            <tr
                                                key={p.sku}
                                                onClick={() => toggleGlobalSelected(p.sku)}
                                                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? "bg-slate-50" : ""}`}
                                            >
                                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleGlobalSelected(p.sku)}
                                                        className="w-4 h-4 rounded text-[#020079] border-slate-300 focus:ring-[#020079] cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3 text-xs font-mono font-semibold text-slate-500">{p.sku}</td>
                                                <td className="p-3">
                                                    <div className="text-sm font-semibold text-slate-700">{p.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{p.category}</div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="text-xs font-semibold text-slate-700">₹{p.price}</div>
                                                    <div className={`text-[10px] font-medium ${p.stock === 0 ? "text-red-500" : "text-slate-400"}`}>
                                                        {p.stock === 0 ? "Out of Stock" : `${p.stock} units`}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Arrow Action Buttons */}
                <div className="flex lg:flex-col items-center justify-center gap-4 py-4 lg:py-0 px-2">
                    <button
                        onClick={handleMoveRight}
                        disabled={globalSelectedSkus.size === 0}
                        title="Move Selected to Local Catalogue"
                        className={`p-3.5 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 border ${
                            globalSelectedSkus.size > 0
                                ? "bg-[#020079] text-white hover:bg-[#020079]/90 hover:scale-105 active:scale-95 border-transparent cursor-pointer"
                                : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                        <ChevronRight size={20} className="hidden lg:block font-bold" />
                        <ChevronDown size={20} className="block lg:hidden font-bold" />
                    </button>
                    <button
                        onClick={handleMoveLeft}
                        disabled={localSelectedSkus.size === 0}
                        title="Remove Selected from Local Catalogue"
                        className={`p-3.5 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 border ${
                            localSelectedSkus.size > 0
                                ? "bg-[#020079] text-white hover:bg-[#020079]/90 hover:scale-105 active:scale-95 border-transparent cursor-pointer"
                                : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                        <ChevronLeft size={20} className="hidden lg:block font-bold" />
                        <ChevronUp size={20} className="block lg:hidden font-bold" />
                    </button>
                </div>

                {/* Right Card: Local Products */}
                <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col min-h-[480px]">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 m-0">Local Products</h3>
                            <p className="text-xs text-slate-400 m-0 mt-0.5">Assigned to local store</p>
                        </div>
                        <span className="bg-[#020079]/10 text-[#020079] text-xs font-semibold px-2.5 py-1 rounded-full">
                            {filteredLocal.length} products
                        </span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search local products..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] transition-all text-sm"
                        />
                    </div>

                    {/* Scrollable list box */}
                    <div className="flex-1 overflow-y-auto max-h-[380px] min-h-[250px] border border-slate-100 rounded-xl bg-slate-50/20">
                        {filteredLocal.length === 0 ? (
                            <EmptyState message="No local products added" type="local" />
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                        <th className="p-3 text-left w-10">
                                            <input
                                                type="checkbox"
                                                checked={filteredLocal.length > 0 && filteredLocal.every(p => localSelectedSkus.has(p.sku))}
                                                onChange={toggleAllLocal}
                                                className="w-4 h-4 rounded text-[#020079] border-slate-300 focus:ring-[#020079] cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                                        <th className="p-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="p-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLocal.map((p) => {
                                        const isSelected = localSelectedSkus.has(p.sku);
                                        return (
                                            <tr
                                                key={p.sku}
                                                onClick={() => toggleLocalSelected(p.sku)}
                                                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? "bg-slate-50" : ""}`}
                                            >
                                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleLocalSelected(p.sku)}
                                                        className="w-4 h-4 rounded text-[#020079] border-slate-300 focus:ring-[#020079] cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3 text-xs font-mono font-semibold text-slate-500">{p.sku}</td>
                                                <td className="p-3">
                                                    <div className="text-sm font-semibold text-slate-700">{p.name}</div>
                                                    <div className="text-xs text-slate-400 font-medium">{p.category}</div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="text-xs font-semibold text-slate-700">₹{p.price}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                <button
                    onClick={handleDiscard}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-sm shadow-sm"
                >
                    Discard Changes
                </button>
                <button
                    onClick={handleSave}
                    className="px-8 py-2.5 bg-[#020079] hover:bg-[#020079]/95 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm"
                >
                    Save Catalogue Changes
                </button>
            </div>

            {/* Success Toast */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in z-50">
                    <CheckCircle className="text-emerald-400" size={18} />
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}

const ROWS_PER_PAGE = 6;

function InventoryPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { canCreate, canEdit, canApprove, canView } = useAuth();
    const activeSubTab = searchParams.get("sub") || "products";

    // Determine the active tab: respect URL param first, then fall back based on permissions
    const getDefaultTab = () => {
        const paramTab = searchParams.get("tab");
        if (paramTab) {
            if (paramTab === "warehouse" && canView("WAREHOUSE_INVENTORY")) return "warehouse";
            if (paramTab === "darkhouse" && canView("DARKHOUSE_INVENTORY")) return "darkhouse";
            if (paramTab === "transfers" && canView("STOCK_TRANSFERS")) return "transfers";
        }
        // If user has warehouse inventory access, default to it
        if (canView("WAREHOUSE_INVENTORY")) return "warehouse";
        // Otherwise fall back to darkhouse if available
        if (canView("DARKHOUSE_INVENTORY")) return "darkhouse";
        // Otherwise fall back to transfers if available
        if (canView("STOCK_TRANSFERS")) return "transfers";
        return "warehouse";
    };

    const activeTab = getDefaultTab();

    // ─── States ───────────────────────────────────────────────────────────────
    const [warehouseStock, setWarehouseStock] = useState(MOCK_WAREHOUSE_STOCK);
    const [darkhouseStock, setDarkhouseStock] = useState(MOCK_DARKHOUSE_STOCK);
    const [transfers, setTransfers] = useState(MOCK_STOCK_TRANSFERS);

    // Filters for Warehouse
    const [whSearch, setWhSearch] = useState("");
    const [whCategory, setWhCategory] = useState("All");
    const [whLocation, setWhLocation] = useState("All");
    const [whPage, setWhPage] = useState(1);

    // Filters for Darkhouse
    const [dhSearch, setDhSearch] = useState("");
    const [dhSelect, setDhSelect] = useState("All");
    const [dhStatusFilter, setDhStatusFilter] = useState("All");
    const [dhPage, setDhPage] = useState(1);

    // Filters for Transfers
    const [trSearch, setTrSearch] = useState("");
    const [trStatusFilter, setTrStatusFilter] = useState("All");
    const [trPage, setTrPage] = useState(1);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'wh-view' | 'wh-edit' | 'wh-adjust' | 'dh-view' | 'dh-adjust' | 'transfer-new'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formLocation, setFormLocation] = useState("");
    const [formStock, setFormStock] = useState(0);
    const [formReorderPoint, setFormReorderPoint] = useState(0);
    const [formSku, setFormSku] = useState("");
    
    // Darkhouse adjust fields
    const [formAvailable, setFormAvailable] = useState(0);
    const [formReserved, setFormReserved] = useState(0);
    const [formReorder, setFormReorder] = useState(0);

    // Stock transfer creation fields
    const [trSource, setTrSource] = useState("HAATZA Central Warehouse");
    const [trDestination, setTrDestination] = useState(INITIAL_DARKHOUSES[0]?.name || "HAATZA Koramangala Hub");
    const [trCount, setTrCount] = useState(5);

    // Reset pagination when changing tab
    useEffect(() => {
        setTimeout(() => {
            setWhPage(1);
            setDhPage(1);
            setTrPage(1);
        }, 0);
    }, [activeTab]);

    // Derived Unique Options
    const categories = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.category))], [warehouseStock]);
    const locations = useMemo(() => ["All", ...new Set(warehouseStock.map(i => i.location.split(" / ")[0]))], [warehouseStock]);
    const darkhouses = useMemo(() => ["All", ...INITIAL_DARKHOUSES.map(d => d.name)], []);

    // ─── Dynamic Filtering ────────────────────────────────────────────────────
    
    // 1. Warehouse Inventory
    const filteredWarehouseStock = useMemo(() => {
        return warehouseStock.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(whSearch.toLowerCase()) || item.sku.toLowerCase().includes(whSearch.toLowerCase());
            const matchesCategory = whCategory === "All" || item.category === whCategory;
            const matchesLocation = whLocation === "All" || item.location.startsWith(whLocation);
            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [warehouseStock, whSearch, whCategory, whLocation]);

    const paginatedWhStock = useMemo(() => {
        const start = (whPage - 1) * ROWS_PER_PAGE;
        return filteredWarehouseStock.slice(start, start + ROWS_PER_PAGE);
    }, [filteredWarehouseStock, whPage]);

    // Stats for Warehouse
    const whStats = useMemo(() => {
        const total = warehouseStock.length;
        const low = warehouseStock.filter(i => i.stock <= i.reorderPoint && i.stock > 0).length;
        const out = warehouseStock.filter(i => i.stock === 0).length;
        return { total, low, out };
    }, [warehouseStock]);

    // 2. Darkhouse Inventory
    const filteredDarkhouseStock = useMemo(() => {
        return darkhouseStock.filter(item => {
            const matchesSearch = item.product.toLowerCase().includes(dhSearch.toLowerCase()) || item.sku.toLowerCase().includes(dhSearch.toLowerCase());
            const matchesDh = dhSelect === "All" || item.darkhouse === dhSelect;
            let matchesStatus = true;
            if (dhStatusFilter === "Low Stock") {
                matchesStatus = item.available <= item.reorder && item.available > 0;
            } else if (dhStatusFilter === "Out of Stock") {
                matchesStatus = item.available === 0;
            } else if (dhStatusFilter === "In Stock") {
                matchesStatus = item.available > item.reorder;
            }
            return matchesSearch && matchesDh && matchesStatus;
        });
    }, [darkhouseStock, dhSearch, dhSelect, dhStatusFilter]);

    const paginatedDhStock = useMemo(() => {
        const start = (dhPage - 1) * ROWS_PER_PAGE;
        return filteredDarkhouseStock.slice(start, start + ROWS_PER_PAGE);
    }, [filteredDarkhouseStock, dhPage]);

    // Stats for Darkhouse
    const dhStats = useMemo(() => {
        const total = darkhouseStock.length;
        const low = darkhouseStock.filter(i => i.available <= i.reorder && i.available > 0).length;
        const out = darkhouseStock.filter(i => i.available === 0).length;
        return { total, low, out };
    }, [darkhouseStock]);

    // 3. Stock Transfers
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
    const openWhView = (item) => {
        setSelectedItem(item);
        setModalType("wh-view");
        setIsModalOpen(true);
    };

    const openWhEdit = (item) => {
        setSelectedItem(item);
        setFormName(item.product);
        setFormCategory(item.category);
        setFormLocation(item.location);
        setFormReorderPoint(item.reorderPoint);
        setFormSku(item.sku);
        setModalType("wh-edit");
        setIsModalOpen(true);
    };

    const openWhAdjust = (item) => {
        setSelectedItem(item);
        setFormStock(item.stock);
        setModalType("wh-adjust");
        setIsModalOpen(true);
    };

    const openDhView = (item) => {
        setSelectedItem(item);
        setModalType("dh-view");
        setIsModalOpen(true);
    };

    const openDhAdjust = (item) => {
        setSelectedItem(item);
        setFormAvailable(item.available);
        setFormReserved(item.reserved);
        setFormReorder(item.reorder);
        setModalType("dh-adjust");
        setIsModalOpen(true);
    };

    const openNewTransfer = () => {
        setTrSource("HAATZA Central Warehouse");
        setTrDestination(INITIAL_DARKHOUSES[0]?.name || "HAATZA Koramangala Hub");
        setTrCount(5);
        setModalType("transfer-new");
        setIsModalOpen(true);
    };

    // ─── CRUD Actions ─────────────────────────────────────────────────────────
    const handleWhEditSubmit = (e) => {
        e.preventDefault();
        setWarehouseStock(prev => prev.map(item => {
            if (item.sku === selectedItem.sku) {
                return {
                    ...item,
                    product: formName,
                    category: formCategory,
                    location: formLocation,
                    reorderPoint: formReorderPoint
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

    const handleWhAdjustSubmit = (e) => {
        e.preventDefault();
        setWarehouseStock(prev => prev.map(item => {
            if (item.sku === selectedItem.sku) {
                const nextStatus = formStock === 0 ? "Out of Stock" : formStock <= item.reorderPoint ? "Low Stock" : "In Stock";
                return {
                    ...item,
                    stock: formStock,
                    status: nextStatus,
                    lastUpdated: "Just Now"
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

    const handleDhAdjustSubmit = (e) => {
        e.preventDefault();
        setDarkhouseStock(prev => prev.map(item => {
            if (item.id === selectedItem.id) {
                const nextStatus = formAvailable === 0 ? "Out of Stock" : formAvailable <= formReorder ? "Low Stock" : "In Stock";
                return {
                    ...item,
                    available: formAvailable,
                    reserved: formReserved,
                    reorder: formReorder,
                    status: nextStatus
                };
            }
            return item;
        }));
        setIsModalOpen(false);
    };

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

    const handleTabClick = (tabKey) => {
        setSearchParams({ tab: tabKey });
    };

    // Use shared utility from statusUtils.js
    const getStatusClass = getInventoryStatusClass;

    const handleExportCSV = () => {
        let headers, rows, filename;

        if (activeTab === "warehouse") {
            headers = ["SKU", "Product Name", "Category", "Warehouse Location", "Stock", "Reorder Point", "Status", "Last Updated"];
            rows = warehouseStock.map(i => [i.sku, `"${i.product}"`, i.category, `"${i.location}"`, i.stock, i.reorderPoint, i.status, i.lastUpdated]);
            filename = "haatza_warehouse_stock.csv";
        } else if (activeTab === "darkhouse") {
            headers = ["Darkhouse", "Product Name", "SKU", "Available Stock", "Reserved Stock", "Reorder Point", "Status"];
            rows = darkhouseStock.map(i => [`"${i.darkhouse}"`, `"${i.product}"`, i.sku, i.available, i.reserved, i.reorder, i.status]);
            filename = "haatza_darkhouse_stock.csv";
        } else {
            headers = ["Transfer ID", "Source Hub", "Destination Hub", "Products Count", "Created Date", "Status"];
            rows = transfers.map(i => [i.id, `"${i.source}"`, `"${i.destination}"`, i.productsCount, `"${i.createdDate}"`, i.status]);
            filename = "haatza_stock_transfers.csv";
        }

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
                    <h1 className="inv-header__title">
                        {activeTab === "warehouse" && "Warehouse Catalogue"}
                        {activeTab === "darkhouse" && (activeSubTab === "find-product-to-sell" ? "Find Product to Sell" : "Darkhouse Catalogue")}
                        {activeTab === "transfers" && "Stock Transfers Control"}
                    </h1>
                    <p className="inv-header__subtitle">
                        {activeTab === "warehouse" && "Monitor, edit, and adjust products inside your central warehouse shelves."}
                        {activeTab === "darkhouse" && (
                            activeSubTab === "find-product-to-sell"
                                ? "Link global warehouse inventory pools to local darkhouse catalogue offerings."
                                : "Manage quick-commerce fronting darkhouses available and reserved catalogue pools."
                        )}
                        {activeTab === "transfers" && "Coordinate central stock allocations and dispatcher hub-to-hub deliveries."}
                    </p>
                </div>
                <div className="inv-header-actions-group">
                    {activeTab === "transfers" && canCreate("STOCK_TRANSFERS") && (
                        <button className="inv-action-btn-primary" onClick={openNewTransfer}>
                            <Plus size={15} />
                            <span>New Stock Transfer</span>
                        </button>
                    )}
                    {activeSubTab !== "find-product-to-sell" && (
                        <button className="inv-export-btn" onClick={handleExportCSV}>
                            <Download size={15} />
                            <span>Export CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Stat Grid */}
            <div className="inv-summary-grid">
                {activeTab === "warehouse" && (
                    <>
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <Package size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{whStats.total}</span>
                                <span className="inv-summary-card__label">Total SKUs</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--neutral">Central Pool</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{whStats.low}</span>
                                <span className="inv-summary-card__label">Low Stock SKUs</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--warning">Needs Attention</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{whStats.out}</span>
                                <span className="inv-summary-card__label">Out of Stock</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--danger">Urgent Reorder</span>
                        </div>
                    </>
                )}

                {activeTab === "darkhouse" && (
                    <>
                        <div className="inv-summary-card">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--info">
                                <Store size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value">{dhStats.total}</span>
                                <span className="inv-summary-card__label">Total Hub Items</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--neutral">Fronting Stock</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--warning">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--warning">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--warning">{dhStats.low}</span>
                                <span className="inv-summary-card__label">Low Hub Pools</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--warning">Needs Transfer</span>
                        </div>
                        <div className="inv-summary-card inv-summary-card--danger">
                            <div className="inv-summary-card__icon-wrap inv-summary-card__icon-wrap--danger">
                                <XCircle size={20} />
                            </div>
                            <div className="inv-summary-card__body">
                                <span className="inv-summary-card__value inv-summary-card__value--danger">{dhStats.out}</span>
                                <span className="inv-summary-card__label">Hub Stockouts</span>
                            </div>
                            <span className="inv-summary-card__badge inv-summary-card__badge--danger">Urgent Replenish</span>
                        </div>
                    </>
                )}

                {activeTab === "transfers" && (
                    <>
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
                    </>
                )}
            </div>

            {/* Main Table Card Area */}
            <div className="inv-table-card">
                {/* Toolbar */}
                <div className="inv-toolbar">
                    <div className="inv-tabs" role="tablist">
                        {canView("WAREHOUSE_INVENTORY") && (
                            <button
                                role="tab"
                                aria-selected={activeTab === "warehouse"}
                                className={`inv-tab ${activeTab === "warehouse" ? "inv-tab--active" : ""}`}
                                onClick={() => handleTabClick("warehouse")}
                            >
                                Warehouse Catalogue
                            </button>
                        )}
                        {canView("DARKHOUSE_INVENTORY") && (
                            <button
                                role="tab"
                                aria-selected={activeTab === "darkhouse"}
                                className={`inv-tab ${activeTab === "darkhouse" ? "inv-tab--active" : ""}`}
                                onClick={() => handleTabClick("darkhouse")}
                            >
                                Darkhouse Catalogue
                            </button>
                        )}
                        {canView("STOCK_TRANSFERS") && (
                            <button
                                role="tab"
                                aria-selected={activeTab === "transfers"}
                                className={`inv-tab ${activeTab === "transfers" ? "inv-tab--active" : ""}`}
                                onClick={() => handleTabClick("transfers")}
                            >
                                Stock Transfers
                            </button>
                        )}
                    </div>

                    <div className="inv-toolbar__actions" style={{ flexWrap: "wrap", gap: "12px", width: "100%" }}>
                        {activeTab === "darkhouse" && (
                            <div className="dkh-subtabs-bar" style={{
                                display: "flex",
                                gap: "8px",
                                padding: "4px 0 12px 0",
                                width: "100%",
                                overflowX: "auto",
                                borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
                            }}>
                                {["products", "inventory", "categories", "backend-stock-request", "find-product-to-sell"].map(subTab => {
                                    const labels = {
                                        "products": "Products",
                                        "inventory": "Inventory",
                                        "categories": "Categories",
                                        "backend-stock-request": "Backend stock request",
                                        "find-product-to-sell": "find product to sell"
                                    };
                                    const isSubActive = activeSubTab === subTab;
                                    return (
                                        <button
                                            key={subTab}
                                            role="tab"
                                            aria-selected={isSubActive}
                                            onClick={() => setSearchParams({ tab: "darkhouse", sub: subTab })}
                                            style={{
                                                padding: "6px 16px",
                                                borderRadius: "20px",
                                                border: "none",
                                                fontSize: "13px",
                                                fontWeight: isSubActive ? "600" : "500",
                                                backgroundColor: isSubActive ? "#020079" : "#F1F5F9",
                                                color: isSubActive ? "#ffffff" : "#475569",
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {labels[subTab]}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === "warehouse" && (
                            <>
                                <div className="inv-search-wrap">
                                    <Search size={14} className="inv-search-icon" />
                                    <input
                                        type="text"
                                        className="inv-search"
                                        placeholder="Search product SKU or name..."
                                        value={whSearch}
                                        onChange={(e) => { setWhSearch(e.target.value); setWhPage(1); }}
                                    />
                                </div>
                                <select 
                                    className="inv-toolbar-select"
                                    value={whCategory}
                                    onChange={(e) => { setWhCategory(e.target.value); setWhPage(1); }}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.filter(c => c !== "All").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    className="inv-toolbar-select"
                                    value={whLocation}
                                    onChange={(e) => { setWhLocation(e.target.value); setWhPage(1); }}
                                >
                                    <option value="All">All Areas</option>
                                    {locations.filter(l => l !== "All").map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {activeTab === "darkhouse" && activeSubTab !== "find-product-to-sell" && (
                            <>
                                <div className="inv-search-wrap">
                                    <Search size={14} className="inv-search-icon" />
                                    <input
                                        type="text"
                                        className="inv-search"
                                        placeholder={
                                            activeSubTab === "categories" ? "Search categories..." :
                                            activeSubTab === "backend-stock-request" ? "Search requests..." :
                                            "Search by SKU or item..."
                                        }
                                        value={dhSearch}
                                        onChange={(e) => { setDhSearch(e.target.value); setDhPage(1); }}
                                    />
                                </div>
                                {activeSubTab !== "categories" && activeSubTab !== "backend-stock-request" && (
                                    <select
                                        className="inv-toolbar-select"
                                        value={dhSelect}
                                        onChange={(e) => { setDhSelect(e.target.value); setDhPage(1); }}
                                    >
                                        <option value="All">All Darkhouses</option>
                                        {darkhouses.filter(d => d !== "All").map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                )}
                                {activeSubTab === "inventory" && (
                                    <select
                                        className="inv-toolbar-select"
                                        value={dhStatusFilter}
                                        onChange={(e) => { setDhStatusFilter(e.target.value); setDhPage(1); }}
                                    >
                                        <option value="All">All stock status</option>
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                )}
                                {activeSubTab === "backend-stock-request" && (
                                    <button 
                                        className="inv-action-btn-primary" 
                                        onClick={openNewTransfer}
                                        style={{
                                            padding: "6px 12px",
                                            fontSize: "13px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            marginLeft: "8px"
                                        }}
                                    >
                                        <Plus size={14} />
                                        <span>Request Stock</span>
                                    </button>
                                )}
                            </>
                        )}

                        {activeTab === "transfers" && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                {/* Data Grid Area */}
                {activeTab === "darkhouse" && activeSubTab === "find-product-to-sell" ? (
                    <FindProductToSell
                        darkhouseStock={darkhouseStock}
                        setDarkhouseStock={setDarkhouseStock}
                        currentDhSelect={dhSelect}
                        setDhSelect={setDhSelect}
                        darkhouses={darkhouses}
                    />
                ) : (
                    <div className="inv-table-responsive">
                        <table className="inv-table">
                            {activeTab === "warehouse" && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Warehouse Location</th>
                                            <th>In Stock</th>
                                            <th>Reorder Level</th>
                                            <th>Status</th>
                                            <th>Last Updated</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedWhStock.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="inv-empty">
                                                    <Package size={32} className="inv-empty__icon" />
                                                    <p>No warehouse items found matching filters.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedWhStock.map(item => (
                                                <tr key={item.sku} className="inventory-row-hover">
                                                    <td className="inv-td--sku">{item.sku}</td>
                                                    <td className="inv-td--name">{item.product}</td>
                                                    <td><span className="inv-category-badge">{item.category}</span></td>
                                                    <td className="inv-td--warehouse">{item.location}</td>
                                                    <td>
                                                        <span className={`inv-stock-number ${item.stock === 0 ? "out" : item.stock <= item.reorderPoint ? "low" : ""}`}>
                                                            {item.stock}
                                                        </span>
                                                    </td>
                                                    <td className="inv-td--reorder">{item.reorderPoint}</td>
                                                    <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                    <td className="inv-td--date">{item.lastUpdated}</td>
                                                    <td>
                                                        <div className="inv-actions-cell">
                                                            <button className="inv-row-action-btn" title="View details" onClick={() => openWhView(item)}>
                                                                <Eye size={13} />
                                                            </button>
                                                            {canEdit("WAREHOUSE_INVENTORY") && (
                                                                <>
                                                                    <button className="inv-row-action-btn" title="Edit" onClick={() => openWhEdit(item)}>
                                                                        <Edit2 size={13} />
                                                                    </button>
                                                                    <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openWhAdjust(item)}>
                                                                        <SlidersHorizontal size={13} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}

                            {activeTab === "darkhouse" && activeSubTab === "products" && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Darkhouse Hub</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDhStock.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="inv-empty">
                                                    <Store size={32} className="inv-empty__icon" />
                                                    <p>No products found in the catalogue matching filters.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedDhStock.map(item => (
                                                <tr key={item.id} className="inventory-row-hover">
                                                    <td className="inv-td--sku">{item.sku}</td>
                                                    <td className="inv-td--name">{item.product}</td>
                                                    <td><span className="inv-category-badge">{item.sku.startsWith("FRT") ? "Fruits & Vegetables" : item.sku.startsWith("DRY") ? "Dairy & Bread" : "Snacks & Munchies"}</span></td>
                                                    <td className="inv-td--darkhouse">{item.darkhouse}</td>
                                                    <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                    <td>
                                                        <div className="inv-actions-cell">
                                                            <button className="inv-row-action-btn" title="View details" onClick={() => openDhView(item)}>
                                                                <Eye size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </>
                            )}

                            {activeTab === "darkhouse" && activeSubTab === "inventory" && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Darkhouse Hub</th>
                                            <th>Product Name</th>
                                            <th>SKU</th>
                                            <th>Available Stock</th>
                                            <th>Reserved Stock</th>
                                            <th>Reorder Level</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDhStock.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="inv-empty">
                                                    <Store size={32} className="inv-empty__icon" />
                                                    <p>No inventory allocations found matching filters.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedDhStock.map(item => (
                                                <tr key={item.id} className="inventory-row-hover">
                                                    <td className="inv-td--darkhouse">{item.darkhouse}</td>
                                                    <td className="inv-td--name">{item.product}</td>
                                                    <td className="inv-td--sku">{item.sku}</td>
                                                    <td>
                                                        <span className={`inv-stock-number ${item.available === 0 ? "out" : item.available <= item.reorder ? "low" : ""}`}>
                                                            {item.available}
                                                        </span>
                                                    </td>
                                                    <td className="inv-td--reserved">{item.reserved}</td>
                                                    <td className="inv-td--reorder">{item.reorder}</td>
                                                    <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                    <td>
                                                        <div className="inv-actions-cell">
                                                            <button className="inv-row-action-btn" title="View details" onClick={() => openDhView(item)}>
                                                                <Eye size={13} />
                                                            </button>
                                                            {canEdit("DARKHOUSE_INVENTORY") && (
                                                                <button className="inv-row-action-btn inv-row-action-btn--adjust" title="Stock Adjust" onClick={() => openDhAdjust(item)}>
                                                                    <SlidersHorizontal size={13} />
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

                            {activeTab === "darkhouse" && activeSubTab === "categories" && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Category ID</th>
                                            <th>Category Name</th>
                                            <th>Category Code</th>
                                            <th>Active Products Count</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { id: "CAT-01", name: "Fruits & Vegetables", code: "FRT-VEG", count: 12, status: "Active" },
                                            { id: "CAT-02", name: "Dairy & Bread", code: "DRY-BRD", count: 8, status: "Active" },
                                            { id: "CAT-03", name: "Snacks & Munchies", code: "SNK-MNC", count: 15, status: "Active" },
                                            { id: "CAT-04", name: "Beverages", code: "BEV-DRK", count: 10, status: "Active" },
                                            { id: "CAT-05", name: "Instant Foods", code: "INS-FOD", count: 6, status: "Active" }
                                        ].filter(c => c.name.toLowerCase().includes(dhSearch.toLowerCase()) || c.code.toLowerCase().includes(dhSearch.toLowerCase())).map(item => (
                                            <tr key={item.id} className="inventory-row-hover">
                                                <td className="inv-td--sku">{item.id}</td>
                                                <td className="inv-td--name">{item.name}</td>
                                                <td><span className="inv-category-badge">{item.code}</span></td>
                                                <td>{item.count} items</td>
                                                <td><span className="inv-status-pill in">{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {activeTab === "darkhouse" && activeSubTab === "backend-stock-request" && (
                                <>
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Destination Darkhouse</th>
                                            <th>Source Warehouse</th>
                                            <th>Requested SKUs</th>
                                            <th>Created Date</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transfers.filter(t => t.destination.toLowerCase().includes(dhSearch.toLowerCase()) || t.id.toLowerCase().includes(dhSearch.toLowerCase())).map(item => (
                                            <tr key={item.id} className="inventory-row-hover">
                                                <td className="inv-td--sku">{item.id}</td>
                                                <td className="inv-td--darkhouse">{item.destination}</td>
                                                <td className="inv-td--warehouse">{item.source}</td>
                                                <td>
                                                    <span className="inv-transfer-count-badge">
                                                        {item.productsCount} SKUs
                                                    </span>
                                                </td>
                                                <td className="inv-td--date">{item.createdDate}</td>
                                                <td><span className={getStatusClass(item.status)}>{item.status}</span></td>
                                                <td>
                                                    <div className="inv-actions-cell">
                                                        {item.status === "Pending" && (
                                                            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                                                                Awaiting dispatch
                                                            </span>
                                                        )}
                                                        {item.status === "Dispatched" && (
                                                            <button 
                                                                className="inv-action-inline-btn inv-action-inline-btn--success" 
                                                                onClick={() => handleReceiveTransfer(item.id)}
                                                            >
                                                                Mark Received
                                                            </button>
                                                        )}
                                                        {item.status === "Received" && (
                                                            <span style={{ fontSize: "12px", color: "var(--success-color)", fontWeight: "600" }}>
                                                                Received & Checked
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {activeTab === "transfers" && (
                                <>
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
                                </>
                            )}
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {activeSubTab !== "find-product-to-sell" && ((activeTab === "warehouse" && filteredWarehouseStock.length > ROWS_PER_PAGE) ||
                  (activeTab === "darkhouse" && filteredDarkhouseStock.length > ROWS_PER_PAGE) ||
                  (activeTab === "transfers" && filteredTransfers.length > ROWS_PER_PAGE)) && (
                    <div className="inv-pagination">
                        <span className="inv-pagination__info">
                            Showing <strong>{
                                activeTab === "warehouse" ? Math.min(filteredWarehouseStock.length, (whPage - 1) * ROWS_PER_PAGE + 1) :
                                activeTab === "darkhouse" ? Math.min(filteredDarkhouseStock.length, (dhPage - 1) * ROWS_PER_PAGE + 1) :
                                Math.min(filteredTransfers.length, (trPage - 1) * ROWS_PER_PAGE + 1)
                            }</strong> to <strong>{
                                activeTab === "warehouse" ? Math.min(filteredWarehouseStock.length, whPage * ROWS_PER_PAGE) :
                                activeTab === "darkhouse" ? Math.min(filteredDarkhouseStock.length, dhPage * ROWS_PER_PAGE) :
                                Math.min(filteredTransfers.length, trPage * ROWS_PER_PAGE)
                            }</strong> of <strong>{
                                activeTab === "warehouse" ? filteredWarehouseStock.length :
                                activeTab === "darkhouse" ? filteredDarkhouseStock.length :
                                filteredTransfers.length
                            }</strong> entries
                        </span>

                        <div className="inv-pagination__controls">
                            <button
                                className="inv-page-btn"
                                onClick={() => {
                                    if (activeTab === "warehouse") setWhPage(p => Math.max(1, p - 1));
                                    else if (activeTab === "darkhouse") setDhPage(p => Math.max(1, p - 1));
                                    else setTrPage(p => Math.max(1, p - 1));
                                }}
                                disabled={
                                    activeTab === "warehouse" ? whPage === 1 :
                                    activeTab === "darkhouse" ? dhPage === 1 :
                                    trPage === 1
                                }
                            >
                                <ChevronLeft size={14} />
                            </button>

                            {Array.from({ length: 
                                activeTab === "warehouse" ? Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE) :
                                activeTab === "darkhouse" ? Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE) :
                                Math.ceil(filteredTransfers.length / ROWS_PER_PAGE)
                            }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`inv-page-btn inv-page-num ${
                                        (activeTab === "warehouse" && whPage === page) ||
                                        (activeTab === "darkhouse" && dhPage === page) ||
                                        (activeTab === "transfers" && trPage === page)
                                            ? "inv-page-num--active" : ""
                                    }`}
                                    onClick={() => {
                                        if (activeTab === "warehouse") setWhPage(page);
                                        else if (activeTab === "darkhouse") setDhPage(page);
                                        else setTrPage(page);
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="inv-page-btn"
                                onClick={() => {
                                    if (activeTab === "warehouse") setWhPage(p => Math.min(Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE), p + 1));
                                    else if (activeTab === "darkhouse") setDhPage(p => Math.min(Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE), p + 1));
                                    else setTrPage(p => Math.min(Math.ceil(filteredTransfers.length / ROWS_PER_PAGE), p + 1));
                                }}
                                disabled={
                                    activeTab === "warehouse" ? whPage === Math.ceil(filteredWarehouseStock.length / ROWS_PER_PAGE) :
                                    activeTab === "darkhouse" ? dhPage === Math.ceil(filteredDarkhouseStock.length / ROWS_PER_PAGE) :
                                    trPage === Math.ceil(filteredTransfers.length / ROWS_PER_PAGE)
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
                <div className="inv-modal-backdrop fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="inv-modal-container scale-up" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="inv-modal-header">
                            <div className="inv-modal-header__icon-wrap">
                                {modalType.startsWith("wh") ? <Package size={18} /> : <Store size={18} />}
                            </div>
                            <div className="inv-modal-header__text-block">
                                <h3 className="inv-modal-title">
                                    {modalType === "wh-view" && "Warehouse Stock Details"}
                                    {modalType === "wh-edit" && "Edit Warehouse Stock Info"}
                                    {modalType === "wh-adjust" && "Warehouse Stock Correction"}
                                    {modalType === "dh-view" && "Darkhouse Stock Allocations"}
                                    {modalType === "dh-adjust" && "Adjust Darkhouse Stock Levels"}
                                    {modalType === "transfer-new" && "Initiate Central Stock Transfer"}
                                </h3>
                                <span className="inv-modal-subtitle">
                                    {modalType.startsWith("wh") && selectedItem?.sku}
                                    {modalType.startsWith("dh") && selectedItem?.sku}
                                    {modalType === "transfer-new" && "Create internal dispatcher transfer orders"}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="inv-modal-body">
                            
                            {/* 1. WH View details */}
                            {modalType === "wh-view" && selectedItem && (
                                <div className="inv-details-sheet">
                                    <div className="details-row"><span className="details-label">Product Name:</span><span className="details-val">{selectedItem.product}</span></div>
                                    <div className="details-row"><span className="details-label">SKU Code:</span><span className="details-val font-mono">{selectedItem.sku}</span></div>
                                    <div className="details-row"><span className="details-label">Category Group:</span><span className="details-val">{selectedItem.category}</span></div>
                                    <div className="details-row"><span className="details-label">Shelf Location:</span><span className="details-val">{selectedItem.location}</span></div>
                                    <div className="details-row"><span className="details-label">Current Stock:</span><span className="details-val bold">{selectedItem.stock} items</span></div>
                                    <div className="details-row"><span className="details-label">Reorder Level:</span><span className="details-val">{selectedItem.reorderPoint} items</span></div>
                                    <div className="details-row"><span className="details-label">Warehouse Status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                    <div className="details-row"><span className="details-label">Last Audited:</span><span className="details-val">{selectedItem.lastUpdated}</span></div>
                                </div>
                            )}

                            {/* 2. WH Edit */}
                            {modalType === "wh-edit" && (
                                <form id="wh-edit-form" onSubmit={handleWhEditSubmit} className="inv-modal-form">
                                    <div className="inv-form-group">
                                        <label htmlFor="formName">Product Name</label>
                                        <input type="text" id="formName" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formCategory">Category</label>
                                        <input type="text" id="formCategory" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formLocation">Shelf Location</label>
                                        <input type="text" id="formLocation" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} required />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReorder">Reorder Threshold</label>
                                        <input type="number" id="formReorder" value={formReorderPoint} onChange={(e) => setFormReorderPoint(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                            {/* 3. WH Adjust */}
                            {modalType === "wh-adjust" && selectedItem && (
                                <form id="wh-adjust-form" onSubmit={handleWhAdjustSubmit} className="inv-modal-form">
                                    <p className="adjust-explainer">Update physical stock counts directly. Changing counts below <strong>{selectedItem.reorderPoint}</strong> triggers low-stock alerts automatically.</p>
                                    <div className="inv-form-group">
                                        <label htmlFor="formStock">Physical Stock Count</label>
                                        <div className="adjust-number-input">
                                            <input type="number" id="formStock" value={formStock} onChange={(e) => setFormStock(parseInt(e.target.value) || 0)} required min="0" />
                                            <span className="unit-label">Units</span>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* 4. DH View Details */}
                            {modalType === "dh-view" && selectedItem && (
                                <div className="inv-details-sheet">
                                    <div className="details-row"><span className="details-label">Darkhouse Destination:</span><span className="details-val">{selectedItem.darkhouse}</span></div>
                                    <div className="details-row"><span className="details-label">Product Mapped:</span><span className="details-val">{selectedItem.product}</span></div>
                                    <div className="details-row"><span className="details-label">SKU Code:</span><span className="details-val font-mono">{selectedItem.sku}</span></div>
                                    <div className="details-row"><span className="details-label">Available Stock (Ready):</span><span className="details-val bold">{selectedItem.available} items</span></div>
                                    <div className="details-row"><span className="details-label">Reserved Stock (Ordered):</span><span className="details-val">{selectedItem.reserved} items</span></div>
                                    <div className="details-row"><span className="details-label">Reorder Level:</span><span className="details-val">{selectedItem.reorder} items</span></div>
                                    <div className="details-row"><span className="details-label">Hub Status:</span><span className="details-val"><span className={getStatusClass(selectedItem.status)}>{selectedItem.status}</span></span></div>
                                </div>
                            )}

                            {/* 5. DH Adjust */}
                            {modalType === "dh-adjust" && selectedItem && (
                                <form id="dh-adjust-form" onSubmit={handleDhAdjustSubmit} className="inv-modal-form">
                                    <div className="inv-form-group">
                                        <label htmlFor="formAvailable">Available (Ready to Pack)</label>
                                        <input type="number" id="formAvailable" value={formAvailable} onChange={(e) => setFormAvailable(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReserved">Reserved (Ordered by customers)</label>
                                        <input type="number" id="formReserved" value={formReserved} onChange={(e) => setFormReserved(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                    <div className="inv-form-group">
                                        <label htmlFor="formReorderDh">Reorder Trigger Limit</label>
                                        <input type="number" id="formReorderDh" value={formReorder} onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)} required min="0" />
                                    </div>
                                </form>
                            )}

                            {/* 6. New Stock Transfer */}
                            {modalType === "transfer-new" && (
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
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="inv-modal-footer">
                            <button className="inv-modal-cancel-btn" onClick={() => setIsModalOpen(false)}>
                                Close
                            </button>
                            
                            {modalType === "wh-edit" && (
                                <button type="submit" form="wh-edit-form" className="inv-modal-submit-btn">
                                    Save Changes
                                </button>
                            )}
                            
                            {modalType === "wh-adjust" && (
                                <button type="submit" form="wh-adjust-form" className="inv-modal-submit-btn">
                                    Apply Adjust
                                </button>
                            )}

                            {modalType === "dh-adjust" && (
                                <button type="submit" form="dh-adjust-form" className="inv-modal-submit-btn">
                                    Apply Stock Level
                                </button>
                            )}

                            {modalType === "transfer-new" && (
                                <button type="submit" form="tr-new-form" className="inv-modal-submit-btn">
                                    Initiate Allocation
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

const EmptyState = ({ message, type }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-3">
            {type === "global" ? <Package size={28} /> : <Store size={28} />}
        </div>
        <p className="text-sm font-bold text-slate-600 m-0">{message}</p>
        <p className="text-xs text-slate-400 m-0 mt-1.5 max-w-[220px] leading-relaxed">
            {type === "global"
                ? "All global items are already added or search filters returned no matches."
                : "Select items from the global pool and click the right arrow to add them to this darkhouse catalog."}
        </p>
    </div>
);

export default InventoryPage;
