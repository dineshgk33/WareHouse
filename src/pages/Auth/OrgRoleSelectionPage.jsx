import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Building2, Users, Building, ShieldCheck, Clock, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logo.jpeg"; // Reusing the logo but inside the styling wrapper
import "./OrgRoleSelectionPage.css";

// Reusable Searchable Dropdown Selector Component
function SearchableSelect({
    label,
    placeholder,
    options,
    value,
    onChange,
    disabled = false,
    displayKey = "label",
    valueKey = "value",
    searchKey = "label",
    iconType
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find(opt => opt[valueKey] === value);

    const filteredOptions = options.filter(opt =>
        String(opt[searchKey]).toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleOutsideClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        setSearch("");
    };

    const handleOptionSelect = (option) => {
        onChange(option[valueKey], option);
        setIsOpen(false);
        setSearch("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("", null);
        setIsOpen(false);
        setSearch("");
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) setIsOpen(true);
            else setHighlightedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : prev);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (isOpen) setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleOptionSelect(filteredOptions[highlightedIndex]);
            } else if (!isOpen) {
                setIsOpen(true);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="searchable-select-root" ref={containerRef} onKeyDown={handleKeyDown}>
            <button
                type="button"
                className={`select-trigger-btn ${isOpen ? "open" : ""}`}
                onClick={handleToggle}
                disabled={disabled}
            >
                {/* Dynamic Icon */}
                {iconType === 'warehouse' && (
                    <div className="select-icon-left warehouse">
                        <Building2 size={16} />
                    </div>
                )}
                {iconType === 'role' && (
                    <div className="select-icon-left role">
                        <Users size={16} />
                    </div>
                )}

                <div className="select-trigger-value">
                    {selectedOption ? (
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>{selectedOption[displayKey]}</span>
                    ) : (
                        <span className="select-trigger-placeholder">{placeholder}</span>
                    )}
                </div>
                <div className="select-actions" style={{ display: 'flex', alignItems: 'center' }}>
                    {selectedOption && !disabled && (
                        <button type="button" onClick={handleClear} aria-label="Clear selection" style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', padding: '0 4px', color: '#64748b' }}>
                            ✕
                        </button>
                    )}
                    <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", marginLeft: '4px', color: '#64748b' }} />
                </div>
            </button>

            {isOpen && (
                <div className="select-dropdown-menu">
                    <div className="select-search-container">
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="select-search-input"
                            placeholder="Search options..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setHighlightedIndex(-1);
                            }}
                        />
                    </div>
                    <ul className="select-options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => (
                                <li
                                    key={opt[valueKey]}
                                    className={`select-option-item ${opt[valueKey] === value ? "selected" : ""} ${idx === highlightedIndex ? "highlighted" : ""}`}
                                    onClick={() => handleOptionSelect(opt)}
                                >
                                    {opt[displayKey]}
                                </li>
                            ))
                        ) : (
                            <li className="select-no-results">No options matched</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function OrgRoleSelectionPage() {
    const navigate = useNavigate();
    const { user, warehouseRoles, completeSetup } = useAuth();
    
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    if (!user) return null;

    const uniqueWarehouses = [
        ...new Map(warehouseRoles.map(item => [item.warehouseId, item])).values()
    ];

    const filteredRoles = warehouseRoles.filter(role => role.warehouseId === selectedWarehouseId);
    const totalUniqueRoles = new Set(warehouseRoles.map(r => r.roleId)).size;

    const warehouseOptions = uniqueWarehouses.map(wh => ({
        value: wh.warehouseId,
        label: wh.warehouseName,
        rawObj: wh
    }));

    const roleOptions = filteredRoles.map(role => ({
        value: role.roleId,
        label: role.roleName,
        rawObj: role
    }));

    const handleWarehouseChange = (val) => {
        setSelectedWarehouseId(val);
        setSelectedRoleId("");
    };

    const handleRoleChange = (val) => {
        setSelectedRoleId(val);
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (!selectedWarehouseId || !selectedRoleId) return;

        const selectedWhObj = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
        const selectedRlObj = filteredRoles.find(role => role.roleId === selectedRoleId);

        if (!selectedWhObj || !selectedRlObj) return;

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            completeSetup(selectedWhObj, selectedRlObj);
            navigate("/dashboard");
        }, 1200);
    };

    const currentStep = !selectedWarehouseId ? 1 : (!selectedRoleId ? 2 : 3);

    return (
        <div className="setup-page-container">

            {/* Header */}
            <div className="setup-page-header">
                <h1 className="setup-page-title">Select Your Workspace</h1>
                <p className="setup-page-subtitle">Choose the warehouse and role you want to access.</p>
            </div>

            {/* Main Card */}
            <div className="workspace-card">
                
                {/* Left Side: Form Elements */}
                <div className="workspace-card-left">
                    
                    {/* Step Indicator */}
                    <div className="step-indicator">
                        <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="step-circle">1</div>
                            <span className="step-label">Warehouse</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="step-circle">2</div>
                            <span className="step-label">Role</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-circle">3</div>
                            <span className="step-label">Access</span>
                        </div>
                    </div>

                    <form onSubmit={handleContinue} className="selection-form">
                        {/* Warehouse Section */}
                        <div className="selector-field-group">
                            <label>Warehouse</label>
                            <SearchableSelect
                                placeholder="Select Warehouse"
                                options={warehouseOptions}
                                value={selectedWarehouseId}
                                onChange={handleWarehouseChange}
                                iconType="warehouse"
                            />
                        </div>

                        {/* Role Section */}
                        <div className="selector-field-group">
                            <label>Role</label>
                            <SearchableSelect
                                placeholder="Select Role"
                                options={roleOptions}
                                value={selectedRoleId}
                                onChange={handleRoleChange}
                                disabled={!selectedWarehouseId}
                                iconType="role"
                            />
                        </div>

                        {/* Submit Button & Footer */}
                        <div className="setup-action-wrapper">
                            <button
                                type="submit"
                                className="setup-continue-btn"
                                disabled={isLoading || !selectedWarehouseId || !selectedRoleId}
                            >
                                {isLoading ? (
                                    <span className="setup-spinner"></span>
                                ) : (
                                    <>
                                        <span>Continue To Dashboard</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                            <div className="secure-footer">
                                <ShieldCheck size={14} color="#10b981" />
                                <span>Your data is secure and encrypted</span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Side: Operations Overview Panel */}
                <div className="workspace-card-right">
                    <h3 className="info-panel-title">
                        <div className="info-panel-title-icon">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        Operations Overview
                    </h3>
                    
                    <div className="info-grid">
                        <div className="info-item">
                            <div className="info-icon-wrapper blue">
                                <Building2 size={18} />
                            </div>
                            <span className="info-label">Active Warehouses</span>
                            <span className="info-value">{uniqueWarehouses.length}</span>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-wrapper purple">
                                <Users size={18} />
                            </div>
                            <span className="info-label">Available Roles</span>
                            <span className="info-value">{totalUniqueRoles}</span>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-wrapper green">
                                <Building size={18} />
                            </div>
                            <span className="info-label">Organization</span>
                            <span className="info-value">{user.Organization || "Haatza"}</span>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-wrapper green">
                                <Shield size={18} />
                            </div>
                            <span className="info-label">System Status</span>
                            <span className="info-value status-operational">
                                <span className="status-dot"></span> Operational
                            </span>
                        </div>
                        <div className="info-item">
                            <div className="info-icon-wrapper orange">
                                <Clock size={18} />
                            </div>
                            <span className="info-label">Last Sync</span>
                            <span className="info-value">
                                Just Now
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default OrgRoleSelectionPage;
