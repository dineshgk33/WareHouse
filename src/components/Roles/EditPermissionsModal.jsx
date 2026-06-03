import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import Accordion from "./Accordion";
import { buildPermissionMap, PERMISSION_CATEGORIES } from "./rolePermissionsUtils";
import "./roles.css";

function EditPermissionsModal({
    isOpen,
    role,
    permissions,
    onChangePermissions,
    onClose,
    onSave,
    onEditRole,
    onDeleteRole,
}) {
    const permissionMap = useMemo(() => buildPermissionMap(PERMISSION_CATEGORIES), []);

    const [expanded, setExpanded] = useState(() =>
        PERMISSION_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = true;
            return acc;
        }, {})
    );

    useEffect(() => {
        if (!isOpen) return;
        setExpanded(
            PERMISSION_CATEGORIES.reduce((acc, cat) => {
                acc[cat] = true;
                return acc;
            }, {})
        );
    }, [isOpen]);

    if (!role) return null;

    const togglePermission = (permission) => {
        onChangePermissions(
            permissions.includes(permission)
                ? permissions.filter((p) => p !== permission)
                : [...permissions, permission]
        );
    };

    const header = (
        <div>
            <h2 id="edit-permissions-title" className="role-edit-modal-title">
                Edit Permissions
            </h2>
            <p className="role-edit-modal-subtitle">{role.name}</p>
        </div>
    );

    const headerActions = (
        <>
            <button type="button" className="role-btn role-btn--primary" disabled>
                Edit Permissions
            </button>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={onEditRole}
            >
                Edit Role
            </button>
            <button
                type="button"
                className="role-btn role-btn--danger"
                onClick={onDeleteRole}
            >
                Delete Role
            </button>
        </>
    );

    const footer = (
        <>
            <button type="button" className="role-btn role-btn--ghost" onClick={onClose}>
                Cancel
            </button>
            <button type="button" className="role-btn role-btn--primary" onClick={onSave}>
                Save Changes
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="edit-permissions-title"
            header={header}
            headerActions={headerActions}
            footer={footer}
            showClose
        >
            {PERMISSION_CATEGORIES.map((category) => {
                const items = permissionMap[category] || [];
                const enabledCount = items.filter((p) => permissions.includes(p)).length;

                return (
                    <Accordion
                        key={category}
                        title={category}
                        isOpen={expanded[category]}
                        onToggle={() =>
                            setExpanded((prev) => ({ ...prev, [category]: !prev[category] }))
                        }
                        count={enabledCount}
                    >
                        <div className="role-perm-edit-list">
                            {items.map((permission) => (
                                <label className="role-perm-edit-row" key={permission}>
                                    <input
                                        type="checkbox"
                                        checked={permissions.includes(permission)}
                                        onChange={() => togglePermission(permission)}
                                    />
                                    <span>{permission}</span>
                                </label>
                            ))}
                        </div>
                    </Accordion>
                );
            })}
        </Modal>
    );
}

export default EditPermissionsModal;
