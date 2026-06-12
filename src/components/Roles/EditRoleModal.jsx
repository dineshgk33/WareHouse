import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import "./roles.css";

function EditRoleModal({
    isOpen,
    role,
    isCreate = false,
    onClose,
    onSave,
    onEditPermissions,
    onDeleteRole,
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setTimeout(() => {
            setName(role?.name || "");
            setDescription(role?.description || "");
        }, 0);
    }, [isOpen, role]);

    if (!isOpen) return null;

    const titleId = "edit-role-title";

    const header = (
        <div>
            <h2 id={titleId} className="role-edit-modal-title">
                {isCreate ? "Create Role" : "Edit Role"}
            </h2>
            {!isCreate && role && (
                <p className="role-edit-modal-subtitle">Update role name and description</p>
            )}
        </div>
    );

    const footer = (
        <>
            <button type="button" className="role-btn role-btn--ghost" onClick={onClose}>
                Cancel
            </button>
            <button
                type="button"
                className="role-btn role-btn--primary"
                onClick={() => onSave({ name: name.trim(), description: description.trim() })}
                disabled={!name.trim()}
            >
                {isCreate ? "Create Role" : "Save Changes"}
            </button>
        </>
    );

    const headerActions = !isCreate ? (
        <>
            <button
                type="button"
                className="role-btn role-btn--primary"
                onClick={onEditPermissions}
            >
                Edit Permissions
            </button>
            <button
                type="button"
                className="role-btn role-btn--ghost"
                disabled
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
    ) : null;

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
            <div className="role-form-field">
                <label htmlFor="role-name-input">Role Name</label>
                <input
                    id="role-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Inventory Manager"
                />
            </div>
            <div className="role-form-field">
                <label htmlFor="role-desc-input">Role Description</label>
                <textarea
                    id="role-desc-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this role can do..."
                />
            </div>
        </Modal>
    );
}

export default EditRoleModal;
