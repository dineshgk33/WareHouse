import React, { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import SearchableSelect from "../common/SearchableSelect";
import { authService } from "../../services/authService";
import "./SwitchWorkspaceModal.css";

function SwitchWorkspaceModal({ onClose }) {
    const { user, warehouseRoles, completeSetup, selectedWarehouseId: currentWarehouseId, selectedRoleId: currentRoleId } = useAuth();
    
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(currentWarehouseId || "");
    const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId || "");
    const [isLoading, setIsLoading] = useState(false);

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const uniqueWarehouses = React.useMemo(() => {
        const list = [];
        const warehouseMap = new Map();
        
        if (!Array.isArray(warehouseRoles)) return list;

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
                        if (!whObj.roles.some(existing => existing.roleId === r.roleId)) {
                            whObj.roles.push({
                                roleId: r.roleId,
                                roleName: r.roleName || r.roleId
                            });
                        }
                    }
                });
            } else if (item.roleId) {
                if (!whObj.roles.some(existing => existing.roleId === item.roleId)) {
                    whObj.roles.push({
                        roleId: item.roleId,
                        roleName: item.roleName || item.roleId
                    });
                }
            }
        });
        return list;
    }, [warehouseRoles]);

    const fetchedRoles = React.useMemo(() => {
        if (!selectedWarehouseId) return [];
        const whMatch = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
        return (whMatch && Array.isArray(whMatch.roles)) ? whMatch.roles : [];
    }, [selectedWarehouseId, uniqueWarehouses]);

    const roleErrorText = React.useMemo(() => {
        if (!selectedWarehouseId) return "";
        const whMatch = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
        if (!whMatch || !Array.isArray(whMatch.roles) || whMatch.roles.length === 0) {
            return "No roles available";
        }
        return "";
    }, [selectedWarehouseId, uniqueWarehouses]);

    const warehouseOptions = uniqueWarehouses.map(wh => ({
        value: wh.warehouseId,
        label: wh.warehouseName,
        rawObj: wh
    }));

    const filteredRoles = fetchedRoles;
    const rolesLoading = false;

    const roleOptions = filteredRoles.map(role => ({
        value: role.roleId,
        label: role.roleName,
        rawObj: role
    }));

    // If selected warehouse changes and selected role is not in the new list, clear the role
    useEffect(() => {
        if (selectedWarehouseId && selectedRoleId) {
            const roleExists = filteredRoles.some(r => r.roleId === selectedRoleId);
            if (!roleExists) {
                setTimeout(() => {
                    setSelectedRoleId("");
                }, 0);
            }
        }
    }, [selectedWarehouseId, filteredRoles, selectedRoleId]);

    if (!user) return null;

    const handleWarehouseChange = (val) => {
        setSelectedWarehouseId(val);
        setSelectedRoleId("");
    };

    const handleRoleChange = (val) => {
        setSelectedRoleId(val);
    };

    const handleSwitch = async (e) => {
        e.preventDefault();
        if (!selectedWarehouseId || !selectedRoleId) return;

        const selectedWhObj = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId);
        const selectedRlObj = filteredRoles.find(role => role.roleId === selectedRoleId);

        if (!selectedWhObj || !selectedRlObj) return;

        // If no actual change, just close
        if (selectedWarehouseId === currentWarehouseId && selectedRoleId === currentRoleId) {
            onClose();
            return;
        }

        setIsLoading(true);

        try {
            // completeSetup already calls authService.getRolePermissions,
            // saves to localStorage, and updates accessiblePages state.
            await completeSetup(selectedWhObj, selectedRlObj);
        } catch (error) {
            console.error("Failed to switch workspace permissions:", error);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <div className="switch-workspace-overlay">
            <div className="switch-workspace-modal">
                <button className="switch-workspace-close-btn" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>
                
                <div className="switch-workspace-header">
                    <h2 className="switch-workspace-title">Switch Workspace</h2>
                    <p className="switch-workspace-subtitle">Choose another warehouse and role.</p>
                </div>

                <form onSubmit={handleSwitch} className="switch-workspace-form">
                    <div className="switch-workspace-field">
                        <label>Warehouse</label>
                        <SearchableSelect
                            placeholder="Select Warehouse"
                            options={warehouseOptions}
                            value={selectedWarehouseId}
                            onChange={handleWarehouseChange}
                            iconType="warehouse"
                        />
                    </div>

                    <div className="switch-workspace-field">
                        <label>Role</label>
                        <SearchableSelect
                            placeholder={rolesLoading ? "Loading Roles..." : roleErrorText ? "No Roles Available" : "Select Role"}
                            options={roleOptions}
                            value={selectedRoleId}
                            onChange={handleRoleChange}
                            disabled={!selectedWarehouseId || rolesLoading || filteredRoles.length === 0}
                            iconType="role"
                        />
                    </div>

                    <div className="switch-workspace-actions">
                        <button type="button" className="switch-workspace-cancel-btn" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="switch-workspace-submit-btn" 
                            disabled={isLoading || !selectedWarehouseId || !selectedRoleId}
                        >
                            {isLoading ? (
                                <span className="switch-workspace-spinner"></span>
                            ) : (
                                <>
                                    Switch Workspace
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SwitchWorkspaceModal;
