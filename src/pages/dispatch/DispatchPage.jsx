import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
    Search, 
    Filter, 
    Truck, 
    CheckCircle, 
    Clock, 
    Calendar, 
    ClipboardList,
    Printer,
    FileText,
    TrendingUp,
    MapPin,
    Navigation,
    User,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import "./Dispatch.css";

const MOCK_PACKED_ORDERS = [
    { id: "ORD-8824", customer: "Sophia Bennett", destination: "HAATZA Koramangala Hub", items: "3 items", weight: "1.2 kg" },
    { id: "ORD-8825", customer: "Marcus Johnson", destination: "HAATZA Powai Depot", items: "1 item", weight: "0.5 kg" },
    { id: "ORD-8826", customer: "Aanya Sharma", destination: "HAATZA Indiranagar Hub", items: "5 items", weight: "2.4 kg" },
    { id: "ORD-8827", customer: "David Müller", destination: "HAATZA GK-1 Warehouse", items: "2 items", weight: "1.0 kg" }
];

const MOCK_DISPATCHES = [
    {
        id: "DSP-4001",
        poNumber: "DSP-MANIFEST-1080",
        destination: "HAATZA Koramangala Hub",
        carrier: "Delhivery Logistics",
        weight: "12.4 kg",
        vehicleNo: "KA-03-MJ-2201",
        driverName: "Ramesh Kumar",
        status: "In Transit",
        ordersCount: 3,
        ordersList: ["ORD-8818", "ORD-8819", "ORD-8820"],
        checkpoints: [
            { name: "Packed & Manifested", time: "10:00 AM", done: true },
            { name: "Dispatched from Central Hub", time: "10:30 AM", done: true },
            { name: "In Transit (Koramangala Route)", time: "11:15 AM", done: true },
            { name: "Out for Delivery to Darkhouse", time: "Pending", done: false },
            { name: "Delivered & Received", time: "Pending", done: false }
        ]
    },
    {
        id: "DSP-4002",
        poNumber: "DSP-MANIFEST-1081",
        destination: "HAATZA Powai Depot",
        carrier: "Blue Dart Express",
        weight: "8.5 kg",
        vehicleNo: "MH-02-AT-9081",
        driverName: "Sanjay Singh",
        status: "Manifested",
        ordersCount: 2,
        ordersList: ["ORD-8821", "ORD-8822"],
        checkpoints: [
            { name: "Packed & Manifested", time: "11:00 AM", done: true },
            { name: "Dispatched from Central Hub", time: "Pending", done: false },
            { name: "In Transit", time: "Pending", done: false },
            { name: "Out for Delivery to Darkhouse", time: "Pending", done: false },
            { name: "Delivered & Received", time: "Pending", done: false }
        ]
    },
    {
        id: "DSP-4003",
        poNumber: "DSP-MANIFEST-1082",
        destination: "HAATZA GK-1 Warehouse",
        carrier: "Shadowfax Local",
        weight: "15.0 kg",
        vehicleNo: "DL-01-SH-4491",
        driverName: "Amit Sharma",
        status: "Delivered",
        ordersCount: 4,
        ordersList: ["ORD-8814", "ORD-8815", "ORD-8816", "ORD-8817"],
        checkpoints: [
            { name: "Packed & Manifested", time: "08:30 AM", done: true },
            { name: "Dispatched from Central Hub", time: "09:00 AM", done: true },
            { name: "In Transit", time: "09:30 AM", done: true },
            { name: "Out for Delivery to Darkhouse", time: "10:00 AM", done: true },
            { name: "Delivered & Received", time: "10:15 AM", done: true }
        ]
    }
];

const CARRIERS = ["Delhivery Logistics", "Blue Dart Express", "Shadowfax Local", "DHL Express", "Zepto In-house Rider", "HAATZA Fleet"];

function DispatchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const activeTab = searchParams.get("tab") || "list";
    
    // Core Databases States
    const [dispatches, setDispatches] = useState(MOCK_DISPATCHES);
    const [packedOrders, setPackedOrders] = useState(MOCK_PACKED_ORDERS);
    
    // Active Dispatch Details State
    const [activeDispatchId, setActiveDispatchId] = useState(searchParams.get("id") || "");
    const selectedDispatch = useMemo(() => {
        return dispatches.find(d => d.id === activeDispatchId) || dispatches[0];
    }, [dispatches, activeDispatchId]);

    // Create Dispatch form states
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [carrier, setCarrier] = useState(CARRIERS[0]);
    const [vehicleNo, setVehicleNo] = useState("");
    const [driverName, setDriverName] = useState("");
    const [destination, setDestination] = useState("HAATZA Koramangala Hub");

    // Search and Filter states
    const [listSearch, setListSearch] = useState("");

    // Automatically select first dispatch for details/tracking if none selected
    useEffect(() => {
        if (!activeDispatchId && dispatches.length > 0) {
            setActiveDispatchId(dispatches[0].id);
        }
    }, [activeDispatchId, dispatches]);

    const handleTabClick = (tab) => {
        if ((tab === "details" || tab === "tracking") && activeDispatchId) {
            setSearchParams({ tab, id: activeDispatchId });
        } else {
            setSearchParams({ tab });
        }
    };

    const handleSelectDispatch = (tab, dspId) => {
        setActiveDispatchId(dspId);
        setSearchParams({ tab, id: dspId });
    };

    const handleToggleOrderSelection = (orderId) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handleCreateDispatch = (e) => {
        e.preventDefault();
        if (selectedOrders.length === 0) {
            showToast("Please select at least one packed order to dispatch.", "error");
            return;
        }
        if (!vehicleNo || !driverName) {
            showToast("Please enter driver name and vehicle number.", "error");
            return;
        }

        const dspId = "DSP-" + Math.floor(4004 + Math.random() * 100);
        const poNumber = "DSP-MANIFEST-" + Math.floor(1083 + Math.random() * 100);
        const totalWeight = (selectedOrders.length * 1.5).toFixed(1) + " kg";

        const newDispatch = {
            id: dspId,
            poNumber,
            destination,
            carrier,
            weight: totalWeight,
            vehicleNo,
            driverName,
            status: "Manifested",
            ordersCount: selectedOrders.length,
            ordersList: [...selectedOrders],
            checkpoints: [
                { name: "Packed & Manifested", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
                { name: "Dispatched from Central Hub", time: "Pending", done: false },
                { name: "In Transit", time: "Pending", done: false },
                { name: "Out for Delivery to Darkhouse", time: "Pending", done: false },
                { name: "Delivered & Received", time: "Pending", done: false }
            ]
        };

        // Add to active dispatches
        setDispatches(prev => [newDispatch, ...prev]);
        // Remove orders from packed checklist
        setPackedOrders(prev => prev.filter(o => !selectedOrders.includes(o.id)));
        
        // Reset form
        setSelectedOrders([]);
        setVehicleNo("");
        setDriverName("");

        // Navigate to list
        handleSelectDispatch("list", dspId);
        showToast(`Dispatch shipment ${poNumber} created successfully!`, "success");
    };

    // Filtered Pool
    const filteredDispatches = useMemo(() => {
        return dispatches.filter(d => 
            d.id.toLowerCase().includes(listSearch.toLowerCase()) ||
            d.poNumber.toLowerCase().includes(listSearch.toLowerCase()) ||
            d.destination.toLowerCase().includes(listSearch.toLowerCase()) ||
            d.carrier.toLowerCase().includes(listSearch.toLowerCase())
        );
    }, [dispatches, listSearch]);

    return (
        <div className="dispatch-root fade-in">
            {/* Header section */}
            <div className="dispatch-header-block">
                <div className="dispatch-header-left">
                    <h1 className="dispatch-header-title">Dispatch Management</h1>
                    <p className="dispatch-header-subtitle">
                        {activeTab === "list" && "Audit outgoing carrier shipments, manifests, and logistics handoffs."}
                        {activeTab === "create" && "Assemble packed orders, assign logistical transport vehicles, and compile cargo manifests."}
                        {activeTab === "details" && "Inspect specific dispatch bills, cargo items, routes, and signature logs."}
                        {activeTab === "tracking" && "Real-time dispatch transit timeline and route simulation tracker."}
                    </p>
                </div>
            </div>

            {/* Main statistics counters */}
            <div className="dispatch-stats-grid">
                <div className="dispatch-stat-card">
                    <span className="stat-dot dot-manifested" style={{ backgroundColor: "#f59e0b" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {dispatches.filter(d => d.status === "Manifested").length}
                        </span>
                        <span className="stat-card-label">Manifested Cargo</span>
                    </div>
                </div>
                <div className="dispatch-stat-card">
                    <span className="stat-dot dot-transit" style={{ backgroundColor: "#3b82f6" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {dispatches.filter(d => d.status === "In Transit").length}
                        </span>
                        <span className="stat-card-label">Active Transits</span>
                    </div>
                </div>
                <div className="dispatch-stat-card">
                    <span className="stat-dot dot-delivered" style={{ backgroundColor: "#10b981" }} />
                    <div className="stat-card-body">
                        <span className="stat-card-value">
                            {dispatches.filter(d => d.status === "Delivered").length}
                        </span>
                        <span className="stat-card-label">Delivered Today</span>
                    </div>
                </div>
            </div>

            {/* Tabs & Table Panel */}
            <div className="dispatch-card">
                <div className="dispatch-toolbar">
                    <div className="dispatch-tabs" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === "list"}
                            className={`dispatch-tab ${activeTab === "list" ? "dispatch-tab--active" : ""}`}
                            onClick={() => handleTabClick("list")}
                        >
                            Dispatch List
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "create"}
                            className={`dispatch-tab ${activeTab === "create" ? "dispatch-tab--active" : ""}`}
                            onClick={() => handleTabClick("create")}
                        >
                            Create Dispatch
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "details"}
                            className={`dispatch-tab ${activeTab === "details" ? "dispatch-tab--active" : ""}`}
                            onClick={() => handleTabClick("details")}
                        >
                            Dispatch Details
                        </button>
                        <button
                            role="tab"
                            aria-selected={activeTab === "tracking"}
                            className={`dispatch-tab ${activeTab === "tracking" ? "dispatch-tab--active" : ""}`}
                            onClick={() => handleTabClick("tracking")}
                        >
                            Dispatch Tracking
                        </button>
                    </div>

                    <div className="dispatch-toolbar-actions">
                        {activeTab === "list" && (
                            <div className="search-bar-wrap">
                                <Search size={14} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search dispatch ref, darkhouse..."
                                    className="toolbar-search"
                                    value={listSearch}
                                    onChange={(e) => setListSearch(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── TAB 1: DISPATCH LIST ─── */}
                {activeTab === "list" && (
                    <div className="dispatch-table-responsive">
                        <table className="dispatch-data-table">
                            <thead>
                                <tr>
                                    <th>Dispatch Ref</th>
                                    <th>Manifest ID</th>
                                    <th>Destination Darkhouse</th>
                                    <th>Carrier Partner</th>
                                    <th>Total Weight</th>
                                    <th>Driver / Vehicle</th>
                                    <th>Logistics Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDispatches.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="table-empty-state">No outgoing shipments found.</td>
                                    </tr>
                                ) : (
                                    filteredDispatches.map((dsp) => (
                                        <tr key={dsp.id}>
                                            <td className="font-mono font-bold text-blue">{dsp.id}</td>
                                            <td className="font-mono">{dsp.poNumber}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{dsp.destination}</div>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                    {dsp.ordersCount} packed packages
                                                </span>
                                            </td>
                                            <td>{dsp.carrier}</td>
                                            <td>{dsp.weight}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{dsp.driverName}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>{dsp.vehicleNo}</div>
                                            </td>
                                            <td>
                                                <span className={`dsp-status-badge ${dsp.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                                    {dsp.status === "Delivered" ? <CheckCircle size={11} /> : <Clock size={11} />}
                                                    <span>{dsp.status}</span>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        className="dsp-action-btn primary"
                                                        onClick={() => handleSelectDispatch("tracking", dsp.id)}
                                                    >
                                                        <Navigation size={12} />
                                                        <span>Track</span>
                                                    </button>
                                                    <button 
                                                        className="dsp-inline-btn"
                                                        onClick={() => handleSelectDispatch("details", dsp.id)}
                                                    >
                                                        <FileText size={12} />
                                                        <span>Details</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ─── TAB 2: CREATE DISPATCH ─── */}
                {activeTab === "create" && (
                    <div className="create-dispatch-container">
                        <form onSubmit={handleCreateDispatch} className="create-dispatch-layout">
                            <div className="form-sections-wrapper">
                                {/* Left form options */}
                                <div className="form-details-section">
                                    <h3 className="section-title">Logistics & Vehicle Allocations</h3>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label htmlFor="destination">Destination Darkhouse</label>
                                            <select 
                                                id="destination" 
                                                value={destination} 
                                                onChange={(e) => setDestination(e.target.value)}
                                            >
                                                <option value="HAATZA Koramangala Hub">HAATZA Koramangala Hub (Hub Code: KOR-3)</option>
                                                <option value="HAATZA Powai Depot">HAATZA Powai Depot (Hub Code: POW-2)</option>
                                                <option value="HAATZA Indiranagar Hub">HAATZA Indiranagar Hub (Hub Code: IND-1)</option>
                                                <option value="HAATZA GK-1 Warehouse">HAATZA GK-1 Warehouse (Hub Code: GKI-5)</option>
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="carrier">Carrier Logistic Partner</label>
                                            <select 
                                                id="carrier" 
                                                value={carrier} 
                                                onChange={(e) => setCarrier(e.target.value)}
                                            >
                                                {CARRIERS.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="driverName">Driver Assigned Name</label>
                                            <input 
                                                type="text" 
                                                id="driverName" 
                                                placeholder="e.g. Ramesh Kumar"
                                                value={driverName}
                                                onChange={(e) => setDriverName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="vehicleNo">Vehicle Registration Number</label>
                                            <input 
                                                type="text" 
                                                id="vehicleNo" 
                                                placeholder="e.g. KA-03-MJ-2201"
                                                value={vehicleNo}
                                                onChange={(e) => setVehicleNo(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-note">
                                        <ArrowUpRight size={14} className="note-icon" />
                                        <span>Dispatch manifests compile immediately. Shipping labels and vehicle manifest notes print upon posting.</span>
                                    </div>
                                </div>

                                {/* Right checklist of packed orders */}
                                <div className="form-checklist-section">
                                    <h3 className="section-title">Select Packed Orders for Dispatch</h3>
                                    <div className="orders-checklist-box">
                                        {packedOrders.length === 0 ? (
                                            <div className="no-packed-orders">
                                                <CheckCircle size={36} style={{ color: "#10b981", marginBottom: "8px" }} />
                                                <h4>All Packed Orders Dispatched</h4>
                                                <p>No orders are currently waiting at the packing docks.</p>
                                            </div>
                                        ) : (
                                            packedOrders.map((order) => (
                                                <div 
                                                    key={order.id} 
                                                    className={`checklist-item ${selectedOrders.includes(order.id) ? "selected" : ""}`}
                                                    onClick={() => handleToggleOrderSelection(order.id)}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(order.id)}
                                                        onChange={() => {}} // Controlled by div click
                                                    />
                                                    <div className="checklist-meta">
                                                        <div className="meta-row">
                                                            <span className="order-id font-mono font-bold text-blue">{order.id}</span>
                                                            <span className="weight-badge">{order.weight}</span>
                                                        </div>
                                                        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-main)" }}>
                                                            {order.customer}
                                                        </div>
                                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                            Destination: {order.destination}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="selection-stats">
                                        Selected: <strong>{selectedOrders.length} orders</strong> | Est. Load: <strong>{(selectedOrders.length * 1.5).toFixed(1)} kg</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="create-dispatch-footer">
                                <button className="dsp-btn primary" type="submit">
                                    <Truck size={16} />
                                    <span>Post Manifest & Dispatch cargo</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── TAB 3: DISPATCH DETAILS ─── */}
                {activeTab === "details" && selectedDispatch && (
                    <div className="dispatch-details-container">
                        <div className="details-layout-split">
                            {/* Left Inspector Card */}
                            <div className="details-card-main">
                                <div className="details-header-band">
                                    <div>
                                        <h3 className="dispatch-main-id">Dispatch Ref: {selectedDispatch.id}</h3>
                                        <span className={`dsp-status-badge ${selectedDispatch.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                            {selectedDispatch.status}
                                        </span>
                                    </div>
                                    <button 
                                        className="dsp-inline-btn"
                                        onClick={() => showToast(`Opening Manifest Print Sheet...`, "success")}
                                    >
                                        <Printer size={13} />
                                        <span>Print Manifest</span>
                                    </button>
                                </div>

                                <div className="details-meta-grid">
                                    <div className="meta-item">
                                        <span className="label">Logistic Manifest ID</span>
                                        <span className="val font-mono font-bold text-blue">{selectedDispatch.poNumber}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Logistic Carrier Partner</span>
                                        <span className="val font-bold">{selectedDispatch.carrier}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Total Dispatch Cargo Weight</span>
                                        <span className="val">{selectedDispatch.weight}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="label">Destination Darkhouse</span>
                                        <span className="val">{selectedDispatch.destination}</span>
                                    </div>
                                </div>

                                <div className="details-metadata-split border-top">
                                    <div className="sub-section">
                                        <h4 className="sub-title">Transport Vehicle & Driver</h4>
                                        <div className="driver-details-wrap">
                                            <div className="avatar-wrap">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{selectedDispatch.driverName}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>Vehicle: {selectedDispatch.vehicleNo}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="sub-section">
                                        <h4 className="sub-title">Cargo Orders List</h4>
                                        <div className="cargo-orders-list">
                                            {selectedDispatch.ordersList.map((ordId) => (
                                                <div key={ordId} className="cargo-order-pill">
                                                    <span className="font-mono font-bold text-blue">{ordId}</span>
                                                    <ChevronRight size={12} className="arrow-icon" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Route Milestones */}
                            <div className="details-route-milestones">
                                <h3 className="section-title">Logistical Transit Milestones</h3>
                                <div className="milestones-vertical-timeline">
                                    {selectedDispatch.checkpoints.map((cp, idx) => (
                                        <div key={idx} className={`timeline-checkpoint ${cp.done ? "completed" : ""}`}>
                                            <div className="checkpoint-marker">
                                                {cp.done ? "✓" : ""}
                                            </div>
                                            <div className="checkpoint-details">
                                                <div className="checkpoint-name font-bold">{cp.name}</div>
                                                <div className="checkpoint-time font-mono">{cp.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TAB 4: DISPATCH TRACKING ─── */}
                {activeTab === "tracking" && selectedDispatch && (
                    <div className="dispatch-tracking-container">
                        <div className="tracking-split-map">
                            {/* Left Active Timeline */}
                            <div className="tracking-live-timeline">
                                <div className="live-header">
                                    <div className="pulse-dot" />
                                    <h3 className="live-title">Live Tracking: {selectedDispatch.id}</h3>
                                </div>
                                <div className="live-stats">
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Current ETA</div>
                                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e60ff" }}>
                                        {selectedDispatch.status === "Delivered" ? "Delivered" : "22 mins"}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Transit Route: Hub $\rightarrow$ {selectedDispatch.destination}</div>
                                </div>

                                <div className="milestones-vertical-timeline font-sm">
                                    {selectedDispatch.checkpoints.map((cp, idx) => (
                                        <div key={idx} className={`timeline-checkpoint ${cp.done ? "completed" : ""}`}>
                                            <div className="checkpoint-marker">
                                                {cp.done ? "✓" : ""}
                                            </div>
                                            <div className="checkpoint-details">
                                                <div className="checkpoint-name font-bold">{cp.name}</div>
                                                <div className="checkpoint-time font-mono">{cp.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Simulated Interactive Tracking Map */}
                            <div className="tracking-map-graphic">
                                <div className="simulated-map-overlay">
                                    <div className="map-node node-origin">
                                        <MapPin size={24} style={{ color: "#ef4444" }} />
                                        <span className="node-label">Central Hub</span>
                                    </div>
                                    <div className="route-dashed-line">
                                        <div className={`transit-vehicle-graphic ${selectedDispatch.status === "Delivered" ? "at-dest" : "in-route"}`}>
                                            <Truck size={20} style={{ color: "#1e60ff" }} />
                                        </div>
                                    </div>
                                    <div className="map-node node-destination">
                                        <MapPin size={24} style={{ color: "#10b981" }} />
                                        <span className="node-label">{selectedDispatch.destination.replace("HAATZA ", "")}</span>
                                    </div>
                                </div>
                                <span className="map-bg-text font-mono">SIMULATED TRANSIT VECTOR MAP</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DispatchPage;
