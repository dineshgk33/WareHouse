import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import Modal from "./Modal";
import Accordion from "./Accordion";
import {
    buildPermissionMap,
    getEnabledInCategory,
    VIEW_PERMISSION_CATEGORIES,
} from "./rolePermissionsUtils";
import "./roles.css";

function PermissionsViewerModal({
    isOpen,
    role,
    onClose,
    onEditPermissions,
    onEditRole,
    onDeleteRole,
}) {
    const permissionMap = useMemo(
        () => buildPermissionMap(VIEW_PERMISSION_CATEGORIES),
        []
    );

    const [expanded, setExpanded] = useState(() =>
        VIEW_PERMISSION_CATEGORIES.reduce((acc, cat) => {
            acc[cat] = true;
            return acc;
        }, {})
    );

    if (!role) return null;

    const toggleCategory = (category) => {
        setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
    };

    const header = (
        <div className="role-viewer-header__info">
            <h2 id="permissions-viewer-title">{role.name}</h2>
            <p className="role-viewer-header__desc">{role.description}</p>
            <span className="role-viewer-header__meta">
                {role.permissions.length} Permissions
            </span>
        </div>
    );

    const headerActions = (
        <>
            <button
                type="button"
                className="role-btn role-btn--primary"
                onClick={onEditPermissions}
            >
                Edit Permissions
            </button>
            <button type="button" className="role-btn role-btn--ghost" onClick={onEditRole}>
                Edit Role
            </button>
            <button type="button" className="role-btn role-btn--danger" onClick={onDeleteRole}>
                Delete Role
            </button>
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
            {VIEW_PERMISSION_CATEGORIES.map((category) => {
                const allInCategory = permissionMap[category] || [];
                const enabled = getEnabledInCategory(
                    category,
                    allInCategory,
                    role.permissions
                );

                return (
                    <Accordion
                        key={category}
                        title={category}
                        isOpen={expanded[category]}
                        onToggle={() => toggleCategory(category)}
                        count={enabled.length}
                    >
                        {enabled.length === 0 ? (
                            <p className="role-perm-empty">No permissions in this category.</p>
                        ) : (
                            <div className="role-perm-chips">
                                {enabled.map((permission) => (
                                    <span className="role-perm-chip" key={permission}>
                                        <Check size={14} strokeWidth={2.5} />
                                        {permission}
                                    </span>
                                ))}
                            </div>
                        )}
                    </Accordion>
                );
            })}
        </Modal>
    );
}

export default PermissionsViewerModal;
