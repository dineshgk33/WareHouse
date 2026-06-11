import React, { useState, useMemo, useEffect } from "react";
import {
    Download,
    AlertTriangle,
    Search,
    ChevronLeft,
    ChevronRight,
    Store,
    XCircle,
    Package,
    ChevronDown,
    ChevronUp,
    CheckCircle
} from "lucide-react";
import { MOCK_DARKHOUSE_STOCK } from "../../../data/inventoryData";

import { useAuth } from "../../../context/AuthContext";
import "../../Inventory/Inventory.css";

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

function FindProductToSellPage() {
    const { canView } = useAuth();

    // ─── States ───────────────────────────────────────────────────────────────
    const [darkhouseStock, setDarkhouseStock] = useState(() => {
        const saved = localStorage.getItem("haatza_darkhouse_stock");
        return saved ? JSON.parse(saved) : MOCK_DARKHOUSE_STOCK;
    });

    useEffect(() => {
        localStorage.setItem("haatza_darkhouse_stock", JSON.stringify(darkhouseStock));
    }, [darkhouseStock]);

    const [selectedDh, setSelectedDh] = useState("HAATZA Koramangala Hub");

    const [tempLocalProducts, setTempLocalProducts] = useState([]);
    const [tempGlobalProducts, setTempGlobalProducts] = useState([]);

    const [globalSearch, setGlobalSearch] = useState("");
    const [localSearch, setLocalSearch] = useState("");

    const [globalSearchVal, setGlobalSearchVal] = useState("");
    const [globalSearchTerm, setGlobalSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setGlobalSearchTerm(globalSearchVal);
        }, 300);
        return () => clearTimeout(timer);
    }, [globalSearchVal]);

    const [globalSelectedSkus, setGlobalSelectedSkus] = useState(new Set());
    const [localSelectedSkus, setLocalSelectedSkus] = useState(new Set());

    const [toast, setToast] = useState({ show: false, message: "" });

    // Re-initialize lists when selected darkhouse changes
    useEffect(() => {
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
    }, [selectedDh, darkhouseStock]);

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

    const filteredGlobal = tempGlobalProducts.filter(p => {
        const trimmedGlobal = globalSearchTerm.trim().toLowerCase();
        const trimmedSpecific = globalSearch.trim().toLowerCase();

        const matchesGlobal = !trimmedGlobal ||
            p.name.toLowerCase().includes(trimmedGlobal) ||
            p.sku.toLowerCase().includes(trimmedGlobal) ||
            p.category.toLowerCase().includes(trimmedGlobal);

        const matchesSpecific = !trimmedSpecific ||
            p.name.toLowerCase().includes(trimmedSpecific) ||
            p.sku.toLowerCase().includes(trimmedSpecific) ||
            p.category.toLowerCase().includes(trimmedSpecific);

        return matchesGlobal && matchesSpecific;
    });

    const filteredLocal = tempLocalProducts.filter(p => {
        const trimmedGlobal = globalSearchTerm.trim().toLowerCase();
        const trimmedSpecific = localSearch.trim().toLowerCase();

        const matchesGlobal = !trimmedGlobal ||
            p.name.toLowerCase().includes(trimmedGlobal) ||
            p.sku.toLowerCase().includes(trimmedGlobal) ||
            p.category.toLowerCase().includes(trimmedGlobal);

        const matchesSpecific = !trimmedSpecific ||
            p.name.toLowerCase().includes(trimmedSpecific) ||
            p.sku.toLowerCase().includes(trimmedSpecific) ||
            p.category.toLowerCase().includes(trimmedSpecific);

        return matchesGlobal && matchesSpecific;
    });

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

    return (
        <div className="inv-root fade-in">
            {/* Page Header */}
            <div className="inv-header">
                <div className="inv-header__title-block">
                    <h1 className="inv-header__title">Find Product to Sell</h1>
                    <p className="inv-header__subtitle">Link global warehouse inventory pools to local darkhouse catalogue offerings.</p>
                </div>
            </div>

            {/* Main Table Card Area */}
            <div className="inv-table-card">


                <div className="p-1 sm:p-4 bg-slate-50/50 rounded-2xl">
                    {/* Darkhouse selection panel */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 m-0" style={{ fontSize: "16px", border: "none" }}>
                                <Store className="text-[#020079]" size={18} />
                                <span>Configure Catalogue for Darkhouse Hub</span>
                            </h2>
                            <p className="text-xs text-slate-500 m-0 mt-1">Manage sellable catalogue items mapped to the darkhouse destination hub.</p>
                        </div>
                        
                        {/* Global Search Input */}
                        <div className="relative w-full md:w-auto min-w-[320px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} style={{ margin: 0 }} />
                            <input
                                type="search"
                                placeholder="Search products across global and local catalogues..."
                                value={globalSearchVal}
                                onChange={(e) => setGlobalSearchVal(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] transition-all text-sm shadow-sm"
                                style={{ margin: 0 }}
                            />
                        </div>
                    </div>

                    {/* Transfer Lists Container */}
                    <div className="flex flex-col lg:flex-row items-stretch gap-6">
                        {/* Left Card: Global Products */}
                        <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col min-h-[480px]">
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 m-0" style={{ border: "none" }}>Global Products</h3>
                                    <p className="text-xs text-slate-400 m-0 mt-0.5">Master product catalogue</p>
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {filteredGlobal.length} products
                                </span>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} style={{ margin: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Search global products..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] transition-all text-sm"
                                    style={{ margin: 0 }}
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
                                    <h3 className="text-sm font-bold text-slate-800 m-0" style={{ border: "none" }}>Local Products</h3>
                                    <p className="text-xs text-slate-400 m-0 mt-0.5">Assigned to local store</p>
                                </div>
                                <span className="bg-[#020079]/10 text-[#020079] text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {filteredLocal.length} products
                                </span>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} style={{ margin: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Search local products..."
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#020079]/20 focus:border-[#020079] transition-all text-sm"
                                    style={{ margin: 0 }}
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
                </div>
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

export default FindProductToSellPage;
