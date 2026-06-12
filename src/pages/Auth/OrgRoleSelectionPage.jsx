import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Building2, Users, Building, ShieldCheck, Clock, Shield, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logo.jpeg";
import SearchableSelect from "../../components/common/SearchableSelect";
import { authService } from "../../services/authService";
import "./OrgRoleSelectionPage.css";


function OrgRoleSelectionPage() {
    const navigate = useNavigate();
    const { user, warehouseRoles, completeSetup, logout } = useAuth();
    
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedRoles, setFetchedRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleErrorText, setRoleErrorText] = useState("");

    const uniqueWarehouses = React.useMemo(() => {
        const list = [];
        const warehouseMap = new Map();
        
        warehouseRoles.forEach(item => {
            if (!item || !item.warehouseId) return;
            if (!warehouseMap.has(item.warehouseId)) {
                const whObj = {
                    warehouseId: item.warehouseId,
                    warehouseName: item.warehouseName || "Warehouse",
                    roles: []
                };
                warehouseMap.set(item.warehouseId, whObj);
                list.push(whObj);
            }
            
            const whObj = warehouseMap.get(item.warehouseId);
            
            if (Array.isArray(item.roles)) {
                item.roles.forEach(r => {
                    if (r && r.roleId) {
                        whObj.roles.push({
                            roleId: r.roleId,
                            roleName: r.roleName || r.roleId
                        });
                    }
                });
            } else if (item.roleId) {
                whObj.roles.push({
                    roleId: item.roleId,
                    roleName: item.roleName || item.roleId
                });
            }
        });
        return list;
    }, [warehouseRoles]);

    const totalUniqueRoles = React.useMemo(() => {
        return new Set(
            uniqueWarehouses.flatMap(wh => wh.roles.map(r => r.roleId))
        ).size;
    }, [uniqueWarehouses]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!selectedWarehouseId) {
            setTimeout(() => {
                setFetchedRoles([]);
                setSelectedRoleId("");
                setRoleErrorText("");
            }, 0);
            return;
        }

        setTimeout(() => {
            setRolesLoading(true);
            setFetchedRoles([]);
            setSelectedRoleId("");
            setRoleErrorText("");
        }, 0);

        authService.getWarehouseRoles(selectedWarehouseId)
            .then(res => {
                if (res.status === "success" && res.message && Array.isArray(res.message.roles) && res.message.roles.length > 0) {
                    setFetchedRoles(res.message.roles);
                } else {
                    const whMatch = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
                    if (whMatch && whMatch.roles.length > 0) {
                        setFetchedRoles(whMatch.roles);
                    } else {
                        setFetchedRoles([]);
                        setRoleErrorText("No roles available");
                    }
                }
            })
            .catch(err => {
                console.error("Failed to load roles:", err);
                const whMatch = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
                if (whMatch && whMatch.roles.length > 0) {
                    setFetchedRoles(whMatch.roles);
                } else {
                    setFetchedRoles([]);
                    setRoleErrorText("No roles available");
                }
            })
            .finally(() => {
                setRolesLoading(false);
            });
    }, [selectedWarehouseId, uniqueWarehouses]);


    const warehouseOptions = uniqueWarehouses.map(wh => ({
        value: wh.warehouseId,
        label: wh.warehouseName,
        rawObj: wh
    }));

    const selectedWhObj = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
    const userRoleIds = selectedWhObj ? selectedWhObj.roles.map(r => r.roleId) : [];

    const filteredRoles = React.useMemo(() => {
        const map = new Map();
        
        // 1. Add roles from user profile first
        if (selectedWhObj) {
            selectedWhObj.roles.forEach(role => {
                map.set(role.roleId, role);
            });
        }
        
        // 2. Add roles from API fetchedRoles if they match user's role IDs
        fetchedRoles.forEach(role => {
            if (userRoleIds.includes(role.roleId)) {
                map.set(role.roleId, role);
            }
        });
        
        return Array.from(map.values());
    }, [selectedWhObj, fetchedRoles, userRoleIds]);

    if (!user) return null;

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

    const handleContinue = async (e) => {
        e.preventDefault();
        if (!selectedWarehouseId || !selectedRoleId) return;

        const selectedWhObj = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
        const selectedRlObj = filteredRoles.find(role => role.roleId === selectedRoleId);

        if (!selectedWhObj || !selectedRlObj) return;

        setIsLoading(true);
        
        const pages = await completeSetup(selectedWhObj, selectedRlObj);
        
        let targetPath;
        
        if (pages && pages.length > 0) {
            const hasDashboard = pages.some(p => p.pageId && p.pageId.toUpperCase() === "DASHBOARD" && p.canView);
            if (hasDashboard) {
                targetPath = "/dashboard";
            } else {
                const firstPage = pages.find(p => p.canView);
                const firstPageId = firstPage ? (firstPage.pageId ? firstPage.pageId.toUpperCase() : "") : "";
                switch (firstPageId) {
                    case "ORDERS": targetPath = "/orders"; break;
                    case "WAREHOUSE_INVENTORY": targetPath = "/inventory"; break;
                    case "DARKHOUSE_INVENTORY": targetPath = "/inventory?tab=darkhouse"; break;
                    case "CATALOG": targetPath = "/catalog/products"; break;
                    case "CUSTOMERS": targetPath = "/customers"; break;
                    case "BILLING": targetPath = "/billing"; break;
                    case "SETTINGS": targetPath = "/settings"; break;
                    case "ANALYTICS": targetPath = "/analytics"; break;
                    case "REPORTS": targetPath = "/reports"; break;
                    case "OPERATIONS": targetPath = "/operations"; break;
                    case "EMPLOYEES": targetPath = "/employees"; break;
                    case "ADMIN": targetPath = "/admin/members"; break;
                    default: targetPath = "/connect"; break; // Safely return to connect instead of 403
                }
            }
        } else {
            targetPath = "/connect"; // No permissions returned
        }
        
        setIsLoading(false);
        navigate(targetPath);
    };

    const currentStep = !selectedWarehouseId ? 1 : (!selectedRoleId ? 2 : 3);

    return (
        <div className="setup-page-container">

            {/* Logout Button */}
            <button className="setup-logout-btn" onClick={logout}>
                <LogOut size={16} />
                <span>Logout</span>
            </button>

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
                                placeholder={rolesLoading ? "Loading Roles..." : roleErrorText ? "No Roles Available" : "Select Role"}
                                options={roleOptions}
                                value={selectedRoleId}
                                onChange={handleRoleChange}
                                disabled={!selectedWarehouseId || rolesLoading || fetchedRoles.length === 0}
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
