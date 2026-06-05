import React, { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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

    const [fetchedRoles, setFetchedRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleErrorText, setRoleErrorText] = useState("");

    useEffect(() => {
        if (!selectedWarehouseId) {
            setFetchedRoles([]);
            setSelectedRoleId("");
            setRoleErrorText("");
            return;
        }

        setRolesLoading(true);
        setFetchedRoles([]);
        setSelectedRoleId("");
        setRoleErrorText("");

        authService.getWarehouseRoles(selectedWarehouseId)
            .then(res => {
                if (res.status === "success" && res.message && Array.isArray(res.message.roles) && res.message.roles.length > 0) {
                    setFetchedRoles(res.message.roles);
                } else {
                    const fallback = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                    if (fallback.length > 0) {
                        setFetchedRoles(fallback);
                    } else {
                        setFetchedRoles([]);
                        setRoleErrorText("No roles available");
                    }
                }
            })
            .catch(err => {
                console.error("Failed to load roles:", err);
                const fallback = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                if (fallback.length > 0) {
                    setFetchedRoles(fallback);
                } else {
                    setFetchedRoles([]);
                    setRoleErrorText("No roles available");
                }
            })
            .finally(() => {
                setRolesLoading(false);
            });
    }, [selectedWarehouseId]);

    if (!user) return null;

    const uniqueWarehouses = [
        ...new Map(warehouseRoles.map(item => [item.warehouseId, item])).values()
    ];

    const warehouseOptions = uniqueWarehouses.map(wh => ({
        value: wh.warehouseId,
        label: wh.warehouseName,
        rawObj: wh
    }));

    const userRoleIds = warehouseRoles
        .filter(r => r.warehouseId === selectedWarehouseId)
        .map(r => r.roleId);

    const filteredRoles = fetchedRoles.filter(role => userRoleIds.includes(role.roleId));

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
                setSelectedRoleId("");
            }
        }
    }, [selectedWarehouseId, filteredRoles, selectedRoleId]);

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
