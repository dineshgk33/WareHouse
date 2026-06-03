import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DEFAULT_ROLES } from "../../constants/rolePermissions";
import RoleCard from "./RoleCard";
import PermissionsViewerModal from "./PermissionsViewerModal";
import EditPermissionsModal from "./EditPermissionsModal";
import EditRoleModal from "./EditRoleModal";
import DeleteRoleModal from "./DeleteRoleModal";
import AdminVerificationModal from "./AdminVerificationModal";
import "./roles.css";

function UserRolesSection({ showToast }) {
    const { userName, userPassword } = useAuth();

    const [roles, setRoles] = useState(() => {
        const cached = localStorage.getItem("haatza_roles");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                return DEFAULT_ROLES;
            }
        }
        return DEFAULT_ROLES;
    });

    const [auditTrail, setAuditTrail] = useState(() => {
        const cached = localStorage.getItem("haatza_role_audit_trail");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                return [];
            }
        }
        return [];
    });

    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [editPermissionsOpen, setEditPermissionsOpen] = useState(false);
    const [editRoleOpen, setEditRoleOpen] = useState(false);
    const [createRoleOpen, setCreateRoleOpen] = useState(false);
    const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);
    const [adminVerifyOpen, setAdminVerifyOpen] = useState(false);
    const [draftPermissions, setDraftPermissions] = useState([]);
    const [verifyConfig, setVerifyConfig] = useState(null);

    useEffect(() => {
        localStorage.setItem("haatza_roles", JSON.stringify(roles));
    }, [roles]);

    useEffect(() => {
        localStorage.setItem("haatza_role_audit_trail", JSON.stringify(auditTrail));
    }, [auditTrail]);

    const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;

    const verifyPassword = useCallback(
        (password) => {
            const adminPassword = userPassword || localStorage.getItem("userPassword") || "";
            if (!password || password !== adminPassword) {
                return { ok: false, message: "Incorrect administrator password." };
            }
            return { ok: true };
        },
        [userPassword]
    );

    const requestVerification = useCallback((config) => {
        setVerifyConfig(config);
        setAdminVerifyOpen(true);
    }, []);

    const handleAdminVerified = useCallback(() => {
        verifyConfig?.onSuccess?.();
        setVerifyConfig(null);
        setAdminVerifyOpen(false);
    }, [verifyConfig]);

    const addAuditEntry = useCallback(
        ({ roleName, previousPermissions, updatedPermissions }) => {
            const added = updatedPermissions.filter((p) => !previousPermissions.includes(p));
            const removed = previousPermissions.filter((p) => !updatedPermissions.includes(p));
            const now = new Date();
            setAuditTrail((prev) =>
                [
                    {
                        id: `${now.getTime()}_${roleName}`,
                        roleName,
                        modifiedBy: userName || "Administrator",
                        dateTime: now.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        added,
                        removed,
                    },
                    ...prev,
                ].slice(0, 50)
            );
        },
        [userName]
    );

    const openViewer = (roleId) => {
        setSelectedRoleId(roleId);
        setEditPermissionsOpen(false);
        setEditRoleOpen(false);
        setDeleteRoleOpen(false);
        setCreateRoleOpen(false);
        setViewerOpen(true);
    };

    const openEditPermissions = () => {
        if (!selectedRole) return;
        setDraftPermissions([...selectedRole.permissions]);
        setEditRoleOpen(false);
        setDeleteRoleOpen(false);
        setCreateRoleOpen(false);
        setViewerOpen(false);
        setEditPermissionsOpen(true);
    };

    const openEditRole = () => {
        setEditPermissionsOpen(false);
        setDeleteRoleOpen(false);
        setCreateRoleOpen(false);
        setViewerOpen(false);
        setEditRoleOpen(true);
    };

    const openDeleteRole = () => {
        setEditPermissionsOpen(false);
        setEditRoleOpen(false);
        setCreateRoleOpen(false);
        setViewerOpen(false);
        setDeleteRoleOpen(true);
    };

    const handleSavePermissions = () => {
        if (!selectedRole) return;
        requestVerification({
            message:
                "Permission changes affect system security. Please enter administrator password to continue.",
            confirmLabel: "Verify & Save",
            onSuccess: () => {
                const previous = selectedRole.permissions;
                setRoles((prev) =>
                    prev.map((item) =>
                        item.id === selectedRole.id
                            ? { ...item, permissions: draftPermissions }
                            : item
                    )
                );
                addAuditEntry({
                    roleName: selectedRole.name,
                    previousPermissions: previous,
                    updatedPermissions: draftPermissions,
                });
                setEditPermissionsOpen(false);
                showToast?.("Permission changes saved successfully.");
            },
        });
    };

    const handleSaveRole = ({ name, description }) => {
        const isCreate = createRoleOpen;
        if (!name?.trim()) return;
        requestVerification({
            message:
                "Role changes affect system security. Please enter administrator password to continue.",
            confirmLabel: isCreate ? "Verify & Create" : "Verify & Save",
            onSuccess: () => {
                if (isCreate) {
                    const normalizedId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setRoles((prev) => [
                        ...prev,
                        {
                            id: `${normalizedId}-${Date.now()}`,
                            name,
                            description: description || "Custom role.",
                            badge: name.slice(0, 2).toUpperCase(),
                            badgeClass: "support",
                            permissions: ["View Settings"],
                        },
                    ]);
                    setCreateRoleOpen(false);
                    showToast?.("Role created successfully.");
                    return;
                }
                if (!selectedRole) return;
                setRoles((prev) =>
                    prev.map((item) =>
                        item.id === selectedRole.id ? { ...item, name, description } : item
                    )
                );
                setEditRoleOpen(false);
                showToast?.("Role updated successfully.");
            },
        });
    };

    const handleDeleteRoleConfirm = () => {
        if (!selectedRole) return;
        setDeleteRoleOpen(false);
        requestVerification({
            message:
                "Deleting roles affects system security. Please enter administrator password to continue.",
            confirmLabel: "Verify & Delete",
            onSuccess: () => {
                const deletedName = selectedRole.name;
                setRoles((prev) => prev.filter((item) => item.id !== selectedRole.id));
                setSelectedRoleId(null);
                showToast?.(`${deletedName} role deleted.`);
            },
        });
    };

    return (
        <div className="tab-panel-content fade-in">
            <div className="panel-title-block">
                <h3>System Roles & Permissions</h3>
                <p>Manage warehouse role access with admin verification and full audit tracking.</p>
            </div>

            <div className="roles-breakdown-list">
                {roles.map((role) => (
                    <RoleCard key={role.id} role={role} onViewPermissions={openViewer} />
                ))}
            </div>

            <div className="roles-footer-actions">
                <button
                    type="button"
                    className="role-btn role-btn--primary"
                    onClick={() => {
                        setSelectedRoleId(null);
                        setCreateRoleOpen(true);
                    }}
                >
                    <Plus size={15} />
                    Create Role
                </button>
            </div>

            <div className="roles-audit-section">
                <h4>Role Activity History</h4>
                {auditTrail.length === 0 ? (
                    <p className="roles-audit-empty">No role updates recorded yet.</p>
                ) : (
                    <div className="roles-audit-list">
                        {auditTrail.map((entry) => (
                            <article className="roles-audit-card" key={entry.id}>
                                <p>
                                    Admin {entry.modifiedBy} modified {entry.roleName} role.
                                </p>
                                {entry.added?.length > 0 && (
                                    <p>
                                        <strong>Added:</strong> {entry.added.join(", ")}
                                    </p>
                                )}
                                {entry.removed?.length > 0 && (
                                    <p>
                                        <strong>Removed:</strong> {entry.removed.join(", ")}
                                    </p>
                                )}
                                <p>
                                    <strong>Date:</strong> {entry.dateTime}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <PermissionsViewerModal
                isOpen={viewerOpen}
                role={selectedRole}
                onClose={() => setViewerOpen(false)}
                onEditPermissions={openEditPermissions}
                onEditRole={openEditRole}
                onDeleteRole={openDeleteRole}
            />

            <EditPermissionsModal
                isOpen={editPermissionsOpen}
                role={selectedRole}
                permissions={draftPermissions}
                onChangePermissions={setDraftPermissions}
                onClose={() => setEditPermissionsOpen(false)}
                onSave={handleSavePermissions}
                onEditRole={openEditRole}
                onDeleteRole={openDeleteRole}
            />

            <EditRoleModal
                isOpen={editRoleOpen}
                role={selectedRole}
                onClose={() => setEditRoleOpen(false)}
                onSave={handleSaveRole}
                onEditPermissions={openEditPermissions}
                onDeleteRole={openDeleteRole}
            />

            <EditRoleModal
                isOpen={createRoleOpen}
                role={null}
                isCreate
                onClose={() => setCreateRoleOpen(false)}
                onSave={handleSaveRole}
            />

            <DeleteRoleModal
                isOpen={deleteRoleOpen}
                role={selectedRole}
                onClose={() => setDeleteRoleOpen(false)}
                onConfirmDelete={handleDeleteRoleConfirm}
                onEditPermissions={openEditPermissions}
                onEditRole={openEditRole}
            />

            <AdminVerificationModal
                isOpen={adminVerifyOpen}
                administratorName={userName}
                message={
                    verifyConfig?.message ||
                    "You are attempting to modify role permissions. Please enter your administrator password to continue."
                }
                confirmLabel={verifyConfig?.confirmLabel || "Verify & Save"}
                onClose={() => {
                    setAdminVerifyOpen(false);
                    setVerifyConfig(null);
                }}
                onVerify={handleAdminVerified}
                verifyPassword={verifyPassword}
            />
        </div>
    );
}

export default UserRolesSection;
