import React, { useState, useEffect } from "react";
import { 
    getVendors, 
    saveVendors,
    getVendorScorecard
} from "../../services/purchaseService";
import { addAuditLog } from "../../services/dbService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import { 
    Plus, 
    Check, 
    X, 
    Eye, 
    Mail, 
    Phone, 
    MapPin, 
    Globe, 
    Activity, 
    Star 
} from "lucide-react";
import "./PurchaseStyles.css";

function Vendors() {
    const { userName } = useAuth();
    const { showToast } = useToast();

    const [vendorsList, setVendorsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const vendorScore = React.useMemo(() => {
        if (!selectedVendor) return null;
        return getVendorScorecard(selectedVendor.vendorCode);
    }, [selectedVendor]);

    // Form State
    const [vendorName, setVendorName] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [fssaiNumber, setFssaiNumber] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [categories, setCategories] = useState("");
    const [leadTime, setLeadTime] = useState(2);
    const [serviceAreas, setServiceAreas] = useState("");

    // Bank details
    const [accNo, setAccNo] = useState("");
    const [bankName, setBankName] = useState("");
    const [ifsc, setIfsc] = useState("");

    const loadData = () => {
        setVendorsList(getVendors());
    };

    useEffect(() => {
        Promise.resolve().then(() => {
            loadData();
        });
    }, []);



    const handleCreateVendor = (e) => {
        e.preventDefault();
        
        // GST Validation: 15 characters
        if (gstNumber.length !== 15) {
            showToast("GST Number must be precisely 15 alphanumeric characters.", "error");
            return;
        }

        // FSSAI Validation: 14 digits
        if (fssaiNumber.trim() && !/^\d{14}$/.test(fssaiNumber.trim())) {
            showToast("FSSAI license number must be exactly 14 numeric digits.", "error");
            return;
        }

        const list = getVendors();
        const code = `VEN-${String(list.length + 1).padStart(3, "0")}`;

        const newVendor = {
            vendorCode: code,
            vendorName,
            gstNumber,
            fssaiNumber,
            contactPerson,
            phone,
            email,
            address,
            bankDetails: { accountNumber: accNo, bankName, ifscCode: ifsc },
            categories: categories.split(",").map(c => c.trim()).filter(Boolean),
            leadTime: parseInt(leadTime) || 2,
            serviceAreas: serviceAreas.split(",").map(a => a.trim()).filter(Boolean),
            status: "ACTIVE"
        };

        list.push(newVendor);
        saveVendors(list);

        addAuditLog(
            userName,
            "Create Vendor",
            "Vendor Management",
            null,
            newVendor,
            `Registered vendor ${code} - ${vendorName}`
        );

        showToast(`Vendor ${vendorName} registered successfully under ${code}!`, "success");
        setIsCreateModalOpen(false);

        // Reset form
        setVendorName("");
        setGstNumber("");
        setFssaiNumber("");
        setContactPerson("");
        setPhone("");
        setEmail("");
        setAddress("");
        setCategories("");
        setLeadTime(2);
        setServiceAreas("");
        setAccNo("");
        setBankName("");
        setIfsc("");
        loadData();
    };

    const handleToggleStatus = (vendorCode) => {
        const list = getVendors();
        const index = list.findIndex(v => v.vendorCode === vendorCode);
        if (index !== -1) {
            const nextStatus = list[index].status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            list[index].status = nextStatus;
            saveVendors(list);
            addAuditLog(userName, "Toggle Vendor Status", "Vendor Management", null, list[index], `Updated ${vendorCode} status to ${nextStatus}`);
            showToast(`Vendor ${vendorCode} status changed to ${nextStatus}.`, "success");
            loadData();
            if (selectedVendor && selectedVendor.vendorCode === vendorCode) {
                setSelectedVendor(list[index]);
            }
        }
    };

    const filteredVendors = vendorsList.filter(v => 
        v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div className="purchase-header-block">
                <div>
                    <h1 className="purchase-header-title">Vendor Directory</h1>
                    <p className="purchase-header-subtitle">
                        Maintain master directories, GST/FSSAI licensing thresholds, compliance terms, and vendor performance indexes.
                    </p>
                </div>
                <div className="purchase-actions-group">
                    <button 
                        className="purchase-btn primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Register New Vendor</span>
                    </button>
                </div>
            </div>

            {/* List and Details section */}
            <div className="purchase-card">
                <div className="purchase-table-filters">
                    <input 
                        type="text" 
                        placeholder="Search by Vendor Code, Name, GST..."
                        className="purchase-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="purchase-table-container">
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>Vendor Code</th>
                                <th>Name</th>
                                <th>GST Number</th>
                                <th>Contact Person</th>
                                <th>Email / Phone</th>
                                <th>Lead Time</th>
                                <th>Categories</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                                        No vendors found. Click "Register New Vendor" to add one.
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendorCode}>
                                        <td className="font-mono font-bold text-success" onClick={() => setSelectedVendor(vendor)} style={{ cursor: "pointer" }}>
                                            {vendor.vendorCode}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{vendor.vendorName}</td>
                                        <td className="font-mono">{vendor.gstNumber}</td>
                                        <td>{vendor.contactPerson}</td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", fontSize: "11px" }}>
                                                <span>{vendor.email}</span>
                                                <span className="text-muted">{vendor.phone}</span>
                                            </div>
                                        </td>
                                        <td>{vendor.leadTime} Days</td>
                                        <td>
                                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                {vendor.categories.map((cat, i) => (
                                                    <span key={i} className="purchase-badge draft" style={{ fontSize: "10px", padding: "2px 6px" }}>
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`purchase-badge ${vendor.status === "ACTIVE" ? "approved" : "rejected"}`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button 
                                                    className="purchase-action-btn-sm"
                                                    onClick={() => setSelectedVendor(vendor)}
                                                >
                                                    <Eye size={12} />
                                                    <span>Scorecard</span>
                                                </button>
                                                <button 
                                                    className="purchase-action-btn-sm"
                                                    style={{ borderColor: vendor.status === "ACTIVE" ? "var(--color-danger)" : "var(--color-success)" }}
                                                    onClick={() => handleToggleStatus(vendor.vendorCode)}
                                                >
                                                    {vendor.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Vendor Scorecard & Profile Modal */}
            {selectedVendor && vendorScore && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "700px" }}>
                        <div className="purchase-modal-header">
                            <h3 className="purchase-modal-title">Vendor File: {selectedVendor.vendorName}</h3>
                            <button className="purchase-modal-close" onClick={() => setSelectedVendor(null)}>×</button>
                        </div>
                        <div className="purchase-modal-body">
                            {/* Vendor Scorecard Row */}
                            <h4 className="purchase-detail-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Star size={16} className="text-warning" style={{ fill: "var(--color-warning)" }} />
                                <span>Dynamic Performance Scorecard</span>
                            </h4>
                            <div className="vendor-scorecard-grid">
                                <div className="vendor-score-box">
                                    <span className="vendor-score-value">{vendorScore.fillRate}%</span>
                                    <span className="vendor-score-label">Fill Rate</span>
                                </div>
                                <div className="vendor-score-box">
                                    <span className="vendor-score-value">{vendorScore.onTimeDelivery}%</span>
                                    <span className="vendor-score-label">On-Time OTIF</span>
                                </div>
                                <div className="vendor-score-box">
                                    <span className="vendor-score-value" style={{ color: "var(--color-danger)" }}>{vendorScore.rejectionRate}%</span>
                                    <span className="vendor-score-label">Rejection Rate</span>
                                </div>
                                <div className="vendor-score-box">
                                    <span className="vendor-score-value" style={{ color: "var(--color-danger)" }}>{vendorScore.damageRate}%</span>
                                    <span className="vendor-score-label">Damage Rate</span>
                                </div>
                                <div className="vendor-score-box">
                                    <span className="vendor-score-value">{vendorScore.avgLeadTime}d</span>
                                    <span className="vendor-score-label">Avg Lead Time</span>
                                </div>
                            </div>

                            <div className="purchase-detail-grid" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
                                <div>
                                    <h4 className="purchase-detail-title">Vendor Contact & Registration details</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <Phone size={14} className="text-muted" />
                                            <span><strong>Phone:</strong> {selectedVendor.phone}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <Mail size={14} className="text-muted" />
                                            <span><strong>Email:</strong> {selectedVendor.email}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <MapPin size={14} className="text-muted" />
                                            <span><strong>Address:</strong> {selectedVendor.address}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <span><strong>GST Reg No:</strong> <code className="font-bold">{selectedVendor.gstNumber}</code></span>
                                        </div>
                                        {selectedVendor.fssaiNumber && (
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                <span><strong>FSSAI Lic No:</strong> <code className="font-bold">{selectedVendor.fssaiNumber}</code></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="purchase-detail-title">Banking Reference</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                                        <div><strong>Bank Name:</strong> {selectedVendor.bankDetails.bankName}</div>
                                        <div><strong>Account No:</strong> {selectedVendor.bankDetails.accountNumber}</div>
                                        <div><strong>IFSC Code:</strong> {selectedVendor.bankDetails.ifscCode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="purchase-modal-footer">
                            <button className="purchase-btn secondary" onClick={() => setSelectedVendor(null)}>Close</button>
                            <button 
                                className="purchase-btn danger"
                                onClick={() => handleToggleStatus(selectedVendor.vendorCode)}
                            >
                                {selectedVendor.status === "ACTIVE" ? "Deactivate Vendor" : "Activate Vendor"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Vendor Modal */}
            {isCreateModalOpen && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal" style={{ maxWidth: "800px" }}>
                        <form onSubmit={handleCreateVendor}>
                            <div className="purchase-modal-header">
                                <h3 className="purchase-modal-title">Register Master Vendor Profile</h3>
                                <button type="button" className="purchase-modal-close" onClick={() => setIsCreateModalOpen(false)}>×</button>
                            </div>
                            <div className="purchase-modal-body">
                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="vendorName">Vendor Name</label>
                                        <input 
                                            type="text" 
                                            id="vendorName"
                                            value={vendorName}
                                            onChange={(e) => setVendorName(e.target.value)}
                                            placeholder="e.g. Instamart Dairy Dist"
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="gstNo">GST Number (15 chars)</label>
                                        <input 
                                            type="text" 
                                            id="gstNo"
                                            value={gstNumber}
                                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                                            maxLength="15"
                                            placeholder="e.g. 27AAAAA1111A1Z1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="fssaiNo">FSSAI License Number (14 digits, optional)</label>
                                        <input 
                                            type="text" 
                                            id="fssaiNo"
                                            value={fssaiNumber}
                                            onChange={(e) => setFssaiNumber(e.target.value)}
                                            maxLength="14"
                                            placeholder="e.g. 10012011000120"
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="contactName">Contact Person Name</label>
                                        <input 
                                            type="text" 
                                            id="contactName"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="vendorPhone">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            id="vendorPhone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="vendorEmail">Email Address</label>
                                        <input 
                                            type="email" 
                                            id="vendorEmail"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-field" style={{ marginBottom: "16px" }}>
                                    <label htmlFor="vendorAddress">Full Warehouse/Farm Address</label>
                                    <textarea 
                                        id="vendorAddress"
                                        rows="2"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="vendorCats">Service Categories (comma separated)</label>
                                        <input 
                                            type="text" 
                                            id="vendorCats"
                                            value={categories}
                                            onChange={(e) => setCategories(e.target.value)}
                                            placeholder="e.g. Dairy, Fruits, Frozen"
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="vendorLead">Average Delivery Lead Time (Days)</label>
                                        <input 
                                            type="number" 
                                            id="vendorLead"
                                            value={leadTime}
                                            min="1"
                                            onChange={(e) => setLeadTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="purchase-form-field" style={{ marginBottom: "16px" }}>
                                    <label htmlFor="vendorAreas">Service Areas / Cities (comma separated)</label>
                                    <input 
                                        type="text" 
                                        id="vendorAreas"
                                        value={serviceAreas}
                                        onChange={(e) => setServiceAreas(e.target.value)}
                                        placeholder="e.g. Mumbai, Bangalore, Pune"
                                        required
                                    />
                                </div>

                                <h4 className="purchase-detail-title">Vendor Settlement Banking References</h4>
                                <div className="purchase-form-grid">
                                    <div className="purchase-form-field">
                                        <label htmlFor="bankAcc">Account Number</label>
                                        <input 
                                            type="text" 
                                            id="bankAcc"
                                            value={accNo}
                                            onChange={(e) => setAccNo(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="bankN">Bank Name</label>
                                        <input 
                                            type="text" 
                                            id="bankN"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="purchase-form-field">
                                        <label htmlFor="bankIfsc">IFSC Code</label>
                                        <input 
                                            type="text" 
                                            id="bankIfsc"
                                            value={ifsc}
                                            onChange={(e) => setIfsc(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="purchase-modal-footer">
                                <button type="button" className="purchase-btn secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="purchase-btn primary">Save Vendor File</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vendors;
