import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "./roles.css";

function DeleteRoleModal({
    isOpen,
    role,
    onClose,
    onConfirmDelete,
    onEditPermissions,
    onEditRole,
}) {
    const [confirmName, setConfirmName] = useState("");

    useEffect(() => {
        if (isOpen) setConfirmName("");
    }, [isOpen]);

    if (!role) return null;

    const nameMatches = confirmName.trim() === role.name;
    const titleId = "delete-role-title";

    const header = (
        <div>
            <h2 id={titleId} className="role-edit-modal-title">
                Delete Role
            </h2>
        </div>
    );

    const headerActions = (
        <>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={onEditPermissions}
            >
                Edit Permissions
            </button>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                onClick={onEditRole}
            >
                Edit Role
            </button>
            <button type="button" className="role-btn role-btn--danger" disabled>
                Delete Role
            </button>
        </>
    );

    const footer = (
        <>
            <button type="button" className="role-btn role-btn--ghost" onClick={onClose}>
                Cancel
            </button>
            <button
                type="button"
                className="role-btn role-btn--danger-solid"
                disabled={!nameMatches}
                onClick={onConfirmDelete}
            >
                Delete Role
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy={titleId}
            header={header}
            headerActions={headerActions}
            footer={footer}
            showClose
        >
            <p className="role-delete-role-name">Role Name: {role.name}</p>
            <div className="role-delete-warning">
                <p>
                    Deleting this role will permanently remove all assigned permissions.
                </p>
            </div>
            <div className="role-form-field">
                <label htmlFor="delete-confirm-name">Type role name to confirm</label>
                <input
                    id="delete-confirm-name"
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={role.name}
                    autoComplete="off"
                />
            </div>
        </Modal>
    );
}

export default DeleteRoleModal;
