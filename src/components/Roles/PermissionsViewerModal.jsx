import React, { useMemo, useState, useEffect } from "react";
import { Check } from "lucide-react";
import Modal from "./Modal";
import Accordion from "./Accordion";
import {
    buildPermissionMap,
    getEnabledInCategory,
    VIEW_PERMISSION_CATEGORIES,
    PERMISSION_CATEGORIES,
} from "./rolePermissionsUtils";
import "./roles.css";

function PermissionsViewerModal({
    isOpen,
    role,
    onClose,
    onEditRole,
    onDeleteRole,
    onSave,
    initialIsEditing = false,
    onCancelEditing,
}) {
    const permissionMap = useMemo(
        () => buildPermissionMap(PERMISSION_CATEGORIES),
        []
    );

    const [expanded, setExpanded] = useState(() =>
        PERMISSION_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = true;
            return acc;
        }, {})
    );

    const [isEditing, setIsEditing] = useState(initialIsEditing);
    const [editedPermissions, setEditedPermissions] = useState([]);

    // Sync isEditing with initialIsEditing when isOpen or initialIsEditing changes
    useEffect(() => {
        setIsEditing(initialIsEditing);
    }, [initialIsEditing, isOpen]);

    // Initialize editedPermissions with role permissions when modal opens or role changes
    useEffect(() => {
        if (isOpen && role) {
            setEditedPermissions([...role.permissions]);
        }
    }, [isOpen, role]);

    if (!role) return null;

    const toggleCategory = (category) => {
        setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
    };

    const togglePermission = (permission) => {
        if (!isEditing) return;
        setEditedPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    const startEditing = () => {
        setEditedPermissions([...role.permissions]);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (onCancelEditing) {
            onCancelEditing();
        }
        setEditedPermissions([...role.permissions]);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(editedPermissions, () => {
                setIsEditing(false);
            });
        }
    };

    const header = (
        <div className="role-viewer-header__info">
            <h2 id="permissions-viewer-title">{role.name}</h2>
            <p className="role-viewer-header__desc">{role.description}</p>
            <span className="role-viewer-header__meta">
                {isEditing ? editedPermissions.length : role.permissions.length} Permissions
            </span>
        </div>
    );

    const headerActions = isEditing ? (
        <>
            {onSave && (
                <button
                    type="button"
                    className="role-btn role-btn--primary"
                    onClick={handleSave}
                >
                    Save Changes
                </button>
            )}
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={handleCancel}
            >
                Cancel
            </button>
            {onDeleteRole && (
                <button
                    type="button"
                    className="role-btn role-btn--danger"
                    onClick={onDeleteRole}
                >
                    Delete Role
                </button>
            )}
        </>
    ) : (
        <>
            {onSave && (
                <button
                    type="button"
                    className="role-btn role-btn--primary"
                    onClick={startEditing}
                >
                    Edit Permissions
                </button>
            )}
            {onEditRole && (
                <button
                    type="button"
                    className="role-btn role-btn--ghost"
                    onClick={onEditRole}
                >
                    Edit Role
                </button>
            )}
            {onDeleteRole && (
                <button
                    type="button"
                    className="role-btn role-btn--danger"
                    onClick={onDeleteRole}
                >
                    Delete Role
                </button>
            )}
        </>
    );

    const footer = (
        <button type="button" className="role-btn role-btn--ghost" onClick={onClose}>
            Close
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="permissions-viewer-title"
            header={header}
            headerActions={headerActions}
            footer={footer}
            showClose
        >
            <style>{`
                .role-perm-chip--disabled {
                    background: #f3f4f6 !important;
                    border-color: #cbd5e1 !important;
                    color: #64748b !important;
                    text-decoration: none !important;
                    opacity: 1 !important;
                }
                .role-perm-chip--editable {
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.15s ease;
                }
                .role-perm-chip--editable:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }
                .role-perm-chip--disabled:hover {
                    background: #e2e8f0 !important;
                    color: #475569 !important;
                }
            `}</style>
            {(isEditing ? PERMISSION_CATEGORIES : VIEW_PERMISSION_CATEGORIES).map((category) => {
                const allInCategory = permissionMap[category] || [];
                const enabled = isEditing
                    ? allInCategory
                    : getEnabledInCategory(category, allInCategory, role.permissions);

                const enabledCount = isEditing
                    ? allInCategory.filter((p) => editedPermissions.includes(p)).length
                    : enabled.length;

                return (
                    <Accordion
                        key={category}
                        title={category}
                        isOpen={expanded[category]}
                        onToggle={() => toggleCategory(category)}
                        count={enabledCount}
                    >
                        {!isEditing && enabled.length === 0 ? (
                            <p className="role-perm-empty">No permissions in this category.</p>
                        ) : (
                            <div className="role-perm-chips">
                                {enabled.map((permission) => {
                                    const isPermissionEnabled = isEditing
                                        ? editedPermissions.includes(permission)
                                        : true;

                                    return (
                                        <span
                                            className={`role-perm-chip ${
                                                isEditing ? "role-perm-chip--editable" : ""
                                            } ${
                                                isEditing && !isPermissionEnabled
                                                    ? "role-perm-chip--disabled"
                                                    : ""
                                            }`}
                                            key={permission}
                                            onClick={isEditing ? () => togglePermission(permission) : undefined}
                                            role={isEditing ? "button" : undefined}
                                            tabIndex={isEditing ? 0 : undefined}
                                            onKeyDown={
                                                isEditing
                                                    ? (e) => {
                                                          if (e.key === "Enter" || e.key === " ") {
                                                              e.preventDefault();
                                                              togglePermission(permission);
                                                          }
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {isPermissionEnabled && (
                                                <Check size={14} strokeWidth={2.5} />
                                            )}
                                            {permission}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </Accordion>
                );
            })}
        </Modal>
    );
}

export default PermissionsViewerModal;
