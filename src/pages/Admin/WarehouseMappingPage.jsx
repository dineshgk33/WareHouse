import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
    Search,
    AlertCircle,
    CheckCircle,
    Warehouse,
    Store,
    Loader2,
    X,
    MapPin,
    Edit
} from "lucide-react";
import { INITIAL_DARKHOUSES } from "../../data/darkhouses";
import "./WarehouseMappingPage.css";
import { authService } from "../../services/authService";

function WarehouseMappingPage() {
    // ─── States ───────────────────────────────────────────────────────────────
    const [warehouses, setWarehouses] = useState([]);
    const [darkhouses, setDarkhouses] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingDhId, setEditingDhId] = useState(null);

    // Selected Main Warehouse State
    const [selectedWhId, setSelectedWhId] = useState("");
    const [whSearchQuery, setWhSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Checked Dark Houses State
    const [selectedDhIds, setSelectedDhIds] = useState([]);

    // Filter by city option state
    const [sameCityOnly, setSameCityOnly] = useState(true);

    // Registry Search State
    const [dhRegistrySearch, setDhRegistrySearch] = useState("");

    // Fallback Warehouse States
    const [fallbackModalOpen, setFallbackModalOpen] = useState(false);
    const [selectedMappingForFallback, setSelectedMappingForFallback] = useState(null);
    const [fallback1, setFallback1] = useState("");
    const [fallback2, setFallback2] = useState("");
    const [fallback3, setFallback3] = useState("");

    // Toast notifications
    const [toast, setToast] = useState({ show: false, message: "", type: "info" });
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
    };

    const dropdownRef = useRef(null);

    // Close searchable dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Helper map of darkhouseId -> mapping object for quick lookup
    const darkhouseToWarehouseMap = useMemo(() => {
        const map = {};
        mappings.forEach(m => {
            map[m.darkhouseId] = m;
        });
        return map;
    }, [mappings]);

    // Active selected Warehouse details
    const selectedWh = useMemo(() => {
        return warehouses.find(w => w.id === selectedWhId) || null;
    }, [warehouses, selectedWhId]);

    // Currently mapped dark houses for the selected warehouse
    const currentlyMappedDhs = useMemo(() => {
        if (!selectedWhId) return [];
        return mappings.filter(m => m.warehouseId === selectedWhId);
    }, [selectedWhId, mappings]);

    // List of Dark Houses currently checked but NOT yet mapped to this warehouse (new selections)
    const newlySelectedDhsList = useMemo(() => {
        if (!selectedWhId) return [];
        return darkhouses.filter(d => 
            selectedDhIds.includes(d.id) && 
            !mappings.some(m => m.warehouseId === selectedWhId && m.darkhouseId === d.id)
        );
    }, [darkhouses, selectedDhIds, mappings, selectedWhId]);

    // List of Dark Houses currently checked
    const selectedDhsList = useMemo(() => {
        return darkhouses.filter(d => selectedDhIds.includes(d.id));
    }, [darkhouses, selectedDhIds]);

    // Filter darkhouses based on sameCityOnly, selectedWh, and dhRegistrySearch
    const filteredDarkhouses = useMemo(() => {
        let list = darkhouses;
        if (selectedWh && sameCityOnly) {
            const city = selectedWh.city?.toLowerCase().trim();
            if (city) {
                list = list.filter(dh => dh.city?.toLowerCase().trim() === city);
            }
        }
        if (dhRegistrySearch.trim()) {
            const query = dhRegistrySearch.toLowerCase().trim();
            list = list.filter(dh => 
                dh.name.toLowerCase().includes(query) ||
                dh.id.toLowerCase().includes(query) ||
                dh.city.toLowerCase().includes(query)
            );
        }
        return list;
    }, [darkhouses, selectedWh, sameCityOnly, dhRegistrySearch]);

    // ─── Fetch Data from Backend API ──────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await authService.getWarehouses(1, 100);
                
                if (data.status && Array.isArray(data.data)) {
                    const list = data.data;
                    
                    const whs = list.filter(item => {
                        const type = item.warehouseType || item.type;
                        return type === "MAIN_WAREHOUSE";
                    }).map(item => ({
                        id: item.warehouseId || item.id,
                        name: item.warehouseName || item.name,
                        city: item.city || "",
                        state: item.state || "",
                        status: item.status || "ACTIVE"
                    }));

                    const dhs = list.filter(item => {
                        const type = item.warehouseType || item.type;
                        return type === "DARK_HOUSE" || type === "DARK_STORE" || type === "Lite";
                    }).map(item => ({
                        id: item.warehouseId || item.id,
                        name: item.warehouseName || item.name,
                        city: item.city || "",
                        state: item.state || "",
                        status: item.status || "ACTIVE"
                    }));

                    setWarehouses(whs);
                    setDarkhouses(dhs);

                    // Rebuild mappings based on API data or local storage fallback
                    const localSaved = localStorage.getItem("haatza_warehouse_mappings");
                    let parsedLocal = [];
                    if (localSaved) {
                        try {
                            parsedLocal = JSON.parse(localSaved);
                        } catch (e) {
                            console.error(e);
                        }
                    }

                    const tempMappings = [];
                    dhs.forEach(dh => {
                        const rawItem = list.find(x => x.warehouseId === dh.id);
                        const apiMainWhId = rawItem?.mainWarehouseId;

                        if (apiMainWhId) {
                            const wh = whs.find(w => w.id === apiMainWhId);
                            const localMap = parsedLocal.find(m => m.darkhouseId === dh.id);
                            tempMappings.push({
                                id: `MAP-${Math.floor(1000 + Math.random() * 9000)}`,
                                warehouseId: apiMainWhId,
                                warehouseName: wh ? wh.name : apiMainWhId,
                                darkhouseId: dh.id,
                                darkhouseName: dh.name,
                                region: dh.state || dh.city || "Karnataka",
                                createdDate: new Date().toISOString().split('T')[0],
                                status: "Active",
                                fallback1: localMap?.fallback1 || "",
                                fallback1Name: localMap?.fallback1Name || "",
                                fallback2: localMap?.fallback2 || "",
                                fallback2Name: localMap?.fallback2Name || "",
                                fallback3: localMap?.fallback3 || "",
                                fallback3Name: localMap?.fallback3Name || ""
                            });
                        } else {
                            const localMap = parsedLocal.find(m => m.darkhouseId === dh.id);
                            if (localMap && whs.some(w => w.id === localMap.warehouseId)) {
                                tempMappings.push(localMap);
                            }
                        }
                    });
                    setMappings(tempMappings);
                } else {
                    throw new Error("Invalid API response format");
                }
            } catch (err) {
                console.error("API error, falling back to local storage:", err);
                
                // Fallback to local files
                const localDhList = INITIAL_DARKHOUSES;
                const whs = localDhList.filter(d => d.type === "MAIN_WAREHOUSE" || d.capabilities?.includes("MAIN_WAREHOUSE")).map(d => ({
                    id: d.id,
                    name: d.name,
                    city: d.city || "",
                    state: d.state || "",
                    status: d.status || "ACTIVE"
                }));
                const dhs = localDhList.filter(d => d.type === "DARK_HOUSE" || d.capabilities?.includes("DARK_HOUSE")).map(d => ({
                    id: d.id,
                    name: d.name,
                    city: d.city || "",
                    state: d.state || "",
                    status: d.status || "ACTIVE"
                }));

                setWarehouses(whs);
                setDarkhouses(dhs);

                const localSaved = localStorage.getItem("haatza_warehouse_mappings");
                if (localSaved) {
                    try {
                        setMappings(JSON.parse(localSaved));
                    } catch (e) {
                        console.error(e);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-select the first warehouse if none is selected
    useEffect(() => {
        if (warehouses.length > 0 && !selectedWhId) {
            Promise.resolve().then(() => {
                setSelectedWhId(warehouses[0].id);
                setWhSearchQuery(warehouses[0].name);
            });
        }
    }, [warehouses, selectedWhId]);

    // ─── Pre-select Darkhouses Mapped to selected Warehouse ───────────────────
    useEffect(() => {
        if (selectedWhId) {
            const currentMappedDhIds = mappings
                .filter(m => m.warehouseId === selectedWhId)
                .map(m => m.darkhouseId);
            Promise.resolve().then(() => {
                setSelectedDhIds(currentMappedDhIds);
                
                // Auto-enable filter ONLY if there is at least one dark house in the same city
                const wh = warehouses.find(w => w.id === selectedWhId);
                if (wh && wh.city) {
                    const hasSameCityDh = darkhouses.some(d => d.city?.toLowerCase().trim() === wh.city.toLowerCase().trim());
                    setSameCityOnly(hasSameCityDh);
                } else {
                    setSameCityOnly(false);
                }
            });
        } else {
            Promise.resolve().then(() => {
                setSelectedDhIds([]);
                setSameCityOnly(false);
            });
        }
    }, [selectedWhId, mappings, warehouses, darkhouses]);

    // ─── Filter Warehouses in Centered Search Box ──────────────────────────────
    const matchingWarehouses = useMemo(() => {
        const query = whSearchQuery.toLowerCase().trim();
        if (!query) return warehouses;
        return warehouses.filter(wh =>
            wh.name.toLowerCase().includes(query) ||
            wh.id.toLowerCase().includes(query) ||
            (wh.city && wh.city.toLowerCase().includes(query))
        );
    }, [warehouses, whSearchQuery]);

    // ─── Row checkbox toggles ─────────────────────────────────────────────────
    const handleToggleDh = (dhId) => {
        setSelectedDhIds(prev => prev.includes(dhId) ? prev.filter(id => id !== dhId) : [...prev, dhId]);
    };

    // ─── API Integration Mapping Save Changes ─────────────────────────────────
    const handleAssignPrimary = async () => {
        if (!selectedWhId) {
            showToast("Please select a Main Warehouse.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const data = await authService.mapWarehouse(selectedWhId, selectedDhIds);

            if (data.status) {
                // Update local mappings state
                setMappings(prev => {
                    // Remove all old mappings associated with this warehouse OR with the selected dark houses
                    let updated = prev.filter(m => 
                        m.warehouseId !== selectedWhId && !selectedDhIds.includes(m.darkhouseId)
                    );
                    
                    // Add the new assignments
                    selectedDhsList.forEach(dh => {
                        const existingMap = prev.find(m => m.darkhouseId === dh.id);
                        updated.push({
                            id: existingMap ? existingMap.id : `MAP-${Math.floor(1000 + Math.random() * 9000)}`,
                            warehouseId: selectedWh.id,
                            warehouseName: selectedWh.name,
                            darkhouseId: dh.id,
                            darkhouseName: dh.name,
                            region: dh.state || dh.city || "Karnataka",
                            createdDate: existingMap ? existingMap.createdDate : new Date().toISOString().split('T')[0],
                            status: "Active",
                            fallback1: existingMap?.fallback1 || "",
                            fallback1Name: existingMap?.fallback1Name || "",
                            fallback2: existingMap?.fallback2 || "",
                            fallback2Name: existingMap?.fallback2Name || "",
                            fallback3: existingMap?.fallback3 || "",
                            fallback3Name: existingMap?.fallback3Name || ""
                        });
                    });
                    localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(updated));
                    return updated;
                });

                showToast(data.message || "Assignments updated successfully!", "success");
            } else {
                throw new Error(data.message || "Failed to update mapping on backend");
            }
        } catch (err) {
            console.error("Mapping error:", err);
            showToast("Failed to save mappings: " + err.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Single Row Unassign Action ──────────────────────────────────────────
    const handleSingleUnassign = async (dhId) => {
        const dh = darkhouses.find(d => d.id === dhId);
        if (!dh) return;

        if (window.confirm(`Unassign Primary Warehouse from ${dh.name}?`)) {
            setIsSaving(true);
            try {
                const data = await authService.mapWarehouse("", [dhId]);

                if (data.status) {
                    setMappings(prev => {
                        const updated = prev.filter(m => m.darkhouseId !== dhId);
                        localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(updated));
                        return updated;
                    });
                    showToast(data.message || "Assignment removed successfully!", "success");
                } else {
                    throw new Error(data.message || "Failed to clear mapping on backend");
                }
            } catch (err) {
                console.error("Unmapping error:", err);
                showToast("Failed to remove mapping: " + err.message, "error");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // ─── Inline Assign / Edit Action ──────────────────────────────────────────
    const handleInlineAssign = async (dhId, whId) => {
        setIsSaving(true);
        try {
            const data = await authService.mapWarehouse(whId, [dhId]);

            if (data.status) {
                setMappings(prev => {
                    // Remove old mapping for this dark house
                    let updated = prev.filter(m => m.darkhouseId !== dhId);
                    
                    // If a new warehouse is assigned, add it
                    if (whId) {
                        const wh = warehouses.find(w => w.id === whId);
                        const dh = darkhouses.find(d => d.id === dhId);
                        const existingMap = prev.find(m => m.darkhouseId === dhId);
                        updated.push({
                            id: existingMap ? existingMap.id : `MAP-${Math.floor(1000 + Math.random() * 9000)}`,
                            warehouseId: whId,
                            warehouseName: wh ? wh.name : whId,
                            darkhouseId: dhId,
                            darkhouseName: dh ? dh.name : dhId,
                            region: dh ? (dh.state || dh.city) : "Karnataka",
                            createdDate: existingMap ? existingMap.createdDate : new Date().toISOString().split('T')[0],
                            status: "Active",
                            fallback1: existingMap?.fallback1 || "",
                            fallback1Name: existingMap?.fallback1Name || "",
                            fallback2: existingMap?.fallback2 || "",
                            fallback2Name: existingMap?.fallback2Name || "",
                            fallback3: existingMap?.fallback3 || "",
                            fallback3Name: existingMap?.fallback3Name || ""
                        });
                    }
                    localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(updated));
                    return updated;
                });
                showToast(data.message || "Assignment updated successfully!", "success");
            } else {
                throw new Error(data.message || "Failed to update mapping on backend");
            }
        } catch (err) {
            console.error("Inline mapping error:", err);
            showToast("Failed to save mapping: " + err.message, "error");
        } finally {
            setIsSaving(false);
            setEditingDhId(null);
        }
    };

    // ─── Fallback Configuration Action Handlers ──────────────────────────────
    const handleConfigureFallbacks = (mapping) => {
        setSelectedMappingForFallback(mapping);
        setFallback1(mapping.fallback1 || "");
        setFallback2(mapping.fallback2 || "");
        setFallback3(mapping.fallback3 || "");
        setFallbackModalOpen(true);
    };

    const handleSaveFallbacks = () => {
        if (!selectedMappingForFallback) return;

        const primary = selectedMappingForFallback.warehouseId;

        // Validation: Duplicate & circular fallback prevention
        if (fallback1 && fallback1 === primary) {
            showToast("Primary Warehouse cannot be set as a Fallback.", "error");
            return;
        }
        if (fallback2 && (fallback2 === primary || fallback2 === fallback1)) {
            showToast("Priority 2 Fallback must be distinct from Primary and Priority 1.", "error");
            return;
        }
        if (fallback3 && (fallback3 === primary || fallback3 === fallback1 || fallback3 === fallback2)) {
            showToast("Priority 3 Fallback must be distinct from all other configurations.", "error");
            return;
        }

        setMappings(prev => {
            const updated = prev.map(m => {
                if (m.darkhouseId === selectedMappingForFallback.darkhouseId) {
                    const wh1 = warehouses.find(w => w.id === fallback1);
                    const wh2 = warehouses.find(w => w.id === fallback2);
                    const wh3 = warehouses.find(w => w.id === fallback3);
                    return {
                        ...m,
                        fallback1,
                        fallback1Name: wh1 ? wh1.name : "",
                        fallback2,
                        fallback2Name: wh2 ? wh2.name : "",
                        fallback3,
                        fallback3Name: wh3 ? wh3.name : ""
                    };
                }
                return m;
            });
            localStorage.setItem("haatza_warehouse_mappings", JSON.stringify(updated));
            return updated;
        });

        showToast("Fallback chain configured successfully!", "success");
        setFallbackModalOpen(false);
    };

    return (
        <div className="wh-mapping-container fade-in">
            {/* Header */}
            <div className="wh-mapping-header">
                <div className="wh-title-section">
                    <h2 className="wh-page-title">Warehouse Mapping</h2>
                    <p className="wh-page-subtitle">Configure primary warehouse assignment linkages for Dark Houses.</p>
                </div>
            </div>

            {/* Centered Search/Selector Box */}
            <div className="wh-search-section-centered">
                <label className="wh-search-label">Select Main Warehouse</label>
                <div className="wh-global-search-container" ref={dropdownRef}>
                    <div className="wh-global-search-box">
                        <Search className="wh-global-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search main warehouse name or ID..."
                            value={whSearchQuery}
                            onChange={(e) => {
                                setWhSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="wh-global-search-input"
                        />
                        {selectedWhId && (
                            <button
                                onClick={() => {
                                    setSelectedWhId("");
                                    setWhSearchQuery("");
                                    setIsDropdownOpen(false);
                                }}
                                className="wh-search-clear-btn"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {isDropdownOpen && (
                        <div className="wh-dropdown-list">
                            {matchingWarehouses.length > 0 ? (
                                matchingWarehouses.map(wh => (
                                    <div
                                        key={wh.id}
                                        onClick={() => {
                                            setSelectedWhId(wh.id);
                                            setWhSearchQuery(wh.name);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="wh-dropdown-item"
                                    >
                                        <Warehouse size={14} className="text-[#020079] mr-2" />
                                        <div className="flex flex-col">
                                            <span className="wh-dropdown-item-name font-bold text-slate-800">{wh.name}</span>
                                            <span className="wh-dropdown-item-sub font-mono text-[11px] text-slate-400">{wh.id} - {wh.city}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="wh-dropdown-no-results">
                                    No matching warehouses found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="wh-loading-container">
                    <Loader2 size={40} className="text-[#020079] animate-spin" />
                    <span>Fetching WMS registry details...</span>
                </div>
            ) : (
                <div className="wh-mapping-panels">
                    {/* Left Card: Selected Main Warehouse details & checked list */}
                    <div className="wh-panel-card wh-left-panel">
                        <div className="wh-panel-header">
                            <h3 className="wh-panel-title flex items-center gap-2">
                                <Warehouse size={16} className="text-[#020079]" />
                                <span>Available Warehouses</span>
                            </h3>
                        </div>

                        {selectedWh ? (
                            <>
                                <div className="wh-selected-wh-info animate-fadeIn">
                                    <div className="wh-info-title">{selectedWh.name}</div>
                                    <div className="wh-info-meta">
                                        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">{selectedWh.id}</span>
                                        <span className="text-slate-500 text-xs ml-2">{selectedWh.city}, {selectedWh.state}</span>
                                    </div>
                                    <div className="wh-info-status mt-2">
                                        <span className="wh-status-badge active">{selectedWh.status}</span>
                                    </div>
                                </div>

                                {/* Currently Mapped Dark Houses */}
                                <div className="wh-mapped-dhs-section">
                                    <h4 className="wh-section-subtitle">Mapped Dark Houses ({currentlyMappedDhs.length})</h4>
                                    <div className="wh-mapped-dhs-list">
                                        {currentlyMappedDhs.length === 0 ? (
                                            <div className="wh-dhs-placeholder text-xs text-slate-400 italic">
                                                No dark houses currently mapped.
                                            </div>
                                        ) : (
                                            currentlyMappedDhs.map(dh => (
                                                <div key={dh.id} className="wh-mapped-dh-card animate-fadeIn">
                                                    <div className="wh-mapped-dh-details">
                                                        <span className="wh-mapped-dh-name">{dh.darkhouseName}</span>
                                                        <div className="wh-mapped-dh-meta">
                                                            <span className="wh-mapped-dh-id">{dh.darkhouseId}</span>
                                                            <span>{dh.region}</span>
                                                        </div>
                                                        {(dh.fallback1 || dh.fallback2 || dh.fallback3) && (
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px", fontSize: "10px", color: "#64748b", fontWeight: "600" }}>
                                                                <span style={{ color: "#020079" }}>FB:</span>
                                                                {dh.fallback1 && <span style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>{dh.fallback1Name || dh.fallback1}</span>}
                                                                {dh.fallback2 && <span>&rarr;</span>}
                                                                {dh.fallback2 && <span style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>{dh.fallback2Name || dh.fallback2}</span>}
                                                                {dh.fallback3 && <span>&rarr;</span>}
                                                                {dh.fallback3 && <span style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>{dh.fallback3Name || dh.fallback3}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                        <button
                                                            onClick={() => handleConfigureFallbacks(dh)}
                                                            className="wh-action-edit-btn"
                                                            title="Configure Fallback Chain"
                                                            style={{ padding: "4px" }}
                                                        >
                                                            <Edit size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleSingleUnassign(dh.darkhouseId)}
                                                            className="wh-pill-remove-btn"
                                                            title="Unassign Dark House"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Pending Selections (New Links to Add) */}
                                <div className="wh-selections-section">
                                    <h4 className="wh-section-subtitle">New Dark Houses to Link ({newlySelectedDhsList.length})</h4>
                                    <div className="wh-selected-dhs-list">
                                        {newlySelectedDhsList.length === 0 ? (
                                            <div className="wh-dhs-placeholder text-xs text-slate-400 italic">
                                                Check Dark Houses in the registry on the right.
                                            </div>
                                        ) : (
                                            newlySelectedDhsList.map(dh => (
                                                <div key={dh.id} className="wh-selected-dh-pill animate-fadeIn">
                                                    <div className="flex flex-col">
                                                        <span className="wh-pill-name font-semibold text-slate-800 text-[12.5px]">{dh.name}</span>
                                                        <span className="wh-pill-id font-mono text-[9px] text-slate-400">{dh.id}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleDh(dh.id)}
                                                        className="wh-pill-remove-btn text-slate-400 hover:text-red-500 ml-2"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="wh-placeholder-box">
                                <AlertCircle size={24} className="text-slate-300 mb-2" />
                                <span>No warehouse selected. Search and select a warehouse in the search box above.</span>
                            </div>
                        )}

                        {/* Action Save Button */}
                        <div className="wh-action-footer mt-auto">
                            <button
                                onClick={handleAssignPrimary}
                                disabled={!selectedWhId || selectedDhIds.length === 0 || isSaving}
                                className="wh-save-btn"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <span>Save Changes</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Card: Dark Houses Registry */}
                    <div className="wh-panel-card wh-right-panel">
                        <div className="wh-panel-header">
                            <div className="flex flex-col gap-1">
                                <h3 className="wh-panel-title flex items-center gap-2">
                                    <Store size={16} className="text-[#020079]" />
                                    <span>Dark Houses Registry</span>
                                </h3>
                                {selectedWh && (
                                    <label className="wh-city-filter-toggle flex items-center gap-1.5 text-xs font-semibold text-[#020079] cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={sameCityOnly}
                                            onChange={(e) => setSameCityOnly(e.target.checked)}
                                            className="wh-checkbox-mini"
                                            style={{ margin: 0, width: "13px", height: "13px", accentColor: "#020079" }}
                                        />
                                        <span>Show {selectedWh.city || "Same City"} Only</span>
                                    </label>
                                )}
                            </div>
                            <span className="wh-panel-badge">
                                {filteredDarkhouses.length} / {darkhouses.length} DHs
                            </span>
                        </div>

                        {/* Search Input for Registry */}
                        <div className="wh-registry-search-container" style={{ marginBottom: "12px" }}>
                            <div className="wh-global-search-box" style={{ height: "36px", padding: "0 10px", borderRadius: "8px" }}>
                                <Search className="wh-global-search-icon" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search registry by name, ID, or city..."
                                    value={dhRegistrySearch}
                                    onChange={(e) => setDhRegistrySearch(e.target.value)}
                                    className="wh-global-search-input"
                                    style={{ fontSize: "12.5px" }}
                                />
                                {dhRegistrySearch && (
                                    <button
                                        onClick={() => setDhRegistrySearch("")}
                                        className="wh-search-clear-btn"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="wh-list-container">
                            <table className="wh-list-table">
                                <thead>
                                    <tr>
                                        <th className="wh-list-th" style={{ width: "35px", textAlign: "center" }}>
                                            <input
                                                type="checkbox"
                                                checked={filteredDarkhouses.length > 0 && filteredDarkhouses.every(d => selectedDhIds.includes(d.id))}
                                                onChange={() => {
                                                    const filteredIds = filteredDarkhouses.map(d => d.id);
                                                    const allFilteredSelected = filteredIds.every(id => selectedDhIds.includes(id));
                                                    if (allFilteredSelected) {
                                                        setSelectedDhIds(prev => prev.filter(id => !filteredIds.includes(id)));
                                                    } else {
                                                        setSelectedDhIds(prev => [...new Set([...prev, ...filteredIds])]);
                                                    }
                                                }}
                                                className="wh-checkbox"
                                                disabled={!selectedWhId}
                                                title={!selectedWhId ? "Select a Main Warehouse first to check dark houses" : ""}
                                            />
                                        </th>
                                        <th className="wh-list-th">Dark House Details</th>
                                        <th className="wh-list-th">Primary Warehouse</th>
                                        <th className="wh-list-th">Location</th>
                                        <th className="wh-list-th">Status</th>
                                        <th className="wh-list-th" style={{ width: "80px", textAlign: "center" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDarkhouses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="wh-list-td text-center text-slate-400" style={{ padding: "30px 0" }}>
                                                {selectedWh && sameCityOnly ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span>No dark houses found in {selectedWh.city}</span>
                                                        <button 
                                                            onClick={() => setSameCityOnly(false)} 
                                                            className="text-xs text-[#020079] underline font-semibold cursor-pointer"
                                                        >
                                                            Show all dark houses
                                                        </button>
                                                    </div>
                                                ) : (
                                                    "No dark houses found"
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDarkhouses.map(dh => {
                                            const isSelected = selectedDhIds.includes(dh.id);
                                            const mapped = darkhouseToWarehouseMap[dh.id];
                                            const isSameCity = selectedWh && dh.city?.toLowerCase().trim() === selectedWh.city?.toLowerCase().trim();
                                            return (
                                                <tr
                                                    key={dh.id}
                                                    onClick={() => {
                                                        if (selectedWhId) {
                                                            handleToggleDh(dh.id);
                                                        } else if (mapped) {
                                                            setSelectedWhId(mapped.warehouseId);
                                                            setWhSearchQuery(mapped.warehouseName);
                                                            showToast(`Selected ${mapped.warehouseName}`, "success");
                                                        } else {
                                                            showToast("Select a Main Warehouse first to check/uncheck.", "error");
                                                        }
                                                    }}
                                                    className={`wh-list-tr ${isSelected ? "selected" : ""} ${isSameCity ? "same-city-row" : ""}`}
                                                    style={{ cursor: (selectedWhId || mapped) ? "pointer" : "not-allowed" }}
                                                >
                                                    <td className="wh-list-td" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleDh(dh.id)}
                                                            className="wh-checkbox"
                                                            disabled={!selectedWhId}
                                                        />
                                                    </td>
                                                    <td className="wh-list-td">
                                                        <div className="wh-name-info">
                                                            <span className="wh-item-name">{dh.name}</span>
                                                            <span className="wh-item-sub font-mono">{dh.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="wh-list-td" onClick={(e) => e.stopPropagation()}>
                                                        {editingDhId === dh.id ? (
                                                            <select
                                                                value={mapped ? mapped.warehouseId : ""}
                                                                onChange={(e) => handleInlineAssign(dh.id, e.target.value)}
                                                                className="wh-inline-select animate-fadeIn"
                                                                autoFocus
                                                                onBlur={() => {
                                                                    setTimeout(() => setEditingDhId(null), 150);
                                                                }}
                                                            >
                                                                <option value="">-- Unassigned --</option>
                                                                {warehouses.map(w => (
                                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                                ))}
                                                            </select>
                                                        ) : mapped ? (
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="wh-primary-wh-link font-bold text-[#020079]"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedWhId(mapped.warehouseId);
                                                                        setWhSearchQuery(mapped.warehouseName);
                                                                        showToast(`Selected ${mapped.warehouseName}`, "success");
                                                                    }}
                                                                    title="Click to select this warehouse"
                                                                >
                                                                    {mapped.warehouseName}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSingleUnassign(dh.id);
                                                                    }}
                                                                    className="wh-row-unassign-btn"
                                                                    title="Unassign Primary Warehouse"
                                                                >
                                                                    <X size={10} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Unassigned</span>
                                                        )}
                                                    </td>
                                                    <td className="wh-list-td text-slate-500 font-medium">
                                                        <div className="flex items-center gap-1">
                                                            {isSameCity && <MapPin size={12} className="text-[#020079] flex-shrink-0" />}
                                                            <span>{dh.city}, {dh.state}</span>
                                                        </div>
                                                    </td>
                                                    <td className="wh-list-td">
                                                        <span className="wh-status-badge active">
                                                            {dh.status || "Active"}
                                                        </span>
                                                    </td>
                                                    <td className="wh-list-td" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                                        {editingDhId === dh.id ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingDhId(null);
                                                                }}
                                                                className="wh-action-cancel-btn"
                                                                title="Cancel Editing"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingDhId(dh.id);
                                                                }}
                                                                className="wh-action-edit-btn"
                                                                title="Edit Primary Warehouse"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TOAST NOTIFICATION ──────────────────────────────────────────────── */}
            {toast.show && (
                <div className={`wh-toast ${toast.type === "error" ? "error" : ""}`}>
                    {toast.type === "success" && <CheckCircle size={16} className="text-emerald-400" />}
                    {toast.type === "error" && <AlertCircle size={16} className="text-white" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Fallback Configuration Modal */}
            {fallbackModalOpen && selectedMappingForFallback && createPortal(
                <div className="wh-modal-backdrop" onClick={() => setFallbackModalOpen(false)}>
                    <div className="wh-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="wh-modal-header">
                            <div className="wh-modal-header__left">
                                <Warehouse size={18} className="text-[#020079]" />
                                <div className="wh-modal-header__text-block">
                                    <h3 className="wh-modal-title">Configure Fallback Warehouses</h3>
                                    <span className="wh-modal-subtitle">Set replenishment chain for {selectedMappingForFallback.darkhouseName}</span>
                                </div>
                            </div>
                            <button className="wh-modal-close" onClick={() => setFallbackModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="wh-modal-body">
                            <div className="wh-modal-form">
                                <div className="wh-form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Primary Main Warehouse (Read-Only)</label>
                                    <input
                                        type="text"
                                        value={selectedMappingForFallback.warehouseName || selectedMappingForFallback.warehouseId}
                                        disabled
                                        style={{ backgroundColor: "#f8fafc", color: "#64748b", fontWeight: "600" }}
                                    />
                                </div>
                                
                                <div className="wh-form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Priority 1 Fallback</label>
                                    <select
                                        value={fallback1}
                                        onChange={(e) => {
                                            setFallback1(e.target.value);
                                            if (!e.target.value) {
                                                setFallback2("");
                                                setFallback3("");
                                            }
                                        }}
                                    >
                                        <option value="">-- No Fallback --</option>
                                        {warehouses
                                            .filter(w => w.id !== selectedMappingForFallback.warehouseId)
                                            .map(w => (
                                                <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="wh-form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Priority 2 Fallback</label>
                                    <select
                                        value={fallback2}
                                        disabled={!fallback1}
                                        onChange={(e) => {
                                            setFallback2(e.target.value);
                                            if (!e.target.value) {
                                                setFallback3("");
                                            }
                                        }}
                                    >
                                        <option value="">-- No Fallback --</option>
                                        {warehouses
                                            .filter(w => w.id !== selectedMappingForFallback.warehouseId && w.id !== fallback1)
                                            .map(w => (
                                                <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="wh-form-group" style={{ gridColumn: "span 2" }}>
                                    <label>Priority 3 Fallback</label>
                                    <select
                                        value={fallback3}
                                        disabled={!fallback2}
                                        onChange={(e) => setFallback3(e.target.value)}
                                    >
                                        <option value="">-- No Fallback --</option>
                                        {warehouses
                                            .filter(w => w.id !== selectedMappingForFallback.warehouseId && w.id !== fallback1 && w.id !== fallback2)
                                            .map(w => (
                                                <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="wh-modal-footer">
                            <button className="wh-modal-cancel-btn" onClick={() => setFallbackModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="wh-modal-submit-btn" onClick={handleSaveFallbacks}>
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default WarehouseMappingPage;
