import React, { useEffect, useState } from "react";
import { Loader2, Check, Search } from "lucide-react";
import Modal from "./Modal";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./roles.css";

const getRoleDescription = (roleName) => {
    const defaultRoles = [
        { name: "Super Admin", description: "Full platform ownership with unrestricted access across all modules." },
        { name: "Administrator", description: "Full platform ownership with unrestricted access across all modules." },
        { name: "Warehouse Manager", description: "Oversees stock movement, darkhouse operations, and order fulfillment." },
        { name: "Store Manager", description: "Oversees stock movement, darkhouse operations, and order fulfillment." },
        { name: "Inventory Manager", description: "Maintains inventory records, stock adjustments, and shelf-level accuracy." },
        { name: "Operation Head", description: "Full system operations, analytics, reporting, and team management." },
        { name: "Picker", description: "Locates and collects items from shelves for packaging." },
        { name: "Packer", description: "Packages collected products and prepares shipment labels." },
        { name: "Viewer", description: "Read-only access to warehouse dashboards and inventory logs." }
    ];
    const match = defaultRoles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    return match ? match.description : "Access to assigned workspace modules and settings.";
};

function MemberRoleEditModal({
    isOpen,
    employee,
    uniqueWarehouses,
    sessionWarehouseId,
    onClose,
    onSave
}) {
    const { warehouseRoles } = useAuth();
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [fetchedRoles, setFetchedRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const [roleSearchQuery, setRoleSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state when modal is opened
    useEffect(() => {
        if (isOpen && employee) {
            const empWhRoles = employee.warehouseRoles || [];
            const initialWhId = empWhRoles.length > 0 ? empWhRoles[0].warehouseId : (sessionWarehouseId || "");
            const initialRoleIds = empWhRoles.map(r => r.roleId || r.id).filter(Boolean);
            
            setTimeout(() => {
                setSelectedWarehouseId(initialWhId);
                setSelectedRoleIds(initialRoleIds);
                setRoleSearchQuery("");
            }, 0);
        }
    }, [isOpen, employee, sessionWarehouseId]);

    // Fetch roles dynamically when the selected warehouse changes
    useEffect(() => {
        if (!selectedWarehouseId) {
            setTimeout(() => {
                setFetchedRoles([]);
            }, 0);
            return;
        }

        let isMounted = true;
        setTimeout(() => {
            setRolesLoading(true);
        }, 0);

        authService.getWarehouseRoles(selectedWarehouseId)
            .then((res) => {
                if (!isMounted) return;
                
                let rolesList = [];
                if (res && res.status === "success" && res.message) {
                    if (Array.isArray(res.message.roles)) {
                        rolesList = res.message.roles;
                    } else if (Array.isArray(res.message)) {
                        rolesList = res.message;
                    }
                }

                // Fallback to local context warehouse roles if API doesn't return roles
                if (rolesList.length === 0 && Array.isArray(warehouseRoles)) {
                    const whMatch = warehouseRoles.find(r => r.warehouseId === selectedWarehouseId);
                    if (whMatch && Array.isArray(whMatch.roles)) {
                        rolesList = whMatch.roles.map(role => ({
                            roleId: role.roleId || role.id,
                            roleName: role.roleName || role.name,
                            warehouseId: selectedWarehouseId
                        }));
                    } else {
                        rolesList = warehouseRoles.filter(r => r.warehouseId === selectedWarehouseId);
                    }
                }

                // Filter by selected warehouse
                const filtered = rolesList.filter(role => role.warehouseId === selectedWarehouseId || !role.warehouseId);
                
                // Map to ensure clean properties
                const mapped = filtered.map(role => ({
                    roleId: role.roleId || role.id || "",
                    roleName: role.roleName || role.name || "Member"
                }));

                setFetchedRoles(mapped);
            })
            .catch((err) => {
                console.error("Failed to fetch roles:", err);
                if (!isMounted) return;
                
                // Fallback on error
                let rolesList = [];
                if (Array.isArray(warehouseRoles)) {
                    const whMatch = warehouseRoles.find(r => r.warehouseId === selectedWarehouseId);
                    if (whMatch && Array.isArray(whMatch.roles)) {
                        rolesList = whMatch.roles.map(role => ({
                            roleId: role.roleId || role.id,
                            roleName: role.roleName || role.name,
                            warehouseId: selectedWarehouseId
                        }));
                    }
                }
                const mapped = rolesList.map(role => ({
                    roleId: role.roleId || role.id || "",
                    roleName: role.roleName || role.name || "Member"
                }));
                setFetchedRoles(mapped);
            })
            .finally(() => {
                if (isMounted) setRolesLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedWarehouseId, warehouseRoles]);

    if (!employee) return null;

    const handleSave = () => {
        if (!selectedWarehouseId || selectedRoleIds.length === 0) return;
        setIsSaving(true);

        const selectedWh = uniqueWarehouses.find(wh => wh.warehouseId === selectedWarehouseId) || {};
        const warehouseRolesPayload = selectedRoleIds.map(roleId => {
            const roleObj = fetchedRoles.find(r => r.roleId === roleId);
            return {
                warehouseId: selectedWarehouseId,
                roleName: roleObj ? roleObj.roleName : "Member",
                warehouseName: selectedWh.warehouseName || "Warehouse",
                status: "Active",
                roleId: roleId
            };
        });

        onSave(warehouseRolesPayload, () => {
            setIsSaving(false);
        });
    };

    const header = (
        <div className="role-viewer-header__info">
            <h2 id="role-edit-title">Edit Roles - {employee.name}</h2>
            <p className="role-viewer-header__desc">{employee.email} • ID: {employee.employeeId}</p>
        </div>
    );

    const headerActions = (
        <>
            <button
                type="button"
                className="role-btn role-btn--primary"
                onClick={handleSave}
                disabled={isSaving || !selectedWarehouseId || selectedRoleIds.length === 0}
            >
                {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={onClose}
                disabled={isSaving}
            >
                Cancel
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="role-edit-title"
            header={header}
            headerActions={headerActions}
            showClose={!isSaving}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px' }}>
                {/* Warehouse Dropdown Select */}
                <div className="role-form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Warehouse Assignment</label>
                    <select
                        value={selectedWarehouseId}
                        onChange={(e) => {
                            setSelectedWarehouseId(e.target.value);
                            setSelectedRoleIds([]); // Reset role selection when warehouse changes
                        }}
                        disabled={isSaving}
                        style={{
                            width: '100%',
                            height: '42px',
                            borderRadius: '10px',
                            border: '1.5px solid #cbd5e1',
                            padding: '0 12px',
                            fontSize: '14px',
                            outline: 'none',
                            background: '#ffffff',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="" disabled>Select a warehouse</option>
                        {uniqueWarehouses.map((wh) => (
                            <option key={wh.warehouseId} value={wh.warehouseId}>
                                {wh.warehouseName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Role List Selection */}
                <div className="role-form-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Role Selection</label>
                    
                    {/* Role Search */}
                    <div className="search-input-wrapper" style={{ position: 'relative', width: '100%', marginBottom: '6px' }}>
                        <Search size={14} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search roles..."
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            disabled={isSaving || !selectedWarehouseId}
                            style={{ 
                                width: '100%', 
                                height: '42px', 
                                paddingLeft: '36px',
                                paddingRight: '12px',
                                borderRadius: '10px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {rolesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <Loader2 className="animate-spin" size={28} style={{ color: '#2563eb' }} />
                        </div>
                    ) : !selectedWarehouseId ? (
                        <div style={{ padding: '16px', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>
                            Please select a warehouse first to load roles.
                        </div>
                    ) : fetchedRoles.length === 0 ? (
                        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', textAlign: 'center' }}>
                            No roles available for the selected warehouse
                        </div>
                    ) : (
                        <div className="role-cards-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '8px' }}>
                            {fetchedRoles
                                .filter(role => 
                                    role.roleName.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
                                    role.roleId.toLowerCase().includes(roleSearchQuery.toLowerCase())
                                )
                                .map(role => (
                                    <div 
                                        key={role.roleId} 
                                        className={`role-card-item ${selectedRoleIds.includes(role.roleId) ? 'selected' : ''}`}
                                        onClick={() => {
                                            if (isSaving) return;
                                            setSelectedRoleIds(prev => {
                                                if (prev.includes(role.roleId)) {
                                                    return prev.filter(id => id !== role.roleId);
                                                } else {
                                                    return [...prev, role.roleId];
                                                }
                                            });
                                        }}
                                        style={{ pointerEvents: isSaving ? 'none' : 'auto' }}
                                    >
                                        <div className="role-card-item-header">
                                            <span className="role-card-item-name">
                                                {selectedRoleIds.includes(role.roleId) && <Check size={14} strokeWidth={3} style={{ marginRight: '6px' }} />}
                                                {role.roleName}
                                            </span>
                                            <span className="role-card-item-id">{role.roleId}</span>
                                        </div>
                                        <p className="role-card-item-desc" style={{ marginTop: '4px' }}>
                                            {getRoleDescription(role.roleName)}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default MemberRoleEditModal;
