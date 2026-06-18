import React, { useState, useEffect } from "react";
import { 
    getInboundDeliveries, 
    saveInboundDeliveries,
    getPurchaseOrders
} from "../../services/purchaseService";
import { addAuditLog } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    Plus, 
    Check, 
    Truck, 
    Eye, 
    User,
    Calendar,
    Phone,
    MapPin,
    ArrowRight
} from "lucide-react";
import "./PurchaseStyles.css";

function InboundDeliveries() {
    const { userName } = useAuth();
    const { showToast } = useToast();

    const [deliveries, setDeliveries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Form State
    const [selectedPONumber, setSelectedPONumber] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [driverName, setDriverName] = useState("");
    const [driverPhone, setDriverPhone] = useState("");
    const [eta, setEta] = useState("");

    const loadData = () => {
        setDeliveries(getInboundDeliveries());
    };

    useEffect(() => {
        loadData();
    }, []);

    const acceptedPOs = getPurchaseOrders().filter(po => ["Approved", "Sent To Vendor", "Accepted"].includes(po.status));

    const handleCreateDelivery = (e) => {
        e.preventDefault();
        if (!selectedPONumber) {
            showToast("Please select an accepted Purchase Order.", "error");
            return;
        }

        const po = getPurchaseOrders().find(p => p.poNumber === selectedPONumber);
        const list = getInboundDeliveries();
        const code = `IBD-${30000 + list.length + 1}`;

        const newDelivery = {
            shipmentNumber: code,
            poNumber: selectedPONumber,
            vendorCode: po ? po.vendorCode : "Unknown",
            vendorName: po ? po.vendorName : "Unknown Vendor",
            warehouseId: "DKH-001",
            warehouseName: po ? po.warehouseName : "HAATZA Koramangala Hub",
            vehicleNumber,
            driverName,
            driverPhone,
            eta: eta || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: "Created",
            items: po ? po.items.map(itm => ({
                sku: itm.sku,
                productName: itm.productName,
                expectedQty: itm.quantity
            })) : []
        };

        list.push(newDelivery);
        saveInboundDeliveries(list);

        addAuditLog(
            userName,
            "Create Inbound Delivery",
            "Inbound Deliveries",
            null,
            newDelivery,
            `Logged inbound delivery ${code} for PO ${selectedPONumber}`
        );

        showToast(`Inbound Delivery ${code} logged successfully!`, "success");
        setIsCreateModalOpen(false);

        // Reset Form
        setSelectedPONumber("");
        setVehicleNumber("");
        setDriverName("");
        setDriverPhone("");
        setEta("");
        loadData();
    };

    const handleUpdateStatus = (shipmentNumber, nextStatus) => {
        const list = getInboundDeliveries();
        const index = list.findIndex(d => d.shipmentNumber === shipmentNumber);
        if (index !== -1) {
            list[index].status = nextStatus;
            saveInboundDeliveries(list);
            addAuditLog(userName, "Update Inbound Shipment Status", "Inbound Deliveries", null, list[index], `Changed shipment ${shipmentNumber} status to ${nextStatus}`);
            showToast(`Inbound Delivery ${shipmentNumber} status updated to ${nextStatus}.`, "success");
            loadData();
            if (selectedDelivery && selectedDelivery.shipmentNumber === shipmentNumber) {
                setSelectedDelivery(list[index]);
            }
        }
    };

    const filteredDeliveries = deliveries.filter(d => 
        d.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Inbound Deliveries</h1>
                    <p className="purchase-header-subtitle">
                        Track carrier shipments, eta schedules, driver details, and unloading gate statuses.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Log Inbound Carrier Shipment</span>
                    </button>
                </div>
            </div>

            {/* List and Details section */}
            <div className="purchase-card">
                <div className="purchase-table-filters">
                    <input 
                        type="text" 
                        placeholder="Search by Shipment, PO Number, Vendor, Status..."
                        className="purchase-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>Shipment No</th>
                                <th>PO Reference</th>
                                <th>Vendor</th>
                                <th>Vehicle Number</th>
                                <th>Driver Name</th>
                                <th>Scheduled ETA</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeliveries.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                                        No inbound shipments logged. Click "Log Inbound Carrier Shipment" to register one.
                                    </td>
                                </tr>
                            ) : (
                                filteredDeliveries.map((delivery) => (
                                    <tr key={delivery.shipmentNumber}>
                                        <td className="font-mono font-bold text-success" onClick={() => setSelectedDelivery(delivery)} style={{ cursor: "pointer" }}>
                                            {delivery.shipmentNumber}
                                        </td>
                                        <td className="font-mono font-bold text-blue">{delivery.poNumber}</td>
                                        <td style={{ fontWeight: 600 }}>{delivery.vendorName}</td>
                                        <td className="font-mono">{delivery.vehicleNumber}</td>
                                        <td>{delivery.driverName}</td>
                                        <td>{new Date(delivery.eta).toLocaleString()}</td>
                                        <td>
                                            <span className={`purchase-badge ${delivery.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                                {delivery.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button 
                                                    className="purchase-action-btn-sm"
                                                    onClick={() => setSelectedDelivery(delivery)}
                                                >
                                                    <Eye size={12} />
                                                    <span>View</span>
                                                </button>
                                                {delivery.status === "Created" && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
                                                        onClick={() => handleUpdateStatus(delivery.shipmentNumber, "In Transit")}
                                                    >
                                                        <Truck size={12} />
                                                        <span>Dispatch</span>
                                                    </button>
                                                )}
                                                {delivery.status === "In Transit" && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--color-info)", color: "var(--color-info)" }}
                                                        onClick={() => handleUpdateStatus(delivery.shipmentNumber, "Arrived")}
                                                    >
                                                        <Check size={12} />
                                                        <span>Gate Arrive</span>
                                                    </button>
                                                )}
                                                {delivery.status === "Arrived" && (
                                                    <button 
                                                        className="purchase-action-btn-sm"
                                                        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                                                        onClick={() => handleUpdateStatus(delivery.shipmentNumber, "Unloaded")}
                                                    >
                                                        <ArrowRight size={12} />
                                                        <span>Gate Unload</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Delivery Details Modal */}
            {selectedDelivery && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "600px" }}>
                        <div className="purchase-modal-header">
                            <h3 className="purchase-modal-title">Carrier Details: {selectedDelivery.shipmentNumber}</h3>
                            <button className="purchase-modal-close" onClick={() => setSelectedDelivery(null)}>×</button>
                        </div>
                        <div className="purchase-modal-body">
                            <div className="purchase-detail-meta" style={{ marginBottom: "20px" }}>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">PO Reference</span>
                                    <span className="purchase-detail-value font-mono text-blue">{selectedDelivery.poNumber}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Vendor</span>
                                    <span className="purchase-detail-value">{selectedDelivery.vendorName}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">ETA Schedule</span>
                                    <span className="purchase-detail-value">{new Date(selectedDelivery.eta).toLocaleString()}</span>
                                </div>
                                <div className="purchase-detail-item">
                                    <span className="purchase-detail-label">Unloading Warehouse</span>
                                    <span className="purchase-detail-value">{selectedDelivery.warehouseName}</span>
                                </div>
                            </div>

                            <h4 className="purchase-detail-title">Logistics & Driver details</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                                <div><strong>Driver Name:</strong> {selectedDelivery.driverName}</div>
                                <div><strong>Driver Contact:</strong> {selectedDelivery.driverPhone}</div>
                                <div><strong>Carrier Vehicle No:</strong> <code className="font-bold">{selectedDelivery.vehicleNumber}</code></div>
                            </div>

                            <h4 className="purchase-detail-title">Manifest Product Counts</h4>
                            <div className="purchase-table-container">
                                <table className="purchase-table">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product Name</th>
                                            <th>Expected Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDelivery.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-mono">{item.sku}</td>
                                                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                                <td style={{ fontWeight: 700 }}>{item.expectedQty} units</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="purchase-modal-footer">
                            <button className="purchase-btn secondary" onClick={() => setSelectedDelivery(null)}>Close</button>
                            {selectedDelivery.status === "Created" && (
                                <button 
                                    className="purchase-btn primary"
                                    onClick={() => handleUpdateStatus(selectedDelivery.shipmentNumber, "In Transit")}
                                >
                                    Confirm Dispatch to Transit
                                </button>
                            )}
                            {selectedDelivery.status === "In Transit" && (
                                <button 
                                    className="purchase-btn primary"
                                    onClick={() => handleUpdateStatus(selectedDelivery.shipmentNumber, "Arrived")}
                                >
                                    Log Arrival at Gate
                                </button>
                            )}
                            {selectedDelivery.status === "Arrived" && (
                                <button 
                                    className="purchase-btn primary"
                                    onClick={() => handleUpdateStatus(selectedDelivery.shipmentNumber, "Unloaded")}
                                >
                                    Start Cargo Unloading
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Log Delivery Modal */}
            {isCreateModalOpen && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "600px" }}>
                        <form onSubmit={handleCreateDelivery}>
                            <div className="purchase-modal-header">
                                <h3 className="purchase-modal-title">Log Inbound Carrier details</h3>
                                <button type="button" className="purchase-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                            </div>
                            <div className="purchase-modal-body">
                                <div className="purchase-form-field" style={{ marginBottom: "16px" }}>
                                    <label htmlFor="delPO">Select Accepted Purchase Order</label>
                                    <select 
                                        id="delPO"
                                        value={selectedPONumber}
                                        onChange={(e) => setSelectedPONumber(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose PO --</option>
                                        {acceptedPOs.map(po => (
                                            <option key={po.poNumber} value={po.poNumber}>{po.poNumber} • {po.vendorName} ({po.totalCost.toLocaleString()})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="delVehicle">Vehicle Number</label>
                                        <input 
                                            type="text" 
                                            id="delVehicle"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                            placeholder="e.g. KA-03-MB-1123"
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="delETA">ETA Schedule</label>
                                        <input 
                                            type="datetime-local" 
                                            id="delETA"
                                            value={eta}
                                            onChange={(e) => setEta(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="delDriver">Driver Name</label>
                                        <input 
                                            type="text" 
                                            id="delDriver"
                                            value={driverName}
                                            onChange={(e) => setDriverName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="delPhone">Driver Phone</label>
                                        <input 
                                            type="tel" 
                                            id="delPhone"
                                            value={driverPhone}
                                            onChange={(e) => setDriverPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="purchase-modal-footer">
                                <button type="button" className="purchase-btn secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="purchase-btn primary">Log Inbound Gate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InboundDeliveries;
