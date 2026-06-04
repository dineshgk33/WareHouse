import React, { useState, useEffect } from "react";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SearchableSelect from "../common/SearchableSelect";
import "./SwitchWorkspaceModal.css";

function SwitchWorkspaceModal({ onClose }) {
    const { user, warehouseRoles, completeSetup, selectedWarehouseId: currentWarehouseId, selectedRoleId: currentRoleId, setPermissionsFromApi } = useAuth();
    
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

    if (!user) return null;

    const uniqueWarehouses = [
        ...new Map(warehouseRoles.map(item => [item.warehouseId, item])).values()
    ];

    const filteredRoles = warehouseRoles.filter(role => role.warehouseId === selectedWarehouseId);

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
            // Call your secure API to get permissions
            const apiUrl = import.meta.env.VITE_PERMISSIONS_API_URL;
            const apiKey = import.meta.env.VITE_PERMISSIONS_API_KEY;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    warehouseId: selectedWhObj.warehouseId,
                    roleId: selectedRlObj.roleId
                })
            });
            const data = await response.json();

            if (data.status === 'success') {
                // Set the permissions in the context
                setPermissionsFromApi(data.message.accessiblePages);
            } else {
                console.error("API returned an error:", data);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }

        setTimeout(() => {
            setIsLoading(false);
            completeSetup(selectedWhObj, selectedRlObj);
            onClose(); // Close modal immediately after state update
        }, 500);
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
                            placeholder="Select Role"
                            options={roleOptions}
                            value={selectedRoleId}
                            onChange={handleRoleChange}
                            disabled={!selectedWarehouseId}
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
